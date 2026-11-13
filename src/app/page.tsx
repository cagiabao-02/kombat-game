'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { GAME_REGISTRY } from '@/features/games/registry';
import { GameCard } from '@/components/GameCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { Gamepad2, Sparkles, ShieldCheck, Zap, Bot, Smartphone, Trophy, Swords } from 'lucide-react';

const LeaderboardModal = dynamic(
  () => import('@/features/leaderboard/LeaderboardModal').then((mod) => mod.LeaderboardModal),
  { ssr: false }
);

import { LobbyPresenceWidget } from '@/features/presence/LobbyPresenceWidget';

export default function LobbyPage() {
  const { language, t } = useLanguage();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero section with Gamey Polish */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 px-3 py-1 text-xs font-bold text-indigo-700 mb-3 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
          <span>Indie Mini-Games</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl lg:text-5xl">
          {t.lobby.title}
        </h1>
        <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed">
          {t.lobby.subtitle}
        </p>

        {/* Feature Highlights Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <LobbyPresenceWidget />
          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 border border-amber-200/90 hover:bg-amber-100 text-amber-700 px-3 py-1.5 text-xs font-bold shadow-2xs hover:scale-102 active:scale-95 transition-all"
          >
            <Trophy className="h-3.5 w-3.5 fill-current" />
            <span>{language === 'vi' ? 'Bảng Xếp Hạng' : 'Leaderboard'}</span>
          </button>
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200/80 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs">
            <Zap className="h-3.5 w-3.5 text-amber-500" />
            <span>{language === 'vi' ? 'Không cần cài đặt' : 'Instant Play'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200/80 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs">
            <Bot className="h-3.5 w-3.5 text-indigo-500" />
            <span>{language === 'vi' ? 'Đấu Người & Bot AI' : 'PvP & Smart Bot'}</span>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-xl bg-gray-50 border border-gray-200/80 px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs">
            <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
            <span>{language === 'vi' ? 'Cảm ứng mượt mà' : 'Mobile-First'}</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-center sm:justify-start gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{t.app.loginNotice}</span>
        </div>
      </div>

      {/* Game Cards Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <Gamepad2 className="h-4.5 w-4.5" />
            </div>
            <h2 className="text-xl font-black text-gray-950 tracking-tight">
              {t.nav.lobby}
            </h2>
          </div>
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            {GAME_REGISTRY.length} {language === 'vi' ? 'trò chơi' : 'games'}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {GAME_REGISTRY.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}
    </div>
  );
}

