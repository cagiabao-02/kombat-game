'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, RotateCcw, ArrowLeft, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  applesEaten: number;
  isNewHighScore: boolean;
  prevHighScore: number;
  onPlayAgain: () => void;
}

export function GameOverModal({
  isOpen,
  score,
  highScore,
  applesEaten,
  isNewHighScore,
  prevHighScore,
  onPlayAgain,
}: GameOverModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in overflow-hidden">
      {/* Pháo hoa khi phá kỷ lục */}
      <PixelFxOverlay active={isOpen && isNewHighScore} />

      <div className="pixel-box-lg relative w-full max-w-sm bg-[#FFFDF8] p-6 text-center z-10 border-4 border-zinc-950 shadow-[0_8px_0_0_#18181b]">
        {/* Biểu tượng Game Over hoặc Kỷ lục */}
        <div
          className={`mx-auto flex h-16 w-16 items-center justify-center border-2 border-zinc-900 shadow-pixel-sm mb-3 ${
            isNewHighScore ? 'bg-amber-300 text-zinc-950 animate-bounce' : 'bg-rose-500 text-white'
          }`}
        >
          {isNewHighScore ? <Trophy className="h-8 w-8" /> : <span className="font-pixel text-2xl font-black">KO</span>}
        </div>

        {/* Huy hiệu Kỷ lục mới */}
        {isNewHighScore && (
          <div className="mb-2 inline-flex items-center gap-1.5 bg-amber-400 px-3 py-1 font-pixel text-xs font-bold text-zinc-950 border-2 border-zinc-900 shadow-pixel-xs animate-pulse">
            <Sparkles className="h-3.5 w-3.5" />
            <span>{language === 'vi' ? 'KỶ LỤC MỚI!' : 'NEW HIGH SCORE!'}</span>
          </div>
        )}

        <h3 className="font-pixel text-3xl font-bold text-zinc-950 uppercase tracking-wide">
          {isNewHighScore ? 'RECORD BREAKER!' : 'GAME OVER!'}
        </h3>

        {/* Bảng điểm */}
        <div className="my-4 grid grid-cols-2 gap-2 bg-[#ECE8DD] border-2 border-zinc-900 p-3 text-left">
          <div>
            <span className="text-[10px] font-pixel text-zinc-500 uppercase block">
              {language === 'vi' ? 'ĐIỂM ĐẠT ĐƯỢC' : 'FINAL SCORE'}
            </span>
            <span className="font-pixel text-2xl font-bold text-indigo-700">
              {score}
            </span>
          </div>
          <div>
            <span className="text-[10px] font-pixel text-zinc-500 uppercase block">
              {language === 'vi' ? 'KỶ LỤC CỦA BẠN' : 'YOUR RECORD'}
            </span>
            <span className="font-pixel text-2xl font-bold text-amber-600">
              {highScore}
            </span>
          </div>
          <div className="col-span-2 pt-2 border-t border-zinc-300 flex items-center justify-between text-xs font-mono text-zinc-700">
            <span>{language === 'vi' ? 'Tổng số táo ăn được:' : 'Total apples eaten:'}</span>
            <span className="font-bold">🍎 {applesEaten}</span>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="pixel-btn inline-flex w-full items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-amber-300"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{language === 'vi' ? 'CHƠI LẠI NGAY' : 'PLAY AGAIN'}</span>
          </button>

          <Link
            href="/"
            className="pixel-btn inline-flex w-full items-center justify-center gap-1.5 bg-white hover:bg-zinc-100 py-2.5 text-xs font-bold text-zinc-800"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{language === 'vi' ? 'VỀ SẢNH CHÍNH' : 'BACK TO LOBBY'}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
