'use client';

import React from 'react';
import { CellPosition, SudokuGrid } from './types';

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
  const selectedValue =
    selectedCell && board[selectedCell.row]
      ? board[selectedCell.row][selectedCell.col]
      : null;

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] select-none rounded-2xl border-2 border-gray-800 bg-white p-1.5 sm:p-2 shadow-md">
      {/* Paused Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl bg-white/95 backdrop-blur-sm">
          <p className="text-base font-bold text-gray-700">Trò chơi đang tạm dừng</p>
          <p className="mt-1 text-xs text-gray-500">Bấm Tiếp tục để chơi tiếp</p>
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
              r % 3 === 0 && r !== 0 ? 'border-t-2 border-t-gray-800' : 'border-t border-t-gray-200',
              c % 3 === 0 && c !== 0 ? 'border-l-2 border-l-gray-800' : 'border-l border-l-gray-200',
              r === 8 ? 'border-b' : '',
              c === 8 ? 'border-r' : '',
            ].join(' ');

            // Background highlighting
            let bgClass = 'bg-white';
            if (isError) {
              bgClass = 'bg-red-100';
            } else if (isSelected) {
              bgClass = 'bg-indigo-200';
            } else if (isSameNumber) {
              bgClass = 'bg-indigo-100';
            } else if (isRelated) {
              bgClass = 'bg-gray-50';
            }

            // Text styling
            let textClass = isInitial
              ? 'font-bold text-gray-900'
              : 'font-semibold text-indigo-700';
            if (isError) {
              textClass = 'font-bold text-red-600';
            }

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                onClick={() => onSelectCell({ row: r, col: c })}
                className={`flex items-center justify-center text-base sm:text-xl md:text-2xl transition-colors duration-100 focus:outline-none ${borderClasses} ${bgClass} ${textClass}`}
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

