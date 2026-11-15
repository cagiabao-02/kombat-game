'use client';

import React from 'react';
import { Board, Position, Move, Side, findGeneral } from './xiangqiLogic';
import { XiangqiPiece } from './XiangqiPiece';

interface XiangqiBoardProps {
  board: Board;
  turn: Side;
  selectedPos: Position | null;
  legalMoves: Position[];
  lastMove: Move | null;
  isCheck: boolean;
  flipped?: boolean;
  showSubLabel?: boolean;
  disabled?: boolean;
  onSelectPiece: (pos: Position) => void;
  onMakeMove: (from: Position, to: Position) => void;
}

// Kích thước hệ tọa độ nội bộ của bàn cờ SVG
const GRID_COLS = 9;
const GRID_ROWS = 10;
const CELL_SIZE = 50;
const PAD_X = 25;
const PAD_Y = 25;
const SVG_WIDTH = PAD_X * 2 + (GRID_COLS - 1) * CELL_SIZE; // 25*2 + 8*50 = 450
const SVG_HEIGHT = PAD_Y * 2 + (GRID_ROWS - 1) * CELL_SIZE; // 25*2 + 9*50 = 500

// Các vị trí có dấu hoa văn chữ thập (Vị trí đặt Pháo và Tốt ban đầu)
const TICK_POINTS = [
  // Pháo Đen
  { r: 2, c: 1, edges: ['tl', 'tr', 'bl', 'br'] },
  { r: 2, c: 7, edges: ['tl', 'tr', 'bl', 'br'] },
  // Tốt Đen
  { r: 3, c: 0, edges: ['tr', 'br'] }, // Biên trái
  { r: 3, c: 2, edges: ['tl', 'tr', 'bl', 'br'] },
  { r: 3, c: 4, edges: ['tl', 'tr', 'bl', 'br'] },
  { r: 3, c: 6, edges: ['tl', 'tr', 'bl', 'br'] },
  { r: 3, c: 8, edges: ['tl', 'bl'] }, // Biên phải
  // Tốt Đỏ
  { r: 6, c: 0, edges: ['tr', 'br'] }, // Biên trái
  { r: 6, c: 2, edges: ['tl', 'tr', 'bl', 'br'] },
  { r: 6, c: 4, edges: ['tl', 'tr', 'bl', 'br'] },
  { r: 6, c: 6, edges: ['tl', 'tr', 'bl', 'br'] },
  { r: 6, c: 8, edges: ['tl', 'bl'] }, // Biên phải
  // Pháo Đỏ
  { r: 7, c: 1, edges: ['tl', 'tr', 'bl', 'br'] },
  { r: 7, c: 7, edges: ['tl', 'tr', 'bl', 'br'] },
];

