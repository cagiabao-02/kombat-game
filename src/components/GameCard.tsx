'use client';

import React from 'react';
import Link from 'next/link';
import { GameMetadata } from '@/types/game';
import { useLanguage } from '@/i18n/LanguageContext';
import { Play, Users, Sparkles, Zap, Bot, Brain } from 'lucide-react';

interface GameCardProps {
  game: GameMetadata;
}

export function GameCard({ game }: GameCardProps) {
  const { language, t } = useLanguage();

  const isSudoku = game.id === 'sudoku';
  const isChess = game.id === 'chess';

  const statusLabel = t.status[game.status];

  return (
    <Link
      href={game.route}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-200/90 bg-white p-6 shadow-xs transition-all duration-200 hover:shadow-xl hover:border-indigo-300 hover:-translate-y-1 active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
    >
      <div>
        {/* Top bar: Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 px-3 py-1 text-xs font-bold text-indigo-700 shadow-2xs">
            <Sparkles className="h-3 w-3 text-indigo-600" />
            {game.badge ? game.badge[language] : game.name[language]}
          </span>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
              game.status === 'available'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                : game.status === 'beta'
                ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                : 'bg-gray-100 text-gray-600 border border-gray-200/60'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Visual Game Emblem Showcase */}
        <div className="mb-5 flex h-36 w-full items-center justify-center rounded-2xl bg-gradient-to-br from-gray-50 via-indigo-50/30 to-purple-50/40 border border-gray-100 p-4 transition-colors group-hover:from-indigo-50/50 group-hover:to-purple-50/60">
          {isSudoku && (
            <div className="flex flex-col items-center gap-2">
              <div className="grid grid-cols-3 gap-1.5 p-2.5 rounded-xl bg-white shadow-sm border border-indigo-100/80 group-hover:scale-105 transition-transform duration-200">
                <span className="h-6 w-6 flex items-center justify-center text-xs font-black text-indigo-600 bg-indigo-50/60 rounded-md">5</span>
                <span className="h-6 w-6 flex items-center justify-center text-xs font-semibold text-gray-400">3</span>
                <span className="h-6 w-6 flex items-center justify-center text-xs font-black text-indigo-600 bg-indigo-50/60 rounded-md">8</span>
                <span className="h-6 w-6 flex items-center justify-center text-xs font-semibold text-gray-400">6</span>
                <span className="h-6 w-6 flex items-center justify-center text-xs font-black text-amber-500 bg-amber-50/60 rounded-md">7</span>
                <span className="h-6 w-6 flex items-center justify-center text-xs font-semibold text-gray-400">1</span>
                <span className="h-6 w-6 flex items-center justify-center text-xs font-semibold text-gray-400">2</span>
                <span className="h-6 w-6 flex items-center justify-center text-xs font-semibold text-gray-400">9</span>
                <span className="h-6 w-6 flex items-center justify-center text-xs font-black text-indigo-600 bg-indigo-50/60 rounded-md">4</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-gray-500">
                <Brain className="h-3 w-3 text-indigo-500" />
                <span>{language === 'vi' ? '3 Cấp độ • Giới hạn 3 lỗi' : '3 Difficulties • 3 Lives'}</span>
              </div>
            </div>
          )}

          {isChess && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-white shadow-md border border-gray-200/80 text-3xl group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-200">
                  ♔
                </div>
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-black text-white shadow-xs">
                  VS
                </div>
                <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-gray-900 shadow-md border border-gray-700 text-3xl text-white group-hover:scale-110 group-hover:rotate-3 transition-transform duration-200">
                  ♚
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-semibold text-gray-500">
                <span className="inline-flex items-center gap-1 text-emerald-600">
                  <Zap className="h-3 w-3" />
                  <span>Realtime PvP</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-purple-600">
                  <Bot className="h-3 w-3" />
                  <span>Bot 3 Cấp</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Game Title & Description */}
        <h3 className="text-xl font-black tracking-tight text-gray-950 mb-2 group-hover:text-indigo-600 transition-colors">
          {game.name[language]}
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2 mb-6">
          {game.shortDescription[language]}
        </p>
      </div>

      {/* Footer & Action Button (Min 44px Touch Target) */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
          <Users className="h-3.5 w-3.5 text-gray-400" />
          <span>
            {game.minPlayers === game.maxPlayers
              ? `${game.minPlayers} ${language === 'vi' ? 'người' : 'player'}`
              : `${game.minPlayers}-${game.maxPlayers} ${language === 'vi' ? 'người' : 'players'}`}
          </span>
        </div>

        <div className="inline-flex items-center justify-center gap-2 min-h-[44px] rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all group-hover:bg-indigo-700 group-hover:shadow-md active:scale-95">
          <Play className="h-4 w-4 fill-white" />
          <span>{isSudoku ? t.lobby.playNow : t.lobby.createRoom}</span>
        </div>
      </div>
    </Link>
  );
}

