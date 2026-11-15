export type MinesweeperDifficulty = 'beginner' | 'intermediate' | 'expert';

export interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  nameVi: string;
  nameEn: string;
}

export const DIFFICULTIES: Record<MinesweeperDifficulty, DifficultyConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10, nameVi: 'Dễ (9×9)', nameEn: 'Easy (9×9)' },
  intermediate: { rows: 16, cols: 16, mines: 40, nameVi: 'Vừa (16×16)', nameEn: 'Medium (16×16)' },
  expert: { rows: 16, cols: 30, mines: 99, nameVi: 'Khó (16×30)', nameEn: 'Hard (16×30)' },
};

export interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  isExploded?: boolean;
  isWrongFlag?: boolean;
}

export type Board = Cell[][];
export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

/** Hướng 8 ô lân cận */
const DIRECTIONS = [
  [-1, -1], [-1, 0], [-1, 1],
  [0, -1],           [0, 1],
  [1, -1],  [1, 0],  [1, 1],
];

/** Tạo bàn cờ rỗng chưa kích hoạt */
export function createEmptyBoard(rows: number, cols: number): Board {
  const board: Board = [];
  for (let r = 0; r < rows; r++) {
    const row: Cell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        row: r,
        col: c,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
      });
    }
    board.push(row);
  }
  return board;
}

/**
 * Rải mìn ngẫu nhiên sau nước click đầu tiên.
 * Đảm bảo ô click đầu tiên và các ô kề (vùng 3x3) KHÔNG BAO GIỜ có mìn.
 */
export function populateMines(
  board: Board,
  rows: number,
  cols: number,
  totalMines: number,
  firstClickRow: number,
  firstClickCol: number
): Board {
  const newBoard: Board = board.map((row) => row.map((cell) => ({ ...cell })));

  // Tập hợp các vị trí an toàn tuyệt đối (vùng 3x3 quanh điểm click)
  const safeCoords = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      const nr = firstClickRow + dr;
      const nc = firstClickCol + dc;
      if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
        safeCoords.add(`${nr},${nc}`);
      }
    }
  }

  // Danh sách các tọa độ khả dụng để đặt mìn
  const availableCoords: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!safeCoords.has(`${r},${c}`)) {
        availableCoords.push([r, c]);
      }
    }
  }

  // Nếu số mìn lớn hơn số ô ngoài vùng an toàn (rất hiếm), thêm lại các ô phụ
  if (availableCoords.length < totalMines) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (r !== firstClickRow || c !== firstClickCol) {
          if (!availableCoords.some(([ar, ac]) => ar === r && ac === c)) {
            availableCoords.push([r, c]);
          }
        }
      }
    }
  }

  // Trộn Fisher-Yates để chọn ngẫu nhiên vị trí đặt mìn
  for (let i = availableCoords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCoords[i], availableCoords[j]] = [availableCoords[j], availableCoords[i]];
  }

  const mineCount = Math.min(totalMines, availableCoords.length);
  for (let i = 0; i < mineCount; i++) {
    const [mr, mc] = availableCoords[i];
    newBoard[mr][mc].isMine = true;
  }

  // Tính số lượng mìn xung quanh từng ô
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) continue;
      let count = 0;
      for (const [dr, dc] of DIRECTIONS) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && newBoard[nr][nc].isMine) {
          count++;
        }
      }
      newBoard[r][c].neighborMines = count;
    }
  }

  return newBoard;
}

/**
 * Mở một ô. Tự động loang (Flood Fill) nếu ô có 0 mìn lân cận.
 */
