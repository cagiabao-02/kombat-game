import { MinesweeperDifficulty } from './minesweeperLogic';
import { supabase } from '@/lib/supabase/client';

export interface DifficultyStats {
  bestTimeSeconds: number | null;
  completed: number;
}

export interface MinesweeperStats {
  totalGames: number;
  totalWins: number;
  beginner: DifficultyStats;
  intermediate: DifficultyStats;
  expert: DifficultyStats;
}

export const MINESWEEPER_STATS_KEY = 'kombat_minesweeper_stats';

const DEFAULT_STATS: MinesweeperStats = {
  totalGames: 0,
  totalWins: 0,
  beginner: { bestTimeSeconds: null, completed: 0 },
  intermediate: { bestTimeSeconds: null, completed: 0 },
  expert: { bestTimeSeconds: null, completed: 0 },
};

/** Lấy thành tích Dò Mìn từ localStorage */
export function getMinesweeperStats(): MinesweeperStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(MINESWEEPER_STATS_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      totalGames: parsed.totalGames || 0,
      totalWins: parsed.totalWins || 0,
      beginner: {
        bestTimeSeconds: parsed.beginner?.bestTimeSeconds ?? null,
        completed: parsed.beginner?.completed || 0,
      },
      intermediate: {
        bestTimeSeconds: parsed.intermediate?.bestTimeSeconds ?? null,
        completed: parsed.intermediate?.completed || 0,
      },
      expert: {
        bestTimeSeconds: parsed.expert?.bestTimeSeconds ?? null,
        completed: parsed.expert?.completed || 0,
      },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

/** Lưu thành tích Dò Mìn vào localStorage */
export function saveMinesweeperStats(stats: MinesweeperStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(MINESWEEPER_STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Lỗi lưu minesweeper stats:', err);
  }
}

/** Ghi nhận chiến thắng một ván Dò Mìn */
export function recordMinesweeperWin(
  difficulty: MinesweeperDifficulty,
  timeSeconds: number
): { isNewRecord: boolean; prevRecord: number | null; stats: MinesweeperStats } {
  const current = getMinesweeperStats();
  const diffStats = current[difficulty];
  const prevRecord = diffStats.bestTimeSeconds;

  const isNewRecord = prevRecord === null || timeSeconds < prevRecord;
  const bestTime = isNewRecord ? timeSeconds : prevRecord;

  const nextStats: MinesweeperStats = {
    ...current,
    totalGames: current.totalGames + 1,
    totalWins: current.totalWins + 1,
    [difficulty]: {
      bestTimeSeconds: bestTime,
      completed: diffStats.completed + 1,
    },
  };

  saveMinesweeperStats(nextStats);
  syncMinesweeperCloudAndLeaderboard(nextStats);

  // Tự động kiểm tra và mở khóa huy hiệu thành tựu
  try {
    import('@/features/achievements/achievementService').then((m) => m.checkLocalAchievements()).catch(() => {});
  } catch {}

  return { isNewRecord, prevRecord, stats: nextStats };
}

/** Ghi nhận một ván Dò Mìn kết thúc (thua cuộc) */
export function recordMinesweeperLoss(): MinesweeperStats {
  const current = getMinesweeperStats();
  const nextStats: MinesweeperStats = {
    ...current,
    totalGames: current.totalGames + 1,
  };
  saveMinesweeperStats(nextStats);
  syncMinesweeperCloudAndLeaderboard(nextStats);
  return nextStats;
}

/** Đồng bộ thành tích Dò Mìn lên đám mây và Bảng xếp hạng */
export async function syncMinesweeperCloudAndLeaderboard(stats: MinesweeperStats): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    // 1. Cập nhật metadata tài khoản nếu đã đăng nhập
    if (!user.is_anonymous) {
      await supabase.auth.updateUser({
        data: { minesweeper_stats: stats },
      });
    }

    // 2. Đồng bộ lên Leaderboard Table (hỗ trợ cả authenticated và anonymous)
    // Chỉ đồng bộ khi người chơi đã thắng ít nhất 1 ván
    if (stats.totalWins > 0) {
      import('@/features/leaderboard/leaderboardService')
        .then((mod) => mod.syncLeaderboardScoreForGame('minesweeper'))
        .catch(() => {});
    }
  } catch (err) {
    console.warn('Lỗi sync minesweeper stats:', err);
  }
}
