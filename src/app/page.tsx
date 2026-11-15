'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { GAME_REGISTRY } from '@/features/games/registry';
import { GameCard } from '@/components/GameCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { Gamepad2, Sparkles, ShieldCheck, Zap, Bot, Smartphone, Trophy } from 'lucide-react';

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
      {/* Arcade Cabinet Hero Banner */}
      <div className="pixel-box-lg mb-10 bg-[#FFFDF8] p-5 sm:p-8 text-center sm:text-left relative overflow-hidden">
        {/* Decorative top arcade stripe */}
        <div className="absolute top-0 left-0 right-0 h-2 flex">
          <div className="flex-1 bg-indigo-600" />
          <div className="flex-1 bg-amber-400" />
          <div className="flex-1 bg-emerald-500" />
          <div className="flex-1 bg-rose-500" />
        </div>

        <div className="pixel-badge inline-flex items-center gap-1.5 bg-indigo-600 px-3 py-1 text-xs font-bold text-amber-300 mb-3 mt-1">
          <Sparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
          <span>ARCADE SELECT • 16-BIT EDITION</span>
        </div>

        <h1 className="font-pixel text-3xl font-bold tracking-wide text-zinc-950 sm:text-4xl lg:text-5xl">
          {t.lobby.title}
        </h1>
        <p className="mt-3 text-xs sm:text-sm font-mono text-zinc-600 max-w-2xl leading-relaxed">
          {t.lobby.subtitle}
        </p>

        {/* Feature Highlights Pills */}
        <div className="mt-5 flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
          <LobbyPresenceWidget />
          <button
            type="button"
            onClick={() => setIsLeaderboardOpen(true)}
            className="pixel-btn inline-flex items-center gap-1.5 bg-amber-300 hover:bg-amber-200 text-zinc-900 px-3 py-1.5 text-xs font-bold"
          >
            <Trophy className="h-3.5 w-3.5 fill-current" />
            <span>{language === 'vi' ? 'BẢNG XẾP HẠNG' : 'HIGH SCORES'}</span>
          </button>
          <div className="pixel-badge inline-flex items-center gap-1.5 bg-[#ECE8DD] px-2.5 py-1.5 text-xs font-bold text-zinc-800">
            <Zap className="h-3.5 w-3.5 text-amber-600" />
            <span>{language === 'vi' ? 'CHƠI NGAY' : 'INSTANT PLAY'}</span>
          </div>
          <div className="pixel-badge inline-flex items-center gap-1.5 bg-[#ECE8DD] px-2.5 py-1.5 text-xs font-bold text-zinc-800">
            <Bot className="h-3.5 w-3.5 text-indigo-600" />
            <span>{language === 'vi' ? 'PVP & BOT AI' : 'PVP & BOT AI'}</span>
          </div>
          <div className="pixel-badge inline-flex items-center gap-1.5 bg-[#ECE8DD] px-2.5 py-1.5 text-xs font-bold text-zinc-800">
            <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
            <span>{language === 'vi' ? 'DI ĐỘNG & PC' : 'MOBILE-FIRST'}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-dashed border-zinc-300 flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-zinc-600">
          <ShieldCheck className="h-4 w-4 text-emerald-700 flex-shrink-0" />
          <span>{t.app.loginNotice}</span>
        </div>
      </div>

      {/* Game Cartridges Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center bg-zinc-900 text-amber-400 border-2 border-zinc-900 shadow-pixel-xs">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <h2 className="font-pixel text-2xl font-bold text-zinc-950 tracking-wide uppercase">
              {t.nav.lobby}
            </h2>
          </div>
          <span className="pixel-badge bg-amber-100 px-2.5 py-1 text-xs font-bold text-zinc-900 uppercase tracking-wider">
            {GAME_REGISTRY.length} {language === 'vi' ? 'BĂNG GAME' : 'CARTRIDGES'}
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
