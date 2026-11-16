'use client';

import React, { useEffect, useState } from 'react';
import { Achievement, AchievementTier } from './types';
import { useLanguage } from '@/i18n/LanguageContext';
import { Sparkles, X } from 'lucide-react';

const TIER_STYLES: Record<
  AchievementTier,
  {
    border: string;
    bg: string;
    badgeBg: string;
    badgeText: string;
    label: { vi: string; en: string };
  }
> = {
  bronze: {
    border: 'border-[#b08d57]',
    bg: 'bg-[#fffbf0]',
    badgeBg: 'bg-[#b08d57]',
    badgeText: 'text-white',
    label: { vi: 'HUY CHƯƠNG ĐỒNG', en: 'BRONZE BADGE' },
  },
  silver: {
    border: 'border-[#94a3b8]',
    bg: 'bg-[#f8fafc]',
    badgeBg: 'bg-[#64748b]',
    badgeText: 'text-white',
    label: { vi: 'HUY CHƯƠNG BẠC', en: 'SILVER BADGE' },
  },
  gold: {
    border: 'border-[#f59e0b]',
    bg: 'bg-[#fffbeb]',
    badgeBg: 'bg-[#f59e0b]',
    badgeText: 'text-zinc-950',
    label: { vi: 'HUY HIỆU VÀNG', en: 'GOLD BADGE' },
  },
  platinum: {
    border: 'border-[#818cf8]',
    bg: 'bg-[#f5f3ff]',
    badgeBg: 'bg-[#6366f1]',
    badgeText: 'text-white',
    label: { vi: 'BẠCH KIM HUYỀN THOẠI', en: 'PLATINUM BADGE' },
  },
};

export function AchievementToast() {
  const { language } = useLanguage();
  const [queue, setQueue] = useState<Achievement[]>([]);
  const [current, setCurrent] = useState<Achievement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Lắng nghe sự kiện mở khóa huy hiệu
  useEffect(() => {
    const handleUnlock = (e: Event) => {
      const customEvent = e as CustomEvent<Achievement>;
      if (customEvent.detail) {
        setQueue((prev) => [...prev, customEvent.detail]);
      }
    };

    window.addEventListener('kombat:achievement_unlocked', handleUnlock);
    return () => {
      window.removeEventListener('kombat:achievement_unlocked', handleUnlock);
    };
  }, []);

  // Xử lý hàng đợi hiển thị
  useEffect(() => {
    if (!current && queue.length > 0) {
      const next = queue[0];
      setQueue((prev) => prev.slice(1));
      setCurrent(next);
      setIsVisible(true);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          setCurrent(null);
        }, 300); // Đợi kết thúc hiệu ứng trượt ra
      }, 4200);

      return () => clearTimeout(timer);
    }
  }, [current, queue]);

  if (!current) return null;

  const tier = TIER_STYLES[current.tier] || TIER_STYLES.bronze;

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      setCurrent(null);
    }, 300);
  };

  return (
    <aside
      aria-label="Thông báo thành tựu mở khóa"
      className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md transition-all duration-300 ease-out pointer-events-auto ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-8 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div
        className={`relative flex items-center gap-3 p-3.5 border-4 ${tier.border} ${tier.bg} shadow-pixel-lg`}
      >
        {/* Shimmering Badge Icon */}
        <div className="relative flex-shrink-0 flex items-center justify-center w-14 h-14 bg-white border-2 border-zinc-900 shadow-pixel-sm">
          <span className="text-3xl filter drop-shadow animate-bounce">
            {current.icon}
          </span>
          <span className="absolute -top-1 -right-1 text-amber-500 animate-spin">
            <Sparkles className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-6">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span
              className={`px-1.5 py-0.2 font-pixel text-[9px] font-bold ${tier.badgeBg} ${tier.badgeText} rounded-none border border-zinc-900`}
            >
              {tier.label[language]}
            </span>
            <span className="font-pixel text-[10px] text-emerald-600 font-bold tracking-wider">
              {language === 'vi' ? 'MỚI MỞ KHÓA!' : 'UNLOCKED!'}
            </span>
          </div>

          <h4 className="font-pixel text-sm font-bold text-zinc-900 truncate">
            {current.title[language]}
          </h4>
          <p className="text-[11px] font-mono text-zinc-600 line-clamp-2 leading-tight mt-0.5">
            {current.description[language]}
          </p>
        </div>

        {/* Dismiss Button */}
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Đóng thông báo"
          className="absolute top-2 right-2 p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/50 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
