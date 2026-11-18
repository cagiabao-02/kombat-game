import {
  BoardSize,
  GoBoard,
  GoColor,
  Point,
  StoneGroup,
  MoveResult,
  TerritoryScore,
} from './types';

/**
 * Khởi tạo bàn cờ rỗng theo kích thước
 */
export function createEmptyBoard(size: BoardSize): GoBoard {
  const board: GoBoard = [];
  for (let r = 0; r < size; r++) {
    const row: (GoColor | null)[] = [];
    for (let c = 0; c < size; c++) {
      row.push(null);
    }
    board.push(row);
  }
  return board;
}

/**
 * Sao chép sâu bàn cờ
 */
export function cloneBoard(board: GoBoard): GoBoard {
  return board.map((row) => [...row]);
}

/**
 * Kiểm tra điểm có nằm trong phạm vi bàn cờ không
 */
export function isInBounds(p: Point, size: BoardSize): boolean {
  return p.row >= 0 && p.row < size && p.col >= 0 && p.col < size;
}

/**
 * Lấy 4 giao điểm lân cận trực giao (Trực tiếp: Trên, Dưới, Trái, Phải)
 */
export function getNeighbors(p: Point, size: BoardSize): Point[] {
  const neighbors: Point[] = [];
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
  ];

  for (const d of directions) {
    const neighbor = { row: p.row + d.row, col: p.col + d.col };
    if (isInBounds(neighbor, size)) {
      neighbors.push(neighbor);
    }
  }

  return neighbors;
}

/**
 * Tìm nhóm quân liên kết cùng màu và tất cả các "khí" (giao điểm trống liền kề)
 */
export function findGroup(board: GoBoard, start: Point): StoneGroup | null {
  const size = board.length as BoardSize;
  const color = board[start.row]?.[start.col];
  if (!color) return null;

  const visitedStones = new Set<string>();
  const visitedLiberties = new Set<string>();
  const stones: Point[] = [];
  const liberties: Point[] = [];

  const queue: Point[] = [start];
  visitedStones.add(`${start.row},${start.col}`);

  while (queue.length > 0) {
    const curr = queue.shift()!;
    stones.push(curr);

    const neighbors = getNeighbors(curr, size);
    for (const nb of neighbors) {
      const nbKey = `${nb.row},${nb.col}`;
      const cell = board[nb.row][nb.col];

      if (cell === null) {
        // Giao điểm trống chính là "khí" của nhóm
        if (!visitedLiberties.has(nbKey)) {
          visitedLiberties.add(nbKey);
          liberties.push(nb);
        }
      } else if (cell === color) {
        // Quân cùng màu liên kết
        if (!visitedStones.has(nbKey)) {
          visitedStones.add(nbKey);
          queue.push(nb);
        }
      }
    }
  }

  return { color, stones, liberties };
}

/**
 * Kiểm tra tính hợp lệ của nước đi theo luật Cờ Vây chuẩn quốc tế
 */
export function validateMove(
  board: GoBoard,
  point: Point,
  color: GoColor,
  koPoint: Point | null
): { valid: boolean; reason?: string } {
  const size = board.length as BoardSize;

  if (!isInBounds(point, size)) {
    return { valid: false, reason: 'Nước đi nằm ngoài bàn cờ' };
  }

  if (board[point.row][point.col] !== null) {
    return { valid: false, reason: 'Giao điểm này đã có quân cờ' };
  }

  // Kiểm tra luật Kiếp (Ko Rule)
  if (koPoint && point.row === koPoint.row && point.col === koPoint.col) {
    return {
      valid: false,
      reason: 'Luật Kiếp (Ko): Cấm đánh lại ngay vào giao điểm vừa bị bắt',
    };
  }

  // Giả lập đặt quân để kiểm tra ăn quân & cấm tự sát
  const opponentColor: GoColor = color === 'black' ? 'white' : 'black';
  const tempBoard = cloneBoard(board);
  tempBoard[point.row][point.col] = color;

  const neighbors = getNeighbors(point, size);
  let opponentCaptured = false;

  // 1. Kiểm tra xem nước đi có làm hết khí của đám quân đối phương nào không
  const checkedOpponents = new Set<string>();
  for (const nb of neighbors) {
    if (tempBoard[nb.row][nb.col] === opponentColor) {
      const nbKey = `${nb.row},${nb.col}`;
      if (!checkedOpponents.has(nbKey)) {
        const oppGroup = findGroup(tempBoard, nb);
        if (oppGroup) {
          oppGroup.stones.forEach((s) => checkedOpponents.add(`${s.row},${s.col}`));
          if (oppGroup.liberties.length === 0) {
            opponentCaptured = true;
            break;
          }
        }
      }
    }
  }

  // 2. Nếu ăn được quân đối phương $\rightarrow$ Hợp lệ (vì ăn quân sẽ tạo ra khí mới)
  if (opponentCaptured) {
    return { valid: true };
  }

  // 3. Nếu không ăn được ai, kiểm tra xem quân mình vừa đặt có khí không (Chống tự sát)
  const ownGroup = findGroup(tempBoard, point);
  if (!ownGroup || ownGroup.liberties.length === 0) {
    return {
      valid: false,
      reason: 'Nước đi tự sát (Suicide): Quân không còn khí để sống',
    };
  }

  return { valid: true };
}

/**
 * Thực hiện nước đi và trả về kết quả (các quân bị bắt, bàn cờ mới, điểm Ko tiếp theo)
 */
