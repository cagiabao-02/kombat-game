'use client';

import React from 'react';
import { BoardGrid, ShapeCell } from './types';
import { BOARD_SIZE } from './blockBlastLogic';

interface BlockBlastBoardProps {
  board: BoardGrid;
  ghostCells: ShapeCell[];
  ghostValid: boolean;
  ghostColor?: string;
  clearingCoords: Set<string>; // set của "r,c" đang trong hiệu ứng nổ
  previewClearingCoords?: Set<string>; // set của "r,c" của hàng/cột sắp bị nổ khi đặt
  gridRef?: React.RefObject<HTMLDivElement | null>;
  onCellClick: (row: number, col: number) => void;
  onCellMouseEnter?: (row: number, col: number) => void;
}

export const BlockBlastBoard: React.FC<BlockBlastBoardProps> = ({
  board,
  ghostCells,
  ghostValid,
  ghostColor = '#3b82f6',
  clearingCoords,
  previewClearingCoords,
  gridRef,
  onCellClick,
  onCellMouseEnter,
}) => {
  // Tạo map tra cứu nhanh cho ghost cells
  const ghostMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    for (const cell of ghostCells) {
      map.set(`${cell.r},${cell.c}`, true);
    }
    return map;
  }, [ghostCells]);

  return (
    <div className="relative p-2 bg-[#1e232a] border-4 border-black shadow-[6px_6px_0px_#000] rounded-lg select-none touch-none">
      <div
        ref={gridRef}
        className="grid grid-cols-8 gap-1 sm:gap-1.5"
        style={{ width: 'min(88vw, 360px)', height: 'min(88vw, 360px)' }}
      >
        {Array.from({ length: BOARD_SIZE }).map((_, r) =>
          Array.from({ length: BOARD_SIZE }).map((_, c) => {
            const key = `${r},${c}`;
            const filledColor = board[r][c];
            // Chỉ hiển thị bóng mờ khi vị trí thực sự hợp lệ, không bao giờ hiện bóng đen khi không đặt được
            const isGhost = Boolean(ghostValid && ghostMap.has(key));
            const isClearing = clearingCoords.has(key);
            const isPreviewClearing = previewClearingCoords?.has(key) ?? false;

            let cellBg = '#2a323d'; // Màu nền ô trống
            let cellBorder = '#1c2229';

            if (filledColor) {
              cellBg = filledColor;
            }

            return (
              <div
                key={key}
                data-row={r}
                data-col={c}
                onClick={() => onCellClick(r, c)}
                onMouseEnter={() => onCellMouseEnter?.(r, c)}
                className={`relative flex items-center justify-center rounded-sm transition-transform duration-75 cursor-pointer ${
                  isClearing ? 'scale-0 opacity-0 transition-all duration-300' : ''
                } ${isPreviewClearing ? 'z-10' : ''}`}
                style={{
                  backgroundColor: isGhost ? ghostColor : cellBg,
                  opacity: isGhost && !filledColor ? 0.85 : 1,
                  boxShadow: isPreviewClearing
                    ? '0 0 10px #facc15, inset 0 0 8px #fde047'
                    : filledColor
                    ? 'inset 2px 2px 0px rgba(255,255,255,0.4), inset -2px -2px 0px rgba(0,0,0,0.4)'
                    : isGhost
                    ? 'inset 0 0 6px rgba(255,255,255,0.5)'
                    : 'inset 1px 1px 0px rgba(0,0,0,0.4)',
                  border: isPreviewClearing
                    ? '2px solid #facc15'
                    : filledColor
                    ? '2px solid rgba(0,0,0,0.6)'
                    : isGhost
                    ? '2px dashed #ffffff'
                    : `1px solid ${cellBorder}`,
                }}
              >
                {/* Hiệu ứng phát sáng báo hiệu toàn bộ hàng / cột sẽ nổ tung */}
                {isPreviewClearing && !isClearing && (
                  <div className="absolute inset-0 z-20 pointer-events-none rounded-sm bg-amber-400/35 border-2 border-yellow-200 animate-pulse">
                    <span className="absolute inset-0 bg-white/40 animate-ping opacity-75 rounded-sm" />
                  </div>
                )}

                {/* Hiệu ứng nổ pixel blast */}
                {isClearing && (
                  <span className="absolute inset-0 bg-white animate-ping opacity-75 rounded-sm" />
                )}

                {/* Chấm tâm retro cho ô trống */}
                {!filledColor && !isGhost && !isPreviewClearing && (
                  <div className="w-1 h-1 rounded-full bg-zinc-700/40" />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
