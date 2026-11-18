'use client';

import React, { useState, useEffect, Suspense, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Sparkles, ShieldCheck } from 'lucide-react';
import { GoGame } from '@/features/games/go/GoGame';
import { BoardSize, GoRoom } from '@/features/games/go/types';
import {
  createGoRoom,
  getGoRoomByCode,
  joinGoRoom,
  findOrCreateGoQuickMatch,
  cancelGoQuickMatch,
} from '@/features/games/go/goRoomService';
import { supabase } from '@/lib/supabase/client';
import { sounds } from '@/lib/sound/soundService';

function GoContainer() {
  const { user, guestName, avatar, ensureUser, authError } = useAuth();
  const { language } = useLanguage();
  const searchParams = useSearchParams();

  const [showRules, setShowRules] = useState(false);

  // Online Room State
  const [onlineRoom, setOnlineRoom] = useState<GoRoom | null>(null);
  const [isCreatingOnline, setIsCreatingOnline] = useState(false);
  const [isJoiningOnline, setIsJoiningOnline] = useState(false);
  const [isSearchingQuickMatch, setIsSearchingQuickMatch] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quickMatchRoomIdRef = useRef<string | null>(null);
  const quickMatchChannelRef = useRef<any>(null);

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
              ? `Lỗi xác thực: ${authError}.`
              : language === 'vi'
              ? 'Chưa có phiên người dùng Supabase.'
              : 'Supabase session not found.'
          );
          return;
        }

        const room = await getGoRoomByCode(code);
        if (!room) {
          setErrorMessage(
            language === 'vi' ? 'Không tìm thấy phòng cờ vây này.' : 'Go room not found.'
          );
          return;
        }

        if (room.host_id === activeUser.id || room.guest_id === activeUser.id) {
          setOnlineRoom(room);
          return;
        }

        if (room.status === 'waiting' && !room.guest_id) {
          const updated = await joinGoRoom(
            room.id,
            activeUser.id,
            guestName || 'Kỳ thủ',
            avatar
          );
          setOnlineRoom(updated);
          sounds.playClick();
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

  // Tạo phòng Online riêng
  const handleCreateOnlineRoom = useCallback(
    async (boardSize: BoardSize) => {
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
              ? `Lỗi xác thực: ${authError}.`
              : 'Chưa có phiên người dùng Supabase. Vui lòng thử lại.'
          );
          return;
        }

        const room = await createGoRoom(
          activeUser.id,
          guestName || 'Kỳ thủ',
          avatar,
          boardSize
        );
        setOnlineRoom(room);
        sounds.playClick();
      } catch (err: any) {
        console.error('Error creating go room:', err);
        setErrorMessage(err?.message || 'Không thể tạo phòng mới.');
      } finally {
        setIsCreatingOnline(false);
      }
    },
    [user, guestName, avatar, ensureUser, authError]
  );

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

        const room = await getGoRoomByCode(code);
        if (!room) {
          setErrorMessage(
            language === 'vi'
              ? 'Mã phòng không tồn tại hoặc đã hết hạn.'
              : 'Invalid or expired room code.'
          );
          return;
        }

        if (room.host_id === activeUser.id || room.guest_id === activeUser.id) {
          setOnlineRoom(room);
          sounds.playClick();
          return;
        }

        if (room.status === 'waiting' && !room.guest_id) {
          const updated = await joinGoRoom(
            room.id,
            activeUser.id,
            guestName || 'Kỳ thủ',
            avatar
          );
          setOnlineRoom(updated);
          sounds.playClick();
        } else {
          setErrorMessage(
            language === 'vi'
              ? 'Phòng này đã đầy hoặc ván đấu đang diễn ra.'
              : 'Room is full or game in progress.'
          );
        }
      } catch (err: any) {
        console.error('Error joining go room:', err);
        setErrorMessage(err?.message || 'Không thể tham gia phòng này.');
      } finally {
        setIsJoiningOnline(false);
      }
    },
    [user, guestName, avatar, ensureUser, language]
  );

  // Bắt đầu ghép trận nhanh
  const handleStartQuickMatch = useCallback(
    async (boardSize: BoardSize) => {
      try {
        setIsSearchingQuickMatch(true);
        setErrorMessage(null);

        let activeUser = user;
        if (!activeUser) {
          activeUser = await ensureUser();
        }

        if (!activeUser) {
          setErrorMessage('Chưa có phiên người dùng Supabase.');
          setIsSearchingQuickMatch(false);
          return;
        }

        const { room, role } = await findOrCreateGoQuickMatch(
          activeUser.id,
          guestName || 'Kỳ thủ',
          avatar,
          boardSize
        );

        if (role === 'guest') {
          // Đã ghép thành công vào phòng có sẵn
          setIsSearchingQuickMatch(false);
          setOnlineRoom(room);
          sounds.playClick();
        } else {
          // Đang làm Host chờ đối thủ vào phòng
          quickMatchRoomIdRef.current = room.id;

          const channel = supabase
            .channel(`quickmatch_go:${room.id}`)
            .on(
              'postgres_changes',
              {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
                filter: `id=eq.${room.id}`,
              },
              (payload) => {
                const updatedRoom = payload.new as GoRoom;
                if (updatedRoom.guest_id && updatedRoom.status === 'in_progress') {
                  channel.unsubscribe();
                  quickMatchChannelRef.current = null;
                  setIsSearchingQuickMatch(false);
                  setOnlineRoom(updatedRoom);
                  sounds.playClick();
                }
              }
            )
            .subscribe();

          quickMatchChannelRef.current = channel;
        }
      } catch (err: any) {
        console.error('Quick match error:', err);
        setErrorMessage(err?.message || 'Lỗi ghép trận nhanh.');
        setIsSearchingQuickMatch(false);
      }
    },
    [user, guestName, avatar, ensureUser]
  );

  // Hủy tìm trận nhanh
  const handleCancelQuickMatch = useCallback(async () => {
    setIsSearchingQuickMatch(false);

    if (quickMatchChannelRef.current) {
      quickMatchChannelRef.current.unsubscribe();
      quickMatchChannelRef.current = null;
    }

    if (quickMatchRoomIdRef.current) {
      try {
        await cancelGoQuickMatch(quickMatchRoomIdRef.current);
      } catch (err) {
        console.error('Error canceling quick match:', err);
      }
      quickMatchRoomIdRef.current = null;
    }
  }, []);

  return (
    <div className="mx-auto max-w-xl px-2 py-4 sm:px-4 sm:py-6">
      {/* Header Bar */}
      <div className="mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="pixel-btn inline-flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 hover:bg-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === 'vi' ? 'Về sảnh chính' : 'Back to Lobby'}</span>
        </Link>

        {/* Toggle Rules Accordion */}
        <button
          type="button"
          onClick={() => setShowRules((prev) => !prev)}
          className="pixel-btn inline-flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200"
        >
          <BookOpen className="h-3.5 w-3.5 text-amber-800" />
          <span>{language === 'vi' ? 'Luật chơi Cờ Vây' : 'How to Play Go'}</span>
          {showRules ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Rules Dropdown Box */}
      {showRules && (
        <div className="pixel-box mb-4 bg-[#FFFDF8] p-4 text-xs sm:text-sm font-mono text-zinc-800 shadow-[3px_3px_0px_#000]">
          <h4 className="font-pixel font-bold text-amber-900 text-base mb-2 uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            {language === 'vi' ? 'QUY TẮC CƠ BẢN CỜ VÂY (GO / WEIQI)' : 'BASIC GO RULES & STRATEGY'}
          </h4>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
            <li>
              ⚪ <strong>{language === 'vi' ? 'Lượt đi & Đặt quân' : 'Turns & Placement'}</strong>:{' '}
              {language === 'vi'
                ? 'Quân Đen luôn đi trước, quân Trắng đi sau. Quân cờ được đặt vào các giao điểm của đường kẻ (không phải vào trong ô vuông).'
                : 'Black plays first, followed by White. Stones are placed on line intersections, not inside squares.'}
            </li>
            <li>
              💨 <strong>{language === 'vi' ? 'Khí (Liberties)' : 'Liberties'}</strong>:{' '}
              {language === 'vi'
                ? 'Các giao điểm trống liền kề trực giao (trên, dưới, trái, phải) với một quân cờ hoặc đám quân nối liền được gọi là "khí".'
                : 'Adjacent unoccupied intersections directly connected (horizontally/vertically) to a stone or group are its liberties.'}
            </li>
            <li>
              ⚔️ <strong>{language === 'vi' ? 'Bắt quân (Capture)' : 'Capturing Stones'}</strong>:{' '}
              {language === 'vi'
                ? 'Khi một quân hoặc đám quân bị đối phương bao vây chặn hết toàn bộ khí (0 khí), đám quân đó bị bắt và nhấc ra khỏi bàn cờ thành "Tù binh".'
                : 'When a stone or group is surrounded and has zero liberties left, it is captured and removed from the board.'}
            </li>
            <li>
              🚫 <strong>{language === 'vi' ? 'Cấm tự sát (Suicide)' : 'No Suicide'}</strong>:{' '}
              {language === 'vi'
                ? 'Không được đặt quân vào nơi không còn khí, TRỪ KHI nước đi đó đồng thời ăn được quân đối phương để mở ra khí mới.'
                : 'You cannot place a stone where it has zero liberties, unless that move simultaneously captures opponent stones.'}
            </li>
            <li>
              🔄 <strong>{language === 'vi' ? 'Luật Kiếp (Ko)' : 'Ko Rule'}</strong>:{' '}
              {language === 'vi'
                ? 'Cấm ăn qua ăn lại ngay lập tức tại cùng một giao điểm để tránh ván cờ bị lặp vô tận.'
                : 'A player cannot immediately recapture a single stone in a repeating position.'}
            </li>
            <li>
              🏁 <strong>{language === 'vi' ? 'Kết thúc & Tính điểm đất' : 'Endgame & Scoring'}</strong>:{' '}
              {language === 'vi'
                ? 'Khi cả 2 người chơi liên tiếp Bỏ lượt (Pass), ván cờ kết thúc. Điểm = Đất chiếm được + Số tù binh bắt được (+ 6.5 Komi điểm chấp cho Trắng).'
                : 'When both players pass consecutively, the game ends. Score = Territory + Captures (+ 6.5 Komi for White).'}
            </li>
          </ul>

          <div className="mt-3 pt-2 border-t border-zinc-200 text-[11px] text-zinc-600 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              {language === 'vi'
                ? 'Mẹo: Bàn cờ 9x9 cực kỳ phù hợp để luyện phản xạ và chiến thuật nhanh trên điện thoại.'
                : 'Tip: 9x9 board is ideal for fast tactical play and quick mobile sessions.'}
            </span>
          </div>
        </div>
      )}

      {/* Main Game Component */}
      <GoGame
        onlineRoom={onlineRoom}
        currentUserId={user?.id || ''}
        currentUserName={guestName || user?.user_metadata?.full_name || 'Kỳ thủ'}
        currentUserAvatar={avatar || '👑'}
        onLeaveOnlineRoom={() => setOnlineRoom(null)}
        onCreateOnlineRoom={handleCreateOnlineRoom}
        onJoinOnlineRoom={handleJoinOnlineRoom}
        onStartQuickMatch={handleStartQuickMatch}
        onCancelQuickMatch={handleCancelQuickMatch}
        isCreatingOnline={isCreatingOnline}
        isJoiningOnline={isJoiningOnline}
        isSearchingQuickMatch={isSearchingQuickMatch}
        errorMessage={errorMessage}
      />
    </div>
  );
}

export default function GoPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center font-pixel text-xs">Loading Go Game...</div>}>
      <GoContainer />
    </Suspense>
  );
}
