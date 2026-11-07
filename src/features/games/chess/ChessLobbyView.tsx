'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Plus,
  Users,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Clock,
  Zap,
  CheckCircle2,
  X,
  Bot,
} from 'lucide-react';
import { BotDifficulty } from './types';
import { ChessStatsCard } from './ChessStatsCard';

interface ChessLobbyViewProps {
  onCreateRoom: (timeControl: number) => void;
  onJoinRoom: (code: string) => void;
  onStartQuickMatch: (timeControl: number) => void;
  onCancelQuickMatch: () => void;
  onStartBotMatch: (
    difficulty: BotDifficulty,
    playerColor: 'white' | 'black' | 'random',
    timeControl: number
  ) => void;
  isCreating: boolean;
  isJoining: boolean;
  isSearchingMatch: boolean;
  searchElapsedSeconds: number;
  matchFoundOpponentName?: string | null;
  errorMessage?: string | null;
}

export function ChessLobbyView({
  onCreateRoom,
  onJoinRoom,
  onStartQuickMatch,
  onCancelQuickMatch,
  onStartBotMatch,
  isCreating,
  isJoining,
  isSearchingMatch,
  searchElapsedSeconds,
  matchFoundOpponentName,
  errorMessage,
}: ChessLobbyViewProps) {
  const { t, language } = useLanguage();
  const [inputCode, setInputCode] = useState('');
  const [selectedTime, setSelectedTime] = useState<number>(300); // Mặc định 5 phút
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [botColor, setBotColor] = useState<'white' | 'black' | 'random'>('white');

  const timeOptions = [
    { value: 180, label: t.chess.time3m },
    { value: 300, label: t.chess.time5m },
    { value: 600, label: t.chess.time10m },
    { value: 0, label: t.chess.timeUnlimited },
  ];

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim().length >= 4) {
      onJoinRoom(inputCode.trim().toUpperCase());
    }
  };

  const formatQueueTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{language === 'vi' ? 'Đấu trí 1v1 Realtime' : 'Realtime 1v1 Showdown'}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          {t.chess.title}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {language === 'vi'
            ? 'Ghép trận nhanh cùng đối thủ hoặc tạo phòng riêng để so tài cùng bạn bè.'
            : 'Quick match with online players or create a private room to challenge friends.'}
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* Player Stats Widget */}
      <ChessStatsCard />

      {/* Action Cards */}
      <div className="flex flex-col gap-5">
        {/* CARD 1: QUICK MATCH (HERO CARD) */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-indigo-500 bg-gradient-to-b from-indigo-50/60 to-white p-6 shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-black text-gray-900">{t.chess.quickMatch}</h3>
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                    {language === 'vi' ? 'Khuyên dùng' : 'Recommended'}
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  {t.chess.quickMatchDesc}
                </p>
              </div>
            </div>
          </div>

          {/* Time control selection */}
          <div className="mb-4">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              <span>{t.chess.timeControl}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTime(opt.value)}
                  className={`rounded-xl border py-2 px-2.5 text-center text-xs font-semibold transition-all ${
                    selectedTime === opt.value
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={isCreating || isJoining || isSearchingMatch}
            onClick={() => onStartQuickMatch(selectedTime)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3.5 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
          >
            <Zap className="h-4 w-4" />
            <span>{t.chess.findMatch}</span>
          </button>
        </div>

        {/* Divider 1 */}
        <div className="relative flex items-center justify-center my-1">
          <div className="w-full border-t border-gray-200" />
          <span className="absolute bg-[#F6F7FB] px-3 text-xs font-bold uppercase text-gray-400">
            {language === 'vi' ? 'HOẶC ĐẤU VỚI MÁY' : 'OR PLAY VS BOT'}
          </span>
        </div>

        {/* CARD BOT: PLAY WITH AI */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-gray-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-purple-700 shadow-sm">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-gray-900 text-sm">{t.chess.playWithBot}</h3>
                <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700 uppercase">
                  Offline
                </span>
              </div>
              <p className="text-xs text-gray-500">
                {t.chess.botDesc}
              </p>
            </div>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-bold text-gray-700">
              {t.chess.difficulty}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as BotDifficulty[]).map((diff) => (
                <button
                  key={diff}
                  type="button"
                  onClick={() => setBotDifficulty(diff)}
                  className={`rounded-xl border py-2 px-1 text-center text-xs font-semibold transition-all ${
                    botDifficulty === diff
                      ? 'border-purple-600 bg-purple-600 text-white shadow-sm ring-2 ring-purple-200'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {diff === 'easy'
                    ? t.chess.botEasy
                    : diff === 'medium'
                    ? t.chess.botMedium
                    : t.chess.botHard}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-4">
            <label className="mb-1.5 block text-xs font-bold text-gray-700">
              {t.chess.chooseColor}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { val: 'white', label: t.chess.colorWhite },
                { val: 'random', label: t.chess.colorRandom },
                { val: 'black', label: t.chess.colorBlack },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => setBotColor(opt.val as any)}
                  className={`rounded-xl border py-2 px-1 text-center text-xs font-semibold transition-all ${
                    botColor === opt.val
                      ? 'border-purple-600 bg-purple-600 text-white shadow-sm ring-2 ring-purple-200'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Bot Game Button */}
          <button
            type="button"
            disabled={isCreating || isJoining || isSearchingMatch}
            onClick={() => onStartBotMatch(botDifficulty, botColor, selectedTime)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-purple-700 active:scale-95 disabled:opacity-50"
          >
            <Bot className="h-4 w-4" />
            <span>{t.chess.startBotMatch}</span>
          </button>
        </div>

        {/* Divider 2 */}
        <div className="relative flex items-center justify-center my-1">
          <div className="w-full border-t border-gray-200" />
          <span className="absolute bg-[#F6F7FB] px-3 text-xs font-bold uppercase text-gray-400">
            {language === 'vi' ? 'HOẶC PHÒNG RIÊNG' : 'OR PRIVATE ROOM'}
          </span>
        </div>

        {/* CARD 2: CREATE PRIVATE ROOM */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-gray-300">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
                <Plus className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">{t.chess.createRoom}</h3>
                <p className="text-xs text-gray-500 truncate">
                  {language === 'vi' ? 'Tạo phòng lấy mã mời gửi bạn bè' : 'Create private room to invite friends'}
                </p>
              </div>
            </div>

            <button
              type="button"
              disabled={isCreating || isJoining || isSearchingMatch}
              onClick={() => onCreateRoom(selectedTime)}
              className="shrink-0 whitespace-nowrap rounded-xl border border-gray-300 bg-white px-3.5 sm:px-4 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 disabled:opacity-50"
            >
              {isCreating ? t.common.loading : t.chess.createRoom}
            </button>
          </div>
        </div>

        {/* CARD 3: JOIN EXISTING ROOM */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm transition-all hover:border-gray-300">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-gray-900 text-sm">{t.chess.joinRoom}</h3>
              <p className="text-xs text-gray-500">
                {language === 'vi' ? 'Nhập mã 6 ký tự do bạn bè gửi' : 'Enter 6-char code from friend'}
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinSubmit} className="flex items-center gap-2">
            <input
              type="text"
              maxLength={8}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="VD: 8K2M9A"
              className="min-w-0 flex-1 rounded-xl border border-gray-300 px-3 py-2.5 text-center font-mono text-sm sm:text-base font-bold tracking-widest text-gray-900 uppercase placeholder:text-gray-400 placeholder:tracking-normal focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={isJoining || isCreating || isSearchingMatch || inputCode.trim().length < 4}
              className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-gray-900 px-4 sm:px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95 disabled:opacity-50"
            >
              <span>{isJoining ? t.common.loading : t.chess.joinButton}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>{t.app.loginNotice}</span>
      </div>

      {/* MATCHMAKING SEARCHING OVERLAY */}
      {isSearchingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-indigo-100 animate-scale-up">
            {matchFoundOpponentName ? (
              // Match Found View
              <div>
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4 animate-bounce">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">
                  {t.chess.matchFound}
                </h3>
                <p className="mt-2 text-sm text-gray-600 font-medium">
                  {language === 'vi'
                    ? `Đang kết nối cùng đối thủ ${matchFoundOpponentName}...`
                    : `Connecting with ${matchFoundOpponentName}...`}
                </p>
                <div className="mt-6 flex items-center justify-center">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                </div>
              </div>
            ) : (
              // Radar Searching View
              <div>
                {/* Radar Animation */}
                <div className="relative mx-auto flex h-24 w-24 items-center justify-center mb-5">
                  <div className="absolute h-full w-full rounded-full bg-indigo-500/20 animate-ping" />
                  <div className="absolute h-16 w-16 rounded-full bg-indigo-500/30 animate-pulse" />
                  <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg">
                    <Zap className="h-6 w-6 animate-pulse" />
                  </div>
                </div>

                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {t.chess.searchingOpponent}
                </h3>
                <p className="mt-1 text-xs text-gray-500">
                  {t.chess.searchingDesc}
                </p>

                {/* Queue Timer */}
                <div className="my-5 inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-1.5 font-mono text-xs font-bold text-gray-700">
                  <Clock className="h-3.5 w-3.5 text-indigo-600" />
                  <span>
                    {t.chess.queueTime.replace('{time}', formatQueueTime(searchElapsedSeconds))}
                  </span>
                </div>

                {/* 2-minute Timeout Suggestion to Play with Bot */}
                {searchElapsedSeconds >= 120 && (
                  <div className="mb-4 rounded-2xl border border-purple-200 bg-purple-50 p-4 text-center animate-fade-in shadow-sm">
                    <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-purple-600 text-white mb-2 shadow-sm">
                      <Bot className="h-5 w-5" />
                    </div>
                    <p className="text-xs font-semibold text-purple-950 mb-3 leading-relaxed">
                      {t.chess.quickMatchTimeoutOffer}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onCancelQuickMatch();
                        onStartBotMatch('medium', 'random', selectedTime);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-2.5 text-xs font-bold text-white shadow-md hover:bg-purple-700 active:scale-95 transition-all"
                    >
                      <Bot className="h-4 w-4" />
                      <span>{t.chess.switchPlayBot}</span>
                    </button>
                  </div>
                )}

                {/* Cancel Button */}
                <button
                  type="button"
                  onClick={onCancelQuickMatch}
                  className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <X className="h-4 w-4" />
                  <span>{t.chess.cancelSearch}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
