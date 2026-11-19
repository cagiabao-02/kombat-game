export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type TetrisCell = TetrominoType | null;
export type TetrisBoard = TetrisCell[][];

export interface ActivePiece {
  type: TetrominoType;
  matrix: number[][];
  row: number;
  col: number;
}

export interface TetrisSavedState {
  board: TetrisBoard;
  currentPiece: ActivePiece;
  holdPiece: TetrominoType | null;
  canHold: boolean;
  nextQueue: TetrominoType[];
  bag: TetrominoType[];
  score: number;
  level: number;
  lines: number;
  combo: number;
  tetrises: number;
  isGameOver: boolean;
}
