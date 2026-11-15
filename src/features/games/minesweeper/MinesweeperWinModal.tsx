'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, RotateCcw, ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import { MinesweeperDifficulty, DIFFICULTIES } from './minesweeperLogic';

interface MinesweeperWinModalProps {
  isOpen: boolean;
  timeSeconds: number;
  difficulty: MinesweeperDifficulty;
  isNewRecord: boolean;
  prevRecord: number | null;
  onPlayAgain: () => void;
}

export function MinesweeperWinModal({
  isOpen,
  timeSeconds,
  difficulty,
  isNewRecord,
  prevRecord,
  onPlayAgain,
}: MinesweeperWinModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const diffConfig = DIFFICULTIES[difficulty];
  const diffName = language === 'vi' ? diffConfig.nameVi : diffConfig.nameEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in overflow-hidden">
      {/* Pháo hoa pixel ăn mừng chiến thắng */}
      <PixelFxOverlay active={isOpen} />

      <div className="pixel-box-lg relative w-full max-w-sm bg-[#FFFDF8] p-6 text-center z-10 border-4 border-zinc-950 shadow-[0_8px_0_0_#18181b]">
        {/* Biểu tượng cúp vinh quang */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-zinc-900 bg-amber-300 text-zinc-950 shadow-pixel-sm mb-3 animate-bounce">
          <Trophy className="h-8 w-8" />
        </div>

        {/* Huy hiệu Kỷ lục mới */}
        {isNewRecord && (
          <div className="mb-2 inline-flex items-center gap-1.5 bg-amber-400 px-3 py-1 font-pixel text-xs font-bold text-zinc-950 border-2 border-zinc-900 shadow-pixel-xs animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{language === 'vi' ? 'KỶ LỤC MỚI!' : 'NEW BEST TIME!'}</span>
          </div>
        )}

        <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-zinc-950 uppercase tracking-wide">
          {language === 'vi' ? 'GỠ MÌN THÀNH CÔNG!' : 'MINES CLEARED!'}
        </h3>
        <p className="mt-1 font-mono text-xs text-zinc-600">
          {language === 'vi'
            ? `Bạn đã phá đảo an toàn cấp độ ${diffName}`
            : `You safely cleared ${diffName}`}
        </p>

        {/* Bảng thông số kết quả */}
        <div className="my-4 grid grid-cols-2 gap-2 bg-[#ECE8DD] border-2 border-zinc-900 p-3 text-left">
          <div className="flex flex-col">
            <span className="text-[10px] font-pixel text-zinc-600 uppercase">
              {language === 'vi' ? 'Thời gian:' : 'Time:'}
            </span>
            <div className="flex items-center gap-1 text-emerald-700 font-mono text-lg font-bold">
              <Clock className="h-4 w-4" />
              <span>{timeSeconds}s</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-pixel text-zinc-600 uppercase">
              {language === 'vi' ? 'Kỷ lục trước:' : 'Previous Best:'}
            </span>
            <div className="flex items-center gap-1 text-zinc-800 font-mono text-lg font-bold">
              <Trophy className="h-4 w-4 text-amber-600" />
              <span>{prevRecord !== null ? `${prevRecord}s` : '--'}</span>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold py-3 text-sm border-2 border-zinc-900 shadow-pixel-sm active:translate-y-0.5"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{language === 'vi' ? 'CHƠI LẠI NGAY' : 'PLAY AGAIN'}</span>
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
