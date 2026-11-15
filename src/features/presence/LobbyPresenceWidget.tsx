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
        className="pixel-btn group inline-flex items-center gap-2 bg-emerald-200 hover:bg-emerald-300 text-zinc-900 px-3 py-1.5 text-xs font-bold outline-none"
        title={language === 'vi' ? 'Nhấn để xem danh sách & thách đấu' : 'Click to view online players & challenge'}
      >
        <span className="relative flex h-2.5 w-2.5 border border-zinc-900 bg-emerald-500">
          <span className="animate-ping absolute inline-flex h-full w-full bg-emerald-400 opacity-75"></span>
        </span>
        <span>
          {language === 'vi' ? `${totalCount} ONLINE` : `${totalCount} ONLINE`}
        </span>
        <Swords className="h-3.5 w-3.5 text-zinc-900 transition-transform group-hover:rotate-12" />
      </button>

      {/* Modal / Sheet Danh sách Người chơi Trực tuyến */}
      {isListOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-150">
          <div className="pixel-box-lg relative flex max-h-[85vh] w-full max-w-md flex-col overflow-hidden bg-[#FFFDF8] animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 bg-emerald-300 px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center bg-zinc-900 text-emerald-400 border-2 border-zinc-900">
                  <Users className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-pixel text-base font-bold text-zinc-950 uppercase tracking-wide">
                    {language === 'vi' ? 'SẢNH TRỰC TUYẾN' : 'ONLINE ARCADE'}
                  </h3>
                  <p className="text-xs font-mono text-zinc-800">
                    {language === 'vi'
                      ? 'Thách đấu 1 chạm không cần mã phòng'
                      : '1-click instant challenge'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsListOpen(false);
                  handleCancelSending();
                }}
                className="pixel-btn flex h-9 w-9 items-center justify-center bg-white text-zinc-900 hover:bg-rose-100"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Thông báo Feedback (nếu có) */}
            {feedbackMessage && (
              <div
                className={`mx-4 mt-3 flex items-center gap-2 border-2 border-zinc-900 p-2.5 text-xs font-mono font-bold ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-100 text-emerald-950'
                    : 'bg-rose-100 text-rose-950'
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
              <div className="flex items-center justify-between border-2 border-zinc-900 bg-indigo-50 p-3 shadow-pixel-sm">
                <div className="flex items-center gap-2.5">
                  <UserAvatar avatar={avatar} className="h-10 w-10 text-base" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-pixel text-xs font-bold text-zinc-900">{guestName}</span>
                      <span className="bg-indigo-600 border border-zinc-900 px-1.5 py-0.5 font-pixel text-[10px] font-bold text-amber-300">
                        {language === 'vi' ? 'BẠN (P1)' : 'YOU (P1)'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                      <span className="h-2 w-2 bg-emerald-500 border border-zinc-900"></span>
                      <span>{language === 'vi' ? 'Đang ở sảnh' : 'In Lobby'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Phân cách */}
              <div className="flex items-center gap-2 pt-1 font-pixel text-xs font-bold text-zinc-600 uppercase tracking-wider">
                <span>{language === 'vi' ? 'ĐỐI THỦ TIỀM NĂNG' : 'CHALLENGERS'}</span>
                <span className="h-0.5 flex-1 bg-zinc-300"></span>
                <span>[{otherPlayers.length}]</span>
              </div>

              {/* Danh sách người khác */}
              {otherPlayers.length === 0 ? (
                <div className="border-2 border-dashed border-zinc-400 bg-white p-6 text-center">
                  <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-amber-100 text-zinc-900">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <p className="font-pixel text-sm font-bold text-zinc-900">
                    {language === 'vi' ? 'CHƯA CÓ ĐỐI THỦ NÀO KHÁC Ở SẢNH' : 'NO OTHER PLAYERS YET'}
                  </p>
                  <p className="mt-1 text-[11px] font-mono text-zinc-600 leading-relaxed max-w-xs mx-auto">
                    {language === 'vi'
                      ? 'Gửi đường link sảnh cho bạn bè hoặc mở thêm một tab ẩn danh để thử thách đấu ngay nhé!'
                      : 'Share lobby link with friends or open an incognito tab to test challenge!'}
                  </p>
                </div>
              ) : (
                otherPlayers.map((player) => (
                  <div
                    key={player.userId}
                    className="flex items-center justify-between border-2 border-zinc-900 bg-white p-3 shadow-pixel-sm"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <UserAvatar avatar={player.avatar} className="h-10 w-10 text-base shrink-0" />
                      <div className="min-w-0">
                        <p className="font-pixel text-xs font-bold text-zinc-900 truncate">
                          {player.name}
                        </p>
                        <span className="text-[11px] font-mono font-bold text-emerald-700 flex items-center gap-1">
                          <span className="h-2 w-2 bg-emerald-500 border border-zinc-900"></span>
                          <span>{language === 'vi' ? 'SẴN SÀNG' : 'READY'}</span>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleStartChallenge(player)}
                      disabled={isWaitingResponse}
                      className="pixel-btn inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-amber-300 px-3 py-1.5 text-xs font-bold shrink-0"
                    >
                      <Swords className="h-3.5 w-3.5" />
                      <span>{language === 'vi' ? 'THÁCH ĐẤU' : 'FIGHT'}</span>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Modal Chọn Game & Đang chờ gửi lời thách đấu */}
            {sendingToPlayer && (
              <div className="border-t-2 border-zinc-900 bg-[#ECE8DD] p-4 animate-in slide-in-from-bottom-2 duration-150">
                {!isWaitingResponse ? (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-pixel text-xs font-bold text-zinc-900">
                        {language === 'vi'
                          ? `CHỌN BỘ MÔN THÁCH ĐẤU ${sendingToPlayer.name}:`
                          : `SELECT GAME VS ${sendingToPlayer.name}:`}
                      </p>
                      <button
                        type="button"
                        onClick={() => setSendingToPlayer(null)}
                        className="font-pixel text-xs text-rose-700 hover:underline font-bold"
                      >
                        {language === 'vi' ? '[HỦY]' : '[CANCEL]'}
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleConfirmSendChallenge('chess')}
                        className="pixel-btn flex flex-col items-center gap-1.5 bg-white hover:bg-indigo-50 p-3 text-center"
                      >
                        <span className="text-2xl">♟️</span>
                        <span className="font-pixel text-xs font-bold text-zinc-900">
                          {language === 'vi' ? 'CỜ VUA 1V1' : 'CHESS 1V1'}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleConfirmSendChallenge('caro')}
                        className="pixel-btn flex flex-col items-center gap-1.5 bg-white hover:bg-indigo-50 p-3 text-center"
                      >
                        <span className="text-2xl">❌⭕</span>
                        <span className="font-pixel text-xs font-bold text-zinc-900">
                          {language === 'vi' ? 'CỜ CARO 15X15' : 'GOMOKU 15X15'}
                        </span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="inline-flex items-center gap-2 font-pixel text-xs font-bold text-indigo-800 mb-2">
                      <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                      <span>
                        {language === 'vi'
                          ? `ĐANG CHỜ ${sendingToPlayer.name} CHẤP NHẬN... (15S)`
                          : `WAITING FOR ${sendingToPlayer.name}... (15S)`}
                      </span>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={handleCancelSending}
                        className="pixel-btn bg-white px-3 py-1 text-xs font-bold text-zinc-900 hover:bg-rose-50"
                      >
                        {language === 'vi' ? 'HỦY LỜI MỜI' : 'CANCEL'}
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

