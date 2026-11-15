'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Game2048 } from '@/features/games/game2048/Game2048';

export default function Game2048Page() {
  const { language } = useLanguage();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-8">
      {/* Header Bar */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="pixel-btn inline-flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 hover:bg-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === 'vi' ? 'Về sảnh chính' : 'Back to Lobby'}</span>
        </Link>

        {/* Toggle Rules Accordion */}
        <button
          type="button"
          onClick={() => setShowRules((prev) => !prev)}
          className="pixel-btn inline-flex items-center gap-1.5 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200"
        >
          <BookOpen className="h-3.5 w-3.5 text-amber-800" />
          <span>{language === 'vi' ? 'Luật chơi' : 'How to Play'}</span>
          {showRules ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Rules Dropdown Box */}
      {showRules && (
        <div className="pixel-box mb-6 bg-[#FFFDF8] p-4 text-xs sm:text-sm font-mono text-zinc-800">
          <h4 className="font-pixel font-bold text-amber-900 text-base mb-1 uppercase">
            {language === 'vi' ? 'HƯỚNG DẪN CHƠI 2048 ARCADE' : 'HOW TO PLAY 2048 ARCADE'}
          </h4>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
            <li>
              🔢 <strong>{language === 'vi' ? 'Trượt & Hợp nhất' : 'Slide & Merge'}</strong>:{' '}
              {language === 'vi'
                ? 'Khi 2 ô có cùng số chạm nhau khi trượt, chúng sẽ gộp thành 1 ô có giá trị gấp đôi (2+2=4, 4+4=8, 8+8=16...)'
                : 'When two tiles of the same number touch, they merge into one with double the value (2+2=4, 4+4=8, 8+8=16...)'}
            </li>
            <li>
              🏆 <strong>{language === 'vi' ? 'Mục tiêu chiến thắng' : 'Victory Goal'}</strong>:{' '}
              {language === 'vi'
                ? 'Hợp nhất cho đến khi tạo được viên gạch 2048 vàng! Sau đó, bạn có thể tiếp tục chơi để lập kỷ lục 4096 hoặc cao hơn.'
                : 'Merge tiles to reach the golden 2048 tile! You can keep playing to aim for 4096 or higher.'}
            </li>
            <li>
              ↩️ <strong>{language === 'vi' ? 'Lùi 1 bước (Undo)' : 'Undo Move'}</strong>:{' '}
              {language === 'vi'
                ? 'Nếu lỡ đi sai, bạn luôn có thể bấm "Về 1 bước" (hoặc bấm phím Z/U trên bàn phím).'
                : 'Made a mistake? Press Undo (or press Z/U on keyboard) to roll back 1 move.'}
            </li>
            <li>
              ⚠️ <strong>{language === 'vi' ? 'Kết thúc (Game Over)' : 'Game Over'}</strong>:{' '}
              {language === 'vi'
                ? 'Ván chơi kết thúc khi toàn bộ bàn 4x4 đầy và không còn nước đi hợp lệ nào.'
                : 'The game ends when the 4x4 grid is completely full and no valid merges remain.'}
            </li>
          </ul>
          <div className="mt-2.5 pt-2 border-t border-dashed border-zinc-300 text-amber-950 font-semibold text-xs">
            {language === 'vi'
              ? 'Trên PC: Dùng các phím Mũi tên hoặc W, A, S, D để trượt. Trên Mobile: Dùng D-pad hoặc vuốt trực tiếp trên bàn cờ.'
              : 'On PC: Use Arrow keys or WASD to slide. On Mobile: Use on-screen D-pad or swipe directly on the board.'}
          </div>
        </div>
      )}

      {/* Arcade Title Pill */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-zinc-900 text-amber-300 px-3 py-1 text-xs font-bold font-pixel">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>16-BIT NEO-ARCADE • PUZZLE</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl font-bold text-zinc-950 uppercase mt-1">
          {language === 'vi' ? '2048 PIXEL ARCADE' : '2048 PIXEL ARCADE'}
        </h1>
      </div>

      {/* Main 2048 Game */}
      <Game2048 />
    </div>
  );
}
