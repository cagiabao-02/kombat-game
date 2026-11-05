'use client';

import React from 'react';
import { Trophy, Sparkles, RotateCcw } from 'lucide-react';
import { SudokuDifficulty } from './types';
import { useLanguage } from '@/i18n/LanguageContext';

interface VictoryModalProps {
  isOpen: boolean;
  difficulty: SudokuDifficulty;
  elapsedSeconds: number;
  onPlayAgain: () => void;
  onClose: () => void;
}

export function VictoryModal({
  isOpen,
  difficulty,
  elapsedSeconds,
  onPlayAgain,
  onClose,
}: VictoryModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const mins = Math.floor(elapsedSeconds / 60);
  const secs = elapsedSeconds % 60;
  const timeFormatted = `${mins}m ${secs}s`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4 animate-bounce">
          <Trophy className="h-8 w-8" />
        </div>

        <h3 className="text-xl font-black text-gray-900">
          {t.sudoku.victoryTitle}
        </h3>

        <p className="mt-2 text-sm text-gray-600">
          {t.sudoku.victoryDesc
            .replace('{difficulty}', t.sudoku.difficulty[difficulty])
            .replace('{time}', timeFormatted)}
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.sudoku.playAgain}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex w-full items-center justify-center py-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
}

