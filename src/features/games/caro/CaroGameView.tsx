'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import { CaroRoom, CaroGameState, CaroPiece, CaroMove } from './types';
import { CaroBoard } from './CaroBoard';
import { CaroControls } from './CaroControls';
import {
  isValidMove,
  placePiece,
  checkWin,
  isBoardFull,
  createEmptyBoard,
} from './caroLogic';
import { findBestMove } from './ai/caroBot';
import {
  updateCaroGameState,
  leaveCaroRoom,
  startCaroRematch,
  startBotCaroRematch,
} from './caroRoomService';
import { soundService } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Copy,
  Check,
  Users,
  Trophy,
  RotateCcw,
  Home,
  Sparkles,
  Bot,
  Zap,
} from 'lucide-react';

interface CaroGameViewProps {
  initialRoom: CaroRoom;
  currentUserId: string;
  onExitRoom: () => void;
}

export function CaroGameView({
  initialRoom,
  currentUserId,
  onExitRoom,
}: CaroGameViewProps) {
  const { language } = useLanguage();
  const [room, setRoom] = useState<CaroRoom>(initialRoom);
  const [copied, setCopied] = useState(false);
  const [rematchRequestedByMe, setRematchRequestedByMe] = useState(false);
  const [rematchOfferedByOpponent, setRematchOfferedByOpponent] = useState(false);
  const [showGameOverModal, setShowGameOverModal] = useState(false);
  const [isBotThinking, setIsBotThinking] = useState(false);

  const gameState = room.game_state;
  const isOnline = gameState.gameMode === 'pvp';
  const isBotGame = gameState.gameMode === 'bot';
  const isLocalGame = gameState.gameMode === 'local';

  // Determine player's piece in online/bot game
  const isHost = room.host_id === currentUserId;
  const myPiece: CaroPiece = isLocalGame
    ? gameState.turn
    : isBotGame
    ? gameState.botPlayer === 'X'
      ? 'O'
      : 'X'
    : isHost
    ? 'X'
    : 'O';

  const isMyTurn =
    !gameState.isGameOver &&
    (isLocalGame
      ? true
      : isBotGame
      ? gameState.turn === myPiece
      : gameState.turn === myPiece);

  // Sync state when game ends
  useEffect(() => {
    if (gameState.isGameOver) {
      setShowGameOverModal(true);
    }
  }, [gameState.isGameOver]);

  // Online Realtime Supabase Channel
  useEffect(() => {
    if (!isOnline) return;

    const channelName = `caro_room:${room.id}`;

    // Clean up any stale instances
    if ((supabase as any).realtime?.channels) {
      (supabase as any).realtime.channels = (supabase as any).realtime.channels.filter(
        (ch: any) => ch.topic !== channelName
      );
    }

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: currentUserId },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.new) {
            const updated = payload.new as CaroRoom;
            setRoom(updated);
            if (updated.status === 'abandoned' || updated.game_state?.winner) {
              soundService.playVictory();
            }
          }
        }
      )
      .on('broadcast', { event: 'caro_state' }, ({ payload }) => {
        if (payload) {
          const updated = payload as CaroRoom;
          setRoom(updated);
          if (updated.game_state.winner) {
            soundService.playVictory();
          } else if (updated.game_state.lastMove) {
            soundService.playMove();
          }
        }
      })
      .on('broadcast', { event: 'rematch_offer' }, ({ payload }) => {
        if (payload && payload.from !== currentUserId) {
          setRematchOfferedByOpponent(true);
          soundService.playMove();
        }
      })
      .on('broadcast', { event: 'rematch_accepted' }, ({ payload }) => {
        if (payload) {
          const updated = payload as CaroRoom;
          setRoom(updated);
          setShowGameOverModal(false);
          setRematchRequestedByMe(false);
          setRematchOfferedByOpponent(false);
          soundService.playVictory();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline, room.id, currentUserId]);

  // Handle cell click (Player move)
  const handleCellClick = useCallback(
    async (row: number, col: number) => {
      if (gameState.isGameOver) return;
      if (!isMyTurn) return;
      if (isBotThinking) return;
      if (!isValidMove(gameState.board, row, col)) return;

      const pieceToPlace: CaroPiece = gameState.turn;
      const newBoard = placePiece(gameState.board, row, col, pieceToPlace);
      const newMove: CaroMove = {
        row,
        col,
        player: pieceToPlace,
        timestamp: Date.now(),
      };
      const newHistory = [...gameState.history, newMove];

      // Check win condition
      const winResult = checkWin(newBoard, row, col);
      const boardFull = !winResult && isBoardFull(newBoard);

      const nextTurn: CaroPiece = pieceToPlace === 'X' ? 'O' : 'X';

      const nextState: CaroGameState = {
        ...gameState,
        board: newBoard,
        turn: nextTurn,
        history: newHistory,
        lastMove: { row, col },
        winner: winResult ? winResult.winner : boardFull ? 'draw' : null,
        winningLine: winResult ? winResult.winningLine : null,
        isGameOver: !!winResult || boardFull,
      };

      const updatedRoom: CaroRoom = {
        ...room,
        game_state: nextState,
        status: nextState.isGameOver ? 'completed' : 'in_progress',
        updated_at: new Date().toISOString(),
      };

      setRoom(updatedRoom);

      // Sound effect
      if (winResult) {
        soundService.playVictory();
      } else if (boardFull) {
        soundService.playDraw();
      } else {
        soundService.playMove();
      }

      // Sync online if in PvP mode
      if (isOnline) {
        try {
          const channel = supabase.channel(`caro_room:${room.id}`);
          channel.send({
            type: 'broadcast',
            event: 'caro_state',
            payload: updatedRoom,
          });
          await updateCaroGameState(
            room.id,
            nextState,
            nextState.isGameOver ? 'completed' : 'in_progress'
          );
        } catch (err) {
          console.error('Failed to sync online move:', err);
        }
      }
    },
    [gameState, isMyTurn, isBotThinking, room, isOnline]
  );

  // Bot Turn Automation
  useEffect(() => {
    if (!isBotGame) return;
    if (gameState.isGameOver) return;
    if (gameState.turn !== gameState.botPlayer) return;

    setIsBotThinking(true);

    const timer = setTimeout(() => {
      const bestMove = findBestMove(
        gameState.board,
        gameState.botPlayer!,
        gameState.botDifficulty || 'medium'
      );

      if (bestMove) {
        const { row, col } = bestMove;
        const pieceToPlace = gameState.botPlayer!;
        const newBoard = placePiece(gameState.board, row, col, pieceToPlace);
        const newMove: CaroMove = {
          row,
          col,
          player: pieceToPlace,
          timestamp: Date.now(),
        };
        const newHistory = [...gameState.history, newMove];

        const winResult = checkWin(newBoard, row, col);
        const boardFull = !winResult && isBoardFull(newBoard);
        const nextTurn: CaroPiece = pieceToPlace === 'X' ? 'O' : 'X';

        const nextState: CaroGameState = {
          ...gameState,
          board: newBoard,
          turn: nextTurn,
          history: newHistory,
          lastMove: { row, col },
          winner: winResult ? winResult.winner : boardFull ? 'draw' : null,
          winningLine: winResult ? winResult.winningLine : null,
          isGameOver: !!winResult || boardFull,
        };

        setRoom((prev) => ({
          ...prev,
          game_state: nextState,
          status: nextState.isGameOver ? 'completed' : 'in_progress',
        }));

        if (winResult) {
          soundService.playDefeat();
        } else if (boardFull) {
          soundService.playDraw();
        } else {
          soundService.playMove();
        }
      }

      setIsBotThinking(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [
    isBotGame,
    gameState.turn,
    gameState.botPlayer,
    gameState.isGameOver,
    gameState.board,
    gameState.botDifficulty,
  ]);

  // Copy room link
  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/games/caro?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Resign match
  const handleResign = async () => {
    if (gameState.isGameOver) return;

    const resigningPiece = myPiece;
    const winnerPiece: CaroPiece = resigningPiece === 'X' ? 'O' : 'X';

    const nextState: CaroGameState = {
      ...gameState,
      winner: winnerPiece,
      isGameOver: true,
      isResigned: true,
    };

    const updatedRoom: CaroRoom = {
      ...room,
      game_state: nextState,
      status: 'completed',
    };

    setRoom(updatedRoom);
    soundService.playDefeat();

    if (isOnline) {
      try {
        const channel = supabase.channel(`caro_room:${room.id}`);
        channel.send({
          type: 'broadcast',
          event: 'caro_state',
          payload: updatedRoom,
        });
        await updateCaroGameState(room.id, nextState, 'completed');
      } catch (err) {
        console.error('Failed to resign online:', err);
      }
    }
  };

  // Reset match (Local / Bot)
  const handleReset = () => {
    const resetState: CaroGameState = {
      ...gameState,
      board: createEmptyBoard(),
      turn: 'X',
      history: [],
      winner: null,
      winningLine: null,
      isGameOver: false,
      lastMove: null,
      isResigned: false,
    };

    setRoom((prev) => ({
      ...prev,
      game_state: resetState,
      status: 'in_progress',
    }));
    setShowGameOverModal(false);
  };

  // Leave match
  const handleLeave = async () => {
    if (isOnline) {
      try {
        await leaveCaroRoom(room.id);
      } catch (err) {
        console.error('Error leaving caro room:', err);
      }
    }
    onExitRoom();
  };

  // Rematch request
  const handleRematch = async () => {
    if (isBotGame) {
      const newBotRoom = startBotCaroRematch(room);
      setRoom(newBotRoom);
      setShowGameOverModal(false);
      return;
    }

    if (isLocalGame) {
      handleReset();
      return;
    }

    // Online PvP Rematch
    if (rematchOfferedByOpponent) {
      try {
        const newRoom = await startCaroRematch(
          room.id,
          room.host_id,
          room.guest_id || '',
          room.host_name,
          room.guest_name || '',
          room.game_state.hostAvatar,
          room.game_state.guestAvatar
        );

        const channel = supabase.channel(`caro_room:${room.id}`);
        channel.send({
          type: 'broadcast',
          event: 'rematch_accepted',
          payload: newRoom,
        });

        setRoom(newRoom);
        setShowGameOverModal(false);
        setRematchRequestedByMe(false);
        setRematchOfferedByOpponent(false);
      } catch (err) {
        console.error('Failed to accept rematch:', err);
      }
    } else {
      setRematchRequestedByMe(true);
      const channel = supabase.channel(`caro_room:${room.id}`);
      channel.send({
        type: 'broadcast',
        event: 'rematch_offer',
        payload: { from: currentUserId },
      });
    }
  };

  // WAITING ROOM VIEW (Online room waiting for guest)
  if (isOnline && room.status === 'waiting') {
    return (
      <div className="mx-auto max-w-md px-4 py-8 text-center animate-in fade-in duration-200">
        <div className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-gray-200/90">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-4 animate-pulse">
            <Users className="h-8 w-8" />
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">
            {language === 'vi' ? 'Đang chờ đối thủ...' : 'Waiting for Opponent...'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mb-6">
            {language === 'vi'
              ? 'Chia sẻ mã phòng hoặc đường link này để bạn bè tham gia ván cờ.'
              : 'Share this code or link with a friend to start the match.'}
          </p>

          <div className="mb-6 rounded-2xl bg-gray-50 border border-gray-200/80 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">
              {language === 'vi' ? 'Mã phòng thi đấu' : 'Room Code'}
            </span>
            <div className="font-mono text-3xl sm:text-4xl font-black tracking-widest text-indigo-600">
              {room.code}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="min-h-[46px] w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-98 transition-all"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? (language === 'vi' ? 'Đã sao chép liên kết!' : 'Copied link!') : (language === 'vi' ? 'Sao chép liên kết mời' : 'Copy invite link')}</span>
            </button>

            <button
              type="button"
              onClick={handleLeave}
              className="min-h-[44px] w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-98 transition-all"
            >
              <Home className="h-4 w-4 text-gray-500" />
              <span>{language === 'vi' ? 'Hủy phòng & Về sảnh' : 'Cancel & Exit'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE MATCH GAMEPLAY
  return (
    <div className="mx-auto flex flex-col items-center gap-4 sm:gap-6 py-2 sm:py-4 px-2 w-full max-w-2xl">
      {/* Player Header Card */}
      <div className="w-full max-w-lg flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 font-black text-sm border border-rose-200 shadow-2xs">
            ✕
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
              {room.host_name}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">
              {isHost && isOnline ? 'Bạn' : 'Người chơi 1'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 border border-gray-200 text-[11px] font-black text-gray-600 shadow-2xs">
          <span>VS</span>
        </div>

        <div className="flex items-center gap-2 flex-row-reverse text-right">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 font-black text-sm border border-indigo-200 shadow-2xs">
            ◯
          </div>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-black text-gray-900 leading-tight">
              {room.guest_name || (isBotGame ? 'Bot AI' : 'Người chơi 2')}
            </span>
            <span className="text-[10px] text-gray-500 font-semibold">
              {!isHost && isOnline ? 'Bạn' : isBotGame ? 'Bot' : 'Người chơi 2'}
            </span>
          </div>
        </div>
      </div>

      {/* 15x15 Caro Board */}
      <div className="w-full flex justify-center">
        <CaroBoard
          board={gameState.board}
          lastMove={gameState.lastMove}
          winningLine={gameState.winningLine}
          disabled={!isMyTurn || gameState.isGameOver || isBotThinking}
          onCellClick={handleCellClick}
        />
      </div>

      {/* Game Controls & Turn Bar */}
      <CaroControls
        currentTurn={gameState.turn}
        myPiece={isLocalGame ? undefined : myPiece}
        isMyTurn={isMyTurn}
        gameMode={gameState.gameMode}
        moveCount={gameState.history.length}
        isGameOver={gameState.isGameOver}
        onReset={handleReset}
        onResign={handleResign}
        onLeave={handleLeave}
        hostName={room.host_name}
        guestName={room.guest_name || 'Người chơi 2'}
        isHost={isHost}
      />

      {/* GAME OVER MODAL */}
      {showGameOverModal && gameState.isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-500 mb-3 animate-bounce">
              <Trophy className="h-8 w-8" />
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-1">
              {gameState.winner === 'draw'
                ? 'Hòa cờ!'
                : gameState.isResigned
                ? `Thắng cờ! (Đối thủ xin thua)`
                : `Người chơi ${gameState.winner} Thắng!`}
            </h3>

            <p className="text-xs sm:text-sm text-gray-500 mb-6">
              {gameState.winner === 'draw'
                ? 'Bàn cờ đã kín ô mà không có bên nào tạo được 5 quân liên tiếp.'
                : `Hoàn tất với 5 quân thẳng hàng sau ${gameState.history.length} nước đi.`}
            </p>

            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleRematch}
                disabled={rematchRequestedByMe}
                className="min-h-[46px] w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 hover:from-indigo-700 hover:to-purple-700 active:scale-98 transition-all disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" />
                <span>
                  {rematchRequestedByMe
                    ? 'Đang chờ đối thủ đồng ý...'
                    : rematchOfferedByOpponent
                    ? 'Đồng ý đấu ván mới!'
                    : 'Đấu lại ván mới'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLeave}
                className="min-h-[44px] w-full flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-98 transition-all"
              >
                <Home className="h-4 w-4 text-gray-500" />
                <span>Về sảnh trò chơi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

