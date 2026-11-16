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
import { recordCaroGameResult } from './caroStatsService';
import { soundService, sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import { ChatBubble } from '@/features/social/ChatBubble';
import { ActiveSocialMessage, SocialContentType } from '@/features/social/types';
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

  // In-Game Social Chat & Reactions State
  const [activeSocialMessages, setActiveSocialMessages] = useState<ActiveSocialMessage[]>([]);
  const channelRef = useRef<any>(null);

  const handleIncomingSocial = useCallback(
    (type: SocialContentType, content: string, target: 'me' | 'opponent') => {
      sounds.playSocialPop();
      const id = `${Date.now()}_${Math.random()}`;
      setActiveSocialMessages((prev) => [...prev, { id, type, content, target, createdAt: Date.now() }]);
      setTimeout(() => {
        setActiveSocialMessages((prev) => prev.filter((r) => r.id !== id));
      }, 3500);
    },
    []
  );

  const handleSendSocial = useCallback(
    (type: SocialContentType, content: string) => {
      handleIncomingSocial(type, content, 'me');

      if (!isBotGame && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'in_game_social',
          payload: {
            from: currentUserId,
            type,
            content,
          },
        });
      }

      // If playing with Bot, bot playfully replies with subtle probability
      if (isBotGame) {
        if (Math.random() < 0.45) {
          setTimeout(() => {
            if (type === 'chat') {
              const botChatReplies = [
                '🔥 Nước cờ hay đấy!',
                '🤔 Đang tính toán một chút...',
                '⚔️ Đấu Caro thì mình không ngại đâu!',
                '👑 Tuyệt vời! Cảm ơn!',
                '☕ Nước cờ hiểm thật!',
              ];
              const randomReply = botChatReplies[Math.floor(Math.random() * botChatReplies.length)];
              handleIncomingSocial('chat', randomReply, 'opponent');
            } else {
              const botReplies = ['👍', '🔥', '🤔', '👏', '😎'];
              const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
              handleIncomingSocial('emote', randomReply, 'opponent');
            }
          }, 900);
        }
      }
    },
    [currentUserId, isBotGame, handleIncomingSocial]
  );

  const isMyTurn =
    !gameState.isGameOver &&
    (isLocalGame
      ? true
      : isBotGame
      ? gameState.turn === myPiece
      : gameState.turn === myPiece);

  const isHumanWinner =
    isLocalGame
      ? gameState.winner !== 'draw'
      : gameState.winner === myPiece;

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
      .on('broadcast', { event: 'in_game_social' }, ({ payload }) => {
        if (payload && payload.from !== currentUserId && payload.content) {
          handleIncomingSocial(payload.type || 'emote', payload.content, 'opponent');
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channelRef.current = null;
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
        if (!isLocalGame) {
          recordCaroGameResult(myPiece === winResult.winner ? 'win' : 'loss', isBotGame);
        }
      } else if (boardFull) {
        soundService.playDraw();
        if (!isLocalGame) {
          recordCaroGameResult('draw', isBotGame);
        }
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
          recordCaroGameResult('loss', true);
        } else if (boardFull) {
          soundService.playDraw();
          recordCaroGameResult('draw', true);
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
    if (!isLocalGame) {
      recordCaroGameResult('loss', isBotGame);
    }

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
      <div className="mx-auto max-w-md px-4 py-8 text-center animate-in fade-in duration-150">
        <div className="pixel-box-lg bg-[#FFFDF8] p-6 sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center bg-indigo-600 text-amber-300 border-2 border-zinc-900 shadow-pixel-sm mb-4 animate-pulse">
            <Users className="h-8 w-8" />
          </div>

          <h2 className="font-pixel text-xl sm:text-2xl font-bold text-zinc-950 uppercase mb-1">
            {language === 'vi' ? 'ĐANG CHỜ ĐỐI THỦ...' : 'WAITING FOR CHALLENGER...'}
          </h2>
          <p className="text-xs sm:text-sm font-mono text-zinc-600 mb-6">
            {language === 'vi'
              ? 'Chia sẻ mã phòng hoặc đường link này để bạn bè tham gia ván cờ.'
              : 'Share this code or link with a friend to start the match.'}
          </p>

          <div className="mb-6 bg-[#ECE8DD] border-2 border-zinc-900 p-4 shadow-pixel-inset">
            <span className="font-pixel text-xs font-bold uppercase tracking-wider text-zinc-600 block mb-1">
              {language === 'vi' ? 'MÃ PHÒNG THI ĐẤU' : 'ROOM CODE'}
            </span>
            <div className="font-pixel text-3xl sm:text-4xl font-bold tracking-widest text-indigo-700">
              {room.code}
            </div>
          </div>

          <div className="flex flex-col gap-2.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="pixel-btn min-h-[46px] w-full flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2 text-sm font-bold text-amber-300 hover:bg-indigo-500"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? (language === 'vi' ? 'ĐÃ SAO CHÉP LIÊN KẾT!' : 'COPIED LINK!') : (language === 'vi' ? 'SAO CHÉP LIÊN KẾT MỜI' : 'COPY INVITE LINK')}</span>
            </button>

            <button
              type="button"
              onClick={handleLeave}
              className="pixel-btn min-h-[44px] w-full flex items-center justify-center gap-1.5 bg-white px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
            >
              <Home className="h-4 w-4 text-zinc-700" />
              <span>{language === 'vi' ? 'HỦY PHÒNG & VỀ SẢNH' : 'CANCEL & EXIT'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE MATCH GAMEPLAY
  return (
    <div className="mx-auto flex flex-col items-center gap-4 sm:gap-5 py-2 sm:py-4 px-2 w-full max-w-2xl">
      {/* Player Header Card */}
      <div className="relative pixel-box w-full max-w-lg flex items-center justify-between bg-[#FFFDF8] px-3 py-2.5">
        {/* Floating Social Speech Bubbles (Below card pointing up) */}
        <div className="absolute top-full mt-2 left-3 sm:left-4 flex flex-col items-start gap-1 pointer-events-none z-40">
          {activeSocialMessages
            .filter((m) => m.target === (isHost ? 'me' : 'opponent'))
            .map((m) => (
              <ChatBubble key={m.id} message={m} align="left" placement="bottom" />
            ))}
        </div>
        <div className="absolute top-full mt-2 right-3 sm:right-4 flex flex-col items-end gap-1 pointer-events-none z-40">
          {activeSocialMessages
            .filter((m) => m.target === (isHost ? 'opponent' : 'me'))
            .map((m) => (
              <ChatBubble key={m.id} message={m} align="right" placement="bottom" />
            ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center bg-rose-100 text-rose-600 font-pixel font-bold text-sm border-2 border-zinc-900 shadow-pixel-xs">
            X
          </div>
          <div className="flex flex-col">
            <span className="font-pixel text-xs sm:text-sm font-bold text-zinc-950 leading-tight">
              {room.host_name}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
              {isHost && isOnline ? 'BẠN (P1)' : 'P1'}
            </span>
          </div>
        </div>

        <div className="pixel-badge bg-amber-300 px-2.5 py-0.5 text-[11px] font-bold text-zinc-950">
          <span>VS</span>
        </div>

        <div className="flex items-center gap-2.5 flex-row-reverse text-right">
          <div className="flex h-9 w-9 items-center justify-center bg-indigo-100 text-indigo-700 font-pixel font-bold text-sm border-2 border-zinc-900 shadow-pixel-xs">
            O
          </div>
          <div className="flex flex-col">
            <span className="font-pixel text-xs sm:text-sm font-bold text-zinc-950 leading-tight">
              {room.guest_name || (isBotGame ? 'Bot AI' : 'Người chơi 2')}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
              {!isHost && isOnline ? 'BẠN (P2)' : isBotGame ? 'CPU' : 'P2'}
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
        onSendMessage={handleSendSocial}
      />

      {/* GAME OVER MODAL */}
      {showGameOverModal && gameState.isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-150 overflow-hidden">
          {/* Pixel Art Confetti Burst on Victory - CHỈ BẮN KHI THẮNG */}
          {isHumanWinner && gameState.winner !== 'draw' && (
            <PixelFxOverlay active={true} />
          )}

          <div className="pixel-box-lg relative w-full max-w-sm bg-[#FFFDF8] p-6 text-center animate-in zoom-in-95 duration-150 z-10">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center border-2 border-zinc-900 shadow-pixel-sm mb-3 ${
                isHumanWinner && gameState.winner !== 'draw'
                  ? 'bg-amber-300 text-zinc-950 animate-bounce'
                  : 'bg-zinc-200 text-zinc-700'
              }`}
            >
              <Trophy className="h-8 w-8" />
            </div>

            <h3 className="font-pixel text-xl sm:text-2xl font-bold text-zinc-950 uppercase mb-1">
              {gameState.winner === 'draw'
                ? 'HÒA CỜ! (DRAW)'
                : isLocalGame
                ? (gameState.isResigned ? `P.${gameState.winner} THẮNG! (ĐỐI THỦ XIN THUA)` : `NGƯỜI CHƠI ${gameState.winner} THẮNG!`)
                : isHumanWinner
                ? (gameState.isResigned ? 'YOU WIN! (ĐỐI THỦ XIN THUA)' : 'STAGE CLEAR! BẠN THẮNG! 👑')
                : 'GAME OVER! BẠN ĐÃ THUA!'}
            </h3>

            <p className="text-xs sm:text-sm font-mono text-zinc-600 mb-6">
              {gameState.winner === 'draw'
                ? 'Bàn cờ đã kín ô mà không có bên nào tạo được 5 quân liên tiếp.'
                : `Hoàn tất ván đấu sau ${gameState.history.length} nước đi.`}
            </p>

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={handleRematch}
                disabled={rematchRequestedByMe}
                className="pixel-btn min-h-[46px] w-full flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2.5 text-sm font-bold text-amber-300 hover:bg-indigo-500 disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" />
                <span>
                  {rematchRequestedByMe
                    ? 'ĐANG CHỜ ĐỐI THỦ ĐỒNG Ý...'
                    : rematchOfferedByOpponent
                    ? 'ĐỒNG Ý ĐẤU VÁN MỚI!'
                    : 'ĐẤU LẠI VÁN MỚI'}
                </span>
              </button>

              <button
                type="button"
                onClick={handleLeave}
                className="pixel-btn min-h-[44px] w-full flex items-center justify-center gap-1.5 bg-white px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
              >
                <Home className="h-4 w-4 text-zinc-700" />
                <span>VỀ SẢNH TRÒ CHƠI</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

