'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import { LeaderboardGame, LeaderboardDifficulty, LeaderboardEntry, UserRankSummary } from './types';
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

const ProfileAuthModal = dynamic(
  () => import('@/features/auth/ProfileAuthModal').then((mod) => mod.ProfileAuthModal),
  { ssr: false }
);

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
  const { user, guestName, avatar, isAnonymous } = useAuth();
  const [selectedGame, setSelectedGame] = useState<LeaderboardGame>(initialGame);
  const [selectedDifficulty, setSelectedDifficulty] = useState<LeaderboardDifficulty>('easy');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const supportsDifficulty = selectedGame === 'sudoku' || selectedGame === 'minesweeper';

  // Initialize with immediate local data (0ms delay)
  const initialData = getLocalLeaderboardData(
    selectedGame,
    selectedDifficulty,
    user?.id,
    guestName || (language === 'vi' ? 'Bạn' : 'You'),
    avatar
  );

  const [list, setList] = useState<LeaderboardEntry[]>(initialData.list);
  const [userSummary, setUserSummary] = useState<UserRankSummary | null>(initialData.userSummary);
  const [isFetchingCloud, setIsFetchingCloud] = useState(false);

  const loadData = useCallback(async (game: LeaderboardGame, difficulty: LeaderboardDifficulty) => {
    // 1. Instant local load
    const local = getLocalLeaderboardData(
      game,
      difficulty,
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
        difficulty,
        user?.id,
        guestName || (language === 'vi' ? 'Bạn' : 'You'),
        avatar,
        isAnonymous
      );
      setList(cloud.list);
      setUserSummary(cloud.userSummary);
    } catch {
      // Fallback already active
    } finally {
      setIsFetchingCloud(false);
    }
  }, [user?.id, guestName, avatar, language, isAnonymous]);

  useEffect(() => {
    if (isOpen) {
      loadData(selectedGame, selectedDifficulty);
    }
  }, [isOpen, selectedGame, selectedDifficulty, loadData]);

  if (!isOpen) return null;

  const top1 = list.find((i) => i.rank === 1);
  const top2 = list.find((i) => i.rank === 2);
  const top3 = list.find((i) => i.rank === 3);
  const restList = list.filter((i) => i.rank > 3);

  const getGameRoute = (game: LeaderboardGame) => {
    if (game === 'chess') return '/games/chess';
    if (game === 'caro') return '/games/caro';
    if (game === 'xiangqi') return '/games/xiangqi';
    if (game === 'go') return '/games/go';
    if (game === 'othello') return '/games/othello';
    if (game === 'snake') return '/games/snake';
    if (game === 'game2048') return '/games/game2048';
    if (game === 'minesweeper') return '/games/minesweeper';
    if (game === 'brick_breaker') return '/games/brick-breaker';
    if (game === 't_rex_runner') return '/games/t-rex-runner';
    if (game === 'flappy_bird') return '/games/flappy-bird';
    if (game === 'block_blast') return '/games/block-blast';
    if (game === 'tetris') return '/games/tetris';
    return '/games/sudoku';
  };

  const getGameTitle = (game: LeaderboardGame) => {
    if (game === 'chess') return language === 'vi' ? 'Cờ vua' : 'Chess';
    if (game === 'caro') return language === 'vi' ? 'Cờ Caro' : 'Caro';
    if (game === 'xiangqi') return language === 'vi' ? 'Cờ Tướng' : 'Xiangqi';
    if (game === 'go') return language === 'vi' ? 'Cờ Vây' : 'Go';
    if (game === 'othello') return language === 'vi' ? 'Cờ Lật' : 'Othello';
    if (game === 'snake') return language === 'vi' ? 'Rắn săn mồi' : 'Snake';
    if (game === 'game2048') return '2048';
    if (game === 'minesweeper') return language === 'vi' ? 'Dò Mìn' : 'Minesweeper';
    if (game === 'brick_breaker') return language === 'vi' ? 'Phá Gạch' : 'Brick Breaker';
    if (game === 't_rex_runner') return language === 'vi' ? 'Khủng Long T-Rex' : 'T-Rex Runner';
    if (game === 'flappy_bird') return 'Flappy Bird';
    if (game === 'block_blast') return 'Block Blast';
    if (game === 'tetris') return 'Tetris';
    return 'Sudoku';
  };

  const getDifficultyLabel = (diff: LeaderboardDifficulty) => {
    if (diff === 'easy') return language === 'vi' ? 'Dễ' : 'Easy';
    if (diff === 'medium') return language === 'vi' ? 'Trung bình' : 'Medium';
    return language === 'vi' ? 'Khó' : 'Hard';
  };

  const fullGameTitle = supportsDifficulty
    ? `${getGameTitle(selectedGame)} (${getDifficultyLabel(selectedDifficulty)})`
    : getGameTitle(selectedGame);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="pixel-box-lg relative flex max-h-[92vh] w-full max-w-xl flex-col overflow-hidden bg-[#FFFDF8] animate-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="relative border-b-2 border-zinc-900 bg-amber-300 px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center bg-zinc-900 text-amber-400 border-2 border-zinc-900 shadow-pixel-xs">
                <Trophy className="h-6 w-6 fill-current" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-pixel text-lg sm:text-xl font-bold text-zinc-950 uppercase tracking-wide">
                    {language === 'vi' ? 'BẢNG VÀNG CAO THỦ' : 'ARCADE HIGH SCORES'}
                  </h2>
                  {isFetchingCloud && (
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-900" />
                  )}
                </div>
                <p className="text-xs font-mono text-zinc-800">
                  {language === 'vi'
                    ? 'Thành tích thi đấu thực của người chơi'
                    : 'Authentic player competitive records'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="pixel-btn flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center bg-white text-zinc-900 hover:bg-rose-100 outline-none"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Game Switcher Tabs */}
          <div className="mt-4 grid grid-cols-4 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedGame('chess')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'chess'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span>♔</span>
              <span>{language === 'vi' ? 'Cờ vua' : 'Chess'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('caro')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'caro'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span className={selectedGame === 'caro' ? 'text-amber-300 font-black' : 'text-rose-600 font-black'}>✕</span>
              <span>{language === 'vi' ? 'Caro' : 'Caro'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('xiangqi')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'xiangqi'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span className={selectedGame === 'xiangqi' ? 'text-amber-300 font-bold' : 'text-rose-600 font-bold'}>帥</span>
              <span>{language === 'vi' ? 'Tướng' : 'Xiangqi'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('go')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'go'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span className="text-sm">⚫</span>
              <span>{language === 'vi' ? 'Cờ Vây' : 'Go'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('othello')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'othello'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span className="text-sm">🟢</span>
              <span>{language === 'vi' ? 'Cờ Lật' : 'Othello'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('sudoku')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'sudoku'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span>🧩</span>
              <span>Sudoku</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('snake')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'snake'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span>🐍</span>
              <span>{language === 'vi' ? 'Rắn' : 'Snake'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('game2048')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'game2048'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span className={selectedGame === 'game2048' ? 'text-amber-300 font-bold' : 'text-amber-600 font-bold'}>🔢</span>
              <span>2048</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('minesweeper')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'minesweeper'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span>💣</span>
              <span>{language === 'vi' ? 'Dò Mìn' : 'Mines'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('brick_breaker')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'brick_breaker'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span>🧱</span>
              <span>{language === 'vi' ? 'Phá Gạch' : 'Bricks'}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('t_rex_runner')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 't_rex_runner'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span>🦖</span>
              <span>T-Rex</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('flappy_bird')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'flappy_bird'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span>🐦</span>
              <span>Flappy</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('block_blast')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'block_blast'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span>🧱</span>
              <span>Block Blast</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedGame('tetris')}
              className={`pixel-btn flex items-center justify-center gap-1 min-h-[40px] text-xs font-bold ${
                selectedGame === 'tetris'
                  ? 'bg-indigo-600 text-amber-300'
                  : 'bg-white text-zinc-800 hover:bg-zinc-100'
              }`}
            >
              <span>👾</span>
              <span>Tetris</span>
            </button>
          </div>

          {/* Difficulty Sub-tabs (Sudoku & Minesweeper) */}
          {supportsDifficulty && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedDifficulty('easy')}
                className={`pixel-btn flex items-center gap-1 px-3 py-1 text-xs font-bold transition-all ${
                  selectedDifficulty === 'easy'
                    ? 'bg-emerald-600 text-white border-2 border-zinc-950 shadow-pixel-xs'
                    : 'bg-white text-zinc-700 hover:bg-emerald-50'
                }`}
              >
                <span>🟢</span>
                <span>{language === 'vi' ? 'Dễ' : 'Easy'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDifficulty('medium')}
                className={`pixel-btn flex items-center gap-1 px-3 py-1 text-xs font-bold transition-all ${
                  selectedDifficulty === 'medium'
                    ? 'bg-amber-500 text-zinc-950 border-2 border-zinc-950 shadow-pixel-xs'
                    : 'bg-white text-zinc-700 hover:bg-amber-50'
                }`}
              >
                <span>🟡</span>
                <span>{language === 'vi' ? 'Trung bình' : 'Medium'}</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedDifficulty('hard')}
                className={`pixel-btn flex items-center gap-1 px-3 py-1 text-xs font-bold transition-all ${
                  selectedDifficulty === 'hard'
                    ? 'bg-rose-600 text-white border-2 border-zinc-950 shadow-pixel-xs'
                    : 'bg-white text-zinc-700 hover:bg-rose-50'
                }`}
              >
                <span>🔴</span>
                <span>{language === 'vi' ? 'Khó' : 'Hard'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-4 py-5">
          {list.length === 0 ? (
            /* Empty State: 100% genuine message */
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center bg-amber-100 text-amber-700 mb-4 border-2 border-zinc-900 shadow-pixel-sm">
                <Sparkles className="h-8 w-8 animate-pulse" />
              </div>
              <h3 className="font-pixel text-base sm:text-lg font-bold text-zinc-900 mb-1">
                {language === 'vi'
                  ? `Chưa có thành tích cho ${fullGameTitle}`
                  : `No recorded scores for ${fullGameTitle} yet`}
              </h3>
              <p className="text-xs sm:text-sm font-mono text-zinc-600 max-w-xs mb-6 leading-relaxed">
                {language === 'vi'
                  ? 'Hãy tham gia ván đấu đầu tiên để trở thành quán quân đầu tiên trên bảng vàng!'
                  : 'Play your first match to claim the inaugural #1 champion spot!'}
              </p>
              <Link
                href={getGameRoute(selectedGame)}
                onClick={onClose}
                className="pixel-btn inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-bold text-amber-300"
              >
                <Play className="h-4 w-4 fill-current" />
                <span>{language === 'vi' ? 'CHƠI NGAY' : 'PLAY NOW'}</span>
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
                  <div className={`flex flex-col items-center ${list.length === 2 ? 'order-2' : 'order-1'}`}>
                    <div className="relative mb-2 flex flex-col items-center">
                      <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center bg-white border-2 border-zinc-900 shadow-pixel-sm">
                        <UserAvatar avatar={top2.avatar} className="h-10 w-10 sm:h-12 sm:w-12 text-2xl border-0 shadow-none bg-transparent" />
                        <span className="absolute -bottom-2 flex h-6 w-6 items-center justify-center bg-slate-300 border-2 border-zinc-900 font-pixel text-xs font-bold text-zinc-900">
                          2
                        </span>
                      </div>
                    </div>
                    <span className="max-w-[90px] truncate text-center font-pixel text-xs font-bold text-zinc-900">
                      {top2.name}
                    </span>
                    {top2.isCurrentUser && (
                      <span className={`border border-zinc-900 px-1.5 py-0.2 font-pixel text-[8px] font-bold uppercase ${
                        isAnonymous ? 'bg-amber-300 text-zinc-950' : 'bg-indigo-600 text-amber-300'
                      }`}>
                        {isAnonymous ? (language === 'vi' ? 'BẠN (CHƯA LƯU)' : 'YOU (GUEST)') : (language === 'vi' ? 'BẠN' : 'YOU')}
                      </span>
                    )}
                    <span className="font-mono text-[11px] font-bold text-slate-700">
                      {top2.scoreLabel}
                    </span>
                    <div className="mt-2 h-14 w-full bg-slate-200 border-2 border-zinc-900 shadow-pixel-xs flex items-center justify-center font-pixel text-zinc-800 text-xs font-bold">
                      🥈 2ND
                    </div>
                  </div>
                )}

                {/* Rank 1 (Gold) */}
                {top1 && (
                  <div className={`flex flex-col items-center -mt-3 ${list.length >= 3 ? 'order-2' : 'order-1'}`}>
                    <div className="relative mb-2 flex flex-col items-center">
                      <Crown className="h-6 w-6 text-amber-500 animate-bounce -mb-1" />
                      <div className="relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center bg-amber-100 border-2 border-zinc-900 shadow-pixel">
                        <UserAvatar avatar={top1.avatar} className="h-12 w-12 sm:h-14 sm:w-14 text-3xl border-0 shadow-none bg-transparent" />
                        <span className="absolute -bottom-2.5 flex h-7 w-7 items-center justify-center bg-amber-400 border-2 border-zinc-900 font-pixel text-xs font-bold text-zinc-950">
                          1
                        </span>
                      </div>
                    </div>
                    <span className="max-w-[100px] truncate text-center font-pixel text-xs sm:text-sm font-bold text-zinc-950">
                      {top1.name}
                    </span>
                    {top1.isCurrentUser && (
                      <span className={`border border-zinc-900 px-1.5 py-0.2 font-pixel text-[8px] font-bold uppercase ${
                        isAnonymous ? 'bg-amber-300 text-zinc-950' : 'bg-indigo-600 text-amber-300'
                      }`}>
                        {isAnonymous ? (language === 'vi' ? 'BẠN (CHƯA LƯU)' : 'YOU (GUEST)') : (language === 'vi' ? 'BẠN' : 'YOU')}
                      </span>
                    )}
                    <span className="font-mono text-xs font-bold text-amber-700">
                      {top1.scoreLabel}
                    </span>
                    <div className="mt-2 h-20 w-full bg-amber-300 border-2 border-zinc-900 shadow-pixel-sm flex items-center justify-center font-pixel text-zinc-950 text-xs font-bold">
                      🥇 1ST CHAMP
                    </div>
                  </div>
                )}

                {/* Rank 3 (Bronze) */}
                {top3 && (
                  <div className="flex flex-col items-center order-3">
                    <div className="relative mb-2 flex flex-col items-center">
                      <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center bg-white border-2 border-zinc-900 shadow-pixel-sm">
                        <UserAvatar avatar={top3.avatar} className="h-10 w-10 sm:h-12 sm:w-12 text-2xl border-0 shadow-none bg-transparent" />
                        <span className="absolute -bottom-2 flex h-6 w-6 items-center justify-center bg-orange-300 border-2 border-zinc-900 font-pixel text-xs font-bold text-zinc-950">
                          3
                        </span>
                      </div>
                    </div>
                    <span className="max-w-[90px] truncate text-center font-pixel text-xs font-bold text-zinc-900">
                      {top3.name}
                    </span>
                    {top3.isCurrentUser && (
                      <span className={`border border-zinc-900 px-1.5 py-0.2 font-pixel text-[8px] font-bold uppercase ${
                        isAnonymous ? 'bg-amber-300 text-zinc-950' : 'bg-indigo-600 text-amber-300'
                      }`}>
                        {isAnonymous ? (language === 'vi' ? 'BẠN (CHƯA LƯU)' : 'YOU (GUEST)') : (language === 'vi' ? 'BẠN' : 'YOU')}
                      </span>
                    )}
                    <span className="font-mono text-[11px] font-bold text-amber-800">
                      {top3.scoreLabel}
                    </span>
                    <div className="mt-2 h-10 w-full bg-orange-200 border-2 border-zinc-900 shadow-pixel-xs flex items-center justify-center font-pixel text-zinc-900 text-xs font-bold">
                      🥉 3RD
                    </div>
                  </div>
                )}
              </div>

              {/* Rank List #4+ */}
              {restList.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="font-pixel text-xs font-bold uppercase tracking-wider text-zinc-600 px-1">
                    {language === 'vi' ? 'BẢNG XẾP HẠNG CHI TIẾT' : 'RANKED PLAYERS'}
                  </h3>

                  {restList.map((entry) => (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between p-3 border-2 border-zinc-900 shadow-pixel-xs ${
                        entry.isCurrentUser
                          ? 'bg-indigo-100'
                          : 'bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 text-center font-pixel text-xs sm:text-sm font-bold text-zinc-700">
                          #{entry.rank}
                        </span>

                        <UserAvatar
                          avatar={entry.avatar}
                          className="h-10 w-10 text-xl"
                        />

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-pixel text-xs sm:text-sm font-bold text-zinc-900 max-w-[120px] sm:max-w-[180px] truncate">
                              {entry.name}
                            </span>
                            {entry.isCurrentUser && (
                              <span
                                className={`border border-zinc-900 px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase ${
                                  isAnonymous
                                    ? 'bg-amber-300 text-zinc-950'
                                    : 'bg-indigo-600 text-amber-300'
                                }`}
                              >
                                {isAnonymous
                                  ? (language === 'vi' ? 'BẠN (CHƯA LƯU)' : 'YOU (GUEST)')
                                  : (language === 'vi' ? 'BẠN' : 'YOU')}
                              </span>
                            )}
                            {entry.tierBadge && (
                              <span className="hidden sm:inline-block bg-amber-200 border border-zinc-900 px-1.5 py-0.5 font-pixel text-[9px] font-bold text-zinc-900">
                                {entry.tierBadge}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-pixel text-xs sm:text-sm font-bold text-indigo-700">
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

        {/* CTA Banner for Anonymous Guests */}
        {isAnonymous && (
          <div className="border-t-2 border-zinc-900 bg-amber-200 px-4 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 text-left">
              <span className="text-xl">🏆</span>
              <p className="text-xs font-mono text-zinc-950 leading-snug">
                <span className="font-bold text-amber-950">
                  {language === 'vi' ? 'Chỉ tài khoản đăng ký mới được lưu BXH.' : 'Only registered accounts are saved to Leaderboard.'}
                </span>{' '}
                <span className="text-zinc-800">
                  {language === 'vi'
                    ? 'Đăng nhập ngay để ghi danh vĩnh viễn thành tích của bạn!'
                    : 'Sign in now to record your scores permanently!'}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="pixel-btn whitespace-nowrap bg-indigo-600 hover:bg-indigo-500 text-amber-300 font-pixel text-xs font-bold px-3 py-1.5 shadow-pixel-xs flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>👑</span>
              <span>{language === 'vi' ? 'ĐĂNG NHẬP / LƯU ĐIỂM' : 'SIGN IN / SAVE'}</span>
            </button>
          </div>
        )}

        {/* Sticky Bottom Bar: Your Rank */}
        {userSummary ? (
          <div className="border-t-2 border-zinc-900 bg-[#ECE8DD] px-4 py-3 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center bg-indigo-600 text-amber-300 border-2 border-zinc-900 font-pixel font-bold text-sm">
                  #{userSummary.rank}
                </div>
                <div className="flex flex-col">
                  <span className="font-pixel text-xs font-bold text-zinc-900 uppercase">
                    {language === 'vi' ? 'VỊ TRÍ CỦA BẠN' : 'YOUR RANK'}
                    {isAnonymous && (
                      <span className="ml-1.5 font-mono text-[10px] text-amber-800 lowercase font-bold">
                        ({language === 'vi' ? 'xem trước' : 'preview'})
                      </span>
                    )}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-600 font-semibold">
                    {userSummary.aheadDiff || userSummary.scoreLabel}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className="font-pixel text-xs sm:text-sm font-bold text-indigo-800">
                  {userSummary.scoreLabel}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="border-t-2 border-zinc-900 bg-[#ECE8DD] px-4 py-3 sm:px-6 flex items-center justify-between">
            <span className="text-xs font-mono text-zinc-700 font-bold">
              {language === 'vi'
                ? 'Chưa có thành tích ở bộ môn này'
                : 'No match records for this game yet'}
            </span>
            <Link
              href={getGameRoute(selectedGame)}
              onClick={onClose}
              className="font-pixel text-xs font-bold text-indigo-700 hover:underline uppercase"
            >
              {language === 'vi' ? 'CHƠI NGAY →' : 'PLAY NOW →'}
            </Link>
          </div>
        )}

        {/* Auth Modal triggered from Leaderboard CTA */}
        {isAuthModalOpen && (
          <ProfileAuthModal
            isOpen={isAuthModalOpen}
            onClose={() => {
              setIsAuthModalOpen(false);
              loadData(selectedGame, selectedDifficulty);
            }}
            defaultTab="account"
          />
        )}
      </div>
    </div>
  );
}
