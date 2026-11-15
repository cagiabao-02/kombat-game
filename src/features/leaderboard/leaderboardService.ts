import { supabase } from '@/lib/supabase/client';
import { LeaderboardGame, LeaderboardEntry, UserRankSummary } from './types';
import { getChessStats } from '@/features/games/chess/statsService';
import { getCaroStats } from '@/features/games/caro/caroStatsService';
import { getSudokuStats } from '@/features/games/sudoku/sudokuStatsService';
import { getXiangqiStats } from '@/features/games/xiangqi/xiangqiStatsService';
import { getSnakeStats } from '@/features/games/snake/snakeStatsService';
import { getGame2048Stats } from '@/features/games/game2048/game2048StatsService';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Lấy dữ liệu cục bộ tức thì (0ms) của người dùng hiện tại
 */
export function getLocalLeaderboardData(
  game: LeaderboardGame,
  currentUserId?: string,
  currentUserName: string = 'Bạn',
  currentUserAvatar: string = '👑'
): { list: LeaderboardEntry[]; userSummary: UserRankSummary | null } {
  const isHigherBetter = game !== 'sudoku';
  let userEntry: LeaderboardEntry | null = null;

  if (game === 'chess') {
    const stats = getChessStats();
    if (stats.totalGames > 0) {
      const elo = Math.max(800, 1200 + stats.pvp.wins * 25 - stats.pvp.losses * 15);
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: elo,
        scoreLabel: `${elo} Elo`,
        secondaryInfo: `${stats.pvp.wins} Thắng • ${stats.totalGames} Trận`,
        isCurrentUser: true,
        tierBadge: elo >= 1600 ? 'Cao thủ' : elo >= 1400 ? 'Tiến bộ' : 'Tập sự',
      };
    }
  } else if (game === 'caro') {
    const stats = getCaroStats();
    if (stats.totalGames > 0) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: stats.wins,
        scoreLabel: `${stats.wins} Ván thắng`,
        secondaryInfo: `Chuỗi ${stats.currentStreak} trận • Kỷ lục ${stats.bestStreak}`,
        isCurrentUser: true,
        tierBadge: stats.bestStreak >= 5 ? 'Thợ săn chuỗi' : undefined,
      };
    }
  } else if (game === 'sudoku') {
    const stats = getSudokuStats();
    const bestSec =
      stats.hard.bestTimeSeconds ||
      stats.medium.bestTimeSeconds ||
      stats.easy.bestTimeSeconds ||
      null;

    if (bestSec !== null) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: bestSec,
        scoreLabel: formatTime(bestSec),
        secondaryInfo: `Tổng giải ${stats.totalSolved} bảng`,
        isCurrentUser: true,
      };
    }
  } else if (game === 'xiangqi') {
    const stats = getXiangqiStats();
    if (stats.totalGames > 0) {
      const elo = Math.max(800, 1200 + stats.pvp.wins * 25 - stats.pvp.losses * 15);
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: elo,
        scoreLabel: `${elo} Elo`,
        secondaryInfo: `${stats.pvp.wins} Thắng • ${stats.totalGames} Trận`,
        isCurrentUser: true,
        tierBadge: elo >= 1600 ? 'Đại sư' : elo >= 1400 ? 'Kỳ thủ' : 'Tập sự',
      };
    }
  } else if (game === 'snake') {
    const stats = getSnakeStats();
    if (stats.highScore > 0) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: stats.highScore,
        scoreLabel: `${stats.highScore} Điểm`,
        secondaryInfo: undefined,
        isCurrentUser: true,
        tierBadge: stats.highScore >= 300 ? 'Chuyên gia' : stats.highScore >= 150 ? 'Tay lái lụa' : undefined,
      };
    }
  } else if (game === 'game2048') {
    const stats = getGame2048Stats();
    if (stats.highScore > 0) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: stats.highScore,
        scoreLabel: `${stats.highScore.toLocaleString()} Điểm`,
        secondaryInfo: `Ô cao nhất: ${stats.maxTile} • ${stats.totalGames} ván`,
        isCurrentUser: true,
        tierBadge:
          stats.maxTile >= 2048
            ? 'Bậc thầy 2048'
            : stats.maxTile >= 1024
            ? 'Cao thủ'
            : stats.maxTile >= 512
            ? 'Thành thạo'
            : undefined,
      };
    }
  }

  const list = userEntry ? [userEntry] : [];
  const userSummary: UserRankSummary | null = userEntry
    ? {
        rank: 1,
        scoreValue: userEntry.scoreValue,
        scoreLabel: userEntry.scoreLabel,
        aheadDiff: 'Bạn đang dẫn đầu bảng xếp hạng! 👑',
      }
    : null;

  return { list, userSummary };
}

/**
 * Lấy danh sách bảng xếp hạng thật:
 * 1. Nạp dữ liệu từ Supabase `leaderboard_scores` với timeout 2.5s an toàn.
 * 2. Kết hợp với dữ liệu thật của người dùng hiện tại.
 * 3. Tuyệt đối không dùng dữ liệu mock.
 */
