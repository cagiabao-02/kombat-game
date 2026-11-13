'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChallengeRequest } from './types';
import { presenceService } from './presenceService';
import { UserAvatar } from '@/components/UserAvatar';
import { sounds } from '@/lib/sound/soundService';
import { Swords, Check, X, Clock } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface IncomingChallengeModalProps {
  challenge: ChallengeRequest | null;
  onClose: () => void;
}

export function IncomingChallengeModal({
  challenge,
  onClose,
}: IncomingChallengeModalProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    if (!challenge) return;

    // Phát âm thanh báo hiệu có lời thách đấu
    sounds.playMatchFound();
    setCountdown(15);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Tự động từ chối khi hết 15s
          handleDecline();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [challenge]);

  if (!challenge) return null;

  const gameTitle = challenge.gameId === 'chess'
    ? (language === 'vi' ? 'Cờ Vua 1v1' : 'Chess 1v1')
    : (language === 'vi' ? 'Cờ Caro 15x15' : 'Gomoku 15x15');

  const handleAccept = async () => {
    await presenceService.respondChallenge({
      challengeId: challenge.challengeId,
      fromId: challenge.fromId,
      toId: challenge.toId,
      accepted: true,
      gameId: challenge.gameId,
      roomCode: challenge.roomCode,
    });
    onClose();
    // Chuyển hướng người được mời vào phòng
    router.push(`/games/${challenge.gameId}?room=${challenge.roomCode}`);
  };

  const handleDecline = async () => {
    await presenceService.respondChallenge({
      challengeId: challenge.challengeId,
      fromId: challenge.fromId,
      toId: challenge.toId,
      accepted: false,
      gameId: challenge.gameId,
      roomCode: challenge.roomCode,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
        {/* Glow Header Icon */}
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-200 animate-bounce">
          <Swords className="h-8 w-8" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-black text-gray-900 tracking-tight">
          {language === 'vi' ? 'Lời Thách Đấu Mới!' : 'Incoming Challenge!'}
        </h3>
        <p className="mt-1 text-xs text-gray-500">
          {language === 'vi'
            ? 'Người chơi khác muốn so tài cùng bạn'
            : 'Another player wants to challenge you'}
        </p>

        {/* Challenger Card */}
        <div className="mt-4 flex items-center gap-3 rounded-2xl bg-gray-50 p-3 border border-gray-100">
          <UserAvatar avatar={challenge.fromAvatar} className="h-12 w-12 text-xl" />
          <div className="text-left min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900 truncate">
              {challenge.fromName}
            </p>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
              <span>{gameTitle}</span>
            </span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 py-1.5 px-3 rounded-xl border border-amber-200/80">
          <Clock className="h-3.5 w-3.5 animate-spin" />
          <span>
            {language === 'vi' ? `Tự động từ chối sau ${countdown}s` : `Auto-decline in ${countdown}s`}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleDecline}
            className="flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
          >
            <X className="h-4 w-4 text-gray-400" />
            <span>{language === 'vi' ? 'Từ chối' : 'Decline'}</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="flex items-center justify-center gap-1.5 min-h-[44px] rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>{language === 'vi' ? 'Chiến ngay' : 'Accept'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

