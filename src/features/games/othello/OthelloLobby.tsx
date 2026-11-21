'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Bot, Users, Wifi, Play, History, Zap, KeyRound, Plus, Trophy, ChevronDown } from 'lucide-react';
import { OthelloDifficulty, OthelloGameMode, OthelloStone } from './types';
import { OthelloStats } from './othelloStatsService';

interface OthelloLobbyProps {
  hasSavedGame: boolean;
  stats: OthelloStats;
  onResumeSavedGame: () => void;
  onStartLocalGame: (config: {
    mode: Extract<OthelloGameMode, 'ai' | 'local'>;
    aiDifficulty: OthelloDifficulty;
    playerColor: OthelloStone;
  }) => void;
  onCreateOnlineRoom: () => void;
  onJoinOnlineRoom: (code: string) => void;
  onStartQuickMatch: () => void;
  onCancelQuickMatch: () => void;
  isCreatingOnline: boolean;
  isJoiningOnline: boolean;
  isSearchingQuickMatch: boolean;
  errorMessage: string | null;
}

export const OthelloLobby: React.FC<OthelloLobbyProps> = ({
  hasSavedGame,
  stats,
  onResumeSavedGame,
  onStartLocalGame,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartQuickMatch,
  onCancelQuickMatch,
  isCreatingOnline,
  isJoiningOnline,
  isSearchingQuickMatch,
  errorMessage,
}) => {
  const { language } = useLanguage();
  const [mode, setMode] = useState<OthelloGameMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<OthelloDifficulty>('medium');
  const [playerColor, setPlayerColor] = useState<OthelloStone>('black');
  const [roomCode, setRoomCode] = useState('');
  const [showRules, setShowRules] = useState(false);

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (roomCode.trim()) {
      onJoinOnlineRoom(roomCode.trim().toUpperCase());
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-4 py-2 select-none">
      {hasSavedGame && (
        <div className="bg-amber-100 border-2 border-amber-600 p-3 shadow-[3px_3px_0px_#000] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-amber-800 shrink-0" />
            <div>
              <p className="font-pixel text-xs font-bold text-amber-950">
                {language === 'vi' ? 'VÁN CỜ ĐANG DANG DỞ' : 'GAME IN PROGRESS'}
              </p>
              <p className="text-[11px] font-mono text-amber-800">
                {language === 'vi' ? 'Bạn có 1 ván Cờ Lật chưa hoàn tất' : 'You have an unfinished Othello match'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onResumeSavedGame}
            className="pixel-btn bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-1.5 font-pixel text-xs font-bold shrink-0"
          >
            {language === 'vi' ? 'TIẾP TỤC' : 'RESUME'}
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="pixel-box-sm bg-rose-100 border-2 border-rose-600 p-3 font-pixel text-xs font-bold text-rose-800 shadow-[2px_2px_0px_#000]">
          ⚠️ {errorMessage}
        </div>
      )}

      <div className="pixel-box bg-[#FFFDF8] border-3 border-zinc-900 p-4 sm:p-5 space-y-4 shadow-[4px_4px_0px_#000]">
        <div className="text-center border-b-2 border-zinc-900 pb-2.5">
          <h2 className="font-pixel text-xl sm:text-2xl font-bold uppercase text-zinc-900 tracking-wide">
            {language === 'vi' ? 'CỜ LẬT OTHELLO (REVERSI)' : 'OTHELLO / REVERSI 8×8'}
          </h2>
          <p className="text-xs font-mono text-zinc-600 mt-0.5">
            {language === 'vi'
              ? 'Kẹp quân 8 hướng • Lật ngược thế cờ'
              : 'Flank opponent discs in 8 directions to flip them'}
          </p>
        </div>

        {/* Mode selector */}
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`pixel-btn py-2.5 px-2 flex flex-col items-center gap-1 font-pixel text-xs font-bold ${
              mode === 'ai'
                ? 'bg-indigo-600 text-amber-300'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>{language === 'vi' ? 'Đấu Máy' : 'vs Bot'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('local')}
            className={`pixel-btn py-2.5 px-2 flex flex-col items-center gap-1 font-pixel text-xs font-bold ${
              mode === 'local'
                ? 'bg-emerald-600 text-white'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{language === 'vi' ? 'Chơi Đôi' : 'Pass & Play'}</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('online')}
            className={`pixel-btn py-2.5 px-2 flex flex-col items-center gap-1 font-pixel text-xs font-bold ${
              mode === 'online'
                ? 'bg-amber-400 text-zinc-950'
                : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>{language === 'vi' ? 'Online 1v1' : 'Online PvP'}</span>
          </button>
        </div>

        {/* Mode specific controls */}
        {mode === 'ai' && (
          <div className="space-y-3 pt-1">
            <div>
              <label className="block font-pixel text-xs font-bold text-zinc-700 uppercase mb-1.5">
                {language === 'vi' ? 'Độ khó Bot AI' : 'Bot Difficulty'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['easy', 'medium', 'hard'] as OthelloDifficulty[]).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => setAiDifficulty(diff)}
                    className={`pixel-btn py-2 font-pixel text-xs font-bold ${
                      aiDifficulty === diff
                        ? 'bg-zinc-900 text-amber-300'
                        : 'bg-white text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {diff === 'easy'
                      ? language === 'vi'
                        ? 'Dễ'
                        : 'Easy'
                      : diff === 'medium'
                        ? language === 'vi'
                          ? 'Vừa'
                          : 'Medium'
                        : language === 'vi'
                          ? 'Khó'
                          : 'Hard'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-pixel text-xs font-bold text-zinc-700 uppercase mb-1.5">
                {language === 'vi' ? 'Chọn màu quân' : 'Choose Your Color'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerColor('black')}
                  className={`pixel-btn py-2 px-3 flex items-center justify-center gap-2 font-pixel text-xs font-bold ${
                    playerColor === 'black'
                      ? 'bg-zinc-900 text-white'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-zinc-900 border border-white/60 inline-block" />
                  <span>{language === 'vi' ? 'Đen (Đi trước)' : 'Black (First)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerColor('white')}
                  className={`pixel-btn py-2 px-3 flex items-center justify-center gap-2 font-pixel text-xs font-bold ${
                    playerColor === 'white'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  <span className="w-3.5 h-3.5 rounded-full bg-white border border-zinc-900 inline-block" />
                  <span>{language === 'vi' ? 'Trắng (Đi sau)' : 'White (Second)'}</span>
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onStartLocalGame({ mode: 'ai', aiDifficulty, playerColor })}
              className="pixel-btn w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 font-pixel text-sm font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'vi' ? 'BẮT ĐẦU ĐẤU MÁY' : 'START BOT MATCH'}</span>
            </button>
          </div>
        )}

        {mode === 'local' && (
          <div className="space-y-3 pt-1">
            <p className="text-xs font-mono text-zinc-600 bg-zinc-100 p-3 border-2 border-zinc-300">
              {language === 'vi'
                ? 'Hai người chơi luân phiên chạm trên cùng 1 thiết bị. Quân Đen luôn đi trước.'
                : 'Two players take turns on the same device. Black always moves first.'}
            </p>
            <button
              type="button"
              onClick={() => onStartLocalGame({ mode: 'local', aiDifficulty: 'medium', playerColor: 'black' })}
              className="pixel-btn w-full bg-emerald-600 hover:bg-emerald-500 text-white py-3 font-pixel text-sm font-bold flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{language === 'vi' ? 'BẮT ĐẦU CHƠI ĐÔI' : 'START PASS & PLAY'}</span>
            </button>
          </div>
        )}

        {mode === 'online' && (
          <div className="space-y-3 pt-1">
            {isSearchingQuickMatch ? (
              <div className="bg-amber-50 border-2 border-amber-500 p-4 text-center space-y-3">
                <div className="font-pixel text-sm font-bold text-amber-900 animate-pulse">
                  {language === 'vi' ? '⏳ ĐANG TÌM ĐỐI THỦ...' : '⏳ SEARCHING FOR OPPONENT...'}
                </div>
                <button
                  type="button"
                  onClick={onCancelQuickMatch}
                  className="pixel-btn bg-rose-500 hover:bg-rose-400 text-white px-4 py-2 font-pixel text-xs font-bold"
                >
                  {language === 'vi' ? 'HỦY TÌM TRẬN' : 'CANCEL'}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  disabled={isCreatingOnline}
                  onClick={onStartQuickMatch}
                  className="pixel-btn w-full bg-indigo-600 hover:bg-indigo-500 text-amber-300 py-3 font-pixel text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" />
                  <span>{language === 'vi' ? 'GHÉP TRẬN NHANH' : 'QUICK MATCH'}</span>
                </button>

                <button
                  type="button"
                  disabled={isCreatingOnline}
                  onClick={onCreateOnlineRoom}
                  className="pixel-btn w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 font-pixel text-xs font-bold flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isCreatingOnline
                      ? language === 'vi'
                        ? 'ĐANG TẠO PHÒNG...'
                        : 'CREATING...'
                      : language === 'vi'
                        ? 'TẠO PHÒNG MỜI BẠN'
                        : 'CREATE PRIVATE ROOM'}
                  </span>
                </button>

                <form onSubmit={handleJoinSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <KeyRound className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={roomCode}
                      onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                      placeholder={language === 'vi' ? 'NHẬP MÃ PHÒNG' : 'ROOM CODE'}
                      className="pixel-input w-full pl-9 pr-3 py-2 text-xs font-mono uppercase"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isJoiningOnline || !roomCode.trim()}
                    className="pixel-btn bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-zinc-950 px-4 py-2 font-pixel text-xs font-bold"
                  >
                    {language === 'vi' ? 'VÀO' : 'JOIN'}
                  </button>
                </form>
              </>
            )}
          </div>
        )}
      </div>

      {/* Compact Stats */}
      <div className="pixel-box-sm bg-white border-2 border-zinc-900 p-3 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-2 font-pixel font-bold text-zinc-800">
          <Trophy className="w-4 h-4 text-amber-500" />
          <span>{language === 'vi' ? 'THÀNH TÍCH' : 'STATS'}</span>
        </div>
        <div className="flex items-center gap-3 text-zinc-700">
          <span>W: <strong className="text-emerald-700">{stats.wins}</strong></span>
          <span>L: <strong className="text-rose-600">{stats.losses}</strong></span>
          <span>Max: <strong className="text-indigo-700">{stats.bestScore}</strong></span>
        </div>
      </div>

      {/* Rules Accordion */}
      <div className="pixel-box-sm bg-white border-2 border-zinc-900 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRules((v) => !v)}
          className="w-full px-3 py-2.5 flex items-center justify-between font-pixel text-xs font-bold text-zinc-800 hover:bg-zinc-50"
        >
          <span>{language === 'vi' ? '📖 LUẬT CHƠI CỜ LẬT NHANH' : '📖 QUICK RULES'}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showRules ? 'rotate-180' : ''}`} />
        </button>
        {showRules && (
          <div className="px-3 pb-3 text-xs font-mono text-zinc-600 space-y-1.5 border-t border-zinc-200 pt-2">
            <p>
              {language === 'vi'
                ? '1. Đặt quân sao cho kẹp ít nhất 1 quân đối thủ theo hàng ngang, dọc hoặc chéo để lật chúng thành màu của bạn.'
                : '1. Place a disc to bracket at least one opponent disc horizontally, vertically, or diagonally to flip them.'}
            </p>
            <p>
              {language === 'vi'
                ? '2. Nếu đến lượt mà không có nước đi hợp lệ, lượt sẽ tự động chuyển sang đối thủ.'
                : '2. If a player has no valid moves, the turn automatically passes to the opponent.'}
            </p>
            <p>
              {language === 'vi'
                ? '3. Ván cờ kết thúc khi bàn đầy hoặc cả 2 bên hết nước đi. Bên có nhiều quân hơn sẽ thắng!'
                : '3. The game ends when the board is full or neither player can move. Most discs wins!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
