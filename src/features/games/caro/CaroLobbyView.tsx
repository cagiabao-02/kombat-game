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
import { CaroBotDifficulty } from './types';

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
        <div className="pixel-badge inline-flex items-center gap-1.5 bg-rose-200 px-3 py-1 text-xs font-bold text-zinc-950 mb-2">
          <Sparkles className="h-3.5 w-3.5 text-rose-700" />
          <span>{language === 'vi' ? 'NĂM QUÂN THẲNG HÀNG' : 'FIVE IN A ROW'}</span>
        </div>
        <h1 className="font-pixel text-3xl sm:text-4xl font-bold tracking-wide text-zinc-950 uppercase">
          {language === 'vi' ? 'Cờ Caro (Gomoku)' : 'Gomoku (Caro)'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-mono text-zinc-600">
          {language === 'vi'
            ? 'Bàn cờ 15x15 tiêu chuẩn. Đấu trí cùng Bot AI, so tài cùng bạn trên một máy hoặc tạo phòng online.'
            : 'Standard 15x15 board. Battle smart Bot AI, pass & play with friends locally, or challenge online.'}
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('bot')}
          className={`pixel-btn flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-bold min-h-[44px] ${
            activeTab === 'bot'
              ? 'bg-indigo-600 text-amber-300'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>{language === 'vi' ? 'ĐẤU MÁY' : 'BOT AI'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={`pixel-btn flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-bold min-h-[44px] ${
            activeTab === 'local'
              ? 'bg-indigo-600 text-amber-300'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{language === 'vi' ? 'CHƠI ĐÔI' : '2 PLAYERS'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={`pixel-btn flex items-center justify-center gap-1.5 py-2.5 px-2 text-xs sm:text-sm font-bold min-h-[44px] ${
            activeTab === 'online'
              ? 'bg-indigo-600 text-amber-300'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <Wifi className="h-4 w-4" />
          <span>{language === 'vi' ? 'ONLINE 1V1' : 'ONLINE'}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-6 bg-rose-100 border-2 border-zinc-900 p-4 text-xs sm:text-sm font-mono font-bold text-rose-900 shadow-pixel-sm">
          {errorMessage}
        </div>
      )}

      {/* TAB 1: BOT AI */}
      {activeTab === 'bot' && (
        <div className="pixel-box-lg space-y-5 bg-[#FFFDF8] p-6">
          <div>
            <label className="block font-pixel text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
              {language === 'vi' ? 'ĐỘ KHÓ BOT AI' : 'BOT DIFFICULTY'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'easy', vi: 'DỄ', en: 'EASY', activeBg: 'bg-emerald-300 text-zinc-950' },
                  { id: 'medium', vi: 'VỪA', en: 'MEDIUM', activeBg: 'bg-amber-300 text-zinc-950' },
                  { id: 'hard', vi: 'KHÓ', en: 'HARD', activeBg: 'bg-rose-400 text-white' },
                ] as const
              ).map((diff) => (
                <button
                  key={diff.id}
                  type="button"
                  onClick={() => setBotDifficulty(diff.id)}
                  className={`pixel-btn min-h-[44px] py-2 px-3 text-sm font-bold ${
                    botDifficulty === diff.id
                      ? diff.activeBg
                      : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {language === 'vi' ? diff.vi : diff.en}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-pixel text-xs font-bold text-zinc-800 uppercase tracking-wider mb-2">
              {language === 'vi' ? 'CHỌN QUÂN CỦA BẠN' : 'SELECT YOUR PIECE'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlayerPiece('X')}
                className={`pixel-btn min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 text-sm font-bold ${
                  playerPiece === 'X'
                    ? 'bg-rose-200 text-zinc-950'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <span className="font-pixel font-bold text-rose-600">X</span>
                <span>{language === 'vi' ? 'Đi trước' : 'First'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerPiece('O')}
                className={`pixel-btn min-h-[44px] flex items-center justify-center gap-2 py-2 px-3 text-sm font-bold ${
                  playerPiece === 'O'
                    ? 'bg-indigo-200 text-zinc-950'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100'
                }`}
              >
                <span className="font-pixel font-bold text-indigo-700">O</span>
                <span>{language === 'vi' ? 'Đi sau' : 'Second'}</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerPiece('random')}
                className={`pixel-btn min-h-[44px] flex items-center justify-center gap-1.5 py-2 px-3 text-sm font-bold ${
                  playerPiece === 'random'
                    ? 'bg-amber-200 text-zinc-950'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100'
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
            className="pixel-btn w-full min-h-[48px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-amber-300 font-bold text-base"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>{language === 'vi' ? 'BẮT ĐẦU VÁN ĐẤU' : 'START MATCH'}</span>
          </button>
        </div>
      )}

      {/* TAB 2: PASS & PLAY (CHƠI ĐÔI CÙNG MÁY) */}
      {activeTab === 'local' && (
        <div className="pixel-box-lg space-y-5 bg-[#FFFDF8] p-6">
          <div className="flex items-center gap-3 p-3 bg-indigo-50 border-2 border-zinc-900">
            <Users className="h-6 w-6 text-indigo-700 shrink-0" />
            <p className="text-xs font-mono text-zinc-800 leading-relaxed">
              {language === 'vi'
                ? 'Hai người chơi chuyền tay nhau đánh lần lượt từng nước trên cùng một thiết bị.'
                : 'Pass & play locally on the same device. Take turns placing pieces.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-pixel text-xs font-bold text-zinc-800 mb-1">
                {language === 'vi' ? 'NGƯỜI CHƠI 1 [X]' : 'PLAYER 1 [X]'}
              </label>
              <input
                type="text"
                value={p1Name}
                onChange={(e) => setP1Name(e.target.value)}
                maxLength={15}
                className="pixel-input w-full bg-white px-3 py-2 text-sm font-bold text-zinc-900"
              />
            </div>
            <div>
              <label className="block font-pixel text-xs font-bold text-zinc-800 mb-1">
                {language === 'vi' ? 'NGƯỜI CHƠI 2 [O]' : 'PLAYER 2 [O]'}
              </label>
              <input
                type="text"
                value={p2Name}
                onChange={(e) => setP2Name(e.target.value)}
                maxLength={15}
                className="pixel-input w-full bg-white px-3 py-2 text-sm font-bold text-zinc-900"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartLocalMatch(p1Name.trim() || 'Người chơi 1', p2Name.trim() || 'Người chơi 2')}
            className="pixel-btn w-full min-h-[48px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-amber-300 font-bold text-base"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>{language === 'vi' ? 'BẮT ĐẦU CHƠI ĐÔI' : 'START PASS & PLAY'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: ONLINE PVP */}
      {activeTab === 'online' && (
        <div className="space-y-4">
          {/* Quick Match Card */}
          <div className="pixel-box-lg bg-[#FFFDF8] p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center bg-amber-300 border-2 border-zinc-900 text-zinc-900">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-pixel text-base font-bold text-zinc-950 uppercase">
                  {language === 'vi' ? 'GHÉP TRẬN NHANH' : 'QUICK MATCH'}
                </h3>
                <p className="text-xs font-mono text-zinc-600">
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
              className="pixel-btn w-full min-h-[46px] flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm disabled:opacity-50"
            >
              <Zap className="h-4 w-4 fill-current" />
              <span>{language === 'vi' ? 'TÌM ĐỐI THỦ NGAY' : 'FIND MATCH NOW'}</span>
            </button>
          </div>

          {/* Create Private Room Card */}
          <div className="pixel-box bg-[#FFFDF8] p-6">
            <h3 className="font-pixel text-base font-bold text-zinc-950 uppercase mb-1">
              {language === 'vi' ? 'TẠO PHÒNG RIÊNG' : 'CREATE PRIVATE ROOM'}
            </h3>
            <p className="text-xs font-mono text-zinc-600 mb-4">
              {language === 'vi'
                ? 'Nhận mã phòng 6 ký tự để gửi lời mời bạn bè vào chơi'
                : 'Get a 6-character room code to invite a friend'}
            </p>

            <button
              type="button"
              onClick={onCreateOnlineRoom}
              disabled={isCreating}
              className="pixel-btn w-full min-h-[46px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-amber-300 font-bold text-sm disabled:opacity-50"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{isCreating ? (language === 'vi' ? 'ĐANG TẠO PHÒNG...' : 'CREATING...') : (language === 'vi' ? 'TẠO PHÒNG MỚI' : 'CREATE ROOM')}</span>
            </button>
          </div>

          {/* Join Room by Code */}
          <div className="pixel-box bg-[#FFFDF8] p-6">
            <h3 className="font-pixel text-base font-bold text-zinc-950 uppercase mb-1">
              {language === 'vi' ? 'VÀO PHÒNG BẰNG MÃ' : 'JOIN BY CODE'}
            </h3>
            <p className="text-xs font-mono text-zinc-600 mb-3">
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
                className="pixel-input flex-1 bg-white px-4 py-2.5 text-center font-pixel text-base font-bold tracking-widest uppercase text-zinc-900 placeholder:text-zinc-300"
              />
              <button
                type="submit"
                disabled={isJoining || inputCode.trim().length < 4}
                className="pixel-btn min-h-[44px] px-5 bg-zinc-900 text-amber-300 text-sm font-bold hover:bg-zinc-800 disabled:opacity-40"
              >
                {isJoining ? '...' : <ArrowRight className="h-4 w-4" />}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MATCH SEARCHING MODAL OVERLAY */}
      {isSearchingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-150">
          <div className="pixel-box-lg w-full max-w-sm bg-[#FFFDF8] p-6 text-center">
            {matchFoundOpponentName ? (
              <div className="space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center bg-emerald-300 border-2 border-zinc-900 text-zinc-950 animate-bounce">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <h3 className="font-pixel text-lg font-bold text-zinc-950 uppercase">
                  {language === 'vi' ? 'ĐÃ TÌM THẤY ĐỐI THỦ!' : 'CHALLENGER FOUND!'}
                </h3>
                <p className="font-pixel text-sm font-bold text-indigo-700">
                  {matchFoundOpponentName}
                </p>
                <p className="text-xs font-mono text-zinc-500">
                  {language === 'vi' ? 'Đang chuẩn bị bàn cờ...' : 'Preparing board...'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center bg-amber-100 border-2 border-zinc-900 shadow-pixel-sm">
                  <Zap className="h-8 w-8 text-amber-600 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-pixel text-lg font-bold text-zinc-950 uppercase">
                    {language === 'vi' ? 'ĐANG TÌM ĐỐI THỦ...' : 'SEARCHING...'}
                  </h3>
                  <p className="mt-1 font-pixel text-2xl font-bold text-amber-700">
                    {formatQueueTime(searchElapsedSeconds)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onCancelQuickMatch}
                  className="pixel-btn w-full min-h-[44px] bg-white py-2 text-sm font-bold text-zinc-900 hover:bg-rose-50"
                >
                  <CloseIcon className="inline h-4 w-4 mr-1 text-rose-600" />
                  {language === 'vi' ? 'HỦY TÌM KIẾM' : 'CANCEL'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
