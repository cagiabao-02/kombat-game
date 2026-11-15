'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { RotateCcw, Trophy, Sparkles, ArrowLeft } from 'lucide-react';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';

interface Game2048OverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  maxTile: number;
  isNewHighScore: boolean;
  onRestart: () => void;
}

export function Game2048OverModal({
  isOpen,
  score,
  highScore,
  maxTile,
  isNewHighScore,
  onRestart,
}: Game2048OverModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      <PixelFxOverlay active={isOpen && isNewHighScore} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-200">
        <div className="pixel-box-lg relative w-full max-w-sm overflow-hidden bg-[#FFFDF8] border-4 border-zinc-900 shadow-[8px_8px_0_0_#18181b] animate-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div
            className={`p-5 text-center border-b-2 border-zinc-900 ${
              isNewHighScore ? 'bg-amber-300' : 'bg-rose-500 text-white'
            }`}
          >
            <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg border-2 border-zinc-900 bg-white text-zinc-900 shadow-pixel-xs mb-2">
              {isNewHighScore ? (
                <Trophy className="h-8 w-8 fill-amber-400 text-amber-500 animate-bounce" />
              ) : (
                <span className="font-pixel text-2xl font-black">💀</span>
              )}
            </div>

            <h2
              className={`font-pixel text-lg font-black uppercase tracking-wider ${
                isNewHighScore ? 'text-zinc-900' : 'text-white'
              }`}
            >
              {isNewHighScore
                ? language === 'vi'
                  ? 'KỶ LỤC MỚI ĐƯỢC THIẾT LẬP!'
                  : 'NEW RECORD SET!'
                : language === 'vi'
                ? 'HẾT NƯỚC ĐI - GAME OVER'
                : 'NO MOVES LEFT - GAME OVER'}
            </h2>
          </div>

          {/* Body content */}
          <div className="p-5 space-y-4">
            {isNewHighScore && (
              <div className="flex items-center justify-center gap-1.5 bg-amber-100 border-2 border-amber-400 px-3 py-1.5 text-center text-xs font-mono font-bold text-amber-900 animate-pulse">
                <Sparkles className="h-4 w-4 text-amber-600" />
                <span>
                  {language === 'vi'
                    ? 'Tuyệt vời! Bạn vừa phá vỡ điểm số kỷ lục cũ!'
                    : 'Awesome! You broke your previous high score!'}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2.5 text-center">
              <div className="bg-zinc-100 p-2.5 border-2 border-zinc-900 shadow-pixel-xs">
                <span className="block font-pixel text-[10px] text-zinc-500 uppercase font-bold">
                  {language === 'vi' ? 'ĐIỂM ĐẠT ĐƯỢC' : 'FINAL SCORE'}
                </span>
                <span className="font-pixel text-xl font-black text-indigo-700">
                  {score.toLocaleString()}
                </span>
              </div>

              <div className="bg-amber-50 p-2.5 border-2 border-zinc-900 shadow-pixel-xs">
                <span className="block font-pixel text-[10px] text-amber-800 uppercase font-bold">
                  {language === 'vi' ? 'Ô CAO NHẤT' : 'MAX TILE'}
                </span>
                <span className="font-pixel text-xl font-black text-rose-600">
                  {maxTile}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between bg-zinc-50 px-3 py-2 border-2 border-zinc-900 text-xs font-mono">
              <span className="font-bold text-zinc-600">
                {language === 'vi' ? 'Kỷ lục cao nhất:' : 'All-time Best:'}
              </span>
              <span className="font-pixel text-sm font-bold text-amber-600">
                {highScore.toLocaleString()}
              </span>
            </div>

            {/* Action Buttons: Play Again & Return to Lobby */}
            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={onRestart}
                className="pixel-btn w-full flex items-center justify-center gap-2 bg-amber-300 text-zinc-950 hover:bg-amber-200 py-3 font-pixel text-xs font-black uppercase tracking-wider shadow-pixel-sm"
              >
                <RotateCcw className="h-4 w-4 stroke-[2.5]" />
                <span>{language === 'vi' ? 'CHƠI LẠI NGAY' : 'PLAY AGAIN'}</span>
              </button>

              <Link
                href="/"
                className="pixel-btn w-full flex items-center justify-center gap-1.5 bg-white text-zinc-900 hover:bg-zinc-100 py-2.5 font-pixel text-xs font-bold shadow-pixel-xs text-center"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>{language === 'vi' ? 'VỀ SẢNH CHÍNH' : 'BACK TO LOBBY'}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
