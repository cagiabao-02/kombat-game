import { GameId } from '@/types/game';
import { CaroMove } from '@/features/games/caro/types';
import { Move as XiangqiMove } from '@/features/games/xiangqi/xiangqiLogic';
import { BoardSize, GoColor, Point } from '@/features/games/go/types';

/** Giới hạn số lượng ván đấu lưu trữ để tối ưu hóa bộ nhớ và dữ liệu đám mây */
export const MAX_MATCH_HISTORY = 20;

export type BoardGameId = 'chess' | 'caro' | 'xiangqi' | 'go';

export type MatchResult = 'win' | 'loss' | 'draw';

export type MatchGameMode = 'bot' | 'pvp' | 'local';

export interface BaseMatchRecord {
  id: string;
  gameId: BoardGameId;
  mode: MatchGameMode;
  playedAt: string; // ISO date string
  result: MatchResult;
  opponentName: string;
  opponentAvatar?: string;
  totalMoves: number;
  durationSeconds?: number;
  reason?: string; // Ví dụ: "Chiếu bí", "5 quân liên tiếp", "Đầu hàng", "Tính điểm đất", "Đối thủ rời phòng"
}

export interface ChessMatchRecord extends BaseMatchRecord {
  gameId: 'chess';
  playerColor: 'w' | 'b';
  moves: string[]; // Danh sách nước đi dạng SAN (vd: ["e4", "e5", "Nf3", "Nc6", ...])
}

export interface CaroMatchRecord extends BaseMatchRecord {
  gameId: 'caro';
  playerPiece: 'X' | 'O';
  moves: CaroMove[]; // Danh sách nước đi cờ Caro
}

export interface XiangqiMatchRecord extends BaseMatchRecord {
  gameId: 'xiangqi';
  playerColor: 'red' | 'black';
  moves: XiangqiMove[]; // Danh sách nước đi cờ Tướng
}

export interface GoMoveRecord {
  turn: GoColor;
  point: Point | null; // null nếu Pass (Bỏ lượt)
  capturesCount?: number;
}

export interface GoMatchRecord extends BaseMatchRecord {
  gameId: 'go';
  boardSize: BoardSize;
  playerColor: GoColor;
  moves: GoMoveRecord[]; // Danh sách nước đi cờ Vây
  score?: {
    blackTotal: number;
    whiteTotal: number;
    margin: number;
  } | null;
}

export type MatchRecord =
  | ChessMatchRecord
  | CaroMatchRecord
  | XiangqiMatchRecord
  | GoMatchRecord;

export type CreateMatchRecord =
  | Omit<ChessMatchRecord, 'id' | 'playedAt'>
  | Omit<CaroMatchRecord, 'id' | 'playedAt'>
  | Omit<XiangqiMatchRecord, 'id' | 'playedAt'>
  | Omit<GoMatchRecord, 'id' | 'playedAt'>;
