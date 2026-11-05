'use client';

import React from 'react';
import Link from 'next/link';
import { GameMetadata } from '@/types/game';
import { useLanguage } from '@/i18n/LanguageContext';
import { Play, Users, Sparkles } from 'lucide-react';

interface GameCardProps {
  game: GameMetadata;
}

export function GameCard({ game }: GameCardProps) {
  const { language, t } = useLanguage();

  const isSudoku = game.id === 'sudoku';
  const isChess = game.id === 'chess';

  const statusLabel = t.status[game.status];

  return (
    <div className="flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:border-indigo-200">
      <div>
        {/* Top bar: Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
            <Sparkles className="h-3 w-3" />
            {game.badge ? game.badge[language] : game.name[language]}
          </span>

          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
              game.status === 'available'
                ? 'bg-emerald-50 text-emerald-700'
                : game.status === 'beta'
                ? 'bg-amber-50 text-amber-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Visual Game Emblem placeholder (lightweight SVG/CSS representation) */}
        <div className="mb-4 flex h-32 w-full items-center justify-center rounded-xl bg-gradient-to-br from-gray-50 to-indigo-50/40 border border-gray-100">
          {isSudoku && (
            <div className="grid grid-cols-3 gap-1 p-2 rounded-lg bg-white shadow-sm border border-indigo-100">
              <span className="h-6 w-6 flex items-center justify-center text-xs font-bold text-indigo-600">5</span>
              <span className="h-6 w-6 flex items-center justify-center text-xs font-medium text-gray-400">3</span>
              <span className="h-6 w-6 flex items-center justify-center text-xs font-bold text-indigo-600">.</span>
              <span className="h-6 w-6 flex items-center justify-center text-xs font-medium text-gray-400">6</span>
              <span className="h-6 w-6 flex items-center justify-center text-xs font-bold text-indigo-600">7</span>
              <span className="h-6 w-6 flex items-center justify-center text-xs font-medium text-gray-400">.</span>
              <span className="h-6 w-6 flex items-center justify-center text-xs font-medium text-gray-400">.</span>
              <span className="h-6 w-6 flex items-center justify-center text-xs font-medium text-gray-400">9</span>
              <span className="h-6 w-6 flex items-center justify-center text-xs font-bold text-indigo-600">8</span>
            </div>
          )}

          {isChess && (
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm border border-gray-200 text-2xl">
                ♔
              </div>
              <div className="text-sm font-bold text-gray-400">VS</div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-900 shadow-sm border border-gray-700 text-2xl text-white">
                ♚
              </div>
            </div>
          )}
        </div>

        {/* Game Title & Description */}
        <h3 className="text-xl font-bold tracking-tight text-gray-900 mb-2">
          {game.name[language]}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2 mb-6">
          {game.shortDescription[language]}
        </p>
      </div>

      {/* Footer & Action */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <Users className="h-3.5 w-3.5" />
          <span>
            {game.minPlayers === game.maxPlayers
              ? `${game.minPlayers} ${language === 'vi' ? 'người' : 'player'}`
              : `${game.minPlayers}-${game.maxPlayers} ${language === 'vi' ? 'người' : 'players'}`}
          </span>
        </div>

        <Link
          href={game.route}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
        >
          <Play className="h-4 w-4 fill-white" />
          <span>{isSudoku ? t.lobby.playNow : t.lobby.createRoom}</span>
        </Link>
      </div>
    </div>
  );
}

