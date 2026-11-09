'use client';

import React from 'react';
import { Play, Pause, RotateCcw, Plus, AlertCircle } from 'lucide-react';
import { SudokuDifficulty } from './types';
import { useLanguage } from '@/i18n/LanguageContext';

interface SudokuControlsProps {
  difficulty: SudokuDifficulty;
  elapsedSeconds: number;
  mistakes: number;
  isPaused: boolean;
  highlightErrors: boolean;
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
  onChangeDifficulty,
  onTogglePause,
  onReset,
  onNewGame,
  onToggleHighlightErrors,
}: SudokuControlsProps) {
  const { t } = useLanguage();

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
        <div className="inline-flex rounded-xl bg-gray-200/80 p-1 text-xs font-bold shadow-2xs">
          {difficulties.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => onChangeDifficulty(d)}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 min-h-[34px] transition-all active:scale-95 ${
                difficulty === d
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
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
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 min-h-[36px] text-xs font-bold border transition-colors shadow-2xs ${
              mistakes > 0
                ? 'bg-red-50 text-red-600 border-red-200 animate-pulse'
                : 'bg-white text-gray-700 border-gray-200'
            }`}
            title="Số lần phạm lỗi trùng (Tối đa 3 lần)"
          >
            <span>{t.sudoku.mistakes.replace('{count}', mistakes.toString())}</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-2.5 sm:px-3 py-1.5 min-h-[36px] shadow-2xs text-xs sm:text-sm font-bold text-gray-800">
            <span className="font-mono">{formatTime(elapsedSeconds)}</span>
            <button
              type="button"
              onClick={onTogglePause}
              className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-500 hover:text-indigo-600 hover:bg-gray-100 transition-colors active:scale-95"
              title={isPaused ? t.sudoku.resume : t.sudoku.pause}
              aria-label={isPaused ? t.sudoku.resume : t.sudoku.pause}
            >
              {isPaused ? <Play className="h-3.5 w-3.5 fill-current text-indigo-600" /> : <Pause className="h-3.5 w-3.5" />}
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
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 min-h-[38px] font-bold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            <Plus className="h-4 w-4 text-indigo-600" />
            <span>{t.sudoku.newGame}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 min-h-[38px] font-bold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition-all focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
          >
            <RotateCcw className="h-3.5 w-3.5 text-gray-500" />
            <span>{t.sudoku.reset}</span>
          </button>
        </div>

        {/* Toggle highlight conflict toggle */}
        <button
          type="button"
          onClick={onToggleHighlightErrors}
          className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-2 min-h-[38px] font-bold transition-all shadow-2xs active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none ${
            highlightErrors
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
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

