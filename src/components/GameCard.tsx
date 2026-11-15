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
  const isCaro = game.id === 'caro';
  const isXiangqi = game.id === 'xiangqi';

  const statusLabel = t.status[game.status];

  return (
    <Link
      href={game.route}
      className="pixel-card group relative flex flex-col justify-between overflow-hidden bg-[#FFFDF8] p-5 sm:p-6 outline-none"
    >
      {/* Top Cartridge Grooves Decoration */}
      <div className="absolute top-0 right-6 flex gap-1">
        <span className="h-2 w-1.5 bg-zinc-900" />
        <span className="h-2 w-1.5 bg-zinc-900" />
        <span className="h-2 w-1.5 bg-zinc-900" />
      </div>

      <div>
        {/* Top bar: Badge & Status */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <span className="pixel-badge inline-flex items-center gap-1.5 bg-indigo-100 px-2.5 py-1 text-xs font-bold text-indigo-950">
            <Sparkles className="h-3 w-3 text-indigo-700" />
            {game.badge ? game.badge[language] : game.name[language]}
          </span>

          <span
            className={`pixel-badge inline-flex items-center px-2.5 py-0.5 text-xs font-bold ${
              game.status === 'available'
                ? 'bg-emerald-300 text-zinc-900'
                : game.status === 'beta'
                ? 'bg-amber-300 text-zinc-900'
                : 'bg-zinc-200 text-zinc-700'
            }`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Visual Game Cartridge Label Showcase */}
        <div className="mb-5 flex h-36 w-full items-center justify-center border-2 border-zinc-900 bg-[#ECE8DD] p-4 shadow-pixel-inset relative overflow-hidden">
          {/* Corner pixel rivets */}
          <span className="absolute top-1.5 left-1.5 h-1.5 w-1.5 bg-zinc-900" />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-zinc-900" />
          <span className="absolute bottom-1.5 left-1.5 h-1.5 w-1.5 bg-zinc-900" />
          <span className="absolute bottom-1.5 right-1.5 h-1.5 w-1.5 bg-zinc-900" />

          {isSudoku && (
            <div className="flex flex-col items-center gap-2">
              <div className="grid grid-cols-3 gap-1 p-1.5 bg-[#9BBC0F] border-2 border-zinc-900 shadow-pixel-sm">
                <span className="h-6 w-6 flex items-center justify-center font-pixel text-xs font-bold text-[#0F380F] bg-[#8BAC0F] border border-[#0F380F]/40">5</span>
                <span className="h-6 w-6 flex items-center justify-center font-pixel text-xs font-bold text-[#306230]">3</span>
                <span className="h-6 w-6 flex items-center justify-center font-pixel text-xs font-bold text-[#0F380F] bg-[#8BAC0F] border border-[#0F380F]/40">8</span>
                <span className="h-6 w-6 flex items-center justify-center font-pixel text-xs font-bold text-[#306230]">6</span>
                <span className="h-6 w-6 flex items-center justify-center font-pixel text-xs font-bold text-amber-950 bg-amber-300 border border-zinc-900">7</span>
                <span className="h-6 w-6 flex items-center justify-center font-pixel text-xs font-bold text-[#306230]">1</span>
                <span className="h-6 w-6 flex items-center justify-center font-pixel text-xs font-bold text-[#306230]">2</span>
                <span className="h-6 w-6 flex items-center justify-center font-pixel text-xs font-bold text-[#306230]">9</span>
                <span className="h-6 w-6 flex items-center justify-center font-pixel text-xs font-bold text-[#0F380F] bg-[#8BAC0F] border border-[#0F380F]/40">4</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-zinc-700">
                <Brain className="h-3 w-3 text-indigo-700" />
                <span>{language === 'vi' ? '3 CẤP ĐỘ • 3 MẠNG' : '3 LEVELS • 3 HEARTS'}</span>
              </div>
            </div>
          )}

          {isChess && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center bg-[#FFFDF8] border-2 border-zinc-900 shadow-pixel-sm text-3xl">
                  ♔
                </div>
                <div className="flex h-7 w-7 items-center justify-center bg-indigo-600 border-2 border-zinc-900 font-pixel text-[10px] font-bold text-amber-300">
                  VS
                </div>
                <div className="flex h-12 w-12 items-center justify-center bg-zinc-900 border-2 border-zinc-900 shadow-pixel-sm text-3xl text-amber-300">
                  ♚
                </div>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-zinc-700">
                <span className="inline-flex items-center gap-1 text-emerald-800">
                  <Zap className="h-3 w-3" />
                  <span>1V1 ONLINE</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-indigo-800">
                  <Bot className="h-3 w-3" />
                  <span>BOT 3 LVL</span>
                </span>
              </div>
            </div>
          )}

          {isCaro && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 aspect-square items-center justify-center bg-rose-100 border-2 border-zinc-900 shadow-pixel-sm font-pixel text-2xl font-bold text-rose-600">
                  X
                </div>
                <div className="flex h-7 w-7 items-center justify-center bg-rose-600 border-2 border-zinc-900 font-pixel text-[10px] font-bold text-white">
                  VS
                </div>
                <div className="flex h-12 w-12 aspect-square items-center justify-center bg-indigo-100 border-2 border-zinc-900 shadow-pixel-sm font-pixel text-2xl font-bold text-indigo-700">
                  O
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-zinc-700">
                <Users className="h-3.5 w-3.5 text-indigo-700" />
                <span>{language === 'vi' ? 'CHƠI ĐÔI & ONLINE' : 'LOCAL & ONLINE'}</span>
              </div>
            </div>
          )}

          {isXiangqi && (
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-3">
                {/* Quân Đỏ Soái Pixel Token */}
                <div className="flex h-12 w-12 items-center justify-center bg-[#F7ECD9] border-2 border-rose-700 shadow-pixel-sm text-rose-700 font-black text-2xl">
                  <span style={{ fontFamily: '"KaiTi", "SimSun", serif' }}>帥</span>
                </div>
                <div className="flex h-7 w-7 items-center justify-center bg-amber-500 border-2 border-zinc-900 font-pixel text-[10px] font-bold text-zinc-950">
                  VS
                </div>
                {/* Quân Đen Tướng Pixel Token */}
                <div className="flex h-12 w-12 items-center justify-center bg-[#F7ECD9] border-2 border-zinc-900 shadow-pixel-sm text-zinc-900 font-black text-2xl">
                  <span style={{ fontFamily: '"KaiTi", "SimSun", serif' }}>將</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-zinc-700">
                <span className="text-rose-700">SỞ HÀ HÁN GIỚI</span>
                <span>•</span>
                <span>{language === 'vi' ? 'AI & PVP' : 'AI & PVP'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Game Title & Description */}
        <h3 className="font-pixel text-xl font-bold tracking-wide text-zinc-900 mb-2 group-hover:text-indigo-700 transition-colors">
          {game.name[language]}
        </h3>
        <p className="text-xs sm:text-sm font-mono text-zinc-600 leading-relaxed line-clamp-2 mb-6">
          {game.shortDescription[language]}
        </p>
      </div>

      {/* Footer & Action Button (Min 44px Touch Target) */}
      <div className="pt-4 border-t-2 border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-zinc-600">
          <Users className="h-3.5 w-3.5 text-zinc-800" />
          <span>
            {game.minPlayers === game.maxPlayers
              ? `${game.minPlayers}P`
              : `${game.minPlayers}-${game.maxPlayers}P`}
          </span>
        </div>

        <div className="pixel-btn inline-flex items-center justify-center gap-2 min-h-[44px] bg-indigo-600 group-hover:bg-indigo-500 px-5 py-2 text-sm font-bold text-amber-300">
          <Play className="h-4 w-4 fill-amber-300" />
          <span>{isSudoku ? t.lobby.playNow : t.lobby.createRoom}</span>
        </div>
      </div>
    </Link>
  );
}
