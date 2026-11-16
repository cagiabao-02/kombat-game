import { supabase } from '@/lib/supabase/client';

export interface SnakeStats {
  highScore: number;
  totalApples: number;
  totalGames: number;
  lastUpdated?: number;
}

const STORAGE_KEY = 'kombat_snake_stats';

const DEFAULT_STATS: SnakeStats = {
  highScore: 0,
  totalApples: 0,
  totalGames: 0,
};

export function getSnakeStats(): SnakeStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveSnakeStatsLocally(stats: SnakeStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save snake stats to localStorage:', e);
  }
}

export async function syncSnakeStatsToCloud(stats: SnakeStats): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: { snake_stats: stats },
      });
    }
  } catch (err) {
    console.error('Failed to sync snake stats to cloud:', err);
  }
}

export interface SnakeRecordResult {
  stats: SnakeStats;
  isNewHighScore: boolean;
  prevHighScore: number;
}

export function recordSnakeGameResult(
  score: number,
  apples: number
): SnakeRecordResult {
  const current = getSnakeStats();
  const prevHighScore = current.highScore;
  const isNewHighScore = score > prevHighScore;
  const newHighScore = Math.max(prevHighScore, score);

  const updatedStats: SnakeStats = {
    highScore: newHighScore,
    totalApples: current.totalApples + apples,
    totalGames: current.totalGames + 1,
    lastUpdated: Date.now(),
  };

  saveSnakeStatsLocally(updatedStats);
  syncSnakeStatsToCloud(updatedStats).catch(() => {});

  // Tự động kiểm tra và mở khóa huy hiệu thành tựu
  try {
    import('@/features/achievements/achievementService').then((m) => m.checkLocalAchievements()).catch(() => {});
  } catch {}

  // Tự động đẩy kỷ lục lên bảng xếp hạng Supabase
  import('@/features/leaderboard/leaderboardService')
    .then((mod) => mod.syncLeaderboardScoreForGame('snake' as any))
    .catch(() => {});

  return {
    stats: updatedStats,
    isNewHighScore,
    prevHighScore,
  };
}
