import { ChessStats } from '@/features/games/chess/statsService';
import { CaroStats } from '@/features/games/caro/caroStatsService';
import { XiangqiStats } from '@/features/games/xiangqi/xiangqiStatsService';
import { SudokuStats } from '@/features/games/sudoku/sudokuStatsService';
import { SnakeStats } from '@/features/games/snake/snakeStatsService';
import { Game2048Stats } from '@/features/games/game2048/game2048StatsService';
import { MinesweeperStats } from '@/features/games/minesweeper/minesweeperStatsService';
import { BrickBreakerStats } from '@/features/games/brickBreaker/brickBreakerStatsService';
import { TRexStats } from '@/features/games/dinoRunner/tRexStatsService';
import { FlappyStats } from '@/features/games/flappyBird/flappyStatsService';
import {
  mergeAchievements,
  checkAllEligibleAchievements,
  ACHIEVEMENTS_STORAGE_KEY,
} from '@/features/achievements/achievementService';
import { UnlockedAchievementsMap } from '@/features/achievements/types';

export const STORAGE_KEYS = {
  CHESS: 'kombat_chess_stats',
  CARO: 'kombat_caro_stats',
  XIANGQI: 'kombat_xiangqi_stats',
  SUDOKU: 'kombat_sudoku_stats',
  SNAKE: 'kombat_snake_stats',
  GAME2048: 'kombat_2048_stats',
  MINESWEEPER: 'kombat_minesweeper_stats',
  BRICK_BREAKER: 'kombat_brick_breaker_stats',
  T_REX: 'kombat_t_rex_stats',
  FLAPPY: 'kombat_flappy_stats',
  ACHIEVEMENTS: ACHIEVEMENTS_STORAGE_KEY,
  GUEST_NAME: 'togame_guest_display_name',
  AVATAR: 'kombat_user_avatar',
} as const;

function safeParse<T>(key: string): T | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function safeSet(key: string, data: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function mergeBoardGameStats<T extends ChessStats | CaroStats | XiangqiStats>(
  local: T | null,
  cloud: T | null
): T | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  const mergeMode = (lm: any = {}, cm: any = {}) => ({
    total: Math.max(lm.total || 0, cm.total || 0),
    wins: Math.max(lm.wins || 0, cm.wins || 0),
    losses: Math.max(lm.losses || 0, cm.losses || 0),
    draws: Math.max(lm.draws || 0, cm.draws || 0),
  });

  return {
    ...cloud,
    ...local,
    totalGames: Math.max(local.totalGames || 0, cloud.totalGames || 0),
    wins: Math.max(local.wins || 0, cloud.wins || 0),
    losses: Math.max(local.losses || 0, cloud.losses || 0),
    draws: Math.max(local.draws || 0, cloud.draws || 0),
    currentStreak: Math.max(local.currentStreak || 0, cloud.currentStreak || 0),
    bestStreak: Math.max(local.bestStreak || 0, cloud.bestStreak || 0),
    pvp: mergeMode(local.pvp, cloud.pvp),
    bot: mergeMode(local.bot, cloud.bot),
    lastUpdated: Math.max(local.lastUpdated || 0, cloud.lastUpdated || 0, Date.now()),
  } as T;
}

export function mergeSudokuStats(
  local: SudokuStats | null,
  cloud: SudokuStats | null
): SudokuStats | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  const mergeDiff = (ld: any = {}, cd: any = {}) => {
    let bestTime: number | null = null;
    if (ld.bestTimeSeconds !== null && ld.bestTimeSeconds !== undefined && cd.bestTimeSeconds !== null && cd.bestTimeSeconds !== undefined) {
      bestTime = Math.min(ld.bestTimeSeconds, cd.bestTimeSeconds);
    } else if (ld.bestTimeSeconds !== null && ld.bestTimeSeconds !== undefined) {
      bestTime = ld.bestTimeSeconds;
    } else if (cd.bestTimeSeconds !== null && cd.bestTimeSeconds !== undefined) {
      bestTime = cd.bestTimeSeconds;
    }

    return {
      bestTimeSeconds: bestTime,
      completedCount: Math.max(ld.completedCount || 0, cd.completedCount || 0),
    };
  };

  return {
    totalSolved: Math.max(local.totalSolved || 0, cloud.totalSolved || 0),
    easy: mergeDiff(local.easy, cloud.easy),
    medium: mergeDiff(local.medium, cloud.medium),
    hard: mergeDiff(local.hard, cloud.hard),
    lastUpdated: Math.max(local.lastUpdated || 0, cloud.lastUpdated || 0, Date.now()),
  };
}

