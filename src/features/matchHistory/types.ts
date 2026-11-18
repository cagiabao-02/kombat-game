import { GameId } from '@/types/game';
import { CaroMove } from '@/features/games/caro/types';
import { Move as XiangqiMove } from '@/features/games/xiangqi/xiangqiLogic';

/** Giới hạn số lượng ván đấu lưu trữ để tối ưu hóa bộ nhớ và dữ liệu đám mây */
export const MAX_MATCH_HISTORY = 20;

export type BoardGameId = 'chess' | 'caro' | 'xiangqi';

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
  reason?: string; // Ví dụ: "Chiếu bí", "5 quân liên tiếp", "Đầu hàng", "Hết giờ"
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

export type MatchRecord = ChessMatchRecord | CaroMatchRecord | XiangqiMatchRecord;

export type CreateMatchRecord =
  | Omit<ChessMatchRecord, 'id' | 'playedAt'>
  | Omit<CaroMatchRecord, 'id' | 'playedAt'>
  | Omit<XiangqiMatchRecord, 'id' | 'playedAt'>;
