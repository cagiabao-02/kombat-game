'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, BookOpen, ChevronDown, ChevronUp, Sparkles, Flame, ShieldCheck } from 'lucide-react';
import { BlockBlastGame } from '@/features/games/blockBlast/BlockBlastGame';

export default function BlockBlastPage() {
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
        <div className="pixel-box mb-4 bg-[#FFFDF8] p-4 text-xs sm:text-sm font-mono text-zinc-800">
          <h4 className="font-pixel font-bold text-amber-900 text-base mb-2 uppercase flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-600" />
            {language === 'vi' ? 'LUẬT CHƠI BLOCK BLAST' : 'HOW TO PLAY BLOCK BLAST'}
          </h4>
          <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
            <li>
              🧩 <strong>{language === 'vi' ? 'Đặt khối' : 'Place Blocks'}</strong>:{' '}
              {language === 'vi'
                ? 'Kéo hoặc chạm khối ở khay dưới để đặt vào bàn cờ 8x8. Đặt hết cả 3 khối để nhận 3 khối tiếp theo.'
                : 'Drag or tap a piece from the tray to place it on the 8x8 grid. Clear all 3 pieces to deal 3 new ones.'}
            </li>
            <li>
              💥 <strong>{language === 'vi' ? 'Nổ dòng' : 'Line Clears'}</strong>:{' '}
              {language === 'vi'
                ? 'Khi lấp đầy một hàng ngang hoặc một cột dọc (8 ô), chúng sẽ nổ tung và giải phóng chỗ trống.'
                : 'Filling a full row or column (8 blocks) triggers a blast that clears them and frees up space.'}
            </li>
            <li>
              <Flame className="inline w-3.5 h-3.5 text-amber-600 mr-1" />
              <strong>{language === 'vi' ? 'Combo chuỗi' : 'Combo Streaks'}</strong>:{' '}
              {language === 'vi'
                ? 'Nổ nhiều hàng/cột cùng lúc hoặc nổ liên tục qua các nước đi sẽ kích hoạt điểm thưởng Combo nhân cấp số!'
                : 'Clearing multiple lines at once or across consecutive turns multiplies your combo bonus points!'}
            </li>
            <li>
              <ShieldCheck className="inline w-3.5 h-3.5 text-emerald-600 mr-1" />
              <strong>{language === 'vi' ? 'Tự động lưu ván chơi' : 'Auto-save & Resume'}</strong>:{' '}
              {language === 'vi'
                ? 'Ván đấu và điểm số được tự động lưu lại. Bạn có thể thoát ra sảnh và quay lại chơi tiếp bất cứ lúc nào!'
                : 'Game state and current score are auto-saved. You can leave and resume your run anytime!'}
            </li>
          </ul>
        </div>
      )}

      {/* Trò chơi chính */}
      <BlockBlastGame />
    </div>
  );
}
