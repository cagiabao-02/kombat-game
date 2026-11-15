'use client';

import React from 'react';
import { Piece, PIECE_INFO } from './xiangqiLogic';

interface XiangqiPieceProps {
  piece: Piece;
  isSelected?: boolean;
  isInCheck?: boolean;
  isLastMoveFrom?: boolean;
  isLastMoveTo?: boolean;
  showSubLabel?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

export function XiangqiPiece({
  piece,
  isSelected = false,
  isInCheck = false,
  isLastMoveFrom = false,
  isLastMoveTo = false,
  showSubLabel = true,
  onClick,
  disabled = false,
}: XiangqiPieceProps) {
  const isRed = piece.side === 'red';
  const info = PIECE_INFO[piece.type][piece.side];

  // Màu sắc truyền thống Cờ Tướng theo phong cách 16-bit Pixel Token
  const innerRingColor = isRed ? 'border-[#dc2626]' : 'border-[#27272a]';
  const textColor = isRed ? 'text-[#b91c1c]' : 'text-[#18181b]';
  const subLabelColor = isRed ? 'text-[#dc2626]' : 'text-[#3f3f46]';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex h-full w-full items-center justify-center rounded-full transition-transform duration-100 select-none outline-none focus:outline-none ${
        disabled ? 'cursor-default' : 'cursor-pointer active:translate-y-0.5'
      } ${
        isSelected
          ? '-translate-y-1 scale-110 z-30 ring-4 ring-indigo-500 ring-offset-1 ring-offset-amber-200'
          : isInCheck
          ? 'scale-105 z-20 ring-4 ring-rose-500 animate-pulse'
          : isLastMoveTo
          ? 'scale-105 z-10 ring-2 ring-amber-500 ring-offset-1'
          : isLastMoveFrom
          ? 'opacity-90 ring-2 ring-amber-500/80 ring-dashed'
          : 'hover:-translate-y-0.5'
      }`}
      aria-label={`${isRed ? 'Đỏ' : 'Đen'} ${info.nameVi}`}
    >
      {/* Thân quân cờ 16-bit Pixel Token với bóng cứng đổ khối */}
      <div
        className="relative flex h-full w-full items-center justify-center rounded-full border-2 border-zinc-900 bg-[#F7ECD9] shadow-[0_3px_0_0_#18181b,inset_0_2px_0_0_#ffffff] p-0.5"
      >
        {/* Vòng chỉ đồng tâm bên trong */}
        <div
          className={`flex h-full w-full flex-col items-center justify-center rounded-full border-2 ${innerRingColor} bg-[#FDFBF7] p-0.5`}
        >
          {/* Chữ Hán thư pháp sắc nét */}
          <span
            className={`font-black tracking-tight leading-none ${textColor} text-base sm:text-lg md:text-xl`}
            style={{
              fontFamily:
                '"Songti SC", "SimSun", "STSong", "KaiTi", "Noto Serif SC", serif',
            }}
          >
            {info.hanzi}
          </span>

          {/* Nhãn phụ tiếng Việt Pixel */}
          {showSubLabel && (
            <span
              className={`font-pixel text-[7px] sm:text-[8px] font-bold uppercase tracking-tighter leading-none mt-0.5 ${subLabelColor}`}
            >
              {piece.type === 'general'
                ? 'Tướng'
                : piece.type === 'advisor'
                ? 'Sĩ'
                : piece.type === 'elephant'
                ? 'Tượng'
                : piece.type === 'horse'
                ? 'Mã'
                : piece.type === 'chariot'
                ? 'Xe'
                : piece.type === 'cannon'
                ? 'Pháo'
                : isRed
                ? 'Binh'
                : 'Tốt'}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
