export type OthelloStone = 'black' | 'white';
export type OthelloCell = OthelloStone | null;
export type OthelloBoardState = OthelloCell[][]; // 8x8

export type OthelloGameMode = 'ai' | 'local' | 'online';
export type OthelloDifficulty = 'easy' | 'medium' | 'hard';
export type OthelloWinner = OthelloStone | 'draw' | null;

export interface OthelloCoord {
  row: number;
  col: number;
}

export interface OthelloMoveResult {
  nextBoard: OthelloBoardState;
  flipped: OthelloCoord[];
}

export interface OthelloCounts {
  black: number;
  white: number;
  empty: number;
}

export interface OthelloGameState {
  board: OthelloBoardState;
  currentTurn: OthelloStone;
  counts: OthelloCounts;
  validMoves: OthelloCoord[];
  lastMove: OthelloCoord | null;
  lastFlipped: OthelloCoord[];
  passedLastTurn: boolean;
  isGameOver: boolean;
  winner: OthelloWinner;
  resignedBy: OthelloStone | null;
  mode: OthelloGameMode;
  aiDifficulty: OthelloDifficulty;
  playerColor: OthelloStone;
  moveCount: number;
  hostAvatar?: string;
  guestAvatar?: string;
  rematchRequest?: {
    fromId: string;
    fromName: string;
  };
}

export interface OthelloRoom {
  id: string;
  code: string;
  game_id: string;
  status: 'waiting' | 'in_progress' | 'completed' | 'abandoned';
  host_id: string;
  guest_id: string | null;
  host_name: string;
  guest_name: string | null;
  game_state: OthelloGameState;
  created_at: string;
  updated_at: string;
}
