import { SudokuDifficulty, SudokuGrid } from './types';

/**
 * Creates an empty 9x9 board
 */
function createEmptyBoard<T>(fillValue: T): T[][] {
  return Array.from({ length: 9 }, () => Array(9).fill(fillValue));
}

/**
 * Checks if placing a number is valid according to Sudoku rules
 */
function isValidPlacement(board: number[][], row: number, col: number, num: number): boolean {
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) return false;
    if (board[i][col] === num) return false;
  }

  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      if (board[startRow + r][startCol + c] === num) return false;
    }
  }

  return true;
}

/**
 * Fisher-Yates shuffle array
 */
function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Fills a 9x9 board completely with valid Sudoku solution
 */
function fillBoard(board: number[][]): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === 0) {
        const numbers = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of numbers) {
          if (isValidPlacement(board, r, c, num)) {
            board[r][c] = num;
            if (fillBoard(board)) {
              return true;
            }
            board[r][c] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

/**
 * Counts the number of solutions for a given board (stopping early at 2 to check uniqueness)
 */
function countSolutions(board: number[][], limit = 2): number {
  let count = 0;

  function solve(): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(board, r, c, num)) {
              board[r][c] = num;
              solve();
              board[r][c] = 0;
              if (count >= limit) return true;
            }
          }
          return false;
        }
      }
    }
    count++;
    return count >= limit;
  }

  solve();
  return count;
}

/**
 * Generates a full solution and a puzzle with given difficulty,
 * ensuring balanced distribution of clues across all nine 3x3 blocks.
 */
export function generateSudoku(difficulty: SudokuDifficulty): {
  puzzle: SudokuGrid;
  solution: number[][];
} {
  // 1. Generate full valid board
  const solution = createEmptyBoard(0);
  fillBoard(solution);

  // 2. Clone board to create puzzle
  const puzzleBoard = solution.map((row) => [...row]);

  // Target blank counts and box bounds based on difficulty:
  // - Easy: ~38 blanks (min 3 blanks per box, max 6 blanks per box)
  // - Medium: ~48 blanks (min 4 blanks per box, max 7 blanks per box)
  // - Hard: ~54 blanks (min 5 blanks per box, max 8 blanks per box)
  let targetBlanks = 38;
  let minBlanksPerBox = 3;
  let maxBlanksPerBox = 6;

  if (difficulty === 'medium') {
    targetBlanks = 48;
    minBlanksPerBox = 4;
    maxBlanksPerBox = 7;
  } else if (difficulty === 'hard') {
    targetBlanks = 54;
    minBlanksPerBox = 5;
    maxBlanksPerBox = 8;
  }

  const boxBlanks = Array(9).fill(0);
  let removedCount = 0;

  const getBoxIndex = (r: number, c: number) =>
    Math.floor(r / 3) * 3 + Math.floor(c / 3);

  // Phase 1: Ensure every 3x3 box has at least `minBlanksPerBox` blanks
  for (let box = 0; box < 9; box++) {
    const startRow = Math.floor(box / 3) * 3;
    const startCol = (box % 3) * 3;
    const boxPositions: [number, number][] = [];

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        boxPositions.push([startRow + r, startCol + c]);
      }
    }

    const shuffledBoxPositions = shuffle(boxPositions);
    for (const [r, c] of shuffledBoxPositions) {
      if (boxBlanks[box] >= minBlanksPerBox) break;

      const temp = puzzleBoard[r][c];
      puzzleBoard[r][c] = 0;

      const boardCopy = puzzleBoard.map((row) => [...row]);
      if (countSolutions(boardCopy, 2) === 1) {
        boxBlanks[box]++;
        removedCount++;
      } else {
        puzzleBoard[r][c] = temp;
      }
    }
  }

  // Phase 2: Remove remaining cells up to targetBlanks without exceeding maxBlanksPerBox
  const allPositions: [number, number][] = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (puzzleBoard[r][c] !== 0) {
        allPositions.push([r, c]);
      }
    }
  }

  const shuffledRemaining = shuffle(allPositions);
  for (const [r, c] of shuffledRemaining) {
    if (removedCount >= targetBlanks) break;

    const box = getBoxIndex(r, c);
    if (boxBlanks[box] >= maxBlanksPerBox) continue;

    const temp = puzzleBoard[r][c];
    puzzleBoard[r][c] = 0;

    const boardCopy = puzzleBoard.map((row) => [...row]);
    if (countSolutions(boardCopy, 2) === 1) {
      boxBlanks[box]++;
      removedCount++;
    } else {
      puzzleBoard[r][c] = temp;
    }
  }

  // Convert 0 to null for client grid
  const puzzle: SudokuGrid = puzzleBoard.map((row) =>
    row.map((val) => (val === 0 ? null : val))
  );

  return {
    puzzle,
    solution,
  };
}
