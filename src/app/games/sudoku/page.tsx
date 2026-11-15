'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { SudokuGame } from '@/features/games/sudoku/SudokuGame';

export default function SudokuPage() {
  const { language, t } = useLanguage();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:py-8">
      {/* Back to Lobby link */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="pixel-btn inline-flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 hover:bg-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.common.backToLobby}</span>
        </Link>

        {/* Toggle Rules accordion */}
        <button
          type="button"
          onClick={() => setShowRules((prev) => !prev)}
          className="pixel-btn inline-flex items-center gap-1.5 bg-indigo-100 px-3 py-1.5 text-xs font-bold text-zinc-900 hover:bg-indigo-200"
        >
          <BookOpen className="h-3.5 w-3.5 text-indigo-700" />
          <span>{t.sudoku.rulesTitle}</span>
          {showRules ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Rules Dropdown Box */}
      {showRules && (
        <div className="pixel-box mb-6 bg-[#FFFDF8] p-4 text-xs sm:text-sm font-mono text-zinc-800">
          <h4 className="font-pixel font-bold text-indigo-800 text-base mb-1 uppercase">{t.sudoku.rulesTitle}</h4>
          <p className="leading-relaxed">{t.sudoku.rulesContent}</p>
          <div className="mt-2 pt-2 border-t border-dashed border-zinc-300 text-indigo-900 font-semibold">
            {language === 'vi'
              ? 'Mẹo: Dùng các phím mũi tên để di chuyển ô, phím 1-9 để điền, Delete/Backspace để xóa, hoặc Ctrl+Z / U để hoàn tác.'
              : 'Tip: Use arrow keys to navigate, 1-9 to place numbers, Delete/Backspace to erase, or Ctrl+Z / U to undo.'}
          </div>
        </div>
      )}

      {/* Main Sudoku Game Area */}
      <SudokuGame />
    </div>
  );
}
