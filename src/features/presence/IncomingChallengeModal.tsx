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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/65 p-4 animate-in fade-in duration-150">
      <div className="pixel-box-lg relative w-full max-w-sm overflow-hidden bg-[#FFFDF8] p-6 text-center animate-in zoom-in-95 duration-150">
        {/* Top Arcade Warning Stripe */}
        <div className="absolute top-0 left-0 right-0 h-2.5 bg-amber-400 border-b-2 border-zinc-900" />

        {/* Header Icon */}
        <div className="mx-auto mb-4 mt-2 flex h-16 w-16 items-center justify-center bg-indigo-600 text-amber-300 border-2 border-zinc-900 shadow-pixel-sm animate-bounce">
          <Swords className="h-8 w-8" />
        </div>

        {/* Title */}
        <h3 className="font-pixel text-xl font-bold text-zinc-950 uppercase tracking-wide">
          {language === 'vi' ? 'THÁCH ĐẤU MỚI!' : 'HERE COMES A NEW CHALLENGER!'}
        </h3>
        <p className="mt-1 text-xs font-mono text-zinc-600">
          {language === 'vi'
            ? 'Đối thủ muốn so tài cùng bạn ngay bây giờ'
            : 'Another player wants to battle you'}
        </p>

        {/* Challenger Card */}
        <div className="mt-4 flex items-center gap-3 border-2 border-zinc-900 bg-[#ECE8DD] p-3 shadow-pixel-sm">
          <UserAvatar avatar={challenge.fromAvatar} className="h-12 w-12 text-xl" />
          <div className="text-left min-w-0 flex-1">
            <p className="font-pixel text-sm font-bold text-zinc-900 truncate">
              {challenge.fromName}
            </p>
            <span className="inline-flex items-center gap-1 font-pixel text-xs font-bold text-indigo-700">
              <span>[{gameTitle}]</span>
            </span>
          </div>
        </div>

        {/* Countdown Timer */}
        <div className="mt-4 flex items-center justify-center gap-1.5 font-pixel text-xs font-bold text-amber-950 bg-amber-200 py-1.5 px-3 border-2 border-zinc-900">
          <Clock className="h-3.5 w-3.5 animate-spin" />
          <span>
            {language === 'vi' ? `TỰ ĐỘNG TỪ CHỐI: ${countdown}S` : `TIME REMAINING: ${countdown}S`}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDecline}
            className="pixel-btn flex items-center justify-center gap-1.5 min-h-[44px] bg-white hover:bg-rose-50 text-xs font-bold text-zinc-900"
          >
            <X className="h-4 w-4 text-rose-600" />
            <span>{language === 'vi' ? 'TỪ CHỐI' : 'DECLINE'}</span>
          </button>

          <button
            type="button"
            onClick={handleAccept}
            className="pixel-btn flex items-center justify-center gap-1.5 min-h-[44px] bg-emerald-400 hover:bg-emerald-300 text-xs font-bold text-zinc-950"
          >
            <Check className="h-4 w-4" />
            <span>{language === 'vi' ? 'CHIẾN NGAY' : 'ACCEPT'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

