import {
  Board,
  Side,
  Position,
  Move,
  PieceType,
  ROWS,
  COLS,
  cloneBoard,
  getAllLegalMoves,
  isSideInCheck,
} from '../xiangqiLogic';

export type XiangqiBotDifficulty = 'easy' | 'medium' | 'hard';

// Giá trị nguyên khối cơ bản của các loại quân cờ Tướng
const PIECE_BASE_VALUES: Record<PieceType, number> = {
  general: 10000,
  chariot: 950,
  cannon: 450,
  horse: 400,
  advisor: 200,
  elephant: 200,
  soldier: 100, // Tăng lên 200-300 khi qua sông
};

// Ma trận điểm vị trí (Piece-Square Tables) - Tính từ góc nhìn bên ĐỎ (Hàng 9 là sân nhà, Hàng 0 là sân đối phương)
// Nếu tính cho bên ĐEN, ta đảo ngược hàng (row = 9 - row)

// Tốt Đỏ: Chưa qua sông đi thẳng, qua sông áp sát cung tướng điểm tăng vọt
const SOLDIER_PST: number[][] = [
  [0, 3, 6, 9, 12, 9, 6, 3, 0],
  [18, 36, 56, 80, 100, 80, 56, 36, 18],
  [14, 26, 42, 60, 80, 60, 42, 26, 14],
  [10, 20, 30, 40, 50, 40, 30, 20, 10],
  [6, 12, 18, 24, 30, 24, 18, 12, 6],
  // --- SÔNG (Ranh giới giữa hàng 4 và 5) ---
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, -2, 0, 4, 0, -2, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];

// Mã Đỏ: Khuyến khích nhảy về trung tâm và áp sát cung đối phương, hạn chế nhảy ra góc biên
const HORSE_PST: number[][] = [
  [4, 8, 16, 12, 4, 12, 16, 8, 4],
  [4, 10, 28, 16, 8, 16, 28, 10, 4],
  [12, 16, 30, 36, 24, 36, 30, 16, 12],
  [8, 24, 28, 30, 20, 30, 28, 24, 8],
  [6, 16, 20, 24, 16, 24, 20, 16, 6],
  [4, 12, 16, 18, 12, 18, 16, 12, 4],
  [2, 8, 10, 12, 6, 12, 10, 8, 2],
  [2, -2, 4, 6, 2, 6, 4, -2, 2],
  [0, -4, 0, 0, 0, 0, 0, -4, 0],
  [0, -4, 0, 0, 0, 0, 0, -4, 0],
];

// Xe Đỏ: Hoạt động mạnh ở các lộ mở, hàng đáy đối phương và trung lộ
const CHARIOT_PST: number[][] = [
  [14, 14, 12, 18, 16, 18, 12, 14, 14],
  [16, 24, 18, 24, 26, 24, 18, 24, 16],
  [12, 18, 12, 22, 18, 22, 12, 18, 12],
  [12, 18, 14, 22, 16, 22, 14, 18, 12],
  [12, 16, 14, 20, 14, 20, 14, 16, 12],
  [8, 14, 10, 16, 10, 16, 10, 14, 8],
  [6, 10, 8, 14, 10, 14, 8, 10, 6],
  [4, 8, 6, 14, 12, 14, 6, 8, 4],
  [8, 4, 8, 16, 8, 16, 8, 4, 8],
  [-2, 10, 6, 14, 12, 14, 6, 10, -2],
];

// Pháo Đỏ: Rất mạnh khi khống chế trung lộ (Pháo đầu - cột 4) và hàng đáy
const CANNON_PST: number[][] = [
  [6, 8, 0, -4, -6, -4, 0, 8, 6],
  [2, 4, 0, -10, -8, -10, 0, 4, 2],
  [2, 4, 0, -4, 0, -4, 0, 4, 2],
  [0, 2, -2, 2, 8, 2, -2, 2, 0],
  [0, 0, 0, 2, 8, 2, 0, 0, 0],
  [-2, 0, 4, 4, 10, 4, 4, 0, -2],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [2, 0, -4, 0, 8, 0, -4, 0, 2],
  [0, 0, 0, 2, 10, 2, 0, 0, 0],
  [0, 0, 0, 2, 8, 2, 0, 0, 0],
];

// Đánh giá thế cờ tổng thể từ góc nhìn bên `side`
export function evaluateBoard(board: Board, side: Side): number {
  let redScore = 0;
  let blackScore = 0;

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const piece = board[r][c];
      if (!piece) continue;

      let val = PIECE_BASE_VALUES[piece.type];
      let posBonus = 0;

      if (piece.side === 'red') {
        // Bên Đỏ giữ nguyên tọa độ
        if (piece.type === 'soldier') {
          posBonus = SOLDIER_PST[r][c];
          if (r <= 4) val += 100; // Đã qua sông
        } else if (piece.type === 'horse') {
          posBonus = HORSE_PST[r][c];
        } else if (piece.type === 'chariot') {
          posBonus = CHARIOT_PST[r][c];
        } else if (piece.type === 'cannon') {
          posBonus = CANNON_PST[r][c];
        }
        redScore += val + posBonus;
      } else {
        // Bên Đen lật ngược hàng (9 - r)
        const invR = 9 - r;
        if (piece.type === 'soldier') {
          posBonus = SOLDIER_PST[invR][c];
          if (r >= 5) val += 100; // Đã qua sông
        } else if (piece.type === 'horse') {
          posBonus = HORSE_PST[invR][c];
        } else if (piece.type === 'chariot') {
          posBonus = CHARIOT_PST[invR][c];
        } else if (piece.type === 'cannon') {
          posBonus = CANNON_PST[invR][c];
        }
        blackScore += val + posBonus;
      }
    }
  }

  // Nếu đang bị chiếu tướng thì phạt nhẹ điểm
  if (isSideInCheck(board, 'red')) redScore -= 40;
  if (isSideInCheck(board, 'black')) blackScore -= 40;

  const total = redScore - blackScore;
  return side === 'red' ? total : -total;
}

