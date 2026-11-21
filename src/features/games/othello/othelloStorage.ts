import { OthelloGameState } from './types';

const STORAGE_KEY = 'kombat_othello_save_v1';

export function saveOthelloLocalGame(state: OthelloGameState): void {
  if (typeof window === 'undefined') return;
  if (state.mode === 'online' || state.isGameOver) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function loadOthelloLocalGame(): OthelloGameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OthelloGameState;
    if (!parsed || !Array.isArray(parsed.board) || parsed.board.length !== 8) {
      return null;
    }
    if (parsed.isGameOver) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearOthelloLocalGame(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}
