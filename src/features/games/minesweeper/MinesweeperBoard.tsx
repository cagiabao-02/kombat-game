'use client';

import React, { useRef } from 'react';
import { Board, Cell } from './minesweeperLogic';

interface MinesweeperBoardProps {
  board: Board;
  onReveal: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
  onPressingChange: (pressing: boolean) => void;
  activeTool: 'dig' | 'flag';
  disabled?: boolean;
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-700',
  2: 'text-green-700',
  3: 'text-red-600',
  4: 'text-indigo-900',
  5: 'text-rose-950',
  6: 'text-teal-700',
  7: 'text-zinc-950',
  8: 'text-zinc-600',
};

export function MinesweeperBoard({
  board,
  onReveal,
  onToggleFlag,
  onChord,
  onPressingChange,
  activeTool,
  disabled = false,
}: MinesweeperBoardProps) {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);

  const rows = board.length;
  const cols = board[0].length;

  // Xác định kích thước ô tối ưu theo độ rộng bàn cờ
  // Beginner (9x9): ô to 36-38px dễ chạm. Intermediate (16x16) / Expert (16x30): 30-32px
  const cellSizeClass =
    cols <= 9
      ? 'w-9 h-9 sm:w-10 sm:h-10 text-base sm:text-lg'
      : cols <= 16
      ? 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm'
      : 'w-6 h-6 sm:w-7 sm:h-7 text-xs';

  const handleCellClick = (cell: Cell) => {
    if (disabled) return;
    if (cell.isRevealed) {
      if (cell.neighborMines > 0) {
        onChord(cell.row, cell.col);
      }
      return;
    }

    if (activeTool === 'flag') {
      onToggleFlag(cell.row, cell.col);
    } else {
      onReveal(cell.row, cell.col);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, cell: Cell) => {
    e.preventDefault();
    if (disabled || cell.isRevealed) return;
    onToggleFlag(cell.row, cell.col);
  };

  // Hỗ trợ Touch Long-press để cắm cờ trên điện thoại
  const handleTouchStart = (cell: Cell) => {
    if (disabled || cell.isRevealed) return;
    onPressingChange(true);
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onToggleFlag(cell.row, cell.col);
      onPressingChange(false);
    }, 450);
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    onPressingChange(false);
  };

  const handleTouchCancel = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    onPressingChange(false);
  };

  return (
    <div className="w-full overflow-x-auto pb-2 [scrollbar-width:thin]">
      <div className="inline-block min-w-full text-center">
        <div
          className="inline-grid border-4 border-t-zinc-800 border-l-zinc-800 border-r-white border-b-white bg-[#808080] p-1.5 shadow-pixel-sm select-none"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          }}
          onMouseDown={() => !disabled && onPressingChange(true)}
          onMouseUp={() => onPressingChange(false)}
          onMouseLeave={() => onPressingChange(false)}
        >
          {board.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              // 1. Ô chưa mở
              if (!cell.isRevealed) {
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    disabled={disabled}
                    onClick={() => {
                      if (!isLongPressRef.current) {
                        handleCellClick(cell);
                      }
                      isLongPressRef.current = false;
                    }}
                    onContextMenu={(e) => handleContextMenu(e, cell)}
                    onTouchStart={() => handleTouchStart(cell)}
                    onTouchEnd={handleTouchEnd}
                    onTouchCancel={handleTouchCancel}
                    className={`${cellSizeClass} flex items-center justify-center font-pixel font-bold border-2 border-t-white border-l-white border-r-zinc-800 border-b-zinc-800 bg-[#C0C0C0] active:border-t-zinc-800 active:border-l-zinc-800 active:border-r-white active:border-b-white cursor-pointer transition-none`}
                  >
                    {cell.isFlagged ? (
                      <span className="animate-pop text-sm sm:text-base leading-none select-none">
                        🚩
                      </span>
                    ) : null}
                  </button>
                );
              }

              // 2. Ô đã mở: Mìn phát nổ (nền đỏ)
              if (cell.isExploded) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`${cellSizeClass} flex items-center justify-center bg-rose-600 border border-zinc-700 text-sm sm:text-base leading-none select-none`}
                  >
                    💣
                  </div>
                );
              }

              // 3. Ô đã mở: Quả mìn lộ ra khi thua
              if (cell.isMine) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`${cellSizeClass} flex items-center justify-center bg-[#C0C0C0] border border-zinc-500 text-sm sm:text-base leading-none select-none`}
                  >
                    💣
                  </div>
                );
              }

              // 4. Ô cắm cờ sai khi thua (có cờ nhưng không có mìn)
              if (cell.isWrongFlag) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`${cellSizeClass} relative flex items-center justify-center bg-[#C0C0C0] border border-zinc-500 select-none`}
                  >
                    <span className="text-sm opacity-50">🚩</span>
                    <span className="absolute font-pixel font-black text-rose-600 text-xs sm:text-sm">
                      ✕
                    </span>
                  </div>
                );
              }

              // 5. Ô an toàn đã mở (có số hoặc rỗng)
              const numColor = NUMBER_COLORS[cell.neighborMines] || 'text-zinc-800';

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(cell)}
                  className={`${cellSizeClass} flex items-center justify-center bg-[#E5E7EB] border border-zinc-400 font-pixel font-black leading-none select-none ${
                    cell.neighborMines > 0 ? 'cursor-pointer hover:bg-zinc-200' : ''
                  }`}
                >
                  {cell.neighborMines > 0 ? (
                    <span className={numColor}>{cell.neighborMines}</span>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