export function mergeSnakeStats(
  local: SnakeStats | null,
  cloud: SnakeStats | null
): SnakeStats | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  return {
    highScore: Math.max(local.highScore || 0, cloud.highScore || 0),
    totalApples: Math.max(local.totalApples || 0, cloud.totalApples || 0),
    totalGames: Math.max(local.totalGames || 0, cloud.totalGames || 0),
    lastUpdated: Math.max(local.lastUpdated || 0, cloud.lastUpdated || 0, Date.now()),
  };
}

export function mergeGame2048Stats(
  local: Game2048Stats | null,
  cloud: Game2048Stats | null
): Game2048Stats | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  return {
    highScore: Math.max(local.highScore || 0, cloud.highScore || 0),
    maxTile: Math.max(local.maxTile || 0, cloud.maxTile || 0),
    totalGames: Math.max(local.totalGames || 0, cloud.totalGames || 0),
    lastUpdated: Math.max(local.lastUpdated || 0, cloud.lastUpdated || 0, Date.now()),
  };
}

export function mergeMinesweeperStats(
  local: MinesweeperStats | null,
  cloud: MinesweeperStats | null
): MinesweeperStats | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  const mergeDiff = (ld: any = {}, cd: any = {}) => {
    let bestTime: number | null = null;
    if (ld.bestTimeSeconds !== null && ld.bestTimeSeconds !== undefined && cd.bestTimeSeconds !== null && cd.bestTimeSeconds !== undefined) {
      bestTime = Math.min(ld.bestTimeSeconds, cd.bestTimeSeconds);
    } else if (ld.bestTimeSeconds !== null && ld.bestTimeSeconds !== undefined) {
      bestTime = ld.bestTimeSeconds;
    } else if (cd.bestTimeSeconds !== null && cd.bestTimeSeconds !== undefined) {
      bestTime = cd.bestTimeSeconds;
    }

    return {
      bestTimeSeconds: bestTime,
      completed: Math.max(ld.completed || 0, cd.completed || 0),
    };
  };

  return {
    totalGames: Math.max(local.totalGames || 0, cloud.totalGames || 0),
    totalWins: Math.max(local.totalWins || 0, cloud.totalWins || 0),
    beginner: mergeDiff(local.beginner, cloud.beginner),
    intermediate: mergeDiff(local.intermediate, cloud.intermediate),
    expert: mergeDiff(local.expert, cloud.expert),
  };
}

export function mergeBrickBreakerStats(
  local: BrickBreakerStats | null,
  cloud: BrickBreakerStats | null
): BrickBreakerStats | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  return {
    highScore: Math.max(local.highScore || 0, cloud.highScore || 0),
    highestLevel: Math.max(local.highestLevel || 1, cloud.highestLevel || 1),
    totalBricksBroken: Math.max(local.totalBricksBroken || 0, cloud.totalBricksBroken || 0),
    totalGames: Math.max(local.totalGames || 0, cloud.totalGames || 0),
  };
}

export function mergeTRexStats(
  local: TRexStats | null,
  cloud: TRexStats | null
): TRexStats | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  return {
    highScore: Math.max(local.highScore || 0, cloud.highScore || 0),
    totalJumps: Math.max(local.totalJumps || 0, cloud.totalJumps || 0),
    totalDistance: Math.max(local.totalDistance || 0, cloud.totalDistance || 0),
    totalGames: Math.max(local.totalGames || 0, cloud.totalGames || 0),
  };
}

