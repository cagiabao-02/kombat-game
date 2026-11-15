export type Grid = number[][];

export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Tile {
  id: number;
  value: number;
  row: number; // 0..3
  col: number; // 0..3
  isNew?: boolean;
  isMerged?: boolean;
  isDeleted?: boolean;
}

export interface MoveResult {
  grid: Grid;
  scoreGained: number;
  moved: boolean;
  maxMergedValue: number;
  mergedCount: number;
}

export interface MoveTilesResult {
  tiles: Tile[];
  scoreGained: number;
  moved: boolean;
  maxMergedValue: number;
  mergedCount: number;
  nextId: number;
}

export const GRID_SIZE = 4;

/**
 * Chuyển đổi danh sách Tiles động sang ma trận tĩnh Grid 4x4
 */
export function tilesToGrid(tiles: Tile[]): Grid {
  const grid = createEmptyGrid();
  for (const t of tiles) {
    if (!t.isDeleted && t.row >= 0 && t.row < GRID_SIZE && t.col >= 0 && t.col < GRID_SIZE) {
      grid[t.row][t.col] = t.value;
    }
  }
  return grid;
}

/**
 * Khởi tạo danh sách Tiles cho ván mới
 */
export function initGameTiles(): { tiles: Tile[]; score: number; nextId: number } {
  let nextId = 1;
  const tiles: Tile[] = [];

  const r1 = Math.floor(Math.random() * GRID_SIZE);
  const c1 = Math.floor(Math.random() * GRID_SIZE);
  tiles.push({
    id: nextId++,
    value: Math.random() < 0.9 ? 2 : 4,
    row: r1,
    col: c1,
    isNew: true,
  });

  let r2 = Math.floor(Math.random() * GRID_SIZE);
  let c2 = Math.floor(Math.random() * GRID_SIZE);
  while (r2 === r1 && c2 === c1) {
    r2 = Math.floor(Math.random() * GRID_SIZE);
    c2 = Math.floor(Math.random() * GRID_SIZE);
  }
  tiles.push({
    id: nextId++,
    value: Math.random() < 0.9 ? 2 : 4,
    row: r2,
    col: c2,
    isNew: true,
  });

  return {
    tiles,
    score: 0,
    nextId,
  };
}

/**
 * Thực hiện trượt Tiles theo hướng với hiệu ứng chuyển động mượt mà
 */
