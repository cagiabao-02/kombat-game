import { supabase } from '@/lib/supabase/client';
import { sounds } from '@/lib/sound/soundService';
import {
  getDailyTemplateById,
  pickDailyTemplatesForDate,
} from './dailyConfig';
import {
  DailyChallengesState,
  DailyChallengeViewItem,
} from './types';

export const DAILY_CHALLENGES_KEY = 'kombat_daily_challenges_v1';

export function getTodayDateKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getYesterdayDateKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function readStatMetric(storageKey: string, field: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    return Number(parsed?.[field]) || 0;
  } catch {
    return 0;
  }
}

export function getStoredDailyState(): DailyChallengesState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(DAILY_CHALLENGES_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as DailyChallengesState;
  } catch {
    return null;
  }
}

export function saveDailyStateLocally(state: DailyChallengesState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DAILY_CHALLENGES_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent('kombat:daily_updated', { detail: state }));
  } catch {}
}

/**
 * Tải và đồng bộ trạng thái Nhiệm vụ Hàng ngày cho ngày hôm nay.
 * Nếu sang ngày mới -> tự động sinh 3 nhiệm vụ mới và chụp Baseline Snapshot.
 */
export function ensureTodayDailyState(): DailyChallengesState {
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();
  const existing = getStoredDailyState();

  if (existing && existing.dateKey === today && existing.challenges.length === 3) {
    return existing;
  }

  const prevStreak = existing?.currentStreak || 0;
  const lastDone = existing?.lastCompletedDate || null;
  const isStreakAlive = lastDone === today || lastDone === yesterday;

  const templates = pickDailyTemplatesForDate(today);
  const challenges = templates.map((t) => ({
    id: t.id,
    baseline: readStatMetric(t.storageKey, t.field),
    claimed: false,
  }));

  const nextState: DailyChallengesState = {
    dateKey: today,
    challenges,
    currentStreak: isStreakAlive ? prevStreak : 0,
    bestStreak: existing?.bestStreak || 0,
    lastCompletedDate: lastDone,
    totalCompletedDays: existing?.totalCompletedDays || 0,
    totalQuestsClaimed: existing?.totalQuestsClaimed || 0,
    lastUpdated: Date.now(),
  };

  saveDailyStateLocally(nextState);
  return nextState;
}

/**
 * Lấy danh sách 3 nhiệm vụ hôm nay kèm tiến độ thực tế
 */
export function getTodayChallengeViews(): {
  state: DailyChallengesState;
  items: DailyChallengeViewItem[];
  readyToClaimCount: number;
  allClaimed: boolean;
} {
  const state = ensureTodayDailyState();
  const items: DailyChallengeViewItem[] = [];
  let readyToClaimCount = 0;

  for (const ch of state.challenges) {
    const template = getDailyTemplateById(ch.id);
    if (!template) continue;

    const currentVal = readStatMetric(template.storageKey, template.field);
    // Nếu người chơi xóa cache/đăng xuất làm currentVal < baseline -> chuẩn hóa về currentVal
    const delta = Math.max(0, currentVal - ch.baseline);
    const progress = Math.min(template.target, delta);
    const isCompleted = progress >= template.target;

    if (isCompleted && !ch.claimed) {
      readyToClaimCount++;
    }

    items.push({
      template,
      progress,
      target: template.target,
      isCompleted,
      claimed: ch.claimed,
    });
  }

  const allClaimed = items.length > 0 && items.every((i) => i.claimed);

  return { state, items, readyToClaimCount, allClaimed };
}

/**
 * Nhận thưởng một nhiệm vụ đã hoàn thành và cập nhật Chuỗi ngày chơi (Streak 🔥)
 */
export function claimDailyChallenge(challengeId: string): DailyChallengesState {
  const today = getTodayDateKey();
  const yesterday = getYesterdayDateKey();
  const state = ensureTodayDailyState();

  const targetIdx = state.challenges.findIndex((c) => c.id === challengeId);
  if (targetIdx === -1 || state.challenges[targetIdx].claimed) {
    return state;
  }

  const updatedChallenges = state.challenges.map((c, idx) =>
    idx === targetIdx ? { ...c, claimed: true } : c
  );

  let nextStreak = state.currentStreak;
  let nextBest = state.bestStreak;
  let nextLastDone = state.lastCompletedDate;
  let nextTotalDays = state.totalCompletedDays;

  // Hoàn thành & nhận thưởng nhiệm vụ đầu tiên trong ngày -> Tăng/giữ Streak!
  if (state.lastCompletedDate !== today) {
    nextStreak = state.lastCompletedDate === yesterday ? state.currentStreak + 1 : 1;
    nextBest = Math.max(state.bestStreak, nextStreak);
    nextLastDone = today;
    nextTotalDays = state.totalCompletedDays + 1;
  }

  const nextState: DailyChallengesState = {
    ...state,
    challenges: updatedChallenges,
    currentStreak: nextStreak,
    bestStreak: nextBest,
    lastCompletedDate: nextLastDone,
    totalCompletedDays: nextTotalDays,
    totalQuestsClaimed: state.totalQuestsClaimed + 1,
    lastUpdated: Date.now(),
  };

  saveDailyStateLocally(nextState);
  sounds.playAchievementUnlock();
  syncDailyStateToCloud(nextState).catch(() => {});

  return nextState;
}

export async function syncDailyStateToCloud(
  state: DailyChallengesState
): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || user.is_anonymous) return;

    await supabase.auth.updateUser({
      data: {
        daily_challenges_state: state,
      },
    });
  } catch {}
}

export function mergeDailyChallengesState(
  local: DailyChallengesState | null,
  cloud: DailyChallengesState | null
): DailyChallengesState | null {
  if (!local && !cloud) return null;
  if (!local) return cloud;
  if (!cloud) return local;

  // Ưu tiên bản có mốc ngày mới hơn hoặc tổng nhiệm vụ đã nhận cao hơn
  const newer =
    local.dateKey > cloud.dateKey
      ? local
      : cloud.dateKey > local.dateKey
      ? cloud
      : local.lastUpdated >= cloud.lastUpdated
      ? local
      : cloud;

  return {
    ...newer,
    bestStreak: Math.max(local.bestStreak || 0, cloud.bestStreak || 0),
    totalCompletedDays: Math.max(
      local.totalCompletedDays || 0,
      cloud.totalCompletedDays || 0
    ),
    totalQuestsClaimed: Math.max(
      local.totalQuestsClaimed || 0,
      cloud.totalQuestsClaimed || 0
    ),
    lastUpdated: Math.max(local.lastUpdated || 0, cloud.lastUpdated || 0),
  };
}
