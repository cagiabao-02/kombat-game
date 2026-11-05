export type GameId = 'sudoku' | 'chess';

export type GameStatus = 'available' | 'beta' | 'coming_soon';

export type GameMode = 'single_player' | 'multiplayer_room' | 'matchmaking';

export interface LocalizedString {
  vi: string;
  en: string;
}

export interface GameMetadata {
  id: GameId;
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

