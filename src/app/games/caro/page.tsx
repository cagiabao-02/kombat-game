'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { CaroRoom, CaroBotDifficulty } from '@/features/games/caro/types';
import { supabase } from '@/lib/supabase/client';
import {
  createCaroRoom,
  getCaroRoomByCode,
  joinCaroRoom,
  findOrCreateCaroQuickMatch,
  cancelCaroQuickMatch,
  createBotCaroRoom,
  createLocalCaroRoom,
} from '@/features/games/caro/caroRoomService';
import { CaroLobbyView } from '@/features/games/caro/CaroLobbyView';
import { CaroGameView } from '@/features/games/caro/CaroGameView';
import { soundService } from '@/lib/sound/soundService';

function CaroGameContainer() {
  const { user, guestName, avatar, ensureUser, authError } = useAuth();
  const { t, language } = useLanguage();
  const searchParams = useSearchParams();

  const [currentRoom, setCurrentRoom] = useState<CaroRoom | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isSearchingMatch, setIsSearchingMatch] = useState(false);
  const [searchElapsedSeconds, setSearchElapsedSeconds] = useState(0);
  const [matchFoundOpponentName, setMatchFoundOpponentName] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCancelledRef = useRef<boolean>(false);
  const quickMatchRoomIdRef = useRef<string | null>(null);
  const quickMatchChannelRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

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
              ? `Lỗi xác thực Supabase: ${authError}.`
              : 'Chưa có phiên người dùng Supabase.'
          );
          return;
        }

        const room = await getCaroRoomByCode(code);
        if (!room) {
          setErrorMessage('Không tìm thấy phòng chơi này.');
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
          const updated = await joinCaroRoom(room.id, activeUser.id, guestName, avatar);
          setCurrentRoom(updated);
        } else {
          setErrorMessage('Phòng này đã đầy hoặc ván đấu đang diễn ra.');
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Không thể tham gia phòng này.');
      } finally {
        setIsJoining(false);
      }
    }

    handleAutoJoin(roomCodeFromUrl);
  }, [searchParams, user, guestName, avatar, currentRoom, ensureUser, authError]);

  // Handle Create Online Room
  const handleCreateRoom = useCallback(async () => {
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
            ? `Lỗi xác thực Supabase: "${authError}".`
            : 'Chưa thể kết nối tới Supabase Auth. Vui lòng thử lại.'
        );
        return;
      }

      const room = await createCaroRoom(activeUser.id, guestName, avatar);
      setCurrentRoom(room);
    } catch (err: any) {
      console.error('Error creating room:', err);
      setErrorMessage(err?.message || 'Không thể tạo phòng mới.');
    } finally {
      setIsCreating(false);
    }
  }, [user, guestName, avatar, ensureUser, authError]);

  // Handle Join Online Room
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
              ? `Lỗi xác thực Supabase: "${authError}".`
              : 'Chưa có phiên người dùng Supabase.'
          );
          return;
        }

        const room = await getCaroRoomByCode(code);
        if (!room) {
          setErrorMessage('Không tìm thấy phòng thi đấu với mã này.');
          return;
        }

        if (room.host_id === activeUser.id || room.guest_id === activeUser.id) {
          setCurrentRoom(room);
          return;
        }

        if (room.status === 'waiting' && !room.guest_id) {
          const updated = await joinCaroRoom(room.id, activeUser.id, guestName, avatar);
          setCurrentRoom(updated);
        } else {
          setErrorMessage('Phòng thi đấu này đã đủ người tham gia.');
        }
      } catch (err: any) {
        console.error('Error joining room:', err);
        setErrorMessage(err?.message || 'Không thể tham gia phòng thi đấu.');
      } finally {
        setIsJoining(false);
      }
    },
    [user, guestName, avatar, ensureUser, authError]
  );

  // Handle Cancel Quick Match
  const handleCancelQuickMatch = useCallback(() => {
    isCancelledRef.current = true;
    setIsSearchingMatch(false);
    setSearchElapsedSeconds(0);
    setMatchFoundOpponentName(null);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    if (quickMatchChannelRef.current) {
      supabase.removeChannel(quickMatchChannelRef.current);
      quickMatchChannelRef.current = null;
    }

    if (quickMatchRoomIdRef.current) {
      cancelCaroQuickMatch(quickMatchRoomIdRef.current).catch(() => {});
      quickMatchRoomIdRef.current = null;
    }
  }, []);

  // Handle Start Quick Match
  const handleStartQuickMatch = useCallback(async () => {
    try {
      isCancelledRef.current = false;
      setIsSearchingMatch(true);
      setErrorMessage(null);
      setSearchElapsedSeconds(0);
      setMatchFoundOpponentName(null);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setSearchElapsedSeconds((prev) => prev + 1);
      }, 1000);

      let activeUser = user;
      if (!activeUser) {
        activeUser = await ensureUser();
      }

      if (!activeUser) {
        handleCancelQuickMatch();
        setErrorMessage('Chưa có phiên người dùng Supabase.');
        return;
      }

      const randomDelayMs = Math.floor(Math.random() * 2000) + 800;
      await new Promise((res) => setTimeout(res, randomDelayMs));

      if (isCancelledRef.current) return;

      const result = await findOrCreateCaroQuickMatch(
        activeUser.id,
        guestName,
        avatar
      );

      if (isCancelledRef.current) {
        if (result.role === 'host') {
          cancelCaroQuickMatch(result.room.id).catch(() => {});
        }
        return;
      }

      if (result.role === 'guest') {
        setMatchFoundOpponentName(result.room.host_name);
        soundService.playVictory();

        await new Promise((res) => setTimeout(res, 800));

        if (!isCancelledRef.current) {
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          setCurrentRoom(result.room);
          setIsSearchingMatch(false);
        }
      } else {
        // Created waiting host room
        quickMatchRoomIdRef.current = result.room.id;

        const channel = supabase
          .channel(`caro_quickmatch_${result.room.id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'rooms',
              filter: `id=eq.${result.room.id}`,
            },
            async (payload) => {
              const updatedRoom = payload.new as CaroRoom;
              if (
                updatedRoom.status === 'in_progress' &&
                updatedRoom.guest_id &&
                !isCancelledRef.current
              ) {
                setMatchFoundOpponentName(updatedRoom.guest_name);
                soundService.playVictory();

                await new Promise((res) => setTimeout(res, 800));

                if (!isCancelledRef.current) {
                  if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                  if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                  if (quickMatchChannelRef.current) {
                    supabase.removeChannel(quickMatchChannelRef.current);
                    quickMatchChannelRef.current = null;
                  }
                  setCurrentRoom(updatedRoom);
                  setIsSearchingMatch(false);
                }
              }
            }
          )
          .subscribe();

        quickMatchChannelRef.current = channel;
      }
    } catch (err: any) {
      console.error('Error starting quick match:', err);
      handleCancelQuickMatch();
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi tìm trận đấu.');
    }
  }, [user, guestName, avatar, ensureUser, handleCancelQuickMatch]);

  // Handle Start Bot Match
  const handleStartBotMatch = useCallback(
    (difficulty: CaroBotDifficulty, playerPiece: 'X' | 'O' | 'random') => {
      const activeUserId = user?.id || 'guest_user';
      const botRoom = createBotCaroRoom(
        activeUserId,
        guestName,
        playerPiece,
        difficulty,
        avatar
      );
      setCurrentRoom(botRoom);
    },
    [user, guestName, avatar]
  );

  // Handle Start Local Pass & Play Match
  const handleStartLocalMatch = useCallback((p1Name: string, p2Name: string) => {
    const localRoom = createLocalCaroRoom(p1Name, p2Name);
    setCurrentRoom(localRoom);
  }, []);

  const handleExitRoom = useCallback(() => {
    setCurrentRoom(null);
  }, []);

  return (
    <main className="min-h-screen bg-gray-50/50 pb-16">
      <div className="mx-auto max-w-4xl px-4 py-4 sm:py-6">
        {/* Navigation bar */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs sm:text-sm font-bold text-gray-700 shadow-2xs border border-gray-200/80 hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{t.common.backToLobby}</span>
          </Link>
        </div>

        {/* Dynamic View: Lobby vs Active Game */}
        {!currentRoom ? (
          <CaroLobbyView
            onStartBotMatch={handleStartBotMatch}
            onStartLocalMatch={handleStartLocalMatch}
            onCreateOnlineRoom={handleCreateRoom}
            onJoinOnlineRoom={handleJoinRoom}
            onStartQuickMatch={handleStartQuickMatch}
            onCancelQuickMatch={handleCancelQuickMatch}
            isCreating={isCreating}
            isJoining={isJoining}
            isSearchingMatch={isSearchingMatch}
            searchElapsedSeconds={searchElapsedSeconds}
            matchFoundOpponentName={matchFoundOpponentName}
            errorMessage={errorMessage}
          />
        ) : (
          <CaroGameView
            initialRoom={currentRoom}
            currentUserId={user?.id || 'guest_user'}
            onExitRoom={handleExitRoom}
          />
        )}
      </div>
    </main>
  );
}

export default function CaroPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
        </div>
      }
    >
      <CaroGameContainer />
    </Suspense>
  );
}

