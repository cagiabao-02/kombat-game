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

  // Màu sắc truyền thống theo chuẩn cờ tướng kinh điển
  const borderColor = isRed ? 'border-[#b91c1c]' : 'border-[#18181b]';
  const innerRingColor = isRed ? 'border-[#dc2626]/40' : 'border-[#27272a]/30';
  const textColor = isRed ? 'text-[#b91c1c]' : 'text-[#18181b]';
  const subLabelColor = isRed ? 'text-[#dc2626]' : 'text-[#3f3f46]';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`group relative flex h-full w-full items-center justify-center rounded-full transition-all duration-150 select-none outline-none focus:outline-none ${
        disabled ? 'cursor-default' : 'cursor-pointer active:scale-95'
      } ${
        isSelected
          ? 'scale-110 z-30 shadow-2xl ring-4 ring-indigo-500 ring-offset-2 ring-offset-amber-100'
          : isInCheck
          ? 'scale-105 z-20 shadow-xl ring-4 ring-rose-500 animate-pulse'
          : isLastMoveTo
          ? 'scale-105 z-10 shadow-lg ring-2 ring-amber-500 ring-offset-1'
          : isLastMoveFrom
          ? 'opacity-90 ring-2 ring-amber-400/80 ring-dashed'
          : 'shadow-md hover:scale-105 hover:shadow-lg'
      }`}
      aria-label={`${isRed ? 'Đỏ' : 'Đen'} ${info.nameVi}`}
    >
      {/* Thân quân cờ tròn hiệu ứng vân gỗ / ngà 3D sang trọng */}
      <div
        className={`relative flex h-full w-full items-center justify-center rounded-full border-2 ${borderColor} bg-gradient-to-b from-[#fefcf8] via-[#f7ecd9] to-[#ebd4b7] shadow-[inset_0_2px_4px_rgba(255,255,255,0.9),inset_0_-3px_5px_rgba(0,0,0,0.18)] p-0.5`}
      >
        {/* Vòng chỉ đồng tâm bên trong */}
        <div
          className={`flex h-full w-full flex-col items-center justify-center rounded-full border ${innerRingColor} bg-gradient-to-b from-[#fdfbf6]/60 to-[#edd9bd]/40 p-0.5`}
        >
          {/* Chữ Hán thư pháp sắc nét */}
          <span
            className={`font-black tracking-tight leading-none ${textColor} text-base sm:text-lg md:text-xl drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]`}
            style={{
              fontFamily:
                '"Songti SC", "SimSun", "STSong", "KaiTi", "Noto Serif SC", serif',
            }}
          >
            {info.hanzi}
          </span>

          {/* Nhãn phụ tiếng Việt tinh tế giúp người mới dễ chơi */}
          {showSubLabel && (
            <span
              className={`text-[7px] sm:text-[8px] font-black uppercase tracking-tighter leading-none mt-0.5 ${subLabelColor} opacity-90`}
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

