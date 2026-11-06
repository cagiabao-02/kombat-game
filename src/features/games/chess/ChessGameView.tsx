'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { ChessRoom, ChessGameState, PlayerColor, RoomStatus } from './types';
import { updateChessGameState, leaveChessRoom } from './roomService';
import { ChessBoard } from './ChessBoard';
import { sounds } from '@/lib/sound/soundService';
import { Copy, Check, Users, Flag, LogOut, Sparkles, AlertCircle } from 'lucide-react';

interface ChessGameViewProps {
  initialRoom: ChessRoom;
  currentUserId: string;
  onExitRoom: () => void;
}

export function ChessGameView({
  initialRoom,
  currentUserId,
  onExitRoom,
}: ChessGameViewProps) {
  const { t, language } = useLanguage();
  const [room, setRoom] = useState<ChessRoom>(initialRoom);
  const [copied, setCopied] = useState(false);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const channelRef = useRef<any>(null);

  const isHost = room.host_id === currentUserId;
  const myColor: PlayerColor = isHost ? 'white' : 'black';
  const myTurnChar = myColor === 'white' ? 'w' : 'b';
  const isMyTurn = room.status === 'in_progress' && room.game_state.turn === myTurnChar;

  // Supabase Realtime: Postgres Changes + Instant Peer-to-Peer Broadcast
  useEffect(() => {
    const channelName = `chess_room_${room.id}`;
    const channel = supabase
      .channel(channelName, {
        config: { broadcast: { self: false } },
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
            setRoom(payload.new as ChessRoom);
          }
        }
      )
      .on('broadcast', { event: 'room_state' }, ({ payload }) => {
        if (payload) {
          const updated = payload as ChessRoom;
          setRoom(updated);
          // Play sound for opponent move
          if (updated.game_state.isCheckmate || updated.game_state.winner) {
            sounds.playVictory();
          } else if (updated.game_state.isCheck) {
            sounds.playCheck();
          } else if (updated.game_state.lastMove) {
            sounds.playMove();
          }
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [room.id]);

  // Fallback Polling (mỗi 1.5s khi đang chờ đối thủ, và 3s trong trận) để đảm bảo không bị lỡ sự kiện
  useEffect(() => {
    if (room.status === 'completed' || room.status === 'abandoned') return;

    const intervalTime = room.status === 'waiting' ? 1500 : 3000;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', room.id)
          .single();

        if (data) {
          // If room state updated on server
          setRoom((prev) => {
            if (
              prev.status !== data.status ||
              prev.guest_id !== data.guest_id ||
              prev.game_state.fen !== data.game_state.fen ||
              prev.game_state.winner !== data.game_state.winner
            ) {
              return data as ChessRoom;
            }
            return prev;
          });
        }
      } catch (err) {
        // Ignore polling error
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [room.id, room.status]);

  // Handle player making a move on the board
  const handleMakeMove = useCallback(
    async (moveData: { from: string; to: string; promotion?: string }) => {
      if (!isMyTurn || isSubmittingMove || room.status !== 'in_progress') return;

      try {
        setIsSubmittingMove(true);
        const chess = new Chess(room.game_state.fen);

        const moveResult = chess.move({
          from: moveData.from,
          to: moveData.to,
          promotion: moveData.promotion || 'q',
        }) as Move | null;

        if (!moveResult) {
          setIsSubmittingMove(false);
          return;
        }

        const isCheckmate = chess.isCheckmate();
        const isDraw = chess.isDraw();
        const isCheck = chess.inCheck();
        const isCaptured = moveResult.captured;

        // Play tactile local sound
        if (isCheckmate) {
          sounds.playVictory();
        } else if (isCheck) {
          sounds.playCheck();
        } else if (isCaptured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        let winner: 'white' | 'black' | 'draw' | null = null;
        let newStatus: RoomStatus = room.status;

        if (isCheckmate) {
          winner = myColor;
          newStatus = 'completed';
        } else if (isDraw) {
          winner = 'draw';
          newStatus = 'completed';
        }

        const newGameState: ChessGameState = {
          fen: chess.fen(),
          history: [...room.game_state.history, moveResult.san],
          turn: chess.turn() as 'w' | 'b',
          isCheck,
          isCheckmate,
          isDraw,
          winner,
          lastMove: { from: moveData.from, to: moveData.to },
        };

        const updatedRoom: ChessRoom = {
          ...room,
          game_state: newGameState,
          status: newStatus,
        };

        // Optimistically update local state for instant feedback
        setRoom(updatedRoom);

        // Broadcast to opponent via Realtime
        if (channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'room_state',
            payload: updatedRoom,
          });
        }

        // Persist to Supabase Database
        await updateChessGameState(room.id, newGameState, newStatus);
      } catch (err) {
        console.error('Failed to make move:', err);
      } finally {
        setIsSubmittingMove(false);
      }
    },
    [isMyTurn, isSubmittingMove, room, myColor]
  );

  // Copy room link
  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/games/chess?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Resign match
  const handleResign = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đầu hàng ván đấu này không?')) {
      const winner = myColor === 'white' ? 'black' : 'white';
      const newGameState: ChessGameState = {
        ...room.game_state,
        winner,
      };
      const updatedRoom: ChessRoom = {
        ...room,
        game_state: newGameState,
        status: 'completed',
      };
      setRoom(updatedRoom);

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'room_state',
          payload: updatedRoom,
        });
      }

      await updateChessGameState(room.id, newGameState, 'completed');
    }
  };

  // Leave room
  const handleLeave = async () => {
    if (window.confirm('Bạn có chắc muốn rời khỏi phòng chơi?')) {
      await leaveChessRoom(room.id, currentUserId, isHost);
      onExitRoom();
    }
  };

  const opponentName = isHost
    ? room.guest_name || t.chess.waitingOpponent
    : room.host_name;
  const opponentColor = myColor === 'white' ? 'black' : 'white';

  return (
    <div className="mx-auto max-w-xl pb-10">
      {/* Waiting Lobby Overlay if waiting for 2nd player */}
      {room.status === 'waiting' && (
        <div className="mb-6 rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 text-center shadow-lg animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4 animate-pulse">
            <Users className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
            {t.chess.waitingOpponent}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
            {t.chess.waitingDesc}
          </p>

          {/* Room Code Banner */}
          <div className="my-6 inline-flex flex-col items-center justify-center rounded-2xl bg-gray-50 border border-gray-200 px-6 py-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t.chess.roomCode}
            </span>
            <span className="mt-1 font-mono text-3xl font-black tracking-widest text-indigo-700">
              {room.code}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? t.common.copied : t.chess.copyLink}</span>
            </button>

            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.chess.leaveRoom}</span>
            </button>
          </div>
        </div>
      )}

      {/* Opponent Profile Bar */}
      <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3 mb-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm ${
              opponentColor === 'white'
                ? 'bg-gray-100 text-gray-800 border border-gray-300'
                : 'bg-gray-900 text-white'
            }`}
          >
            {opponentColor === 'white' ? '♔' : '♚'}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[140px] sm:max-w-[200px]">
              {opponentName}
            </p>
            <span className="text-[10px] text-gray-400 font-medium">
              {opponentColor === 'white' ? t.chess.white : t.chess.black}
            </span>
          </div>
        </div>

        {/* Opponent turn indicator */}
        {room.status === 'in_progress' && (
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              !isMyTurn
                ? 'bg-amber-100 text-amber-800 animate-pulse'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {!isMyTurn ? t.chess.opponentTurn : ''}
          </span>
        )}
      </div>

      {/* Main Chess Board */}
      <ChessBoard
        fen={room.game_state.fen}
        playerColor={myColor}
        isMyTurn={isMyTurn}
        lastMove={room.game_state.lastMove}
        isCheck={room.game_state.isCheck}
        onMakeMove={handleMakeMove}
        disabled={room.status !== 'in_progress'}
      />

      {/* Player Profile & Controls Bar */}
      <div className="mt-3 flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm ${
              myColor === 'white'
                ? 'bg-gray-100 text-gray-800 border border-gray-300'
                : 'bg-gray-900 text-white'
            }`}
          >
            {myColor === 'white' ? '♔' : '♚'}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-indigo-700 truncate max-w-[140px] sm:max-w-[200px]">
              {isHost ? room.host_name : room.guest_name} ({language === 'vi' ? 'Bạn' : 'You'})
            </p>
            <span className="text-[10px] text-gray-400 font-medium">
              {myColor === 'white' ? t.chess.white : t.chess.black}
            </span>
          </div>
        </div>

        {/* Player turn indicator & Actions */}
        <div className="flex items-center gap-2">
          {room.status === 'in_progress' && (
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                isMyTurn
                  ? 'bg-emerald-100 text-emerald-800 animate-pulse'
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              {isMyTurn ? t.chess.yourTurn : ''}
            </span>
          )}

          {room.status === 'in_progress' && (
            <button
              type="button"
              onClick={handleResign}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title={t.chess.resign}
            >
              <Flag className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleLeave}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            title={t.chess.leaveRoom}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Check Alert Banner */}
      {room.game_state.isCheck && room.status === 'in_progress' && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-2 px-4 text-xs font-bold text-red-700 animate-bounce">
          <AlertCircle className="h-4 w-4" />
          <span>{t.chess.check}</span>
        </div>
      )}

      {/* Game Over Dialog */}
      {room.status === 'completed' && (
        <div className="mt-6 rounded-2xl border border-indigo-200 bg-white p-6 text-center shadow-lg animate-fade-in">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 mb-3">
            <Sparkles className="h-6 w-6" />
          </div>
          <h3 className="text-lg font-black text-gray-900">
            {room.game_state.winner === myColor
              ? t.chess.youWon
              : room.game_state.winner === 'draw'
              ? t.chess.draw
              : t.chess.youLost}
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            {room.game_state.isCheckmate ? t.chess.checkmate : ''}
          </p>

          <button
            type="button"
            onClick={onExitRoom}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-6 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            <span>{t.common.backToLobby}</span>
          </button>
        </div>
      )}

      {/* Opponent Abandoned / Left Banner */}
      {room.status === 'abandoned' && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-md animate-fade-in">
          <p className="text-sm font-semibold text-gray-700">
            {t.chess.opponentLeft}
          </p>
          <button
            type="button"
            onClick={onExitRoom}
            className="mt-4 rounded-xl bg-gray-900 px-5 py-2 text-xs font-bold text-white"
          >
            {t.common.backToLobby}
          </button>
        </div>
      )}
    </div>
  );
}
