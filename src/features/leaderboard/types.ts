export type LeaderboardGame = 'chess' | 'caro' | 'sudoku' | 'xiangqi' | 'go' | 'snake' | 'game2048' | 'minesweeper' | 'brick_breaker' | 't_rex_runner' | 'flappy_bird' | 'block_blast' | 'tetris';
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