export function moveTiles(
  tiles: Tile[],
  direction: Direction,
  nextId: number
): MoveTilesResult {
  // Lọc bỏ những ô đã bị xóa từ lượt trước và reset cờ animation
  const currentTiles = tiles
    .filter((t) => !t.isDeleted)
    .map((t) => ({ ...t, isNew: false, isMerged: false }));

  const resultTiles: Tile[] = [];
  let scoreGained = 0;
  let maxMergedValue = 0;
  let mergedCount = 0;

  if (direction === 'LEFT') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const line = currentTiles
        .filter((t) => t.row === r)
        .sort((a, b) => a.col - b.col);

      let target = 0;
      for (let i = 0; i < line.length; i++) {
        if (i + 1 < line.length && line[i].value === line[i + 1].value) {
          const t1 = line[i];
          const t2 = line[i + 1];
          const mergedValue = t1.value * 2;
          scoreGained += mergedValue;
          if (mergedValue > maxMergedValue) maxMergedValue = mergedValue;
          mergedCount++;

          resultTiles.push({
            ...t1,
            col: target,
            value: mergedValue,
            isMerged: true,
          });
          resultTiles.push({
            ...t2,
            col: target,
            isDeleted: true,
          });
          target++;
          i++;
        } else {
          resultTiles.push({
            ...line[i],
            col: target,
          });
          target++;
        }
      }
    }
  } else if (direction === 'RIGHT') {
    for (let r = 0; r < GRID_SIZE; r++) {
      const line = currentTiles
        .filter((t) => t.row === r)
        .sort((a, b) => b.col - a.col);

      let target = 3;
      for (let i = 0; i < line.length; i++) {
        if (i + 1 < line.length && line[i].value === line[i + 1].value) {
          const t1 = line[i];
          const t2 = line[i + 1];
          const mergedValue = t1.value * 2;
          scoreGained += mergedValue;
          if (mergedValue > maxMergedValue) maxMergedValue = mergedValue;
          mergedCount++;

          resultTiles.push({
            ...t1,
            col: target,
            value: mergedValue,
            isMerged: true,
          });
          resultTiles.push({
            ...t2,
            col: target,
            isDeleted: true,
          });
          target--;
          i++;
        } else {
          resultTiles.push({
            ...line[i],
            col: target,
          });
          target--;
        }
      }
    }
  } else if (direction === 'UP') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const line = currentTiles
        .filter((t) => t.col === c)
        .sort((a, b) => a.row - b.row);

      let target = 0;
      for (let i = 0; i < line.length; i++) {
        if (i + 1 < line.length && line[i].value === line[i + 1].value) {
          const t1 = line[i];
          const t2 = line[i + 1];
          const mergedValue = t1.value * 2;
          scoreGained += mergedValue;
          if (mergedValue > maxMergedValue) maxMergedValue = mergedValue;
          mergedCount++;

          resultTiles.push({
            ...t1,
            row: target,
            value: mergedValue,
            isMerged: true,
          });
          resultTiles.push({
            ...t2,
            row: target,
            isDeleted: true,
          });
          target++;
          i++;
        } else {
          resultTiles.push({
            ...line[i],
            row: target,
          });
          target++;
        }
      }
    }
  } else if (direction === 'DOWN') {
    for (let c = 0; c < GRID_SIZE; c++) {
      const line = currentTiles
        .filter((t) => t.col === c)
        .sort((a, b) => b.row - a.row);

      let target = 3;
      for (let i = 0; i < line.length; i++) {
        if (i + 1 < line.length && line[i].value === line[i + 1].value) {
          const t1 = line[i];
          const t2 = line[i + 1];
          const mergedValue = t1.value * 2;
          scoreGained += mergedValue;
          if (mergedValue > maxMergedValue) maxMergedValue = mergedValue;
          mergedCount++;

          resultTiles.push({
            ...t1,
            row: target,
            value: mergedValue,
            isMerged: true,
          });
          resultTiles.push({
            ...t2,
            row: target,
            isDeleted: true,
          });
          target--;
          i++;
        } else {
          resultTiles.push({
            ...line[i],
            row: target,
          });
          target--;
        }
      }
    }
  }

  // Kiểm tra xem có bất kỳ ô nào thực sự di chuyển hoặc gộp hay không
  const moved =
    mergedCount > 0 ||
    resultTiles.some((rt) => {
      const orig = currentTiles.find((ct) => ct.id === rt.id);
      return orig && (orig.row !== rt.row || orig.col !== rt.col);
    });

  if (!moved) {
    return {
      tiles: currentTiles,
      scoreGained: 0,
      moved: false,
      maxMergedValue: 0,
      mergedCount: 0,
      nextId,
    };
  }

  // Sinh 1 ô mới (90% ra 2, 10% ra 4) vào ô trống còn lại
  const emptyCells: { r: number; c: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const occupied = resultTiles.some(
        (t) => !t.isDeleted && t.row === r && t.col === c
      );
      if (!occupied) {
        emptyCells.push({ r, c });
      }
    }
  }

  let updatedNextId = nextId;
  if (emptyCells.length > 0) {
    const randIndex = Math.floor(Math.random() * emptyCells.length);
    const targetPos = emptyCells[randIndex];
    resultTiles.push({
      id: updatedNextId++,
      value: Math.random() < 0.9 ? 2 : 4,
      row: targetPos.r,
      col: targetPos.c,
      isNew: true,
    });
  }

  return {
    tiles: resultTiles,
    scoreGained,
    moved: true,
    maxMergedValue,
    mergedCount,
    nextId: updatedNextId,
  };
}

/**
 * Tạo ma trận 4x4 trống
 */
export function createEmptyGrid(): Grid {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(0));
}

/**
 * Lấy danh sách tọa độ các ô trống (giá trị 0)
 */
export function getEmptyCells(grid: Grid): { r: number; c: number }[] {
  const empty: { r: number; c: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) {
        empty.push({ r, c });
      }
    }
  }
  return empty;
}

/**
 * Sinh ngẫu nhiên một ô mới (90% ra 2, 10% ra 4) vào một ô trống
 */
export function spawnRandomTile(grid: Grid): {
  grid: Grid;
  spawned: { r: number; c: number; value: number } | null;
} {
  const emptyCells = getEmptyCells(grid);
  if (emptyCells.length === 0) {
    return { grid, spawned: null };
  }

  const randIndex = Math.floor(Math.random() * emptyCells.length);
  const target = emptyCells[randIndex];
  const value = Math.random() < 0.9 ? 2 : 4;

  const nextGrid = grid.map((row) => [...row]);
  nextGrid[target.r][target.c] = value;

  return {
    grid: nextGrid,
    spawned: { r: target.r, c: target.c, value },
  };
}

/**
 * Khởi tạo ván chơi mới: Lưới 4x4 trống và sinh 2 ô đầu tiên
 */
export function initGame(): { grid: Grid; score: number } {
  let grid = createEmptyGrid();
  const spawn1 = spawnRandomTile(grid);
  grid = spawn1.grid;
  const spawn2 = spawnRandomTile(grid);
  grid = spawn2.grid;

  return {
    grid,
    score: 0,
  };
}

