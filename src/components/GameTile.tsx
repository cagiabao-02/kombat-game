'use client';

import React from 'react';
import Link from 'next/link';
import { GameId, GameMetadata } from '@/types/game';
import { useLanguage } from '@/i18n/LanguageContext';
import { ChessPiece } from '@/features/games/chess/ChessPieces';

/** Biểu tượng pixel đại diện cho từng game. Thêm game mới: bổ sung một nhánh ở đây. */
export function GameIcon({ id }: { id: GameId }) {
  switch (id) {
    case 'chess':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#F3E5AB]">
          <ChessPiece type="n" color="b" className="h-[80%] w-[80%]" />
        </div>
      );

    case 'xiangqi':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#EAD2A8]">
          <div className="flex h-[72%] w-[72%] items-center justify-center rounded-full border-2 border-zinc-900 bg-[#FDFBF7] shadow-[0_3px_0_0_#18181b]">
            <div className="flex h-[82%] w-[82%] items-center justify-center rounded-full border-2 border-[#dc2626]">
              <span
                className="text-[1.6rem] sm:text-[1.9rem] font-black leading-none text-[#b91c1c]"
                style={{ fontFamily: '"KaiTi", "SimSun", "Songti SC", serif' }}
              >
                帥
              </span>
            </div>
          </div>
        </div>
      );

    case 'go':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#DE9F56]">
          <svg viewBox="0 0 16 16" className="h-[80%] w-[80%] pixelated" shapeRendering="crispEdges">
            {/* Lưới bàn cờ Cờ Vây */}
            <path d="M0 4h16v1H0z M0 8h16v1H0z M0 12h16v1H0z" fill="#784719" />
            <path d="M4 0h1v16H4z M8 0h1v16H8z M12 0h1v16h-1z" fill="#784719" />
            {/* Điểm sao Tengen */}
            <rect x="8" y="8" width="1" height="1" fill="#3D2008" />

            {/* Quân Cờ Đen tròn pixel ở góc (4,4) */}
            <circle cx="4.5" cy="4.5" r="3" fill="#000000" />
            <circle cx="3.5" cy="3.5" r="0.8" fill="#555555" />

            {/* Quân Cờ Trắng tròn pixel ở góc (10.5, 9.5) */}
            <circle cx="10.5" cy="9.5" r="3.2" fill="#D1CFC4" />
            <circle cx="10.5" cy="9.5" r="2.8" fill="#FFFFFF" />
            <circle cx="9.5" cy="8.5" r="0.8" fill="#FFFFFF" />
          </svg>
        </div>
      );

    case 'caro':
      return (
        <div className="flex h-full w-full items-center justify-center bg-rose-100">
          {/* Lưới cờ caro 3x3 đối xứng pixel 17x17 (mỗi ô đúng 5x5 px) */}
          <svg viewBox="0 0 17 17" className="h-[75%] w-[75%] pixelated" shapeRendering="crispEdges">
            {/* Đường kẻ lưới caro màu hồng đậm */}
            <path d="M5 0h1v17H5zM11 0h1v17h-1zM0 5h17v1H0zM0 11h17v1H0z" fill="#FDA4AF" />
            
            {/* Quân X đỏ chuẩn pixel ở ô trên-trái (0,0) */}
            <path
              d="M0 0h1v1H0zM4 0h1v1H4zM1 1h1v1H1zM3 1h1v1H3zM2 2h1v1H2zM1 3h1v1H1zM3 3h1v1H3zM0 4h1v1H0zM4 4h1v1H4z"
              fill="#E11D48"
            />

            {/* Quân O xanh chuẩn pixel ở ô giữa (6,6) */}
            <path
              d="M7 6h3v1H7zM6 7h1v3H6zM10 7h1v3h-1zM7 10h3v1H7z"
              fill="#2563EB"
            />

            {/* Quân X đỏ chuẩn pixel ở ô dưới-phải (12,12) */}
            <path
              d="M12 12h1v1h-1zM16 12h1v1h-1zM13 13h1v1h-1zM15 13h1v1h-1zM14 14h1v1h-1zM13 15h1v1h-1zM15 15h1v1h-1zM12 16h1v1h-1zM16 16h1v1h-1z"
              fill="#E11D48"
            />
          </svg>
        </div>
      );

    case 'sudoku':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#9BBC0F]">
          <div className="grid h-[72%] w-[72%] grid-cols-3 grid-rows-3 border-2 border-[#0F380F] bg-[#8BAC0F]">
            {['5', '', '8', '', '7', '', '2', '', '4'].map((n, i) => (
              <span
                key={i}
                className={`flex items-center justify-center font-mono text-[0.7rem] sm:text-xs font-black text-[#0F380F] ${
                  i % 3 !== 2 ? 'border-r border-[#0F380F]/50' : ''
                } ${i < 6 ? 'border-b border-[#0F380F]/50' : ''} ${n === '7' ? 'bg-amber-300' : ''}`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      );

    case 'snake':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#DCFCE7]">
          <svg viewBox="0 0 16 16" className="h-[78%] w-[78%] pixelated" shapeRendering="crispEdges">
            {/* Táo đỏ */}
            <path d="M12 3h1v1h-1z" fill="#15803D" />
            <path d="M11 4h3v3h-3z" fill="#E11D48" />
            <path d="M12 4h1v1h-1z" fill="#FDA4AF" />

            {/* Thân rắn */}
            <path d="M2 7h3v2H2z M2 9h2v4H2z M4 11h4v2H4z M6 8h2v3H6z" fill="#16A34A" />
            <path d="M3 7h1v1H3z M5 11h2v1H5z" fill="#86EFAC" />

            {/* Đầu rắn */}
            <path d="M7 6h3v3H7z" fill="#15803D" />
            {/* Mắt rắn */}
            <path d="M8 7h2v1H8z" fill="#FEF08A" />
            <path d="M9 7h1v1H9z" fill="#0F172A" />
            {/* Lưỡi rắn thò ra */}
            <path d="M10 8h1v1h-1z" fill="#E11D48" />
          </svg>
        </div>
      );

    case 'game2048':
      return (
        <div className="flex h-full w-full items-center justify-center bg-amber-100 p-1.5">
          <div className="grid h-full w-full grid-cols-2 grid-rows-2 gap-1 border-2 border-zinc-900 bg-zinc-800 p-1 shadow-[2px_2px_0_0_#18181b]">
            <div className="flex items-center justify-center border border-zinc-900 bg-[#FDFBF7] font-pixel text-[11px] font-black text-zinc-900">
              2
            </div>
            <div className="flex items-center justify-center border border-zinc-900 bg-[#FEF08A] font-pixel text-[11px] font-black text-amber-950">
              4
            </div>
            <div className="flex items-center justify-center border border-zinc-900 bg-[#FB923C] font-pixel text-[11px] font-black text-white">
              8
            </div>
            <div className="flex items-center justify-center border border-amber-300 bg-[#E11D48] font-pixel text-[9px] font-black text-amber-200">
              2048
            </div>
          </div>
        </div>
      );

    case 'minesweeper':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#C0C0C0] p-1.5">
          <div className="flex h-full w-full items-center justify-center border-2 border-t-white border-l-white border-r-zinc-700 border-b-zinc-700 bg-[#C0C0C0] shadow-[2px_2px_0_0_#18181b]">
            <svg viewBox="0 0 16 16" className="h-[75%] w-[75%] pixelated" shapeRendering="crispEdges">
              {/* Thân quả mìn gai kinh điển */}
              <path d="M5 3h6v1H5z M4 4h8v1H4z M3 5h10v6H3z M4 11h8v1H4z M5 12h6v1H5z" fill="#18181B" />
              {/* Các gai mìn 4 hướng chính */}
              <path d="M7 1h2v2H7z M7 13h2v2H7z M1 7h2v2H1z M13 7h2v2H13z" fill="#18181B" />
              {/* Các gai mìn 4 góc chéo */}
              <path d="M2 2h2v2H2z M12 2h2v2H12z M2 12h2v2H2z M12 12h2v2H12z" fill="#18181B" />
              {/* Điểm phản quang pixel màu trắng */}
              <path d="M5 5h2v2H5z" fill="#FFFFFF" />
              <path d="M7 5h1v1H7z M5 7h1v1H5z" fill="#A1A1AA" />
              {/* Cột và cờ đỏ 🚩 */}
              <path d="M10 2h4v3h-4z" fill="#EF4444" />
              <path d="M11 2h1v6h-1z" fill="#B91C1C" />
            </svg>
          </div>
        </div>
      );

    case 'brick_breaker':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#090D16]">
          <svg viewBox="0 0 16 16" className="h-[78%] w-[78%] pixelated" shapeRendering="crispEdges">
            {/* Hàng gạch đỏ */}
            <path d="M1 2h4v2H1z M6 2h4v2H6z M11 2h4v2h-4z" fill="#EF4444" />
            {/* Hàng gạch cam */}
            <path d="M1 5h4v2H1z M6 5h4v2H6z M11 5h4v2h-4z" fill="#F97316" />
            {/* Hàng gạch xanh lá */}
            <path d="M1 8h4v2H1z M6 8h4v2H6z M11 8h4v2h-4z" fill="#10B981" />
            {/* Quả bóng pixel */}
            <path d="M7 11h2v2H7z" fill="#FFFFFF" />
            {/* Thanh trượt Paddle */}
            <path d="M3 14h10v2H3z" fill="#06B6D4" />
            <path d="M4 14h8v1H4z" fill="#E0F2FE" />
          </svg>
        </div>
      );

    case 't_rex_runner':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#FDF6E2]">
          <svg viewBox="0 0 16 16" className="h-[80%] w-[80%] pixelated" shapeRendering="crispEdges">
            {/* Mặt trời / Mây nhẹ */}
            <path d="M1 2h3v1H1z" fill="#D4D4D8" />
            {/* Khủng long T-Rex */}
            <path d="M7 2h5v4H7z M12 3h3v2h-3z" fill="#27272A" />
            {/* Mắt T-Rex */}
            <path d="M9 3h1v1H9z" fill="#FDF6E2" />
            {/* Thân & đuôi T-Rex */}
            <path d="M4 6h6v5H4z M2 7h2v3H2z M10 7h2v1h-2z" fill="#27272A" />
            {/* 2 Chân T-Rex */}
            <path d="M5 11h2v3H5z M8 11h2v3H8z" fill="#27272A" />
            {/* Xương rồng */}
            <path d="M13 9h1v5h-1z M12 10h1v2h-1z M14 11h1v2h-1z" fill="#059669" />
            {/* Đường đất sa mạc */}
            <path d="M0 14h16v1H0z" fill="#52525B" />
          </svg>
        </div>
      );

    case 'flappy_bird':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#70C5CE]">
          <svg viewBox="0 0 16 16" className="h-[80%] w-[80%] pixelated" shapeRendering="crispEdges">
            {/* Cột ống nước trên & dưới */}
            <path d="M12 0h3v4h-3z M11 4h5v2h-5z M11 11h5v2h-5z M12 13h3v1h-3z" fill="#15803D" />
            {/* Thân chim vàng */}
            <path d="M3 5h6v6H3z M2 6h8v4H2z" fill="#FACC15" />
            {/* Cánh trắng */}
            <path d="M3 7h3v2H3z" fill="#FFFFFF" />
            {/* Mắt to */}
            <path d="M7 5h3v3H7z" fill="#FFFFFF" />
            <path d="M8 6h2v2H8z" fill="#000000" />
            {/* Mỏ cam */}
            <path d="M10 8h3v2h-3z" fill="#EA580C" />
            {/* Bụng trắng */}
            <path d="M4 10h4v1H4z" fill="#FFFFFF" />
            {/* Đất cỏ */}
            <path d="M0 14h16v1H0z" fill="#65A30D" />
            <path d="M0 15h16v1H0z" fill="#CA8A04" />
          </svg>
        </div>
      );

    case 'block_blast':
      return (
        <div className="flex h-full w-full items-center justify-center bg-[#1e232a]">
          <svg viewBox="0 0 16 16" className="h-[80%] w-[80%] pixelated" shapeRendering="crispEdges">
            {/* Khối L xanh dương */}
            <path d="M2 2h3v6H2z M5 5h3v3H5z" fill="#3B82F6" />
            <path d="M2 2h1v6H2z M3 2h2v1H3z" fill="#93C5FD" />

            {/* Khối vuông 2x2 vàng */}
            <path d="M8 2h6v6H8z" fill="#EAB308" />
            <path d="M8 2h1v6H8z M9 2h5v1H9z" fill="#FEF08A" />

            {/* Khối chữ T hồng/tím */}
            <path d="M2 10h9v3H2z M5 13h3v2H5z" fill="#EC4899" />
            <path d="M2 10h1v3H2z M3 10h8v1H3z" fill="#FBCFE8" />

            {/* Tia nổ Blast lấp lánh ở góc phải */}
            <path d="M13 10h1v1h-1z M12 11h3v1h-3z M13 12h1v1h-1z" fill="#FACC15" />
            <path d="M14 9h1v1h-1z M11 13h1v1h-1z" fill="#FFFFFF" />
          </svg>
        </div>
      );

    default:
      return null;
  }
}

