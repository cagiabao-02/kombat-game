'use client';

import React, { useRef } from 'react';
import { Board, Cell } from './minesweeperLogic';

interface MinesweeperBoardProps {
  board: Board;
  cellSize?: number;
  onReveal: (row: number, col: number) => void;
  onToggleFlag: (row: number, col: number) => void;
  onChord: (row: number, col: number) => void;
  onPressingChange: (pressing: boolean) => void;
  activeTool: 'dig' | 'flag';
  disabled?: boolean;
}

const NUMBER_COLORS: Record<number, string> = {
  1: 'text-blue-700',
  2: 'text-emerald-700',
  3: 'text-red-600',
  4: 'text-indigo-900',
  5: 'text-amber-900',
  6: 'text-teal-700',
  7: 'text-zinc-950',
  8: 'text-zinc-600',
};

export function MinesweeperBoard({
  board,
  cellSize: propCellSize,
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

  // Xác định kích thước ô vuông cố định (không co dẹp trên mobile)
  // Beginner (9x9): ô to 38px. Intermediate (16x16): 30px. Expert (16x30): 28px
  const defaultCellSize = cols <= 9 ? 38 : cols <= 16 ? 30 : 28;
  const cellSize = propCellSize || defaultCellSize;

  // Cỡ chữ và icon tự động tỷ lệ theo kích cỡ ô để không bao giờ bị cắt hay che mất
  const numFontSize = Math.max(11, Math.round(cellSize * 0.52));
  const iconSize = Math.max(12, Math.round(cellSize * 0.54));

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
    <div className="w-full">
      {/* Khung cuộn ngang mượt mà cho màn hình điện thoại */}
      <div className="w-full overflow-x-auto pb-3 pt-1 touch-pan-x [scrollbar-width:auto] sm:[scrollbar-width:thin] [-webkit-overflow-scrolling:touch]">
        <div className="inline-block min-w-full text-center">
          <div
            className="inline-grid border-4 border-t-zinc-800 border-l-zinc-800 border-r-white border-b-white bg-[#808080] p-1.5 shadow-pixel-sm select-none"
            style={{
              gridTemplateColumns: `repeat(${cols}, ${cellSize}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellSize}px)`,
              width: 'max-content',
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
                      style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                      className="flex items-center justify-center font-pixel font-bold border-2 border-t-white border-l-white border-r-zinc-800 border-b-zinc-800 bg-[#C0C0C0] active:border-t-zinc-800 active:border-l-zinc-800 active:border-r-white active:border-b-white cursor-pointer transition-none select-none"
                    >
                      {cell.isFlagged ? (
                        <span
                          className="animate-pop select-none leading-none"
                          style={{ fontSize: `${iconSize}px` }}
                        >
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
                      style={{ width: `${cellSize}px`, height: `${cellSize}px`, fontSize: `${iconSize}px` }}
                      className="flex items-center justify-center bg-rose-600 border border-zinc-700 leading-none select-none"
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
                      style={{ width: `${cellSize}px`, height: `${cellSize}px`, fontSize: `${iconSize}px` }}
                      className="flex items-center justify-center bg-[#C0C0C0] border border-zinc-500 leading-none select-none"
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
                      style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                      className="relative flex items-center justify-center bg-[#C0C0C0] border border-zinc-500 select-none"
                    >
                      <span style={{ fontSize: `${iconSize}px` }} className="opacity-50">
                        🚩
                      </span>
                      <span
                        style={{ fontSize: `${numFontSize}px` }}
                        className="absolute font-pixel font-black text-rose-600"
                      >
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
                    style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                    className={`flex items-center justify-center bg-[#E5E7EB] border border-zinc-400 font-pixel font-bold leading-none select-none ${
                      cell.neighborMines > 0 ? 'cursor-pointer hover:bg-zinc-200' : ''
                    }`}
                  >
                    {cell.neighborMines > 0 ? (
                      <span
                        className={`${numColor} leading-none text-center`}
                        style={{ fontSize: `${numFontSize}px` }}
                      >
                        {cell.neighborMines}
                      </span>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
