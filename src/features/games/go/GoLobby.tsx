'use client';

import React, { useState } from 'react';
import { BoardSize, GoAiDifficulty, GoColor, GoGameMode } from './types';
import { useLanguage } from '@/i18n/LanguageContext';
import { Bot, Users, Play, History } from 'lucide-react';

interface GoLobbyProps {
  hasSavedGame: boolean;
  onResumeSavedGame: () => void;
  onStartNewGame: (config: {
    boardSize: BoardSize;
    mode: GoGameMode;
    aiDifficulty: GoAiDifficulty;
    playerColor: GoColor;
  }) => void;
}

export const GoLobby: React.FC<GoLobbyProps> = ({
  hasSavedGame,
  onResumeSavedGame,
  onStartNewGame,
}) => {
  const { language } = useLanguage();
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [mode, setMode] = useState<GoGameMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<GoAiDifficulty>('easy');
  const [playerColor, setPlayerColor] = useState<GoColor>('black');

  const handleStart = () => {
    onStartNewGame({
      boardSize,
      mode,
      aiDifficulty,
      playerColor,
    });
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-4 py-2">
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

      {/* Box Cấu hình ván đấu */}
      <div className="pixel-box bg-[#FFFDF8] border-3 border-zinc-900 p-4 space-y-4 shadow-[4px_4px_0px_#000]">
        <div className="text-center border-b-2 border-zinc-900 pb-2">
          <h2 className="font-pixel text-xl font-bold uppercase text-zinc-900">
            {language === 'vi' ? 'THIẾT LẬP BÀN CỜ VÂY' : 'GO GAME SETUP'}
          </h2>
          <p className="text-xs font-mono text-zinc-600">
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
                className={`p-2 border-2 border-zinc-900 text-center transition-all ${
                  boardSize === item.size
                    ? 'bg-amber-300 shadow-[2px_2px_0px_#000] -translate-y-0.5'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700'
                }`}
              >
                <div className="font-pixel text-sm font-bold text-zinc-950">{item.label}</div>
                <div className="text-[10px] font-mono text-zinc-600 truncate">{item.sub}</div>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Chọn chế độ chơi */}
        <div className="space-y-1.5">
          <label className="font-pixel text-xs font-bold text-zinc-900 block">
            {language === 'vi' ? '2. CHẾ ĐỘ ĐỐI ĐẦU' : '2. GAME MODE'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setMode('ai')}
              className={`p-2.5 border-2 border-zinc-900 flex items-center justify-center gap-2 transition-all ${
                mode === 'ai'
                  ? 'bg-amber-300 shadow-[2px_2px_0px_#000] -translate-y-0.5'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <Bot className="w-4 h-4 text-zinc-950" />
              <span className="font-pixel text-xs font-bold text-zinc-950">
                {language === 'vi' ? 'ĐẤU VỚI MÁY' : 'VS BOT AI'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMode('pass_and_play')}
              className={`p-2.5 border-2 border-zinc-900 flex items-center justify-center gap-2 transition-all ${
                mode === 'pass_and_play'
                  ? 'bg-amber-300 shadow-[2px_2px_0px_#000] -translate-y-0.5'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              <Users className="w-4 h-4 text-zinc-950" />
              <span className="font-pixel text-xs font-bold text-zinc-950">
                {language === 'vi' ? 'CHƠI ĐÔI' : 'PASS & PLAY'}
              </span>
            </button>
          </div>
        </div>

        {/* Cấu hình thêm nếu Đấu với Máy */}
        {mode === 'ai' && (
          <div className="space-y-3 p-3 bg-zinc-50 border border-zinc-300 rounded">
            {/* Độ khó */}
            <div className="space-y-1">
              <label className="font-pixel text-[11px] font-bold text-zinc-700 block">
                {language === 'vi' ? 'ĐỘ KHÓ CỦA BOT:' : 'BOT DIFFICULTY:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiDifficulty('easy')}
                  className={`py-1.5 text-xs font-pixel font-bold border border-zinc-900 ${
                    aiDifficulty === 'easy' ? 'bg-emerald-300 text-emerald-950' : 'bg-white text-zinc-700'
                  }`}
                >
                  {language === 'vi' ? '🟢 TẬP SỰ (DỄ)' : '🟢 NOVICE (EASY)'}
                </button>
                <button
                  type="button"
                  onClick={() => setAiDifficulty('medium')}
                  className={`py-1.5 text-xs font-pixel font-bold border border-zinc-900 ${
                    aiDifficulty === 'medium' ? 'bg-amber-300 text-amber-950' : 'bg-white text-zinc-700'
                  }`}
                >
                  {language === 'vi' ? '🟡 KỲ THỦ (VỪA)' : '🟡 MASTER (MED)'}
                </button>
              </div>
            </div>

            {/* Màu quân */}
            <div className="space-y-1">
              <label className="font-pixel text-[11px] font-bold text-zinc-700 block">
                {language === 'vi' ? 'BẠN CẦM QUÂN:' : 'YOUR STONES:'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPlayerColor('black')}
                  className={`py-1.5 text-xs font-pixel font-bold border border-zinc-900 flex items-center justify-center gap-1.5 ${
                    playerColor === 'black' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-black border border-white inline-block" />
                  <span>{language === 'vi' ? 'ĐEN (ĐI TRƯỚC)' : 'BLACK (FIRST)'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlayerColor('white')}
                  className={`py-1.5 text-xs font-pixel font-bold border border-zinc-900 flex items-center justify-center gap-1.5 ${
                    playerColor === 'white' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-800'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-white border border-black inline-block" />
                  <span>{language === 'vi' ? 'TRẮNG (ĐI SAU)' : 'WHITE (SECOND)'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Nút Bắt đầu */}
        <button
          type="button"
          onClick={handleStart}
          className="w-full pixel-btn bg-emerald-400 hover:bg-emerald-300 text-zinc-950 py-3.5 font-pixel text-sm font-bold flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000]"
        >
          <Play className="w-4 h-4 fill-current" />
          <span>{language === 'vi' ? 'BẮT ĐẦU VÁN CỜ' : 'START GAME'}</span>
        </button>
      </div>
    </div>
  );
};