export async function getRealLeaderboardData(
  game: LeaderboardGame,
  currentUserId?: string,
  currentUserName: string = 'Bạn',
  currentUserAvatar: string = '👑'
): Promise<{ list: LeaderboardEntry[]; userSummary: UserRankSummary | null }> {
  const localResult = getLocalLeaderboardData(game, currentUserId, currentUserName, currentUserAvatar);
  const isHigherBetter = game !== 'sudoku';
  const entriesMap = new Map<string, Omit<LeaderboardEntry, 'rank'>>();

  // Đưa userEntry của người dùng vào trước
  if (localResult.list.length > 0) {
    const u = localResult.list[0];
    entriesMap.set(u.userId || u.id, u);
  }

  // 2. Tự động đồng bộ điểm mới nhất của người dùng lên Supabase trước khi truy vấn
  if (currentUserId) {
    await syncLeaderboardScoreForGame(game, currentUserId, currentUserName, currentUserAvatar).catch(() => {});
  }

  // 3. Truy vấn Supabase với timeout an toàn tránh treo nếu chưa tạo bảng
  try {
    const cloudPromise = supabase
      .from('leaderboard_scores')
      .select('*')
      .eq('game_id', game)
      .order('score_value', { ascending: !isHigherBetter })
      .limit(50);

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 2000)
    );

    const res: any = await Promise.race([cloudPromise, timeoutPromise]);

    if (!res.error && res.data && Array.isArray(res.data) && res.data.length > 0) {
      // Xóa fallback id tạm nếu đã có currentUserId
      if (currentUserId) {
        entriesMap.delete('current_user');
      }

      for (const row of res.data) {
        const isCurrent = row.user_id === currentUserId;
        const existingLocal = currentUserId ? entriesMap.get(currentUserId) : undefined;

        let finalScoreValue = Number(row.score_value);
        let finalScoreLabel = row.score_label;
        let finalSecondary: string | undefined = game === 'snake' ? undefined : (row.secondary_info || undefined);

        // Nếu là tài khoản hiện tại và local có điểm cao hơn cloud (vừa đạt kỷ lục mới)
        if (isCurrent && existingLocal) {
          if (isHigherBetter && existingLocal.scoreValue > finalScoreValue) {
            finalScoreValue = existingLocal.scoreValue;
            finalScoreLabel = existingLocal.scoreLabel;
            if (game !== 'snake') {
              finalSecondary = existingLocal.secondaryInfo;
            }
          } else if (!isHigherBetter && existingLocal.scoreValue < finalScoreValue) {
            finalScoreValue = existingLocal.scoreValue;
            finalScoreLabel = existingLocal.scoreLabel;
            finalSecondary = existingLocal.secondaryInfo;
          }
        }

        entriesMap.set(row.user_id, {
          id: row.id,
          userId: row.user_id,
          name: row.user_name,
          avatar: row.user_avatar,
          scoreValue: finalScoreValue,
          scoreLabel: finalScoreLabel,
          secondaryInfo: finalSecondary,
          isCurrentUser: isCurrent,
          tierBadge: isCurrent ? existingLocal?.tierBadge : undefined,
        });
      }
    }
  } catch {
    // Không có mạng hoặc chưa tạo bảng, dùng local fallback
  }

  const entries = Array.from(entriesMap.values());

  // 3. Sắp xếp thứ hạng
  entries.sort((a, b) => {
    if (isHigherBetter) {
      return b.scoreValue - a.scoreValue;
    } else {
      return a.scoreValue - b.scoreValue;
    }
  });

  const rankedList: LeaderboardEntry[] = entries.map((item, index) => ({
    ...item,
    rank: index + 1,
    isCurrentUser: item.userId === currentUserId || item.isCurrentUser,
  }));

  const userRankEntry = rankedList.find((item) => item.isCurrentUser);
  let userSummary: UserRankSummary | null = null;

  if (userRankEntry) {
    let aheadDiff: string | undefined = undefined;
    if (userRankEntry.rank > 1) {
      const aheadEntry = rankedList[userRankEntry.rank - 2];
      if (isHigherBetter) {
        const diff = aheadEntry.scoreValue - userRankEntry.scoreValue;
        aheadDiff = `Kém hạng #${userRankEntry.rank - 1} ${diff} điểm`;
      } else {
        const diff = userRankEntry.scoreValue - aheadEntry.scoreValue;
        aheadDiff = `Kém hạng #${userRankEntry.rank - 1} ${diff}s`;
      }
    } else {
      aheadDiff = 'Bạn đang dẫn đầu bảng xếp hạng! 👑';
    }

    userSummary = {
      rank: userRankEntry.rank,
      scoreValue: userRankEntry.scoreValue,
      scoreLabel: userRankEntry.scoreLabel,
      aheadDiff,
    };
  }

  return { list: rankedList, userSummary };
}

/**
 * Tự động đồng bộ và upsert thành tích của người chơi vào bảng `leaderboard_scores` trên Supabase.
 */
