'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase/client';
import { XiangqiLobbyView, XiangqiBotDifficulty } from '@/features/games/xiangqi/XiangqiLobbyView';
import { XiangqiGameView } from '@/features/games/xiangqi/XiangqiGameView';
import { XiangqiRoom } from '@/features/games/xiangqi/types';
import { Side } from '@/features/games/xiangqi/xiangqiLogic';
import {
  createXiangqiRoom,
  getXiangqiRoomByCode,
  joinXiangqiRoom,
  findOrCreateXiangqiQuickMatch,
  cancelXiangqiQuickMatch,
} from '@/features/games/xiangqi/xiangqiRoomService';
import { sounds } from '@/lib/sound/soundService';

function XiangqiContainer() {
  const { user, guestName, avatar, ensureUser, authError } = useAuth();
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const [view, setView] = useState<'lobby' | 'game'>('lobby');
  const [gameMode, setGameMode] = useState<'local' | 'bot' | 'online'>('local');
  const [botDifficulty, setBotDifficulty] = useState<XiangqiBotDifficulty>('medium');
  const [botSide, setBotSide] = useState<Side>('black');
  const [playerRedName, setPlayerRedName] = useState('Kỳ thủ Đỏ');
  const [playerBlackName, setPlayerBlackName] = useState('Kỳ thủ Đen');

  // Online State
  const [onlineRoom, setOnlineRoom] = useState<XiangqiRoom | null>(null);
  const [isCreatingOnline, setIsCreatingOnline] = useState(false);
  const [isJoiningOnline, setIsJoiningOnline] = useState(false);
  const [isSearchingQuickMatch, setIsSearchingQuickMatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isCancelledRef = useRef<boolean>(false);
  const quickMatchRoomIdRef = useRef<string | null>(null);
  const quickMatchChannelRef = useRef<any>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tự động tham gia phòng nếu có ?room=CODE trên URL
  useEffect(() => {
    const roomCodeFromUrl = searchParams.get('room');
    if (!roomCodeFromUrl || onlineRoom) return;

    async function handleAutoJoin(code: string) {
      try {
        setIsJoiningOnline(true);
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

        const room = await getXiangqiRoomByCode(code);
        if (!room) {
          setErrorMessage(language === 'vi' ? 'Không tìm thấy phòng cờ tướng này.' : 'Xiangqi room not found.');
          return;
        }

        if (room.host_id === activeUser.id || room.guest_id === activeUser.id) {
          setOnlineRoom(room);
          setGameMode('online');
          setView('game');
          return;
        }

        if (room.status === 'waiting' && !room.guest_id) {
          const updated = await joinXiangqiRoom(
            room.id,
            activeUser.id,
            guestName || 'Kỳ thủ',
            avatar
          );
          setOnlineRoom(updated);
          setGameMode('online');
          setView('game');
        } else {
          setErrorMessage(
            language === 'vi'
              ? 'Phòng này đã đầy hoặc ván đấu đang diễn ra.'
              : 'Room is full or game in progress.'
          );
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Không thể tham gia phòng này.');
      } finally {
        setIsJoiningOnline(false);
      }
    }

    handleAutoJoin(roomCodeFromUrl);
  }, [searchParams, user, guestName, avatar, onlineRoom, ensureUser, authError, language]);

  // Khởi động chế độ Chơi Đôi (Pass & Play)
  const handleStartLocalMatch = (redName: string, blackName: string) => {
    setPlayerRedName(redName || 'Kỳ thủ Đỏ');
    setPlayerBlackName(blackName || 'Kỳ thủ Đen');
    setGameMode('local');
    setOnlineRoom(null);
    setView('game');
  };

  // Khởi động chế độ Đấu Máy (Bot AI)
  const handleStartBotMatch = (difficulty: XiangqiBotDifficulty, playerSide: Side | 'random') => {
    const humanSide: Side =
      playerSide === 'random' ? (Math.random() > 0.5 ? 'red' : 'black') : playerSide;
    const aiSide: Side = humanSide === 'red' ? 'black' : 'red';

    const botName =
      difficulty === 'easy'
        ? (language === 'vi' ? 'Bot Tập Sự' : 'Easy Bot')
        : difficulty === 'medium'
        ? (language === 'vi' ? 'Bot Kỳ Thủ' : 'Medium Bot')
        : (language === 'vi' ? 'Bot Đại Sư' : 'Master Bot');

    setBotDifficulty(difficulty);
    setBotSide(aiSide);

    if (humanSide === 'red') {
      setPlayerRedName(guestName || 'Bạn');
      setPlayerBlackName(botName);
    } else {
      setPlayerRedName(botName);
      setPlayerBlackName(guestName || 'Bạn');
    }

    setGameMode('bot');
    setOnlineRoom(null);
    setView('game');
  };

  // Tạo phòng Online riêng
  const handleCreateOnlineRoom = useCallback(async () => {
    try {
      setIsCreatingOnline(true);
      setErrorMessage(null);

      let activeUser = user;
      if (!activeUser) {
        activeUser = await ensureUser();
      }

      if (!activeUser) {
        setErrorMessage(
          authError
            ? `Lỗi xác thực: "${authError}".`
            : 'Chưa có phiên người dùng Supabase. Vui lòng thử lại.'
        );
        return;
      }

      const room = await createXiangqiRoom(
        activeUser.id,
        guestName || 'Kỳ thủ',
        avatar
      );
      setOnlineRoom(room);
      setGameMode('online');
      setView('game');
    } catch (err: any) {
      console.error('Error creating xiangqi room:', err);
      setErrorMessage(err?.message || 'Không thể tạo phòng mới.');
    } finally {
      setIsCreatingOnline(false);
    }
  }, [user, guestName, avatar, ensureUser, authError]);

  // Tham gia phòng Online bằng mã 6 ký tự
  const handleJoinOnlineRoom = useCallback(
    async (code: string) => {
      try {
        setIsJoiningOnline(true);
        setErrorMessage(null);

        let activeUser = user;
        if (!activeUser) {
          activeUser = await ensureUser();
        }

        if (!activeUser) {
          setErrorMessage('Chưa có phiên người dùng Supabase.');
          return;
        }

        const room = await getXiangqiRoomByCode(code);
        if (!room) {
          setErrorMessage(
            language === 'vi'
              ? 'Không tìm thấy phòng với mã này. Hãy kiểm tra lại mã phòng!'
              : 'Room not found with this code. Please check again!'
          );
          return;
        }

        if (room.host_id === activeUser.id || room.guest_id === activeUser.id) {
          setOnlineRoom(room);
          setGameMode('online');
          setView('game');
          return;
        }

        if (room.status === 'waiting' && !room.guest_id) {
          const updated = await joinXiangqiRoom(
            room.id,
            activeUser.id,
            guestName || 'Kỳ thủ',
            avatar
          );
          setOnlineRoom(updated);
          setGameMode('online');
          setView('game');
        } else {
          setErrorMessage(
            language === 'vi'
              ? 'Phòng thi đấu này đã đủ người tham gia.'
              : 'Room is already full.'
          );
        }
      } catch (err: any) {
        console.error('Error joining xiangqi room:', err);
        setErrorMessage(err?.message || 'Không thể tham gia phòng này.');
      } finally {
        setIsJoiningOnline(false);
      }
    },
    [user, guestName, avatar, ensureUser, language]
  );

  // Hủy tìm kiếm ghép trận nhanh
  const handleCancelQuickMatch = useCallback(() => {
    isCancelledRef.current = true;
    setIsSearchingQuickMatch(false);

    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);

    if (quickMatchChannelRef.current) {
      supabase.removeChannel(quickMatchChannelRef.current);
      quickMatchChannelRef.current = null;
    }

    if (quickMatchRoomIdRef.current) {
      cancelXiangqiQuickMatch(quickMatchRoomIdRef.current).catch(() => {});
      quickMatchRoomIdRef.current = null;
    }
  }, []);

  // Bắt đầu ghép trận nhanh (Quick Match)
  const handleStartQuickMatch = useCallback(async () => {
    try {
      isCancelledRef.current = false;
      setIsSearchingQuickMatch(true);
      setErrorMessage(null);

      let activeUser = user;
      if (!activeUser) {
        activeUser = await ensureUser();
      }

      if (!activeUser) {
        handleCancelQuickMatch();
        setErrorMessage('Chưa có phiên người dùng Supabase.');
        return;
      }

      const result = await findOrCreateXiangqiQuickMatch(
        activeUser.id,
        guestName || 'Kỳ thủ',
        avatar
      );

      if (isCancelledRef.current) {
        if (result.role === 'host') {
          cancelXiangqiQuickMatch(result.room.id).catch(() => {});
        }
        return;
      }

      if (result.role === 'guest') {
        // Ghép thành công ngay với phòng có sẵn
        sounds.playVictory();
        setOnlineRoom(result.room);
        setGameMode('online');
        setIsSearchingQuickMatch(false);
        setView('game');
      } else {
        // Làm Host, lưu ref và mở channel lắng nghe đối thủ vào
        quickMatchRoomIdRef.current = result.room.id;
        const channelName = `quickmatch_xiangqi_${result.room.id}`;

        const channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'rooms',
              filter: `id=eq.${result.room.id}`,
            },
            (payload) => {
              if (isCancelledRef.current) return;
              const updatedRoom = payload.new as XiangqiRoom;

              if (updatedRoom.guest_id && updatedRoom.status === 'in_progress') {
                sounds.playVictory();
                if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
                if (quickMatchChannelRef.current) {
                  supabase.removeChannel(quickMatchChannelRef.current);
                  quickMatchChannelRef.current = null;
                }
                setOnlineRoom(updatedRoom);
                setGameMode('online');
                setIsSearchingQuickMatch(false);
                setView('game');
              }
            }
          )
          .subscribe();

        quickMatchChannelRef.current = channel;

        // Polling dự phòng 2.5s phòng khi Supabase realtime bị nghẽn
        pollingIntervalRef.current = setInterval(async () => {
          if (isCancelledRef.current || !quickMatchRoomIdRef.current) return;

          const { data } = await supabase
            .from('rooms')
            .select('*')
            .eq('id', quickMatchRoomIdRef.current)
            .single();

          if (data && data.guest_id && data.status === 'in_progress') {
            sounds.playVictory();
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            if (quickMatchChannelRef.current) {
              supabase.removeChannel(quickMatchChannelRef.current);
              quickMatchChannelRef.current = null;
            }
            setOnlineRoom(data as XiangqiRoom);
            setGameMode('online');
            setIsSearchingQuickMatch(false);
            setView('game');
          }
        }, 2500);
      }
    } catch (err: any) {
      console.error('Error in quick match:', err);
      handleCancelQuickMatch();
      setErrorMessage(err?.message || 'Lỗi khi tìm trận cờ tướng.');
    }
  }, [user, guestName, avatar, ensureUser, handleCancelQuickMatch]);

  // Rời game về sảnh
  const handleLeaveToLobby = () => {
    handleCancelQuickMatch();
    setOnlineRoom(null);
    setView('lobby');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50/40 via-white to-gray-50/50 py-6 px-3 sm:px-6">
      {/* Navigation bar */}
      <div className="mx-auto max-w-5xl mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-gray-700 shadow-2xs border border-gray-200/90 transition-all hover:bg-gray-50 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === 'vi' ? 'Về Sảnh Chính' : 'Back to Main Lobby'}</span>
        </Link>
      </div>

      {view === 'lobby' ? (
        <XiangqiLobbyView
          onStartLocalMatch={handleStartLocalMatch}
          onStartBotMatch={handleStartBotMatch}
          onCreateOnlineRoom={handleCreateOnlineRoom}
          onJoinOnlineRoom={handleJoinOnlineRoom}
          onStartQuickMatch={handleStartQuickMatch}
          onCancelQuickMatch={handleCancelQuickMatch}
          isCreatingOnline={isCreatingOnline}
          isJoiningOnline={isJoiningOnline}
          isSearchingQuickMatch={isSearchingQuickMatch}
          errorMessage={errorMessage}
        />
      ) : (
        <XiangqiGameView
          gameMode={gameMode}
          botDifficulty={botDifficulty}
          botSide={botSide}
          playerRedName={playerRedName}
          playerBlackName={playerBlackName}
          onlineRoom={onlineRoom}
          currentUserId={user?.id || ''}
          onLeave={handleLeaveToLobby}
        />
      )}
    </div>
  );
}

export default function XiangqiPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-600 border-t-transparent" />
        </div>
      }
    >
      <XiangqiContainer />
    </Suspense>
  );
}
