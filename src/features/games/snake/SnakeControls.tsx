'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from './snakeLogic';
import { useLanguage } from '@/i18n/LanguageContext';

interface SnakeControlsProps {
  score: number;
  highScore: number;
  applesEaten: number;
  isPaused: boolean;
  isGameOver: boolean;
  onTogglePause: () => void;
  onRestart: () => void;
  onChangeDirection: (dir: Direction) => void;
}

export function SnakeControls({
  score,
  highScore,
  applesEaten,
  isPaused,
  isGameOver,
  onTogglePause,
  onRestart,
  onChangeDirection,
}: SnakeControlsProps) {
  const { language } = useLanguage();

  return (
    <div className="w-full max-w-[420px] mx-auto mt-3">
      {/* Top Bar: Điểm số, Kỷ lục & Nút thao tác */}
      <div className="flex items-center justify-between gap-2 bg-[#FFFDF8] border-2 border-zinc-900 p-2.5 shadow-pixel-xs mb-3">
        {/* Score & Apples */}
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] font-pixel text-zinc-500 uppercase tracking-wider block">
              {language === 'vi' ? 'ĐIỂM' : 'SCORE'}
            </span>
            <span className="font-pixel text-xl sm:text-2xl font-bold text-indigo-700 leading-none">
              {score}
            </span>
          </div>

          <div className="h-7 w-[2px] bg-zinc-300" />

          <div>
            <span className="text-[10px] font-pixel text-zinc-500 uppercase tracking-wider block">
              {language === 'vi' ? 'TÁO' : 'APPLES'}
            </span>
            <span className="font-mono text-sm font-bold text-zinc-800 leading-none">
              🍎 {applesEaten}
            </span>
          </div>
        </div>

        {/* High Score Badge */}
        <div className="pixel-badge flex items-center gap-1.5 bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-950 border border-amber-300">
          <Trophy className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <div>
            <span className="text-[9px] font-pixel text-amber-800 block">
              {language === 'vi' ? 'KỶ LỤC' : 'BEST'}
            </span>
            <span className="font-mono font-bold">{highScore}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onTogglePause}
            disabled={isGameOver}
            className="pixel-btn h-9 w-9 bg-zinc-900 text-amber-300 hover:bg-zinc-800 flex items-center justify-center disabled:opacity-50"
            title={isPaused ? 'Tiếp tục (Space)' : 'Tạm dừng (Space)'}
            aria-label={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
          >
            {isPaused ? <Play className="h-4 w-4 fill-current" /> : <Pause className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onRestart}
            className="pixel-btn h-9 w-9 bg-white text-zinc-900 hover:bg-amber-100 flex items-center justify-center"
            title="Chơi lại từ đầu"
            aria-label="Chơi lại"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* D-Pad cảm ứng cho di động */}
      <div className="mt-2 flex flex-col items-center justify-center sm:hidden select-none">
        <button
          type="button"
          onClick={() => onChangeDirection('UP')}
          className="pixel-btn flex h-14 w-16 items-center justify-center bg-zinc-900 text-amber-300 active:translate-y-1 shadow-[0_3px_0_0_#000]"
          aria-label="Lên"
        >
          <ArrowUp className="h-7 w-7" />
        </button>
        <div className="flex gap-4 my-1">
          <button
            type="button"
            onClick={() => onChangeDirection('LEFT')}
            className="pixel-btn flex h-14 w-16 items-center justify-center bg-zinc-900 text-amber-300 active:translate-y-1 shadow-[0_3px_0_0_#000]"
            aria-label="Trái"
          >
            <ArrowLeft className="h-7 w-7" />
          </button>
          <div className="h-14 w-14 rounded-full bg-zinc-800/40 border-2 border-dashed border-zinc-500 flex items-center justify-center text-[10px] font-pixel text-zinc-500">
            D-PAD
          </div>
          <button
            type="button"
            onClick={() => onChangeDirection('RIGHT')}
            className="pixel-btn flex h-14 w-16 items-center justify-center bg-zinc-900 text-amber-300 active:translate-y-1 shadow-[0_3px_0_0_#000]"
            aria-label="Phải"
          >
            <ArrowRight className="h-7 w-7" />
          </button>
        </div>
        <button
          type="button"
          onClick={() => onChangeDirection('DOWN')}
          className="pixel-btn flex h-14 w-16 items-center justify-center bg-zinc-900 text-amber-300 active:translate-y-1 shadow-[0_3px_0_0_#000]"
          aria-label="Xuống"
        >
          <ArrowDown className="h-7 w-7" />
        </button>
      </div>

      {/* Gợi ý phím bấm trên Desktop */}
      <p className="hidden sm:block text-center text-[11px] font-mono text-zinc-500 mt-2">
        Điều khiển bằng phím mũi tên <kbd className="px-1 py-0.5 bg-zinc-200 border border-zinc-400 font-bold">↑</kbd> <kbd className="px-1 py-0.5 bg-zinc-200 border border-zinc-400 font-bold">↓</kbd> <kbd className="px-1 py-0.5 bg-zinc-200 border border-zinc-400 font-bold">←</kbd> <kbd className="px-1 py-0.5 bg-zinc-200 border border-zinc-400 font-bold">→</kbd> hoặc <kbd className="px-1 py-0.5 bg-zinc-200 border border-zinc-400 font-bold">W</kbd> <kbd className="px-1 py-0.5 bg-zinc-200 border border-zinc-400 font-bold">A</kbd> <kbd className="px-1 py-0.5 bg-zinc-200 border border-zinc-400 font-bold">S</kbd> <kbd className="px-1 py-0.5 bg-zinc-200 border border-zinc-400 font-bold">D</kbd> • <kbd className="px-1 py-0.5 bg-zinc-200 border border-zinc-400 font-bold">Space</kbd> để tạm dừng
      </p>
    </div>
  );
}
