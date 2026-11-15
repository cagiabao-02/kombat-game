'use client';

import React, { useState, useMemo } from 'react';
import { Chess, Square, Move } from 'chess.js';
import { PlayerColor } from './types';
import { ChessPiece } from './ChessPieces';

interface ChessBoardProps {
  fen: string;
  playerColor: PlayerColor;
  isMyTurn: boolean;
  lastMove: { from: string; to: string } | null;
  isCheck: boolean;
  onMakeMove: (move: { from: string; to: string; promotion?: string }) => void;
  disabled?: boolean;
}

export function ChessBoard({
  fen,
  playerColor,
  isMyTurn,
  lastMove,
  isCheck,
  onMakeMove,
  disabled = false,
}: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<Square | null>(null);
  const [pendingPromotion, setPendingPromotion] = useState<{ from: Square; to: Square } | null>(null);

  // Initialize Chess instance with current FEN
  const chess = useMemo(() => {
    try {
      return new Chess(fen);
    } catch {
      return new Chess();
    }
  }, [fen]);

  // Compute valid moves for selected square
  const validMoves = useMemo(() => {
    if (!selectedSquare || !isMyTurn || disabled) return [];
    try {
      const moves = chess.moves({ square: selectedSquare, verbose: true }) as Move[];
      return moves.map((m) => m.to as Square);
    } catch {
      return [];
    }
  }, [chess, selectedSquare, isMyTurn, disabled]);

  // Ranks & Files ordering depending on player orientation
  const ranks = playerColor === 'white' ? [8, 7, 6, 5, 4, 3, 2, 1] : [1, 2, 3, 4, 5, 6, 7, 8];
  const files = playerColor === 'white' ? ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] : ['h', 'g', 'f', 'e', 'd', 'c', 'b', 'a'];

  const handleSquareClick = (square: Square) => {
    if (disabled || !isMyTurn || pendingPromotion) return;

    const piece = chess.get(square);
    const myTurnColorChar = playerColor === 'white' ? 'w' : 'b';

    // If square is an allowed move from selected square
    if (selectedSquare && validMoves.includes(square)) {
      const selectedPiece = chess.get(selectedSquare);
      const isPromotion =
        selectedPiece?.type === 'p' &&
        ((selectedPiece.color === 'w' && square[1] === '8') ||
          (selectedPiece.color === 'b' && square[1] === '1'));

      if (isPromotion) {
        // Open promotion choice dialog
        setPendingPromotion({ from: selectedSquare, to: square });
        return;
      }

      onMakeMove({
        from: selectedSquare,
        to: square,
      });

      setSelectedSquare(null);
      return;
    }

    // If clicking own piece, select it
    if (piece && piece.color === myTurnColorChar) {
      setSelectedSquare(square);
    } else {
      setSelectedSquare(null);
    }
  };

  const handleSelectPromotionPiece = (promotionPiece: string) => {
    if (!pendingPromotion) return;

    onMakeMove({
      from: pendingPromotion.from,
      to: pendingPromotion.to,
      promotion: promotionPiece,
    });

    setPendingPromotion(null);
    setSelectedSquare(null);
  };

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[460px] select-none overflow-hidden border-[3px] border-zinc-900 bg-[#5C3A21] p-1.5 sm:p-2 shadow-pixel-lg">
      {/* Promotion Choice Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="pixel-box-lg w-full max-w-xs bg-[#FFFDF8] p-4 text-center">
            <h4 className="font-pixel text-sm font-bold uppercase tracking-wider text-zinc-950 mb-3">
              CHỌN QUÂN PHONG CẤP
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {[
                { type: 'q', label: 'Hậu' },
                { type: 'n', label: 'Mã' },
                { type: 'r', label: 'Xe' },
                { type: 'b', label: 'Tượng' },
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => handleSelectPromotionPiece(item.type)}
                  className="pixel-btn flex flex-col items-center justify-center bg-amber-100 hover:bg-amber-200 py-2.5"
                >
                  <div className="h-10 w-10 flex items-center justify-center">
                    <ChessPiece
                      type={item.type}
                      color={playerColor === 'white' ? 'w' : 'b'}
                    />
                  </div>
                  <span className="font-pixel text-[11px] font-bold text-zinc-900 mt-1">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setPendingPromotion(null);
                setSelectedSquare(null);
              }}
              className="mt-3 font-pixel text-xs font-bold text-rose-700 hover:underline uppercase"
            >
              [HỦY NƯỚC ĐI]
            </button>
          </div>
        </div>
      )}

      {/* Chess Grid */}
      <div className="grid h-full w-full grid-cols-8 grid-rows-8 border-2 border-zinc-900">
        {ranks.map((rank, rIdx) =>
          files.map((file, fIdx) => {
            const square = `${file}${rank}` as Square;
            const piece = chess.get(square);

            const isLightSquare = (rIdx + fIdx) % 2 === 0;
            const isSelected = selectedSquare === square;
            const isValidTarget = validMoves.includes(square);
            const isLastMove = lastMove?.from === square || lastMove?.to === square;

            // Highlight checked king
            const isKingInCheck =
              isCheck &&
              piece?.type === 'k' &&
              piece?.color === chess.turn();

            // Background color styling (16-bit Arcade Mint/Wood & Cream)
            let bgClass = isLightSquare ? 'bg-[#F3E5AB]' : 'bg-[#6E9958]';
            if (isLastMove) {
              bgClass = isLightSquare ? 'bg-[#FDE047]' : 'bg-[#A3E635]';
            }
            if (isSelected) {
              bgClass = 'bg-amber-300 ring-2 ring-inset ring-zinc-900';
            }
            if (isKingInCheck) {
              bgClass = 'bg-rose-500 animate-pulse';
            }

            return (
              <button
                key={square}
                type="button"
                onClick={() => handleSquareClick(square)}
                className={`relative flex items-center justify-center focus:outline-none ${bgClass}`}
                aria-label={`Square ${square}`}
              >
                {/* Chess piece */}
                {piece && (
                  <ChessPiece
                    type={piece.type}
                    color={piece.color}
                    className="w-full h-full"
                  />
                )}

                {/* Coordinates labels - rendered with z-10 on top */}
                {fIdx === 0 && (
                  <span
                    className={`pointer-events-none select-none absolute left-1 top-0.5 font-pixel text-[9px] sm:text-[11px] font-bold leading-none z-10 ${
                      isLightSquare ? 'text-[#446334]' : 'text-[#F3E5AB]'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {rIdx === 7 && (
                  <span
                    className={`pointer-events-none select-none absolute right-1 bottom-0.5 font-pixel text-[9px] sm:text-[11px] font-bold leading-none z-10 ${
                      isLightSquare ? 'text-[#446334]' : 'text-[#F3E5AB]'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Valid Move Pixel Indicator */}
                {isValidTarget && (
                  <span
                    className={`pointer-events-none absolute z-10 ${
                      piece
                        ? 'inset-0.5 border-[3px] border-rose-600 bg-rose-500/20'
                        : 'h-3.5 w-3.5 bg-zinc-900/45 border border-white/60'
                    }`}
                  />
                )}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
