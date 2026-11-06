export type PlayerColor = 'white' | 'black';

export type RoomStatus = 'waiting' | 'in_progress' | 'completed' | 'abandoned';

export interface ChessGameState {
  fen: string;
  history: string[];
  turn: 'w' | 'b';
  isCheck: boolean;
  isCheckmate: boolean;
  isDraw: boolean;
  winner: 'white' | 'black' | 'draw' | null;
  lastMove: { from: string; to: string } | null;
}

export interface ChessRoom {
  id: string;
  code: string;
  game_id: string;
  status: RoomStatus;
  host_id: string;
  guest_id: string | null;
  host_name: string;
  guest_name: string | null;
  game_state: ChessGameState;
  created_at: string;
  updated_at: string;
}

