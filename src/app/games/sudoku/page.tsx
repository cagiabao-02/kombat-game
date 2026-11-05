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
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{t.common.backToLobby}</span>
        </Link>

        {/* Toggle Rules accordian */}
        <button
          type="button"
          onClick={() => setShowRules((prev) => !prev)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 text-indigo-600" />
          <span>{t.sudoku.rulesTitle}</span>
          {showRules ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Rules Dropdown Box */}
      {showRules && (
        <div className="mb-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-4 text-xs sm:text-sm text-indigo-950">
          <h4 className="font-bold text-indigo-900 mb-1">{t.sudoku.rulesTitle}</h4>
          <p className="leading-relaxed">{t.sudoku.rulesContent}</p>
          <div className="mt-2 text-indigo-800/80">
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
