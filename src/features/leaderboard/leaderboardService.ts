import { supabase } from '@/lib/supabase/client';
import { LeaderboardGame, LeaderboardEntry, UserRankSummary } from './types';
import { getChessStats } from '@/features/games/chess/statsService';
import { getCaroStats } from '@/features/games/caro/caroStatsService';
import { getSudokuStats } from '@/features/games/sudoku/sudokuStatsService';

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

  // 2. Truy vấn Supabase với timeout an toàn tránh treo nếu chưa tạo bảng
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
      for (const row of res.data) {
        entriesMap.set(row.user_id, {
          id: row.id,
          userId: row.user_id,
          name: row.user_name,
          avatar: row.user_avatar,
          scoreValue: Number(row.score_value),
          scoreLabel: row.score_label,
          secondaryInfo: row.secondary_info || undefined,
          isCurrentUser: row.user_id === currentUserId,
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
