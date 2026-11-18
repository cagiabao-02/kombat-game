import { supabase } from '@/lib/supabase/client';

export interface ModeStats {
  total: number;
  wins: number;
  losses: number;
}

export interface GoStats {
  totalGames: number;
  wins: number;
  losses: number;
  currentStreak: number;
  bestStreak: number;
  bot: ModeStats;
  passAndPlay: ModeStats;
  pvp?: ModeStats;
  totalCaptures: number;
  lastUpdated?: number;
}

const STORAGE_KEY = 'kombat_go_stats';

const DEFAULT_STATS: GoStats = {
  totalGames: 0,
  wins: 0,
  losses: 0,
  currentStreak: 0,
  bestStreak: 0,
  bot: { total: 0, wins: 0, losses: 0 },
  passAndPlay: { total: 0, wins: 0, losses: 0 },
  pvp: { total: 0, wins: 0, losses: 0 },
  totalCaptures: 0,
};

export function getGoStats(): GoStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      bot: { ...DEFAULT_STATS.bot, ...(parsed.bot || {}) },
      passAndPlay: { ...DEFAULT_STATS.passAndPlay, ...(parsed.passAndPlay || {}) },
      pvp: { ...(DEFAULT_STATS.pvp || { total: 0, wins: 0, losses: 0 }), ...(parsed.pvp || {}) },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveGoStatsLocally(stats: GoStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {}
}

export async function recordGoGameResult(
  mode: 'ai' | 'pass_and_play' | 'online',
  result: 'win' | 'loss',
  captures: number
): Promise<GoStats> {
  const current = getGoStats();
  const isWin = result === 'win';

  const newStats: GoStats = {
    ...current,
    totalGames: current.totalGames + 1,
    wins: isWin ? current.wins + 1 : current.wins,
    losses: !isWin ? current.losses + 1 : current.losses,
    currentStreak: isWin ? current.currentStreak + 1 : 0,
    bestStreak: isWin
      ? Math.max(current.bestStreak, current.currentStreak + 1)
      : current.bestStreak,
    totalCaptures: current.totalCaptures + captures,
    lastUpdated: Date.now(),
  };

  if (mode === 'ai') {
    newStats.bot = {
      total: current.bot.total + 1,
      wins: isWin ? current.bot.wins + 1 : current.bot.wins,
      losses: !isWin ? current.bot.losses + 1 : current.bot.losses,
    };
  } else if (mode === 'online') {
    const curPvp = current.pvp || { total: 0, wins: 0, losses: 0 };
    newStats.pvp = {
      total: curPvp.total + 1,
      wins: isWin ? curPvp.wins + 1 : curPvp.wins,
      losses: !isWin ? curPvp.losses + 1 : curPvp.losses,
    };
  } else {
    newStats.passAndPlay = {
      total: current.passAndPlay.total + 1,
      wins: isWin ? current.passAndPlay.wins + 1 : current.passAndPlay.wins,
      losses: !isWin ? current.passAndPlay.losses + 1 : current.passAndPlay.losses,
    };
  }

  saveGoStatsLocally(newStats);

  // Sync to Supabase if logged in
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && !user.is_anonymous) {
      await supabase.from('user_profiles').upsert(
        {
          id: user.id,
          go_stats: newStats,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    }
  } catch {}

  return newStats;
}
