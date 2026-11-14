import { Board, Move, Side } from './xiangqiLogic';
import { XiangqiBotDifficulty } from './XiangqiLobbyView';

export type XiangqiGameMode = 'local' | 'bot' | 'pvp';
export type RoomStatus = 'waiting' | 'in_progress' | 'completed' | 'abandoned';

export interface XiangqiGameState {
  board: Board;
  turn: Side;
  moveHistory: Move[];
  isCheck: boolean;
  isCheckmate: boolean;
  isStalemate: boolean;
  winner: Side | null;
  gameMode: XiangqiGameMode;
  botDifficulty?: XiangqiBotDifficulty;
  botSide?: Side;
  hostAvatar?: string;
  guestAvatar?: string;
  isResigned?: boolean;
}

export interface XiangqiRoom {
  id: string;
  code: string;
  game_id: string;
  status: RoomStatus;
  host_id: string;
  guest_id: string | null;
  host_name: string;
  guest_name: string | null;
  game_state: XiangqiGameState;
  created_at: string;
  updated_at: string;
  is_bot_game?: boolean;
  bot_difficulty?: XiangqiBotDifficulty;
}

