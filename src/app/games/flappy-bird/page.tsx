'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { FlappyBirdGame } from '@/features/games/flappyBird/FlappyBirdGame';

export default function FlappyBirdPage() {
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
          {showRules ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>
      </div>

      {/* Rules Dropdown Box */}
      {showRules && (
        <div className="pixel-box mb-6 bg-[#FFFDF8] p-4 text-xs sm:text-sm font-mono text-zinc-800 animate-in fade-in duration-150 border-2 border-zinc-900 shadow-pixel-sm">
          <h4 className="font-pixel font-bold text-amber-900 text-base mb-1.5 uppercase">
            {language === 'vi'
              ? 'HƯỚNG DẪN CHƠI FLAPPY BIRD'
              : 'HOW TO PLAY FLAPPY BIRD'}
          </h4>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
            <li>
              🐦 <strong>{language === 'vi' ? 'Mục tiêu' : 'Goal'}</strong>:{' '}
              {language === 'vi'
                ? 'Điều khiển chú chim vàng đập cánh bay lượn qua các khe hở của các cặp cột ống nước xanh mà không va chạm.'
                : 'Guide the yellow bird through gaps between green pipe obstacles without crashing.'}
            </li>
            <li>
              🪶 <strong>{language === 'vi' ? 'Cách điều khiển' : 'Controls'}</strong>:{' '}
              {language === 'vi'
                ? 'Nhấn phím Cách (Space), Mũi tên Lên (⬆️), hoặc chạm vào màn hình bất cứ lúc nào để chú chim vỗ cánh bay lên một nhịp.'
                : 'Press Space, Up Arrow (⬆️), or tap the screen to flap wings and gain altitude.'}
            </li>
            <li>
              🏅 <strong>{language === 'vi' ? 'Huy chương danh giá' : 'Medals'}</strong>:{' '}
              {language === 'vi'
                ? '🥉 Đồng (10đ) • 🥈 Bạc (20đ) • 🥇 Vàng (30đ) • 💎 Bạch Kim (40đ+).'
                : '🥉 Bronze (10pts) • 🥈 Silver (20pts) • 🥇 Gold (30pts) • 💎 Platinum (40pts+).'}
            </li>
            <li>
              🌙 <strong>{language === 'vi' ? 'Chu kỳ Ngày & Đêm' : 'Day & Night'}</strong>:{' '}
              {language === 'vi'
                ? 'Bầu trời chuyển biến nhịp nhàng giữa ngày và đêm sau mỗi 20 điểm ghi được.'
                : 'The sky alternates between brilliant daylight and tranquil starry night every 20 points.'}
            </li>
          </ul>
        </div>
      )}

      {/* Main Flappy Bird Game Component */}
      <FlappyBirdGame />
    </div>
  );
}
