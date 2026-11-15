'use client';

import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import {
  ChessStats,
  getChessStats,
  calculateWinrate,
} from './statsService';
import { Flame, Swords, Bot, Award, ShieldCheck } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';

export function ChessStatsCard() {
  const { t, language } = useLanguage();
  const { guestName, avatar, isAnonymous } = useAuth();
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
    <div className="border-2 border-zinc-900 bg-[#FFFDF8] p-4 shadow-pixel-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <UserAvatar
            avatar={avatar}
            className="h-10 w-10 text-2xl"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-pixel font-bold text-zinc-900 text-sm">{guestName}</h3>
              {!isAnonymous && (
                <span
                  className="inline-flex items-center gap-0.5 bg-emerald-300 px-1.5 py-0.5 font-pixel text-[10px] font-bold text-zinc-950 border border-zinc-900"
                  title={language === 'vi' ? 'Đã liên kết tài khoản đám mây' : 'Cloud account synced'}
                >
                  <ShieldCheck className="h-3 w-3" />
                  <span>CLOUD</span>
                </span>
              )}
            </div>
            <p className="text-[11px] font-mono text-zinc-500">
              {!isAnonymous
                ? (language === 'vi' ? 'Thành tích đồng bộ đám mây' : 'Stats synced to cloud')
                : (language === 'vi' ? 'Lưu trên thiết bị này' : 'Stored locally on device')}
            </p>
          </div>
        </div>

        {/* Tab Filter: All / PvP / Bot */}
        <div className="inline-flex gap-1 bg-zinc-900 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-2.5 py-1 font-pixel ${
              activeTab === 'all'
                ? 'bg-amber-300 text-zinc-950'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            {language === 'vi' ? 'Tất cả' : 'All'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pvp')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 font-pixel ${
              activeTab === 'pvp'
                ? 'bg-amber-300 text-zinc-950'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Swords className="h-3 w-3" />
            <span>{t.chess.pvpStats}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bot')}
            className={`inline-flex items-center gap-1 px-2.5 py-1 font-pixel ${
              activeTab === 'bot'
                ? 'bg-amber-300 text-zinc-950'
                : 'text-zinc-300 hover:text-white'
            }`}
          >
            <Bot className="h-3 w-3" />
            <span>{t.chess.botStats}</span>
          </button>
        </div>
      </div>

      {stats.totalGames === 0 ? (
        <div className="border-2 border-dashed border-zinc-400 bg-white p-4 text-center">
          <p className="text-xs font-mono font-bold text-zinc-600">
            {language === 'vi'
              ? 'Chưa có ván đấu nào được ghi nhận. Hãy bắt đầu ván đầu tiên!'
              : 'No games recorded yet. Play your first match!'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Total Games */}
          <div className="bg-white p-3 text-center border-2 border-zinc-900">
            <span className="block font-pixel text-[11px] font-bold text-zinc-600 uppercase">
              {t.chess.totalGames}
            </span>
            <span className="mt-0.5 block font-pixel text-lg font-bold text-zinc-950">
              {currentData.total}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 font-bold">
              {currentData.wins}W • {currentData.draws}D • {currentData.losses}L
            </span>
          </div>

          {/* Win Rate */}
          <div className="bg-indigo-100 p-3 text-center border-2 border-zinc-900">
            <span className="block font-pixel text-[11px] font-bold text-indigo-900 uppercase">
              {t.chess.winrate}
            </span>
            <span className="mt-0.5 block font-pixel text-lg font-bold text-indigo-950">
              {winrate}%
            </span>
            <span className="text-[10px] font-mono text-indigo-800 font-bold">
              {currentData.wins} {language === 'vi' ? 'thắng' : 'wins'}
            </span>
          </div>

          {/* Current Streak */}
          <div className="bg-amber-100 p-3 text-center border-2 border-zinc-900">
            <span className="inline-flex items-center gap-1 font-pixel text-[11px] font-bold text-amber-900 uppercase">
              <Flame className="h-3 w-3 text-amber-600 fill-amber-500" />
              <span>{t.chess.currentStreak}</span>
            </span>
            <span className="mt-0.5 block font-pixel text-lg font-bold text-amber-950">
              {stats.currentStreak}
            </span>
            <span className="text-[10px] font-mono text-amber-800 font-bold">
              {language === 'vi' ? 'Liên tiếp' : 'In a row'}
            </span>
          </div>

          {/* Best Streak */}
          <div className="bg-emerald-100 p-3 text-center border-2 border-zinc-900">
            <span className="inline-flex items-center gap-1 font-pixel text-[11px] font-bold text-emerald-900 uppercase">
              <Award className="h-3 w-3 text-emerald-700" />
              <span>{t.chess.bestStreak}</span>
            </span>
            <span className="mt-0.5 block font-pixel text-lg font-bold text-emerald-950">
              {stats.bestStreak}
            </span>
            <span className="text-[10px] font-mono text-emerald-800 font-bold">
              {language === 'vi' ? 'Kỷ lục' : 'Record'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
