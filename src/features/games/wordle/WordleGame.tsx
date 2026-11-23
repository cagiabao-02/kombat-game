'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { sounds } from '@/lib/sound/soundService';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import { syncLeaderboardScoreForGame } from '@/features/leaderboard/leaderboardService';
import { Share2, Check, RotateCcw, Calendar, Infinity as InfinityIcon, Trophy, Delete } from 'lucide-react';
import { LetterStatus, WordleGameState, WordleMode } from './types';
import {
  evaluateGuess,
  getDailyWord,
  getKeyboardStatuses,
  getRandomWord,
  getTodayDateString,
} from './wordleWords';
import { loadWordleGame, saveWordleGame } from './wordleStorage';
import { getWordleStats, recordWordleResult, WordleStats } from './wordleStatsService';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

const MAX_ATTEMPTS = 6;

function createFreshState(mode: WordleMode, excludeWord?: string): WordleGameState {
  const today = getTodayDateString();
  return {
    mode,
    dailyDate: today,
    targetWord: mode === 'daily' ? getDailyWord(today) : getRandomWord(excludeWord),
    guesses: [],
    currentGuess: '',
    status: 'playing',
  };
}

function getTileColorClass(status: LetterStatus): string {
  switch (status) {
    case 'correct':
      return 'bg-emerald-500 text-white border-zinc-900';
    case 'present':
      return 'bg-amber-400 text-zinc-950 border-zinc-900';
    case 'absent':
      return 'bg-zinc-500 text-white border-zinc-900';
    default:
      return 'bg-white text-zinc-900 border-zinc-900';
  }
}