/**
 * Xử lý trượt và gộp 1 hàng (chiều sang TRÁI)
 */
function slideAndMergeRow(row: number[]): {
  newRow: number[];
  score: number;
  maxMerged: number;
  merges: number;
} {
  // Lọc bỏ các số 0
  const nonZeros = row.filter((val) => val !== 0);
  const newRow: number[] = [];
  let score = 0;
  let maxMerged = 0;
  let merges = 0;

  let i = 0;
  while (i < nonZeros.length) {
    if (i + 1 < nonZeros.length && nonZeros[i] === nonZeros[i + 1]) {
      const mergedVal = nonZeros[i] * 2;
      newRow.push(mergedVal);
      score += mergedVal;
      merges++;
      if (mergedVal > maxMerged) maxMerged = mergedVal;
      i += 2; // Nhảy qua cả 2 ô đã gộp (không gộp lần thứ 2 trong cùng 1 nước đi)
    } else {
      newRow.push(nonZeros[i]);
      i++;
    }
  }

  // Đệm thêm số 0 vào sau cho đủ độ dài 4
  while (newRow.length < GRID_SIZE) {
    newRow.push(0);
  }

  return { newRow, score, maxMerged, merges };
}

/**
 * Xoay ma trận theo chiều kim đồng hồ
 */
function rotateClockwise(grid: Grid): Grid {
  const result = createEmptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      result[c][GRID_SIZE - 1 - r] = grid[r][c];
    }
  }
  return result;
}

/**
 * Xoay ma trận ngược chiều kim đồng hồ
 */
function rotateCounterClockwise(grid: Grid): Grid {
  const result = createEmptyGrid();
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      result[GRID_SIZE - 1 - c][r] = grid[r][c];
    }
  }
  return result;
}

/**
 * Thực hiện nước đi trượt theo một hướng nhất định
 */
export function move(grid: Grid, direction: Direction): MoveResult {
  let workingGrid: Grid;
  let rotations = 0;

  // Chuẩn hóa mọi hướng về hướng LEFT bằng cách xoay ma trận
  if (direction === 'LEFT') {
    workingGrid = grid.map((r) => [...r]);
    rotations = 0;
  } else if (direction === 'DOWN') {
    workingGrid = rotateClockwise(grid);
    rotations = 1;
  } else if (direction === 'RIGHT') {
    workingGrid = rotateClockwise(rotateClockwise(grid));
    rotations = 2;
  } else {
    // UP
    workingGrid = rotateCounterClockwise(grid);
    rotations = 3;
  }

  let totalScoreGained = 0;
  let maxMergedValue = 0;
  let totalMerges = 0;
  let moved = false;

  const processedGrid: Grid = [];

  for (let r = 0; r < GRID_SIZE; r++) {
    const { newRow, score, maxMerged, merges } = slideAndMergeRow(workingGrid[r]);
    processedGrid.push(newRow);
    totalScoreGained += score;
    totalMerges += merges;
    if (maxMerged > maxMergedValue) maxMergedValue = maxMerged;

    for (let c = 0; c < GRID_SIZE; c++) {
      if (newRow[c] !== workingGrid[r][c]) {
        moved = true;
      }
    }
  }

  // Xoay ma trận trở lại vị trí ban đầu
  let finalGrid = processedGrid;
  if (rotations === 1) {
    finalGrid = rotateCounterClockwise(processedGrid);
  } else if (rotations === 2) {
    finalGrid = rotateClockwise(rotateClockwise(processedGrid));
  } else if (rotations === 3) {
    finalGrid = rotateClockwise(processedGrid);
  }

  return {
    grid: finalGrid,
    scoreGained: totalScoreGained,
    moved,
    maxMergedValue,
    mergedCount: totalMerges,
  };
}

/**
 * Kiểm tra xem ván chơi đã kết thúc (Game Over) chưa:
 * 1. Không còn ô trống nào (giá trị 0).
 * 2. Không có bất kỳ 2 ô kề nhau nào có cùng giá trị (ngang hoặc dọc).
 */
export function isGameOver(grid: Grid): boolean {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] === 0) return false;
      // Kiểm tra kề phải
      if (c + 1 < GRID_SIZE && grid[r][c] === grid[r][c + 1]) return false;
      // Kiểm tra kề dưới
      if (r + 1 < GRID_SIZE && grid[r][c] === grid[r + 1][c]) return false;
    }
  }
  return true;
}

/**
 * Lấy ô số lớn nhất hiện có trên bàn cờ
 */
export function getMaxTile(grid: Grid): number {
  let max = 0;
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c] > max) max = grid[r][c];
    }
  }
  return max;
}

/**
 * Kiểm tra người chơi đã chạm mốc 2048 hay chưa
 */
export function hasReached2048(grid: Grid): boolean {
  return getMaxTile(grid) >= 2048;
}
