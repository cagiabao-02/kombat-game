import {
  OthelloBoardState,
  OthelloCoord,
  OthelloCounts,
  OthelloMoveResult,
  OthelloStone,
  OthelloWinner,
} from './types';

export const OTHELLO_SIZE = 8;

const DIRECTIONS: readonly [number, number][] = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

export function getOpponentColor(color: OthelloStone): OthelloStone {
  return color === 'black' ? 'white' : 'black';
}

export function createInitialBoard(): OthelloBoardState {
  const board: OthelloBoardState = Array.from({ length: OTHELLO_SIZE }, () =>
    Array<OthelloStone | null>(OTHELLO_SIZE).fill(null)
  );
  board[3][3] = 'white';
  board[3][4] = 'black';
  board[4][3] = 'black';
  board[4][4] = 'white';
  return board;
}

export function cloneBoard(board: OthelloBoardState): OthelloBoardState {
  return board.map((row) => [...row]);
}

function isInside(row: number, col: number): boolean {
  return row >= 0 && row < OTHELLO_SIZE && col >= 0 && col < OTHELLO_SIZE;
}

/**
 * Tìm danh sách quân đối phương bị kẹp và sẽ lật nếu đặt `color` tại (row, col)
 */
export function getFlippablePieces(
  board: OthelloBoardState,
  row: number,
  col: number,
  color: OthelloStone
): OthelloCoord[] {
  if (!isInside(row, col) || board[row][col] !== null) {
    return [];
  }

  const opponent = getOpponentColor(color);
  const flipped: OthelloCoord[] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const line: OthelloCoord[] = [];
    let r = row + dr;
    let c = col + dc;

    while (isInside(r, c) && board[r][c] === opponent) {
      line.push({ row: r, col: c });
      r += dr;
      c += dc;
    }

    if (line.length > 0 && isInside(r, c) && board[r][c] === color) {
      flipped.push(...line);
    }
  }

  return flipped;
}

/**
 * Toàn bộ các nước đi hợp lệ của `color`
 */
export function getValidMoves(
  board: OthelloBoardState,
  color: OthelloStone
): OthelloCoord[] {
  const moves: OthelloCoord[] = [];
  for (let r = 0; r < OTHELLO_SIZE; r++) {
    for (let c = 0; c < OTHELLO_SIZE; c++) {
      if (board[r][c] === null && getFlippablePieces(board, r, c, color).length > 0) {
        moves.push({ row: r, col: c });
      }
    }
  }
  return moves;
}

/**
 * Áp dụng nước đi, trả về bàn cờ mới và danh sách ô vừa bị lật
 */
export function applyMove(
  board: OthelloBoardState,
  row: number,
  col: number,
  color: OthelloStone
): OthelloMoveResult | null {
  const flipped = getFlippablePieces(board, row, col, color);
  if (flipped.length === 0) {
    return null;
  }

  const nextBoard = cloneBoard(board);
  nextBoard[row][col] = color;
  for (const pos of flipped) {
    nextBoard[pos.row][pos.col] = color;
  }

  return { nextBoard, flipped };
}

export function countPieces(board: OthelloBoardState): OthelloCounts {
  let black = 0;
  let white = 0;
  let empty = 0;

  for (let r = 0; r < OTHELLO_SIZE; r++) {
    for (let c = 0; c < OTHELLO_SIZE; c++) {
      const cell = board[r][c];
      if (cell === 'black') black++;
      else if (cell === 'white') white++;
      else empty++;
    }
  }

  return { black, white, empty };
}

export function determineWinner(counts: OthelloCounts): OthelloWinner {
  if (counts.black > counts.white) return 'black';
  if (counts.white > counts.black) return 'white';
  return 'draw';
}

/**
 * Tính trạng thái lượt tiếp theo sau khi `justMovedColor` vừa đánh xong.
 * Tự động xử lý trường hợp đối thủ không có nước đi (Pass) hoặc cả 2 bên hết nước (Game Over).
 */
export function resolveNextTurn(
  board: OthelloBoardState,
  justMovedColor: OthelloStone
): {
  nextTurn: OthelloStone;
  validMoves: OthelloCoord[];
  passed: boolean;
  isGameOver: boolean;
  winner: OthelloWinner;
  counts: OthelloCounts;
} {
  const counts = countPieces(board);
  const opponent = getOpponentColor(justMovedColor);
  const opponentMoves = getValidMoves(board, opponent);

  if (opponentMoves.length > 0) {
    return {
      nextTurn: opponent,
      validMoves: opponentMoves,
      passed: false,
      isGameOver: false,
      winner: null,
      counts,
    };
  }

  // Đối thủ hết nước đi -> kiểm tra xem người vừa đánh có đi tiếp được không
  const selfMoves = getValidMoves(board, justMovedColor);
  if (selfMoves.length > 0) {
    return {
      nextTurn: justMovedColor,
      validMoves: selfMoves,
      passed: true,
      isGameOver: false,
      winner: null,
      counts,
    };
  }

  // Cả 2 đều hết nước -> Kết thúc ván đấu
  return {
    nextTurn: opponent,
    validMoves: [],
    passed: false,
    isGameOver: true,
    winner: determineWinner(counts),
    counts,
  };
}
