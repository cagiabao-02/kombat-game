import { supabase } from '@/lib/supabase/client';

export interface FlappyStats {
  highScore: number;
  totalFlaps: number;
  pipesPassed: number;
  totalGames: number;
}

export const FLAPPY_STATS_KEY = 'kombat_flappy_stats';

const DEFAULT_STATS: FlappyStats = {
  highScore: 0,
  totalFlaps: 0,
  pipesPassed: 0,
  totalGames: 0,
};

/** Lấy thành tích Flappy Bird từ localStorage */
export function getFlappyStats(): FlappyStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(FLAPPY_STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      highScore: parsed.highScore || 0,
      totalFlaps: parsed.totalFlaps || 0,
      pipesPassed: parsed.pipesPassed || 0,
      totalGames: parsed.totalGames || 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

/** Lưu thành tích Flappy Bird vào localStorage */
export function saveFlappyStats(stats: FlappyStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FLAPPY_STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Lỗi lưu Flappy Bird stats:', err);
  }
}

/** Ghi nhận kết quả một ván chơi Flappy Bird */
export function recordFlappyGame(
  score: number,
  flaps: number
): { isNewHighScore: boolean; stats: FlappyStats } {
  const current = getFlappyStats();
  const isNewHighScore = score > current.highScore;

  const nextStats: FlappyStats = {
    highScore: Math.max(current.highScore, score),
    totalFlaps: current.totalFlaps + flaps,
    pipesPassed: current.pipesPassed + score,
    totalGames: current.totalGames + 1,
  };

  saveFlappyStats(nextStats);
  syncFlappyCloudAndLeaderboard(nextStats);

  return { isNewHighScore, stats: nextStats };
}

/** Đồng bộ thành tích Flappy Bird lên đám mây và Bảng xếp hạng */
export async function syncFlappyCloudAndLeaderboard(stats: FlappyStats): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 1. Cập nhật metadata tài khoản nếu đã đăng nhập
    if (!user.is_anonymous) {
      await supabase.auth.updateUser({
        data: { flappy_stats: stats },
      });
    }

    // 2. Đồng bộ lên Leaderboard Table (hỗ trợ cả authenticated và anonymous)
    if (stats.highScore > 0) {
      import('@/features/leaderboard/leaderboardService')
        .then((mod) => mod.syncLeaderboardScoreForGame('flappy_bird'))
        .catch(() => {});
    }
  } catch (err) {
    console.warn('Lỗi sync Flappy Bird stats:', err);
  }
}
