'use client';

import React from 'react';
import { Undo2, Delete } from 'lucide-react';
import { SudokuGrid } from './types';

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
      {/* Quick Action Buttons (Undo & Erase) */}
      <div className="mb-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={!canUndo || disabled}
          onClick={onUndo}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Undo2 className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Hoàn tác</span>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={onErase}
          className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-40 disabled:pointer-events-none"
        >
          <Delete className="h-4 w-4" />
          <span className="text-xs sm:text-sm">Xóa ô</span>
        </button>
      </div>

      {/* 1-9 Number Buttons */}
      <div className="grid grid-cols-9 gap-1 sm:gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const count = counts[num] || 0;
          const isComplete = count >= 9;

          return (
            <button
              key={num}
              type="button"
              disabled={disabled || isComplete}
              onClick={() => onInputNumber(num)}
              className={`flex flex-col items-center justify-center rounded-xl py-2 sm:py-2.5 transition-all active:scale-95 shadow-sm border ${
                isComplete
                  ? 'border-gray-200 bg-gray-100 text-gray-400 opacity-60'
                  : 'border-indigo-100 bg-white text-indigo-900 hover:bg-indigo-50 hover:border-indigo-300'
              }`}
            >
              <span className="text-lg sm:text-xl font-bold">{num}</span>
              <span className="text-[10px] text-gray-400 font-medium leading-none mt-0.5">
                {isComplete ? '✓' : 9 - count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

