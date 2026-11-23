import { WordleGameState, WordleMode } from './types';

function getStorageKey(mode: WordleMode): string {
  return mode === 'daily' ? 'kombat_wordle_daily_v1' : 'kombat_wordle_endless_v1';
}

export function saveWordleGame(state: WordleGameState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(state.mode), JSON.stringify(state));
  } catch {}
}

export function loadWordleGame(mode: WordleMode, todayDate: string): WordleGameState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(getStorageKey(mode));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as WordleGameState;
    if (!parsed || !parsed.targetWord || !Array.isArray(parsed.guesses)) {
      return null;
    }
    if (mode === 'daily' && parsed.dailyDate !== todayDate) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}
