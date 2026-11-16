'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp } from 'lucide-react';
import { TRexGame } from '@/features/games/dinoRunner/TRexGame';

export default function TRexRunnerPage() {
  const { language } = useLanguage();
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-3 py-6 sm:py-8">
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
        <div className="pixel-box mb-6 bg-[#FFFDF8] p-4 text-xs sm:text-sm font-mono text-zinc-800 animate-in fade-in duration-150">
          <h4 className="font-pixel font-bold text-amber-900 text-base mb-1.5 uppercase">
            {language === 'vi' ? 'HƯỚNG DẪN CHƠI KHỦNG LONG T-REX' : 'HOW TO PLAY T-REX RUNNER'}
          </h4>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
            <li>
              🦖 <strong>{language === 'vi' ? 'Mục tiêu' : 'Goal'}</strong>:{' '}
              {language === 'vi'
                ? 'Điều khiển chú khủng long T-Rex chạy càng xa càng tốt, né tránh bụi xương rồng và chim cổ đại để lập kỷ lục điểm cao.'
                : 'Help T-Rex run as far as possible, dodging desert cacti and prehistoric pterodactyls.'}
            </li>
            <li>
              ⬆️ <strong>{language === 'vi' ? 'Nhảy cao' : 'Jump'}</strong>:{' '}
              {language === 'vi'
                ? 'Nhấn phím Space, Mũi tên Lên (⬆️), hoặc chạm vào màn hình để nhảy qua các bụi xương rồng và chim bay thấp.'
                : 'Press Space, Up Arrow (⬆️), or tap the screen to leap over cacti and low birds.'}
            </li>
            <li>
              ⬇️ <strong>{language === 'vi' ? 'Cúi người' : 'Duck'}</strong>:{' '}
              {language === 'vi'
                ? 'Nhấn và giữ Mũi tên Xuống (⬇️) hoặc nút Cúi Né để luồn qua chim bay ngang tầm mắt. Khi đang ở trên không, cúi người sẽ giúp tiếp đất nhanh hơn.'
                : 'Hold Down Arrow (⬇️) or hold the Duck button to duck under flying pterodactyls. Fast drops in mid-air.'}
            </li>
            <li>
              🌙 <strong>{language === 'vi' ? 'Chu kỳ Ngày & Đêm' : 'Day & Night Cycle'}</strong>:{' '}
              {language === 'vi'
                ? 'Cứ mỗi 700 điểm, sa mạc sẽ chuyển dần sang màn đêm đầy sao huyền ảo với mặt trăng lưỡi liềm.'
                : 'Every 700 points, the desert shifts smoothly into a starry night sky with a crescent moon.'}
            </li>
            <li>
              🔔 <strong>{language === 'vi' ? 'Mốc 100 điểm' : '100-Point Milestone'}</strong>:{' '}
              {language === 'vi'
                ? 'Mỗi khi vượt qua bội số 100 điểm, điểm số sẽ nhấp nháy kèm âm thanh bíp bíp chúc mừng.'
                : 'Every 100 points, score flashes with retro arcade milestone chimes.'}
            </li>
          </ul>
        </div>
      )}

      {/* Main TRex Game Canvas */}
      <TRexGame />
    </div>
  );
}
