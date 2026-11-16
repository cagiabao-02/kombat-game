import { supabase } from '@/lib/supabase/client';

export interface TRexStats {
  highScore: number;
  totalJumps: number;
  totalDistance: number;
  totalGames: number;
}

export const T_REX_STATS_KEY = 'kombat_t_rex_stats';

const DEFAULT_STATS: TRexStats = {
  highScore: 0,
  totalJumps: 0,
  totalDistance: 0,
  totalGames: 0,
};

/** Lấy thành tích Khủng Long T-Rex từ localStorage */
export function getTRexStats(): TRexStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(T_REX_STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      highScore: parsed.highScore || 0,
      totalJumps: parsed.totalJumps || 0,
      totalDistance: parsed.totalDistance || 0,
      totalGames: parsed.totalGames || 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

/** Lưu thành tích Khủng Long T-Rex vào localStorage */
export function saveTRexStats(stats: TRexStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(T_REX_STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Lỗi lưu T-Rex stats:', err);
  }
}

/** Ghi nhận kết quả một ván chơi Khủng Long T-Rex */
export function recordTRexGame(
  score: number,
  jumps: number
): { isNewHighScore: boolean; stats: TRexStats } {
  const current = getTRexStats();
  const isNewHighScore = score > current.highScore;

  const nextStats: TRexStats = {
    highScore: Math.max(current.highScore, score),
    totalJumps: current.totalJumps + jumps,
    totalDistance: current.totalDistance + score,
    totalGames: current.totalGames + 1,
  };

  saveTRexStats(nextStats);
  syncTRexCloudAndLeaderboard(nextStats);

  return { isNewHighScore, stats: nextStats };
}

/** Đồng bộ thành tích Khủng Long T-Rex lên đám mây và Bảng xếp hạng */
export async function syncTRexCloudAndLeaderboard(stats: TRexStats): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 1. Cập nhật metadata tài khoản nếu đã đăng nhập
    if (!user.is_anonymous) {
      await supabase.auth.updateUser({
        data: { t_rex_stats: stats },
      });
    }

    // 2. Đồng bộ lên Leaderboard Table (hỗ trợ cả authenticated và anonymous)
    if (stats.highScore > 0) {
      import('@/features/leaderboard/leaderboardService')
        .then((mod) => mod.syncLeaderboardScoreForGame('t_rex_runner'))
        .catch(() => {});
    }
  } catch (err) {
    console.warn('Lỗi sync T-Rex stats:', err);
  }
}
