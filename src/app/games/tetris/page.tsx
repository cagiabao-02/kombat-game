'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
} from 'lucide-react';
import { TetrisGame } from '@/features/games/tetris/TetrisGame';

export default function TetrisPage() {
  const { language } = useLanguage();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-2 py-4 sm:px-4 sm:py-6">
      {/* Header Bar */}
      <div className="mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="pixel-btn inline-flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 hover:bg-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === 'vi' ? 'Về sảnh chính' : 'Back to Lobby'}</span>
        </Link>

        <button
          type="button"
          onClick={() => setShowRules((prev) => !prev)}
          className="pixel-btn inline-flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200"
        >
          <BookOpen className="h-3.5 w-3.5 text-amber-800" />
          <span>{language === 'vi' ? 'Hướng dẫn Tetris' : 'How to Play'}</span>
          {showRules ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Rules Accordion */}
      {showRules && (
        <div className="pixel-box mb-4 bg-[#FFFDF8] p-4 text-xs sm:text-sm font-mono text-zinc-800 shadow-[3px_3px_0px_#000]">
          <h4 className="font-pixel font-bold text-indigo-800 text-base mb-2 uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            {language === 'vi'
              ? 'LUẬT CHƠI TETRIS CỔ ĐIỂN'
              : 'CLASSIC TETRIS GUIDE'}
          </h4>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
            <li>
              🧱{' '}
              <strong>
                {language === 'vi' ? 'Xếp kín hàng ngang' : 'Clear Full Lines'}
              </strong>
              :{' '}
              {language === 'vi'
                ? 'Lấp đầy toàn bộ 10 ô trên một hàng ngang để xóa dòng và ghi điểm.'
                : 'Fill all 10 cells in a horizontal row to clear it and earn points.'}
            </li>
            <li>
              🔥{' '}
              <strong>
                {language === 'vi' ? 'TETRIS (Xóa 4 dòng)' : 'TETRIS (4 Lines)'}
              </strong>
              :{' '}
              {language === 'vi'
                ? 'Dùng thanh chữ I xóa cùng lúc 4 hàng ngang để nhận thưởng cực lớn (800 × Level)!'
                : 'Clear 4 lines simultaneously with an I-piece for huge bonus points (800 × Level)!'}
            </li>
            <li>
              📦 <strong>HOLD</strong>:{' '}
              {language === 'vi'
                ? 'Cất 1 khối gạch sang ô dự trữ để dùng khi cần thiết (bấm C / Shift hoặc nút HOLD).'
                : 'Store 1 piece in reserve for later use (press C / Shift or tap HOLD).'}
            </li>
            <li>
              ⚡ <strong>Hard Drop</strong>:{' '}
              {language === 'vi'
                ? 'Bấm Space hoặc nút THẢ để cho gạch rơi thẳng xuống vị trí bóng mờ (Ghost Piece) và nhận thêm điểm thưởng.'
                : 'Press Space or tap DROP to slam the piece directly onto its ghost position for bonus points.'}
            </li>
          </ul>
        </div>
      )}

      {/* Main Game Component */}
      <TetrisGame />
    </div>
  );
}
