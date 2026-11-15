'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { SnakeGame } from '@/features/games/snake/SnakeGame';

export default function SnakePage() {
  const { language } = useLanguage();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-4 py-6 sm:py-8">
      {/* Header bar */}
      <div className="mb-4 flex items-center justify-between">
        <Link
          href="/"
          className="pixel-btn inline-flex items-center gap-1.5 bg-white px-3 py-1.5 text-xs font-bold text-zinc-900 hover:bg-amber-100"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{language === 'vi' ? 'Về sảnh chính' : 'Back to Lobby'}</span>
        </Link>

        {/* Toggle Rules accordion */}
        <button
          type="button"
          onClick={() => setShowRules((prev) => !prev)}
          className="pixel-btn inline-flex items-center gap-1.5 bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-950 hover:bg-emerald-200"
        >
          <BookOpen className="h-3.5 w-3.5 text-emerald-800" />
          <span>{language === 'vi' ? 'Luật chơi' : 'How to Play'}</span>
          {showRules ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Rules Dropdown Box */}
      {showRules && (
        <div className="pixel-box mb-6 bg-[#FFFDF8] p-4 text-xs sm:text-sm font-mono text-zinc-800">
          <h4 className="font-pixel font-bold text-emerald-800 text-base mb-1 uppercase">
            {language === 'vi' ? 'LUẬT CHƠI RẮN SĂN MỒI RETRO' : '8-BIT SNAKE RULES'}
          </h4>
          <ul className="list-disc list-inside space-y-1 leading-relaxed">
            <li>
              🍎 <strong>{language === 'vi' ? 'Táo đỏ' : 'Red Apple'}</strong>: +10 điểm, thân rắn dài thêm 1 đốt.
            </li>
            <li>
              🌟 <strong>{language === 'vi' ? 'Táo vàng đặc biệt' : 'Golden Apple'}</strong>: +50 điểm! Xuất hiện chớp nhoáng 8 giây, hãy nhanh tay ăn trước khi biến mất.
            </li>
            <li>
              ⚡ <strong>{language === 'vi' ? 'Tốc độ tăng dần' : 'Speed Ramps Up'}</strong>: Điểm càng cao, chú rắn di chuyển càng nhanh.
            </li>
            <li>
              ⚠️ <strong>{language === 'vi' ? 'Thua cuộc' : 'Game Over'}</strong>: Đâm vào 4 bức tường xung quanh hoặc tự cắn vào thân mình.
            </li>
          </ul>
          <div className="mt-2 pt-2 border-t border-dashed border-zinc-300 text-emerald-900 font-semibold text-xs">
            {language === 'vi'
              ? 'Trên PC: Dùng phím mũi tên hoặc W, A, S, D. Phím Space để tạm dừng. Trên Mobile: Dùng D-pad hoặc vuốt màn hình.'
              : 'On PC: Use Arrow keys or WASD. Space to pause. On Mobile: Use on-screen D-pad or swipe.'}
          </div>
        </div>
      )}

      {/* Arcade Title Pill */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-zinc-900 text-amber-300 px-3 py-1 text-xs font-bold font-pixel">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>8-BIT RETRO ARCADE • SPEED RUN</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl font-bold text-zinc-950 uppercase mt-1">
          {language === 'vi' ? 'RẮN SĂN MỒI' : 'PIXEL SNAKE'}
        </h1>
      </div>

      {/* Main Snake Game */}
      <SnakeGame />
    </div>
  );
}
