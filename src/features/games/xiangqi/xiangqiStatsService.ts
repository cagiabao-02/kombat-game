import { supabase } from '@/lib/supabase/client';

export interface ModeStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface XiangqiStats {
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

const STORAGE_KEY = 'kombat_xiangqi_stats';

const DEFAULT_STATS: XiangqiStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
  pvp: { total: 0, wins: 0, losses: 0, draws: 0 },
  bot: { total: 0, wins: 0, losses: 0, draws: 0 },
};

export function getXiangqiStats(): XiangqiStats {
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

export function saveXiangqiStatsLocally(stats: XiangqiStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save xiangqi stats to localStorage:', e);
  }
}

export async function syncXiangqiStatsToCloud(stats: XiangqiStats): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: { xiangqi_stats: stats },
      });
    }
  } catch (err) {
    console.error('Failed to sync xiangqi stats to cloud:', err);
  }
}

export function recordXiangqiGameResult(
  result: 'win' | 'loss' | 'draw',
  isBot: boolean
): XiangqiStats {
  const current = getXiangqiStats();

  const newTotalGames = current.totalGames + 1;
  const newWins = current.wins + (result === 'win' ? 1 : 0);
  const newLosses = current.losses + (result === 'loss' ? 1 : 0);
  const newDraws = current.draws + (result === 'draw' ? 1 : 0);

  let newCurrentStreak = current.currentStreak;
  if (result === 'win') {
    newCurrentStreak += 1;
  } else if (result === 'loss') {
    newCurrentStreak = 0;
  }
  const newBestStreak = Math.max(current.bestStreak, newCurrentStreak);

  const targetCategory = isBot ? 'bot' : 'pvp';
  const categoryStats = {
    total: current[targetCategory].total + 1,
    wins: current[targetCategory].wins + (result === 'win' ? 1 : 0),
    losses: current[targetCategory].losses + (result === 'loss' ? 1 : 0),
    draws: current[targetCategory].draws + (result === 'draw' ? 1 : 0),
  };

  const updatedStats: XiangqiStats = {
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

  saveXiangqiStatsLocally(updatedStats);
  syncXiangqiStatsToCloud(updatedStats).catch(() => {});
  import('@/features/leaderboard/leaderboardService')
    .then((mod) => mod.syncLeaderboardScoreForGame('xiangqi'))
    .catch(() => {});

  return updatedStats;
}

