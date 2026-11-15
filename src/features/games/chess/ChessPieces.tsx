import React from 'react';

interface ChessPieceProps {
  type: string; // 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
  color: 'w' | 'b';
  className?: string;
}

export function ChessPiece({ type, color, className = 'w-full h-full' }: ChessPieceProps) {
  const isWhite = color === 'w';
  const pieceType = type.toLowerCase();

  // 16-bit Palette for White (Ivory + Gold Trim) vs Black (Obsidian + Indigo/Crimson Trim)
  const outline = '#18181B';
  const bodyFill = isWhite ? '#FFFDF5' : '#27272A';
  const shadeFill = isWhite ? '#E2D9C5' : '#18181B';
  const highlightFill = isWhite ? '#FBBF24' : '#818CF8';
  const gemFill = isWhite ? '#EF4444' : '#F59E0B';

  return (
    <span
      className={`inline-flex items-center justify-center select-none ${className}`}
      aria-label={`${isWhite ? 'White' : 'Black'} ${pieceType.toUpperCase()}`}
    >
      <svg
        viewBox="0 0 16 16"
        className="w-[82%] h-[82%] pixelated drop-shadow-[1px_2px_0px_rgba(24,24,27,0.65)]"
        shapeRendering="crispEdges"
      >
        {/* PAWN (TỐT) */}
        {pieceType === 'p' && (
          <>
            {/* Outline */}
            <path
              fill={outline}
              d="M6 3h4v1h1v3h-1v1h1v2h1v2h1v3H3v-3h1v-2h1V8H4V7h1V4h1V3z"
            />
            {/* Body */}
            <path
              fill={bodyFill}
              d="M6 4h4v3H6V4zm0 4h4v2H6V8zm-1 2h6v2H5v-2zm-1 3h8v1H4v-1z"
            />
            {/* Highlight & Shade */}
            <path fill={highlightFill} d="M6 4h2v1H6V4zm-1 9h8v1H4v-1z" />
            <path fill={shadeFill} d="M9 5h1v2H9V5zm0 3h1v2H9V8zm1 2h1v2h-1v-2z" />
          </>
        )}

        {/* ROOK (XE) */}
        {pieceType === 'r' && (
          <>
            {/* Outline */}
            <path
              fill={outline}
              d="M3 2h2v1h2V2h2v1h2V2h2v4h-1v4h1v2h1v3H2v-3h1v-2h1V6H3V2z"
            />
            {/* Body */}
            <path
              fill={bodyFill}
              d="M4 3h1v2h2V3h2v2h2V3h1v2H4V3zm1 3h6v4H5V6zm-1 4h8v2H4v-2zm-1 3h10v1H3v-1z"
            />
            {/* Highlight & Shade */}
            <path fill={highlightFill} d="M4 5h8v1H4V5zm-1 8h10v1H3v-1z" />
            <path fill={shadeFill} d="M9 6h2v4H9V6zm1 4h2v2h-2v-2z" />
          </>
        )}

        {/* KNIGHT (MÃ) */}
        {pieceType === 'n' && (
          <>
            {/* Outline */}
            <path
              fill={outline}
              d="M6 1h4v1h2v3h1v3h-2v2h1v2h1v3H3v-3h1V9h1V7H3V4h2V2h1V1z"
            />
            {/* Body */}
            <path
              fill={bodyFill}
              d="M6 2h4v1h1v4H4V5h2V2zm0 5h5v3H5V8h1V7zm-1 3h7v2H5v-2zm-1 3h8v1H4v-1z"
            />
            {/* Eye & Mane */}
            <rect x="5" y="4" width="1" height="1" fill={outline} />
            <path fill={highlightFill} d="M9 2h2v5H9V2zm-5 11h8v1H4v-1z" />
            <path fill={shadeFill} d="M8 7h3v3H8V7z" />
          </>
        )}

        {/* BISHOP (TƯỢNG) */}
        {pieceType === 'b' && (
          <>
            {/* Outline */}
            <path
              fill={outline}
              d="M7 1h2v2h2v2h1v3h-1v2h1v2h1v3H3v-3h1v-2h1V8H4V5h1V3h2V1z"
            />
            {/* Body */}
            <path
              fill={bodyFill}
              d="M7 2h2v1H7V2zM6 4h4v1h1v3H5V5h1V4zm0 4h4v2H6V8zm-1 2h6v2H5v-2zm-1 3h8v1H4v-1z"
            />
            {/* Cross / Gem & Shade */}
            <path fill={gemFill} d="M7 5h2v2H7V5z" />
            <path fill={highlightFill} d="M7 2h2v1H7V2zm-3 11h8v1H4v-1z" />
            <path fill={shadeFill} d="M9 8h1v2H9V8zm1 2h1v2h-1v-2z" />
          </>
        )}

        {/* QUEEN (HẬU) */}
        {pieceType === 'q' && (
          <>
            {/* Outline */}
            <path
              fill={outline}
              d="M2 3h2v2h1V2h2v3h2V2h2v3h1V3h2v5h-1v2h1v2h1v3H2v-3h1v-2h1V8H3V3H2z"
            />
            {/* Body */}
            <path
              fill={bodyFill}
              d="M3 4h1v3h2V3h1v4h2V3h1v4h2V4h1v4H3V4zm2 4h6v2H5V8zm-1 2h8v2H4v-2zm-1 3h10v1H3v-1z"
            />
            {/* Crown Gems & Trim */}
            <path fill={gemFill} d="M3 4h1v1H3V4zm3-1h1v1H6V3zm3 0h1v1H9V3zm3 1h1v1h-1V4z" />
            <path fill={highlightFill} d="M4 9h8v1H4V9zm-1 4h10v1H3v-1z" />
            <path fill={shadeFill} d="M9 10h3v2H9v-2z" />
          </>
        )}

        {/* KING (VUA) */}
        {pieceType === 'k' && (
          <>
            {/* Outline */}
            <path
              fill={outline}
              d="M7 0h2v1h1v1H9v1h3v2h1v3h-1v2h1v2h1v3H2v-3h1v-2h1V8H3V5h1V3h3V2H6V1h1V0z"
            />
            {/* Royal Cross */}
            <path fill={gemFill} d="M7 1h2v2H7V1z" />
            {/* Body */}
            <path
              fill={bodyFill}
              d="M5 4h6v1h1v3H4V5h1V4zm0 4h6v2H5V8zm-1 2h8v2H4v-2zm-1 3h10v1H3v-1z"
            />
            {/* Crown Jewels & Highlight */}
            <path fill={highlightFill} d="M5 4h6v1H5V4zm-1 5h8v1H4V9zm-1 4h10v1H3v-1z" />
            <path fill={gemFill} d="M6 6h1v1H6V6zm3 0h1v1H9V6z" />
            <path fill={shadeFill} d="M9 10h3v2H9v-2z" />
          </>
        )}
      </svg>
    </span>
  );
}