export function revealCell(
  board: Board,
  row: number,
  col: number,
  totalMines: number
): { board: Board; status: GameStatus; hitMine: boolean } {
  const rows = board.length;
  const cols = board[0].length;
  const newBoard: Board = board.map((r) => r.map((c) => ({ ...c })));
  const target = newBoard[row][col];

  // Nếu ô đã mở hoặc đang cắm cờ, không làm gì
  if (target.isRevealed || target.isFlagged) {
    return { board: newBoard, status: 'playing', hitMine: false };
  }

  // Nếu đạp trúng mìn: Thua cuộc
  if (target.isMine) {
    target.isRevealed = true;
    target.isExploded = true;

    // Lộ toàn bộ mìn và phát hiện cờ cắm sai
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cell = newBoard[r][c];
        if (cell.isMine && !cell.isFlagged) {
          cell.isRevealed = true;
        } else if (!cell.isMine && cell.isFlagged) {
          cell.isWrongFlag = true;
        }
      }
    }

    return { board: newBoard, status: 'lost', hitMine: true };
  }

  // Mở an toàn & Loang (Breadth-First Search)
  const queue: [number, number][] = [[row, col]];
  target.isRevealed = true;

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    const curr = newBoard[cr][cc];

    // Chỉ loang tiếp nếu ô hiện tại là ô trống (0 mìn xung quanh)
    if (curr.neighborMines === 0) {
      for (const [dr, dc] of DIRECTIONS) {
        const nr = cr + dr;
        const nc = cc + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          const neighbor = newBoard[nr][nc];
          if (!neighbor.isRevealed && !neighbor.isFlagged && !neighbor.isMine) {
            neighbor.isRevealed = true;
            if (neighbor.neighborMines === 0) {
              queue.push([nr, nc]);
            }
          }
        }
      }
    }
  }

  // Kiểm tra điều kiện chiến thắng: Tất cả các ô an toàn đều đã mở
  let revealedCount = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isRevealed && !newBoard[r][c].isMine) {
        revealedCount++;
      }
    }
  }

  const safeCellCount = rows * cols - totalMines;
  if (revealedCount === safeCellCount) {
    // Thắng ván đấu! Tự động cắm cờ cho các quả mìn còn lại
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (newBoard[r][c].isMine) {
          newBoard[r][c].isFlagged = true;
        }
      }
    }
    return { board: newBoard, status: 'won', hitMine: false };
  }

  return { board: newBoard, status: 'playing', hitMine: false };
}

/**
 * Cắm hoặc gỡ cờ 🚩
 */
export function toggleFlag(board: Board, row: number, col: number): Board {
  const newBoard: Board = board.map((r) => r.map((c) => ({ ...c })));
  const cell = newBoard[row][col];
  if (!cell.isRevealed) {
    cell.isFlagged = !cell.isFlagged;
  }
  return newBoard;
}

/**
 * Mở nhanh các ô xung quanh (Chord):
 * Khi ô số đã mở có đủ số cờ bao quanh bằng đúng số mìn,
 * click vào ô đó sẽ tự động mở tất cả các ô chưa cắm cờ kề bên.
 */
export function chordCell(
  board: Board,
  row: number,
  col: number,
  totalMines: number
): { board: Board; status: GameStatus; hitMine: boolean } {
  const rows = board.length;
  const cols = board[0].length;
  const target = board[row][col];

  if (!target.isRevealed || target.neighborMines === 0) {
    return { board, status: 'playing', hitMine: false };
  }

  // Đếm số cờ xung quanh
  let flagCount = 0;
  const toReveal: [number, number][] = [];

  for (const [dr, dc] of DIRECTIONS) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      if (board[nr][nc].isFlagged) {
        flagCount++;
      } else if (!board[nr][nc].isRevealed) {
        toReveal.push([nr, nc]);
      }
    }
  }

  // Nếu số cờ bằng đúng số mìn lân cận -> mở các ô còn lại
  if (flagCount === target.neighborMines && toReveal.length > 0) {
    let currentBoard = board;
    for (const [tr, tc] of toReveal) {
      const result = revealCell(currentBoard, tr, tc, totalMines);
      currentBoard = result.board;
      if (result.status === 'lost') {
        return { board: currentBoard, status: 'lost', hitMine: true };
      }
      if (result.status === 'won') {
        return { board: currentBoard, status: 'won', hitMine: false };
      }
    }
    return { board: currentBoard, status: 'playing', hitMine: false };
  }

  return { board, status: 'playing', hitMine: false };
}

/** Đếm số cờ đã cắm trên bàn cờ */
export function countFlags(board: Board): number {
  let flags = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell.isFlagged) flags++;
    }
  }
  return flags;
}
