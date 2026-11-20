'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  claimDailyChallenge,
  getTodayChallengeViews,
} from './dailyService';
import { DailyChallengeViewItem, DailyChallengesState } from './types';
import { GameIcon } from '@/components/GameTile';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import {
  CheckCircle2,
  Clock,
  Flame,
  Play,
  Sparkles,
  Trophy,
  X,
} from 'lucide-react';

interface DailyChallengesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function DailyChallengesModal({
  isOpen,
  onClose,
}: DailyChallengesModalProps) {
  const { language } = useLanguage();
  const [state, setState] = useState<DailyChallengesState | null>(null);
  const [items, setItems] = useState<DailyChallengeViewItem[]>([]);
  const [allClaimed, setAllClaimed] = useState(false);
  const [showCelebrate, setShowCelebrate] = useState(false);
  const [countdownText, setCountdownText] = useState('');

  const refreshData = useCallback(() => {
    const view = getTodayChallengeViews();
    setState(view.state);
    setItems(view.items);
    setAllClaimed(view.allClaimed);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    refreshData();

    const updateTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffSec = Math.max(
        0,
        Math.floor((midnight.getTime() - now.getTime()) / 1000)
      );
      const h = String(Math.floor(diffSec / 3600)).padStart(2, '0');
      const m = String(Math.floor((diffSec % 3600) / 60)).padStart(2, '0');
      const s = String(diffSec % 60).padStart(2, '0');
      setCountdownText(`${h}:${m}:${s}`);
    };

    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [isOpen, refreshData]);

  if (!isOpen || !state) return null;

  const handleClaim = (id: string) => {
    claimDailyChallenge(id);
    const updated = getTodayChallengeViews();
    setState(updated.state);
    setItems(updated.items);
    setAllClaimed(updated.allClaimed);
    setShowCelebrate(true);
    setTimeout(() => setShowCelebrate(false), 3200);
  };

  const claimedCount = items.filter((i) => i.claimed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-4 animate-in fade-in duration-150 select-none">
      <PixelFxOverlay active={showCelebrate} />

      <div className="pixel-box-lg relative flex flex-col w-full max-w-lg max-h-[92vh] bg-[#FFFDF8] border-4 border-zinc-900 shadow-pixel-lg overflow-hidden">
        {/* Header Banner Ngọn Lửa Streak */}
        <div className="flex items-center justify-between bg-gradient-to-r from-orange-600 via-amber-500 to-orange-600 px-4 py-3 text-white border-b-3 border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center bg-zinc-950 border-2 border-amber-300 shadow-[2px_2px_0px_#000]">
              <Flame className="w-6 h-6 text-amber-400 fill-amber-400 animate-pulse" />
            </div>
            <div>
              <h3 className="font-pixel text-sm sm:text-base font-black uppercase text-white drop-shadow-[1px_1px_0px_#000]">
                {language === 'vi'
                  ? 'THỬ THÁCH HÀNG NGÀY'
                  : 'DAILY CHALLENGES'}
              </h3>
              <p className="text-[11px] font-mono text-amber-100 flex items-center gap-1.5">
                <Clock className="w-3 h-3" />
                <span>
                  {language === 'vi' ? 'Làm mới sau:' : 'Resets in:'}{' '}
                  <strong className="text-white">{countdownText}</strong>
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="pixel-btn bg-white p-1.5 text-zinc-900 hover:bg-rose-100 border-2 border-zinc-900 shadow-pixel-xs"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Khối Streak Summary */}
          <div className="grid grid-cols-3 gap-2">
            <div className="pixel-box-sm bg-orange-50 border-2 border-zinc-900 p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 font-pixel text-lg font-black text-orange-600">
                <Flame className="w-5 h-5 fill-orange-500" />
                <span>{state.currentStreak}</span>
              </div>
              <span className="font-pixel text-[10px] font-bold text-zinc-700 uppercase">
                {language === 'vi' ? 'Chuỗi ngày' : 'Day Streak'}
              </span>
            </div>

            <div className="pixel-box-sm bg-amber-50 border-2 border-zinc-900 p-2.5 text-center">
              <div className="flex items-center justify-center gap-1 font-pixel text-lg font-black text-amber-700">
                <Trophy className="w-4 h-4" />
                <span>{state.bestStreak}</span>
              </div>
              <span className="font-pixel text-[10px] font-bold text-zinc-700 uppercase">
                {language === 'vi' ? 'Kỷ lục chuỗi' : 'Best Streak'}
              </span>
            </div>

            <div className="pixel-box-sm bg-emerald-50 border-2 border-zinc-900 p-2.5 text-center">
              <div className="font-pixel text-lg font-black text-emerald-700">
                {claimedCount}/3
              </div>
              <span className="font-pixel text-[10px] font-bold text-zinc-700 uppercase">
                {language === 'vi' ? 'Hôm nay' : 'Today'}
              </span>
            </div>
          </div>

          {allClaimed && (
            <div className="bg-emerald-100 border-2 border-emerald-700 p-2.5 text-center font-pixel text-xs font-bold text-emerald-950 shadow-[2px_2px_0px_#000]">
              🏆{' '}
              {language === 'vi'
                ? 'TUYỆT VỜI! Bạn đã hoàn tất toàn bộ thử thách hôm nay!'
                : 'ALL CLEAR! You completed all daily challenges today!'}
            </div>
          )}

          {/* Danh sách 3 Nhiệm vụ hôm nay */}
          <div className="space-y-2.5">
            {items.map((item) => {
              const { template, progress, target, isCompleted, claimed } = item;
              const percent = Math.min(100, Math.round((progress / target) * 100));

              return (
                <div
                  key={template.id}
                  className={`pixel-box-sm border-2 border-zinc-900 p-3 flex items-center gap-3 transition-all ${
                    claimed
                      ? 'bg-emerald-50/70 opacity-85'
                      : isCompleted
                      ? 'bg-amber-50 ring-2 ring-amber-400'
                      : 'bg-white'
                  }`}
                >
                  {/* Icon Pixel đại diện cho game */}
                  <div className="h-12 w-12 shrink-0 border-2 border-zinc-900 overflow-hidden shadow-[2px_2px_0px_#000]">
                    <GameIcon id={template.gameId} />
                  </div>

                  {/* Thông tin & Thanh tiến độ */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-pixel text-xs font-bold text-zinc-950 truncate">
                        {language === 'vi' ? template.titleVi : template.titleEn}
                      </span>
                      <span className="px-1 py-0.2 bg-zinc-200 border border-zinc-900 font-pixel text-[8px] font-bold uppercase text-zinc-700">
                        {template.category}
                      </span>
                    </div>

                    <p className="text-[11px] font-mono text-zinc-600 mt-0.5 leading-snug">
                      {language === 'vi' ? template.descVi : template.descEn}
                    </p>

                    {/* Progress bar */}
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-2.5 flex-1 bg-zinc-200 border border-zinc-900">
                        <div
                          className={`h-full transition-all duration-300 ${
                            claimed || isCompleted
                              ? 'bg-emerald-500'
                              : 'bg-amber-400'
                          }`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] font-black text-zinc-800 shrink-0">
                        {progress}/{target}
                      </span>
                    </div>
                  </div>

                  {/* Nút hành động */}
                  <div className="shrink-0">
                    {claimed ? (
                      <div className="inline-flex items-center gap-1 bg-emerald-200 border-2 border-emerald-800 px-2 py-1.5 font-pixel text-[10px] font-bold text-emerald-950">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{language === 'vi' ? 'XONG' : 'DONE'}</span>
                      </div>
                    ) : isCompleted ? (
                      <button
                        type="button"
                        onClick={() => handleClaim(template.id)}
                        className="pixel-btn bg-amber-400 hover:bg-amber-300 text-zinc-950 px-2.5 py-2 font-pixel text-[10px] font-black flex items-center gap-1 animate-bounce shadow-[2px_2px_0px_#000]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>{language === 'vi' ? 'NHẬN' : 'CLAIM'}</span>
                      </button>
                    ) : (
                      <Link
                        href={template.route}
                        onClick={onClose}
                        className="pixel-btn bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-2 font-pixel text-[10px] font-bold inline-flex items-center gap-1 shadow-[2px_2px_0px_#000]"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>{language === 'vi' ? 'CHƠI' : 'PLAY'}</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-[11px] font-mono text-zinc-500 text-center leading-relaxed pt-1">
            💡{' '}
            {language === 'vi'
              ? 'Hoàn thành & nhận thưởng ít nhất 1 nhiệm vụ mỗi ngày để giữ chuỗi ngày chơi liên tiếp!'
              : 'Complete & claim at least 1 challenge each day to keep your Daily Streak burning!'}
          </p>
        </div>
      </div>
    </div>
  );
}