export const WordleGame: React.FC = () => {
  const { language } = useLanguage();
  const [mode, setMode] = useState<WordleMode>('daily');
  const [state, setState] = useState<WordleGameState>(() => {
    const today = getTodayDateString();
    return loadWordleGame('daily', today) || createFreshState('daily');
  });
  const [stats, setStats] = useState<WordleStats>(() => getWordleStats());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [shakeRow, setShakeRow] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 1800);
  }, []);

  useEffect(() => {
    saveWordleGame(state);
  }, [state]);

  const switchMode = (nextMode: WordleMode) => {
    if (nextMode === mode) return;
    setMode(nextMode);
    const today = getTodayDateString();
    const saved = loadWordleGame(nextMode, today);
    setState(saved || createFreshState(nextMode));
    setCopiedShare(false);
  };

  const handleNewEndlessWord = () => {
    setCopiedShare(false);
    setState((prev) => createFreshState('endless', prev.targetWord));
  };

  const handleKeyPress = useCallback(
    (key: string) => {
      if (state.status !== 'playing') return;

      if (key === 'BACK' || key === 'BACKSPACE') {
        if (state.currentGuess.length === 0) return;
        sounds.playClick();
        setState((prev) => ({
          ...prev,
          currentGuess: prev.currentGuess.slice(0, -1),
        }));
        return;
      }

      if (key === 'ENTER') {
        if (state.currentGuess.length < 5) {
          sounds.playError();
          setShakeRow(true);
          setTimeout(() => setShakeRow(false), 450);
          showToast(language === 'vi' ? 'Cần đủ 5 chữ cái!' : 'Not enough letters!');
          return;
        }

        const guess = state.currentGuess.toUpperCase();
        const nextGuesses = [...state.guesses, guess];
        const won = guess === state.targetWord;
        const lost = !won && nextGuesses.length >= MAX_ATTEMPTS;
        const nextStatus = won ? 'won' : lost ? 'lost' : 'playing';

        setState((prev) => ({
          ...prev,
          guesses: nextGuesses,
          currentGuess: '',
          status: nextStatus,
        }));

        if (won) {
          sounds.playVictory();
          const updated = recordWordleResult(true, nextGuesses.length);
          setStats(updated);
          syncLeaderboardScoreForGame('wordle').catch(() => {});
        } else if (lost) {
          sounds.playDefeat();
          const updated = recordWordleResult(false, MAX_ATTEMPTS);
          setStats(updated);
        } else {
          sounds.playClick();
        }
        return;
      }

      if (/^[A-Z]$/.test(key) && state.currentGuess.length < 5) {
        sounds.playClick();
        setState((prev) => ({
          ...prev,
          currentGuess: prev.currentGuess + key,
        }));
      }
    },
    [language, showToast, state]
  );

  // Physical keyboard support
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const upper = e.key.toUpperCase();
      if (upper === 'ENTER' || upper === 'BACKSPACE' || /^[A-Z]$/.test(upper)) {
        handleKeyPress(upper);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyPress]);

  const handleShareResult = () => {
    const rows = state.guesses
      .map((g) =>
        evaluateGuess(g, state.targetWord)
          .map((s) => (s === 'correct' ? '🟩' : s === 'present' ? '🟨' : '⬛'))
          .join('')
      )
      .join('\n');
    const scoreText = state.status === 'won' ? `${state.guesses.length}/${MAX_ATTEMPTS}` : `X/${MAX_ATTEMPTS}`;
    const header =
      state.mode === 'daily'
        ? `Kombat Wordle (${state.dailyDate}) ${scoreText}`
        : `Kombat Wordle Endless ${scoreText}`;
    navigator.clipboard.writeText(`${header}\n\n${rows}\n\nhttps://kombat-red.vercel.app/games/wordle`).catch(() => {});
    setCopiedShare(true);
    setTimeout(() => setCopiedShare(false), 2000);
  };

  const keyboardStatuses = getKeyboardStatuses(state.guesses, state.targetWord);
  const winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  return (
    <div className="w-full max-w-md mx-auto space-y-3 select-none">
      <PixelFxOverlay active={state.status === 'won'} />

      {/* Header & Mode Switch */}
      <div className="pixel-box bg-[#FFFDF8] border-3 border-zinc-900 p-3 shadow-[4px_4px_0px_#000] space-y-2.5">
        <div className="flex items-center justify-between">
          <h1 className="font-pixel text-xl font-black tracking-wider text-zinc-900 uppercase">
            WORDLE 5×6
          </h1>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-700">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>
              Streak: <strong className="text-indigo-700">{stats.currentStreak}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => switchMode('daily')}
            className={`pixel-btn py-1.5 px-2 font-pixel text-xs font-bold flex items-center justify-center gap-1.5 ${
              mode === 'daily'
                ? 'bg-indigo-600 text-amber-300'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Từ Hôm Nay' : 'Daily Word'}</span>
          </button>
          <button
            type="button"
            onClick={() => switchMode('endless')}
            className={`pixel-btn py-1.5 px-2 font-pixel text-xs font-bold flex items-center justify-center gap-1.5 ${
              mode === 'endless'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <InfinityIcon className="w-3.5 h-3.5" />
            <span>{language === 'vi' ? 'Chơi Vô Tận' : 'Endless'}</span>
          </button>
        </div>
      </div>

      {/* Toast message */}
      {toastMsg && (
        <div className="bg-zinc-900 text-amber-300 font-pixel text-xs font-bold text-center py-1.5 px-3 border-2 border-amber-400">
          {toastMsg}
        </div>
      )}

      {/* 6x5 Word Grid */}
      <div className="pixel-box bg-[#FFFDF8] border-3 border-zinc-900 p-3 sm:p-4 shadow-[4px_4px_0px_#000]">
        <div className="grid grid-rows-6 gap-1.5 sm:gap-2 max-w-[300px] mx-auto">
          {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIdx) => {
            const isSubmitted = rowIdx < state.guesses.length;
            const isCurrent = rowIdx === state.guesses.length && state.status === 'playing';
            const word = isSubmitted
              ? state.guesses[rowIdx]
              : isCurrent
                ? state.currentGuess
                : '';
            const statuses = isSubmitted
              ? evaluateGuess(word, state.targetWord)
              : (['empty', 'empty', 'empty', 'empty', 'empty'] as LetterStatus[]);

            return (
              <div
                key={rowIdx}
                className={`grid grid-cols-5 gap-1.5 sm:gap-2 ${
                  isCurrent && shakeRow ? 'animate-bounce' : ''
                }`}
              >
                {Array.from({ length: 5 }).map((__, colIdx) => {
                  const char = word[colIdx] || '';
                  const colorClass = isSubmitted
                    ? getTileColorClass(statuses[colIdx])
                    : char
                      ? 'bg-amber-50 text-zinc-950 border-zinc-900 scale-105'
                      : 'bg-white text-zinc-900 border-zinc-300';

                  return (
                    <div
                      key={colIdx}
                      className={`aspect-square border-2 flex items-center justify-center font-pixel text-xl sm:text-2xl font-black uppercase transition-all ${colorClass}`}
                    >
                      {char}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Result Banner when finished */}
      {state.status !== 'playing' && (
        <div className="pixel-box bg-white border-3 border-zinc-900 p-3.5 text-center space-y-3 shadow-[4px_4px_0px_#000]">
          <p className="font-pixel text-base font-black text-zinc-900">
            {state.status === 'won'
              ? language === 'vi'
                ? `🎉 XUẤT SẮC! ĐOÁN TRÚNG SAU ${state.guesses.length}/6 LƯỢT`
                : `🎉 BRILLIANT! SOLVED IN ${state.guesses.length}/6`
              : language === 'vi'
                ? `💀 HẾT LƯỢT! TỪ BÍ MẬT LÀ: ${state.targetWord}`
                : `💀 GAME OVER! WORD WAS: ${state.targetWord}`}
          </p>

          <div className="grid grid-cols-4 gap-2 bg-zinc-100 border-2 border-zinc-900 p-2 text-center font-mono text-xs">
            <div>
              <p className="font-black text-sm">{stats.played}</p>
              <p className="text-[10px] text-zinc-600">{language === 'vi' ? 'Đã chơi' : 'Played'}</p>
            </div>
            <div>
              <p className="font-black text-sm text-emerald-700">{winRate}%</p>
              <p className="text-[10px] text-zinc-600">{language === 'vi' ? 'Tỉ lệ thắng' : 'Win %'}</p>
            </div>
            <div>
              <p className="font-black text-sm text-indigo-700">{stats.currentStreak}</p>
              <p className="text-[10px] text-zinc-600">Streak</p>
            </div>
            <div>
              <p className="font-black text-sm text-amber-600">{stats.bestStreak}</p>
              <p className="text-[10px] text-zinc-600">{language === 'vi' ? 'Kỷ lục' : 'Best'}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleShareResult}
              className="pixel-btn flex-1 bg-indigo-600 hover:bg-indigo-500 text-amber-300 py-2 font-pixel text-xs font-bold flex items-center justify-center gap-1.5"
            >
              {copiedShare ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              <span>
                {copiedShare
                  ? language === 'vi'
                    ? 'ĐÃ CHÉP KẾT QUẢ!'
                    : 'COPIED!'
                  : language === 'vi'
                    ? 'CHIA SẺ Ô VUÔNG'
                    : 'SHARE RESULT'}
              </span>
            </button>

            {mode === 'endless' ? (
              <button
                type="button"
                onClick={handleNewEndlessWord}
                className="pixel-btn flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 font-pixel text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>{language === 'vi' ? 'TỪ TIẾP THEO' : 'NEXT WORD'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => switchMode('endless')}
                className="pixel-btn flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2 font-pixel text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <InfinityIcon className="w-4 h-4" />
                <span>{language === 'vi' ? 'CHƠI VÔ TẬN' : 'PLAY ENDLESS'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Virtual QWERTY Keyboard */}
      <div className="space-y-1.5 pt-1">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1 sm:gap-1.5">
            {row.map((key) => {
              const isAction = key === 'ENTER' || key === 'BACK';
              const status = !isAction ? keyboardStatuses[key] || 'empty' : 'empty';
              const keyColor =
                status === 'correct'
                  ? 'bg-emerald-500 text-white border-zinc-900'
                  : status === 'present'
                    ? 'bg-amber-400 text-zinc-950 border-zinc-900'
                    : status === 'absent'
                      ? 'bg-zinc-500 text-white border-zinc-900'
                      : isAction
                        ? 'bg-indigo-100 hover:bg-indigo-200 text-indigo-950 border-zinc-900'
                        : 'bg-white hover:bg-zinc-100 text-zinc-900 border-zinc-900';

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleKeyPress(key)}
                  className={`border-2 font-pixel font-bold text-xs sm:text-sm h-11 sm:h-12 flex items-center justify-center shadow-[0_2px_0_#18181b] active:translate-y-[1px] active:shadow-none transition-all ${
                    isAction ? 'px-2.5 sm:px-3.5 text-[11px]' : 'flex-1 max-w-[38px]'
                  } ${keyColor}`}
                >
                  {key === 'BACK' ? <Delete className="w-4 h-4" /> : key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
