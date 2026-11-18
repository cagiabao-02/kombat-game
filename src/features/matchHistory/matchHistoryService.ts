import {
  MatchRecord,
  CreateMatchRecord,
  BoardGameId,
  MAX_MATCH_HISTORY,
} from './types';
import { supabase } from '@/lib/supabase/client';

export const MATCH_HISTORY_STORAGE_KEY = 'kombat_match_history';

/** Lấy danh sách lịch sử đấu từ LocalStorage */
export function getMatchHistory(filterGameId?: BoardGameId): MatchRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(MATCH_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as MatchRecord[];
    if (!Array.isArray(list)) return [];

    if (filterGameId) {
      return list.filter((m) => m.gameId === filterGameId);
    }
    return list;
  } catch (err) {
    console.warn('Lỗi đọc lịch sử đấu:', err);
    return [];
  }
}

/** Lưu danh sách lịch sử đấu vào LocalStorage (giới hạn tối đa 20 ván gần nhất) */
export function saveMatchHistoryLocally(history: MatchRecord[]): void {
  if (typeof window === 'undefined') return;
  try {
    const capped = history.slice(0, MAX_MATCH_HISTORY);
    localStorage.setItem(MATCH_HISTORY_STORAGE_KEY, JSON.stringify(capped));
  } catch (err) {
    console.warn('Lỗi lưu lịch sử đấu:', err);
  }
}

/** Ghi nhận một ván đấu vừa kết thúc */
export function recordMatch(
  recordData: CreateMatchRecord
): MatchRecord {
  const newRecord = {
    ...recordData,
    id: `match_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    playedAt: new Date().toISOString(),
  } as MatchRecord;

  const current = getMatchHistory();
  // Đưa ván mới lên đầu danh sách và chỉ giữ tối đa 20 ván gần nhất
  const updated = [newRecord, ...current].slice(0, MAX_MATCH_HISTORY);

  saveMatchHistoryLocally(updated);

  // Bắn event để các tab/giao diện cập nhật tức thì
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('kombat:match_history_updated', {
        detail: updated,
      })
    );
  }

  // Đồng bộ lên Supabase Cloud nếu đã đăng nhập
  syncMatchHistoryToCloud(updated).catch(() => {});

  return newRecord;
}

/** Lấy thông tin một ván đấu theo ID để xem lại */
export function getMatchById(id: string): MatchRecord | undefined {
  const history = getMatchHistory();
  return history.find((m) => m.id === id);
}

/** Xóa toàn bộ lịch sử đấu */
export function clearMatchHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(MATCH_HISTORY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('kombat:match_history_updated', { detail: [] }));
    syncMatchHistoryToCloud([]).catch(() => {});
  } catch {}
}

/** Đồng bộ danh sách lịch sử đấu lên Supabase User Metadata */
export async function syncMatchHistoryToCloud(history: MatchRecord[]): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.is_anonymous) return;

    const capped = history.slice(0, MAX_MATCH_HISTORY);
    await supabase.auth.updateUser({
      data: {
        match_history: capped,
      },
    });
  } catch (err) {
    console.warn('Lỗi đồng bộ match_history lên Supabase:', err);
  }
}

/** Gộp danh sách lịch sử đấu giữa Local và Cloud khi đăng nhập */
export function mergeMatchHistory(
  local: MatchRecord[] | null,
  cloud: MatchRecord[] | null
): MatchRecord[] {
  const map = new Map<string, MatchRecord>();

  if (cloud && Array.isArray(cloud)) {
    cloud.forEach((m) => {
      if (m && m.id) map.set(m.id, m);
    });
  }

  if (local && Array.isArray(local)) {
    local.forEach((m) => {
      if (m && m.id && !map.has(m.id)) {
        map.set(m.id, m);
      }
    });
  }

  // Sắp xếp ván mới nhất lên đầu và lấy tối đa 20 ván
  return Array.from(map.values())
    .sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime())
    .slice(0, MAX_MATCH_HISTORY);
}
