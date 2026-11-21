export interface OthelloStats {
  wins: number;
  losses: number;
  draws: number;
  botWins: number;
  pvpWins: number;
  bestScore: number; // Số quân tối đa đạt được khi thắng
  currentStreak: number;
  bestStreak: number;
}

const STATS_KEY = 'kombat_othello_stats';

const DEFAULT_STATS: OthelloStats = {
  wins: 0,
  losses: 0,
  draws: 0,
  botWins: 0,
  pvpWins: 0,
  bestScore: 0,
  currentStreak: 0,
  bestStreak: 0,
};

export function getOthelloStats(): OthelloStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    return { ...DEFAULT_STATS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordOthelloMatchResult(
  result: 'win' | 'loss' | 'draw',
  isBotMatch: boolean,
  playerPieceCount: number
): OthelloStats {
  const current = getOthelloStats();
  const next: OthelloStats = { ...current };

  if (result === 'win') {
    next.wins += 1;
    next.currentStreak += 1;
    if (next.currentStreak > next.bestStreak) {
      next.bestStreak = next.currentStreak;
    }
    if (isBotMatch) {
      next.botWins += 1;
    } else {
      next.pvpWins += 1;
    }
    if (playerPieceCount > next.bestScore) {
      next.bestScore = playerPieceCount;
    }
  } else if (result === 'loss') {
    next.losses += 1;
    next.currentStreak = 0;
  } else {
    next.draws += 1;
  }

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(next));
    } catch {}
  }

  return next;
}