export function playMove(
  board: GoBoard,
  point: Point,
  color: GoColor,
  koPoint: Point | null
): MoveResult {
  const check = validateMove(board, point, color, koPoint);
  if (!check.valid) {
    return {
      valid: false,
      error: check.reason,
      captures: [],
      newBoard: board,
      newKoPoint: null,
    };
  }

  const size = board.length as BoardSize;
  const opponentColor: GoColor = color === 'black' ? 'white' : 'black';
  const newBoard = cloneBoard(board);
  newBoard[point.row][point.col] = color;

  const neighbors = getNeighbors(point, size);
  const capturedStones: Point[] = [];
  const checkedOpponents = new Set<string>();

  // Bắt các đám quân đối phương có 0 khí
  for (const nb of neighbors) {
    if (newBoard[nb.row][nb.col] === opponentColor) {
      const nbKey = `${nb.row},${nb.col}`;
      if (!checkedOpponents.has(nbKey)) {
        const oppGroup = findGroup(newBoard, nb);
        if (oppGroup) {
          oppGroup.stones.forEach((s) => checkedOpponents.add(`${s.row},${s.col}`));
          if (oppGroup.liberties.length === 0) {
            // Nhấc toàn bộ đám quân bị bắt khỏi bàn cờ
            for (const stone of oppGroup.stones) {
              newBoard[stone.row][stone.col] = null;
              capturedStones.push(stone);
            }
          }
        }
      }
    }
  }

  // Xác định điểm Kiếp (Ko) cho lượt sau:
  // Luật Ko xảy ra khi:
  // - Đúng 1 quân đối phương bị bắt
  // - Quân vừa đánh là quân đơn độc (group.stones.length === 1)
  // - Quân vừa đánh chỉ còn đúng 1 khí duy nhất
  let newKoPoint: Point | null = null;
  if (capturedStones.length === 1) {
    const ownGroup = findGroup(newBoard, point);
    if (
      ownGroup &&
      ownGroup.stones.length === 1 &&
      ownGroup.liberties.length === 1
    ) {
      newKoPoint = capturedStones[0];
    }
  }

  return {
    valid: true,
    captures: capturedStones,
    newBoard,
    newKoPoint,
  };
}

/**
 * Thuật toán tính điểm lãnh thổ (Territory Scoring) chuẩn quốc tế
 * Một vùng đất trống thuộc về một bên nếu toàn bộ các giao điểm bao quanh vùng đó chỉ tiếp giáp với quân của bên đó.
 */
export function calculateTerritory(
  board: GoBoard,
  captures: { black: number; white: number },
  komi: number = 6.5
): TerritoryScore {
  const size = board.length as BoardSize;
  const visited = new Set<string>();

  let blackTerritory = 0;
  let whiteTerritory = 0;

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const key = `${r},${c}`;
      if (board[r][c] !== null || visited.has(key)) continue;

      // Tìm toàn bộ vùng đất trống liên kết bằng BFS
      const emptyRegion: Point[] = [];
      const borderColors = new Set<GoColor>();
      const queue: Point[] = [{ row: r, col: c }];
      visited.add(key);

      while (queue.length > 0) {
        const curr = queue.shift()!;
        emptyRegion.push(curr);

        const neighbors = getNeighbors(curr, size);
        for (const nb of neighbors) {
          const nbKey = `${nb.row},${nb.col}`;
          const neighborCell = board[nb.row][nb.col];

          if (neighborCell === null) {
            if (!visited.has(nbKey)) {
              visited.add(nbKey);
              queue.push(nb);
            }
          } else {
            borderColors.add(neighborCell);
          }
        }
      }

      // Nếu vùng đất chỉ tiếp giáp với duy nhất quân Đen -> Đất của Đen
      if (borderColors.size === 1 && borderColors.has('black')) {
        blackTerritory += emptyRegion.length;
      }
      // Nếu vùng đất chỉ tiếp giáp với duy nhất quân Trắng -> Đất của Trắng
      else if (borderColors.size === 1 && borderColors.has('white')) {
        whiteTerritory += emptyRegion.length;
      }
      // Nếu tiếp giáp cả hai hoặc không tiếp giáp ai -> Đất trung lập (Dame), không tính điểm
    }
  }

  const blackTotal = blackTerritory + captures.black;
  const whiteTotal = whiteTerritory + captures.white + komi;
  const winner: GoColor = blackTotal > whiteTotal ? 'black' : 'white';
  const margin = Math.round(Math.abs(blackTotal - whiteTotal) * 10) / 10;

  return {
    blackTerritory,
    whiteTerritory,
    blackCaptures: captures.black,
    whiteCaptures: captures.white,
    komi,
    blackTotal,
    whiteTotal,
    winner,
    margin,
  };
}

/**
 * Tọa độ các điểm sao định vị (Hoshi / Tengen) trên bàn cờ gỗ
 */
export function getStarPoints(size: BoardSize): Point[] {
  if (size === 9) {
    return [
      { row: 2, col: 2 },
      { row: 2, col: 6 },
      { row: 6, col: 2 },
      { row: 6, col: 6 },
      { row: 4, col: 4 }, // Tengen
    ];
  }
  if (size === 13) {
    return [
      { row: 3, col: 3 },
      { row: 3, col: 9 },
      { row: 9, col: 3 },
      { row: 9, col: 9 },
      { row: 6, col: 6 }, // Tengen
    ];
  }
  // 19x19
  return [
    { row: 3, col: 3 },
    { row: 3, col: 9 },
    { row: 3, col: 15 },
    { row: 9, col: 3 },
    { row: 9, col: 9 }, // Tengen
    { row: 9, col: 15 },
    { row: 15, col: 3 },
    { row: 15, col: 9 },
    { row: 15, col: 15 },
  ];
}
