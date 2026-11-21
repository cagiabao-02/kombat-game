'use client';

import React, { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { sounds } from '@/lib/sound/soundService';
import { OthelloLobby } from '@/features/games/othello/OthelloLobby';
import { OthelloGame } from '@/features/games/othello/OthelloGame';
import {
  cancelQuickMatchOthello,
  createInitialOthelloGameState,
  createOthelloRoom,
  findOrCreateQuickMatchOthelloRoom,
  getOthelloRoomByCode,
  joinOthelloRoom,
} from '@/features/games/othello/othelloRoomService';
import { getOthelloStats, OthelloStats } from '@/features/games/othello/othelloStatsService';
import { clearOthelloLocalGame, loadOthelloLocalGame } from '@/features/games/othello/othelloStorage';
import { OthelloDifficulty, OthelloGameMode, OthelloGameState, OthelloRoom, OthelloStone } from '@/features/games/othello/types';

function OthelloPageContent() {
  const { user, guestName, avatar, ensureUser } = useAuth();
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const [activeState, setActiveState] = useState<OthelloGameState | null>(null);
  const [activeRoom, setActiveRoom] = useState<OthelloRoom | null>(null);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [stats, setStats] = useState<OthelloStats>(() => getOthelloStats());

  const [isCreatingOnline, setIsCreatingOnline] = useState(false);
  const [isJoiningOnline, setIsJoiningOnline] = useState(false);
  const [isSearchingQuickMatch, setIsSearchingQuickMatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quickMatchRoomIdRef = useRef<string | null>(null);
  const quickMatchChannelRef = useRef<any>(null);

  const refreshLocalMeta = useCallback(() => {
    setHasSavedGame(Boolean(loadOthelloLocalGame()));
    setStats(getOthelloStats());
  }, []);

  useEffect(() => {
    refreshLocalMeta();
  }, [refreshLocalMeta]);

  const handleJoinRoomByCode = useCallback(
    async (code: string) => {
      setErrorMessage(null);
      setIsJoiningOnline(true);
      try {
        const activeUser = user || (await ensureUser());
        if (!activeUser) {
          throw new Error(language === 'vi' ? 'Chưa có phiên người dùng Supabase.' : 'Supabase session not found.');
        }
        const found = await getOthelloRoomByCode(code);
        if (!found) {
          throw new Error(language === 'vi' ? 'Không tìm thấy phòng với mã này.' : 'Room not found.');
        }
        const joined = await joinOthelloRoom(found.id, activeUser.id, guestName, avatar);
        setActiveRoom(joined);
        setActiveState(joined.game_state);
      } catch (err: any) {
        setErrorMessage(err?.message || 'Error joining room');
      } finally {
        setIsJoiningOnline(false);
      }
    },
    [avatar, ensureUser, guestName, language, user]
  );

  // Auto-join from ?room=CODE
  useEffect(() => {
    const roomCode = searchParams.get('room');
    if (roomCode && !activeRoom && !activeState) {
      handleJoinRoomByCode(roomCode);
    }
  }, [activeRoom, activeState, handleJoinRoomByCode, searchParams]);

  useEffect(() => {
    return () => {
      if (quickMatchChannelRef.current) {
        supabase.removeChannel(quickMatchChannelRef.current);
      }
    };
  }, []);

  const handleStartLocalGame = (config: {
    mode: Extract<OthelloGameMode, 'ai' | 'local'>;
    aiDifficulty: OthelloDifficulty;
    playerColor: OthelloStone;
  }) => {
    setErrorMessage(null);
    clearOthelloLocalGame();
    const base = createInitialOthelloGameState();
    setActiveRoom(null);
    setActiveState({
      ...base,
      mode: config.mode,
      aiDifficulty: config.aiDifficulty,
      playerColor: config.playerColor,
    });
  };

  const handleResumeSavedGame = () => {
    const saved = loadOthelloLocalGame();
    if (saved) {
      setActiveRoom(null);
      setActiveState(saved);
    }
  };

  const handleCreateOnlineRoom = async () => {
    setErrorMessage(null);
    setIsCreatingOnline(true);
    try {
      const activeUser = user || (await ensureUser());
      if (!activeUser) {
        throw new Error(language === 'vi' ? 'Chưa có phiên người dùng Supabase.' : 'Supabase session not found.');
      }
      const created = await createOthelloRoom(activeUser.id, guestName, avatar);
      setActiveRoom(created);
      setActiveState(created.game_state);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error creating room');
    } finally {
      setIsCreatingOnline(false);
    }
  };

  const handleStartQuickMatch = async () => {
    setErrorMessage(null);
    setIsSearchingQuickMatch(true);
    try {
      const activeUser = user || (await ensureUser());
      if (!activeUser) {
        throw new Error(language === 'vi' ? 'Chưa có phiên người dùng Supabase.' : 'Supabase session not found.');
      }
      const { room, isHost } = await findOrCreateQuickMatchOthelloRoom(activeUser.id, guestName, avatar);

      if (!isHost) {
        sounds.playMatchFound();
        setIsSearchingQuickMatch(false);
        setActiveRoom(room);
        setActiveState(room.game_state);
        return;
      }

      quickMatchRoomIdRef.current = room.id;
      const channel = supabase
        .channel(`othello-qm-${room.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'rooms',
            filter: `id=eq.${room.id}`,
          },
          (payload) => {
            const updated = payload.new as OthelloRoom;
            if (updated.status === 'in_progress' && updated.guest_id) {
              sounds.playMatchFound();
              setIsSearchingQuickMatch(false);
              setActiveRoom(updated);
              setActiveState(updated.game_state);
              supabase.removeChannel(channel);
              quickMatchChannelRef.current = null;
              quickMatchRoomIdRef.current = null;
            }
          }
        )
        .subscribe();

      quickMatchChannelRef.current = channel;
    } catch (err: any) {
      setIsSearchingQuickMatch(false);
      setErrorMessage(err?.message || 'Quick match error');
    }
  };

  const handleCancelQuickMatch = async () => {
    setIsSearchingQuickMatch(false);
    if (quickMatchChannelRef.current) {
      supabase.removeChannel(quickMatchChannelRef.current);
      quickMatchChannelRef.current = null;
    }
    if (quickMatchRoomIdRef.current && user?.id) {
      await cancelQuickMatchOthello(quickMatchRoomIdRef.current, user.id);
      quickMatchRoomIdRef.current = null;
    }
  };

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-pixel text-xs font-bold text-zinc-700 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'vi' ? 'Về sảnh chính' : 'Back to Lobby'}</span>
        </Link>
      </div>

      {activeState ? (
        <OthelloGame
          initialState={activeState}
          room={activeRoom}
          userId={user?.id}
          userName={guestName}
          userAvatar={avatar}
          onExitToLobby={() => {
            setActiveState(null);
            setActiveRoom(null);
            refreshLocalMeta();
          }}
          onStatsUpdated={refreshLocalMeta}
        />
      ) : (
        <OthelloLobby
          hasSavedGame={hasSavedGame}
          stats={stats}
          onResumeSavedGame={handleResumeSavedGame}
          onStartLocalGame={handleStartLocalGame}
          onCreateOnlineRoom={handleCreateOnlineRoom}
          onJoinOnlineRoom={handleJoinRoomByCode}
          onStartQuickMatch={handleStartQuickMatch}
          onCancelQuickMatch={handleCancelQuickMatch}
          isCreatingOnline={isCreatingOnline}
          isJoiningOnline={isJoiningOnline}
          isSearchingQuickMatch={isSearchingQuickMatch}
          errorMessage={errorMessage}
        />
      )}
    </div>
  );
}

export default function OthelloPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-pixel text-sm">Loading Othello...</div>}>
      <OthelloPageContent />
    </Suspense>
  );
}
