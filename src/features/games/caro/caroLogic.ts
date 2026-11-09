import { CARO_BOARD_SIZE, CaroBoard, CaroCell, CaroPiece, CaroWinResult } from './types';

/**
 * Khởi tạo bảng cờ Caro 15x15 ô trống
 */
export function createEmptyBoard(): CaroBoard {
  return Array.from({ length: CARO_BOARD_SIZE }, () =>
    Array(CARO_BOARD_SIZE).fill(null)
  );
}

/**
 * Kiểm tra toạ độ có nằm trong phạm vi bàn cờ không
 */
export function isWithinBoard(row: number, col: number): boolean {
  return row >= 0 && row < CARO_BOARD_SIZE && col >= 0 && col < CARO_BOARD_SIZE;
}

/**
 * Kiểm tra nước đi có hợp lệ không (ô còn trống và trong bàn)
 */
export function isValidMove(board: CaroBoard, row: number, col: number): boolean {
  if (!isWithinBoard(row, col)) return false;
  return board[row][col] === null;
}

/**
 * Đặt quân cờ vào bàn và trả về bàn cờ mới (immutability)
 */
export function placePiece(
  board: CaroBoard,
  row: number,
  col: number,
  player: CaroPiece
): CaroBoard {
  const newBoard = board.map((r) => [...r]);
  newBoard[row][col] = player;
  return newBoard;
}

/**
 * 4 hướng quét để kiểm tra 5 quân liên tiếp:
 * 1. Ngang (Horizontal): [0, 1]
 * 2. Dọc (Vertical): [1, 0]
 * 3. Chéo chính (Main Diagonal \): [1, 1]
 * 4. Chéo phụ (Anti Diagonal /): [1, -1]
 */
const DIRECTIONS: [number, number][] = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1],
];

/**
 * Kiểm tra xem nước đi vừa đánh tại (lastRow, lastCol) có tạo thành 5 quân liên tiếp không
 */
export function checkWin(
  board: CaroBoard,
  lastRow: number,
  lastCol: number
): CaroWinResult | null {
  const player = board[lastRow][lastCol];
  if (!player) return null;

  for (const [dr, dc] of DIRECTIONS) {
    const line: { row: number; col: number }[] = [{ row: lastRow, col: lastCol }];

    // Quét theo chiều dương (+dr, +dc)
    let r = lastRow + dr;
    let c = lastCol + dc;
    while (isWithinBoard(r, c) && board[r][c] === player) {
      line.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    // Quét theo chiều âm (-dr, -dc)
    r = lastRow - dr;
    c = lastCol - dc;
    while (isWithinBoard(r, c) && board[r][c] === player) {
      line.unshift({ row: r, col: c });
      r -= dr;
      c -= dc;
    }

    // Nếu đạt từ 5 quân liên tiếp trở lên -> Thắng
    if (line.length >= 5) {
      return {
        winner: player,
        winningLine: line,
      };
    }
  }

  return null;
}

/**
 * Kiểm tra bàn cờ đã đầy chưa (Hòa cờ nếu đầy mà không ai thắng)
 */
export function isBoardFull(board: CaroBoard): boolean {
  for (let r = 0; r < CARO_BOARD_SIZE; r++) {
    for (let c = 0; c < CARO_BOARD_SIZE; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}

