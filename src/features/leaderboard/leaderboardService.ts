import { supabase } from '@/lib/supabase/client';
import { LeaderboardGame, LeaderboardDifficulty, LeaderboardEntry, UserRankSummary } from './types';
import { getChessStats } from '@/features/games/chess/statsService';
import { getCaroStats } from '@/features/games/caro/caroStatsService';
import { getSudokuStats } from '@/features/games/sudoku/sudokuStatsService';
import { getXiangqiStats } from '@/features/games/xiangqi/xiangqiStatsService';
import { getSnakeStats } from '@/features/games/snake/snakeStatsService';
import { getGame2048Stats } from '@/features/games/game2048/game2048StatsService';
import { getMinesweeperStats } from '@/features/games/minesweeper/minesweeperStatsService';
import { getBrickBreakerStats } from '@/features/games/brickBreaker/brickBreakerStatsService';
import { getTRexStats } from '@/features/games/dinoRunner/tRexStatsService';
import { getFlappyStats } from '@/features/games/flappyBird/flappyStatsService';
import { getBlockBlastStats } from '@/features/games/blockBlast/blockBlastStatsService';
import { getTetrisStats } from '@/features/games/tetris/tetrisStatsService';
import { getOthelloStats } from '@/features/games/othello/othelloStatsService';
import { getGoStats } from '@/features/games/go/goStatsService';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

/**
 * Định dạng nhãn điểm số chuẩn hóa theo từng bộ môn
 */
function formatScoreLabel(game: LeaderboardGame, scoreValue: number): string {
  if (game === 'chess' || game === 'xiangqi' || game === 'go') {
    return `${scoreValue} Elo`;
  }
  if (game === 'sudoku') {
    return formatTime(scoreValue);
  }
  if (game === 'minesweeper') {
    return scoreValue < 60 ? `${scoreValue}s` : formatTime(scoreValue);
  }
  if (game === 'game2048' || game === 'brick_breaker' || game === 't_rex_runner' || game === 'block_blast' || game === 'tetris') {
    return `${scoreValue.toLocaleString()} Điểm`;
  }
  // Caro, Snake...
  return `${scoreValue} Điểm`;
}

/**
 * Lấy dữ liệu cục bộ tức thì (0ms) của người dùng hiện tại
 */
