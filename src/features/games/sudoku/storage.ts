import { SavedSudokuGame } from './types';

const SUDOKU_STORAGE_KEY = 'togame_sudoku_active_game';

export function saveSudokuGame(game: SavedSudokuGame): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SUDOKU_STORAGE_KEY, JSON.stringify(game));
    }
  } catch (error) {
    console.error('Failed to save Sudoku game to localStorage', error);
  }
}

export function loadSudokuGame(): SavedSudokuGame | null {
  try {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(SUDOKU_STORAGE_KEY);
    if (!data) return null;
    return JSON.parse(data) as SavedSudokuGame;
  } catch (error) {
    console.error('Failed to load Sudoku game from localStorage', error);
    return null;
  }
}

export function clearSavedSudokuGame(): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(SUDOKU_STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear Sudoku game from localStorage', error);
  }
}

