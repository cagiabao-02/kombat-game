'use client';

import React from 'react';
import { Trophy, Sparkles } from 'lucide-react';
import { SudokuDifficulty } from './types';
import { useLanguage } from '@/i18n/LanguageContext';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in overflow-hidden">
      {/* Pixel Art Confetti Burst on Victory */}
      <PixelFxOverlay active={isOpen} />

      <div className="pixel-box-lg relative w-full max-w-sm bg-[#FFFDF8] p-6 text-center z-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center bg-amber-300 text-zinc-950 border-2 border-zinc-900 shadow-pixel-sm mb-4 animate-bounce">
          <Trophy className="h-8 w-8" />
        </div>

        <h3 className="font-pixel text-2xl font-bold text-zinc-950 uppercase">
          STAGE CLEAR! {t.sudoku.victoryTitle}
        </h3>

        <p className="mt-2 text-xs sm:text-sm font-mono text-zinc-600">
          {t.sudoku.victoryDesc
            .replace('{difficulty}', t.sudoku.difficulty[difficulty])
            .replace('{time}', timeFormatted)}
        </p>

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onPlayAgain}
            className="pixel-btn inline-flex w-full items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-amber-300"
          >
            <Sparkles className="h-4 w-4" />
            <span>{t.sudoku.playAgain}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="pixel-btn inline-flex w-full items-center justify-center bg-white hover:bg-zinc-100 py-2 text-xs font-bold text-zinc-800"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    </div>
  );
}
