export type GoColor = 'black' | 'white';
export type BoardCell = GoColor | null;
export type GoBoard = BoardCell[][];
export type BoardSize = 9 | 13 | 19;

export interface Point {
  row: number;
  col: number;
}

export interface StoneGroup {
  color: GoColor;
  stones: Point[];
  liberties: Point[];
}

export interface MoveResult {
  valid: boolean;
  error?: string;
  captures: Point[];
  newBoard: GoBoard;
  newKoPoint: Point | null;
}

export interface TerritoryScore {
  blackTerritory: number;
  whiteTerritory: number;
  blackCaptures: number; // Quân trắng bị Đen bắt
  whiteCaptures: number; // Quân đen bị Trắng bắt
  komi: number; // Mặc định 6.5 điểm chấp cho Trắng
  blackTotal: number;
  whiteTotal: number;
  winner: GoColor;
  margin: number;
}

export type GoGameMode = 'ai' | 'pass_and_play' | 'online';
export type GoAiDifficulty = 'easy' | 'medium';
export type RoomStatus = 'waiting' | 'in_progress' | 'completed' | 'abandoned';
export type GoOnlineRole = 'host' | 'guest';

export interface GoGameState {
  boardSize: BoardSize;
  board: GoBoard;
  currentTurn: GoColor;
  captures: {
    black: number; // Số quân Trắng bị Đen bắt
    white: number; // Số quân Đen bị Trắng bắt
  };
  koPoint: Point | null; // Điểm cấm đánh do luật Kiếp (Ko)
  consecutivePasses: number; // Đếm số lần bỏ lượt liên tiếp (2 lần = kết thúc)
  isGameOver: boolean;
  winner: GoColor | null;
  resignedBy?: GoColor | null;
  score: TerritoryScore | null;
  mode: GoGameMode;
  aiDifficulty: GoAiDifficulty;
  playerColor: GoColor;
  lastMove: Point | null;
  moveHistory: Array<{
    turn: GoColor;
    point: Point | null; // null nếu Pass
    capturesCount: number;
  }>;
}

export interface GoRoom {
  id: string;
  code: string;
  game_id: string;
  status: RoomStatus;
  host_id: string;
  guest_id: string | null;
  host_name: string;
  guest_name: string | null;
  game_state: GoGameState & {
    hostAvatar?: string;
    guestAvatar?: string;
  };
  created_at: string;
  updated_at: string;
}
