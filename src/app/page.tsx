'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { GAME_REGISTRY } from '@/features/games/registry';
import { GAME_CATEGORIES } from '@/features/games/categories';
import { GameCategoryId } from '@/types/game';
import { GameTile, UpcomingTile } from '@/components/GameTile';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  PixelGamepad,
  PixelSparkles,
  PixelShieldCheck,
  PixelBolt,
  PixelBot,
  PixelTrophy,
} from '@/components/PixelIcons';

const LeaderboardModal = dynamic(
  () => import('@/features/leaderboard/LeaderboardModal').then((mod) => mod.LeaderboardModal),
  { ssr: false }
);

import { LobbyPresenceWidget } from '@/features/presence/LobbyPresenceWidget';

export default function LobbyPage() {
  const { language, t } = useLanguage();
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<GameCategoryId | 'all'>('all');

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
          <PixelSparkles className="h-3.5 w-3.5 text-amber-300 animate-pulse" />
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
            <PixelTrophy className="h-3.5 w-3.5" />
            <span>{language === 'vi' ? 'BẢNG XẾP HẠNG' : 'HIGH SCORES'}</span>
          </button>
          <div className="pixel-badge inline-flex items-center gap-1.5 bg-[#ECE8DD] px-2.5 py-1.5 text-xs font-bold text-zinc-800">
            <PixelBolt className="h-3.5 w-3.5 text-amber-600" />
            <span>{language === 'vi' ? 'CHƠI NGAY' : 'INSTANT PLAY'}</span>
          </div>
          <div className="pixel-badge inline-flex items-center gap-1.5 bg-[#ECE8DD] px-2.5 py-1.5 text-xs font-bold text-zinc-800">
            <PixelBot className="h-3.5 w-3.5 text-indigo-600" />
            <span>{language === 'vi' ? 'PVP & BOT AI' : 'PVP & BOT AI'}</span>
          </div>
          <div className="pixel-badge inline-flex items-center gap-1.5 bg-[#ECE8DD] px-2.5 py-1.5 text-xs font-bold text-zinc-800">
            <PixelGamepad className="h-3.5 w-3.5 text-emerald-700" />
            <span>{language === 'vi' ? 'DI ĐỘNG & PC' : 'MOBILE-FIRST'}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t-2 border-dashed border-zinc-300 flex items-center justify-center sm:justify-start gap-2 text-xs font-mono text-zinc-600">
          <PixelShieldCheck className="h-4 w-4 text-emerald-700 flex-shrink-0" />
          <span>{t.app.loginNotice}</span>
        </div>
      </div>

      {/* Game Cartridges — grouped by category */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center bg-zinc-900 text-amber-400 border-2 border-zinc-900 shadow-pixel-xs">
              <PixelGamepad className="h-5 w-5" />
            </div>
            <h2 className="font-pixel text-2xl font-bold text-zinc-950 tracking-wide uppercase">
              {t.nav.lobby}
            </h2>
          </div>
          <span className="pixel-badge bg-amber-100 px-2.5 py-1 text-xs font-bold text-zinc-900 uppercase tracking-wider">
            {GAME_REGISTRY.length} {language === 'vi' ? 'BĂNG GAME' : 'CARTRIDGES'}
          </span>
        </div>

        {/* Category filter chips */}
        <div className="mb-8 flex flex-wrap gap-2" role="tablist" aria-label={language === 'vi' ? 'Lọc theo thể loại' : 'Filter by category'}>
          {[{ id: 'all' as const, label: language === 'vi' ? 'TẤT CẢ' : 'ALL', count: GAME_REGISTRY.length }, ...GAME_CATEGORIES.map((cat) => ({
            id: cat.id,
            label: cat.name[language].toUpperCase(),
            count: GAME_REGISTRY.filter((g) => g.category === cat.id).length,
          }))].map((chip) => (
            <button
              key={chip.id}
              type="button"
              role="tab"
              aria-selected={activeCategory === chip.id}
              onClick={() => setActiveCategory(chip.id)}
              className={`pixel-btn min-h-[40px] px-3 py-1.5 text-xs font-bold ${
                activeCategory === chip.id
                  ? 'bg-zinc-900 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-amber-50'
              }`}
            >
              {chip.label} <span className="opacity-70">({chip.count})</span>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {GAME_CATEGORIES.filter((cat) => activeCategory === 'all' || activeCategory === cat.id).map((cat) => {
            const games = GAME_REGISTRY.filter((g) => g.category === cat.id);
            return (
              <div
                key={cat.id}
                className="pixel-box-sm bg-[#FFFDF8] p-4 sm:p-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b-2 border-dashed border-zinc-300 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className={`pixel-badge px-2.5 py-1 text-xs font-bold uppercase tracking-wide ${cat.accentClass}`}>
                      {cat.name[language]}
                    </span>
                    <span className="text-xs font-mono text-zinc-600 hidden sm:inline">{cat.tagline[language]}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-zinc-500">
                    {games.length} {language === 'vi' ? 'trò chơi' : 'games'}
                  </span>
                </div>

                <div className="flex flex-wrap items-start gap-4 sm:gap-6 pt-1">
                  {games.map((game) => (
                    <GameTile key={game.id} game={game} />
                  ))}
                  {/* Ô đại diện cho game dự kiến tiếp theo */}
                  <UpcomingTile label={cat.upcoming[language]} />
                </div>
              </div>
            );
          })}
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
