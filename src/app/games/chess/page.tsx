'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { ChessRoom } from '@/features/games/chess/types';
import { supabase } from '@/lib/supabase/client';
import {
  createChessRoom,
  getChessRoomByCode,
  joinChessRoom,
} from '@/features/games/chess/roomService';
import { ChessLobbyView } from '@/features/games/chess/ChessLobbyView';
import { ChessGameView } from '@/features/games/chess/ChessGameView';

function ChessGameContainer() {
  const { user, guestName, ensureUser, authError } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [currentRoom, setCurrentRoom] = useState<ChessRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Auto-join room from URL search parameter (?room=CODE)
  useEffect(() => {
    const roomCodeFromUrl = searchParams.get('room');
    if (!roomCodeFromUrl || currentRoom) return;

    async function handleAutoJoin(code: string) {
      try {
        setIsJoining(true);
        setErrorMessage(null);

        let activeUser = user;
        if (!activeUser) {
          activeUser = await ensureUser();
        }

        if (!activeUser) {
          setErrorMessage(
            authError
              ? `Lỗi xác thực Supabase: ${authError}. Vui lòng bật "Anonymous Sign-ins" trên Supabase Dashboard.`
              : 'Chưa có phiên người dùng Supabase.'
          );
          return;
        }

        const room = await getChessRoomByCode(code);
        if (!room) {
          setErrorMessage(t.chess.roomNotFound);
          return;
        }

        if (room.host_id === activeUser.id) {
          setCurrentRoom(room);
          return;
        }

        if (room.guest_id === activeUser.id) {
          setCurrentRoom(room);
          return;
        }

        if (room.status === 'waiting' && !room.guest_id) {
          const updated = await joinChessRoom(room.id, activeUser.id, guestName);
          supabase.channel(`chess_room_${room.id}`).send({
            type: 'broadcast',
            event: 'room_state',
            payload: updated,
          });
          setCurrentRoom(updated);
        } else {
          setErrorMessage(t.chess.roomFull);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || t.chess.roomNotFound);
      } finally {
        setIsJoining(false);
      }
    }

    handleAutoJoin(roomCodeFromUrl);
  }, [searchParams, user, guestName, currentRoom, t, ensureUser, authError]);

  // Handle user clicking "Create Room"
  const handleCreateRoom = useCallback(async (timeControl: number = 0) => {
    try {
      setIsCreating(true);
      setErrorMessage(null);

      let activeUser = user;
      if (!activeUser) {
        activeUser = await ensureUser();
      }

      if (!activeUser) {
        setErrorMessage(
          authError
            ? `Lỗi xác thực Supabase: "${authError}". Bạn đã BẬT "Anonymous sign-ins" trên Supabase Dashboard chưa?`
            : 'Chưa thể kết nối tới Supabase Auth. Vui lòng kiểm tra lại URL/Key trong .env.local và bật Anonymous Sign-ins.'
        );
        return;
      }

      const room = await createChessRoom(activeUser.id, guestName, timeControl);
      setCurrentRoom(room);
    } catch (err: any) {
      console.error('Create room error:', err);
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi tạo phòng.');
    } finally {
      setIsCreating(false);
    }
  }, [user, guestName, ensureUser, authError]);

  // Handle user entering room code to join
  const handleJoinRoom = useCallback(
    async (code: string) => {
      try {
        setIsJoining(true);
        setErrorMessage(null);

        let activeUser = user;
        if (!activeUser) {
          activeUser = await ensureUser();
        }

        if (!activeUser) {
          setErrorMessage(
            authError
              ? `Lỗi xác thực Supabase: "${authError}". Bạn đã BẬT "Anonymous sign-ins" trên Supabase Dashboard chưa?`
              : 'Chưa có phiên người dùng Supabase.'
          );
          return;
        }

        const room = await getChessRoomByCode(code);
        if (!room) {
          setErrorMessage(t.chess.roomNotFound);
          return;
        }

        if (room.host_id === activeUser.id || room.guest_id === activeUser.id) {
          setCurrentRoom(room);
          return;
        }

        if (room.status === 'waiting' && !room.guest_id) {
          const updated = await joinChessRoom(room.id, activeUser.id, guestName);
          supabase.channel(`chess_room_${room.id}`).send({
            type: 'broadcast',
            event: 'room_state',
            payload: updated,
          });
          setCurrentRoom(updated);
        } else {
          setErrorMessage(t.chess.roomFull);
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Không thể tham gia phòng này.');
      } finally {
        setIsJoining(false);
      }
    },
    [user, guestName, t, ensureUser, authError]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-6 sm:py-8">
      {/* Top back navigation (only visible when in lobby) */}
      {!currentRoom && (
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.common.backToLobby}</span>
          </Link>
        </div>
      )}

      {/* Lobby View or Active Game View */}
      {!currentRoom ? (
        <ChessLobbyView
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          isCreating={isCreating}
          isJoining={isJoining}
          errorMessage={errorMessage}
        />
      ) : (
        <ChessGameView
          initialRoom={currentRoom}
          currentUserId={user?.id || ''}
          onExitRoom={() => setCurrentRoom(null)}
        />
      )}
    </div>
  );
}

export default function ChessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center text-sm font-medium text-gray-500">
          Đang tải phòng cờ vua...
        </div>
      }
    >
      <ChessGameContainer />
    </Suspense>
  );
}
