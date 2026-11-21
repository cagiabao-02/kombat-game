'use client';

import React from 'react';
import { OTHELLO_SIZE, getFlippablePieces } from './othelloLogic';
import { OthelloBoardState, OthelloCoord, OthelloStone } from './types';

interface OthelloBoardProps {
  board: OthelloBoardState;
  currentTurn: OthelloStone;
  validMoves: OthelloCoord[];
  lastMove: OthelloCoord | null;
  lastFlipped: OthelloCoord[];
  canInteract: boolean;
  onCellClick: (row: number, col: number) => void;
}

const COL_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

export const OthelloBoard: React.FC<OthelloBoardProps> = ({
  board,
  currentTurn,
  validMoves,
  lastMove,
  lastFlipped,
  canInteract,
  onCellClick,
}) => {
  const validMap = new Set(validMoves.map((m) => `${m.row},${m.col}`));
  const flippedMap = new Set(lastFlipped.map((f) => `${f.row},${f.col}`));

  return (
    <div className="w-full max-w-[440px] mx-auto select-none">
      {/* Column coordinates */}
      <div className="grid grid-cols-8 px-2 mb-1 text-[10px] font-mono font-bold text-zinc-500 text-center">
        {COL_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>

      {/* Main 8x8 board */}
      <div className="relative bg-emerald-800 p-2 border-4 border-zinc-900 shadow-[4px_4px_0px_#18181b]">
        <div className="grid grid-cols-8 bg-emerald-700 border-2 border-zinc-900">
          {board.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              const key = `${r},${c}`;
              const isValid = canInteract && validMap.has(key);
              const isLastMove = lastMove?.row === r && lastMove?.col === c;
              const isFlipped = flippedMap.has(key);
              const flipCount = isValid ? getFlippablePieces(board, r, c, currentTurn).length : 0;

              return (
                <button
                  key={key}
                  type="button"
                  disabled={!isValid}
                  onClick={() => isValid && onCellClick(r, c)}
                  aria-label={`Row ${r + 1} Column ${COL_LABELS[c]}${cell ? ` (${cell})` : isValid ? ' (valid move)' : ''}`}
                  className={`relative aspect-square border border-emerald-950/60 flex items-center justify-center transition-colors ${
                    isValid
                      ? 'cursor-pointer hover:bg-emerald-600/80 active:bg-emerald-500/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400'
                      : 'cursor-default'
                  } ${isLastMove ? 'bg-amber-400/20' : ''}`}
                >
                  {/* Stone */}
                  {cell && (
                    <div
                      className={`w-[78%] h-[78%] rounded-full border-2 transition-transform duration-200 ${
                        cell === 'black'
                          ? 'bg-zinc-900 border-zinc-950 shadow-[inset_2px_2px_0_rgba(255,255,255,0.22),0_2px_0_rgba(0,0,0,0.45)]'
                          : 'bg-[#FFFDF8] border-zinc-800 shadow-[inset_-2px_-2px_0_rgba(0,0,0,0.12),0_2px_0_rgba(0,0,0,0.35)]'
                      } ${isFlipped ? 'ring-2 ring-amber-400 scale-105' : ''} ${
                        isLastMove ? 'ring-2 ring-amber-300' : ''
                      }`}
                    >
                      {isLastMove && (
                        <div className="w-full h-full flex items-center justify-center">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              cell === 'black' ? 'bg-amber-400' : 'bg-amber-500'
                            }`}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Valid move hint */}
                  {!cell && isValid && (
                    <div className="group/hint flex items-center justify-center w-full h-full">
                      <span
                        className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full border-2 border-dashed transition-transform group-hover/hint:scale-125 ${
                          currentTurn === 'black'
                            ? 'bg-zinc-900/35 border-zinc-950/70'
                            : 'bg-white/45 border-white/80'
                        }`}
                      />
                      <span className="sr-only">+{flipCount}</span>
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom coordinate helper */}
      <div className="mt-1.5 flex items-center justify-between px-1 text-[11px] font-mono text-zinc-500">
        <span>{OTHELLO_SIZE}×{OTHELLO_SIZE} REVERSI</span>
        <span>{validMoves.length > 0 ? `${validMoves.length} valid` : 'No moves'}</span>
      </div>
    </div>
  );
};
