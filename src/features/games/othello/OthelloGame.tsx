'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { sounds } from '@/lib/sound/soundService';
import { supabase } from '@/lib/supabase/client';
import { UserAvatar } from '@/components/UserAvatar';
import { syncLeaderboardScoreForGame } from '@/features/leaderboard/leaderboardService';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import { InGameSocialPicker } from '@/features/social/InGameSocialPicker';
import { ChatBubble } from '@/features/social/ChatBubble';
import { ActiveSocialMessage, SocialContentType } from '@/features/social/types';
import { Copy, Check, Flag, RotateCcw, Home } from 'lucide-react';
import { OthelloBoard } from './OthelloBoard';
import { applyMove, resolveNextTurn } from './othelloLogic';
import { chooseOthelloBotMove } from './othelloBot';
import {
  acceptOthelloRematch,
  requestOthelloRematch,
  syncOthelloGameState,
} from './othelloRoomService';
import { clearOthelloLocalGame, saveOthelloLocalGame } from './othelloStorage';
import { recordOthelloMatchResult } from './othelloStatsService';
import { OthelloGameState, OthelloRoom, OthelloStone } from './types';

interface OthelloGameProps {
  initialState: OthelloGameState;
  room: OthelloRoom | null;
  userId?: string;
  userName?: string;
  userAvatar?: string;
  onExitToLobby: () => void;
  onStatsUpdated?: () => void;
}

