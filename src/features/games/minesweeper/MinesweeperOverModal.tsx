'use client';

import React from 'react';
import Link from 'next/link';
import { RotateCcw, ArrowLeft, Clock } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface MinesweeperOverModalProps {
  isOpen: boolean;
  timeSeconds: number;
  onPlayAgain: () => void;
}

export function MinesweeperOverModal({
  isOpen,
  timeSeconds,
  onPlayAgain,
}: MinesweeperOverModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in overflow-hidden">
      <div className="pixel-box-lg relative w-full max-w-sm bg-[#FFFDF8] p-6 text-center z-10 border-4 border-zinc-950 shadow-[0_8px_0_0_#18181b]">
        {/* Biểu tượng phát nổ */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-zinc-900 bg-rose-500 text-white shadow-pixel-sm mb-3">
          <span className="font-pixel text-3xl font-black">💥</span>
        </div>

        <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-zinc-950 uppercase tracking-wide">
          {language === 'vi' ? 'TRÚNG MÌN RỒI!' : 'BOOM! GAME OVER'}
        </h3>
        <p className="mt-1 font-mono text-xs text-zinc-600">
          {language === 'vi'
            ? 'Bạn đã vô tình đạp trúng mìn. Hãy cẩn thận hơn ở ván sau!'
            : 'You stepped on a mine. Watch your step next time!'}
        </p>

        {/* Thông tin ván đấu */}
        <div className="my-4 bg-[#ECE8DD] border-2 border-zinc-900 p-3 text-center">
          <span className="text-[10px] font-pixel text-zinc-600 uppercase">
            {language === 'vi' ? 'Thời gian sống sót:' : 'Time Survived:'}
          </span>
          <div className="flex items-center justify-center gap-1.5 text-zinc-900 font-mono text-xl font-bold mt-0.5">
            <Clock className="h-4 w-4 text-zinc-600" />
            <span>{timeSeconds} giây</span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold py-3 text-sm border-2 border-zinc-900 shadow-pixel-sm active:translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{language === 'vi' ? 'THỬ LẠI NGAY' : 'TRY AGAIN'}</span>
          </button>

          <Link
            href="/"
            className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 font-bold py-2.5 text-xs border-2 border-zinc-900 shadow-pixel-xs active:translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{language === 'vi' ? 'VỀ SẢNH CHÍNH' : 'BACK TO LOBBY'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
