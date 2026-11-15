import { supabase } from '@/lib/supabase/client';

export interface BrickBreakerStats {
  highScore: number;
  highestLevel: number;
  totalBricksBroken: number;
  totalGames: number;
}

export const BRICK_BREAKER_STATS_KEY = 'kombat_brick_breaker_stats';

const DEFAULT_STATS: BrickBreakerStats = {
  highScore: 0,
  highestLevel: 1,
  totalBricksBroken: 0,
  totalGames: 0,
};

/** Lấy thành tích Phá Gạch từ localStorage */
export function getBrickBreakerStats(): BrickBreakerStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(BRICK_BREAKER_STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      highScore: parsed.highScore || 0,
      highestLevel: parsed.highestLevel || 1,
      totalBricksBroken: parsed.totalBricksBroken || 0,
      totalGames: parsed.totalGames || 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

/** Lưu thành tích Phá Gạch vào localStorage */
export function saveBrickBreakerStats(stats: BrickBreakerStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BRICK_BREAKER_STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Lỗi lưu brick breaker stats:', err);
  }
}

/** Ghi nhận kết quả một ván chơi Phá Gạch */
export function recordBrickBreakerGame(
  score: number,
  level: number,
  bricksBroken: number
): { isNewHighScore: boolean; isNewHighestLevel: boolean; stats: BrickBreakerStats } {
  const current = getBrickBreakerStats();
  const isNewHighScore = score > current.highScore;
  const isNewHighestLevel = level > current.highestLevel;

  const nextStats: BrickBreakerStats = {
    highScore: Math.max(current.highScore, score),
    highestLevel: Math.max(current.highestLevel, level),
    totalBricksBroken: current.totalBricksBroken + bricksBroken,
    totalGames: current.totalGames + 1,
  };

  saveBrickBreakerStats(nextStats);
  syncBrickBreakerCloudAndLeaderboard(nextStats);

  return { isNewHighScore, isNewHighestLevel, stats: nextStats };
}

/** Đồng bộ thành tích Phá Gạch lên đám mây và Bảng xếp hạng */
export async function syncBrickBreakerCloudAndLeaderboard(stats: BrickBreakerStats): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 1. Cập nhật metadata tài khoản nếu đã đăng nhập
    if (!user.is_anonymous) {
      await supabase.auth.updateUser({
        data: { brick_breaker_stats: stats },
      });
    }

    // 2. Đồng bộ lên Leaderboard Table (hỗ trợ cả authenticated và anonymous)
    if (stats.highScore > 0) {
      import('@/features/leaderboard/leaderboardService')
        .then((mod) => mod.syncLeaderboardScoreForGame('brick_breaker'))
        .catch(() => {});
    }
  } catch (err) {
    console.warn('Lỗi sync brick breaker stats:', err);
  }
}