export async function syncLeaderboardScoreForGame(
  game: LeaderboardGame,
  customUserId?: string,
  customUserName?: string,
  customUserAvatar?: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const effectiveUserId = customUserId || user?.id;
    if (!effectiveUserId) return;

    // Đảm bảo tên người chơi không bị lưu thành "Bạn" hoặc "You" trên cơ sở dữ liệu chung
    let cleanName = customUserName;
    if (!cleanName || cleanName === 'Bạn' || cleanName === 'You') {
      cleanName =
        user?.user_metadata?.display_name ||
        (effectiveUserId ? `Khách #${effectiveUserId.slice(-4).toUpperCase()}` : 'Người chơi');
    }

    const avatar = customUserAvatar || user?.user_metadata?.avatar || '👑';

    let scoreValue = 0;
    let scoreLabel = '';
    let secondaryInfo: string | undefined = undefined;

    if (game === 'chess') {
      const stats = getChessStats();
      if (stats.totalGames === 0) return;
      const elo = Math.max(800, 1200 + stats.pvp.wins * 25 - stats.pvp.losses * 15);
      scoreValue = elo;
      scoreLabel = `${elo} Elo`;
      secondaryInfo = `${stats.pvp.wins} Thắng • ${stats.totalGames} Trận`;
    } else if (game === 'caro') {
      const stats = getCaroStats();
      if (stats.totalGames === 0) return;
      scoreValue = stats.wins;
      scoreLabel = `${stats.wins} Ván thắng`;
      secondaryInfo = `Chuỗi ${stats.currentStreak} trận • Kỷ lục ${stats.bestStreak}`;
    } else if (game === 'sudoku') {
      const stats = getSudokuStats();
      const bestSec =
        stats.hard.bestTimeSeconds ||
        stats.medium.bestTimeSeconds ||
        stats.easy.bestTimeSeconds ||
        null;
      if (bestSec === null) return;
      scoreValue = bestSec;
      scoreLabel = formatTime(bestSec);
      secondaryInfo = `Tổng giải ${stats.totalSolved} bảng`;
    } else if (game === 'xiangqi') {
      const stats = getXiangqiStats();
      if (stats.totalGames === 0) return;
      const elo = Math.max(800, 1200 + stats.pvp.wins * 25 - stats.pvp.losses * 15);
      scoreValue = elo;
      scoreLabel = `${elo} Elo`;
      secondaryInfo = `${stats.pvp.wins} Thắng • ${stats.totalGames} Trận`;
    } else if (game === 'snake') {
      const stats = getSnakeStats();
      if (stats.highScore === 0) return;
      scoreValue = stats.highScore;
      scoreLabel = `${stats.highScore} Điểm`;
      secondaryInfo = undefined;
    } else if (game === 'game2048') {
      const stats = getGame2048Stats();
      if (stats.highScore === 0) return;
      scoreValue = stats.highScore;
      scoreLabel = `${stats.highScore.toLocaleString()} Điểm`;
      secondaryInfo = `Ô cao nhất: ${stats.maxTile} • ${stats.totalGames} ván`;
    }

    // Kiểm tra điểm số hiện tại trên đám mây để không vô tình ghi đè điểm thấp hơn lên điểm cao hơn
    const isHigherBetter = game !== 'sudoku';
    const { data: existingRow } = await supabase
      .from('leaderboard_scores')
      .select('score_value')
      .eq('user_id', effectiveUserId)
      .eq('game_id', game)
      .maybeSingle();

    if (existingRow) {
      const remoteVal = Number(existingRow.score_value);
      if (isHigherBetter && remoteVal > scoreValue) {
        return; // Đám mây đã lưu điểm cao hơn điểm local hiện tại -> giữ nguyên kỷ lục cao nhất
      }
      if (!isHigherBetter && remoteVal < scoreValue) {
        return; // Sudoku: Đám mây đã lưu thời gian giải nhanh hơn
      }
    }

    const { error: upsertErr } = await supabase.from('leaderboard_scores').upsert(
      {
        user_id: effectiveUserId,
        user_name: cleanName,
        user_avatar: avatar,
        game_id: game,
        score_value: scoreValue,
        score_label: scoreLabel,
        secondary_info: secondaryInfo || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,game_id' }
    );

    if (upsertErr) {
      console.warn(`Lỗi upsert leaderboard ${game}:`, upsertErr);
    }
  } catch (err) {
    console.warn(`Lỗi sync leaderboard ${game}:`, err);
  }
}

/**
 * Đồng bộ tất cả 6 game lên bảng xếp hạng Supabase
 */
export async function syncAllLeaderboardScores() {
  await Promise.allSettled([
    syncLeaderboardScoreForGame('chess'),
    syncLeaderboardScoreForGame('caro'),
    syncLeaderboardScoreForGame('sudoku'),
    syncLeaderboardScoreForGame('xiangqi'),
    syncLeaderboardScoreForGame('snake'),
    syncLeaderboardScoreForGame('game2048'),
  ]);
}
