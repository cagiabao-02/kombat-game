'use client';

import React from 'react';
import { AlertOctagon, RotateCcw, Plus } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface GameOverModalProps {
  isOpen: boolean;
  onReset: () => void;
  onNewGame: () => void;
}

export function GameOverModal({ isOpen, onReset, onNewGame }: GameOverModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm rounded-3xl border border-red-200 bg-white p-6 text-center shadow-2xl">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4 animate-pulse">
          <AlertOctagon className="h-9 w-9" />
        </div>

        <h3 className="text-xl font-black text-gray-900">
          {t.sudoku.gameOverTitle}
        </h3>

        <p className="mt-2 text-sm text-gray-600 leading-relaxed">
          {t.sudoku.gameOverDesc}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t.sudoku.tryAgain}</span>
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95"
          >
            <Plus className="h-4 w-4 text-indigo-600" />
            <span>{t.sudoku.newGame}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