const TILE_SIZE = 'h-20 w-20 sm:h-24 sm:w-24';

/** Ô biểu tượng game gọn tại sảnh; tên hiện khi rê chuột/focus (desktop), hiện sẵn bên dưới trên mobile. */
export function GameTile({ game }: { game: GameMetadata }) {
  const { language, t } = useLanguage();
  const name = game.name[language];

  return (
    <Link
      href={game.route}
      aria-label={`${name} — ${game.shortDescription[language]}`}
      className="group relative flex w-20 sm:w-24 flex-col items-center outline-none"
    >
      <div
        className={`pixel-card relative overflow-hidden p-0 ${TILE_SIZE} group-focus-visible:ring-4 group-focus-visible:ring-indigo-500`}
      >
        <GameIcon id={game.id} />

        {game.status !== 'available' && (
          <span className="absolute right-0 top-0 border-b-2 border-l-2 border-zinc-900 bg-amber-300 px-1 font-pixel text-[9px] font-bold text-zinc-900">
            {t.status[game.status]}
          </span>
        )}
      </div>

      {/* Tooltip tên game (desktop: hover / bàn phím: focus) */}
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 hidden -translate-x-1/2 whitespace-nowrap sm:group-hover:block sm:group-focus-visible:block"
      >
        <div className="pixel-box-sm bg-zinc-900 px-3 py-1.5 text-center">
          <p className="font-pixel text-sm font-bold text-amber-300">{name}</p>
          {game.badge && (
            <p className="font-mono text-[10px] font-bold text-zinc-300">{game.badge[language]}</p>
          )}
        </div>
        {/* Mũi tên pixel */}
        <div className="mx-auto h-2 w-3 bg-zinc-900 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      </div>

      {/* Mobile không có hover: hiện tên ngắn bên dưới */}
      <span className="mt-2 w-full truncate text-center font-pixel text-[11px] font-bold text-zinc-800 sm:hidden">
        {name}
      </span>
    </Link>
  );
}

