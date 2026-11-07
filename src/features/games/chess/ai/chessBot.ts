import { Chess, Move, Square, PieceSymbol, Color } from 'chess.js';

export type BotDifficulty = 'easy' | 'medium' | 'hard';

// Material weights
const PIECE_VALUES: Record<PieceSymbol, number> = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000,
};

// Piece-Square Tables (from White's perspective, row 0 = rank 8, row 7 = rank 1)
const PAWN_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [50, 50, 50, 50, 50, 50, 50, 50],
  [10, 10, 20, 30, 30, 20, 10, 10],
  [5, 5, 10, 25, 25, 10, 5, 5],
  [0, 0, 0, 20, 20, 0, 0, 0],
  [5, -5, -10, 0, 0, -10, -5, 5],
  [5, 10, 10, -20, -20, 10, 10, 5],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const KNIGHT_PST = [
  [-50, -40, -30, -30, -30, -30, -40, -50],
  [-40, -20, 0, 0, 0, 0, -20, -40],
  [-30, 0, 10, 15, 15, 10, 0, -30],
  [-30, 5, 15, 20, 20, 15, 5, -30],
  [-30, 0, 15, 20, 20, 15, 0, -30],
  [-30, 5, 10, 15, 15, 10, 5, -30],
  [-40, -20, 0, 5, 5, 0, -20, -40],
  [-50, -40, -30, -30, -30, -30, -40, -50],
];

const BISHOP_PST = [
  [-20, -10, -10, -10, -10, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 10, 10, 5, 0, -10],
  [-10, 5, 5, 10, 10, 5, 5, -10],
  [-10, 0, 10, 10, 10, 10, 0, -10],
  [-10, 10, 10, 10, 10, 10, 10, -10],
  [-10, 5, 0, 0, 0, 0, 5, -10],
  [-20, -10, -10, -10, -10, -10, -10, -20],
];

const ROOK_PST = [
  [0, 0, 0, 0, 0, 0, 0, 0],
  [5, 10, 10, 10, 10, 10, 10, 5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [-5, 0, 0, 0, 0, 0, 0, -5],
  [0, 0, 0, 5, 5, 0, 0, 0],
];

const QUEEN_PST = [
  [-20, -10, -10, -5, -5, -10, -10, -20],
  [-10, 0, 0, 0, 0, 0, 0, -10],
  [-10, 0, 5, 5, 5, 5, 0, -10],
  [-5, 0, 5, 5, 5, 5, 0, -5],
  [0, 0, 5, 5, 5, 5, 0, -5],
  [-10, 5, 5, 5, 5, 5, 0, -10],
  [-10, 0, 5, 0, 0, 0, 0, -10],
  [-20, -10, -10, -5, -5, -10, -10, -20],
];

const KING_MID_PST = [
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-30, -40, -40, -50, -50, -40, -40, -30],
  [-20, -30, -30, -40, -40, -30, -30, -20],
  [-10, -20, -20, -20, -20, -20, -20, -10],
  [20, 20, 0, 0, 0, 0, 20, 20],
  [20, 30, 10, 0, 0, 10, 30, 20],
];

function getPiecePst(type: PieceSymbol, row: number, col: number, color: Color): number {
  const r = color === 'w' ? row : 7 - row;
  const c = col;

  switch (type) {
    case 'p':
      return PAWN_PST[r][c];
    case 'n':
      return KNIGHT_PST[r][c];
    case 'b':
      return BISHOP_PST[r][c];
    case 'r':
      return ROOK_PST[r][c];
    case 'q':
      return QUEEN_PST[r][c];
    case 'k':
      return KING_MID_PST[r][c];
    default:
      return 0;
  }
}

/**
 * Evaluate the chess board position.
 * Returns score from White's perspective (+ means White is winning, - means Black is winning).
 */
export function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -99999 : 99999;
  }
  if (chess.isDraw()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c];
      if (piece) {
        const material = PIECE_VALUES[piece.type];
        const positional = getPiecePst(piece.type, r, c, piece.color);
        const total = material + positional;

        if (piece.color === 'w') {
          score += total;
        } else {
          score -= total;
        }
      }
    }
  }

  return score;
}

/**
 * Order moves to maximize Alpha-Beta pruning cutoffs:
 * Captures first (checking high-value captures first), then checks, then standard moves.
 */
function sortMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    if (a.captured) {
      scoreA += PIECE_VALUES[a.captured] * 10 - PIECE_VALUES[a.piece];
    }
    if (b.captured) {
      scoreB += PIECE_VALUES[b.captured] * 10 - PIECE_VALUES[b.piece];
    }
    if (a.promotion) scoreA += 800;
    if (b.promotion) scoreB += 800;

    return scoreB - scoreA;
  });
}

/**
 * Minimax algorithm with Alpha-Beta pruning.
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluateBoard(chess);
  }

  const legalMoves = sortMoves(chess.moves({ verbose: true }));

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of legalMoves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of legalMoves) {
      chess.move(move);
      const evalScore = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/**
 * Find the optimal move for the bot based on difficulty.
 */
export function getBotMove(chess: Chess, difficulty: BotDifficulty = 'medium'): Move | null {
  const legalMoves = chess.moves({ verbose: true });
  if (legalMoves.length === 0) return null;

  // Easy mode: 35% chance to make a random legal move (blunder simulation)
  if (difficulty === 'easy' && Math.random() < 0.35) {
    const randomIndex = Math.floor(Math.random() * legalMoves.length);
    return legalMoves[randomIndex];
  }

  const depth = difficulty === 'hard' ? 3 : difficulty === 'medium' ? 2 : 1;
  const isMaximizing = chess.turn() === 'w';
  const orderedMoves = sortMoves(legalMoves);

  let bestMove: Move = orderedMoves[0];
  let bestEval = isMaximizing ? -Infinity : Infinity;

  for (const move of orderedMoves) {
    chess.move(move);
    const score = minimax(chess, depth - 1, -Infinity, Infinity, !isMaximizing);
    chess.undo();

    if (isMaximizing) {
      if (score > bestEval) {
        bestEval = score;
        bestMove = move;
      }
    } else {
      if (score < bestEval) {
        bestEval = score;
        bestMove = move;
      }
    }
  }

  return bestMove;
}

/**
 * Simulate natural bot thinking time (in ms)
 */
export async function simulateBotThinkingDelay(difficulty: BotDifficulty = 'medium'): Promise<void> {
  let minMs = 500;
  let maxMs = 900;

  if (difficulty === 'medium') {
    minMs = 700;
    maxMs = 1200;
  } else if (difficulty === 'hard') {
    minMs = 900;
    maxMs = 1500;
  }

  const delay = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  await new Promise((resolve) => setTimeout(resolve, delay));
}

