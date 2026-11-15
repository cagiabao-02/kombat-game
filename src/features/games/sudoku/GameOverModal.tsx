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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
      <div className="pixel-box-lg w-full max-w-sm bg-[#FFFDF8] p-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-rose-300 text-rose-950 border-2 border-zinc-900 shadow-pixel-sm mb-4 animate-pulse">
          <AlertOctagon className="h-9 w-9" />
        </div>

        <h3 className="font-pixel text-2xl font-bold text-zinc-950 uppercase">
          GAME OVER! {t.sudoku.gameOverTitle}
        </h3>

        <p className="mt-2 text-xs sm:text-sm font-mono text-zinc-600 leading-relaxed">
          {t.sudoku.gameOverDesc}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onReset}
            className="pixel-btn inline-flex w-full items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-amber-300"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t.sudoku.tryAgain}</span>
          </button>

          <button
            type="button"
            onClick={onNewGame}
            className="pixel-btn inline-flex w-full items-center justify-center gap-2 bg-white hover:bg-zinc-100 py-2.5 text-sm font-bold text-zinc-900"
          >
            <Plus className="h-4 w-4 text-indigo-700" />
            <span>{t.sudoku.newGame}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
