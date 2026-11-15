'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { Minesweeper } from '@/features/games/minesweeper/Minesweeper';

export default function MinesweeperPage() {
  const { language } = useLanguage();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="mx-auto max-w-2xl px-3 py-6 sm:py-8">
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
            {language === 'vi' ? 'HƯỚNG DẪN CHƠI DÒ MÌN' : 'HOW TO PLAY MINESWEEPER'}
          </h4>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
            <li>
              ⛏️ <strong>{language === 'vi' ? 'Mục tiêu' : 'Objective'}</strong>:{' '}
              {language === 'vi'
                ? 'Mở tất cả các ô an toàn trên bàn cờ mà không kích nổ bất kỳ quả mìn nào.'
                : 'Clear all safe cells on the board without detonating any mines.'}
            </li>
            <li>
              🛡️ <strong>{language === 'vi' ? 'Khởi đầu an toàn' : 'Safe Start'}</strong>:{' '}
              {language === 'vi'
                ? 'Nước click đầu tiên không bao giờ có mìn và luôn mở ra một khoảng trống an toàn.'
                : 'Your first click is 100% safe and always opens a starting area.'}
            </li>
            <li>
              🔢 <strong>{language === 'vi' ? 'Con số chỉ dẫn' : 'Clue Numbers'}</strong>:{' '}
              {language === 'vi'
                ? 'Số hiển thị trên ô cho biết chính xác có bao nhiêu quả mìn nằm trong 8 ô bao quanh nó.'
                : 'A number on a cell indicates exactly how many mines are adjacent to it.'}
            </li>
            <li>
              🚩 <strong>{language === 'vi' ? 'Cắm cờ đánh dấu' : 'Flagging'}</strong>:{' '}
              {language === 'vi'
                ? 'Nhấp chuột phải (hoặc chạm giữ trên điện thoại) để cắm cờ đánh dấu vị trí nghi có mìn.'
                : 'Right-click (or long press on mobile) to plant a flag on suspected mines.'}
            </li>
            <li>
              ⚡ <strong>{language === 'vi' ? 'Mở nhanh (Chord)' : 'Quick Reveal'}</strong>:{' '}
              {language === 'vi'
                ? 'Khi một ô số đã có đủ số cờ tương ứng quanh nó, nhấp vào ô đó để tự động mở các ô còn lại.'
                : 'When a numbered cell has enough flags around it, click it to quickly clear remaining neighbors.'}
            </li>
          </ul>
        </div>
      )}

      {/* Arcade Title Pill */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-zinc-900 text-amber-300 px-3 py-1 text-xs font-bold font-pixel">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>16-BIT RETRO PUZZLE • CLASSIC</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl font-bold text-zinc-950 uppercase mt-1">
          {language === 'vi' ? 'DÒ MÌN' : 'MINESWEEPER'}
        </h1>
      </div>

      {/* Main Minesweeper Game */}
      <Minesweeper />
    </div>
  );
}
