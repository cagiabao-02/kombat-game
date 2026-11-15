import { supabase } from '@/lib/supabase/client';
import { SudokuDifficulty } from './types';

export interface SudokuDifficultyStats {
  bestTimeSeconds: number | null;
  completedCount: number;
}

export interface SudokuStats {
  totalSolved: number;
  easy: SudokuDifficultyStats;
  medium: SudokuDifficultyStats;
  hard: SudokuDifficultyStats;
  lastUpdated?: number;
}

const STORAGE_KEY = 'kombat_sudoku_stats';

const DEFAULT_STATS: SudokuStats = {
  totalSolved: 0,
  easy: { bestTimeSeconds: null, completedCount: 0 },
  medium: { bestTimeSeconds: null, completedCount: 0 },
  hard: { bestTimeSeconds: null, completedCount: 0 },
};

export function getSudokuStats(): SudokuStats {
  if (typeof window === 'undefined') return DEFAULT_STATS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      easy: { ...DEFAULT_STATS.easy, ...(parsed.easy || {}) },
      medium: { ...DEFAULT_STATS.medium, ...(parsed.medium || {}) },
      hard: { ...DEFAULT_STATS.hard, ...(parsed.hard || {}) },
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function saveSudokuStatsLocally(stats: SudokuStats): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch (e) {
    console.error('Failed to save sudoku stats to localStorage:', e);
  }
}

export async function syncSudokuStatsToCloud(stats: SudokuStats): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.auth.updateUser({
        data: { sudoku_stats: stats },
      });
    }
  } catch (err) {
    console.error('Failed to sync sudoku stats to cloud:', err);
  }
}

export interface SudokuRecordResult {
  stats: SudokuStats;
  isNewRecord: boolean;
  previousBest: number | null;
}

export function formatSudokuTime(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return '--:--';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function getBestTimeForDifficulty(diff: SudokuDifficulty): number | null {
  const stats = getSudokuStats();
  return stats[diff]?.bestTimeSeconds ?? null;
}

export function recordSudokuVictory(
  difficulty: SudokuDifficulty,
  timeSeconds: number
): SudokuRecordResult {
  const current = getSudokuStats();
  const currentDiff = current[difficulty] || { bestTimeSeconds: null, completedCount: 0 };
  const prevBest = currentDiff.bestTimeSeconds;
  const isNewRecord = prevBest === null || timeSeconds < prevBest;
  const newBestTime = isNewRecord ? timeSeconds : prevBest;

  const updatedStats: SudokuStats = {
    ...current,
    totalSolved: current.totalSolved + 1,
    [difficulty]: {
      bestTimeSeconds: newBestTime,
      completedCount: currentDiff.completedCount + 1,
    },
    lastUpdated: Date.now(),
  };

  saveSudokuStatsLocally(updatedStats);
  syncSudokuStatsToCloud(updatedStats).catch(() => {});

  // Tự động đẩy kỷ lục lên bảng xếp hạng Supabase
  import('@/features/leaderboard/leaderboardService')
    .then((mod) => mod.syncLeaderboardScoreForGame('sudoku'))
    .catch(() => {});

  return {
    stats: updatedStats,
    isNewRecord,
    previousBest: prevBest,
  };
}

