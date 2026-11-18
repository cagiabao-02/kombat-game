import { supabase } from '@/lib/supabase/client';

export interface BlockBlastStats {
  highScore: number;
  totalLinesCleared: number;
  maxCombo: number;
  totalGames: number;
  lastUpdated: number;
}

export const BLOCK_BLAST_STATS_KEY = 'kombat_block_blast_stats_v1';

const DEFAULT_STATS: BlockBlastStats = {
  highScore: 0,
  totalLinesCleared: 0,
  maxCombo: 0,
  totalGames: 0,
  lastUpdated: 0,
};

export function getBlockBlastStats(): BlockBlastStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(BLOCK_BLAST_STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      highScore: Number(parsed.highScore) || 0,
      totalLinesCleared: Number(parsed.totalLinesCleared) || 0,
      maxCombo: Number(parsed.maxCombo) || 0,
      totalGames: Number(parsed.totalGames) || 0,
      lastUpdated: Number(parsed.lastUpdated) || 0,
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveBlockBlastStats(stats: BlockBlastStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BLOCK_BLAST_STATS_KEY, JSON.stringify(stats));
  } catch {}
}

/**
 * Ghi nhận kết quả sau mỗi ván chơi khi Game Over
 */
export function recordBlockBlastFinish(
  score: number,
  linesCleared: number,
  maxCombo: number
): { isNewHighScore: boolean; stats: BlockBlastStats } {
  const current = getBlockBlastStats();
  const isNewHighScore = score > current.highScore;

  const nextStats: BlockBlastStats = {
    highScore: Math.max(current.highScore, score),
    totalLinesCleared: current.totalLinesCleared + linesCleared,
    maxCombo: Math.max(current.maxCombo, maxCombo),
    totalGames: current.totalGames + 1,
    lastUpdated: Date.now(),
  };

  saveBlockBlastStats(nextStats);

  // Mở khóa huy hiệu thành tựu nếu có
  try {
    import('@/features/achievements/achievementService')
      .then((m) => m.checkLocalAchievements())
      .catch(() => {});
  } catch {}

  // Đồng bộ đám mây và bảng xếp hạng
  syncBlockBlastCloudAndLeaderboard(nextStats);

  return {
    isNewHighScore,
    stats: nextStats,
  };
}

/**
 * Đồng bộ thành tích Block Blast lên tài khoản đám mây và bảng xếp hạng
 */
export async function syncBlockBlastCloudAndLeaderboard(stats: BlockBlastStats): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Đồng bộ lên User Metadata nếu là tài khoản chính
    const isCloudAccount = !user.is_anonymous && user.app_metadata?.provider !== 'anonymous';
    if (isCloudAccount) {
      await supabase.auth.updateUser({
        data: { block_blast_stats: stats },
      });
    }

    // 2. Đồng bộ lên Bảng xếp hạng nếu có điểm cao
    if (stats.highScore > 0) {
      import('@/features/leaderboard/leaderboardService')
        .then((m) => m.syncLeaderboardScoreForGame('block_blast'))
        .catch(() => {});
    }
  } catch (err) {
    console.error('Lỗi đồng bộ Block Blast stats lên Supabase:', err);
  }
}
