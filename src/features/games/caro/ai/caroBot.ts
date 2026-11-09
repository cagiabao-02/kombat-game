import {
  CARO_BOARD_SIZE,
  CaroBoard,
  CaroBotDifficulty,
  CaroPiece,
} from '../types';
import { isWithinBoard } from '../caroLogic';

interface ScoredMove {
  row: number;
  col: number;
  score: number;
}

const DIRECTIONS: [number, number][] = [
  [0, 1], // Ngang
  [1, 0], // Dọc
  [1, 1], // Chéo \
  [1, -1], // Chéo /
];

// Trọng số đánh giá các thế cờ
const SCORE_FIVE = 100000; // 5 quân (Thắng)
const SCORE_OPEN_FOUR = 10000; // 4 quân hở 2 đầu (_XXXX_)
const SCORE_BLOCKED_FOUR = 2500; // 4 quân chặn 1 đầu (OXXXX_)
const SCORE_OPEN_THREE = 1200; // 3 quân hở 2 đầu (_XXX_)
const SCORE_BLOCKED_THREE = 250; // 3 quân chặn 1 đầu (OXXX_)
const SCORE_OPEN_TWO = 60; // 2 quân hở 2 đầu (_XX_)
const SCORE_BLOCKED_TWO = 10; // 2 quân chặn 1 đầu

/**
 * Đánh giá điểm của một hướng từ ô (row, col) nếu đặt quân `player`
 */
function evaluateDirection(
  board: CaroBoard,
  row: number,
  col: number,
  dr: number,
  dc: number,
  player: CaroPiece
): number {
  let count = 1;
  let openEnds = 0;

  // Hướng dương
  let r = row + dr;
  let c = col + dc;
  while (isWithinBoard(r, c) && board[r][c] === player) {
    count++;
    r += dr;
    c += dc;
  }
  if (isWithinBoard(r, c) && board[r][c] === null) {
    openEnds++;
  }

  // Hướng âm
  r = row - dr;
  c = col - dc;
  while (isWithinBoard(r, c) && board[r][c] === player) {
    count++;
    r -= dr;
    c -= dc;
  }
  if (isWithinBoard(r, c) && board[r][c] === null) {
    openEnds++;
  }

  if (count >= 5) return SCORE_FIVE;
  if (count === 4) {
    return openEnds === 2 ? SCORE_OPEN_FOUR : openEnds === 1 ? SCORE_BLOCKED_FOUR : 0;
  }
  if (count === 3) {
    return openEnds === 2 ? SCORE_OPEN_THREE : openEnds === 1 ? SCORE_BLOCKED_THREE : 0;
  }
  if (count === 2) {
    return openEnds === 2 ? SCORE_OPEN_TWO : openEnds === 1 ? SCORE_BLOCKED_TWO : 0;
  }

  return 0;
}

/**
 * Tính điểm toàn diện (công + thủ) cho một ô cờ tiềm năng
 */
function evaluateCell(
  board: CaroBoard,
  row: number,
  col: number,
  botPlayer: CaroPiece,
  opponent: CaroPiece,
  defenseWeight: number
): number {
  let attackScore = 0;
  let defenseScore = 0;

  for (const [dr, dc] of DIRECTIONS) {
    attackScore += evaluateDirection(board, row, col, dr, dc, botPlayer);
    defenseScore += evaluateDirection(board, row, col, dr, dc, opponent);
  }

  // Ưu tiên tấn công tạo chuỗi thắng, nhưng vẫn phòng thủ chặn nước hiểm
  return attackScore * 1.1 + defenseScore * defenseWeight;
}

/**
 * Tìm các ô cờ trống nằm gần các quân đã đánh (bán kính 2 ô)
 */
function getCandidateMoves(board: CaroBoard): { row: number; col: number }[] {
  const candidates: { row: number; col: number }[] = [];
  const visited = new Set<string>();

  let hasAnyPiece = false;

  for (let r = 0; r < CARO_BOARD_SIZE; r++) {
    for (let c = 0; c < CARO_BOARD_SIZE; c++) {
      if (board[r][c] !== null) {
        hasAnyPiece = true;
        // Quét các ô xung quanh trong bán kính 2
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            const key = `${nr}-${nc}`;
            if (isWithinBoard(nr, nc) && board[nr][nc] === null && !visited.has(key)) {
              visited.add(key);
              candidates.push({ row: nr, col: nc });
            }
          }
        }
      }
    }
  }

  // Nếu bàn cờ hoàn toàn trống, đánh chính giữa bàn (7, 7)
  if (!hasAnyPiece) {
    const center = Math.floor(CARO_BOARD_SIZE / 2);
    return [{ row: center, col: center }];
  }

  return candidates;
}

/**
 * Tìm nước đi tối ưu nhất cho Bot Caro
 */
export function getBestCaroMove(
  board: CaroBoard,
  botPlayer: CaroPiece,
  difficulty: CaroBotDifficulty = 'medium'
): { row: number; col: number } | null {
  const candidates = getCandidateMoves(board);
  if (candidates.length === 0) return null;

  const opponent: CaroPiece = botPlayer === 'X' ? 'O' : 'X';

  // Điều chỉnh hệ số phòng thủ theo độ khó
  const defenseWeight =
    difficulty === 'hard' ? 1.05 : difficulty === 'medium' ? 0.85 : 0.45;

  const scoredMoves: ScoredMove[] = candidates.map(({ row, col }) => {
    let score = evaluateCell(board, row, col, botPlayer, opponent, defenseWeight);

    // Chút ngẫu nhiên nhẹ cho cấp dễ & vừa
    if (difficulty === 'easy') {
      score += Math.random() * 400;
    } else if (difficulty === 'medium') {
      score += Math.random() * 40;
    }

    return { row, col, score };
  });

  // Sắp xếp giảm dần theo điểm
  scoredMoves.sort((a, b) => b.score - a.score);

  if (difficulty === 'easy') {
    // Cấp dễ: Chọn ngẫu nhiên trong top 3 nước tiềm năng
    const topChoices = scoredMoves.slice(0, Math.min(3, scoredMoves.length));
    return topChoices[Math.floor(Math.random() * topChoices.length)];
  }

  if (difficulty === 'medium' && scoredMoves.length > 1) {
    // Cấp vừa: 85% chọn nước tốt nhất, 15% chọn nước thứ 2
    if (Math.random() < 0.15 && scoredMoves[0].score < SCORE_OPEN_FOUR) {
      return scoredMoves[1];
    }
  }

  // Cấp khó hoặc mặc định: Chọn nước điểm cao nhất
  return scoredMoves[0];
}

export const findBestMove = getBestCaroMove;