export function XiangqiBoard({
  board,
  turn,
  selectedPos,
  legalMoves,
  lastMove,
  isCheck,
  flipped = false,
  showSubLabel = true,
  disabled = false,
  onSelectPiece,
  onMakeMove,
}: XiangqiBoardProps) {
  // Tính toán vị trí Tướng đang bị chiếu
  const checkedGeneralPos = React.useMemo(() => {
    if (!isCheck) return null;
    return findGeneral(board, turn);
  }, [board, isCheck, turn]);

  // Tập hợp các ô đến hợp lệ dạng 'row-col' để tra cứu O(1)
  const legalMoveSet = React.useMemo(() => {
    return new Set(legalMoves.map((m) => `${m.row}-${m.col}`));
  }, [legalMoves]);

  // Chuyển đổi tọa độ logic bàn cờ sang tọa độ hiển thị (hỗ trợ xoay bàn cờ)
  const toDisplayRow = React.useCallback(
    (row: number) => (flipped ? 9 - row : row),
    [flipped]
  );
  const toDisplayCol = React.useCallback(
    (col: number) => (flipped ? 8 - col : col),
    [flipped]
  );

  // Xử lý khi nhấn vào một giao điểm
  const handleIntersectionClick = (row: number, col: number) => {
    if (disabled) return;

    const clickedPiece = board[row][col];
    const isLegalDest = legalMoveSet.has(`${row}-${col}`);

    // Trường hợp 1: Đang có quân được chọn và click vào nước đi hợp lệ -> Đi cờ
    if (selectedPos && isLegalDest) {
      onMakeMove(selectedPos, { row, col });
      return;
    }

    // Trường hợp 2: Click vào quân cờ của mình -> Chọn quân
    if (clickedPiece && clickedPiece.side === turn) {
      onSelectPiece({ row, col });
      return;
    }

    // Trường hợp 3: Click vào ô trống hoặc quân khác không hợp lệ -> Bỏ chọn
    if (selectedPos) {
      onSelectPiece({ row: -1, col: -1 }); // hủy chọn
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-[min(92vw,480px)] select-none border-4 border-zinc-900 bg-[#8B5A2B] p-2 sm:p-3 shadow-pixel-lg">
      {/* Khối bàn cờ gỗ Pixel 16-bit */}
      <div className="relative aspect-[9/10] w-full overflow-hidden border-2 border-zinc-900 bg-[#EAD2A8]">
        {/* Lớp SVG vẽ lưới bàn cờ, sông và cung tướng */}
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="absolute inset-0 h-full w-full pointer-events-none"
        >
          {/* Màu nền lòng bàn cờ */}
          <rect
            x={PAD_X}
            y={PAD_Y}
            width={(GRID_COLS - 1) * CELL_SIZE}
            height={(GRID_ROWS - 1) * CELL_SIZE}
            fill="#F7E1B5"
            stroke="#3B2314"
            strokeWidth="3"
          />

          {/* Khu vực Sông Sở Hà Hán Giới */}
          <rect
            x={PAD_X + 1.5}
            y={PAD_Y + 4 * CELL_SIZE}
            width={(GRID_COLS - 1) * CELL_SIZE - 3}
            height={CELL_SIZE}
            fill="#EFE0BE"
          />

          {/* 10 Đường ngang */}
          {Array.from({ length: GRID_ROWS }).map((_, r) => {
            const y = PAD_Y + r * CELL_SIZE;
            return (
              <line
                key={`h-${r}`}
                x1={PAD_X}
                y1={y}
                x2={PAD_X + (GRID_COLS - 1) * CELL_SIZE}
                y2={y}
                stroke="#3B2314"
                strokeWidth={r === 0 || r === 9 || r === 4 || r === 5 ? '2.5' : '1.5'}
              />
            );
          })}

          {/* 9 Đường dọc */}
          {Array.from({ length: GRID_COLS }).map((_, c) => {
            const x = PAD_X + c * CELL_SIZE;
            // Hai đường biên dọc chạy liền từ đầu đến cuối
            if (c === 0 || c === GRID_COLS - 1) {
              return (
                <line
                  key={`v-${c}`}
                  x1={x}
                  y1={PAD_Y}
                  x2={x}
                  y2={PAD_Y + (GRID_ROWS - 1) * CELL_SIZE}
                  stroke="#3B2314"
                  strokeWidth="2.5"
                />
              );
            }

            // Các đường dọc bên trong bị ngắt ở khoảng giữa Sông (Hàng 4 và 5)
            const riverTop = PAD_Y + 4 * CELL_SIZE;
            const riverBottom = PAD_Y + 5 * CELL_SIZE;
            return (
              <React.Fragment key={`v-${c}`}>
                {/* Nửa trên sông */}
                <line
                  x1={x}
                  y1={PAD_Y}
                  x2={x}
                  y2={riverTop}
                  stroke="#3B2314"
                  strokeWidth="1.5"
                />
                {/* Nửa dưới sông */}
                <line
                  x1={x}
                  y1={riverBottom}
                  x2={x}
                  y2={PAD_Y + (GRID_ROWS - 1) * CELL_SIZE}
                  stroke="#3B2314"
                  strokeWidth="1.5"
                />
              </React.Fragment>
            );
          })}

          {/* Cung Tướng nửa trên (Hàng 0-2, Cột 3-5) */}
          <line
            x1={PAD_X + 3 * CELL_SIZE}
            y1={PAD_Y + 0 * CELL_SIZE}
            x2={PAD_X + 5 * CELL_SIZE}
            y2={PAD_Y + 2 * CELL_SIZE}
            stroke="#3B2314"
            strokeWidth="1.5"
          />
          <line
            x1={PAD_X + 5 * CELL_SIZE}
            y1={PAD_Y + 0 * CELL_SIZE}
            x2={PAD_X + 3 * CELL_SIZE}
            y2={PAD_Y + 2 * CELL_SIZE}
            stroke="#3B2314"
            strokeWidth="1.5"
          />

          {/* Cung Tướng nửa dưới (Hàng 7-9, Cột 3-5) */}
          <line
            x1={PAD_X + 3 * CELL_SIZE}
            y1={PAD_Y + 7 * CELL_SIZE}
            x2={PAD_X + 5 * CELL_SIZE}
            y2={PAD_Y + 9 * CELL_SIZE}
            stroke="#3B2314"
            strokeWidth="1.5"
          />
          <line
            x1={PAD_X + 5 * CELL_SIZE}
            y1={PAD_Y + 7 * CELL_SIZE}
            x2={PAD_X + 3 * CELL_SIZE}
            y2={PAD_Y + 9 * CELL_SIZE}
            stroke="#3B2314"
            strokeWidth="1.5"
          />

          {/* Chữ Sông: Sở Hà • Hán Giới (楚河 • 漢界) */}
          <g className="fill-[#5C3417] font-black tracking-widest select-none">
            <text
              x={PAD_X + 1.8 * CELL_SIZE}
              y={PAD_Y + 4.65 * CELL_SIZE}
              textAnchor="middle"
              fontSize="20"
              fontFamily='"KaiTi", "SimSun", "Songti SC", serif'
            >
              楚 河
            </text>
            <text
              x={PAD_X + 6.2 * CELL_SIZE}
              y={PAD_Y + 4.65 * CELL_SIZE}
              textAnchor="middle"
              fontSize="20"
              fontFamily='"KaiTi", "SimSun", "Songti SC", serif'
            >
              漢 界
            </text>
          </g>

          {/* Dấu hoa văn góc chữ L tại các vị trí Pháo và Tốt */}
          {TICK_POINTS.map((pt, idx) => {
            const dispR = toDisplayRow(pt.r);
            const dispC = toDisplayCol(pt.c);
            const cx = PAD_X + dispC * CELL_SIZE;
            const cy = PAD_Y + dispR * CELL_SIZE;
            const gap = 4;
            const len = 7;

            return (
              <g key={`tick-${idx}`} stroke="#3B2314" strokeWidth="1.5">
                {pt.edges.includes('tl') && (
                  <path
                    d={`M ${cx - gap - len} ${cy - gap} L ${cx - gap} ${cy - gap} L ${cx - gap} ${cy - gap - len}`}
                  />
                )}
                {pt.edges.includes('tr') && (
                  <path
                    d={`M ${cx + gap + len} ${cy - gap} L ${cx + gap} ${cy - gap} L ${cx + gap} ${cy - gap - len}`}
                  />
                )}
                {pt.edges.includes('bl') && (
                  <path
                    d={`M ${cx - gap - len} ${cy + gap} L ${cx - gap} ${cy + gap} L ${cx - gap} ${cy + gap + len}`}
                  />
                )}
                {pt.edges.includes('br') && (
                  <path
                    d={`M ${cx + gap + len} ${cy + gap} L ${cx + gap} ${cy + gap} L ${cx + gap} ${cy + gap + len}`}
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Lớp các giao điểm (Intersections) tương tác và Quân cờ */}
        <div className="absolute inset-0 h-full w-full">
          {board.map((rowArr, r) =>
            rowArr.map((piece, c) => {
              const dispR = toDisplayRow(r);
              const dispC = toDisplayCol(c);

              const leftPercent = ((PAD_X + dispC * CELL_SIZE) / SVG_WIDTH) * 100;
              const topPercent = ((PAD_Y + dispR * CELL_SIZE) / SVG_HEIGHT) * 100;

              const isSelected = selectedPos?.row === r && selectedPos?.col === c;
              const isChecked = checkedGeneralPos?.row === r && checkedGeneralPos?.col === c;
              const isLastFrom = lastMove?.from.row === r && lastMove?.from.col === c;
              const isLastTo = lastMove?.to.row === r && lastMove?.to.col === c;
              const isLegalDest = legalMoveSet.has(`${r}-${c}`);

              return (
                <div
                  key={`${r}-${c}`}
                  style={{
                    position: 'absolute',
                    left: `${leftPercent}%`,
                    top: `${topPercent}%`,
                    transform: 'translate(-50%, -50%)',
                    width: '10.5%',
                    height: '9.5%',
                  }}
                  className="flex items-center justify-center z-10"
                >
                  {/* Trường hợp 1: Có quân cờ tại giao điểm */}
                  {piece ? (
                    <div className="relative h-full w-full flex items-center justify-center">
                      <XiangqiPiece
                        piece={piece}
                        isSelected={isSelected}
                        isInCheck={isChecked}
                        isLastMoveFrom={isLastFrom}
                        isLastMoveTo={isLastTo}
                        showSubLabel={showSubLabel}
                        disabled={disabled}
                        onClick={() => handleIntersectionClick(r, c)}
                      />

                      {/* Khung mục tiêu đỏ nhấp nháy khi quân địch có thể bị ăn */}
                      {isLegalDest && piece.side !== turn && (
                        <div
                          onClick={() => handleIntersectionClick(r, c)}
                          className="absolute inset-[-4px] border-2 border-dashed border-rose-600 bg-rose-500/25 animate-pulse cursor-pointer z-40"
                          title="Bấm để ăn quân"
                        />
                      )}
                    </div>
                  ) : (
                    /* Trường hợp 2: Giao điểm trống */
                    <button
                      type="button"
                      disabled={disabled || !isLegalDest}
                      onClick={() => handleIntersectionClick(r, c)}
                      className={`group relative flex h-full w-full items-center justify-center outline-none focus:outline-none transition-all ${
                        isLegalDest
                          ? 'cursor-pointer'
                          : 'cursor-default pointer-events-none'
                      }`}
                      aria-label={`Giao điểm ${r + 1}, ${c + 1}`}
                    >
                      {/* Ô vuông gợi ý nước đi hợp lệ trên giao điểm trống */}
                      {isLegalDest && (
                        <span className="relative flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center">
                          <span className="absolute inline-flex h-full w-full bg-indigo-500/40 animate-ping" />
                          <span className="relative inline-flex h-2.5 w-2.5 sm:h-3 sm:w-3 border border-zinc-900 bg-indigo-600 group-hover:scale-125 transition-transform" />
                        </span>
                      )}

                      {/* Đánh dấu vị trí quân vừa đi từ đâu đến (Nước đi trước) */}
                      {isLastFrom && (
                        <span className="h-2.5 w-2.5 border border-zinc-900 bg-amber-400" />
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
