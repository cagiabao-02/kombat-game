'use client';

import React, { useRef } from 'react';
import { Tile, Direction } from './game2048Logic';

interface Game2048BoardProps {
  tiles: Tile[];
  onMove: (dir: Direction) => void;
  disabled?: boolean;
}

/**
 * Trả về class màu sắc và hiệu ứng cho từng giá trị ô số theo phong cách Pixel Arcade
 */
function getTileStyle(val: number): {
  bg: string;
  textColor: string;
  fontSize: string;
  shadow: string;
  border: string;
} {
  switch (val) {
    case 2:
      return {
        bg: 'bg-[#FDFBF7]',
        textColor: 'text-zinc-900',
        fontSize: 'text-2xl sm:text-3xl font-black',
        shadow: 'shadow-[0_3px_0_0_#d4d4d8]',
        border: 'border-zinc-900',
      };
    case 4:
      return {
        bg: 'bg-[#FEF08A]',
        textColor: 'text-amber-950',
        fontSize: 'text-2xl sm:text-3xl font-black',
        shadow: 'shadow-[0_3px_0_0_#ca8a04]',
        border: 'border-zinc-900',
      };
    case 8:
      return {
        bg: 'bg-[#FED7AA]',
        textColor: 'text-orange-950',
        fontSize: 'text-2xl sm:text-3xl font-black',
        shadow: 'shadow-[0_3px_0_0_#ea580c]',
        border: 'border-zinc-900',
      };
    case 16:
      return {
        bg: 'bg-[#FDBA74]',
        textColor: 'text-orange-950',
        fontSize: 'text-2xl sm:text-3xl font-black',
        shadow: 'shadow-[0_3px_0_0_#c2410c]',
        border: 'border-zinc-900',
      };
    case 32:
      return {
        bg: 'bg-[#FB923C]',
        textColor: 'text-white',
        fontSize: 'text-2xl sm:text-3xl font-black',
        shadow: 'shadow-[0_3px_0_0_#9a3412]',
        border: 'border-zinc-900',
      };
    case 64:
      return {
        bg: 'bg-[#F97316]',
        textColor: 'text-white',
        fontSize: 'text-2xl sm:text-3xl font-black',
        shadow: 'shadow-[0_3px_0_0_#7c2d12]',
        border: 'border-zinc-900',
      };
    case 128:
      return {
        bg: 'bg-[#FACC15]',
        textColor: 'text-zinc-950',
        fontSize: 'text-xl sm:text-2xl font-black',
        shadow: 'shadow-[0_4px_0_0_#a16207]',
        border: 'border-zinc-900',
      };
    case 256:
      return {
        bg: 'bg-[#EAB308]',
        textColor: 'text-zinc-950',
        fontSize: 'text-xl sm:text-2xl font-black',
        shadow: 'shadow-[0_4px_0_0_#854d0e]',
        border: 'border-zinc-900',
      };
    case 512:
      return {
        bg: 'bg-[#CA8A04]',
        textColor: 'text-white',
        fontSize: 'text-xl sm:text-2xl font-black',
        shadow: 'shadow-[0_4px_0_0_#713f12]',
        border: 'border-zinc-900',
      };
    case 1024:
      return {
        bg: 'bg-[#A855F7]',
        textColor: 'text-white',
        fontSize: 'text-lg sm:text-xl font-black',
        shadow: 'shadow-[0_4px_0_0_#6b21a8]',
        border: 'border-zinc-900',
      };
    case 2048:
      return {
        bg: 'bg-[#E11D48] animate-pulse',
        textColor: 'text-amber-200',
        fontSize: 'text-lg sm:text-xl font-black',
        shadow: 'shadow-[0_4px_0_0_#881337] ring-2 ring-amber-400',
        border: 'border-amber-300',
      };
    default:
      // > 2048 (4096, 8192, ...)
      return {
        bg: 'bg-[#18181B]',
        textColor: 'text-amber-300',
        fontSize: 'text-base sm:text-lg font-black',
        shadow: 'shadow-[0_4px_0_0_#e11d48] ring-2 ring-rose-500',
        border: 'border-amber-400',
      };
  }
}

export function Game2048Board({ tiles, onMove, disabled = false }: Game2048BoardProps) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (disabled) return;
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (disabled || !touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const minSwipeDistance = 28; // Ngưỡng vuốt tối thiểu

    if (Math.abs(dx) < minSwipeDistance && Math.abs(dy) < minSwipeDistance) {
      return;
    }

    if (Math.abs(dx) > Math.abs(dy)) {
      // Vuốt ngang
      if (dx > 0) {
        onMove('RIGHT');
      } else {
        onMove('LEFT');
      }
    } else {
      // Vuốt dọc
      if (dy > 0) {
        onMove('DOWN');
      } else {
        onMove('UP');
      }
    }
  };

  return (
    <div
      className="relative mx-auto w-full max-w-[360px] sm:max-w-[420px] select-none touch-none [--board-gap:8px] sm:[--board-gap:10px]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Vỏ khung máy Arcade Cabinet */}
      <div className="relative rounded-lg border-4 border-zinc-900 bg-zinc-800 p-2.5 sm:p-3.5 shadow-[6px_6px_0_0_#18181b] overflow-hidden">
        {/* Lớp nền tĩnh: 16 ô slot cố định */}
        <div
          className="grid grid-cols-4 grid-rows-4 aspect-square w-full"
          style={{ gap: 'var(--board-gap)' }}
        >
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-center rounded border-2 border-zinc-900/40 bg-zinc-700/50 shadow-inner"
            />
          ))}
        </div>

        {/* Lớp ô số động: Tự động trượt mượt mà (smooth sliding) theo tọa độ (row, col) */}
        <div className="absolute inset-2.5 sm:inset-3.5 pointer-events-none">
          {tiles.map((tile) => {
            const style = getTileStyle(tile.value);

            return (
              <div
                key={tile.id}
                className={`absolute ${
                  tile.isDeleted ? 'z-0 opacity-0 pointer-events-none' : 'z-10'
                }`}
                style={{
                  top: 0,
                  left: 0,
                  width: 'calc((100% - 3 * var(--board-gap)) / 4)',
                  height: 'calc((100% - 3 * var(--board-gap)) / 4)',
                  transform: `translate3d(calc(${tile.col} * (100% + var(--board-gap))), calc(${tile.row} * (100% + var(--board-gap))), 0)`,
                  transition: 'transform 110ms cubic-bezier(0.25, 1, 0.5, 1)',
                }}
              >
                <div
                  className={`flex h-full w-full items-center justify-center rounded border-2 ${style.border} ${style.bg} ${style.textColor} ${style.shadow} font-pixel ${
                    tile.isMerged ? 'animate-tile-pop' : tile.isNew ? 'animate-tile-appear' : ''
                  }`}
                >
                  <span className={style.fontSize}>{tile.value}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
