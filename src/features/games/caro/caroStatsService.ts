import { supabase } from '@/lib/supabase/client';

export interface ModeStats {
  total: number;
  wins: number;
  losses: number;
  draws: number;
}

export interface CaroStats {
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

const STORAGE_KEY = 'kombat_caro_stats';

const DEFAULT_STATS: CaroStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  currentStreak: 0,
  bestStreak: 0,
  pvp: { total: 0, wins: 0, losses: 0, draws: 0 },
  bot: { total: 0, wins: 0, losses: 0, draws: 0 },
};

export function getCaroStats(): CaroStats {
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

export function saveCaroStatsLocally(stats: CaroStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save caro stats to localStorage:', e);
  }
}

export async function syncCaroStatsToCloud(stats: CaroStats): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: { caro_stats: stats },
      });
    }
  } catch (err) {
    console.error('Failed to sync caro stats to cloud:', err);
  }
}

export function recordCaroGameResult(
  result: 'win' | 'loss' | 'draw',
  isBot: boolean
): CaroStats {
  const current = getCaroStats();

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

  const updatedStats: CaroStats = {
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

  saveCaroStatsLocally(updatedStats);
  syncCaroStatsToCloud(updatedStats).catch(() => {});

  return updatedStats;
}

