import { SudokuGrid } from './types';

/**
 * Returns a set of cell keys (e.g., "r-c") that currently conflict with another cell in the same row, column, or 3x3 box.
 */
export function findConflictingCells(board: SudokuGrid): Set<string> {
  const conflicts = new Set<string>();

  // Check rows
  for (let r = 0; r < 9; r++) {
    const seen = new Map<number, number[]>();
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val !== null) {
        if (!seen.has(val)) {
          seen.set(val, []);
        }
        seen.get(val)!.push(c);
      }
    }
    for (const [, cols] of seen) {
      if (cols.length > 1) {
        for (const c of cols) {
          conflicts.add(`${r}-${c}`);
        }
      }
    }
  }

  // Check columns
  for (let c = 0; c < 9; c++) {
    const seen = new Map<number, number[]>();
    for (let r = 0; r < 9; r++) {
      const val = board[r][c];
      if (val !== null) {
        if (!seen.has(val)) {
          seen.set(val, []);
        }
        seen.get(val)!.push(r);
      }
    }
    for (const [, rows] of seen) {
      if (rows.length > 1) {
        for (const r of rows) {
          conflicts.add(`${r}-${c}`);
        }
      }
    }
  }

  // Check 3x3 boxes
  for (let boxRow = 0; boxRow < 3; boxRow++) {
    for (let boxCol = 0; boxCol < 3; boxCol++) {
      const seen = new Map<number, [number, number][]>();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const row = boxRow * 3 + r;
          const col = boxCol * 3 + c;
          const val = board[row][col];
          if (val !== null) {
            if (!seen.has(val)) {
              seen.set(val, []);
            }
            seen.get(val)!.push([row, col]);
          }
        }
      }
      for (const [, positions] of seen) {
        if (positions.length > 1) {
          for (const [row, col] of positions) {
            conflicts.add(`${row}-${col}`);
          }
        }
      }
    }
  }

  return conflicts;
}

/**
 * Checks if the board is completely filled and has no conflicts.
 */
export function isBoardComplete(board: SudokuGrid, solution?: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = board[r][c];
      if (val === null) return false;
      if (solution && val !== solution[r][c]) return false;
    }
  }

  // Also verify no rule violations
  return findConflictingCells(board).size === 0;
}

