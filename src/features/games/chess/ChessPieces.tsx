import React from 'react';

interface ChessPieceProps {
  type: string; // 'p' | 'n' | 'b' | 'r' | 'q' | 'k'
  color: 'w' | 'b';
  className?: string;
}

export function ChessPiece({ type, color, className = 'w-full h-full' }: ChessPieceProps) {
  const isWhite = color === 'w';

  // Crisp Unicode chess glyphs styled with modern gradients and shadows
  const pieceSymbols: Record<string, { w: string; b: string }> = {
    p: { w: '♙', b: '♟' },
    n: { w: '♘', b: '♞' },
    b: { w: '♗', b: '♝' },
    r: { w: '♖', b: '♜' },
    q: { w: '♕', b: '♛' },
    k: { w: '♔', b: '♚' },
  };

  const symbol = pieceSymbols[type.toLowerCase()]?.[color] || '';

  return (
    <span
      className={`inline-flex items-center justify-center select-none text-[28px] sm:text-4xl md:text-5xl font-serif leading-none transition-transform active:scale-110 ${className} ${
        isWhite
          ? 'text-white drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] filter hover:brightness-110'
          : 'text-gray-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.4)] hover:brightness-125'
      }`}
      aria-label={`${isWhite ? 'White' : 'Black'} ${type.toUpperCase()}`}
    >
      {symbol}
    </span>
  );
}

