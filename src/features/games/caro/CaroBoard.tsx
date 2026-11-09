'use client';

import React from 'react';
import { CARO_BOARD_SIZE, CaroBoard as BoardType, CaroPiece } from './types';

interface CaroBoardProps {
  board: BoardType;
  lastMove: { row: number; col: number } | null;
  winningLine: { row: number; col: number }[] | null;
  disabled?: boolean;
  onCellClick: (row: number, col: number) => void;
}

// 5 điểm sao truyền thống định vị bàn cờ (Hoshi & Tengen) trên lưới 15x15 (index 0-14)
const STAR_POINTS = new Set(['3-3', '3-11', '7-7', '11-3', '11-11']);

export function CaroBoard({
  board,
  lastMove,
  winningLine,
  disabled = false,
  onCellClick,
}: CaroBoardProps) {
  const winningSet = React.useMemo(() => {
    if (!winningLine) return new Set<string>();
    return new Set(winningLine.map((p) => `${p.row}-${p.col}`));
  }, [winningLine]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[min(92vw,500px)] select-none rounded-2xl border-4 border-[#8a5229] bg-[#eec590] p-1.5 sm:p-2.5 shadow-2xl ring-1 ring-black/20">
      {/* 15x15 Grid with inline styles to guarantee exact 15 columns & 15 rows */}
      <div
        className="h-full w-full bg-[#f5d9aa] rounded-xl overflow-hidden border border-[#8a5229]/60 shadow-inner"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
          gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
        }}
      >
        {board.map((row, r) =>
          row.map((cell, c) => {
            const isLastMove = lastMove?.row === r && lastMove?.col === c;
            const isWinningCell = winningSet.has(`${r}-${c}`);
            const isStar = STAR_POINTS.has(`${r}-${c}`);

            return (
              <button
                key={`${r}-${c}`}
                type="button"
                disabled={disabled || cell !== null}
                onClick={() => onCellClick(r, c)}
                className={`group relative flex items-center justify-center border border-[#8a5229]/35 transition-colors duration-100 outline-none focus:outline-none p-0 m-0 ${
                  cell === null && !disabled
                    ? 'hover:bg-[#ffebc8] active:bg-[#e0b47b] cursor-pointer'
                    : 'cursor-default'
                } ${isWinningCell ? 'bg-amber-300/80 animate-pulse' : ''}`}
                aria-label={`Ô ${r + 1}, ${c + 1}: ${cell ?? 'trống'}`}
              >
                {/* Điểm sao định vị (Hoshi) trên các vị trí truyền thống */}
                {isStar && cell === null && (
                  <span className="pointer-events-none absolute h-1.5 w-1.5 rounded-full bg-[#8a5229]/70" />
                )}

                {/* Dấu chấm mờ khi hover chuột (Desktop) */}
                {cell === null && !disabled && (
                  <span className="pointer-events-none hidden group-hover:block h-2 w-2 rounded-full bg-amber-900/25" />
                )}

                {/* Quân cờ X hoặc O */}
                {cell !== null && (
                  <div
                    className={`relative flex h-full w-full items-center justify-center font-black select-none transition-transform ${
                      isWinningCell
                        ? 'scale-110 z-20 font-black text-amber-950'
                        : isLastMove
                        ? 'scale-105 z-10'
                        : ''
                    }`}
                  >
                    {cell === 'X' ? (
                      <span className="text-base sm:text-xl md:text-2xl font-black text-rose-600 drop-shadow-sm leading-none">
                        ✕
                      </span>
                    ) : (
                      <span className="text-base sm:text-xl md:text-2xl font-black text-indigo-700 drop-shadow-sm leading-none">
                        ◯
                      </span>
                    )}

                    {/* Vòng sáng đánh dấu nước đi gần nhất */}
                    {isLastMove && !isWinningCell && (
                      <span className="pointer-events-none absolute inset-0.5 rounded-full border-2 border-amber-600 animate-ping opacity-70" />
                    )}
                  </div>
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
