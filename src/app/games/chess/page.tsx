'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { ChessRoom, BotDifficulty } from '@/features/games/chess/types';
import { supabase } from '@/lib/supabase/client';
import {
  createChessRoom,
  getChessRoomByCode,
  joinChessRoom,
  findOrCreateQuickMatchRoom,
  cancelQuickMatch,
  createBotChessRoom,
} from '@/features/games/chess/roomService';
import { ChessLobbyView } from '@/features/games/chess/ChessLobbyView';
import { ChessGameView } from '@/features/games/chess/ChessGameView';
import { sounds } from '@/lib/sound/soundService';

function ChessGameContainer() {
  const { user, guestName, ensureUser, authError } = useAuth();
  const { t } = useLanguage();
  const searchParams = useSearchParams();

  const [currentRoom, setCurrentRoom] = useState<ChessRoom | null>(null);
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
  const handleCreateRoom = useCallback(
    async (timeControl: number = 0) => {
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
    },
    [user, guestName, ensureUser, authError]
  );

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

  // Cancel Quick Match
  const handleCancelQuickMatch = useCallback(() => {
    isCancelledRef.current = true;
    setIsSearchingMatch(false);
    setMatchFoundOpponentName(null);

    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }

    if (quickMatchChannelRef.current) {
      supabase.removeChannel(quickMatchChannelRef.current);
      quickMatchChannelRef.current = null;
    }

    if (quickMatchRoomIdRef.current) {
      cancelQuickMatch(quickMatchRoomIdRef.current).catch(() => {});
      quickMatchRoomIdRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (quickMatchChannelRef.current) {
        supabase.removeChannel(quickMatchChannelRef.current);
      }
      if (quickMatchRoomIdRef.current) {
        cancelQuickMatch(quickMatchRoomIdRef.current).catch(() => {});
      }
    };
  }, []);

  // Start Quick Match with simulated random delay (1 - 5 seconds)
  const handleStartQuickMatch = useCallback(
    async (timeControl: number = 300) => {
      try {
        isCancelledRef.current = false;
        setErrorMessage(null);
        setIsSearchingMatch(true);
        setSearchElapsedSeconds(0);
        setMatchFoundOpponentName(null);

        // Start elapsed seconds counter
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
          setErrorMessage(
            authError
              ? `Lỗi xác thực Supabase: "${authError}". Vui lòng kiểm tra lại cấu hình.`
              : 'Chưa có phiên người dùng Supabase.'
          );
          return;
        }

        // Simulating random waiting delay between 1,000ms and 5,000ms (1 - 5s)
        const randomDelayMs = Math.floor(Math.random() * 4000) + 1000;
        await new Promise((res) => setTimeout(res, randomDelayMs));

        if (isCancelledRef.current) return;

        // Perform matchmaking via Supabase
        const result = await findOrCreateQuickMatchRoom(
          activeUser.id,
          guestName,
          timeControl
        );

        if (isCancelledRef.current) {
          if (result.role === 'host') {
            cancelQuickMatch(result.room.id).catch(() => {});
          }
          return;
        }

        if (result.role === 'guest') {
          // Matched with existing waiting host!
          setMatchFoundOpponentName(result.room.host_name);
          sounds.playMatchFound();

          // Immediately broadcast to host's matchmaking channel
          const notifyChannel = supabase.channel(`matchmaking_room_${result.room.id}`);
          notifyChannel.subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              notifyChannel.send({
                type: 'broadcast',
                event: 'match_joined',
                payload: result.room,
              });
              setTimeout(() => {
                supabase.removeChannel(notifyChannel);
              }, 600);
            }
          });

          // Wait 900ms to show the celebratory match found screen
          await new Promise((res) => setTimeout(res, 900));

          if (!isCancelledRef.current) {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            setCurrentRoom(result.room);
            setIsSearchingMatch(false);
          }
        } else {
          // Role is host: Created room, waiting in matchmaking queue for someone to join
          quickMatchRoomIdRef.current = result.room.id;

          const transitionToMatch = async (updatedRoom: ChessRoom) => {
            if (isCancelledRef.current) return;
            isCancelledRef.current = true; // prevent duplicate transitions

            if (pollingIntervalRef.current) {
              clearInterval(pollingIntervalRef.current);
              pollingIntervalRef.current = null;
            }

            setMatchFoundOpponentName(updatedRoom.guest_name || 'Opponent');
            sounds.playMatchFound();

            await new Promise((res) => setTimeout(res, 900));

            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            if (quickMatchChannelRef.current) {
              supabase.removeChannel(quickMatchChannelRef.current);
              quickMatchChannelRef.current = null;
            }
            setCurrentRoom(updatedRoom);
            setIsSearchingMatch(false);
            quickMatchRoomIdRef.current = null;
          };

          // 1. Instant Broadcast listener + 2. Postgres Changes listener
          const matchChannelName = `matchmaking_room_${result.room.id}`;
          if ((supabase as any).realtime?.channels) {
            (supabase as any).realtime.channels = (supabase as any).realtime.channels.filter(
              (ch: any) => ch.topic !== `realtime:${matchChannelName}` && ch.subTopic !== matchChannelName
            );
          }
          const channel = supabase
            .channel(matchChannelName)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${result.room.id}`,
              },
              (payload) => {
                if (payload.new && (payload.new as any).status === 'in_progress') {
                  transitionToMatch(payload.new as ChessRoom);
                }
              }
            )
            .on('broadcast', { event: 'match_joined' }, ({ payload }) => {
              if (payload && payload.status === 'in_progress') {
                transitionToMatch(payload as ChessRoom);
              }
            })
            .subscribe();

          quickMatchChannelRef.current = channel;

          // 3. Polling Fallback (mỗi 1.0s) để đảm bảo 100% bắt được kết quả dù WebSocket lag
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = setInterval(async () => {
            if (isCancelledRef.current || !quickMatchRoomIdRef.current) {
              if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
              return;
            }
            try {
              const { data: latest } = await supabase
                .from('rooms')
                .select('*')
                .eq('id', result.room.id)
                .single();

              if (latest && latest.status === 'in_progress' && latest.guest_id) {
                transitionToMatch(latest as ChessRoom);
              }
            } catch {
              // Ignore polling errors
            }
          }, 1000);
        }
      } catch (err: any) {
        console.error('Quick match error:', err);
        handleCancelQuickMatch();
        setErrorMessage(err?.message || 'Có lỗi xảy ra khi tìm trận.');
      }
    },
    [user, guestName, ensureUser, authError, handleCancelQuickMatch]
  );

  const handleStartBotMatch = useCallback(
    (
      difficulty: BotDifficulty,
      playerColor: 'white' | 'black' | 'random',
      timeControl: number
    ) => {
      handleCancelQuickMatch();
      const botRoom = createBotChessRoom(
        user?.id || 'guest_player',
        guestName,
        playerColor,
        difficulty,
        timeControl
      );
      sounds.playMatchFound();
      setCurrentRoom(botRoom);
    },
    [user, guestName, handleCancelQuickMatch]
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
          onStartQuickMatch={handleStartQuickMatch}
          onCancelQuickMatch={handleCancelQuickMatch}
          onStartBotMatch={handleStartBotMatch}
          isCreating={isCreating}
          isJoining={isJoining}
          isSearchingMatch={isSearchingMatch}
          searchElapsedSeconds={searchElapsedSeconds}
          matchFoundOpponentName={matchFoundOpponentName}
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
