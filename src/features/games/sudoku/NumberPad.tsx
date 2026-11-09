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
          className="flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white font-semibold text-gray-800 shadow-xs transition-all hover:bg-gray-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none disabled:opacity-40 disabled:pointer-events-none"
        >
          <Undo2 className="h-4.5 w-4.5 text-indigo-600" />
          <span className="text-xs sm:text-sm font-bold">{t.sudoku.undo}</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onErase}
          className="flex h-12 min-h-[44px] items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white font-semibold text-gray-800 shadow-xs transition-all hover:bg-gray-50 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none disabled:opacity-40 disabled:pointer-events-none"
        >
          <Delete className="h-4.5 w-4.5 text-red-500" />
          <span className="text-xs sm:text-sm font-bold">{t.sudoku.erase}</span>
        </button>
      </div>

      {/* 1-9 Number Buttons (Optimized for Mobile Thumb Taps) */}
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
              className={`flex min-h-[48px] sm:min-h-[54px] flex-col items-center justify-center rounded-xl py-2 transition-all active:scale-95 shadow-2xs border focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${
                isComplete
                  ? 'border-gray-200 bg-gray-100 text-gray-400 opacity-50 cursor-not-allowed'
                  : 'border-indigo-100/90 bg-white text-indigo-950 hover:bg-indigo-50 hover:border-indigo-300'
              }`}
            >
              <span className="text-lg sm:text-xl font-black">{num}</span>
              <span className="text-[10px] text-gray-400 font-semibold leading-none mt-0.5">
                {isComplete ? '✓' : 9 - count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

