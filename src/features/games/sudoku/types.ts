export type SudokuDifficulty = 'easy' | 'medium' | 'hard';

export type SudokuGrid = (number | null)[][];

export interface CellPosition {
  row: number;
  col: number;
}

export interface SudokuMove {
  row: number;
  col: number;
  prevValue: number | null;
  newValue: number | null;
}

export interface SavedSudokuGame {
  difficulty: SudokuDifficulty;
  initialBoard: SudokuGrid;
  currentBoard: SudokuGrid;
  solution: number[][];
  elapsedSeconds: number;
  mistakes: number;
  isCompleted: boolean;
  isGameOver?: boolean;
  moveHistory: SudokuMove[];
}

