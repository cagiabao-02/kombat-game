'use client';

import React from 'react';
import { CaroBoard as BoardType } from './types';

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
    <div className="relative mx-auto aspect-square w-full max-w-[min(92vw,500px)] select-none border-[3px] border-zinc-900 bg-[#C2854C] p-1.5 sm:p-2.5 shadow-pixel-lg">
      {/* Corner pixel bolts */}
      <span className="absolute top-1 left-1 h-1.5 w-1.5 bg-zinc-900" />
      <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-zinc-900" />
      <span className="absolute bottom-1 left-1 h-1.5 w-1.5 bg-zinc-900" />
      <span className="absolute bottom-1 right-1 h-1.5 w-1.5 bg-zinc-900" />

      {/* 15x15 Grid with inline styles to guarantee exact 15 columns & 15 rows */}
      <div
        className="h-full w-full bg-[#F3DCAB] overflow-hidden border-2 border-zinc-900"
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
                className={`group relative flex items-center justify-center border border-[#8A5229]/45 outline-none focus:outline-none p-0 m-0 ${
                  cell === null && !disabled
                    ? 'hover:bg-[#FFEBC2] active:bg-[#D9B675] cursor-pointer'
                    : 'cursor-default'
                } ${isWinningCell ? 'bg-amber-300 animate-pulse' : isLastMove ? 'bg-amber-200/70' : ''}`}
                aria-label={`Ô ${r + 1}, ${c + 1}: ${cell ?? 'trống'}`}
              >
                {/* Điểm sao định vị Pixel vuông (Hoshi) */}
                {isStar && cell === null && (
                  <span className="pointer-events-none absolute h-1.5 w-1.5 bg-[#6E3F1D]" />
                )}

                {/* Dấu vuông mờ khi hover chuột (Desktop) */}
                {cell === null && !disabled && (
                  <span className="pointer-events-none hidden group-hover:block h-2 w-2 bg-zinc-900/35" />
                )}

                {/* Quân cờ X hoặc O dạng 8-bit Pixel Sprite */}
                {cell !== null && (
                  <div
                    className={`relative flex h-full w-full items-center justify-center select-none ${
                      isWinningCell ? 'scale-110 z-20' : isLastMove ? 'scale-105 z-10' : ''
                    }`}
                  >
                    {cell === 'X' ? (
                      <svg
                        viewBox="0 0 8 8"
                        className="h-[74%] w-[74%] pixelated drop-shadow-[1px_1px_0px_#18181B]"
                        shapeRendering="crispEdges"
                      >
                        <path
                          fill="#E11D48"
                          d="M1 1h2v1H1V1zm4 0h2v1H5V1zM2 2h1v1H2V2zm3 0h1v1H5V2zM3 3h2v2H3V3zM2 5h1v1H2V5zm3 0h1v1H5V5zM1 6h2v1H1V6zm4 0h2v1H5V6z"
                        />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 8 8"
                        className="h-[74%] w-[74%] pixelated drop-shadow-[1px_1px_0px_#18181B]"
                        shapeRendering="crispEdges"
                      >
                        <path
                          fill="#4F46E5"
                          d="M2 1h4v1H2V1zM1 2h1v4H1V2zm5 0h1v4H6V2zM2 6h4v1H2V6z"
                        />
                      </svg>
                    )}

                    {/* Khung pixel đánh dấu nước đi gần nhất */}
                    {isLastMove && !isWinningCell && (
                      <span className="pointer-events-none absolute inset-0.5 border-2 border-amber-600 animate-pulse" />
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
