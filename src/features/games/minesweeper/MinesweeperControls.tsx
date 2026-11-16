'use client';

import React from 'react';
import { MinesweeperDifficulty, DIFFICULTIES } from './minesweeperLogic';
import { useLanguage } from '@/i18n/LanguageContext';
import { Flag, Shovel, Trophy } from 'lucide-react';

interface MinesweeperControlsProps {
  difficulty: MinesweeperDifficulty;
  onSelectDifficulty: (d: MinesweeperDifficulty) => void;
  remainingMines: number;
  timeSeconds: number;
  faceState: 'idle' | 'scared' | 'won' | 'lost';
  onReset: () => void;
  activeTool: 'dig' | 'flag';
  onToggleTool: (tool: 'dig' | 'flag') => void;
  bestTime: number | null;
  disabled?: boolean;
  zoomLevel?: number;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
}

export function MinesweeperControls({
  difficulty,
  onSelectDifficulty,
  remainingMines,
  timeSeconds,
  faceState,
  onReset,
  activeTool,
  onToggleTool,
  bestTime,
  disabled = false,
  zoomLevel = 100,
  onZoomIn,
  onZoomOut,
  onZoomReset,
}: MinesweeperControlsProps) {
  const { language } = useLanguage();

  // Định dạng hiển thị LED 3 chữ số (-99 đến 999)
  const formatDigits = (num: number): string => {
    if (num < 0) {
      const abs = Math.abs(num);
      return `-${String(abs).padStart(2, '0')}`;
    }
    const clamped = Math.min(999, Math.max(0, num));
    return String(clamped).padStart(3, '0');
  };

  const getFaceEmoji = () => {
    switch (faceState) {
      case 'scared':
        return '😮';
      case 'won':
        return '😎';
      case 'lost':
        return '😵';
      default:
        return '🙂';
    }
  };

  return (
    <div className="mb-4 flex flex-col gap-3">
      {/* 1. Chọn cấp độ khó */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex border-2 border-zinc-950 bg-white p-1 shadow-pixel-xs">
          {(Object.keys(DIFFICULTIES) as MinesweeperDifficulty[]).map((d) => {
            const isSelected = d === difficulty;
            const conf = DIFFICULTIES[d];
            return (
              <button
                key={d}
                type="button"
                onClick={() => onSelectDifficulty(d)}
                className={`px-2.5 py-1 font-pixel text-xs font-bold transition-colors ${
                  isSelected
                    ? 'bg-zinc-900 text-amber-300 shadow-inner'
                    : 'text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                {language === 'vi' ? conf.nameVi : conf.nameEn}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {/* Nút Thu phóng (Zoom) kích thước ô */}
          {onZoomIn && onZoomOut && (
            <div className="flex items-center border-2 border-zinc-900 bg-white px-1.5 py-1 font-pixel text-xs font-bold shadow-pixel-xs">
              <span className="text-[10px] text-zinc-500 mr-1 hidden sm:inline">
                {language === 'vi' ? 'Ô:' : 'Size:'}
              </span>
              <button
                type="button"
                onClick={onZoomOut}
                className="px-1.5 hover:bg-zinc-100 text-zinc-800 font-bold active:scale-95"
                title={language === 'vi' ? 'Thu nhỏ ô' : 'Zoom out'}
              >
                −
              </button>
              <button
                type="button"
                onClick={onZoomReset}
                className="px-1 font-mono text-[11px] text-zinc-700 hover:text-indigo-600"
                title={language === 'vi' ? 'Đặt lại kích thước' : 'Reset zoom'}
              >
                {zoomLevel}%
              </button>
              <button
                type="button"
                onClick={onZoomIn}
                className="px-1.5 hover:bg-zinc-100 text-zinc-800 font-bold active:scale-95"
                title={language === 'vi' ? 'Phóng to ô' : 'Zoom in'}
              >
                +
              </button>
            </div>
          )}

          {/* Kỷ lục tốt nhất của cấp độ hiện tại */}
          <div className="flex items-center gap-1.5 border-2 border-zinc-900 bg-amber-100 px-2.5 py-1 font-pixel text-xs font-bold text-amber-950 shadow-pixel-xs">
            <Trophy className="h-3.5 w-3.5 text-amber-700" />
            <span>{language === 'vi' ? 'Kỷ lục:' : 'Best:'}</span>
            <span className="font-mono text-zinc-900">
              {bestTime !== null ? `${bestTime}s` : '--'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Bảng điều khiển kiểu Máy thùng Arcade / Windows cổ điển */}
      <div className="flex items-center justify-between border-4 border-zinc-950 bg-[#C0C0C0] p-2.5 shadow-pixel-sm">
        {/* Bộ đếm số mìn còn lại (LED Đỏ Pixel) */}
        <div className="border-2 border-zinc-900 bg-zinc-950 px-2 py-1 shadow-inner">
          <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-red-500 [text-shadow:0_0_8px_rgba(239,68,68,0.7)]">
            {formatDigits(remainingMines)}
          </span>
        </div>

        {/* Nút Mặt cười tương tác (Smiley Face Reset Button) */}
        <button
          type="button"
          onClick={onReset}
          aria-label={language === 'vi' ? 'Chơi lại ván mới' : 'Restart game'}
          className="flex h-11 w-11 items-center justify-center border-3 border-t-white border-l-white border-r-zinc-800 border-b-zinc-800 bg-[#E0E0E0] active:border-t-zinc-800 active:border-l-zinc-800 active:border-r-white active:border-b-white text-2xl transition-transform active:scale-95 shadow-pixel-xs"
        >
          {getFaceEmoji()}
        </button>

        {/* Đồng hồ đếm giây (LED Đỏ Pixel) */}
        <div className="border-2 border-zinc-900 bg-zinc-950 px-2 py-1 shadow-inner">
          <span className="font-mono text-xl sm:text-2xl font-black tracking-widest text-red-500 [text-shadow:0_0_8px_rgba(239,68,68,0.7)]">
            {formatDigits(timeSeconds)}
          </span>
        </div>
      </div>

      {/* 3. Phím chuyển đổi Đào ô / Cắm cờ cho thiết bị cảm ứng Mobile */}
      <div className="flex items-center justify-center gap-2 sm:hidden">
        <span className="font-pixel text-[11px] text-zinc-600 font-bold">
          {language === 'vi' ? 'Chế độ chạm:' : 'Touch mode:'}
        </span>
        <div className="inline-flex border-2 border-zinc-900 bg-white p-0.5 shadow-pixel-xs">
          <button
            type="button"
            disabled={disabled}
            onClick={() => onToggleTool('dig')}
            className={`inline-flex items-center gap-1 px-3 py-1 font-pixel text-xs font-bold ${
              activeTool === 'dig'
                ? 'bg-emerald-600 text-white'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Shovel className="h-3.5 w-3.5" />
            <span>{language === 'vi' ? 'ĐÀO Ô' : 'DIG'}</span>
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onToggleTool('flag')}
            className={`inline-flex items-center gap-1 px-3 py-1 font-pixel text-xs font-bold ${
              activeTool === 'flag'
                ? 'bg-rose-600 text-white'
                : 'text-zinc-700 hover:bg-zinc-100'
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            <span>{language === 'vi' ? 'CẮM CỜ' : 'FLAG'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
