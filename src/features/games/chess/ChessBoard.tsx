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
    <div className="relative mx-auto aspect-square w-full max-w-[460px] select-none overflow-hidden rounded-2xl border-4 border-amber-900/40 bg-amber-900/20 shadow-xl">
      {/* Promotion Choice Modal */}
      {pendingPromotion && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px] p-4 animate-fade-in">
          <div className="w-full max-w-xs rounded-2xl border border-gray-200 bg-white p-4 shadow-2xl text-center">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 mb-3">
              Chọn quân phong cấp
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
                  className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-300 py-2.5 transition-all active:scale-95 shadow-sm"
                >
                  <div className="h-10 w-10 flex items-center justify-center">
                    <ChessPiece
                      type={item.type}
                      color={playerColor === 'white' ? 'w' : 'b'}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-gray-700 mt-1">
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
              className="mt-3 text-xs font-semibold text-gray-400 hover:text-gray-700"
            >
              Hủy nước đi
            </button>
          </div>
        </div>
      )}

      {/* Chess Grid */}
      <div className="grid h-full w-full grid-cols-8 grid-rows-8">
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

            // Background color styling (tournament green & cream)
            let bgClass = isLightSquare ? 'bg-[#EEEED2]' : 'bg-[#769656]';
            if (isLastMove) {
              bgClass = isLightSquare ? 'bg-[#F7EC74]' : 'bg-[#BACA44]';
            }
            if (isSelected) {
              bgClass = 'bg-[#BBCE44]';
            }
            if (isKingInCheck) {
              bgClass = 'bg-red-400';
            }

            return (
              <button
                key={square}
                type="button"
                onClick={() => handleSquareClick(square)}
                className={`relative flex items-center justify-center transition-colors focus:outline-none ${bgClass}`}
                aria-label={`Square ${square}`}
              >
                {/* Coordinates labels */}
                {fIdx === 0 && (
                  <span
                    className={`absolute left-1 top-0.5 text-[10px] font-bold ${
                      isLightSquare ? 'text-[#769656]' : 'text-[#EEEED2]'
                    }`}
                  >
                    {rank}
                  </span>
                )}
                {rIdx === 7 && (
                  <span
                    className={`absolute bottom-0.5 right-1 text-[10px] font-bold ${
                      isLightSquare ? 'text-[#769656]' : 'text-[#EEEED2]'
                    }`}
                  >
                    {file}
                  </span>
                )}

                {/* Chess piece */}
                {piece && (
                  <ChessPiece
                    type={piece.type}
                    color={piece.color}
                  />
                )}

                {/* Valid Move Indicator Dot / Ring */}
                {isValidTarget && (
                  <span
                    className={`pointer-events-none absolute z-10 ${
                      piece
                        ? 'h-full w-full rounded-full border-4 border-black/30'
                        : 'h-4 w-4 rounded-full bg-black/25'
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