export function getLocalLeaderboardData(
  game: LeaderboardGame,
  difficulty: LeaderboardDifficulty = 'easy',
  currentUserId?: string,
  currentUserName: string = 'Bạn',
  currentUserAvatar: string = '👑'
): { list: LeaderboardEntry[]; userSummary: UserRankSummary | null } {
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
        secondaryInfo: undefined,
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
        scoreLabel: `${stats.wins} Điểm`,
        secondaryInfo: undefined,
        isCurrentUser: true,
        tierBadge: stats.bestStreak >= 5 ? 'Thợ săn chuỗi' : undefined,
      };
    }
  } else if (game === 'sudoku') {
    const stats = getSudokuStats();
    const diffStat = stats[difficulty];
    const bestSec = diffStat?.bestTimeSeconds ?? null;

    if (bestSec !== null) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: bestSec,
        scoreLabel: formatTime(bestSec),
        secondaryInfo: undefined,
        isCurrentUser: true,
        tierBadge: difficulty === 'hard' ? 'Bậc thầy' : difficulty === 'medium' ? 'Chuyên gia' : 'Tập sự',
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
        secondaryInfo: undefined,
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
        secondaryInfo: undefined,
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
  } else if (game === 'minesweeper') {
    const stats = getMinesweeperStats();
    const diffKey = difficulty === 'hard' ? 'expert' : difficulty === 'medium' ? 'intermediate' : 'beginner';
    const bestSec = stats[diffKey]?.bestTimeSeconds ?? null;

    if (bestSec !== null) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: bestSec,
        scoreLabel: bestSec < 60 ? `${bestSec}s` : formatTime(bestSec),
        secondaryInfo: undefined,
        isCurrentUser: true,
        tierBadge: difficulty === 'hard' ? 'Chuyên gia' : difficulty === 'medium' ? 'Thần tốc' : 'Kỳ cựu',
      };
    }
  } else if (game === 'brick_breaker') {
    const stats = getBrickBreakerStats();
    if (stats.highScore > 0) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: stats.highScore,
        scoreLabel: `${stats.highScore.toLocaleString()} Điểm`,
        secondaryInfo: undefined,
        isCurrentUser: true,
        tierBadge: stats.highScore >= 5000 ? 'Phá Đảo' : stats.highScore >= 2000 ? 'Cao Thủ' : 'Tập Sự',
      };
    }
  } else if (game === 't_rex_runner') {
    const stats = getTRexStats();
    if (stats.highScore > 0) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: stats.highScore,
        scoreLabel: `${stats.highScore.toLocaleString()} Điểm`,
        secondaryInfo: undefined,
        isCurrentUser: true,
        tierBadge: stats.highScore >= 3000 ? 'Huyền Thoại' : stats.highScore >= 1000 ? 'Dũng Mãnh' : 'Tập Sự',
      };
    }
  } else if (game === 'flappy_bird') {
    const stats = getFlappyStats();
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
        tierBadge: stats.highScore >= 40 ? 'Bạch Kim' : stats.highScore >= 30 ? 'Vàng' : stats.highScore >= 20 ? 'Bạc' : stats.highScore >= 10 ? 'Đồng' : 'Tập Sự',
      };
    }
  } else if (game === 'block_blast') {
    const stats = getBlockBlastStats();
    if (stats.highScore > 0) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: stats.highScore,
        scoreLabel: `${stats.highScore.toLocaleString()} Điểm`,
        secondaryInfo: undefined,
        isCurrentUser: true,
        tierBadge: stats.highScore >= 5000 ? 'Bậc Thầy Nổ Khối' : stats.highScore >= 2000 ? 'Xếp Gạch Cừ Khôi' : 'Tập Sự',
      };
    }
  } else if (game === 'tetris') {
    const stats = getTetrisStats();
    if (stats.highScore > 0) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: stats.highScore,
        scoreLabel: `${stats.highScore.toLocaleString()} Điểm`,
        secondaryInfo: undefined,
        isCurrentUser: true,
        tierBadge: stats.highScore >= 10000 ? 'Đại Sư Tetris' : stats.highScore >= 3000 ? 'Cao Thủ Xếp Gạch' : 'Tập Sự',
      };
    }
  } else if (game === 'othello') {
    const stats = getOthelloStats();
    if (stats.bestScore > 0) {
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: stats.bestScore,
        scoreLabel: `${stats.bestScore} quân`,
        secondaryInfo: undefined,
        isCurrentUser: true,
        tierBadge: stats.bestScore >= 50 ? 'Đại Sư Cờ Lật' : stats.bestScore >= 40 ? 'Chiến Thuật Gia' : 'Tập Sự',
      };
    }
  } else if (game === 'go') {
    const stats = getGoStats();
    if (stats.totalGames > 0) {
      const elo = Math.max(800, 1200 + stats.wins * 25 - stats.losses * 15);
      userEntry = {
        id: currentUserId || 'current_user',
        userId: currentUserId,
        name: currentUserName,
        avatar: currentUserAvatar,
        rank: 1,
        scoreValue: elo,
        scoreLabel: `${elo} Elo`,
        secondaryInfo: `${stats.wins} Thắng / ${stats.losses} Thua`,
        isCurrentUser: true,
        tierBadge: elo >= 1600 ? 'Kỳ Thánh' : elo >= 1400 ? 'Kỳ Thủ' : 'Tập Sự',
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
  difficulty: LeaderboardDifficulty = 'easy',
  currentUserId?: string,
  currentUserName: string = 'Bạn',
  currentUserAvatar: string = '👑',
  isAnonymousUser: boolean = true
): Promise<{ list: LeaderboardEntry[]; userSummary: UserRankSummary | null }> {
  const localResult = getLocalLeaderboardData(game, difficulty, currentUserId, currentUserName, currentUserAvatar);
  const isHigherBetter = game !== 'sudoku' && game !== 'minesweeper';
  const entriesMap = new Map<string, Omit<LeaderboardEntry, 'rank'>>();

  // Đưa userEntry của người dùng vào trước
  if (localResult.list.length > 0) {
    const u = localResult.list[0];
    entriesMap.set(u.userId || u.id, u);
  }

  // 2. Tự động đồng bộ điểm mới nhất của người dùng lên Supabase (chỉ áp dụng cho tài khoản đã đăng ký)
  if (currentUserId && !isAnonymousUser) {
    await syncLeaderboardScoreForGame(game, currentUserId, currentUserName, currentUserAvatar).catch(() => {});
  }

  const targetGameIds =
    game === 'sudoku' && difficulty === 'easy'
      ? ['sudoku_easy', 'sudoku']
      : game === 'minesweeper' && difficulty === 'easy'
      ? ['minesweeper_easy', 'minesweeper']
      : game === 'sudoku' || game === 'minesweeper'
      ? [`${game}_${difficulty}`]
      : [game];

  // 3. Truy vấn Supabase với timeout an toàn tránh treo nếu chưa tạo bảng
  try {
    const cloudPromise = supabase
      .from('leaderboard_scores')
      .select('*')
      .in('game_id', targetGameIds)
      .order('score_value', { ascending: !isHigherBetter })
      .limit(50);

    const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
      setTimeout(() => resolve({ data: null, error: new Error('Timeout') }), 2000)
    );

    const res: any = await Promise.race([cloudPromise, timeoutPromise]);

    if (!res.error && res.data && Array.isArray(res.data) && res.data.length > 0) {
      // Xóa fallback id tạm nếu tài khoản đã đăng ký và có cloud row
      if (currentUserId && !isAnonymousUser) {
        entriesMap.delete('current_user');
      }

      for (const row of res.data) {
        // Bỏ qua các hàng cũ của tài khoản khách vãng lai nếu còn sót trong database
        if (row.user_name && row.user_name.startsWith('Khách #')) {
          continue;
        }

        const isCurrent = currentUserId ? row.user_id === currentUserId : false;
        const existingLocal = currentUserId ? entriesMap.get(currentUserId) : undefined;

        let finalScoreValue = Number(row.score_value);
        let finalScoreLabel = formatScoreLabel(game, finalScoreValue);

        // Nếu là tài khoản hiện tại và local có điểm cao hơn cloud (vừa đạt kỷ lục mới)
        if (isCurrent && existingLocal) {
          if (isHigherBetter && existingLocal.scoreValue > finalScoreValue) {
            finalScoreValue = existingLocal.scoreValue;
            finalScoreLabel = formatScoreLabel(game, finalScoreValue);
          } else if (!isHigherBetter && existingLocal.scoreValue < finalScoreValue) {
            finalScoreValue = existingLocal.scoreValue;
            finalScoreLabel = formatScoreLabel(game, finalScoreValue);
          }
        }

        entriesMap.set(row.user_id, {
          id: row.id,
          userId: row.user_id,
          name: row.user_name,
          avatar: row.user_avatar,
          scoreValue: finalScoreValue,
          scoreLabel: finalScoreLabel,
          secondaryInfo: undefined,
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
 * Trợ thủ upsert một dòng điểm số vào leaderboard_scores
 */
async function upsertSingleScore(
  userId: string,
  userName: string,
  userAvatar: string,
  gameId: string,
  scoreValue: number,
  scoreLabel: string,
  isHigherBetter: boolean
): Promise<void> {
  const { data: existingRow } = await supabase
    .from('leaderboard_scores')
    .select('score_value')
    .eq('user_id', userId)
    .eq('game_id', gameId)
    .maybeSingle();

  if (existingRow) {
    const remoteVal = Number(existingRow.score_value);
    if (isHigherBetter && remoteVal > scoreValue) {
      return;
    }
    if (!isHigherBetter && remoteVal < scoreValue) {
      return;
    }
  }

  const { error: upsertErr } = await supabase.from('leaderboard_scores').upsert(
    {
      user_id: userId,
      user_name: userName,
      user_avatar: userAvatar,
      game_id: gameId,
      score_value: scoreValue,
      score_label: scoreLabel,
      secondary_info: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,game_id' }
  );

  if (upsertErr) {
    console.warn(`Lỗi upsert leaderboard ${gameId}:`, upsertErr);
    // Nếu bảng trên Supabase chưa chạy migration cho các key con (ví dụ: minesweeper_easy), fallback lưu key gốc
    if (gameId === 'minesweeper_easy' || gameId === 'sudoku_easy') {
      const baseGame = gameId.split('_')[0];
      try {
        await supabase.from('leaderboard_scores').upsert(
          {
            user_id: userId,
            user_name: userName,
            user_avatar: userAvatar,
            game_id: baseGame,
            score_value: scoreValue,
            score_label: scoreLabel,
            secondary_info: null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id,game_id' }
        );
      } catch {}
    }
  }
}

/**
 * Tự động đồng bộ và upsert thành tích của người chơi vào bảng `leaderboard_scores` trên Supabase.
 * QUY TẮC: Chỉ tài khoản đã đăng ký (Cloud User) mới được lưu lên Bảng xếp hạng Supabase.
 * Tài khoản Khách (Anonymous) chỉ lưu thành tích cục bộ trên máy và không đẩy lên đám mây.
 */
export async function syncLeaderboardScoreForGame(
  game: LeaderboardGame,
  customUserId?: string,
  customUserName?: string,
  customUserAvatar?: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Chặn hoàn toàn tài khoản Khách (Anonymous) lưu vào bảng xếp hạng công khai
    const isAnonymous = Boolean(user.is_anonymous) || user.app_metadata?.provider === 'anonymous';
    if (isAnonymous) {
      return;
    }

    const effectiveUserId = user.id;

    // Đảm bảo tên người chơi không bị lưu thành "Bạn" hoặc "You" trên cơ sở dữ liệu chung
    const cleanName: string =
      user.user_metadata?.display_name ||
      (customUserName && customUserName !== 'Bạn' && customUserName !== 'You'
        ? customUserName
        : 'Người chơi');

    const avatar = user.user_metadata?.avatar || customUserAvatar || '👑';

    if (game === 'sudoku') {
      const stats = getSudokuStats();
      const levels: LeaderboardDifficulty[] = ['easy', 'medium', 'hard'];
      for (const lvl of levels) {
        const bestSec = stats[lvl]?.bestTimeSeconds;
        if (bestSec !== null && bestSec !== undefined) {
          await upsertSingleScore(
            effectiveUserId,
            cleanName,
            avatar,
            `sudoku_${lvl}`,
            bestSec,
            formatTime(bestSec),
            false
          );
        }
      }
      return;
    }

    if (game === 'minesweeper') {
      const stats = getMinesweeperStats();
      const levels: { lvl: LeaderboardDifficulty; sec: number | null }[] = [
        { lvl: 'easy', sec: stats.beginner.bestTimeSeconds },
        { lvl: 'medium', sec: stats.intermediate.bestTimeSeconds },
        { lvl: 'hard', sec: stats.expert.bestTimeSeconds },
      ];
      for (const item of levels) {
        if (item.sec !== null && item.sec !== undefined) {
          await upsertSingleScore(
            effectiveUserId,
            cleanName,
            avatar,
            `minesweeper_${item.lvl}`,
            item.sec,
            item.sec < 60 ? `${item.sec}s` : formatTime(item.sec),
            false
          );
        }
      }
      return;
    }

    let scoreValue = 0;
    let scoreLabel = '';

    if (game === 'chess') {
      const stats = getChessStats();
      if (stats.totalGames === 0) return;
      const elo = Math.max(800, 1200 + stats.pvp.wins * 25 - stats.pvp.losses * 15);
      scoreValue = elo;
      scoreLabel = `${elo} Elo`;
    } else if (game === 'caro') {
      const stats = getCaroStats();
      if (stats.totalGames === 0) return;
      scoreValue = stats.wins;
      scoreLabel = `${stats.wins} Điểm`;
    } else if (game === 'xiangqi') {
      const stats = getXiangqiStats();
      if (stats.totalGames === 0) return;
      const elo = Math.max(800, 1200 + stats.pvp.wins * 25 - stats.pvp.losses * 15);
      scoreValue = elo;
      scoreLabel = `${elo} Elo`;
    } else if (game === 'snake') {
      const stats = getSnakeStats();
      if (stats.highScore === 0) return;
      scoreValue = stats.highScore;
      scoreLabel = `${stats.highScore} Điểm`;
    } else if (game === 'game2048') {
      const stats = getGame2048Stats();
      if (stats.highScore === 0) return;
      scoreValue = stats.highScore;
      scoreLabel = `${stats.highScore.toLocaleString()} Điểm`;
    } else if (game === 'brick_breaker') {
      const stats = getBrickBreakerStats();
      if (stats.highScore === 0) return;
      scoreValue = stats.highScore;
      scoreLabel = `${stats.highScore.toLocaleString()} Điểm`;
    } else if (game === 't_rex_runner') {
      const stats = getTRexStats();
      if (stats.highScore === 0) return;
      scoreValue = stats.highScore;
      scoreLabel = `${stats.highScore.toLocaleString()} Điểm`;
    } else if (game === 'flappy_bird') {
      const stats = getFlappyStats();
      if (stats.highScore === 0) return;
      scoreValue = stats.highScore;
      scoreLabel = `${stats.highScore} Điểm`;
    } else if (game === 'block_blast') {
      const stats = getBlockBlastStats();
      if (stats.highScore === 0) return;
      scoreValue = stats.highScore;
      scoreLabel = `${stats.highScore.toLocaleString()} Điểm`;
    } else if (game === 'tetris') {
      const stats = getTetrisStats();
      if (stats.highScore === 0) return;
      scoreValue = stats.highScore;
      scoreLabel = `${stats.highScore.toLocaleString()} Điểm`;
    } else if (game === 'go') {
      const stats = getGoStats();
      if (stats.totalGames === 0) return;
      scoreValue = Math.max(800, 1200 + stats.wins * 25 - stats.losses * 15);
      scoreLabel = `${scoreValue} Elo`;
    } else if (game === 'othello') {
      const stats = getOthelloStats();
      if (stats.bestScore === 0) return;
      scoreValue = stats.bestScore;
      scoreLabel = `${stats.bestScore} quân`;
    }

    await upsertSingleScore(
      effectiveUserId,
      cleanName,
      avatar,
      game,
      scoreValue,
      scoreLabel,
      true
    );
  } catch (err) {
    console.warn(`Lỗi sync leaderboard ${game}:`, err);
  }
}

/**
 * Đồng bộ tất cả 11 game lên bảng xếp hạng Supabase
 */
export async function syncAllLeaderboardScores() {
  await Promise.allSettled([
    syncLeaderboardScoreForGame('chess'),
    syncLeaderboardScoreForGame('caro'),
    syncLeaderboardScoreForGame('sudoku'),
    syncLeaderboardScoreForGame('xiangqi'),
    syncLeaderboardScoreForGame('snake'),
    syncLeaderboardScoreForGame('game2048'),
    syncLeaderboardScoreForGame('minesweeper'),
    syncLeaderboardScoreForGame('brick_breaker'),
    syncLeaderboardScoreForGame('t_rex_runner'),
    syncLeaderboardScoreForGame('flappy_bird'),
    syncLeaderboardScoreForGame('block_blast'),
    syncLeaderboardScoreForGame('tetris'),
    syncLeaderboardScoreForGame('othello'),
  ]);
}
