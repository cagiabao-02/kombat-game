export type GameId = 'sudoku' | 'chess' | 'caro' | 'xiangqi' | 'snake' | 'game2048';

export type GameStatus = 'available' | 'beta' | 'coming_soon';

export type GameMode = 'single_player' | 'multiplayer_room' | 'matchmaking';

/** Thể loại game hiển thị tại sảnh. Thêm thể loại mới: bổ sung ở đây và trong `categories.ts`. */
export type GameCategoryId = 'puzzle' | 'strategy' | 'arcade';

export interface LocalizedString {
  vi: string;
  en: string;
}

export interface GameMetadata {
  id: GameId;
  category: GameCategoryId;
  name: LocalizedString;
  shortDescription: LocalizedString;
  description: LocalizedString;
  route: string;
  status: GameStatus;
  modes: GameMode[];
  minPlayers: number;
  maxPlayers: number;
  badge?: LocalizedString;
  thumbnail?: string;
}

