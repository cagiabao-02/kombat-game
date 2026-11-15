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
    <div className="relative mx-auto aspect-square w-full max-w-[460px] select-none border-[3px] border-zinc-900 bg-[#8B956D] p-1.5 sm:p-2.5 shadow-pixel-lg">
      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#D4DFB8] border-2 border-zinc-900 p-4 text-center">
          <p className="font-pixel text-xl sm:text-2xl font-bold text-zinc-950 uppercase tracking-wider">
            [ {t.sudoku.pausedOverlay} ]
          </p>
          <p className="mt-2 text-xs font-mono font-bold text-zinc-700">
            {language === 'vi' ? 'Bấm nút Tiếp tục để chơi tiếp' : 'Click Resume to continue playing'}
          </p>
        </div>
      )}

      <div className="grid h-full w-full grid-cols-9 grid-rows-9 border-2 border-zinc-900 bg-[#FFFDF8]">
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

            // Border styling to mark 3x3 box borders with crisp pixel lines
            const borderClasses = [
              r % 3 === 0 && r !== 0 ? 'border-t-[2.5px] border-t-zinc-900' : 'border-t border-t-zinc-300',
              c % 3 === 0 && c !== 0 ? 'border-l-[2.5px] border-l-zinc-900' : 'border-l border-l-zinc-300',
            ].join(' ');

            // High-contrast Neo-Arcade background and text hierarchy (font-mono for unmistakable 1, 2, 5, 7)
            let bgClass = 'bg-[#FFFDF8] hover:bg-amber-50';
            let textClass = isInitial
              ? 'font-mono font-black text-zinc-950'
              : 'font-mono font-black text-indigo-700';

            if (isError) {
              bgClass = 'bg-rose-200 ring-2 ring-inset ring-rose-600';
              textClass = 'font-mono font-black text-rose-800';
            } else if (isSelected) {
              bgClass = 'bg-indigo-600';
              textClass = 'font-mono font-black text-amber-300';
            } else if (isSameNumber) {
              bgClass = 'bg-amber-200 ring-1 ring-inset ring-zinc-900';
              textClass = 'font-mono font-black text-zinc-950';
            } else if (isRelated) {
              bgClass = 'bg-[#ECE8DD]';
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => onSelectCell({ row: r, col: c })}
                className={`flex items-center justify-center text-lg sm:text-xl md:text-2xl focus:outline-none ${borderClasses} ${bgClass} ${textClass}`}
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
