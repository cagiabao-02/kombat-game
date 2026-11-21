import {
  applyMove,
  countPieces,
  getOpponentColor,
  getValidMoves,
  OTHELLO_SIZE,
} from './othelloLogic';
import {
  OthelloBoardState,
  OthelloCoord,
  OthelloDifficulty,
  OthelloStone,
} from './types';

// Bảng trọng số vị trí kinh điển của Othello 8x8:
// Góc (120) cực quý giá; ô sát góc (-25, -45) rất nguy hiểm vì dễ nhường góc cho đối thủ.
const POSITIONAL_WEIGHTS: readonly number[][] = [
  [120, -25, 20, 10, 10, 20, -25, 120],
  [-25, -45, -5, -5, -5, -5, -45, -25],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [10, -5, 3, 3, 3, 3, -5, 10],
  [10, -5, 3, 3, 3, 3, -5, 10],
  [20, -5, 15, 3, 3, 15, -5, 20],
  [-25, -45, -5, -5, -5, -5, -45, -25],
  [120, -25, 20, 10, 10, 20, -25, 120],
];

function evaluateBoard(board: OthelloBoardState, aiColor: OthelloStone): number {
  const oppColor = getOpponentColor(aiColor);
  const counts = countPieces(board);

  let posScore = 0;
  for (let r = 0; r < OTHELLO_SIZE; r++) {
    for (let c = 0; c < OTHELLO_SIZE; c++) {
      if (board[r][c] === aiColor) {
        posScore += POSITIONAL_WEIGHTS[r][c];
      } else if (board[r][c] === oppColor) {
        posScore -= POSITIONAL_WEIGHTS[r][c];
      }
    }
  }

  const aiMoves = getValidMoves(board, aiColor).length;
  const oppMoves = getValidMoves(board, oppColor).length;

  // Nếu cả 2 hết nước: đánh giá tuyệt đối theo hiệu số quân
  if (aiMoves === 0 && oppMoves === 0) {
    const diff = aiColor === 'black' ? counts.black - counts.white : counts.white - counts.black;
    if (diff > 0) return 100000 + diff;
    if (diff < 0) return -100000 + diff;
    return 0;
  }

  const mobilityScore = (aiMoves - oppMoves) * 8;
  const pieceDiff = aiColor === 'black' ? counts.black - counts.white : counts.white - counts.black;

  // Đầu & giữa ván ưu tiên vị trí + độ linh hoạt; cuối ván (<14 ô trống) ưu tiên số quân
  const discWeight = counts.empty <= 14 ? 12 : 1;

  return posScore + mobilityScore + pieceDiff * discWeight;
}

function minimax(
  board: OthelloBoardState,
  depth: number,
  alpha: number,
  beta: number,
  maximizingColor: OthelloStone,
  currentColor: OthelloStone,
  aiColor: OthelloStone
): number {
  const moves = getValidMoves(board, currentColor);
  const oppColor = getOpponentColor(currentColor);

  if (depth === 0) {
    return evaluateBoard(board, aiColor);
  }

  if (moves.length === 0) {
    const oppMoves = getValidMoves(board, oppColor);
    if (oppMoves.length === 0) {
      return evaluateBoard(board, aiColor);
    }
    return minimax(board, depth - 1, alpha, beta, maximizingColor, oppColor, aiColor);
  }

  // Sắp xếp nước đi theo trọng số để Alpha-Beta cắt tỉa hiệu quả hơn
  const ordered = [...moves].sort(
    (a, b) => POSITIONAL_WEIGHTS[b.row][b.col] - POSITIONAL_WEIGHTS[a.row][a.col]
  );

  const isMaximizing = currentColor === aiColor;
  if (isMaximizing) {
    let maxEval = -Infinity;
    for (const move of ordered) {
      const res = applyMove(board, move.row, move.col, currentColor);
      if (!res) continue;
      const ev = minimax(res.nextBoard, depth - 1, alpha, beta, maximizingColor, oppColor, aiColor);
      if (ev > maxEval) maxEval = ev;
      if (ev > alpha) alpha = ev;
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of ordered) {
      const res = applyMove(board, move.row, move.col, currentColor);
      if (!res) continue;
      const ev = minimax(res.nextBoard, depth - 1, alpha, beta, maximizingColor, oppColor, aiColor);
      if (ev < minEval) minEval = ev;
      if (ev < beta) beta = ev;
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

export function chooseOthelloBotMove(
  board: OthelloBoardState,
  aiColor: OthelloStone,
  difficulty: OthelloDifficulty
): OthelloCoord | null {
  const validMoves = getValidMoves(board, aiColor);
  if (validMoves.length === 0) return null;

  if (difficulty === 'easy') {
    // 60% random, 40% greedy nhẹ theo số quân lật
    if (Math.random() < 0.6) {
      return validMoves[Math.floor(Math.random() * validMoves.length)];
    }
    let best = validMoves[0];
    let bestFlips = -1;
    for (const move of validMoves) {
      const res = applyMove(board, move.row, move.col, aiColor);
      const count = res ? res.flipped.length : 0;
      if (count > bestFlips) {
        bestFlips = count;
        best = move;
      }
    }
    return best;
  }

  const depth = difficulty === 'hard' ? 4 : 2;
  const oppColor = getOpponentColor(aiColor);

  let bestMove = validMoves[0];
  let bestScore = -Infinity;

  const ordered = [...validMoves].sort(
    (a, b) => POSITIONAL_WEIGHTS[b.row][b.col] - POSITIONAL_WEIGHTS[a.row][a.col]
  );

  for (const move of ordered) {
    const res = applyMove(board, move.row, move.col, aiColor);
    if (!res) continue;
    const score = minimax(res.nextBoard, depth - 1, -Infinity, Infinity, aiColor, oppColor, aiColor);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return bestMove;
}
