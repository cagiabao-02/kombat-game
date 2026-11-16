export type LeaderboardGame = 'chess' | 'caro' | 'sudoku' | 'xiangqi' | 'snake' | 'game2048' | 'minesweeper' | 'brick_breaker';
export type LeaderboardDifficulty = 'easy' | 'medium' | 'hard';
export type LeaderboardTimeframe = 'all' | 'weekly';

export interface LeaderboardEntry {
  id: string;
  userId?: string;
  name: string;
  avatar: string;
  rank: number;
  scoreValue: number;
  scoreLabel: string;
  secondaryInfo?: string;
  isCurrentUser?: boolean;
  tierBadge?: string;
}

export interface UserRankSummary {
  rank: number;
  scoreValue: number;
  scoreLabel: string;
  aheadDiff?: string;
}

