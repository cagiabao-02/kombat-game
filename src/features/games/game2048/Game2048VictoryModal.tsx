'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Trophy, Play, RotateCcw, ArrowLeft } from 'lucide-react';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';

interface Game2048VictoryModalProps {
  isOpen: boolean;
  score: number;
  maxTile: number;
  onContinue: () => void;
  onRestart: () => void;
}

export function Game2048VictoryModal({
  isOpen,
  score,
  maxTile,
  onContinue,
  onRestart,
}: Game2048VictoryModalProps) {
  const { language } = useLanguage();

  if (!isOpen) return null;

  return (
    <>
      <PixelFxOverlay active={isOpen} />
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-200">
        <div className="pixel-box-lg relative w-full max-w-sm overflow-hidden bg-[#FFFDF8] border-4 border-zinc-900 shadow-[8px_8px_0_0_#18181b] animate-in zoom-in-95 duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400 p-5 text-center border-b-2 border-zinc-900">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-lg border-2 border-zinc-900 bg-rose-600 text-amber-200 shadow-pixel-sm mb-2 animate-bounce">
              <span className="font-pixel text-xl font-black">2048</span>
            </div>
            <h2 className="font-pixel text-xl font-black uppercase tracking-wider text-zinc-900">
              {language === 'vi' ? 'BẠN ĐÃ CHIẾN THẮNG!' : 'YOU WON!'}
            </h2>
            <p className="font-mono text-xs font-bold text-zinc-800 mt-1">
              {language === 'vi'
                ? 'Chúc mừng bạn đã tạo thành công viên gạch 2048 huyền thoại!'
                : 'Congratulations! You successfully reached the legendary 2048 tile!'}
            </p>
          </div>

          {/* Stats Summary */}
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-zinc-100 p-2.5 border-2 border-zinc-900 shadow-pixel-xs">
                <span className="block font-pixel text-[10px] text-zinc-500 uppercase font-bold">
                  {language === 'vi' ? 'ĐIỂM HIỆN TẠI' : 'CURRENT SCORE'}
                </span>
                <span className="font-pixel text-lg font-black text-indigo-700">
                  {score.toLocaleString()}
                </span>
              </div>

              <div className="bg-amber-50 p-2.5 border-2 border-zinc-900 shadow-pixel-xs">
                <span className="block font-pixel text-[10px] text-amber-800 uppercase font-bold">
                  {language === 'vi' ? 'Ô CAO NHẤT' : 'MAX TILE'}
                </span>
                <span className="font-pixel text-lg font-black text-rose-600">
                  {maxTile}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={onContinue}
                className="pixel-btn w-full flex items-center justify-center gap-2 bg-emerald-400 text-zinc-950 hover:bg-emerald-300 py-3 font-pixel text-xs font-black uppercase tracking-wider shadow-pixel-sm"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{language === 'vi' ? 'TIẾP TỤC CHƠI (HƯỚNG TỚI 4096)' : 'KEEP GOING (AIM 4096)'}</span>
              </button>

              <button
                type="button"
                onClick={onRestart}
                className="pixel-btn w-full flex items-center justify-center gap-2 bg-white text-zinc-900 hover:bg-zinc-100 py-2.5 font-pixel text-xs font-bold"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{language === 'vi' ? 'BẮT ĐẦU VÁN MỚI' : 'START NEW GAME'}</span>
              </button>

              <Link
                href="/"
                className="pixel-btn w-full flex items-center justify-center gap-1.5 bg-zinc-100 text-zinc-800 hover:bg-zinc-200 py-2.5 font-pixel text-xs font-bold text-center"
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
