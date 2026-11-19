import { ActivePiece, TetrominoType, TetrisBoard } from './types';

export const TETRIS_ROWS = 20;
export const TETRIS_COLS = 10;

export const TETROMINO_SHAPES: Record<TetrominoType, number[][]> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
};

/** Bảng màu khối gạch Neo-Arcade 16-bit (màu chính, viền sáng, viền tối) */
export const TETROMINO_COLORS: Record<
  TetrominoType,
  { main: string; light: string; dark: string }
> = {
  I: { main: '#06B6D4', light: '#67E8F9', dark: '#0E7490' }, // Cyan
  J: { main: '#3B82F6', light: '#93C5FD', dark: '#1D4ED8' }, // Blue
  L: { main: '#F97316', light: '#FDBA74', dark: '#C2410C' }, // Orange
  O: { main: '#EAB308', light: '#FEF08A', dark: '#A16207' }, // Yellow
  S: { main: '#10B981', light: '#6EE7B7', dark: '#047857' }, // Emerald
  T: { main: '#A855F7', light: '#D8B4FE', dark: '#7E22CE' }, // Purple
  Z: { main: '#F43F5E', light: '#FDA4AF', dark: '#BE123C' }, // Rose
};

export function createEmptyTetrisBoard(): TetrisBoard {
  return Array.from({ length: TETRIS_ROWS }, () =>
    Array<TetrominoType | null>(TETRIS_COLS).fill(null)
  );
}

/**
 * 7-Bag Randomizer: Trộn đủ 7 loại khối vào 1 túi, tránh lặp hoặc thiếu khối quá lâu
 */
export function generateSevenBag(): TetrominoType[] {
  const bag: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bag[i], bag[j]] = [bag[j], bag[i]];
  }
  return bag;
}

export function spawnPiece(type: TetrominoType): ActivePiece {
  const matrix = TETROMINO_SHAPES[type].map((row) => [...row]);
  const col = Math.floor((TETRIS_COLS - matrix[0].length) / 2);
  const row = type === 'I' ? -1 : 0;
  return { type, matrix, row, col };
}

export function isValidPosition(
  board: TetrisBoard,
  matrix: number[][],
  targetRow: number,
  targetCol: number
): boolean {
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (!matrix[r][c]) continue;
      const boardR = targetRow + r;
      const boardC = targetCol + c;

      if (boardC < 0 || boardC >= TETRIS_COLS || boardR >= TETRIS_ROWS) {
        return false;
      }
      if (boardR >= 0 && board[boardR][boardC] !== null) {
        return false;
      }
    }
  }
  return true;
}

export function rotateMatrixCW(matrix: number[][]): number[][] {
  const N = matrix.length;
  const result = Array.from({ length: N }, () => Array(N).fill(0));
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N; c++) {
      result[c][N - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

/**
 * Thử xoay khối 90° theo chiều kim đồng hồ kèm Wall Kick (SRS-lite)
 */
export function tryRotatePiece(
  board: TetrisBoard,
  piece: ActivePiece
): ActivePiece | null {
  if (piece.type === 'O') return piece; // Khối vuông 2x2 không cần xoay

  const rotatedMatrix = rotateMatrixCW(piece.matrix);
  const kickOffsets = [
    [0, 0],
    [-1, 0],
    [1, 0],
    [0, -1],
    [-2, 0],
    [2, 0],
    [-1, -1],
    [1, -1],
  ];

  for (const [dc, dr] of kickOffsets) {
    if (isValidPosition(board, rotatedMatrix, piece.row + dr, piece.col + dc)) {
      return {
        ...piece,
        matrix: rotatedMatrix,
        row: piece.row + dr,
        col: piece.col + dc,
      };
    }
  }

  return null;
}

/**
 * Tính vị trí đáy cho bóng mờ (Ghost Piece)
 */
export function getGhostRow(board: TetrisBoard, piece: ActivePiece): number {
  let ghostR = piece.row;
  while (isValidPosition(board, piece.matrix, ghostR + 1, piece.col)) {
    ghostR++;
  }
  return ghostR;
}

/**
 * Khóa khối hiện tại vào bảng và quét xóa các dòng đầy
 */
export function lockPieceAndClearLines(
  board: TetrisBoard,
  piece: ActivePiece
): {
  newBoard: TetrisBoard;
  clearedCount: number;
  clearedRowIndices: number[];
  toppedOut: boolean;
} {
  const newBoard = board.map((r) => [...r]);
  let toppedOut = false;

  for (let r = 0; r < piece.matrix.length; r++) {
    for (let c = 0; c < piece.matrix[r].length; c++) {
      if (!piece.matrix[r][c]) continue;
      const br = piece.row + r;
      const bc = piece.col + c;
      if (br < 0) {
        toppedOut = true;
      } else if (br < TETRIS_ROWS && bc >= 0 && bc < TETRIS_COLS) {
        newBoard[br][bc] = piece.type;
      }
    }
  }

  const clearedRowIndices: number[] = [];
  const remainingRows: TetrisBoard = [];

  for (let r = 0; r < TETRIS_ROWS; r++) {
    if (newBoard[r].every((cell) => cell !== null)) {
      clearedRowIndices.push(r);
    } else {
      remainingRows.push(newBoard[r]);
    }
  }

  const clearedCount = clearedRowIndices.length;
  while (remainingRows.length < TETRIS_ROWS) {
    remainingRows.unshift(Array<TetrominoType | null>(TETRIS_COLS).fill(null));
  }

  return {
    newBoard: remainingRows,
    clearedCount,
    clearedRowIndices,
    toppedOut,
  };
}

export function calculateLineScore(
  clearedCount: number,
  level: number,
  combo: number
): number {
  if (clearedCount <= 0) return 0;
  const basePoints =
    clearedCount === 1
      ? 100
      : clearedCount === 2
      ? 300
      : clearedCount === 3
      ? 500
      : 800; // 4 dòng (TETRIS!)

  const comboBonus = combo > 0 ? 50 * combo * level : 0;
  return basePoints * level + comboBonus;
}

/**
 * Tốc độ rơi tự động (ms) giảm dần theo Level
 */
export function getDropIntervalMs(level: number): number {
  return Math.max(85, 780 - (level - 1) * 55);
}
