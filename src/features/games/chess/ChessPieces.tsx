import React from 'react';

interface ChessPieceProps {
  type: string; // 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
  color: 'w' | 'b';
  className?: string;
}

export function ChessPiece({ type, color, className = 'w-full h-full' }: ChessPieceProps) {
  const isWhite = color === 'w';
  const pieceType = type.toLowerCase();

  // High-contrast 16-bit Pixel Art Palette
  // Black pieces get a crisp light rim/highlight so they pop clearly on dark wood squares
  const outline = '#18181B';
  const bodyFill = isWhite ? '#FFFFFF' : '#27272A';
  const shadeFill = isWhite ? '#CBD5E1' : '#18181B';
  const specFill = isWhite ? '#FEF08A' : '#94A3B8';
  const crownGold = '#FACC15';
  const gemColor = isWhite ? '#EF4444' : '#F97316';

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${className}`}
      aria-label={`${isWhite ? 'White' : 'Black'} ${pieceType.toUpperCase()}`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`w-[88%] h-[88%] pixelated ${
          isWhite
            ? 'drop-shadow-[0_2px_0_rgba(24,24,27,0.85)]'
            : 'drop-shadow-[0_1px_0_rgba(255,253,245,0.9)]'
        }`}
        shapeRendering="crispEdges"
      >
        {/* ================= PAWN (TỐT) — Nhỏ gọn, đầu tròn ================= */}
        {pieceType === 'p' && (
          <>
            {/* Outer Outline */}
            <path
              fill={outline}
              d="M9 5h6v1h2v5h-2v2h2v3h2v2h1v4H4v-4h1v-2h2v-3h2v-2H7V6h2V5z"
            />
            {/* Main Body */}
            <path
              fill={bodyFill}
              d="M9 6h6v5H9V6zm1 6h4v2h-4v-2zm-2 2h8v2H8v-2zm-2 3h12v1H6v-1zm-1 2h14v2H5v-2z"
            />
            {/* Shading & Highlights */}
            <path fill={specFill} d="M9 6h2v3H9V6zm-3 11h12v1H6v-1z" />
            <path
              fill={shadeFill}
              d="M13 7h2v4h-2V7zm0 5h1v2h-1v-2zm1 2h2v2h-2v-2zm2 5h3v2h-3v-2z"
            />
          </>
        )}

        {/* ================= ROOK (XE) — Tháp pháo đài 3 зуб vuông vức ================= */}
        {pieceType === 'r' && (
          <>
            {/* Outer Outline */}
            <path
              fill={outline}
              d="M4 3h4v2h2V3h4v2h2V3h4v6h-2v6h2v2h1v5H3v-5h1v-2h2V9H4V3z"
            />
            {/* Main Body */}
            <path
              fill={bodyFill}
              d="M5 4h2v3h3V4h4v3h3V4h2v4H5V4zm2 5h10v6H7V9zm-2 7h14v1H5v-1zm-1 2h16v3H4v-3z"
            />
            {/* Castle Slit Window */}
            <rect x="11" y="10" width="2" height="3" fill={outline} />
            {/* Highlights & Shading */}
            <path fill={specFill} d="M5 7h14v1H5V7zm0 9h14v1H5v-1z" />
            <path
              fill={shadeFill}
              d="M14 9h3v6h-3V9zm2 9h4v3h-4v-3z"
            />
          </>
        )}

        {/* ================= KNIGHT (MÃ) — Đầu chiến mã nhìn nghiêng rõ nét ================= */}
        {pieceType === 'n' && (
          <>
            {/* Outer Outline */}
            <path
              fill={outline}
              d="M11 2h4v1h2v2h2v4h1v6h-1v2h2v5H3v-5h2v-2h2v-3H3V8h2V6h2V4h4V2z"
            />
            {/* Horse Head & Neck Body */}
            <path
              fill={bodyFill}
              d="M11 3h3v1h2v2h2v8H8v-3h2V9H4V8h2V7h2V5h3V3zm-5 12h12v2H6v-2zm-2 3h16v3H4v-3z"
            />
            {/* Horse Eye & Nostril */}
            <rect x="8" y="6" width="2" height="2" fill={outline} />
            <rect x="8" y="6" width="1" height="1" fill="#FACC15" />
            <rect x="5" y="8" width="1" height="1" fill={outline} />
            {/* Flowing Golden/Silver Mane */}
            <path
              fill={crownGold}
              d="M14 4h2v2h-2V4zm2 2h2v4h-2V6zm0 4h3v4h-3v-4z"
            />
            {/* Base Highlight & Shade */}
            <path fill={specFill} d="M6 16h12v1H6v-1z" />
            <path fill={shadeFill} d="M14 18h6v3h-6v-3z" />
          </>
        )}

        {/* ================= BISHOP (TƯỢNG) — Mũ giáo chủ chóp nhọn & Chữ thập sáng ================= */}
        {pieceType === 'b' && (
          <>
            {/* Outer Outline */}
            <path
              fill={outline}
              d="M10 1h4v3h2v2h2v3h1v4h-2v2h2v2h2v5H3v-5h2v-2h2v-2H5V9h1V6h2V4h2V1z"
            />
            {/* Top Orb */}
            <rect x="11" y="2" width="2" height="2" fill={crownGold} />
            {/* Mitre Hat & Body */}
            <path
              fill={bodyFill}
              d="M9 5h6v2h2v2h1v3H6V9h1V7h2V5zm-1 8h8v2H8v-2zm-2 3h12v1H6v-1zm-2 2h16v3H4v-3z"
            />
            {/* Prominent Diagonal / Cross Emblem on Hat */}
            <path
              fill={gemColor}
              d="M11 6h2v5h-2V6zM9 8h6v2H9V8z"
            />
            {/* Collar & Base Highlights */}
            <path fill={crownGold} d="M8 13h8v1H8v-1z" />
            <path fill={specFill} d="M6 16h12v1H6v-1z" />
            <path fill={shadeFill} d="M15 18h5v3h-5v-3z" />
          </>
        )}

        {/* ================= QUEEN (HẬU) — Vương miện 5 nhánh xòe rộng đính ngọc ================= */}
        {pieceType === 'q' && (
          <>
            {/* Outer Outline */}
            <path
              fill={outline}
              d="M2 4h3v3h2V3h3v4h1V2h2v5h1V3h3v4h2V4h3v7h-1v3h-1v2h2v2h1v4H3v-4h1v-2h2v-2H5v-3H4V4H2z"
            />
            {/* Crown Spikes & Body */}
            <path
              fill={bodyFill}
              d="M3 5h1v5h2V4h2v6h3V3h2v7h3V4h2v6h2V5h1v5H3V5zm3 6h12v3H6v-3zm0 4h12v1H6v-1zm-2 3h16v3H4v-3z"
            />
            {/* 5 Crown Tip Pearls */}
            <rect x="3" y="5" width="1" height="2" fill={crownGold} />
            <rect x="6" y="4" width="2" height="2" fill={crownGold} />
            <rect x="11" y="3" width="2" height="2" fill={gemColor} />
            <rect x="16" y="4" width="2" height="2" fill={crownGold} />
            <rect x="20" y="5" width="1" height="2" fill={crownGold} />
            {/* Royal Gold Band & Jewels */}
            <rect x="6" y="11" width="12" height="2" fill={crownGold} />
            <rect x="8" y="11" width="2" height="1" fill={gemColor} />
            <rect x="14" y="11" width="2" height="1" fill={gemColor} />
            <path fill={specFill} d="M6 15h12v1H6v-1z" />
            <path fill={shadeFill} d="M15 18h5v3h-5v-3z" />
          </>
        )}

        {/* ================= KING (VUA) — Chữ thập vàng lớn trên đỉnh vương miện ================= */}
        {pieceType === 'k' && (
          <>
            {/* Outer Outline */}
            <path
              fill={outline}
              d="M10 0h4v2h2v2h-2v2h5v2h2v5h-2v2h2v2h1v5H2v-5h1v-2h2v-2H3V8h2V6h5V4H8V2h2V0z"
            />
            {/* Large Bold Golden Cross on Top */}
            <path
              fill={crownGold}
              d="M11 1h2v5h-2V1zM9 2h6v2H9V2z"
            />
            {/* Royal Crown Cushion & Body */}
            <path
              fill={bodyFill}
              d="M6 7h12v1h2v4H4V8h2V7zm1 6h10v2H7v-2zm-2 3h14v1H5v-1zm-2 2h18v3H3v-3z"
            />
            {/* Royal Gold Belt & Center Ruby */}
            <rect x="6" y="11" width="12" height="2" fill={crownGold} />
            <rect x="10" y="8" width="4" height="3" fill={gemColor} />
            <rect x="6" y="9" width="2" height="2" fill={crownGold} />
            <rect x="16" y="9" width="2" height="2" fill={crownGold} />
            <path fill={specFill} d="M5 16h14v1H5v-1z" />
            <path fill={shadeFill} d="M15 18h6v3h-6v-3z" />
          </>
        )}
      </svg>
    </span>
  );
}
