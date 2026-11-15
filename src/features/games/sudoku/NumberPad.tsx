'use client';

import React from 'react';
import { Undo2, Delete } from 'lucide-react';
import { SudokuGrid } from './types';
import { useLanguage } from '@/i18n/LanguageContext';

interface NumberPadProps {
  board: SudokuGrid;
  onInputNumber: (num: number) => void;
  onErase: () => void;
  onUndo: () => void;
  canUndo: boolean;
  disabled?: boolean;
}

export function NumberPad({
  board,
  onInputNumber,
  onErase,
  onUndo,
  canUndo,
  disabled = false,
}: NumberPadProps) {
  const { t } = useLanguage();

  // Count how many of each number (1-9) are placed on board
  const counts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  };

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r]?.[c];
      if (val && val >= 1 && val <= 9) {
        counts[val]++;
      }
    }
  }

  return (
    <div className="mx-auto w-full max-w-[460px] select-none pt-4">
      {/* Quick Action Buttons (Undo & Erase) with 44px+ touch target */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!canUndo || disabled}
          onClick={onUndo}
          className="pixel-btn flex h-12 min-h-[44px] items-center justify-center gap-2 bg-white hover:bg-indigo-50 font-bold text-zinc-900 outline-none disabled:opacity-40 disabled:pointer-events-none"
        >
          <Undo2 className="h-4.5 w-4.5 text-indigo-700" />
          <span className="text-xs sm:text-sm font-bold">{t.sudoku.undo}</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onErase}
          className="pixel-btn flex h-12 min-h-[44px] items-center justify-center gap-2 bg-white hover:bg-rose-50 font-bold text-zinc-900 outline-none disabled:opacity-40 disabled:pointer-events-none"
        >
          <Delete className="h-4.5 w-4.5 text-rose-600" />
          <span className="text-xs sm:text-sm font-bold">{t.sudoku.erase}</span>
        </button>
      </div>

      {/* 1-9 Mechanical Pixel Number Buttons */}
      <div className="grid grid-cols-9 gap-1 sm:gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const count = counts[num] || 0;
          const isComplete = count >= 9;

          return (
            <button
              key={num}
              type="button"
              disabled={disabled || isComplete}
              onClick={() => onInputNumber(num)}
              className={`pixel-btn flex min-h-[48px] sm:min-h-[54px] flex-col items-center justify-center py-2 outline-none ${
                isComplete
                  ? 'bg-zinc-200 text-zinc-400 opacity-50 cursor-not-allowed'
                  : 'bg-[#FFFDF8] text-zinc-950 hover:bg-amber-200'
              }`}
            >
              <span className="font-pixel text-lg sm:text-xl font-bold leading-none">{num}</span>
              <span className="font-mono text-[10px] text-zinc-500 font-bold leading-none mt-1">
                {isComplete ? '✓' : 9 - count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
