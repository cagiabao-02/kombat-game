import { supabase } from '@/lib/supabase/client';

export interface TetrisStats {
  highScore: number;
  bestLevel: number;
  totalLines: number;
  totalTetrises: number;
  totalGames: number;
  lastUpdated: number;
}

export const TETRIS_STATS_KEY = 'kombat_tetris_stats_v1';

const DEFAULT_STATS: TetrisStats = {
  highScore: 0,
  bestLevel: 1,
  totalLines: 0,
  totalTetrises: 0,
  totalGames: 0,
  lastUpdated: 0,
};

export function getTetrisStats(): TetrisStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(TETRIS_STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      highScore: Number(parsed.highScore) || 0,
      bestLevel: Number(parsed.bestLevel) || 1,
      totalLines: Number(parsed.totalLines) || 0,
      totalTetrises: Number(parsed.totalTetrises) || 0,
      totalGames: Number(parsed.totalGames) || 0,
      lastUpdated: Number(parsed.lastUpdated) || 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveTetrisStatsLocally(stats: TetrisStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TETRIS_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

export function recordTetrisGameFinish(
  score: number,
  level: number,
  linesCleared: number,
  tetrises: number
): { isNewHighScore: boolean; stats: TetrisStats } {
  const current = getTetrisStats();
  const isNewHighScore = score > current.highScore;

  const nextStats: TetrisStats = {
    highScore: Math.max(current.highScore, score),
    bestLevel: Math.max(current.bestLevel, level),
    totalLines: current.totalLines + linesCleared,
    totalTetrises: current.totalTetrises + tetrises,
    totalGames: current.totalGames + 1,
    lastUpdated: Date.now(),
  };

  saveTetrisStatsLocally(nextStats);

  // Sync to Supabase user_metadata + leaderboard_scores if logged in
  syncTetrisToCloud(nextStats, score).catch(() => {});

  return { isNewHighScore, stats: nextStats };
}

async function syncTetrisToCloud(
  stats: TetrisStats,
  latestScore: number
): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.is_anonymous) return;

    await supabase.auth.updateUser({
      data: {
        tetris_stats: stats,
      },
    });

    if (latestScore > 0) {
      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'Player';
      const avatar = user.user_metadata?.avatar || '🧱';

      await supabase.from('leaderboard_scores').upsert(
        {
          user_id: user.id,
          game_id: 'tetris',
          player_name: displayName,
          avatar,
          score_value: stats.highScore,
          updated_at: new Date().toISOString(),
        } as any,
        { onConflict: 'user_id,game_id' }
      );
    }
  } catch {}
}
