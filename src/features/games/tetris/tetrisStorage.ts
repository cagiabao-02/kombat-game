import { TetrisSavedState } from './types';

const TETRIS_ACTIVE_STATE_KEY = 'kombat_tetris_active_state_v1';

export function saveTetrisState(state: TetrisSavedState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(TETRIS_ACTIVE_STATE_KEY, JSON.stringify(state));
  } catch {}
}

export function loadTetrisState(): TetrisSavedState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(TETRIS_ACTIVE_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TetrisSavedState;
    if (!parsed || !Array.isArray(parsed.board) || !parsed.currentPiece) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearTetrisState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(TETRIS_ACTIVE_STATE_KEY);
  } catch {}
}