/** Ô "Sắp có" cho thể loại chưa đủ game. */
export function UpcomingTile({ label }: { label?: string }) {
  const { language } = useLanguage();
  return (
    <div className="group relative flex w-20 sm:w-24 flex-col items-center" tabIndex={0}>
      <div
        className={`flex items-center justify-center border-2 border-dashed border-zinc-400 bg-[#FFFDF8]/60 font-pixel text-3xl font-bold text-zinc-400 ${TILE_SIZE}`}
      >
        ?
      </div>
      <div
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-3 hidden -translate-x-1/2 whitespace-nowrap sm:group-hover:block sm:group-focus-visible:block"
      >
        <div className="pixel-box-sm bg-zinc-900 px-3 py-1.5 text-center">
          <p className="font-pixel text-xs sm:text-sm font-bold text-amber-300">
            {language === 'vi' ? 'SẮP CÓ' : 'COMING SOON'}
          </p>
        </div>
        <div className="mx-auto h-2 w-3 bg-zinc-900 [clip-path:polygon(0_0,100%_0,50%_100%)]" />
      </div>
      <span className="mt-2 w-full truncate text-center font-pixel text-[11px] font-bold text-zinc-400">
        {language === 'vi' ? 'Sắp có' : 'Soon'}
      </span>
    </div>
  );
}
