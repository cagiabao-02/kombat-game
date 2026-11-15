'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { BrickBreakerGame } from '@/features/games/brickBreaker/BrickBreakerGame';

export default function BrickBreakerPage() {
  const { language } = useLanguage();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="mx-auto max-w-xl px-3 py-6 sm:py-8">
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
            {language === 'vi' ? 'HƯỚNG DẪN CHƠI PHÁ GẠCH' : 'HOW TO PLAY BRICK BREAKER'}
          </h4>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
            <li>
              🧱 <strong>{language === 'vi' ? 'Mục tiêu' : 'Goal'}</strong>:{' '}
              {language === 'vi'
                ? 'Điều khiển thanh trượt hứng bóng và đập vỡ toàn bộ các khối gạch trên màn hình để qua màn.'
                : 'Control the paddle to bounce the ball and smash all bricks to advance stages.'}
            </li>
            <li>
              🕹️ <strong>{language === 'vi' ? 'Điều khiển' : 'Controls'}</strong>:{' '}
              {language === 'vi'
                ? 'Trên PC: Di chuột hoặc bấm phím A/D (Mũi tên Trái/Phải). Bấm Phím Space để phóng bóng hoặc bắn đạn. Trên Mobile: Kéo vuốt ngón tay trực tiếp trên khung game.'
                : 'On PC: Move mouse or use A/D (Left/Right arrows). Press Spacebar to launch/fire. On Mobile: Drag finger on screen.'}
            </li>
            <li>
              🎁 <strong>{language === 'vi' ? 'Vật phẩm trợ giúp' : 'Power-ups'}</strong>:{' '}
              {language === 'vi'
                ? 'Gạch vỡ có thể rơi ra: ↔️ (Kéo dài thanh trượt), ⚡ (Nhân đôi số bóng / Multi-Ball), 🔫 (Súng bắn Laser), 💖 (Thêm 1 mạng).'
                : 'Broken bricks may drop: ↔️ (Expand Paddle), ⚡ (Duplicate Balls / Multi-Ball), 🔫 (Laser Gun), 💖 (Extra Life).'}
            </li>
            <li>
              💣 <strong>{language === 'vi' ? 'Gạch đặc biệt' : 'Special Bricks'}</strong>:{' '}
              {language === 'vi'
                ? 'Gạch thép màu xám cần đập 2 lần. Gạch bom màu tím phát nổ và phá hủy toàn bộ các khối gạch xung quanh.'
                : 'Steel bricks require 2 hits. Bomb bricks explode and destroy adjacent bricks.'}
            </li>
          </ul>
        </div>
      )}

      {/* Arcade Title Pill */}
      <div className="mb-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-zinc-900 text-amber-300 px-3 py-1 text-xs font-bold font-pixel">
          <Sparkles className="h-3.5 w-3.5 text-amber-300" />
          <span>16-BIT NEO-ARCADE • ACTION</span>
        </div>
        <h1 className="font-pixel text-2xl sm:text-3xl font-bold text-zinc-950 uppercase mt-1">
          {language === 'vi' ? 'PHÁ GẠCH PIXEL' : 'BRICK BREAKER'}
        </h1>
      </div>

      {/* Main Brick Breaker Game */}
      <BrickBreakerGame />
    </div>
  );
}
