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
        <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 px-3.5 py-1 text-xs font-bold text-indigo-700 mb-2.5 shadow-2xs">
          <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
          <span>{language === 'vi' ? 'Đấu trí 1v1 Hoàng gia' : 'Royal 1v1 Strategy'}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900">
          {language === 'vi' ? 'Cờ Vua (Chess)' : 'Chess'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
          {language === 'vi'
            ? 'Đấu trí đỉnh cao trên bàn cờ 64 ô quốc tế. Chọn chế độ chơi để bắt đầu!'
            : 'Master the royal 64-square battlefield. Choose your game mode to begin!'}
        </p>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex gap-1.5 rounded-2xl bg-gray-100 p-1.5 mb-5 shadow-inner">
        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-all ${
            activeTab === 'local'
              ? 'bg-white text-indigo-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{language === 'vi' ? 'Chơi Đôi' : 'Pass & Play'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bot')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-all ${
            activeTab === 'bot'
              ? 'bg-white text-purple-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>{language === 'vi' ? 'Đấu Máy' : 'Bot AI'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-black transition-all ${
            activeTab === 'online'
              ? 'bg-white text-emerald-700 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Wifi className="h-4 w-4" />
          <span>{language === 'vi' ? 'Đấu Online' : 'Online PvP'}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* TAB 1: CHƠI ĐÔI (Pass & Play) */}
      {activeTab === 'local' && (
        <div className="rounded-3xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-indigo-700">
            <Users className="h-4 w-4" />
            <span>{language === 'vi' ? '2 người chơi trên cùng thiết bị' : '2 players on same device'}</span>
          </div>

          <form onSubmit={handleStartLocal} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {language === 'vi' ? 'Tên bên Trắng (Đi trước - ♔):' : 'White Player (Moves First - ♔):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-800 font-black">
                  ♔
                </span>
                <input
                  type="text"
                  maxLength={18}
                  value={pWhiteName}
                  onChange={(e) => setPWhiteName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 pl-9 pr-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1.5">
                {language === 'vi' ? 'Tên bên Đen (Đi sau - ♚):' : 'Black Player (Moves Second - ♚):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-800 font-black">
                  ♚
                </span>
                <input
                  type="text"
                  maxLength={18}
                  value={pBlackName}
                  onChange={(e) => setPBlackName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 pl-9 pr-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:border-gray-800 focus:ring-1 focus:ring-gray-800"
                />
              </div>
            </div>

            {/* Chọn thời gian */}
            <div>
              <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                <Clock className="h-3.5 w-3.5 text-indigo-600" />
                <span>{t.chess.timeControl}:</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {timeOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setSelectedTime(opt.value)}
                    className={`rounded-xl border py-2 px-2 text-center text-xs font-bold transition-all ${
                      selectedTime === opt.value
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 ring-2 ring-indigo-400/30 shadow-xs'
                        : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed bg-amber-50/70 border border-amber-200/60 p-3 rounded-xl">
              💡 {language === 'vi'
                ? 'Hai bạn chuyền tay nhau đánh lần lượt từng nước trên cùng màn hình điện thoại hoặc máy tính.'
                : 'Pass & play locally on the same device. Take turns moving pieces.'}
            </p>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 py-3 text-sm font-black text-white shadow-md hover:from-indigo-700 hover:to-blue-700 active:scale-98 transition-all"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{language === 'vi' ? 'Bắt Đầu Ván Đấu' : 'Start Match'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: ĐẤU MÁY (Bot AI) */}
      {activeTab === 'bot' && (
        <div className="rounded-3xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700">
            <Bot className="h-4 w-4" />
            <span>{language === 'vi' ? 'Tập luyện với Trí tuệ nhân tạo' : 'Practice with AI'}</span>
          </div>

          {/* Chọn độ khó */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.chess.difficulty}:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy', label: t.chess.botEasy, desc: language === 'vi' ? 'Dễ' : 'Easy' },
                { id: 'medium', label: t.chess.botMedium, desc: language === 'vi' ? 'Vừa' : 'Medium' },
                { id: 'hard', label: t.chess.botHard, desc: language === 'vi' ? 'Khó' : 'Hard' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setBotDifficulty(lvl.id as BotDifficulty)}
                  className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
                    botDifficulty === lvl.id
                      ? 'border-purple-600 bg-purple-50/80 shadow-xs ring-2 ring-purple-400/30'
                      : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <span className={`text-xs font-black ${botDifficulty === lvl.id ? 'text-purple-900' : 'text-gray-800'}`}>
                    {lvl.label}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                    {lvl.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chọn quân (Màu cờ) */}
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">
              {t.chess.chooseColor}:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setBotColor('white')}
                className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
                  botColor === 'white'
                    ? 'border-indigo-600 bg-indigo-50 shadow-xs ring-2 ring-indigo-400/30'
                    : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className="text-sm font-black text-indigo-900">♔ {t.chess.colorWhite}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">
                  {language === 'vi' ? 'Đi trước' : 'Moves first'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBotColor('black')}
                className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
                  botColor === 'black'
                    ? 'border-gray-900 bg-gray-100 shadow-xs ring-2 ring-gray-400/30'
                    : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className="text-sm font-black text-gray-900">♚ {t.chess.colorBlack}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">
                  {language === 'vi' ? 'Đi sau' : 'Moves second'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setBotColor('random')}
                className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
                  botColor === 'random'
                    ? 'border-purple-600 bg-purple-50 shadow-xs ring-2 ring-purple-400/30'
                    : 'border-gray-200 bg-gray-50/60 hover:bg-gray-100 text-gray-600'
                }`}
              >
                <span className="text-sm font-black text-purple-700">🎲 {t.chess.colorRandom}</span>
                <span className="text-[10px] text-gray-500 mt-0.5">50/50</span>
              </button>
            </div>
          </div>

          {/* Chọn thời gian */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Clock className="h-3.5 w-3.5 text-purple-600" />
              <span>{t.chess.timeControl}:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTime(opt.value)}
                  className={`rounded-xl border py-2 px-2 text-center text-xs font-bold transition-all ${
                    selectedTime === opt.value
                      ? 'border-purple-600 bg-purple-50 text-purple-900 ring-2 ring-purple-400/30 shadow-xs'
                      : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:bg-gray-100'
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
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-purple-600 py-3 text-sm font-black text-white shadow-md hover:bg-purple-700 active:scale-98 transition-all"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{t.chess.startBotMatch}</span>
          </button>
        </div>
      )}

      {/* TAB 3: ĐẤU ONLINE */}
      {activeTab === 'online' && (
        <div className="rounded-3xl border border-gray-200/90 bg-white p-5 sm:p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Wifi className="h-4 w-4" />
            <span>{language === 'vi' ? 'Chiến thuật thời gian thực' : 'Realtime PvP Online'}</span>
          </div>

          {/* Chọn thời gian thi đấu */}
          <div>
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Clock className="h-3.5 w-3.5 text-emerald-600" />
              <span>{t.chess.timeControl}:</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTime(opt.value)}
                  className={`rounded-xl border py-2 px-2 text-center text-xs font-bold transition-all ${
                    selectedTime === opt.value
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-400/30 shadow-xs'
                      : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ghép trận nhanh */}
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
            <h4 className="text-sm font-black text-emerald-950 mb-1 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-600 fill-current" />
              <span>{t.chess.quickMatch}</span>
              <span className="rounded-full bg-emerald-200/80 px-2 py-0.5 text-[9px] font-bold text-emerald-900 uppercase">
                {language === 'vi' ? 'Khuyên dùng' : 'Recommended'}
              </span>
            </h4>
            <p className="text-xs text-emerald-800/80 mb-3 leading-relaxed">
              {t.chess.quickMatchDesc}
            </p>
            <button
              type="button"
              onClick={() => onStartQuickMatch(selectedTime)}
              disabled={isSearchingMatch}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-xs font-black text-white shadow-sm hover:bg-emerald-700 active:scale-98 transition-all disabled:opacity-50"
            >
              <span>{isSearchingMatch ? (language === 'vi' ? 'Đang tìm...' : 'Searching...') : t.chess.findMatch}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-[11px] font-bold text-gray-400 uppercase">
              {language === 'vi' ? 'Hoặc tạo phòng riêng' : 'Or Private Room'}
            </span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Tạo phòng & Nhập mã phòng */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => onCreateRoom(selectedTime)}
              disabled={isCreating}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50/80 py-2.5 text-xs font-bold text-gray-800 hover:bg-gray-100 active:scale-98 transition-all"
            >
              <span>{isCreating ? (language === 'vi' ? 'Đang tạo phòng...' : 'Creating...') : (language === 'vi' ? 'Tạo Phòng Riêng & Lấy Mã Mời' : 'Create Room & Get Code')}</span>
            </button>

            <form onSubmit={handleJoinSubmit} className="flex gap-2">
              <input
                type="text"
                maxLength={8}
                placeholder={language === 'vi' ? 'Nhập mã phòng 6 ký tự...' : 'Enter 6-char code...'}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="flex-1 rounded-xl border border-gray-300 px-3.5 py-2 text-xs font-mono font-bold tracking-wider uppercase focus:border-emerald-600 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isJoining || inputCode.trim().length < 4}
                className="rounded-xl bg-gray-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-gray-800 active:scale-95 disabled:opacity-40"
              >
                {language === 'vi' ? 'Vào phòng' : 'Join'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Accordion Thành tích cá nhân */}
      <div className="mt-5 rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowStats(!showStats)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            <span className="text-xs font-black text-gray-800">
              {language === 'vi' ? 'Bảng thành tích thi đấu cờ vua của bạn' : 'Your Chess Performance Stats'}
            </span>
          </div>
          {showStats ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {showStats && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/50">
            <ChessStatsCard />
          </div>
        )}
      </div>

      {/* Accordion Hướng dẫn luật chơi Cờ Vua */}
      <div className="mt-3 rounded-2xl border border-gray-200/80 bg-white overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-indigo-600" />
            <span className="text-xs font-black text-gray-800">
              {language === 'vi' ? 'Quy tắc di chuyển quân Cờ Vua tóm tắt' : 'Quick Chess Rules Summary'}
            </span>
          </div>
          {showRules ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </button>

        {showRules && (
          <div className="border-t border-gray-100 p-4 bg-gray-50/50 text-xs text-gray-600 space-y-2 leading-relaxed">
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

                {/* 1-minute Timeout Suggestion to Play with Bot */}
                {searchElapsedSeconds >= 60 && (
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
