'use client';

import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Direction } from './game2048Logic';
import {
  RotateCcw,
  Undo2,
  Trophy,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  Flame,
} from 'lucide-react';

interface Game2048ControlsProps {
  score: number;
  highScore: number;
  maxTile: number;
  canUndo: boolean;
  onUndo: () => void;
  onRestart: () => void;
  onMove: (dir: Direction) => void;
  disabled?: boolean;
}

export function Game2048Controls({
  score,
  highScore,
  maxTile,
  canUndo,
  onUndo,
  onRestart,
  onMove,
  disabled = false,
}: Game2048ControlsProps) {
  const { language } = useLanguage();

  return (
    <div className="w-full max-w-[360px] sm:max-w-[420px] mx-auto space-y-3">
      {/* Score Board Bar */}
      <div className="grid grid-cols-3 gap-2">
        {/* Điểm hiện tại */}
        <div className="pixel-card bg-white p-2 text-center border-2 border-zinc-900 shadow-pixel-xs">
          <span className="block font-pixel text-[10px] text-zinc-500 uppercase font-bold">
            {language === 'vi' ? 'ĐIỂM SỐ' : 'SCORE'}
          </span>
          <span className="font-pixel text-lg sm:text-xl font-black text-indigo-700">
            {score.toLocaleString()}
          </span>
        </div>

        {/* Kỷ lục High Score */}
        <div className="pixel-card bg-amber-100 p-2 text-center border-2 border-zinc-900 shadow-pixel-xs">
          <span className="block font-pixel text-[10px] text-amber-800 uppercase font-bold flex items-center justify-center gap-1">
            <Trophy className="h-3 w-3 fill-amber-500 text-amber-600" />
            {language === 'vi' ? 'KỶ LỤC' : 'BEST'}
          </span>
          <span className="font-pixel text-lg sm:text-xl font-black text-amber-700">
            {highScore.toLocaleString()}
          </span>
        </div>

        {/* Ô lớn nhất hiện tại */}
        <div className="pixel-card bg-rose-50 p-2 text-center border-2 border-zinc-900 shadow-pixel-xs">
          <span className="block font-pixel text-[10px] text-rose-800 uppercase font-bold flex items-center justify-center gap-1">
            <Flame className="h-3 w-3 fill-rose-500 text-rose-600" />
            {language === 'vi' ? 'Ô LỚN NHẤT' : 'MAX TILE'}
          </span>
          <span className="font-pixel text-lg sm:text-xl font-black text-rose-700">
            {maxTile || 2}
          </span>
        </div>
      </div>

      {/* Action Buttons: Undo & Restart */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onUndo}
          disabled={!canUndo || disabled}
          className={`pixel-btn flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-bold ${
            canUndo && !disabled
              ? 'bg-amber-300 text-zinc-900 hover:bg-amber-200'
              : 'bg-zinc-200 text-zinc-400 cursor-not-allowed opacity-60'
          }`}
          title={language === 'vi' ? 'Lùi lại 1 nước đi (Phím Z hoặc U)' : 'Undo 1 move (Z or U key)'}
        >
          <Undo2 className="h-4 w-4" />
          <span>{language === 'vi' ? 'Về 1 bước' : 'Undo (1 Step)'}</span>
        </button>

        <button
          type="button"
          onClick={onRestart}
          className="pixel-btn flex-1 flex items-center justify-center gap-1.5 bg-white text-zinc-900 hover:bg-zinc-100 py-2 px-3 text-xs font-bold"
        >
          <RotateCcw className="h-4 w-4" />
          <span>{language === 'vi' ? 'Ván mới' : 'New Game'}</span>
        </button>
      </div>

      {/* D-Pad Virtual Controller for Mobile Accessibility */}
      <div className="pt-1 block sm:hidden">
        <div className="mx-auto flex flex-col items-center">
          {/* Nút LÊN */}
          <button
            type="button"
            onClick={() => onMove('UP')}
            disabled={disabled}
            className="pixel-btn flex h-12 w-14 items-center justify-center bg-zinc-800 text-amber-300 active:bg-zinc-700 border-2 border-zinc-950 shadow-pixel-xs"
            aria-label="Lên"
          >
            <ArrowUp className="h-6 w-6 stroke-[3]" />
          </button>

          {/* Hàng ngang: TRÁI - DƯỚI - PHẢI */}
          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={() => onMove('LEFT')}
              disabled={disabled}
              className="pixel-btn flex h-12 w-14 items-center justify-center bg-zinc-800 text-amber-300 active:bg-zinc-700 border-2 border-zinc-950 shadow-pixel-xs"
              aria-label="Trái"
            >
              <ArrowLeft className="h-6 w-6 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={() => onMove('DOWN')}
              disabled={disabled}
              className="pixel-btn flex h-12 w-14 items-center justify-center bg-zinc-800 text-amber-300 active:bg-zinc-700 border-2 border-zinc-950 shadow-pixel-xs"
              aria-label="Xuống"
            >
              <ArrowDown className="h-6 w-6 stroke-[3]" />
            </button>

            <button
              type="button"
              onClick={() => onMove('RIGHT')}
              disabled={disabled}
              className="pixel-btn flex h-12 w-14 items-center justify-center bg-zinc-800 text-amber-300 active:bg-zinc-700 border-2 border-zinc-950 shadow-pixel-xs"
              aria-label="Phải"
            >
              <ArrowRight className="h-6 w-6 stroke-[3]" />
            </button>
          </div>
        </div>
      </div>

      {/* Desktop Keyboard instructions */}
      <div className="hidden sm:flex items-center justify-between text-[11px] font-mono text-zinc-500 bg-zinc-100 px-3 py-1.5 border border-zinc-300 rounded">
        <span>🎮 {language === 'vi' ? 'Phím mũi tên / WASD để trượt' : 'Arrow keys / WASD to slide'}</span>
        <span>↩️ {language === 'vi' ? 'Z hoặc U để lùi bước' : 'Z or U to undo'}</span>
      </div>
    </div>
  );
}
