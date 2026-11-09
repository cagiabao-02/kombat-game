export const CARO_BOARD_SIZE = 15;

export type CaroPiece = 'X' | 'O';
export type CaroCell = CaroPiece | null;
export type CaroBoard = CaroCell[][];

export type CaroBotDifficulty = 'easy' | 'medium' | 'hard';
export type CaroGameMode = 'bot' | 'local' | 'pvp';
export type RoomStatus = 'waiting' | 'in_progress' | 'completed' | 'abandoned';

export interface CaroMove {
  row: number;
  col: number;
  player: CaroPiece;
  timestamp?: number;
}

export interface CaroWinResult {
  winner: CaroPiece;
  winningLine: { row: number; col: number }[];
}

export interface CaroGameState {
  board: CaroBoard;
  turn: CaroPiece;
  history: CaroMove[];
  winner: CaroPiece | 'draw' | null;
  winningLine: { row: number; col: number }[] | null;
  isGameOver: boolean;
  gameMode: CaroGameMode;
  botDifficulty?: CaroBotDifficulty;
  botPlayer?: CaroPiece;
  lastMove: { row: number; col: number } | null;
  hostAvatar?: string;
  guestAvatar?: string;
  isResigned?: boolean;
}

export interface CaroRoom {
  id: string;
  code: string;
  game_id: string;
  status: RoomStatus;
  host_id: string;
  guest_id: string | null;
  host_name: string;
  guest_name: string | null;
  game_state: CaroGameState;
  created_at: string;
  updated_at: string;
  is_bot_game?: boolean;
  bot_difficulty?: CaroBotDifficulty;
}
