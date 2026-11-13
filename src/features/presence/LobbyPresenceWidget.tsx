'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { LobbyPlayer, ChallengeRequest, ChallengeResponse, ChallengeGameType } from './types';
import { presenceService } from './presenceService';
import { UserAvatar } from '@/components/UserAvatar';
import { IncomingChallengeModal } from './IncomingChallengeModal';
import { createChessRoom } from '@/features/games/chess/roomService';
import { createCaroRoom } from '@/features/games/caro/caroRoomService';
import { Users, Swords, X, Loader2, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export function LobbyPresenceWidget() {
  const router = useRouter();
  const { user, guestName, avatar, ensureUser } = useAuth();
  const { language } = useLanguage();

  const [onlinePlayers, setOnlinePlayers] = useState<LobbyPlayer[]>([]);
  const [isListOpen, setIsListOpen] = useState(false);
  const [incomingChallenge, setIncomingChallenge] = useState<ChallengeRequest | null>(null);

  // Trạng thái gửi lời thách đấu
  const [sendingToPlayer, setSendingToPlayer] = useState<LobbyPlayer | null>(null);
  const [selectedGame, setSelectedGame] = useState<ChallengeGameType | null>(null);
  const [isWaitingResponse, setIsWaitingResponse] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const waitingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeChallengeIdRef = useRef<string | null>(null);

  // Tạo hoặc lấy ID định danh duy nhất cho phiên chơi này
  const myPlayerId = user?.id || (typeof window !== 'undefined'
    ? localStorage.getItem('kombat_session_player_id') || (() => {
        const id = 'player_' + Math.random().toString(36).substring(2, 9);
        localStorage.setItem('kombat_session_player_id', id);
        return id;
      })()
    : 'guest_player');

  useEffect(() => {
    const me: LobbyPlayer = {
      userId: myPlayerId,
      name: guestName || (language === 'vi' ? 'Khách' : 'Guest'),
      avatar: avatar || '👑',
      status: 'idle',
      onlineAt: Date.now(),
    };

    presenceService.joinLobby(me, {
      onPlayersSync: (players) => {
        setOnlinePlayers(players);
      },
      onChallengeReceived: (req) => {
        setIncomingChallenge(req);
      },
      onChallengeResponse: (res) => {
        if (activeChallengeIdRef.current && res.challengeId === activeChallengeIdRef.current) {
          if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
          setIsWaitingResponse(false);
          setSendingToPlayer(null);

          if (res.accepted) {
            setFeedbackMessage({
              type: 'success',
              text: language === 'vi' ? 'Đối thủ đã chấp nhận! Đang vào ván...' : 'Challenge accepted! Entering game...',
            });
            setTimeout(() => {
              router.push(`/games/${res.gameId}?room=${res.roomCode}`);
            }, 800);
          } else {
            setFeedbackMessage({
              type: 'error',
              text: language === 'vi' ? 'Đối thủ đã từ chối hoặc đang bận.' : 'Player declined or is busy.',
            });
            setTimeout(() => setFeedbackMessage(null), 3500);
          }
        }
      },
    });

    return () => {
      if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
      presenceService.leaveLobby();
    };
  }, [myPlayerId, guestName, avatar, language, router]);

  const otherPlayers = onlinePlayers.filter((p) => p.userId !== myPlayerId);
  const totalCount = Math.max(1, onlinePlayers.length);

  const handleStartChallenge = (targetPlayer: LobbyPlayer) => {
    setSendingToPlayer(targetPlayer);
    setSelectedGame(null);
    setFeedbackMessage(null);
  };

  const handleConfirmSendChallenge = async (gameId: ChallengeGameType) => {
    if (!sendingToPlayer) return;

    setSelectedGame(gameId);
    setIsWaitingResponse(true);
    setFeedbackMessage(null);

    let activeUser = user;
    if (!activeUser) {
      activeUser = await ensureUser();
    }
    const hostId = activeUser?.id || myPlayerId;
    const hostName = guestName || 'Player';

    try {
      let roomCode = '';
      if (gameId === 'chess') {
        const room = await createChessRoom(hostId, hostName, 0, avatar);
        roomCode = room.code;
      } else {
        const room = await createCaroRoom(hostId, hostName, avatar);
        roomCode = room.code;
      }

      const challengeId = 'chal_' + Math.random().toString(36).substring(2, 9);
      activeChallengeIdRef.current = challengeId;

      const req: ChallengeRequest = {
        challengeId,
        fromId: myPlayerId,
        fromName: hostName,
        fromAvatar: avatar,
        toId: sendingToPlayer.userId,
        toName: sendingToPlayer.name,
        gameId,
        roomCode,
        createdAt: Date.now(),
      };

      await presenceService.sendChallenge(req);

      // Đặt timeout 15s tự động hủy nếu đối thủ không phản hồi
      let remaining = 15;
      if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
      waitingTimerRef.current = setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
          setIsWaitingResponse(false);
          setSendingToPlayer(null);
          setFeedbackMessage({
            type: 'error',
            text: language === 'vi' ? 'Hết thời gian chờ phản hồi.' : 'Challenge request timed out.',
          });
          setTimeout(() => setFeedbackMessage(null), 3000);
        }
      }, 1000);
    } catch {
      setIsWaitingResponse(false);
      setSendingToPlayer(null);
      setFeedbackMessage({
        type: 'error',
        text: language === 'vi' ? 'Không thể tạo phòng thách đấu. Thử lại sau!' : 'Failed to create challenge room.',
      });
    }
  };

  const handleCancelSending = () => {
    if (waitingTimerRef.current) clearInterval(waitingTimerRef.current);
    setIsWaitingResponse(false);
    setSendingToPlayer(null);
    activeChallengeIdRef.current = null;
  };

  return (
    <>
      {/* Nút hiển thị số người online ở Hero sảnh */}
      <button
        type="button"
        onClick={() => setIsListOpen(true)}
        className="group inline-flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/90 hover:bg-emerald-100 text-emerald-800 px-3 py-1.5 text-xs font-bold shadow-2xs hover:scale-102 active:scale-95 transition-all outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
        title={language === 'vi' ? 'Nhấn để xem danh sách & thách đấu' : 'Click to view online players & challenge'}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>
          {language === 'vi' ? `${totalCount} người online` : `${totalCount} Online`}
        </span>
        <Swords className="h-3 w-3 text-emerald-600 transition-transform group-hover:rotate-12" />
      </button>

      {/* Modal / Sheet Danh sách Người chơi Trực tuyến */}
      {isListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-200">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 tracking-tight">
                    {language === 'vi' ? 'Người Chơi Trực Tuyến' : 'Online Players'}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {language === 'vi'
                      ? 'Thách đấu trực tiếp 1 chạm không cần mã phòng'
                      : '1-click instant challenge without room codes'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsListOpen(false);
                  handleCancelSending();
                }}
                className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Thông báo Feedback (nếu có) */}
            {feedbackMessage && (
              <div
                className={`mx-4 mt-3 flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            {/* Nội dung danh sách */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Thẻ bản thân */}
              <div className="flex items-center justify-between rounded-2xl bg-indigo-50/60 border border-indigo-100 p-3">
                <div className="flex items-center gap-2.5">
                  <UserAvatar avatar={avatar} className="h-10 w-10 text-base" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-black text-gray-900">{guestName}</span>
                      <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                        {language === 'vi' ? 'Bạn' : 'You'}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>{language === 'vi' ? 'Đang ở sảnh' : 'In Lobby'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Phân cách */}
              <div className="flex items-center gap-2 pt-1 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span>{language === 'vi' ? 'Đối thủ tiềm năng' : 'Available Opponents'}</span>
                <span className="h-px flex-1 bg-gray-100"></span>
                <span>{otherPlayers.length}</span>
              </div>

              {/* Danh sách người khác */}
              {otherPlayers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-50 text-gray-400">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="text-xs font-bold text-gray-700">
                    {language === 'vi' ? 'Chưa có đối thủ nào khác ở sảnh' : 'No other players in lobby yet'}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500 leading-relaxed max-w-xs mx-auto">
                    {language === 'vi'
                      ? 'Gửi đường link sảnh cho bạn bè hoặc mở thêm một tab ẩn danh để thử thách đấu ngay nhé!'
                      : 'Share lobby link with friends or open an incognito tab to test challenge!'}
                  </p>
                </div>
              ) : (
                otherPlayers.map((player) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-3 shadow-2xs hover:border-gray-200 transition-all"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar avatar={player.avatar} className="h-10 w-10 text-base shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-black text-gray-900 truncate">
                          {player.name}
                        </p>
                        <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                          <span>{language === 'vi' ? 'Sẵn sàng' : 'Ready'}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartChallenge(player)}
                      disabled={isWaitingResponse}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-3 py-1.5 text-xs font-bold shadow-xs active:scale-95 transition-all shrink-0"
                    >
                      <Swords className="h-3.5 w-3.5" />
                      <span>{language === 'vi' ? 'Thách đấu' : 'Challenge'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Chọn Game & Đang chờ gửi lời thách đấu */}
            {sendingToPlayer && (
              <div className="border-t border-gray-100 bg-gray-50 p-4 animate-in slide-in-from-bottom-2 duration-150">
                {!isWaitingResponse ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-gray-800">
                        {language === 'vi'
                          ? `Chọn trò chơi thách đấu ${sendingToPlayer.name}:`
                          : `Choose game to challenge ${sendingToPlayer.name}:`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSendingToPlayer(null)}
                        className="text-xs text-gray-400 hover:text-gray-600 font-bold"
                      >
                        {language === 'vi' ? 'Hủy' : 'Cancel'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleConfirmSendChallenge('chess')}
                        className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-white p-3 text-center shadow-xs hover:border-indigo-500 hover:bg-indigo-50/40 active:scale-95 transition-all"
                      >
                        <span className="text-2xl">♟️</span>
                        <span className="text-xs font-black text-gray-900">
                          {language === 'vi' ? 'Cờ Vua 1v1' : 'Chess 1v1'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConfirmSendChallenge('caro')}
                        className="flex flex-col items-center gap-1.5 rounded-2xl border border-gray-200 bg-white p-3 text-center shadow-xs hover:border-indigo-500 hover:bg-indigo-50/40 active:scale-95 transition-all"
                      >
                        <span className="text-2xl">❌⭕</span>
                        <span className="text-xs font-black text-gray-900">
                          {language === 'vi' ? 'Cờ Caro 15x15' : 'Gomoku 15x15'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-700 mb-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <span>
                        {language === 'vi'
                          ? `Đang chờ ${sendingToPlayer.name} chấp nhận... (15s)`
                          : `Waiting for ${sendingToPlayer.name} to accept... (15s)`}
                      </span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleCancelSending}
                        className="rounded-xl border border-gray-200 bg-white px-3 py-1 text-xs font-bold text-gray-600 hover:bg-gray-100"
                      >
                        {language === 'vi' ? 'Hủy lời mời' : 'Cancel request'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Popup Nhận Thách đấu */}
      <IncomingChallengeModal
        challenge={incomingChallenge}
        onClose={() => setIncomingChallenge(null)}
      />
    </>
  );
}