export function mergeFlappyStats(
  local: FlappyStats | null,
  cloud: FlappyStats | null
): FlappyStats | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  return {
    highScore: Math.max(local.highScore || 0, cloud.highScore || 0),
    totalFlaps: Math.max(local.totalFlaps || 0, cloud.totalFlaps || 0),
    pipesPassed: Math.max(local.pipesPassed || 0, cloud.pipesPassed || 0),
    totalGames: Math.max(local.totalGames || 0, cloud.totalGames || 0),
  };
}

/**
 * Gộp toàn bộ thành tích từ LocalStorage của máy vào tài khoản Đám mây (Google/Email).
 * Được kích hoạt tự động khi người dùng đăng nhập tài khoản.
 */
export async function syncAndMergeAllStatsOnLogin(user: any, sbClient: any) {
  if (!user || user.is_anonymous || user.app_metadata?.provider === 'anonymous') {
    return;
  }

  const meta = user.user_metadata || {};

  // 1. Đọc dữ liệu local
  const localChess = safeParse<ChessStats>(STORAGE_KEYS.CHESS);
  const localCaro = safeParse<CaroStats>(STORAGE_KEYS.CARO);
  const localXiangqi = safeParse<XiangqiStats>(STORAGE_KEYS.XIANGQI);
  const localSudoku = safeParse<SudokuStats>(STORAGE_KEYS.SUDOKU);
  const localSnake = safeParse<SnakeStats>(STORAGE_KEYS.SNAKE);
  const local2048 = safeParse<Game2048Stats>(STORAGE_KEYS.GAME2048);
  const localMinesweeper = safeParse<MinesweeperStats>(STORAGE_KEYS.MINESWEEPER);
  const localBrickBreaker = safeParse<BrickBreakerStats>(STORAGE_KEYS.BRICK_BREAKER);
  const localTRex = safeParse<TRexStats>(STORAGE_KEYS.T_REX);
  const localFlappy = safeParse<FlappyStats>(STORAGE_KEYS.FLAPPY);
  const localAchievements = safeParse<UnlockedAchievementsMap>(STORAGE_KEYS.ACHIEVEMENTS);

  // 2. Gộp thông minh với cloud
  const mergedChess = mergeBoardGameStats(localChess, meta.chess_stats);
  const mergedCaro = mergeBoardGameStats(localCaro, meta.caro_stats);
  const mergedXiangqi = mergeBoardGameStats(localXiangqi, meta.xiangqi_stats);
  const mergedSudoku = mergeSudokuStats(localSudoku, meta.sudoku_stats);
  const mergedSnake = mergeSnakeStats(localSnake, meta.snake_stats);
  const merged2048 = mergeGame2048Stats(local2048, meta.game2048_stats);
  const mergedMinesweeper = mergeMinesweeperStats(localMinesweeper, meta.minesweeper_stats);
  const mergedBrickBreaker = mergeBrickBreakerStats(localBrickBreaker, meta.brick_breaker_stats);
  const mergedTRex = mergeTRexStats(localTRex, meta.t_rex_stats);
  const mergedFlappy = mergeFlappyStats(localFlappy, meta.flappy_stats);
  const mergedAchievements = mergeAchievements(localAchievements, meta.achievements);

  // 3. Lưu lại vào LocalStorage
  if (mergedChess) safeSet(STORAGE_KEYS.CHESS, mergedChess);
  if (mergedCaro) safeSet(STORAGE_KEYS.CARO, mergedCaro);
  if (mergedXiangqi) safeSet(STORAGE_KEYS.XIANGQI, mergedXiangqi);
  if (mergedSudoku) safeSet(STORAGE_KEYS.SUDOKU, mergedSudoku);
  if (mergedSnake) safeSet(STORAGE_KEYS.SNAKE, mergedSnake);
  if (merged2048) safeSet(STORAGE_KEYS.GAME2048, merged2048);
  if (mergedMinesweeper) safeSet(STORAGE_KEYS.MINESWEEPER, mergedMinesweeper);
  if (mergedBrickBreaker) safeSet(STORAGE_KEYS.BRICK_BREAKER, mergedBrickBreaker);
  if (mergedTRex) safeSet(STORAGE_KEYS.T_REX, mergedTRex);
  if (mergedFlappy) safeSet(STORAGE_KEYS.FLAPPY, mergedFlappy);
  if (mergedAchievements) safeSet(STORAGE_KEYS.ACHIEVEMENTS, mergedAchievements);

  // 4. Đẩy bản gộp lên Supabase User Metadata để bảo lưu vĩnh viễn
  const updateData: Record<string, any> = {};
  let hasUpdates = false;

  if (mergedChess && JSON.stringify(mergedChess) !== JSON.stringify(meta.chess_stats)) {
    updateData.chess_stats = mergedChess;
    hasUpdates = true;
  }
  if (mergedCaro && JSON.stringify(mergedCaro) !== JSON.stringify(meta.caro_stats)) {
    updateData.caro_stats = mergedCaro;
    hasUpdates = true;
  }
  if (mergedXiangqi && JSON.stringify(mergedXiangqi) !== JSON.stringify(meta.xiangqi_stats)) {
    updateData.xiangqi_stats = mergedXiangqi;
    hasUpdates = true;
  }
  if (mergedSudoku && JSON.stringify(mergedSudoku) !== JSON.stringify(meta.sudoku_stats)) {
    updateData.sudoku_stats = mergedSudoku;
    hasUpdates = true;
  }
  if (mergedSnake && JSON.stringify(mergedSnake) !== JSON.stringify(meta.snake_stats)) {
    updateData.snake_stats = mergedSnake;
    hasUpdates = true;
  }
  if (merged2048 && JSON.stringify(merged2048) !== JSON.stringify(meta.game2048_stats)) {
    updateData.game2048_stats = merged2048;
    hasUpdates = true;
  }
  if (mergedMinesweeper && JSON.stringify(mergedMinesweeper) !== JSON.stringify(meta.minesweeper_stats)) {
    updateData.minesweeper_stats = mergedMinesweeper;
    hasUpdates = true;
  }
  if (mergedBrickBreaker && JSON.stringify(mergedBrickBreaker) !== JSON.stringify(meta.brick_breaker_stats)) {
    updateData.brick_breaker_stats = mergedBrickBreaker;
    hasUpdates = true;
  }
  if (mergedTRex && JSON.stringify(mergedTRex) !== JSON.stringify(meta.t_rex_stats)) {
    updateData.t_rex_stats = mergedTRex;
    hasUpdates = true;
  }
  if (mergedFlappy && JSON.stringify(mergedFlappy) !== JSON.stringify(meta.flappy_stats)) {
    updateData.flappy_stats = mergedFlappy;
    hasUpdates = true;
  }
  if (mergedAchievements && JSON.stringify(mergedAchievements) !== JSON.stringify(meta.achievements)) {
    updateData.achievements = mergedAchievements;
    hasUpdates = true;
  }

  if (hasUpdates) {
    try {
      await sbClient.auth.updateUser({ data: updateData });
    } catch (e) {
      console.warn('Lỗi cập nhật user_metadata khi gộp stats:', e);
    }
  }

  const allMergedStats = {
    chess: mergedChess,
    caro: mergedCaro,
    xiangqi: mergedXiangqi,
    sudoku: mergedSudoku,
    snake: mergedSnake,
    game2048: merged2048,
    minesweeper: mergedMinesweeper,
    brick_breaker: mergedBrickBreaker,
    t_rex: mergedTRex,
    flappy: mergedFlappy,
  };

  // 5. Kiểm tra và mở khóa các huy hiệu nếu thành tích gộp đạt mốc
  try {
    checkAllEligibleAchievements(allMergedStats);
  } catch {}

  return allMergedStats;
}