export const OthelloGame: React.FC<OthelloGameProps> = ({
  initialState,
  room: initialRoom,
  userId,
  userName = 'Player',
  userAvatar = '👑',
  onExitToLobby,
  onStatsUpdated,
}) => {
  const { language } = useLanguage();
  const [gameState, setGameState] = useState<OthelloGameState>(initialState);
  const [room, setRoom] = useState<OthelloRoom | null>(initialRoom);
  const [copiedLink, setCopiedLink] = useState(false);
  const [confirmResign, setConfirmResign] = useState(false);
  const [socialBubbles, setSocialBubbles] = useState<
    Record<string, ActiveSocialMessage>
  >({});

  const recordedResultRef = useRef(false);
  const channelRef = useRef<any>(null);

  const isOnline = gameState.mode === 'online' && room !== null;
  const isHost = isOnline && room?.host_id === userId;
  const myColor: OthelloStone = isOnline
    ? isHost
      ? 'black'
      : 'white'
    : gameState.playerColor;

  const isWaitingForGuest = isOnline && room?.status === 'waiting';

  const canHumanMove = (() => {
    if (gameState.isGameOver || isWaitingForGuest) return false;
    if (gameState.mode === 'local') return true;
    if (gameState.mode === 'ai') return gameState.currentTurn === gameState.playerColor;
    return gameState.currentTurn === myColor;
  })();

  // Auto-save offline matches
  useEffect(() => {
    if (gameState.mode !== 'online') {
      if (gameState.isGameOver) {
        clearOthelloLocalGame();
      } else {
        saveOthelloLocalGame(gameState);
      }
    }
  }, [gameState]);

  // Record stats & leaderboard once when game ends
  useEffect(() => {
    if (!gameState.isGameOver || recordedResultRef.current) return;
    recordedResultRef.current = true;

    const { winner, counts, mode } = gameState;
    if (mode === 'local') {
      if (winner === 'draw') sounds.playDraw();
      else sounds.playVictory();
      return;
    }

    const humanColor = mode === 'online' ? myColor : gameState.playerColor;
    const humanPieces = humanColor === 'black' ? counts.black : counts.white;

    let result: 'win' | 'loss' | 'draw' = 'draw';
    if (winner === humanColor) result = 'win';
    else if (winner && winner !== 'draw') result = 'loss';

    if (result === 'win') sounds.playVictory();
    else if (result === 'loss') sounds.playDefeat();
    else sounds.playDraw();

    recordOthelloMatchResult(result, mode === 'ai', humanPieces);
    onStatsUpdated?.();

    if (result === 'win') {
      syncLeaderboardScoreForGame('othello').catch(() => {});
    }
  }, [gameState, myColor, onStatsUpdated]);

  // Bot AI turn
  useEffect(() => {
    if (
      gameState.mode !== 'ai' ||
      gameState.isGameOver ||
      gameState.currentTurn === gameState.playerColor
    ) {
      return;
    }

    const timer = setTimeout(() => {
      const botColor = gameState.currentTurn;
      const move = chooseOthelloBotMove(gameState.board, botColor, gameState.aiDifficulty);
      if (!move) return;

      const applied = applyMove(gameState.board, move.row, move.col, botColor);
      if (!applied) return;

      sounds.playCapture();
      const next = resolveNextTurn(applied.nextBoard, botColor);

      setGameState((prev) => ({
        ...prev,
        board: applied.nextBoard,
        currentTurn: next.nextTurn,
        counts: next.counts,
        validMoves: next.validMoves,
        lastMove: move,
        lastFlipped: applied.flipped,
        passedLastTurn: next.passed,
        isGameOver: next.isGameOver,
        winner: next.winner,
        moveCount: prev.moveCount + 1,
      }));
    }, 520);

    return () => clearTimeout(timer);
  }, [gameState]);

  // Supabase Realtime sync for Online mode
  useEffect(() => {
    if (!isOnline || !room?.id) return;

    const channel = supabase
      .channel(`othello-room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          const updatedRoom = payload.new as OthelloRoom;
          setRoom(updatedRoom);
          if (updatedRoom.game_state) {
            setGameState((prev) => {
              if (prev.moveCount !== updatedRoom.game_state.moveCount) {
                sounds.playCapture();
              }
              if (!updatedRoom.game_state.isGameOver && prev.isGameOver) {
                recordedResultRef.current = false;
              }
              return updatedRoom.game_state;
            });
          }
        }
      )
      .on('broadcast', { event: 'in_game_social' }, ({ payload }) => {
        const msg = payload as { type: SocialContentType; content: string; senderRole?: string };
        const roleKey = msg.senderRole || 'opponent';
        const bubble: ActiveSocialMessage = {
          id: `${Date.now()}-${Math.random()}`,
          target: 'opponent',
          type: msg.type,
          content: msg.content,
          createdAt: Date.now(),
        };
        setSocialBubbles((prev) => ({
          ...prev,
          [roleKey]: bubble,
        }));
        sounds.playSocialPop();
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [isOnline, room?.id]);

  const handleCellClick = async (row: number, col: number) => {
    if (!canHumanMove) return;

    const moveColor = gameState.currentTurn;
    const applied = applyMove(gameState.board, row, col, moveColor);
    if (!applied) return;

    sounds.playCapture();
    const next = resolveNextTurn(applied.nextBoard, moveColor);

    const nextState: OthelloGameState = {
      ...gameState,
      board: applied.nextBoard,
      currentTurn: next.nextTurn,
      counts: next.counts,
      validMoves: next.validMoves,
      lastMove: { row, col },
      lastFlipped: applied.flipped,
      passedLastTurn: next.passed,
      isGameOver: next.isGameOver,
      winner: next.winner,
      moveCount: gameState.moveCount + 1,
    };

    setGameState(nextState);

    if (isOnline && room) {
      try {
        await syncOthelloGameState(
          room.id,
          nextState,
          nextState.isGameOver ? 'completed' : 'in_progress'
        );
      } catch {}
    }
  };

  const handleResign = async () => {
    setConfirmResign(false);
    const loser: OthelloStone =
      gameState.mode === 'online'
        ? myColor
        : gameState.mode === 'ai'
          ? gameState.playerColor
          : gameState.currentTurn;
    const winner: OthelloStone = loser === 'black' ? 'white' : 'black';

    const nextState: OthelloGameState = {
      ...gameState,
      isGameOver: true,
      winner,
      resignedBy: loser,
    };
    setGameState(nextState);

    if (isOnline && room) {
      try {
        await syncOthelloGameState(room.id, nextState, 'completed');
      } catch {}
    }
  };

  const handlePlayAgain = async () => {
    if (isOnline && room && userId) {
      if (gameState.rematchRequest && gameState.rematchRequest.fromId !== userId) {
        recordedResultRef.current = false;
        const fresh = await acceptOthelloRematch(room.id, gameState);
        setGameState(fresh);
      } else {
        await requestOthelloRematch(room.id, userId, userName, gameState);
      }
      return;
    }

    recordedResultRef.current = false;
    clearOthelloLocalGame();
    const fresh = {
      ...initialState,
      mode: gameState.mode,
      aiDifficulty: gameState.aiDifficulty,
      playerColor: gameState.playerColor,
    };
    setGameState(fresh);
  };

  const handleCopyInvite = () => {
    if (!room) return;
    const url = `${window.location.origin}/games/othello?room=${room.code}`;
    navigator.clipboard.writeText(url).catch(() => {});
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendSocial = (type: SocialContentType, content: string) => {
    const roleKey = isHost ? 'black' : 'white';
    const bubble: ActiveSocialMessage = {
      id: `${Date.now()}-${Math.random()}`,
      target: 'me',
      type,
      content,
      createdAt: Date.now(),
    };
    setSocialBubbles((prev) => ({
      ...prev,
      [roleKey]: bubble,
    }));
    sounds.playSocialPop();

    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'in_game_social',
        payload: { type, content, senderRole: roleKey },
      });
    }
  };

  const didHumanWin =
    gameState.isGameOver &&
    gameState.mode !== 'local' &&
    gameState.winner === (isOnline ? myColor : gameState.playerColor);

  return (
    <div className="w-full max-w-xl mx-auto space-y-3 py-2">
      <PixelFxOverlay active={didHumanWin} />

      {/* Online waiting room */}
      {isWaitingForGuest && room && (
        <div className="pixel-box bg-amber-50 border-3 border-zinc-900 p-4 text-center space-y-3 shadow-[4px_4px_0px_#000]">
          <p className="font-pixel text-xs font-bold uppercase text-amber-900">
            {language === 'vi' ? 'ĐANG CHỜ ĐỐI THỦ VÀO PHÒNG' : 'WAITING FOR OPPONENT'}
          </p>
          <div className="font-pixel text-3xl font-black tracking-widest text-zinc-950 bg-white border-2 border-zinc-900 py-2 px-4 inline-block">
            {room.code}
          </div>
          <div className="flex justify-center">
            <button
              type="button"
              onClick={handleCopyInvite}
              className="pixel-btn bg-indigo-600 hover:bg-indigo-500 text-amber-300 px-4 py-2 font-pixel text-xs font-bold flex items-center gap-2"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>
                {copiedLink
                  ? language === 'vi'
                    ? 'ĐÃ SAO CHÉP LINK!'
                    : 'LINK COPIED!'
                  : language === 'vi'
                    ? 'SAO CHÉP LINK MỜI'
                    : 'COPY INVITE LINK'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Score & Player Header */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Black player */}
        <div
          className={`relative pixel-box-sm p-2.5 border-2 border-zinc-900 flex items-center justify-between ${
            !gameState.isGameOver && gameState.currentTurn === 'black'
              ? 'bg-zinc-900 text-white ring-2 ring-amber-400'
              : 'bg-white text-zinc-900'
          }`}
        >
          {socialBubbles.black && Date.now() - socialBubbles.black.createdAt < 3500 && (
            <div className="absolute -top-11 left-2 z-20">
              <ChatBubble message={socialBubbles.black} align="left" />
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            {isOnline ? (
              <UserAvatar avatar={gameState.hostAvatar || '👑'} className="h-7 w-7 text-sm" />
            ) : (
              <span className="w-5 h-5 rounded-full bg-zinc-900 border border-white/70 shrink-0" />
            )}
            <div className="truncate">
              <p className="font-pixel text-xs font-bold truncate">
                {isOnline
                  ? room?.host_name
                  : gameState.mode === 'ai' && gameState.playerColor === 'white'
                    ? 'Bot AI'
                    : language === 'vi'
                      ? 'Quân Đen'
                      : 'Black'}
              </p>
            </div>
          </div>
          <span className="font-pixel text-lg font-black">{gameState.counts.black}</span>
        </div>

        {/* White player */}
        <div
          className={`relative pixel-box-sm p-2.5 border-2 border-zinc-900 flex items-center justify-between ${
            !gameState.isGameOver && gameState.currentTurn === 'white'
              ? 'bg-indigo-600 text-white ring-2 ring-amber-400'
              : 'bg-white text-zinc-900'
          }`}
        >
          {socialBubbles.white && Date.now() - socialBubbles.white.createdAt < 3500 && (
            <div className="absolute -top-11 right-2 z-20">
              <ChatBubble message={socialBubbles.white} align="right" />
            </div>
          )}
          <div className="flex items-center gap-2 min-w-0">
            {isOnline ? (
              <UserAvatar avatar={gameState.guestAvatar || '🦊'} className="h-7 w-7 text-sm" />
            ) : (
              <span className="w-5 h-5 rounded-full bg-white border-2 border-zinc-900 shrink-0" />
            )}
            <div className="truncate">
              <p className="font-pixel text-xs font-bold truncate">
                {isOnline
                  ? room?.guest_name || '...'
                  : gameState.mode === 'ai' && gameState.playerColor === 'black'
                    ? 'Bot AI'
                    : language === 'vi'
                      ? 'Quân Trắng'
                      : 'White'}
              </p>
            </div>
          </div>
          <span className="font-pixel text-lg font-black">{gameState.counts.white}</span>
        </div>
      </div>

      {/* Pass notice */}
      {gameState.passedLastTurn && !gameState.isGameOver && (
        <div className="bg-amber-100 border-2 border-amber-500 px-3 py-1.5 text-center font-pixel text-xs font-bold text-amber-900">
          {language === 'vi'
            ? '⚡ Đối thủ không có nước đi hợp lệ — Tự động chuyển lượt!'
            : '⚡ Opponent has no valid moves — Turn passed automatically!'}
        </div>
      )}

      {/* Board */}
      <OthelloBoard
        board={gameState.board}
        currentTurn={gameState.currentTurn}
        validMoves={gameState.validMoves}
        lastMove={gameState.lastMove}
        lastFlipped={gameState.lastFlipped}
        canInteract={canHumanMove}
        onCellClick={handleCellClick}
      />

      {/* Action bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <button
          type="button"
          onClick={onExitToLobby}
          className="pixel-btn bg-zinc-200 hover:bg-zinc-300 text-zinc-900 px-3 py-2 font-pixel text-xs font-bold flex items-center gap-1.5"
        >
          <Home className="w-4 h-4" />
          <span>{language === 'vi' ? 'Sảnh' : 'Lobby'}</span>
        </button>

        <div className="flex items-center gap-2">
          {isOnline && (
            <InGameSocialPicker onSendMessage={handleSendSocial} />
          )}

          {!gameState.isGameOver && (
            confirmResign ? (
              <div className="flex items-center gap-1.5 bg-rose-50 border-2 border-rose-600 px-2 py-1">
                <span className="font-pixel text-[11px] font-bold text-rose-800">
                  {language === 'vi' ? 'Xin thua?' : 'Resign?'}
                </span>
                <button
                  type="button"
                  onClick={handleResign}
                  className="pixel-btn bg-rose-600 text-white px-2 py-1 font-pixel text-[11px] font-bold"
                >
                  {language === 'vi' ? 'ĐỒNG Ý' : 'YES'}
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmResign(false)}
                  className="pixel-btn bg-zinc-200 text-zinc-800 px-2 py-1 font-pixel text-[11px] font-bold"
                >
                  {language === 'vi' ? 'HỦY' : 'NO'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmResign(true)}
                className="pixel-btn bg-rose-100 hover:bg-rose-200 text-rose-800 px-3 py-2 font-pixel text-xs font-bold flex items-center gap-1.5"
              >
                <Flag className="w-4 h-4" />
                <span>{language === 'vi' ? 'Xin thua' : 'Resign'}</span>
              </button>
            )
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {gameState.isGameOver && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 p-4">
          <div className="pixel-box bg-[#FFFDF8] border-4 border-zinc-900 p-5 w-full max-w-sm text-center space-y-4 shadow-[6px_6px_0px_#000]">
            <h3 className="font-pixel text-2xl font-black uppercase text-zinc-900">
              {gameState.winner === 'draw'
                ? language === 'vi'
                  ? '🤝 HÒA CỜ!'
                  : '🤝 DRAW!'
                : gameState.mode === 'local'
                  ? gameState.winner === 'black'
                    ? language === 'vi'
                      ? '⚫ QUÂN ĐEN THẮNG!'
                      : '⚫ BLACK WINS!'
                    : language === 'vi'
                      ? '⚪ QUÂN TRẮNG THẮNG!'
                      : '⚪ WHITE WINS!'
                  : didHumanWin
                    ? language === 'vi'
                      ? '🏆 BẠN ĐÃ THẮNG!'
                      : '🏆 VICTORY!'
                    : language === 'vi'
                      ? '💀 BẠN ĐÃ THUA!'
                      : '💀 DEFEAT!'}
            </h3>

            <div className="flex items-center justify-center gap-6 py-2 bg-zinc-100 border-2 border-zinc-900">
              <div className="text-center">
                <p className="font-pixel text-xs text-zinc-600">{language === 'vi' ? 'ĐEN' : 'BLACK'}</p>
                <p className="font-pixel text-2xl font-black text-zinc-900">{gameState.counts.black}</p>
              </div>
              <span className="font-pixel text-lg text-zinc-400">vs</span>
              <div className="text-center">
                <p className="font-pixel text-xs text-zinc-600">{language === 'vi' ? 'TRẮNG' : 'WHITE'}</p>
                <p className="font-pixel text-2xl font-black text-indigo-700">{gameState.counts.white}</p>
              </div>
            </div>

            {isOnline && gameState.rematchRequest && (
              <p className="font-pixel text-xs font-bold text-indigo-700">
                {gameState.rematchRequest.fromId === userId
                  ? language === 'vi'
                    ? '⏳ Đã gửi lời mời tái đấu...'
                    : '⏳ Rematch invite sent...'
                  : language === 'vi'
                    ? `⚔️ ${gameState.rematchRequest.fromName} muốn tái đấu!`
                    : `⚔️ ${gameState.rematchRequest.fromName} wants a rematch!`}
              </p>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handlePlayAgain}
                className="pixel-btn flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 font-pixel text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>
                  {isOnline && gameState.rematchRequest && gameState.rematchRequest.fromId !== userId
                    ? language === 'vi'
                      ? 'CHẤP NHẬN TÁI ĐẤU'
                      : 'ACCEPT REMATCH'
                    : language === 'vi'
                      ? 'CHƠI LẠI'
                      : 'PLAY AGAIN'}
                </span>
              </button>
              <button
                type="button"
                onClick={onExitToLobby}
                className="pixel-btn bg-zinc-200 hover:bg-zinc-300 text-zinc-900 px-4 py-2.5 font-pixel text-xs font-bold"
              >
                {language === 'vi' ? 'SẢNH' : 'LOBBY'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
