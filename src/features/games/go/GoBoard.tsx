'use client';

import React from 'react';
import { BoardSize, GoBoard, GoColor, Point } from './types';
import { getStarPoints, isInBounds, validateMove } from './goLogic';

interface GoBoardProps {
  board: GoBoard;
  boardSize: BoardSize;
  currentTurn: GoColor;
  koPoint: Point | null;
  lastMove: Point | null;
  selectedPoint: Point | null;
  onSelectPoint: (p: Point) => void;
  onConfirmMove?: (p: Point) => void;
  disabled?: boolean;
}

export const GoBoardComponent: React.FC<GoBoardProps> = ({
  board,
  boardSize,
  currentTurn,
  koPoint,
  lastMove,
  selectedPoint,
  onSelectPoint,
  onConfirmMove,
  disabled = false,
}) => {
  const [hoverPoint, setHoverPoint] = React.useState<Point | null>(null);

  const starPoints = React.useMemo(() => getStarPoints(boardSize), [boardSize]);

  // Kích thước chuẩn hóa SVG viewBox
  const viewBoxSize = 1000;
  const padding = boardSize === 9 ? 70 : boardSize === 13 ? 55 : 45;
  const gridSize = viewBoxSize - 2 * padding;
  const step = gridSize / (boardSize - 1);
  const stoneRadius = step * 0.46;

  const getCoord = (idx: number) => padding + idx * step;

  // Xử lý click/tap trên bàn cờ
  const handleCellClick = (r: number, c: number) => {
    if (disabled) return;
    const p = { row: r, col: c };

    // Kiểm tra tính hợp lệ
    const check = validateMove(board, p, currentTurn, koPoint);
    if (!check.valid) return;

    if (onConfirmMove) {
      // Nếu đã chọn điểm này trước đó -> Xác nhận đặt cờ ngay
      if (selectedPoint && selectedPoint.row === r && selectedPoint.col === c) {
        onConfirmMove(p);
      } else {
        onSelectPoint(p);
      }
    } else {
      onSelectPoint(p);
    }
  };

  // Nhãn chữ cái hàng cột (A B C D E F G H J K... - chuẩn quốc tế bỏ chữ 'I' để tránh nhầm với số 1)
  const COL_LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T'];

  return (
    <div className="relative w-full max-w-[540px] aspect-square mx-auto select-none p-1 sm:p-2 bg-[#C88942] rounded-lg border-4 border-[#5E3816] shadow-[0_8px_25px_rgba(0,0,0,0.4)]">
      {/* Vân gỗ bàn cờ Kaya cổ điển */}
      <div className="relative w-full h-full bg-[#DE9F56] rounded shadow-inner overflow-hidden border border-[#A66E30]">
        <svg
          viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
          className="w-full h-full cursor-pointer"
          onMouseLeave={() => setHoverPoint(null)}
        >
          <defs>
            {/* Đổ bóng đá cờ */}
            <filter id="stoneShadow" x="-20%" y="-20%" width="150%" height="150%">
              <feDropShadow dx="3" dy="6" stdDeviation="4" floodOpacity="0.45" />
            </filter>

            {/* Gradient quân Đen (Đá huyền vũ đen tuyền có ánh sáng bóng) */}
            <radialGradient id="blackStoneGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#555555" />
              <stop offset="40%" stopColor="#222222" />
              <stop offset="100%" stopColor="#0a0a0a" />
            </radialGradient>

            {/* Gradient quân Trắng (Vỏ ốc sò tuyết ngọc ngà) */}
            <radialGradient id="whiteStoneGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="65%" stopColor="#f0efe9" />
              <stop offset="100%" stopColor="#d1cfc4" />
            </radialGradient>
          </defs>

          {/* 1. Các đường kẻ bàn cờ (Grid lines) */}
          {Array.from({ length: boardSize }).map((_, i) => {
            const pos = getCoord(i);
            const start = padding;
            const end = padding + gridSize;
            return (
              <g key={`grid-${i}`}>
                {/* Đường kẻ ngang */}
                <line
                  x1={start}
                  y1={pos}
                  x2={end}
                  y2={pos}
                  stroke="#573312"
                  strokeWidth={i === 0 || i === boardSize - 1 ? 4 : 2}
                  strokeLinecap="round"
                />
                {/* Đường kẻ dọc */}
                <line
                  x1={pos}
                  y1={start}
                  x2={pos}
                  y2={end}
                  stroke="#573312"
                  strokeWidth={i === 0 || i === boardSize - 1 ? 4 : 2}
                  strokeLinecap="round"
                />
              </g>
            );
          })}

          {/* 2. Điểm sao định vị (Hoshi / Tengen) */}
          {starPoints.map((sp, idx) => (
            <circle
              key={`star-${idx}`}
              cx={getCoord(sp.col)}
              cy={getCoord(sp.row)}
              r={boardSize === 19 ? 5.5 : 7}
              fill="#573312"
            />
          ))}

          {/* 3. Tọa độ chữ cái & con số ở mép */}
          {boardSize <= 13 &&
            Array.from({ length: boardSize }).map((_, i) => {
              const pos = getCoord(i);
              const fontSize = boardSize === 9 ? 22 : 18;
              return (
                <g key={`labels-${i}`} fill="#6E441D" fontSize={fontSize} fontFamily="monospace" fontWeight="bold">
                  {/* Chữ cái phía trên & dưới */}
                  <text x={pos} y={padding * 0.45} textAnchor="middle">
                    {COL_LETTERS[i]}
                  </text>
                  <text x={pos} y={viewBoxSize - padding * 0.25} textAnchor="middle">
                    {COL_LETTERS[i]}
                  </text>
                  {/* Số phía trái & phải */}
                  <text x={padding * 0.4} y={pos + fontSize * 0.35} textAnchor="middle">
                    {boardSize - i}
                  </text>
                  <text x={viewBoxSize - padding * 0.4} y={pos + fontSize * 0.35} textAnchor="middle">
                    {boardSize - i}
                  </text>
                </g>
              );
            })}

          {/* 4. Quân cờ đã đánh trên bàn (Placed stones) */}
          {board.map((rowArr, r) =>
            rowArr.map((cell, c) => {
              if (!cell) return null;
              const cx = getCoord(c);
              const cy = getCoord(r);
              const isLast = lastMove && lastMove.row === r && lastMove.col === c;

              return (
                <g key={`stone-${r}-${c}`}>
                  {/* Thân quân cờ */}
                  <circle
                    cx={cx}
                    cy={cy}
                    r={stoneRadius}
                    fill={cell === 'black' ? 'url(#blackStoneGrad)' : 'url(#whiteStoneGrad)'}
                    stroke={cell === 'white' ? '#B8B5A7' : '#000000'}
                    strokeWidth={cell === 'white' ? 1.5 : 1}
                    filter="url(#stoneShadow)"
                  />

                  {/* Vết đánh dấu nước đi gần nhất */}
                  {isLast && (
                    <circle
                      cx={cx}
                      cy={cy}
                      r={stoneRadius * 0.35}
                      fill="none"
                      stroke={cell === 'black' ? '#EF4444' : '#DC2626'}
                      strokeWidth={3.5}
                    />
                  )}
                </g>
              );
            })
          )}

          {/* 5. Vùng chọn đang chờ xác nhận (Selected Point Preview) */}
          {selectedPoint && !disabled && (
            <g>
              <circle
                cx={getCoord(selectedPoint.col)}
                cy={getCoord(selectedPoint.row)}
                r={stoneRadius}
                fill={currentTurn === 'black' ? '#000000' : '#ffffff'}
                fillOpacity={0.65}
                stroke="#10B981"
                strokeWidth={4}
                strokeDasharray="6,4"
              />
            </g>
          )}

          {/* 6. Bóng mờ khi di chuột (Hover Preview) */}
          {hoverPoint &&
            !disabled &&
            !board[hoverPoint.row]?.[hoverPoint.col] &&
            validateMove(board, hoverPoint, currentTurn, koPoint).valid && (
              <circle
                cx={getCoord(hoverPoint.col)}
                cy={getCoord(hoverPoint.row)}
                r={stoneRadius}
                fill={currentTurn === 'black' ? '#000000' : '#ffffff'}
                fillOpacity={0.35}
                pointerEvents="none"
              />
            )}

          {/* 7. Vùng chạm tương tác vô hình trên từng giao điểm */}
          {Array.from({ length: boardSize }).map((_, r) =>
            Array.from({ length: boardSize }).map((_, c) => {
              const cx = getCoord(c);
              const cy = getCoord(r);
              return (
                <rect
                  key={`hitbox-${r}-${c}`}
                  x={cx - step / 2}
                  y={cy - step / 2}
                  width={step}
                  height={step}
                  fill="transparent"
                  onMouseEnter={() => setHoverPoint({ row: r, col: c })}
                  onClick={() => handleCellClick(r, c)}
                />
              );
            })
          )}
        </svg>
      </div>
    </div>
  );
};
