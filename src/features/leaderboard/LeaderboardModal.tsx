'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import { LeaderboardGame, LeaderboardEntry, UserRankSummary } from './types';
import { getRealLeaderboardData, getLocalLeaderboardData } from './leaderboardService';
import { UserAvatar } from '@/components/UserAvatar';
import {
  Trophy,
  X,
  Crown,
  Play,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialGame?: LeaderboardGame;
}

export function LeaderboardModal({
  isOpen,
  onClose,
  initialGame = 'chess',
}: LeaderboardModalProps) {
  const { language } = useLanguage();
  const { user, guestName, avatar } = useAuth();
  const [selectedGame, setSelectedGame] = useState<LeaderboardGame>(initialGame);

  // Initialize with immediate local data (0ms delay)
  const initialData = getLocalLeaderboardData(
    selectedGame,
    user?.id,
    guestName || (language === 'vi' ? 'Bạn' : 'You'),
    avatar
  );

  const [list, setList] = useState<LeaderboardEntry[]>(initialData.list);
  const [userSummary, setUserSummary] = useState<UserRankSummary | null>(initialData.userSummary);
  const [isFetchingCloud, setIsFetchingCloud] = useState(false);

  const loadData = useCallback(async (game: LeaderboardGame) => {
    // 1. Instant local load
    const local = getLocalLeaderboardData(
      game,
      user?.id,
      guestName || (language === 'vi' ? 'Bạn' : 'You'),
      avatar
    );
    setList(local.list);
    setUserSummary(local.userSummary);

    // 2. Background cloud enhancement
    setIsFetchingCloud(true);
    try {
      const cloud = await getRealLeaderboardData(
        game,
        user?.id,
        guestName || (language === 'vi' ? 'Bạn' : 'You'),
        avatar
      );
      setList(cloud.list);
      setUserSummary(cloud.userSummary);
    } catch {
      // Fallback already active
    } finally {
      setIsFetchingCloud(false);
    }
  }, [user?.id, guestName, avatar, language]);

  useEffect(() => {
    if (isOpen) {
      loadData(selectedGame);
    }
  }, [isOpen, selectedGame, loadData]);

  if (!isOpen) return null;

  const top1 = list.find((i) => i.rank === 1);
  const top2 = list.find((i) => i.rank === 2);
  const top3 = list.find((i) => i.rank === 3);
  const restList = list.filter((i) => i.rank > 3);

  const getGameRoute = (game: LeaderboardGame) => {
    if (game === 'chess') return '/games/chess';
    if (game === 'caro') return '/games/caro';
    return '/games/sudoku';
  };

  const getGameTitle = (game: LeaderboardGame) => {
    if (game === 'chess') return language === 'vi' ? 'Cờ vua' : 'Chess';
    if (game === 'caro') return language === 'vi' ? 'Cờ Caro' : 'Caro';
    return 'Sudoku';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="relative border-b border-gray-100 bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-purple-500/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white shadow-md shadow-amber-200">
                <Trophy className="h-6 w-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-black text-gray-950 tracking-tight">
                    {language === 'vi' ? 'Bảng Xếp Hạng Thực Tế' : 'Live Leaderboard'}
                  </h2>
                  {isFetchingCloud && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-500" />
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {language === 'vi'
                    ? 'Thành tích thi đấu thực của người chơi'
                    : 'Authentic player competitive records'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-500 outline-none"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Game Switcher Tabs */}
          <div className="mt-4 grid grid-cols-3 gap-1.5 p-1 bg-gray-200/60 rounded-2xl">
            <button
              type="button"
              onClick={() => setSelectedGame('chess')}
              className={`flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedGame === 'chess'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>♔</span>
              <span>{language === 'vi' ? 'Cờ vua' : 'Chess'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('caro')}
              className={`flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedGame === 'caro'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="text-rose-600 font-black">✕</span>
              <span>{language === 'vi' ? 'Cờ Caro' : 'Caro'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('sudoku')}
              className={`flex items-center justify-center gap-1.5 min-h-[40px] rounded-xl text-xs sm:text-sm font-bold transition-all ${
                selectedGame === 'sudoku'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>🧩</span>
              <span>Sudoku</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {list.length === 0 ? (
            /* Empty State: 100% genuine message */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-500 mb-4 border border-amber-200/80 shadow-xs">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="text-base sm:text-lg font-black text-gray-900 mb-1">
                {language === 'vi'
                  ? `Chưa có thành tích cho ${getGameTitle(selectedGame)}`
                  : `No recorded scores for ${getGameTitle(selectedGame)} yet`}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-xs mb-6 leading-relaxed">
                {language === 'vi'
                  ? 'Hãy tham gia ván đấu đầu tiên để trở thành quán quân đầu tiên trên bảng vàng!'
                  : 'Play your first match to claim the inaugural #1 champion spot!'}
              </p>
              <Link
                href={getGameRoute(selectedGame)}
                onClick={onClose}
                className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-indigo-200 transition-all"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{language === 'vi' ? 'Chơi ngay' : 'Play Now'}</span>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Podium: Adapts dynamically to how many players exist (1, 2, or 3+) */}
              <div
                className={`grid gap-2 sm:gap-3 px-1 pt-2 items-end ${
                  list.length === 1
                    ? 'grid-cols-1 max-w-[200px] mx-auto'
                    : list.length === 2
                    ? 'grid-cols-2 max-w-sm mx-auto'
                    : 'grid-cols-3'
                }`}
              >
                {/* Rank 2 (Silver) */}
                {top2 && (
                  <div className="flex flex-col items-center order-1 sm:order-1">
                    <div className="relative mb-2 flex flex-col items-center">
                      <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white shadow-md border-2 border-slate-300">
                        <UserAvatar avatar={top2.avatar} className="h-10 w-10 sm:h-12 sm:w-12 text-2xl border-0 shadow-none bg-transparent" />
                        <span className="absolute -bottom-2 flex h-6 w-6 items-center justify-center rounded-full bg-slate-300 text-xs font-black text-slate-800 shadow-sm">
                          2
                        </span>
                      </div>
                    </div>
                    <span className="max-w-[90px] truncate text-center text-xs font-bold text-gray-900">
                      {top2.name}
                    </span>
                    <span className="text-[11px] font-black text-slate-600">
                      {top2.scoreLabel}
                    </span>
                    <div className="mt-2 h-14 w-full rounded-t-xl bg-gradient-to-t from-slate-200 to-slate-100 border-t border-slate-300 flex items-center justify-center text-slate-500 text-xs font-bold">
                      🥈 Hạng 2
                    </div>
                  </div>
                )}

                {/* Rank 1 (Gold) */}
                {top1 && (
                  <div className={`flex flex-col items-center -mt-3 ${list.length >= 3 ? 'order-2' : list.length === 2 ? 'order-1' : 'order-1'}`}>
                    <div className="relative mb-2 flex flex-col items-center">
                      <Crown className="h-6 w-6 text-amber-500 animate-bounce -mb-1" />
                      <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl bg-gradient-to-b from-amber-50 to-white shadow-lg border-2 border-amber-400 ring-4 ring-amber-400/20">
                        <UserAvatar avatar={top1.avatar} className="h-12 w-12 sm:h-14 sm:w-14 text-3xl border-0 shadow-none bg-transparent" />
                        <span className="absolute -bottom-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-xs font-black text-white shadow-md">
                          1
                        </span>
                      </div>
                    </div>
                    <span className="max-w-[100px] truncate text-center text-xs sm:text-sm font-black text-gray-950">
                      {top1.name}
                    </span>
                    <span className="text-xs font-black text-amber-600">
                      {top1.scoreLabel}
                    </span>
                    <div className="mt-2 h-20 w-full rounded-t-xl bg-gradient-to-t from-amber-300/60 to-amber-200/80 border-t-2 border-amber-400 flex items-center justify-center text-amber-800 text-xs font-black shadow-inner">
                      🥇 Quán quân
                    </div>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {top3 && (
                  <div className="flex flex-col items-center order-3">
                    <div className="relative mb-2 flex flex-col items-center">
                      <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-white shadow-md border-2 border-amber-600/40">
                        <UserAvatar avatar={top3.avatar} className="h-10 w-10 sm:h-12 sm:w-12 text-2xl border-0 shadow-none bg-transparent" />
                        <span className="absolute -bottom-2 flex h-6 w-6 items-center justify-center rounded-full bg-amber-700/80 text-xs font-black text-white shadow-sm">
                          3
                        </span>
                      </div>
                    </div>
                    <span className="max-w-[90px] truncate text-center text-xs font-bold text-gray-900">
                      {top3.name}
                    </span>
                    <span className="text-[11px] font-black text-amber-800">
                      {top3.scoreLabel}
                    </span>
                    <div className="mt-2 h-10 w-full rounded-t-xl bg-gradient-to-t from-amber-100 to-orange-50 border-t border-amber-300 flex items-center justify-center text-amber-700 text-xs font-bold">
                      🥉 Hạng 3
                    </div>
                  </div>
                )}
              </div>

              {/* Rank List #4+ */}
              {restList.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">
                    {language === 'vi' ? 'Bảng xếp hạng chi tiết' : 'Ranked Players'}
                  </h3>

                  {restList.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 rounded-2xl transition-all ${
                        entry.isCurrentUser
                          ? 'bg-indigo-50/90 border-2 border-indigo-400 ring-2 ring-indigo-400/20 shadow-xs'
                          : 'bg-gray-50/80 border border-gray-100 hover:bg-gray-100/70'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center text-xs sm:text-sm font-black text-gray-400">
                          #{entry.rank}
                        </span>

                        <UserAvatar
                          avatar={entry.avatar}
                          className="h-10 w-10 text-xl rounded-xl shadow-2xs border border-gray-200"
                        />

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs sm:text-sm font-bold text-gray-900 max-w-[120px] sm:max-w-[180px] truncate">
                              {entry.name}
                            </span>
                            {entry.isCurrentUser && (
                              <span className="rounded-md bg-indigo-600 px-1.5 py-0.2 text-[9px] font-black text-white uppercase tracking-wider">
                                {language === 'vi' ? 'Bạn' : 'You'}
                              </span>
                            )}
                            {entry.tierBadge && (
                              <span className="hidden sm:inline-block rounded-md bg-amber-100 px-1.5 py-0.2 text-[9px] font-bold text-amber-800">
                                {entry.tierBadge}
                              </span>
                            )}
                          </div>
                          {entry.secondaryInfo && (
                            <span className="text-[11px] text-gray-500 font-semibold">
                              {entry.secondaryInfo}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs sm:text-sm font-black text-indigo-600">
                          {entry.scoreLabel}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky Bottom Bar: Your Rank */}
        {userSummary ? (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white font-black text-sm shadow-xs">
                  #{userSummary.rank}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-gray-900">
                    {language === 'vi' ? 'Vị trí của bạn' : 'Your Position'}
                  </span>
                  <span className="text-[11px] text-gray-500 font-semibold">
                    {userSummary.aheadDiff || userSummary.scoreLabel}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-black text-indigo-700">
                  {userSummary.scoreLabel}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3 sm:px-6 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">
              {language === 'vi'
                ? 'Bạn chưa có thành tích ở trò chơi này'
                : 'No match records for this game yet'}
            </span>
            <Link
              href={getGameRoute(selectedGame)}
              onClick={onClose}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              {language === 'vi' ? 'Chơi ngay →' : 'Play now →'}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
