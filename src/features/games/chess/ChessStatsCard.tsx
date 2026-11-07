'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  ChessStats,
  getChessStats,
  calculateWinrate,
} from './statsService';
import { Trophy, Flame, Swords, Bot, Award, Percent } from 'lucide-react';

export function ChessStatsCard() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState<ChessStats | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'pvp' | 'bot'>('all');

  useEffect(() => {
    setStats(getChessStats());
  }, []);

  if (!stats) return null;

  const currentData =
    activeTab === 'all'
      ? {
          total: stats.totalGames,
          wins: stats.wins,
          draws: stats.draws,
          losses: stats.losses,
        }
      : activeTab === 'pvp'
      ? stats.pvp
      : stats.bot;

  const winrate = calculateWinrate(currentData.wins, currentData.total);

  return (
    <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-gray-300">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 shadow-xs">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{t.chess.statsTitle}</h3>
            <p className="text-[11px] text-gray-400">
              {language === 'vi'
                ? 'Dữ liệu được lưu an toàn trên trình duyệt này'
                : 'Stats stored locally on this device'}
            </p>
          </div>
        </div>

        {/* Tab Filter: All / PvP / Bot */}
        <div className="inline-flex rounded-xl bg-gray-100 p-1 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-2.5 py-1 transition-all ${
              activeTab === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            {language === 'vi' ? 'Tất cả' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pvp')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
              activeTab === 'pvp'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Swords className="h-3 w-3" />
            <span>{t.chess.pvpStats}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bot')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 transition-all ${
              activeTab === 'bot'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            <Bot className="h-3 w-3" />
            <span>{t.chess.botStats}</span>
          </button>
        </div>
      </div>

      {stats.totalGames === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-4 text-center">
          <p className="text-xs font-medium text-gray-500">
            {language === 'vi'
              ? 'Chưa có ván đấu nào được ghi nhận. Hãy bắt đầu ván đầu tiên của bạn!'
              : 'No games recorded yet. Play your first match to start tracking stats!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Total Games */}
          <div className="rounded-xl bg-gray-50 p-3 text-center border border-gray-100">
            <span className="block text-[11px] font-medium text-gray-500">
              {t.chess.totalGames}
            </span>
            <span className="mt-0.5 block text-lg font-black text-gray-900">
              {currentData.total}
            </span>
            <span className="text-[10px] text-gray-400">
              {currentData.wins}W • {currentData.draws}D • {currentData.losses}L
            </span>
          </div>

          {/* Win Rate */}
          <div className="rounded-xl bg-indigo-50/60 p-3 text-center border border-indigo-100/80">
            <span className="block text-[11px] font-medium text-indigo-700">
              {t.chess.winrate}
            </span>
            <span className="mt-0.5 block text-lg font-black text-indigo-900">
              {winrate}%
            </span>
            <span className="text-[10px] text-indigo-600/80">
              {currentData.wins} {language === 'vi' ? 'trận thắng' : 'wins'}
            </span>
          </div>

          {/* Current Streak */}
          <div className="rounded-xl bg-amber-50/60 p-3 text-center border border-amber-100/80">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700">
              <Flame className="h-3 w-3 text-amber-500 fill-amber-500" />
              <span>{t.chess.currentStreak}</span>
            </span>
            <span className="mt-0.5 block text-lg font-black text-amber-900">
              {stats.currentStreak}
            </span>
            <span className="text-[10px] text-amber-600/80">
              {language === 'vi' ? 'Trận thắng liên tiếp' : 'Consecutive wins'}
            </span>
          </div>

          {/* Best Streak */}
          <div className="rounded-xl bg-emerald-50/60 p-3 text-center border border-emerald-100/80">
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700">
              <Trophy className="h-3 w-3 text-emerald-600" />
              <span>{t.chess.bestStreak}</span>
            </span>
            <span className="mt-0.5 block text-lg font-black text-emerald-900">
              {stats.bestStreak}
            </span>
            <span className="text-[10px] text-emerald-600/80">
              {language === 'vi' ? 'Kỷ lục cao nhất' : 'All-time best'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