// Sắp xếp nước đi (Move Ordering) để tăng tốc độ tỉa cành Alpha-Beta:
// Ưu tiên các nước ăn quân lớn hơn và chiếu tướng
function sortMoves(moves: Move[]): Move[] {
  return moves.sort((a, b) => {
    const valA = a.captured ? PIECE_BASE_VALUES[a.captured.type] : 0;
    const valB = b.captured ? PIECE_BASE_VALUES[b.captured.type] : 0;
    return valB - valA;
  });
}

// Thuật toán Minimax + Alpha-Beta Pruning
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  isMaximizing: boolean,
  botSide: Side
): number {
  const currentSide: Side = isMaximizing ? botSide : botSide === 'red' ? 'black' : 'red';
  const legalMoves = getAllLegalMoves(board, currentSide);

  // Điều kiện dừng: Hết độ sâu hoặc hết nước đi (Chiếu bí / Hết nước)
  if (depth === 0 || legalMoves.length === 0) {
    if (legalMoves.length === 0) {
      // Bên currentSide không còn nước đi -> Thua cuộc!
      return isMaximizing ? -20000 : 20000;
    }
    return evaluateBoard(board, botSide);
  }

  const sortedMoves = sortMoves(legalMoves);

  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of sortedMoves) {
      const nextBoard = cloneBoard(board);
      nextBoard[move.to.row][move.to.col] = nextBoard[move.from.row][move.from.col];
      nextBoard[move.from.row][move.from.col] = null;

      const evalScore = minimax(nextBoard, depth - 1, alpha, beta, false, botSide);
      maxEval = Math.max(maxEval, evalScore);
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break; // Tỉa cành Beta
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of sortedMoves) {
      const nextBoard = cloneBoard(board);
      nextBoard[move.to.row][move.to.col] = nextBoard[move.from.row][move.from.col];
      nextBoard[move.from.row][move.from.col] = null;

      const evalScore = minimax(nextBoard, depth - 1, alpha, beta, true, botSide);
      minEval = Math.min(minEval, evalScore);
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break; // Tỉa cành Alpha
    }
    return minEval;
  }
}

// Hàm lựa chọn nước đi tốt nhất cho Bot AI dựa trên độ khó
export function getBestXiangqiBotMove(
  board: Board,
  botSide: Side,
  difficulty: XiangqiBotDifficulty
): Move | null {
  const legalMoves = getAllLegalMoves(board, botSide);
  if (legalMoves.length === 0) return null;

  // 1. CẤP ĐỘ DỄ (Tập sự):
  // 40% đi nước cờ ngẫu nhiên, 60% chọn nước ăn quân hoặc nước điểm tốt nhất ở depth 1
  if (difficulty === 'easy') {
    if (Math.random() < 0.4) {
      const randomIdx = Math.floor(Math.random() * legalMoves.length);
      return legalMoves[randomIdx];
    }

    // Đánh giá nhanh depth 1
    let bestMove = legalMoves[0];
    let bestScore = -Infinity;

    for (const move of legalMoves) {
      const nextBoard = cloneBoard(board);
      nextBoard[move.to.row][move.to.col] = nextBoard[move.from.row][move.from.col];
      nextBoard[move.from.row][move.from.col] = null;

      // Thêm chút ngẫu nhiên nhỏ +/- 15 điểm để Bot đánh tự nhiên, không cứng nhắc
      const score = evaluateBoard(nextBoard, botSide) + (Math.random() * 30 - 15);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // 2. CẤP ĐỘ VỪA (Kỳ thủ):
  // Minimax Alpha-Beta depth 2
  if (difficulty === 'medium') {
    let bestMove = legalMoves[0];
    let bestScore = -Infinity;
    const sorted = sortMoves(legalMoves);

    for (const move of sorted) {
      const nextBoard = cloneBoard(board);
      nextBoard[move.to.row][move.to.col] = nextBoard[move.from.row][move.from.col];
      nextBoard[move.from.row][move.from.col] = null;

      const score = minimax(nextBoard, 1, -Infinity, Infinity, false, botSide);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
    return bestMove;
  }

  // 3. CẤP ĐỘ KHÓ (Đại sư):
  // Minimax Alpha-Beta depth 3 kết hợp Move Ordering
  let bestMove = legalMoves[0];
  let bestScore = -Infinity;
  const sorted = sortMoves(legalMoves);

  for (const move of sorted) {
    const nextBoard = cloneBoard(board);
    nextBoard[move.to.row][move.to.col] = nextBoard[move.from.row][move.from.col];
    nextBoard[move.from.row][move.from.col] = null;

    const score = minimax(nextBoard, 2, -Infinity, Infinity, false, botSide);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}

