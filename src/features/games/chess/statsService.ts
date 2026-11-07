export interface ModeStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface ChessStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  pvp: ModeStats;
  bot: ModeStats;
  lastUpdated?: number;
}

const STORAGE_KEY = 'kombat_chess_stats';

const DEFAULT_STATS: ChessStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
  pvp: { total: 0, wins: 0, losses: 0, draws: 0 },
  bot: { total: 0, wins: 0, losses: 0, draws: 0 },
};

export function getChessStats(): ChessStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      pvp: { ...DEFAULT_STATS.pvp, ...(parsed.pvp || {}) },
      bot: { ...DEFAULT_STATS.bot, ...(parsed.bot || {}) },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function recordChessGameResult(
  result: 'win' | 'loss' | 'draw',
  isBot: boolean
): ChessStats {
  const current = getChessStats();

  const newTotalGames = current.totalGames + 1;
  const newWins = current.wins + (result === 'win' ? 1 : 0);
  const newLosses = current.losses + (result === 'loss' ? 1 : 0);
  const newDraws = current.draws + (result === 'draw' ? 1 : 0);

  // Streak logic
  let newCurrentStreak = current.currentStreak;
  if (result === 'win') {
    newCurrentStreak += 1;
  } else if (result === 'loss') {
    newCurrentStreak = 0;
  }
  const newBestStreak = Math.max(current.bestStreak, newCurrentStreak);

  // Sub-category stats
  const targetCategory = isBot ? 'bot' : 'pvp';
  const categoryStats = {
    total: current[targetCategory].total + 1,
    wins: current[targetCategory].wins + (result === 'win' ? 1 : 0),
    losses: current[targetCategory].losses + (result === 'loss' ? 1 : 0),
    draws: current[targetCategory].draws + (result === 'draw' ? 1 : 0),
  };

  const updatedStats: ChessStats = {
    ...current,
    totalGames: newTotalGames,
    wins: newWins,
    losses: newLosses,
    draws: newDraws,
    currentStreak: newCurrentStreak,
    bestStreak: newBestStreak,
    [targetCategory]: categoryStats,
    lastUpdated: Date.now(),
  };

  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedStats));
    } catch (e) {
      console.error('Failed to save chess stats to localStorage:', e);
    }
  }

  return updatedStats;
}

export function resetChessStats(): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
  }
}

export function calculateWinrate(wins: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((wins / total) * 100);
}

