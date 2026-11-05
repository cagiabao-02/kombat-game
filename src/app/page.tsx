'use client';

import React from 'react';
import { GAME_REGISTRY } from '@/features/games/registry';
import { GameCard } from '@/components/GameCard';
import { useLanguage } from '@/i18n/LanguageContext';
import { Gamepad2, Sparkles, ShieldCheck } from 'lucide-react';

export default function LobbyPage() {
  const { t } = useLanguage();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
      {/* Hero section */}
      <div className="mb-10 text-center sm:text-left">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Indie Mini-Games</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
          {t.lobby.title}
        </h1>
        <p className="mt-2 text-base text-gray-600 max-w-2xl">
          {t.lobby.subtitle}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
          <span>{t.app.loginNotice}</span>
        </div>
      </div>

      {/* Game Cards Grid */}
      <section>
        <div className="flex items-center gap-2 mb-6">
          <Gamepad2 className="h-5 w-5 text-indigo-600" />
          <h2 className="text-lg font-bold text-gray-900">
            {t.nav.lobby}
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {GAME_REGISTRY.map((game) => (
            <GameCard key={game.id} game={game} />
          ))}
        </div>
      </section>
    </div>
  );
}

