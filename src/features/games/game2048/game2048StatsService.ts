import { supabase } from '@/lib/supabase/client';

export interface Game2048Stats {
  highScore: number;
  maxTile: number;
  totalGames: number;
  lastUpdated: number;
}

export const GAME2048_STATS_KEY = 'kombat_2048_stats';

const DEFAULT_STATS: Game2048Stats = {
  highScore: 0,
  maxTile: 0,
  totalGames: 0,
  lastUpdated: 0,
};

export function getGame2048Stats(): Game2048Stats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(GAME2048_STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      highScore: Number(parsed.highScore) || 0,
      maxTile: Number(parsed.maxTile) || 0,
      totalGames: Number(parsed.totalGames) || 0,
      lastUpdated: Number(parsed.lastUpdated) || 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveGame2048Stats(stats: Game2048Stats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(GAME2048_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

/**
 * Ghi nhận kết quả sau mỗi ván chơi (thắng hoặc thua):
 * - Cập nhật số ván đã chơi
 * - Cập nhật điểm cao nhất (High Score)
 * - Cập nhật ô số lớn nhất (Max Tile)
 * - Tự động đồng bộ lên Supabase leaderboard & cloud account
 */
export function recordGame2048Finish(
  score: number,
  maxTile: number
): { isNewHighScore: boolean; isNewMaxTile: boolean; stats: Game2048Stats } {
  const current = getGame2048Stats();
  const isNewHighScore = score > current.highScore;
  const isNewMaxTile = maxTile > current.maxTile;

  const nextStats: Game2048Stats = {
    highScore: Math.max(current.highScore, score),
    maxTile: Math.max(current.maxTile, maxTile),
    totalGames: current.totalGames + 1,
    lastUpdated: Date.now(),
  };

  saveGame2048Stats(nextStats);

  // Background sync
  syncGame2048CloudAndLeaderboard(nextStats);

  return {
    isNewHighScore,
    isNewMaxTile,
    stats: nextStats,
  };
}

/**
 * Đồng bộ thành tích 2048 lên tài khoản đám mây và bảng xếp hạng
 */
export async function syncGame2048CloudAndLeaderboard(stats: Game2048Stats): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Đồng bộ lên User Metadata nếu là tài khoản chính (Google/Email)
    const isCloudAccount = !user.is_anonymous && user.app_metadata?.provider !== 'anonymous';
    if (isCloudAccount) {
      await supabase.auth.updateUser({
        data: { game2048_stats: stats },
      });
    }

    // 2. Đồng bộ lên Leaderboard Table (hỗ trợ cả authenticated và anon)
    if (stats.highScore > 0) {
      const name = user.user_metadata?.display_name || 'Người chơi';
      const avatar = user.user_metadata?.avatar || '👑';

      await supabase.from('leaderboard_scores').upsert(
        {
          user_id: user.id,
          user_name: name,
          user_avatar: avatar,
          game_id: 'game2048',
          score_value: stats.highScore,
          score_label: `${stats.highScore.toLocaleString()} Điểm`,
          secondary_info: `Ô cao nhất: ${stats.maxTile} • ${stats.totalGames} ván`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,game_id' }
      );
    }
  } catch (err) {
    console.warn('Lỗi sync 2048 stats:', err);
  }
}
