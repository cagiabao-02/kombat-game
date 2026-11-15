'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Plus, AlertCircle, Trophy } from 'lucide-react';
import { SudokuDifficulty } from './types';
import { useLanguage } from '@/i18n/LanguageContext';
import { formatSudokuTime } from './sudokuStatsService';

interface SudokuControlsProps {
  difficulty: SudokuDifficulty;
  elapsedSeconds: number;
  mistakes: number;
  isPaused: boolean;
  highlightErrors: boolean;
  bestTimeSeconds?: number | null;
  onChangeDifficulty: (diff: SudokuDifficulty) => void;
  onTogglePause: () => void;
  onReset: () => void;
  onNewGame: () => void;
  onToggleHighlightErrors: () => void;
}

export function SudokuControls({
  difficulty,
  elapsedSeconds,
  mistakes,
  isPaused,
  highlightErrors,
  bestTimeSeconds,
  onChangeDifficulty,
  onTogglePause,
  onReset,
  onNewGame,
  onToggleHighlightErrors,
}: SudokuControlsProps) {
  const { language, t } = useLanguage();

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const difficulties: SudokuDifficulty[] = ['easy', 'medium', 'hard'];

  return (
    <div className="mx-auto w-full max-w-[460px] pb-4">
      {/* Top Bar: Difficulty Tabs & Timer */}
      <div className="flex items-center justify-between gap-2 mb-3">
        {/* Difficulty Tabs */}
        <div className="inline-flex gap-1.5">
          {difficulties.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChangeDifficulty(d)}
              className={`pixel-btn px-2.5 sm:px-3 py-1.5 min-h-[38px] text-xs font-bold ${
                difficulty === d
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              {t.sudoku.difficulty[d]}
            </button>
          ))}
        </div>

        {/* Timer & Mistakes & Pause Button */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mistakes Counter */}
          <div
            className={`pixel-badge flex items-center gap-1 px-2.5 py-1.5 min-h-[38px] text-xs font-bold ${
              mistakes > 0
                ? 'bg-rose-200 text-rose-900 animate-pulse'
                : 'bg-white text-zinc-800'
            }`}
            title="Số lần phạm lỗi trùng (Tối đa 3 lần)"
          >
            <span>{t.sudoku.mistakes.replace('{count}', mistakes.toString())}</span>
          </div>

          <div className="pixel-badge flex items-center gap-1.5 bg-[#D4DFB8] px-2.5 sm:px-3 py-1 min-h-[38px] text-xs sm:text-sm font-bold text-zinc-950">
            <span className="font-pixel tracking-wider">{formatTime(elapsedSeconds)}</span>
            <button
              type="button"
              onClick={onTogglePause}
              className="flex h-6 w-6 items-center justify-center bg-zinc-900 text-amber-300 hover:bg-indigo-700"
              title={isPaused ? t.sudoku.resume : t.sudoku.pause}
              aria-label={isPaused ? t.sudoku.resume : t.sudoku.pause}
            >
              {isPaused ? <Play className="h-3 w-3 fill-current" /> : <Pause className="h-3 w-3" />}
            </button>
          </div>
        </div>
      </div>

      {/* Secondary Bar: Action buttons & Error Highlight toggle */}
      <div className="flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNewGame}
            className="pixel-btn inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 px-3 py-2 min-h-[40px] font-bold text-amber-300 outline-none"
          >
            <Plus className="h-4 w-4" />
            <span>{t.sudoku.newGame}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="pixel-btn inline-flex items-center gap-1.5 bg-white hover:bg-amber-100 px-3 py-2 min-h-[40px] font-bold text-zinc-900 outline-none"
          >
            <RotateCcw className="h-3.5 w-3.5 text-zinc-700" />
            <span>{t.sudoku.reset}</span>
          </button>
        </div>

        {/* Best time for selected difficulty badge */}
        <div
          className="pixel-badge flex items-center gap-1.5 bg-amber-200/90 px-2.5 py-1.5 min-h-[40px] text-xs font-bold text-amber-950 border-2 border-zinc-900 shadow-pixel-xs"
          title={
            language === 'vi'
              ? `Kỷ lục nhanh nhất ở cấp độ ${t.sudoku.difficulty[difficulty]}`
              : `Best time for ${t.sudoku.difficulty[difficulty]}`
          }
        >
          <Trophy className="h-3.5 w-3.5 text-amber-800 shrink-0" />
          <span className="font-pixel text-[10px] text-amber-900 uppercase hidden sm:inline">
            {language === 'vi' ? 'KỶ LỤC' : 'BEST'}:
          </span>
          <span className="font-mono font-bold text-zinc-950">
            {formatSudokuTime(bestTimeSeconds)}
          </span>
        </div>

        {/* Toggle highlight conflict toggle */}
        <button
          type="button"
          onClick={onToggleHighlightErrors}
          className={`pixel-btn inline-flex items-center gap-1.5 px-3 py-2 min-h-[40px] font-bold outline-none ${
            highlightErrors
              ? 'bg-rose-200 text-rose-900'
              : 'bg-zinc-200 text-zinc-700 hover:bg-zinc-300'
          }`}
          title="Bật/Tắt báo lỗi trùng số"
        >
          <AlertCircle className="h-4 w-4" />
          <span className="hidden sm:inline">{t.sudoku.checkErrors}</span>
        </button>
      </div>
    </div>
  );
}
