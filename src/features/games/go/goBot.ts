import { BoardSize, GoAiDifficulty, GoBoard, GoColor, Point } from './types';
import {
  findGroup,
  getNeighbors,
  getStarPoints,
  playMove,
  validateMove,
} from './goLogic';

/**
 * Đánh giá điểm chiến thuật cho một nước đi của Bot Cờ Vây
 */
function evaluateMove(
  board: GoBoard,
  p: Point,
  color: GoColor,
  koPoint: Point | null
): number {
  const size = board.length as BoardSize;
  const opponentColor: GoColor = color === 'black' ? 'white' : 'black';

  // 1. Thử đi nước cờ
  const sim = playMove(board, p, color, koPoint);
  if (!sim.valid) return -999999;

  let score = 0;

  // 2. Điểm ăn quân (Bắt tù binh)
  if (sim.captures.length > 0) {
    score += sim.captures.length * 1500;
  }

  // 3. Khí của nhóm quân mình sau khi đặt
  const ownGroup = findGroup(sim.newBoard, p);
  if (ownGroup) {
    const liberties = ownGroup.liberties.length;
    if (liberties === 1) {
      // Đặt xong rơi vào thế Atari (chỉ còn 1 khí) -> Rất nguy hiểm trừ khi vừa ăn được quân
      score -= 800;
    } else if (liberties === 2) {
      score += 50;
    } else if (liberties >= 3) {
      score += 200;
    }

    // Khuyến khích kết nối với quân đồng minh
    if (ownGroup.stones.length > 1) {
      score += Math.min(ownGroup.stones.length * 30, 150);
    }
  }

  // 4. Giải cứu quân đồng minh đang bị dọa bắt (Atari: còn 1 khí trên bàn cờ gốc)
  const neighbors = getNeighbors(p, size);
  for (const nb of neighbors) {
    if (board[nb.row][nb.col] === color) {
      const origGroup = findGroup(board, nb);
      if (origGroup && origGroup.liberties.length === 1) {
        // Nước đi này nối vào hoặc giải cứu đám quân đang bị Atari
        if (ownGroup && ownGroup.liberties.length >= 2) {
          score += 1200 + origGroup.stones.length * 300;
        }
      }
    } else if (board[nb.row][nb.col] === opponentColor) {
      // Dọa bắt đối phương (Đưa nhóm đối phương về thế Atari: còn 1 khí)
      const oppGroup = findGroup(sim.newBoard, nb);
      if (oppGroup && oppGroup.liberties.length === 1) {
        score += 600 + oppGroup.stones.length * 200;
      }
    }
  }

  // 5. Giá trị vị trí khai cuộc (Góc và Cạnh vàng - Golden Lines)
  // Trong Cờ Vây: "Góc vàng, cạnh bạc, cỏ nội trung tâm"
  const distRow = Math.min(p.row, size - 1 - p.row);
  const distCol = Math.min(p.col, size - 1 - p.col);

  // Đường 3 và 4 là đường vàng để vừa tạo đất vừa phát triển thế cờ
  if ((distRow === 2 || distRow === 3) && (distCol === 2 || distCol === 3)) {
    score += 180;
  } else if (distRow === 0 || distCol === 0) {
    // Đường biên số 1 (sát mép bàn cờ) rất yếu trong giai đoạn đầu
    score -= 150;
  }

  // Điểm sao (Hoshi/Tengen)
  const starPoints = getStarPoints(size);
  if (starPoints.some((sp) => sp.row === p.row && sp.col === p.col)) {
    score += 120;
  }

  return score;
}

/**
 * Thuật toán tìm nước đi tối ưu cho Bot AI Cờ Vây
 * Trả về Point nếu có nước đi tốt, hoặc null nếu chọn Bỏ lượt (Pass).
 */
export function getBestGoMove(
  board: GoBoard,
  color: GoColor,
  koPoint: Point | null,
  difficulty: GoAiDifficulty
): Point | null {
  const size = board.length as BoardSize;
  const candidates: { point: Point; score: number }[] = [];

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const p = { row: r, col: c };
      if (!validateMove(board, p, color, koPoint).valid) continue;

      let score = evaluateMove(board, p, color, koPoint);

      // Thêm yếu tố ngẫu nhiên tùy độ khó để Bot chơi tự nhiên và không rập khuôn
      if (difficulty === 'easy') {
        const noise = (Math.random() - 0.5) * 400;
        score += noise;
      } else {
        const noise = (Math.random() - 0.5) * 60;
        score += noise;
      }

      candidates.push({ point: p, score });
    }
  }

  if (candidates.length === 0) {
    return null; // Không còn nước đi hợp lệ -> Bỏ lượt (Pass)
  }

  // Sắp xếp giảm dần theo điểm đánh giá
  candidates.sort((a, b) => b.score - a.score);

  const bestCandidate = candidates[0];

  // Nếu điểm của nước đi tốt nhất quá thấp (ví dụ dưới -400, chỉ toàn nước tự sát hại mình)
  // và ván cờ đã tiến triển khá nhiều, Bot sẽ chủ động Bỏ lượt (Pass)
  if (bestCandidate.score < -300) {
    return null;
  }

  // Cấp độ Dễ: có 25% cơ hội chọn ngẫu nhiên trong top 3 nước đi tốt nhất
  if (difficulty === 'easy' && candidates.length >= 3 && Math.random() < 0.25) {
    const topIdx = Math.floor(Math.random() * Math.min(3, candidates.length));
    return candidates[topIdx].point;
  }

  return bestCandidate.point;
}
