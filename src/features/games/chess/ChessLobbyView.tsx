'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Users,
  Bot,
  Wifi,
  Play,
  ArrowRight,
  Sparkles,
  Clock,
  Zap,
  CheckCircle2,
  X,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Trophy,
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
  onStartLocalMatch?: (p1Name: string, p2Name: string, timeControl: number) => void;
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
  onStartLocalMatch,
  isCreating,
  isJoining,
  isSearchingMatch,
  searchElapsedSeconds,
  matchFoundOpponentName,
  errorMessage,
}: ChessLobbyViewProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'local' | 'bot' | 'online'>('local');

  // Form State cho Chơi đôi (Pass & Play)
  const [pWhiteName, setPWhiteName] = useState('Kỳ thủ Trắng');
  const [pBlackName, setPBlackName] = useState('Kỳ thủ Đen');

  // Form State cho Đấu máy (Bot AI)
  const [botDifficulty, setBotDifficulty] = useState<BotDifficulty>('medium');
  const [botColor, setBotColor] = useState<'white' | 'black' | 'random'>('white');

  // Form State cho Online
  const [inputCode, setInputCode] = useState('');
  const [selectedTime, setSelectedTime] = useState<number>(300); // Mặc định 5 phút

  // Accordions
  const [showStats, setShowStats] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const timeOptions = [
    { value: 180, label: t.chess.time3m },
    { value: 300, label: t.chess.time5m },
    { value: 600, label: t.chess.time10m },
    { value: 0, label: t.chess.timeUnlimited },
  ];

  const handleStartLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (onStartLocalMatch) {
      onStartLocalMatch(
        pWhiteName.trim() || 'Kỳ thủ Trắng',
        pBlackName.trim() || 'Kỳ thủ Đen',
        selectedTime
      );
    }
  };

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
    <div className="mx-auto max-w-lg select-none">
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="pixel-badge inline-flex items-center gap-1.5 bg-indigo-200 px-3.5 py-1 text-xs font-bold text-zinc-950 mb-2.5">
          <Sparkles className="h-3.5 w-3.5 text-indigo-700" />
          <span>{language === 'vi' ? 'ĐẤU TRÍ 1V1 HOÀNG GIA' : 'ROYAL 1V1 STRATEGY'}</span>
        </div>
        <h1 className="font-pixel text-3xl sm:text-4xl font-bold tracking-wide text-zinc-950 uppercase">
          {language === 'vi' ? 'Cờ Vua (Chess)' : 'Chess'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-mono text-zinc-600 leading-relaxed max-w-md mx-auto">
          {language === 'vi'
            ? 'Đấu trí đỉnh cao trên bàn cờ 64 ô quốc tế 16-bit. Chọn chế độ chơi để bắt đầu!'
            : 'Master the 16-bit royal 64-square battlefield. Choose your game mode to begin!'}
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="grid grid-cols-3 gap-2 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={`pixel-btn flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold min-h-[44px] ${
            activeTab === 'local'
              ? 'bg-indigo-600 text-amber-300'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{language === 'vi' ? 'CHƠI ĐÔI' : 'PASS & PLAY'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bot')}
          className={`pixel-btn flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold min-h-[44px] ${
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
          onClick={() => setActiveTab('online')}
          className={`pixel-btn flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold min-h-[44px] ${
            activeTab === 'online'
              ? 'bg-indigo-600 text-amber-300'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <Wifi className="h-4 w-4" />
          <span>{language === 'vi' ? 'ĐẤU ONLINE' : 'ONLINE PVP'}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 bg-rose-100 border-2 border-zinc-900 p-3 text-xs font-mono font-bold text-rose-900 shadow-pixel-sm animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* TAB 1: CHƠI ĐÔI (Pass & Play) */}
      {activeTab === 'local' && (
        <div className="pixel-box-lg bg-[#FFFDF8] p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4 font-pixel text-xs font-bold uppercase tracking-wider text-indigo-800">
            <Users className="h-4 w-4" />
            <span>{language === 'vi' ? '2 NGƯỜI CHƠI TRÊN CÙNG THIẾT BỊ' : '2 PLAYERS ON SAME DEVICE'}</span>
          </div>

          <form onSubmit={handleStartLocal} className="space-y-4">
            <div>
              <label className="block font-pixel text-xs font-bold text-zinc-800 mb-1.5 uppercase">
                {language === 'vi' ? 'Bên Trắng (Đi trước - ♔):' : 'White Player (Moves First - ♔):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-800 font-black">
                  ♔
                </span>
                <input
                  type="text"
                  maxLength={18}
                  value={pWhiteName}
                  onChange={(e) => setPWhiteName(e.target.value)}
                  className="pixel-input w-full bg-white pl-9 pr-3.5 py-2.5 text-sm font-bold text-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-pixel text-xs font-bold text-zinc-800 mb-1.5 uppercase">
                {language === 'vi' ? 'Bên Đen (Đi sau - ♚):' : 'Black Player (Moves Second - ♚):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-800 font-black">
                  ♚
                </span>
                <input
                  type="text"
                  maxLength={18}
                  value={pBlackName}
                  onChange={(e) => setPBlackName(e.target.value)}
                  className="pixel-input w-full bg-white pl-9 pr-3.5 py-2.5 text-sm font-bold text-zinc-900"
                />
              </div>
            </div>

            {/* Chọn thời gian */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 font-pixel text-xs font-bold text-zinc-800 uppercase">
                <Clock className="h-3.5 w-3.5 text-indigo-700" />
                <span>{t.chess.timeControl}:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {timeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedTime(opt.value)}
                    className={`pixel-btn py-2 px-2 text-center text-xs font-bold ${
                      selectedTime === opt.value
                        ? 'bg-amber-300 text-zinc-950'
                        : 'bg-white text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] font-mono text-zinc-700 leading-relaxed bg-[#ECE8DD] border-2 border-zinc-900 p-3">
              💡 {language === 'vi'
                ? 'Hai bạn chuyền tay nhau đánh lần lượt từng nước trên cùng màn hình điện thoại hoặc máy tính.'
                : 'Pass & play locally on the same device. Take turns moving pieces.'}
            </p>

            <button
              type="submit"
              className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-amber-300"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{language === 'vi' ? 'BẮT ĐẦU VÁN ĐẤU' : 'START MATCH'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: ĐẤU MÁY (Bot AI) */}
      {activeTab === 'bot' && (
        <div className="pixel-box-lg bg-[#FFFDF8] p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 font-pixel text-xs font-bold uppercase tracking-wider text-indigo-800">
            <Bot className="h-4 w-4" />
            <span>{language === 'vi' ? 'TẬP LUYỆN VỚI TRÍ TUỆ NHÂN TẠO' : 'PRACTICE WITH AI'}</span>
          </div>

          {/* Chọn độ khó */}
          <div>
            <label className="block font-pixel text-xs font-bold text-zinc-800 mb-2 uppercase">
              {t.chess.difficulty}:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy', label: t.chess.botEasy, desc: language === 'vi' ? 'Dễ' : 'Easy', activeBg: 'bg-emerald-300 text-zinc-950' },
                { id: 'medium', label: t.chess.botMedium, desc: language === 'vi' ? 'Vừa' : 'Medium', activeBg: 'bg-amber-300 text-zinc-950' },
                { id: 'hard', label: t.chess.botHard, desc: language === 'vi' ? 'Khó' : 'Hard', activeBg: 'bg-rose-300 text-zinc-950' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setBotDifficulty(lvl.id as BotDifficulty)}
                  className={`pixel-btn flex flex-col items-center justify-center p-3 ${
                    botDifficulty === lvl.id
                      ? lvl.activeBg
                      : 'bg-white hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <span className="font-pixel text-xs font-bold">
                    {lvl.label}
                  </span>
                  <span className="text-[10px] font-mono mt-0.5">
                    {lvl.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chọn quân (Màu cờ) */}
          <div>
            <label className="block font-pixel text-xs font-bold text-zinc-800 mb-2 uppercase">
              {t.chess.chooseColor}:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBotColor('white')}
                className={`pixel-btn flex flex-col items-center justify-center p-3 ${
                  botColor === 'white'
                    ? 'bg-amber-200 text-zinc-950'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700'
                }`}
              >
                <span className="font-pixel text-sm font-bold">♔ {t.chess.colorWhite}</span>
                <span className="text-[10px] font-mono mt-0.5">
                  {language === 'vi' ? 'Đi trước' : 'Moves first'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBotColor('black')}
                className={`pixel-btn flex flex-col items-center justify-center p-3 ${
                  botColor === 'black'
                    ? 'bg-zinc-900 text-amber-300'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700'
                }`}
              >
                <span className="font-pixel text-sm font-bold">♚ {t.chess.colorBlack}</span>
                <span className="text-[10px] font-mono mt-0.5">
                  {language === 'vi' ? 'Đi sau' : 'Moves second'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBotColor('random')}
                className={`pixel-btn flex flex-col items-center justify-center p-3 ${
                  botColor === 'random'
                    ? 'bg-indigo-200 text-zinc-950'
                    : 'bg-white hover:bg-zinc-100 text-zinc-700'
                }`}
              >
                <span className="font-pixel text-sm font-bold">🎲 {t.chess.colorRandom}</span>
                <span className="text-[10px] font-mono mt-0.5">50/50</span>
              </button>
            </div>
          </div>

          {/* Chọn thời gian */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 font-pixel text-xs font-bold text-zinc-800 uppercase">
              <Clock className="h-3.5 w-3.5 text-indigo-700" />
              <span>{t.chess.timeControl}:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTime(opt.value)}
                  className={`pixel-btn py-2 px-2 text-center text-xs font-bold ${
                    selectedTime === opt.value
                      ? 'bg-amber-300 text-zinc-950'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onStartBotMatch(botDifficulty, botColor, selectedTime)}
            className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-3 text-sm font-bold text-amber-300"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{t.chess.startBotMatch}</span>
          </button>
        </div>
      )}

      {/* TAB 3: ĐẤU ONLINE */}
      {activeTab === 'online' && (
        <div className="pixel-box-lg bg-[#FFFDF8] p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 font-pixel text-xs font-bold uppercase tracking-wider text-emerald-800">
            <Wifi className="h-4 w-4" />
            <span>{language === 'vi' ? 'CHIẾN THUẬT THỜI GIAN THỰC' : 'REALTIME PVP ONLINE'}</span>
          </div>

          {/* Chọn thời gian thi đấu */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 font-pixel text-xs font-bold text-zinc-800 uppercase">
              <Clock className="h-3.5 w-3.5 text-emerald-700" />
              <span>{t.chess.timeControl}:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTime(opt.value)}
                  className={`pixel-btn py-2 px-2 text-center text-xs font-bold ${
                    selectedTime === opt.value
                      ? 'bg-emerald-300 text-zinc-950'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ghép trận nhanh */}
          <div className="border-2 border-zinc-900 bg-emerald-100 p-4 shadow-pixel-sm">
            <h4 className="font-pixel text-sm font-bold text-zinc-950 mb-1 flex items-center gap-1.5 uppercase">
              <Zap className="h-4 w-4 text-emerald-700 fill-current" />
              <span>{t.chess.quickMatch}</span>
              <span className="bg-amber-300 border border-zinc-900 px-2 py-0.5 text-[9px] font-bold text-zinc-950 uppercase">
                {language === 'vi' ? 'KHUYÊN DÙNG' : 'RECOMMENDED'}
              </span>
            </h4>
            <p className="text-xs font-mono text-zinc-700 mb-3 leading-relaxed">
              {t.chess.quickMatchDesc}
            </p>
            <button
              type="button"
              onClick={() => onStartQuickMatch(selectedTime)}
              disabled={isSearchingMatch}
              className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 py-2.5 text-xs font-bold text-zinc-950 disabled:opacity-50"
            >
              <span>{isSearchingMatch ? (language === 'vi' ? 'ĐANG TÌM...' : 'SEARCHING...') : t.chess.findMatch}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-0.5 flex-1 bg-zinc-300" />
            <span className="font-pixel text-[11px] font-bold text-zinc-500 uppercase">
              {language === 'vi' ? 'HOẶC TẠO PHÒNG RIÊNG' : 'OR PRIVATE ROOM'}
            </span>
            <div className="h-0.5 flex-1 bg-zinc-300" />
          </div>

          {/* Tạo phòng & Nhập mã phòng */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onCreateRoom(selectedTime)}
              disabled={isCreating}
              className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 py-2.5 text-xs font-bold text-amber-300"
            >
              <span>{isCreating ? (language === 'vi' ? 'ĐANG TẠO PHÒNG...' : 'CREATING...') : (language === 'vi' ? 'TẠO PHÒNG RIÊNG & LẤY MÃ MỜI' : 'CREATE ROOM & GET CODE')}</span>
            </button>

            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={8}
                placeholder={language === 'vi' ? 'Nhập mã 6 ký tự...' : 'Enter 6-char code...'}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="pixel-input flex-1 bg-white px-3.5 py-2 font-pixel text-xs font-bold tracking-wider uppercase"
              />
              <button
                type="submit"
                disabled={isJoining || inputCode.trim().length < 4}
                className="pixel-btn bg-zinc-900 px-4 py-2 text-xs font-bold text-amber-300 hover:bg-zinc-800 disabled:opacity-40"
              >
                {language === 'vi' ? 'VÀO PHÒNG' : 'JOIN'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Accordion Thành tích cá nhân */}
      <div className="pixel-box mt-5 bg-[#FFFDF8] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-amber-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span className="font-pixel text-xs font-bold text-zinc-900 uppercase">
              {language === 'vi' ? 'BẢNG THÀNH TÍCH CỜ VUA CỦA BẠN' : 'YOUR CHESS PERFORMANCE STATS'}
            </span>
          </div>
          {showStats ? (
            <ChevronUp className="h-4 w-4 text-zinc-700" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-700" />
          )}
        </button>

        {showStats && (
          <div className="border-t-2 border-zinc-900 p-4 bg-[#ECE8DD]">
            <ChessStatsCard />
          </div>
        )}
      </div>

      {/* Accordion Hướng dẫn luật chơi Cờ Vua */}
      <div className="pixel-box mt-3 bg-[#FFFDF8] overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-indigo-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-700" />
            <span className="font-pixel text-xs font-bold text-zinc-900 uppercase">
              {language === 'vi' ? 'QUY TẮC DI CHUYỂN QUÂN CỜ VUA' : 'QUICK CHESS RULES SUMMARY'}
            </span>
          </div>
          {showRules ? (
            <ChevronUp className="h-4 w-4 text-zinc-700" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-700" />
          )}
        </button>

        {showRules && (
          <div className="border-t-2 border-zinc-900 p-4 bg-[#ECE8DD] text-xs font-mono text-zinc-800 space-y-2 leading-relaxed">
            <p>• <strong>Xe (Rook):</strong> Đi ngang dọc tự do không giới hạn số ô nếu không có quân cản.</p>
            <p>• <strong>Tượng (Bishop):</strong> Đi chéo tự do theo các ô cùng màu không giới hạn khoảng cách.</p>
            <p>• <strong>Mã (Knight):</strong> Đi hình chữ L (2 ô một hướng và 1 ô vuông góc). Mã có thể nhảy qua các quân khác mà không bị cản.</p>
            <p>• <strong>Hậu (Queen):</strong> Quân cơ động nhất, kết hợp sức mạnh của cả Xe và Tượng (đi ngang, dọc, chéo).</p>
            <p>• <strong>Vua (King):</strong> Đi 1 ô theo mọi hướng. Có luật <em>Nhập thành (Castling)</em> để đưa vua vào vị trí an toàn.</p>
            <p>• <strong>Tốt (Pawn):</strong> Nước đầu đi 1 hoặc 2 ô thẳng; các nước sau đi thẳng 1 ô; ăn quân chéo 1 ô về phía trước. Hỗ trợ <em>Bắt tốt qua đường (En Passant)</em> và <em>Phong cấp</em> khi chạm hàng cuối.</p>
          </div>
        )}
      </div>

      {/* MATCHMAKING SEARCHING OVERLAY */}
      {isSearchingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in">
          <div className="pixel-box-lg w-full max-w-sm bg-[#FFFDF8] p-6 sm:p-8 text-center animate-scale-up">
            {matchFoundOpponentName ? (
              <div>
                <div className="mx-auto flex h-16 w-16 items-center justify-center bg-emerald-300 border-2 border-zinc-900 text-zinc-950 mb-4 animate-bounce">
                  <CheckCircle2 className="h-9 w-9" />
                </div>
                <h3 className="font-pixel text-2xl font-bold text-zinc-950 uppercase">
                  {t.chess.matchFound}
                </h3>
                <p className="mt-2 font-pixel text-sm text-indigo-700 font-bold">
                  {language === 'vi'
                    ? `Đang kết nối cùng ${matchFoundOpponentName}...`
                    : `Connecting with ${matchFoundOpponentName}...`}
                </p>
              </div>
            ) : (
              <div>
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center bg-indigo-600 text-amber-300 border-2 border-zinc-900 shadow-pixel-sm mb-5">
                  <Zap className="h-8 w-8 animate-pulse" />
                </div>

                <h3 className="font-pixel text-xl font-bold text-zinc-950 uppercase">
                  {t.chess.searchingOpponent}
                </h3>
                <p className="mt-1 text-xs font-mono text-zinc-600">
                  {t.chess.searchingDesc}
                </p>

                {/* Queue Timer */}
                <div className="my-5 inline-flex items-center gap-2 bg-[#ECE8DD] border-2 border-zinc-900 px-4 py-1.5 font-pixel text-sm font-bold text-zinc-900">
                  <Clock className="h-3.5 w-3.5 text-indigo-700" />
                  <span>
                    {t.chess.queueTime.replace('{time}', formatQueueTime(searchElapsedSeconds))}
                  </span>
                </div>

                {/* 1-minute Timeout Suggestion to Play with Bot */}
                {searchElapsedSeconds >= 60 && (
                  <div className="mb-4 border-2 border-zinc-900 bg-indigo-50 p-4 text-center shadow-pixel-xs">
                    <p className="text-xs font-mono font-bold text-indigo-950 mb-3 leading-relaxed">
                      {t.chess.quickMatchTimeoutOffer}
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onCancelQuickMatch();
                        onStartBotMatch('medium', 'random', selectedTime);
                      }}
                      className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-indigo-600 py-2.5 text-xs font-bold text-amber-300"
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
                  className="pixel-btn inline-flex w-full items-center justify-center gap-1.5 bg-white py-2.5 text-xs font-bold text-zinc-900 hover:bg-rose-50"
                >
                  <X className="h-4 w-4 text-rose-600" />
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
