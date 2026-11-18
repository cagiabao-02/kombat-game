import { GoGameState } from './types';

const STORAGE_KEY = 'kombat_go_active_state';

/**
 * Lưu trạng thái ván cờ vây đang chơi dở
 */
export function saveGoState(state: GoGameState | null): void {
  if (typeof window === 'undefined') return;
  try {
    if (!state || state.isGameOver) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
  } catch {}
}

/**
 * Tải lại trạng thái ván cờ vây đã lưu
 */
export function loadGoState(): GoGameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.board && Array.isArray(parsed.board)) {
      return parsed as GoGameState;
    }
  } catch {}
  return null;
}

/**
 * Xóa ván cờ vây đã lưu
 */
export function clearGoState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
