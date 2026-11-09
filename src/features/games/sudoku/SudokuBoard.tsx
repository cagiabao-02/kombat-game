'use client';

import React from 'react';
import { CellPosition, SudokuGrid } from './types';
import { useLanguage } from '@/i18n/LanguageContext';

interface SudokuBoardProps {
  board: SudokuGrid;
  initialBoard: SudokuGrid;
  selectedCell: CellPosition | null;
  conflictingCells: Set<string>;
  highlightErrors: boolean;
  isPaused: boolean;
  onSelectCell: (pos: CellPosition) => void;
}

export function SudokuBoard({
  board,
  initialBoard,
  selectedCell,
  conflictingCells,
  highlightErrors,
  isPaused,
  onSelectCell,
}: SudokuBoardProps) {
  const { language, t } = useLanguage();

  const selectedValue =
    selectedCell && board[selectedCell.row]
      ? board[selectedCell.row][selectedCell.col]
      : null;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] select-none rounded-2xl border-2 border-gray-900 bg-white p-1 sm:p-2 shadow-lg">
      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-sm p-4 text-center">
          <p className="text-base sm:text-lg font-bold text-gray-800">
            {t.sudoku.pausedOverlay}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            {language === 'vi' ? 'Bấm nút Tiếp tục để chơi tiếp' : 'Click Resume to continue playing'}
          </p>
        </div>
      )}

      <div className="grid h-full w-full grid-cols-9 grid-rows-9">
        {board.map((row, r) =>
          row.map((val, c) => {
            const isInitial = initialBoard[r]?.[c] !== null;
            const isSelected = selectedCell?.row === r && selectedCell?.col === c;
            const isRelated =
              selectedCell &&
              (selectedCell.row === r ||
                selectedCell.col === c ||
                (Math.floor(selectedCell.row / 3) === Math.floor(r / 3) &&
                  Math.floor(selectedCell.col / 3) === Math.floor(c / 3)));
            const isSameNumber =
              selectedValue !== null && val !== null && val === selectedValue;
            const isError = highlightErrors && conflictingCells.has(`${r}-${c}`);

            // Border styling to mark 3x3 box borders
            const borderClasses = [
              r % 3 === 0 && r !== 0 ? 'border-t-2 border-t-gray-900' : 'border-t border-t-gray-200',
              c % 3 === 0 && c !== 0 ? 'border-l-2 border-l-gray-900' : 'border-l border-l-gray-200',
              r === 8 ? 'border-b border-b-gray-900' : '',
              c === 8 ? 'border-r border-r-gray-900' : '',
            ].join(' ');

            // High-contrast background and text hierarchy
            let bgClass = 'bg-white hover:bg-indigo-50/30';
            let textClass = isInitial
              ? 'font-black text-gray-950'
              : 'font-bold text-indigo-700';

            if (isError) {
              bgClass = 'bg-red-100/90 ring-1 ring-inset ring-red-400';
              textClass = 'font-black text-red-700';
            } else if (isSelected) {
              bgClass = 'bg-indigo-600 shadow-inner';
              textClass = 'font-black text-white';
            } else if (isSameNumber) {
              bgClass = 'bg-indigo-100/90 ring-1 ring-inset ring-indigo-300';
              textClass = isInitial ? 'font-black text-indigo-950' : 'font-black text-indigo-800';
            } else if (isRelated) {
              bgClass = 'bg-indigo-50/40';
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => onSelectCell({ row: r, col: c })}
                className={`flex items-center justify-center text-lg sm:text-xl md:text-2xl transition-all duration-100 active:scale-95 focus:outline-none ${borderClasses} ${bgClass} ${textClass}`}
                aria-label={`Row ${r + 1}, Column ${c + 1}: ${val ?? 'empty'}`}
              >
                {val !== null ? val : ''}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

