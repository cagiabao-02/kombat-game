'use client';

import React, { useState } from 'react';
import { BoardSize, GoAiDifficulty, GoColor, GoGameMode } from './types';
import { useLanguage } from '@/i18n/LanguageContext';
import { Bot, Users, Play, History, Wifi, Zap, ArrowRight, KeyRound, Plus } from 'lucide-react';

interface GoLobbyProps {
  hasSavedGame: boolean;
  onResumeSavedGame: () => void;
  onStartNewGame: (config: {
    boardSize: BoardSize;
    mode: GoGameMode;
    aiDifficulty: GoAiDifficulty;
    playerColor: GoColor;
  }) => void;
  onCreateOnlineRoom?: (boardSize: BoardSize) => void;
  onJoinOnlineRoom?: (code: string) => void;
  onStartQuickMatch?: (boardSize: BoardSize) => void;
  onCancelQuickMatch?: () => void;
  isCreatingOnline?: boolean;
  isJoiningOnline?: boolean;
  isSearchingQuickMatch?: boolean;
  errorMessage?: string | null;
}

export const GoLobby: React.FC<GoLobbyProps> = ({
  hasSavedGame,
  onResumeSavedGame,
  onStartNewGame,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartQuickMatch,
  onCancelQuickMatch,
  isCreatingOnline = false,
  isJoiningOnline = false,
  isSearchingQuickMatch = false,
  errorMessage = null,
}) => {
  const { language } = useLanguage();
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [mode, setMode] = useState<GoGameMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<GoAiDifficulty>('easy');
  const [playerColor, setPlayerColor] = useState<GoColor>('black');
  const [inputRoomCode, setInputRoomCode] = useState('');

  const handleStart = () => {
    onStartNewGame({
      boardSize,
      mode,
      aiDifficulty,
      playerColor,
    });
  };

  const handleJoinByCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputRoomCode.trim() && onJoinOnlineRoom) {
      onJoinOnlineRoom(inputRoomCode.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 py-2 select-none">
      {/* Nút tiếp tục ván cờ nếu có */}
      {hasSavedGame && (
        <div className="bg-amber-100 border-2 border-amber-600 p-3 shadow-[3px_3px_0px_#000] flex items-center justify-between gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-800" />
            <div>
              <p className="font-pixel text-xs font-bold text-amber-950">
                {language === 'vi' ? 'VÁN CỜ ĐANG DANG DỞ' : 'GAME IN PROGRESS'}
              </p>
              <p className="text-[11px] font-mono text-amber-800">
                {language === 'vi' ? 'Bạn có 1 ván cờ chưa hoàn tất' : 'You have an unfinished game'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResumeSavedGame}
            className="pixel-btn bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-1.5 font-pixel text-xs font-bold"
          >
            {language === 'vi' ? 'TIẾP TỤC' : 'RESUME'}
          </button>
        </div>
      )}

      {/* Thông báo lỗi nếu có */}
      {errorMessage && (
        <div className="pixel-box-sm bg-rose-100 border-2 border-rose-600 p-3 font-pixel text-xs font-bold text-rose-800 shadow-[2px_2px_0px_#000]">
          ⚠️ {errorMessage}
        </div>
      )}

      {/* Box Cấu hình ván đấu */}
      <div className="pixel-box bg-[#FFFDF8] border-3 border-zinc-900 p-4 sm:p-5 space-y-4 shadow-[4px_4px_0px_#000]">
        <div className="text-center border-b-2 border-zinc-900 pb-2.5">
          <h2 className="font-pixel text-xl sm:text-2xl font-bold uppercase text-zinc-900 tracking-wide">
            {language === 'vi' ? 'THIẾT LẬP BÀN CỜ VÂY' : 'GO GAME SETUP'}
          </h2>
          <p className="text-xs font-mono text-zinc-600 mt-1">
            {language === 'vi'
              ? 'Chọn kích thước & chế độ đối đầu'
              : 'Select board size & game mode'}
          </p>
        </div>

        {/* 1. Chọn kích thước bàn cờ */}
        <div className="space-y-1.5">
          <label className="font-pixel text-xs font-bold text-zinc-900 block">
            {language === 'vi' ? '1. KÍCH THƯỚC BÀN CỜ' : '1. BOARD SIZE'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            {[
              {
                size: 9 as BoardSize,
                label: '9x9',
                sub: language === 'vi' ? 'Chơi nhanh (Mobile)' : 'Fast (Mobile)',
              },
              {
                size: 13 as BoardSize,
                label: '13x13',
                sub: language === 'vi' ? 'Tiêu chuẩn' : 'Standard',
              },
              {
                size: 19 as BoardSize,
                label: '19x19',
                sub: language === 'vi' ? 'Kinh điển' : 'Classic',
              },
            ].map((item) => (
              <button
                key={item.size}
                type="button"
                onClick={() => setBoardSize(item.size)}
                className={`p-2.5 text-center border-2 transition-all ${
                  boardSize === item.size
                    ? 'border-zinc-900 bg-amber-300 font-bold shadow-[2px_2px_0px_#000] -translate-y-0.5'
                    : 'border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-700'
                }`}
              >
                <div className="font-pixel text-sm font-bold">{item.label}</div>
                <div className="text-[10px] font-mono text-zinc-600 mt-0.5 truncate">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Chọn chế độ chơi */}
        <div className="space-y-1.5">
          <label className="font-pixel text-xs font-bold text-zinc-900 block">
            {language === 'vi' ? '2. CHẾ ĐỘ ĐỐI ĐẦU' : '2. GAME MODE'}
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMode('ai')}
              className={`p-2.5 flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                mode === 'ai'
                  ? 'border-zinc-900 bg-amber-300 font-bold shadow-[2px_2px_0px_#000] -translate-y-0.5 text-zinc-950'
                  : 'border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span className="font-pixel text-[11px] font-bold uppercase">
                {language === 'vi' ? 'Đấu với máy' : 'VS Bot'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('pass_and_play')}
              className={`p-2.5 flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                mode === 'pass_and_play'
                  ? 'border-zinc-900 bg-amber-300 font-bold shadow-[2px_2px_0px_#000] -translate-y-0.5 text-zinc-950'
                  : 'border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span className="font-pixel text-[11px] font-bold uppercase">
                {language === 'vi' ? 'Chơi đôi' : 'Pass & Play'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('online')}
              className={`p-2.5 flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                mode === 'online'
                  ? 'border-zinc-900 bg-emerald-400 font-bold shadow-[2px_2px_0px_#000] -translate-y-0.5 text-zinc-950'
                  : 'border-zinc-900 bg-white hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <Wifi className="w-4 h-4" />
              <span className="font-pixel text-[11px] font-bold uppercase">
                {language === 'vi' ? 'Đấu Online' : 'Online PvP'}
              </span>
            </button>
          </div>
        </div>

        {/* Chi tiết chế độ ĐẤU VỚI MÁY */}
        {mode === 'ai' && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 animate-in fade-in">
            {/* Chọn độ khó */}
            <div className="space-y-1.5">
              <label className="font-pixel text-[11px] font-bold text-zinc-700 block">
                {language === 'vi' ? 'ĐỘ KHÓ CỦA BOT:' : 'BOT DIFFICULTY:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiDifficulty('easy')}
                  className={`p-2 text-center border-2 font-pixel text-xs font-bold transition-all ${
                    aiDifficulty === 'easy'
                      ? 'border-zinc-900 bg-emerald-300 text-zinc-900 shadow-[2px_2px_0px_#000]'
                      : 'border-zinc-900 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  🟢 {language === 'vi' ? 'TẬP SỰ (DỄ)' : 'NOVICE (EASY)'}
                </button>
                <button
                  type="button"
                  onClick={() => setAiDifficulty('medium')}
                  className={`p-2 text-center border-2 font-pixel text-xs font-bold transition-all ${
                    aiDifficulty === 'medium'
                      ? 'border-zinc-900 bg-amber-300 text-zinc-900 shadow-[2px_2px_0px_#000]'
                      : 'border-zinc-900 bg-white text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  🟠 {language === 'vi' ? 'KỲ THỦ (VỪA)' : 'PLAYER (MEDIUM)'}
                </button>
              </div>
            </div>

            {/* Chọn màu quân */}
            <div className="space-y-1.5">
              <label className="font-pixel text-[11px] font-bold text-zinc-700 block">
                {language === 'vi' ? 'BẠN CẦM QUÂN:' : 'YOUR COLOR:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerColor('black')}
                  className={`p-2 text-center border-2 font-pixel text-xs font-bold transition-all ${
                    playerColor === 'black'
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-[2px_2px_0px_#000]'
                      : 'border-zinc-900 bg-white text-zinc-800 hover:bg-zinc-100'
                  }`}
                >
                  ⚫ {language === 'vi' ? 'ĐEN (ĐI TRƯỚC)' : 'BLACK (FIRST)'}
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerColor('white')}
                  className={`p-2 text-center border-2 font-pixel text-xs font-bold transition-all ${
                    playerColor === 'white'
                      ? 'border-zinc-900 bg-white text-zinc-900 ring-2 ring-zinc-900 shadow-[2px_2px_0px_#000]'
                      : 'border-zinc-900 bg-zinc-50 text-zinc-700 hover:bg-white'
                  }`}
                >
                  ⚪ {language === 'vi' ? 'TRẮNG (ĐI SAU)' : 'WHITE (SECOND)'}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleStart}
              className="w-full pixel-btn bg-emerald-400 hover:bg-emerald-300 text-zinc-950 py-3 font-pixel text-sm font-bold flex items-center justify-center gap-2 mt-2 shadow-[3px_3px_0px_#000]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'vi' ? 'BẮT ĐẦU VÁN CỜ' : 'START GAME'}</span>
            </button>
          </div>
        )}

        {/* Chi tiết chế độ CHƠI ĐÔI */}
        {mode === 'pass_and_play' && (
          <div className="space-y-3 pt-2 border-t border-zinc-200 animate-in fade-in">
            <p className="text-xs font-mono text-zinc-600 bg-amber-50 border-2 border-zinc-900 p-2.5">
              💡{' '}
              {language === 'vi'
                ? 'Hai người chơi chuyền tay nhau trên cùng 1 điện thoại hoặc máy tính. Đen đi trước, Trắng đi sau.'
                : '2 players share the same screen. Pass turns back and forth. Black plays first, White plays second.'}
            </p>

            <button
              type="button"
              onClick={handleStart}
              className="w-full pixel-btn bg-emerald-400 hover:bg-emerald-300 text-zinc-950 py-3 font-pixel text-sm font-bold flex items-center justify-center gap-2 mt-2 shadow-[3px_3px_0px_#000]"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'vi' ? 'BẮT ĐẦU VÁN CỜ' : 'START GAME'}</span>
            </button>
          </div>
        )}

        {/* Chi tiết chế độ ĐẤU ONLINE */}
        {mode === 'online' && (
          <div className="space-y-4 pt-2 border-t border-zinc-200 animate-in fade-in">
            {/* 1. Ghép trận nhanh */}
            <div className="border-2 border-zinc-900 bg-emerald-50 p-3.5 shadow-[2px_2px_0px_#000]">
              <div className="flex items-center gap-1.5 font-pixel text-xs font-bold uppercase text-emerald-900 mb-1">
                <Zap className="w-4 h-4 text-emerald-600 fill-current" />
                <span>{language === 'vi' ? 'Ghép Trận Nhanh' : 'Quick Matchmaking'}</span>
              </div>
              <p className="text-[11px] font-mono text-zinc-600 mb-3">
                {language === 'vi'
                  ? `Tự động ghép bạn với kỳ thủ khác ở bàn ${boardSize}x${boardSize}.`
                  : `Instantly match with players online for a ${boardSize}x${boardSize} game.`}
              </p>

              {isSearchingQuickMatch ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-2 py-1.5 font-pixel text-xs font-bold text-emerald-800">
                    <span className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent animate-spin rounded-full" />
                    <span>{language === 'vi' ? 'Đang tìm đối thủ...' : 'Searching for opponent...'}</span>
                  </div>
                  <button
                    type="button"
                    onClick={onCancelQuickMatch}
                    className="w-full pixel-btn bg-white hover:bg-zinc-100 text-zinc-800 py-1.5 font-pixel text-xs font-bold"
                  >
                    {language === 'vi' ? 'HỦY TÌM TRẬN' : 'CANCEL SEARCH'}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => onStartQuickMatch && onStartQuickMatch(boardSize)}
                  className="w-full pixel-btn bg-emerald-500 hover:bg-emerald-400 text-white py-2 font-pixel text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <span>{language === 'vi' ? 'TÌM TRẬN NGAY' : 'FIND MATCH NOW'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Phân cách */}
            <div className="flex items-center gap-2">
              <div className="h-0.5 flex-1 bg-zinc-300" />
              <span className="font-pixel text-[10px] text-zinc-500 uppercase">
                {language === 'vi' ? 'Hoặc tạo phòng riêng' : 'Or Private Room'}
              </span>
              <div className="h-0.5 flex-1 bg-zinc-300" />
            </div>

            {/* 2. Tạo phòng riêng */}
            <div>
              <button
                type="button"
                disabled={isCreatingOnline}
                onClick={() => onCreateOnlineRoom && onCreateOnlineRoom(boardSize)}
                className="w-full pixel-btn bg-amber-400 hover:bg-amber-300 text-zinc-950 py-2.5 font-pixel text-xs font-bold flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000] disabled:opacity-50"
              >
                <Plus className="w-4 h-4" />
                <span>
                  {isCreatingOnline
                    ? language === 'vi' ? 'ĐANG TẠO PHÒNG...' : 'CREATING ROOM...'
                    : language === 'vi' ? `TẠO PHÒNG MỚI (${boardSize}x${boardSize})` : `CREATE NEW ROOM (${boardSize}x${boardSize})`}
                </span>
              </button>
            </div>

            {/* 3. Vào bằng mã phòng */}
            <form onSubmit={handleJoinByCode} className="space-y-2">
              <label className="font-pixel text-[11px] font-bold text-zinc-700 block">
                {language === 'vi' ? 'HOẶC NHẬP MÃ PHÒNG (6 KÝ TỰ):' : 'OR ENTER ROOM CODE (6 CHARS):'}
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <KeyRound className="w-4 h-4 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    maxLength={6}
                    value={inputRoomCode}
                    onChange={(e) => setInputRoomCode(e.target.value.toUpperCase())}
                    placeholder="VD: AB12CD"
                    className="pixel-input w-full pl-8 pr-3 py-2 text-xs font-mono font-bold tracking-widest text-zinc-900 placeholder:text-zinc-400 uppercase"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!inputRoomCode.trim() || isJoiningOnline}
                  className="pixel-btn bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-2 font-pixel text-xs font-bold disabled:opacity-40"
                >
                  {isJoiningOnline
                    ? '...'
                    : language === 'vi' ? 'VÀO PHÒNG' : 'JOIN'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
