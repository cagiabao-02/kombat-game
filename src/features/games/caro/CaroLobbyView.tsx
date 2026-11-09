'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Sparkles,
  Bot,
  Users,
  Wifi,
  Play,
  ArrowRight,
  ShieldCheck,
  Zap,
  X as CloseIcon,
  CheckCircle2,
} from 'lucide-react';
import { CaroBotDifficulty, CaroPiece } from './types';

interface CaroLobbyViewProps {
  onStartBotMatch: (difficulty: CaroBotDifficulty, playerPiece: 'X' | 'O' | 'random') => void;
  onStartLocalMatch: (p1Name: string, p2Name: string) => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (code: string) => void;
  onStartQuickMatch: () => void;
  onCancelQuickMatch: () => void;
  isCreating: boolean;
  isJoining: boolean;
  isSearchingMatch: boolean;
  searchElapsedSeconds: number;
  matchFoundOpponentName?: string | null;
  errorMessage?: string | null;
}

export function CaroLobbyView({
  onStartBotMatch,
  onStartLocalMatch,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartQuickMatch,
  onCancelQuickMatch,
  isCreating,
  isJoining,
  isSearchingMatch,
  searchElapsedSeconds,
  matchFoundOpponentName,
  errorMessage,
}: CaroLobbyViewProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'bot' | 'local' | 'online'>('bot');
  const [botDifficulty, setBotDifficulty] = useState<CaroBotDifficulty>('medium');
  const [playerPiece, setPlayerPiece] = useState<'X' | 'O' | 'random'>('X');
  const [inputCode, setInputCode] = useState('');
  const [p1Name, setP1Name] = useState('Người chơi 1');
  const [p2Name, setP2Name] = useState('Người chơi 2');

  const formatQueueTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim().length >= 4) {
      onJoinOnlineRoom(inputCode.trim().toUpperCase());
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 border border-rose-100/80 px-3 py-1 text-xs font-bold text-rose-700 mb-2 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-rose-600" />
          <span>{language === 'vi' ? 'Năm quân thẳng hàng' : 'Five in a row'}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          {language === 'vi' ? 'Cờ Caro (Gomoku)' : 'Gomoku (Caro)'}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {language === 'vi'
            ? 'Bàn cờ 15x15 tiêu chuẩn. Đấu trí cùng Bot AI, so tài cùng bạn trên một máy hoặc tạo phòng online.'
            : 'Standard 15x15 board. Battle smart Bot AI, pass & play with friends locally, or challenge online.'}
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-gray-100/90 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('bot')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            activeTab === 'bot'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Bot className="h-4 w-4 text-purple-600" />
          <span>{language === 'vi' ? 'Đấu Máy' : 'Bot AI'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            activeTab === 'local'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4 text-indigo-600" />
          <span>{language === 'vi' ? 'Chơi Đôi' : '2 Người'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all min-h-[44px] ${
            activeTab === 'online'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Wifi className="h-4 w-4 text-emerald-600" />
          <span>{language === 'vi' ? 'Online 1v1' : 'Online'}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-sm font-semibold text-rose-700 shadow-2xs">
          {errorMessage}
        </div>
      )}

      {/* TAB 1: BOT AI */}
      {activeTab === 'bot' && (
        <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm border border-gray-200/90">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {language === 'vi' ? 'Độ khó Bot AI' : 'Bot Difficulty'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'easy', vi: 'Dễ', en: 'Easy', color: 'border-emerald-200 text-emerald-700 bg-emerald-50/50' },
                  { id: 'medium', vi: 'Vừa', en: 'Medium', color: 'border-amber-200 text-amber-700 bg-amber-50/50' },
                  { id: 'hard', vi: 'Khó', en: 'Hard', color: 'border-rose-200 text-rose-700 bg-rose-50/50' },
                ] as const
              ).map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setBotDifficulty(diff.id)}
                  className={`min-h-[44px] py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                    botDifficulty === diff.id
                      ? `${diff.color} ring-2 ring-indigo-500 shadow-xs scale-102`
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {language === 'vi' ? diff.vi : diff.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              {language === 'vi' ? 'Chọn quân của bạn' : 'Select Your Piece'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlayerPiece('X')}
                className={`min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                  playerPiece === 'X'
                    ? 'border-rose-300 bg-rose-50 text-rose-700 ring-2 ring-rose-400/40 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="font-black text-rose-600">✕</span>
                <span>{language === 'vi' ? 'X (Đi trước)' : 'X (First)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerPiece('O')}
                className={`min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                  playerPiece === 'O'
                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-400/40 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span className="font-black text-indigo-600">◯</span>
                <span>{language === 'vi' ? 'O (Đi sau)' : 'O (Second)'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerPiece('random')}
                className={`min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-sm font-bold transition-all ${
                  playerPiece === 'random'
                    ? 'border-purple-300 bg-purple-50 text-purple-700 ring-2 ring-purple-400/40 shadow-xs'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>🎲</span>
                <span>{language === 'vi' ? 'Ngẫu nhiên' : 'Random'}</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartBotMatch(botDifficulty, playerPiece)}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-base shadow-lg shadow-indigo-200 hover:from-purple-700 hover:to-indigo-700 active:scale-98 transition-all"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>{language === 'vi' ? 'Bắt đầu ván đấu' : 'Start Match'}</span>
          </button>
        </div>
      )}

      {/* TAB 2: PASS & PLAY (CHƠI ĐÔI CÙNG MÁY) */}
      {activeTab === 'local' && (
        <div className="space-y-5 rounded-3xl bg-white p-6 shadow-sm border border-gray-200/90">
          <div className="flex items-center gap-3 p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl">
            <Users className="h-6 w-6 text-indigo-600 shrink-0" />
            <p className="text-xs text-indigo-900 leading-relaxed">
              {language === 'vi'
                ? 'Hai người chơi chuyền tay nhau đánh lần lượt từng nước trên cùng một màn hình điện thoại hoặc máy tính.'
                : 'Pass & play locally on the same device. Take turns placing pieces.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {language === 'vi' ? 'Tên Người 1 (✕)' : 'Player 1 (✕)'}
              </label>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                maxLength={15}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                {language === 'vi' ? 'Tên Người 2 (◯)' : 'Player 2 (◯)'}
              </label>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                maxLength={15}
                className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartLocalMatch(p1Name.trim() || 'Người chơi 1', p2Name.trim() || 'Người chơi 2')}
            className="w-full min-h-[48px] flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-black text-base shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-blue-700 active:scale-98 transition-all"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>{language === 'vi' ? 'Bắt đầu chơi đôi' : 'Start Pass & Play'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: ONLINE PVP */}
      {activeTab === 'online' && (
        <div className="space-y-4">
          {/* Quick Match Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200/90">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">
                  {language === 'vi' ? 'Ghép Trận Nhanh' : 'Quick Match'}
                </h3>
                <p className="text-xs text-gray-500">
                  {language === 'vi'
                    ? 'Tự động tìm kiếm đối thủ đang chờ trên mạng'
                    : 'Automatically pair with an active waiting opponent'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onStartQuickMatch}
              disabled={isSearchingMatch}
              className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded-2xl bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-200 hover:bg-amber-600 active:scale-98 transition-all disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>{language === 'vi' ? 'Tìm đối thủ ngay' : 'Find Match Now'}</span>
            </button>
          </div>

          {/* Create Private Room Card */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200/90">
            <h3 className="text-base font-black text-gray-900 mb-1">
              {language === 'vi' ? 'Tạo Phòng Riêng' : 'Create Private Room'}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              {language === 'vi'
                ? 'Nhận mã phòng 6 ký tự để gửi lời mời bạn bè vào chơi'
                : 'Get a 6-character room code to invite a friend'}
            </p>

            <button
              type="button"
              onClick={onCreateOnlineRoom}
              disabled={isCreating}
              className="w-full min-h-[46px] flex items-center justify-center gap-2 rounded-2xl bg-indigo-600 text-white font-bold text-sm shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-98 transition-all disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isCreating ? (language === 'vi' ? 'Đang tạo phòng...' : 'Creating...') : (language === 'vi' ? 'Tạo phòng mới' : 'Create Room')}</span>
            </button>
          </div>

          {/* Join Room by Code */}
          <div className="rounded-3xl bg-white p-6 shadow-sm border border-gray-200/90">
            <h3 className="text-base font-black text-gray-900 mb-1">
              {language === 'vi' ? 'Vào Phòng Bằng Mã' : 'Join by Code'}
            </h3>
            <p className="text-xs text-gray-500 mb-3">
              {language === 'vi'
                ? 'Nhập mã 6 ký tự do bạn bè chia sẻ'
                : 'Enter the 6-character room code from your friend'}
            </p>

            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <input
                type="text"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                placeholder="VD: CARO88"
                maxLength={6}
                className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-center font-mono text-base font-black tracking-widest uppercase text-gray-900 placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                type="submit"
                disabled={isJoining || inputCode.trim().length < 4}
                className="min-h-[44px] px-5 rounded-xl bg-gray-900 text-white text-sm font-bold hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-40"
              >
                {isJoining ? '...' : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MATCH SEARCHING MODAL OVERLAY */}
      {isSearchingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl text-center border border-gray-100">
            {matchFoundOpponentName ? (
              <div className="space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-black text-gray-900">
                  {language === 'vi' ? 'Đã tìm thấy đối thủ!' : 'Opponent Found!'}
                </h3>
                <p className="text-sm font-semibold text-gray-600">
                  {matchFoundOpponentName}
                </p>
                <p className="text-xs text-gray-400">
                  {language === 'vi' ? 'Đang chuẩn bị bàn cờ...' : 'Preparing board...'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin" />
                  <Zap className="h-6 w-6 text-amber-500 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">
                    {language === 'vi' ? 'Đang tìm đối thủ...' : 'Searching for Opponent...'}
                  </h3>
                  <p className="mt-1 font-mono text-2xl font-black text-amber-600">
                    {formatQueueTime(searchElapsedSeconds)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCancelQuickMatch}
                  className="w-full min-h-[44px] rounded-xl border border-gray-200 bg-white py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
                >
                  <CloseIcon className="inline h-4 w-4 mr-1 text-gray-400" />
                  {language === 'vi' ? 'Hủy tìm kiếm' : 'Cancel'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

