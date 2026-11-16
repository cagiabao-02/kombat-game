import { ACHIEVEMENTS, getAchievementById } from './achievementsConfig';
import { UnlockedAchievementsMap, Achievement } from './types';
import { sounds } from '@/lib/sound/soundService';
import { supabase } from '@/lib/supabase/client';

export const ACHIEVEMENTS_STORAGE_KEY = 'kombat_unlocked_achievements';

/** Lấy danh sách thành tựu đã mở khóa từ LocalStorage */
export function getUnlockedAchievements(): UnlockedAchievementsMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as UnlockedAchievementsMap;
  } catch {
    return {};
  }
}

/** Lưu danh sách thành tựu đã mở khóa vào LocalStorage */
export function saveUnlockedAchievements(data: UnlockedAchievementsMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Lỗi lưu achievements:', err);
  }
}

/**
 * Mở khóa một thành tựu cụ thể
 * Trả về true nếu thành tựu này vừa mới được mở lần đầu
 */
export function unlockAchievement(achievementId: string): boolean {
  if (typeof window === 'undefined') return false;

  const achievement = getAchievementById(achievementId);
  if (!achievement) return false;

  const current = getUnlockedAchievements();
  if (current[achievementId]) {
    return false; // Đã mở khóa từ trước
  }

  // 1. Cập nhật dữ liệu
  const now = new Date().toISOString();
  current[achievementId] = { unlockedAt: now };
  saveUnlockedAchievements(current);

  // 2. Phát âm thanh chúc mừng
  sounds.playAchievementUnlock();

  // 3. Bắn CustomEvent để hiển thị Toast thông báo trên giao diện
  window.dispatchEvent(
    new CustomEvent('kombat:achievement_unlocked', {
      detail: achievement,
    })
  );

  // 4. Kiểm tra thành tựu tối thượng: Nhà sưu tập huyền thoại (>= 10 huy hiệu)
  const totalUnlocked = Object.keys(current).length;
  if (totalUnlocked >= 10 && !current['trophy_collector'] && achievementId !== 'trophy_collector') {
    setTimeout(() => {
      unlockAchievement('trophy_collector');
    }, 1500);
  }

  // 5. Đồng bộ lên Supabase nếu là tài khoản đã đăng nhập
  syncAchievementsToCloud(current).catch(() => {});

  return true;
}

/** Đồng bộ danh sách huy hiệu lên Supabase User Metadata */
export async function syncAchievementsToCloud(data: UnlockedAchievementsMap): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.is_anonymous) return;

    await supabase.auth.updateUser({
      data: {
        achievements: data,
      },
    });
  } catch (err) {
    console.warn('Lỗi đồng bộ achievements lên cloud:', err);
  }
}

/**
 * Kiểm tra và mở khóa tự động toàn bộ thành tựu đủ điều kiện
 * Dựa trên ảnh chụp dữ liệu thống kê tổng hợp của người chơi
 */
export function checkAllEligibleAchievements(allStats: Record<string, any>): number {
  if (typeof window === 'undefined' || !allStats) return 0;

  let newUnlockedCount = 0;
  const current = getUnlockedAchievements();

  for (const ach of ACHIEVEMENTS) {
    if (current[ach.id]) continue; // Đã có

    if (ach.checkCondition && ach.checkCondition(allStats)) {
      const success = unlockAchievement(ach.id);
      if (success) {
        newUnlockedCount++;
      }
    }
  }

  return newUnlockedCount;
}

/**
 * Đọc toàn bộ snapshot thành tích từ LocalStorage của máy
 */
export function getAllLocalStatsSnapshot(): Record<string, any> {
  if (typeof window === 'undefined') return {};
  const safeGet = (key: string) => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  return {
    chess: safeGet('kombat_chess_stats'),
    caro: safeGet('kombat_caro_stats'),
    xiangqi: safeGet('kombat_xiangqi_stats'),
    sudoku: safeGet('kombat_sudoku_stats'),
    snake: safeGet('kombat_snake_stats'),
    game2048: safeGet('kombat_2048_stats'),
    minesweeper: safeGet('kombat_minesweeper_stats'),
    brick_breaker: safeGet('kombat_brick_breaker_stats'),
    t_rex: safeGet('kombat_t_rex_stats'),
    flappy: safeGet('kombat_flappy_stats'),
  };
}

/**
 * Tiện ích kiểm tra nhanh toàn bộ thành tích từ LocalStorage
 */
export function checkLocalAchievements(): number {
  const snapshot = getAllLocalStatsSnapshot();
  return checkAllEligibleAchievements(snapshot);
}

/**
 * Gộp danh sách thành tựu giữa Local và Cloud khi người dùng đăng nhập
 */
export function mergeAchievements(
  local: UnlockedAchievementsMap | null,
  cloud: UnlockedAchievementsMap | null
): UnlockedAchievementsMap {
  const merged: UnlockedAchievementsMap = { ...(local || {}) };

  if (cloud) {
    for (const [id, val] of Object.entries(cloud)) {
      if (!merged[id]) {
        merged[id] = val;
      } else {
        // Giữ lại thời điểm mở khóa sớm hơn
        const localTime = new Date(merged[id].unlockedAt).getTime();
        const cloudTime = new Date(val.unlockedAt).getTime();
        if (cloudTime < localTime) {
          merged[id] = val;
        }
      }
    }
  }

  return merged;
}
