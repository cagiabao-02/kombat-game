'use client';

import React from 'react';
import { SnakeState, GRID_SIZE, Direction } from './snakeLogic';

interface SnakeBoardProps {
  state: SnakeState;
  onSwipeDirection?: (dir: Direction) => void;
}

export function SnakeBoard({ state, onSwipeDirection }: SnakeBoardProps) {
  const touchStartRef = React.useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || !onSwipeDirection) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) < 20) return; // Vuốt quá ngắn

    if (absX > absY) {
      onSwipeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
    } else {
      onSwipeDirection(dy > 0 ? 'DOWN' : 'UP');
    }
  };

  const head = state.snake[0];
  const body = state.snake.slice(1);

  return (
    <div
      className="relative select-none touch-none aspect-square w-full max-w-[420px] mx-auto border-4 border-zinc-950 bg-[#8BAC0F] p-1.5 shadow-[0_6px_0_0_#18181b]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Màn hình LCD cổ điển 20x20 */}
      <svg
        viewBox={`0 0 ${GRID_SIZE} ${GRID_SIZE}`}
        className="w-full h-full pixelated bg-[#9BBC0F] rounded-none border-2 border-[#0F380F]/40"
        shapeRendering="crispEdges"
      >
        {/* Lưới pixel mờ nền LCD */}
        <defs>
          <pattern id="grid" width="1" height="1" patternUnits="userSpaceOnUse">
            <rect width="1" height="1" fill="#9BBC0F" />
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#8BAC0F" strokeWidth="0.05" />
          </pattern>
        </defs>
        <rect width={GRID_SIZE} height={GRID_SIZE} fill="url(#grid)" />

        {/* Táo thường (Đỏ) */}
        <g>
          {/* Cuống */}
          <rect x={state.food.x + 0.45} y={state.food.y + 0.05} width="0.1" height="0.25" fill="#0F380F" />
          {/* Lá */}
          <rect x={state.food.x + 0.55} y={state.food.y + 0.1} width="0.25" height="0.15" fill="#15803D" />
          {/* Quả táo */}
          <rect
            x={state.food.x + 0.15}
            y={state.food.y + 0.25}
            width="0.7"
            height="0.65"
            fill="#DC2626"
            stroke="#0F380F"
            strokeWidth="0.08"
          />
          {/* Điểm bóng sáng */}
          <rect x={state.food.x + 0.3} y={state.food.y + 0.35} width="0.15" height="0.15" fill="#FCA5A5" />
        </g>

        {/* Táo vàng đặc biệt (Bonus) */}
        {state.goldenFood && (
          <g className="animate-pulse">
            <rect
              x={state.goldenFood.x + 0.1}
              y={state.goldenFood.y + 0.1}
              width="0.8"
              height="0.8"
              fill="#F59E0B"
              stroke="#0F380F"
              strokeWidth="0.08"
            />
            <rect
              x={state.goldenFood.x + 0.25}
              y={state.goldenFood.y + 0.25}
              width="0.5"
              height="0.5"
              fill="#FEF08A"
            />
          </g>
        )}

        {/* Thân rắn */}
        {body.map((seg, i) => (
          <rect
            key={i}
            x={seg.x + 0.08}
            y={seg.y + 0.08}
            width="0.84"
            height="0.84"
            fill={state.isGameOver ? '#4B5563' : '#15803D'}
            stroke="#0F380F"
            strokeWidth="0.08"
          />
        ))}

        {/* Đầu rắn */}
        <g>
          <rect
            x={head.x + 0.05}
            y={head.y + 0.05}
            width="0.9"
            height="0.9"
            fill={state.isGameOver ? '#DC2626' : '#166534'}
            stroke="#0F380F"
            strokeWidth="0.08"
          />

          {/* Mắt rắn xoay theo hướng */}
          {!state.isGameOver && (
            <>
              {state.direction === 'RIGHT' && (
                <>
                  <rect x={head.x + 0.65} y={head.y + 0.2} width="0.2" height="0.2" fill="#FEF08A" />
                  <rect x={head.x + 0.65} y={head.y + 0.6} width="0.2" height="0.2" fill="#FEF08A" />
                  <rect x={head.x + 0.75} y={head.y + 0.25} width="0.1" height="0.1" fill="#0F380F" />
                  <rect x={head.x + 0.75} y={head.y + 0.65} width="0.1" height="0.1" fill="#0F380F" />
                  {/* Lưỡi */}
                  <rect x={head.x + 0.95} y={head.y + 0.45} width="0.25" height="0.1" fill="#DC2626" />
                </>
              )}
              {state.direction === 'LEFT' && (
                <>
                  <rect x={head.x + 0.15} y={head.y + 0.2} width="0.2" height="0.2" fill="#FEF08A" />
                  <rect x={head.x + 0.15} y={head.y + 0.6} width="0.2" height="0.2" fill="#FEF08A" />
                  <rect x={head.x + 0.15} y={head.y + 0.25} width="0.1" height="0.1" fill="#0F380F" />
                  <rect x={head.x + 0.15} y={head.y + 0.65} width="0.1" height="0.1" fill="#0F380F" />
                  {/* Lưỡi */}
                  <rect x={head.x - 0.2} y={head.y + 0.45} width="0.25" height="0.1" fill="#DC2626" />
                </>
              )}
              {state.direction === 'UP' && (
                <>
                  <rect x={head.x + 0.2} y={head.y + 0.15} width="0.2" height="0.2" fill="#FEF08A" />
                  <rect x={head.x + 0.6} y={head.y + 0.15} width="0.2" height="0.2" fill="#FEF08A" />
                  <rect x={head.x + 0.25} y={head.y + 0.15} width="0.1" height="0.1" fill="#0F380F" />
                  <rect x={head.x + 0.65} y={head.y + 0.15} width="0.1" height="0.1" fill="#0F380F" />
                  {/* Lưỡi */}
                  <rect x={head.x + 0.45} y={head.y - 0.2} width="0.1" height="0.25" fill="#DC2626" />
                </>
              )}
              {state.direction === 'DOWN' && (
                <>
                  <rect x={head.x + 0.2} y={head.y + 0.65} width="0.2" height="0.2" fill="#FEF08A" />
                  <rect x={head.x + 0.6} y={head.y + 0.65} width="0.2" height="0.2" fill="#FEF08A" />
                  <rect x={head.x + 0.25} y={head.y + 0.75} width="0.1" height="0.1" fill="#0F380F" />
                  <rect x={head.x + 0.65} y={head.y + 0.75} width="0.1" height="0.1" fill="#0F380F" />
                  {/* Lưỡi */}
                  <rect x={head.x + 0.45} y={head.y + 0.95} width="0.1" height="0.25" fill="#DC2626" />
                </>
              )}
            </>
          )}

          {/* Mắt chữ X khi chết */}
          {state.isGameOver && (
            <>
              <line x1={head.x + 0.2} y1={head.y + 0.3} x2={head.x + 0.4} y2={head.y + 0.5} stroke="#FFF" strokeWidth="0.08" />
              <line x1={head.x + 0.4} y1={head.y + 0.3} x2={head.x + 0.2} y2={head.y + 0.5} stroke="#FFF" strokeWidth="0.08" />
              <line x1={head.x + 0.6} y1={head.y + 0.3} x2={head.x + 0.8} y2={head.y + 0.5} stroke="#FFF" strokeWidth="0.08" />
              <line x1={head.x + 0.8} y1={head.y + 0.3} x2={head.x + 0.6} y2={head.y + 0.5} stroke="#FFF" strokeWidth="0.08" />
            </>
          )}
        </g>
      </svg>

      {/* Tạm dừng Overlay */}
      {state.isPaused && !state.isGameOver && (
        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-center p-4">
          <p className="font-pixel text-2xl font-bold text-amber-300 tracking-wider animate-pulse">
            TẠM DỪNG (PAUSED)
          </p>
          <p className="mt-2 text-xs font-mono text-zinc-300">
            Bấm Space hoặc chạm màn hình để tiếp tục
          </p>
        </div>
      )}
    </div>
  );
}
