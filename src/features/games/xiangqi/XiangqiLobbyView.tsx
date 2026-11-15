'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Sparkles,
  Users,
  Bot,
  Wifi,
  Play,
  ArrowRight,
  Zap,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Side } from './xiangqiLogic';

export type XiangqiBotDifficulty = 'easy' | 'medium' | 'hard';

interface XiangqiLobbyViewProps {
  onStartLocalMatch: (playerRedName: string, playerBlackName: string) => void;
  onStartBotMatch?: (difficulty: XiangqiBotDifficulty, playerSide: Side | 'random') => void;
  onCreateOnlineRoom?: () => void;
  onJoinOnlineRoom?: (code: string) => void;
  onStartQuickMatch?: () => void;
  onCancelQuickMatch?: () => void;
  isCreatingOnline?: boolean;
  isJoiningOnline?: boolean;
  isSearchingQuickMatch?: boolean;
  errorMessage?: string | null;
}

export function XiangqiLobbyView({
  onStartLocalMatch,
  onStartBotMatch,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartQuickMatch,
  onCancelQuickMatch,
  isCreatingOnline = false,
  isJoiningOnline = false,
  isSearchingQuickMatch = false,
  errorMessage,
}: XiangqiLobbyViewProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'local' | 'bot' | 'online'>('local');

  // Form State cho Chơi đôi (Pass & Play)
  const [pRedName, setPRedName] = useState('Kỳ thủ Đỏ');
  const [pBlackName, setPBlackName] = useState('Kỳ thủ Đen');

  // Form State cho Đấu máy (Bot AI)
  const [botDifficulty, setBotDifficulty] = useState<XiangqiBotDifficulty>('medium');
  const [playerSide, setPlayerSide] = useState<Side | 'random'>('red');

  // Form State cho Online
  const [inputCode, setInputCode] = useState('');

  // Accordion Hướng dẫn luật chơi
  const [showRules, setShowRules] = useState(false);

  const handleStartLocal = (e: React.FormEvent) => {
    e.preventDefault();
    onStartLocalMatch(pRedName.trim() || 'Kỳ thủ Đỏ', pBlackName.trim() || 'Kỳ thủ Đen');
  };

  const handleStartBot = () => {
    if (onStartBotMatch) {
      onStartBotMatch(botDifficulty, playerSide);
    }
  };

  return (
    <div className="mx-auto max-w-lg select-none">
      {/* Header Info */}
      <div className="text-center mb-6">
        <div className="pixel-badge bg-rose-300 text-zinc-900 mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{language === 'vi' ? 'Chiến thuật phương Đông' : 'Eastern Strategic Chess'}</span>
        </div>
        <h1 className="font-pixel text-3xl sm:text-4xl font-bold uppercase tracking-wide text-zinc-900">
          {language === 'vi' ? 'Cờ Tướng (Xiangqi)' : 'Xiangqi (Chinese Chess)'}
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-medium text-zinc-600 leading-relaxed max-w-md mx-auto">
          {language === 'vi'
            ? 'Đấu trí đỉnh cao trên bàn cờ Sở Hà Hán Giới. Chọn chế độ chơi để bắt đầu!'
            : 'Epic tactical board game across the Chu-Han river boundary. Choose your battle mode!'}
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 pixel-box-sm bg-zinc-200 p-1.5 mb-5">
        <button
          type="button"
          onClick={() => setActiveTab('local')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-pixel text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'local'
              ? 'border-2 border-zinc-900 bg-rose-600 text-white shadow-pixel-xs'
              : 'border-2 border-transparent text-zinc-700 hover:bg-white/60'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>{language === 'vi' ? 'Chơi Đôi' : 'Pass & Play'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bot')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-pixel text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'bot'
              ? 'border-2 border-zinc-900 bg-indigo-600 text-white shadow-pixel-xs'
              : 'border-2 border-transparent text-zinc-700 hover:bg-white/60'
          }`}
        >
          <Bot className="h-4 w-4" />
          <span>{language === 'vi' ? 'Đấu Máy' : 'Bot AI'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('online')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-pixel text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'online'
              ? 'border-2 border-zinc-900 bg-emerald-600 text-white shadow-pixel-xs'
              : 'border-2 border-transparent text-zinc-700 hover:bg-white/60'
          }`}
        >
          <Wifi className="h-4 w-4" />
          <span>{language === 'vi' ? 'Đấu Online' : 'Online PvP'}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="mb-4 pixel-box-sm bg-rose-100 p-3 font-pixel text-xs font-bold text-rose-800 animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* TAB 1: CHƠI ĐÔI (Pass & Play) */}
      {activeTab === 'local' && (
        <div className="pixel-box bg-white p-5 sm:p-6">
          <div className="flex items-center gap-2 mb-4 font-pixel text-xs font-bold uppercase tracking-wider text-rose-700">
            <Users className="h-4 w-4" />
            <span>{language === 'vi' ? '2 người chơi trên cùng thiết bị' : '2 players on same device'}</span>
          </div>

          <form onSubmit={handleStartLocal} className="space-y-4">
            <div>
              <label className="block font-pixel text-xs font-bold uppercase text-zinc-800 mb-1.5">
                {language === 'vi' ? 'Tên bên Đỏ (Đi trước - 帥):' : 'Red Player (Moves First):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-rose-600 font-black">
                  🔴
                </span>
                <input
                  type="text"
                  maxLength={18}
                  value={pRedName}
                  onChange={(e) => setPRedName(e.target.value)}
                  className="pixel-input w-full pl-9 pr-3.5 py-2.5 text-sm font-bold text-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block font-pixel text-xs font-bold uppercase text-zinc-800 mb-1.5">
                {language === 'vi' ? 'Tên bên Đen (Đi sau - 將):' : 'Black Player (Moves Second):'}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-zinc-800 font-black">
                  ⚫
                </span>
                <input
                  type="text"
                  maxLength={18}
                  value={pBlackName}
                  onChange={(e) => setPBlackName(e.target.value)}
                  className="pixel-input w-full pl-9 pr-3.5 py-2.5 text-sm font-bold text-zinc-900"
                />
              </div>
            </div>

            <p className="text-[11px] font-medium text-zinc-700 leading-relaxed bg-amber-50 border-2 border-zinc-900 p-3">
              💡 {language === 'vi'
                ? 'Trong ván cờ có nút xoay bàn cờ 180° tiện lợi để hai bạn chuyền tay điện thoại qua lại khi đến lượt.'
                : 'Features a 180° flip button to easily pass the phone back and forth on each turn.'}
            </p>

            <button
              type="submit"
              className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-rose-600 py-3 font-pixel text-sm font-bold uppercase tracking-wider text-white hover:bg-rose-500"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{language === 'vi' ? 'Bắt Đầu Ván Đấu' : 'Start Match'}</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 2: ĐẤU MÁY (Bot AI) */}
      {activeTab === 'bot' && (
        <div className="pixel-box bg-white p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 font-pixel text-xs font-bold uppercase tracking-wider text-indigo-700">
            <Bot className="h-4 w-4" />
            <span>{language === 'vi' ? 'Tập luyện với Trí tuệ nhân tạo' : 'Practice with AI'}</span>
          </div>

          {/* Chọn độ khó */}
          <div>
            <label className="block font-pixel text-xs font-bold uppercase text-zinc-800 mb-2">
              {language === 'vi' ? 'Cấp độ Bot AI:' : 'AI Difficulty:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'easy', labelVi: 'Tập sự', labelEn: 'Easy', desc: 'Dễ' },
                { id: 'medium', labelVi: 'Kỳ thủ', labelEn: 'Medium', desc: 'Vừa' },
                { id: 'hard', labelVi: 'Đại sư', labelEn: 'Master', desc: 'Khó' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setBotDifficulty(lvl.id as XiangqiBotDifficulty)}
                  className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${
                    botDifficulty === lvl.id
                      ? 'border-zinc-900 bg-indigo-600 text-white shadow-pixel-sm -translate-y-0.5'
                      : 'border-zinc-900 bg-zinc-50 hover:bg-zinc-100 text-zinc-700'
                  }`}
                >
                  <span className="font-pixel text-xs font-bold uppercase">
                    {language === 'vi' ? lvl.labelVi : lvl.labelEn}
                  </span>
                  <span className={`text-[10px] font-bold mt-0.5 ${botDifficulty === lvl.id ? 'text-indigo-200' : 'text-zinc-500'}`}>
                    {lvl.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Chọn phe (Quân cờ) */}
          <div>
            <label className="block font-pixel text-xs font-bold uppercase text-zinc-800 mb-2">
              {language === 'vi' ? 'Chọn phe bạn cầm:' : 'Choose your side:'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPlayerSide('red')}
                className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${
                  playerSide === 'red'
                    ? 'border-zinc-900 bg-rose-200 shadow-pixel-sm -translate-y-0.5'
                    : 'border-zinc-900 bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
                }`}
              >
                <span className="font-pixel text-xs font-bold uppercase text-rose-800">🔴 Bên Đỏ</span>
                <span className="text-[10px] font-bold text-zinc-600 mt-0.5">Đi trước</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerSide('black')}
                className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${
                  playerSide === 'black'
                    ? 'border-zinc-900 bg-zinc-800 text-white shadow-pixel-sm -translate-y-0.5'
                    : 'border-zinc-900 bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
                }`}
              >
                <span className="font-pixel text-xs font-bold uppercase">⚫ Bên Đen</span>
                <span className={`text-[10px] font-bold mt-0.5 ${playerSide === 'black' ? 'text-zinc-300' : 'text-zinc-500'}`}>Đi sau</span>
              </button>

              <button
                type="button"
                onClick={() => setPlayerSide('random')}
                className={`flex flex-col items-center justify-center p-3 border-2 transition-all ${
                  playerSide === 'random'
                    ? 'border-zinc-900 bg-purple-200 shadow-pixel-sm -translate-y-0.5'
                    : 'border-zinc-900 bg-zinc-50 hover:bg-zinc-100 text-zinc-600'
                }`}
              >
                <span className="font-pixel text-xs font-bold uppercase text-purple-900">🎲 Ngẫu nhiên</span>
                <span className="text-[10px] font-bold text-zinc-600 mt-0.5">50/50</span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleStartBot}
            className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-indigo-600 py-3 font-pixel text-sm font-bold uppercase tracking-wider text-white hover:bg-indigo-500"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{language === 'vi' ? 'Bắt Đầu Đấu Với Máy' : 'Start Bot Match'}</span>
          </button>
        </div>
      )}

      {/* TAB 3: ĐẤU ONLINE */}
      {activeTab === 'online' && (
        <div className="pixel-box bg-white p-5 sm:p-6 space-y-5">
          <div className="flex items-center gap-2 font-pixel text-xs font-bold uppercase tracking-wider text-emerald-700">
            <Wifi className="h-4 w-4" />
            <span>{language === 'vi' ? 'Chiến thuật thời gian thực' : 'Realtime PvP Online'}</span>
          </div>

          {/* Ghép trận nhanh */}
          <div className="border-2 border-zinc-900 bg-emerald-50 p-4 shadow-pixel-sm">
            <h4 className="font-pixel text-sm font-bold uppercase text-zinc-900 mb-1 flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-emerald-600 fill-current" />
              <span>{language === 'vi' ? 'Ghép Trận Nhanh (Quick Match)' : 'Quick Matchmaking'}</span>
            </h4>
            <p className="text-xs font-medium text-zinc-600 mb-3 leading-relaxed">
              {language === 'vi'
                ? 'Hệ thống sẽ tự động ghép bạn với người chơi khác đang online tại sảnh.'
                : 'Automatically matches you with another player online in the lobby.'}
            </p>
            {isSearchingQuickMatch ? (
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-center gap-2 py-1 font-pixel text-xs font-bold uppercase text-emerald-800">
                  <span className="h-3.5 w-3.5 animate-spin border-2 border-emerald-600 border-t-transparent" />
                  <span>{language === 'vi' ? 'Đang tìm đối thủ xứng tầm...' : 'Searching for opponent...'}</span>
                </div>
                <button
                  type="button"
                  onClick={onCancelQuickMatch}
                  className="pixel-btn w-full inline-flex items-center justify-center bg-white py-2 font-pixel text-xs font-bold uppercase text-zinc-800 hover:bg-zinc-100"
                >
                  {language === 'vi' ? 'Hủy Tìm Trận' : 'Cancel Search'}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={onStartQuickMatch}
                className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-emerald-600 py-2.5 font-pixel text-xs font-bold uppercase tracking-wider text-white hover:bg-emerald-500"
              >
                <span>{language === 'vi' ? 'Tìm Trận Ngay' : 'Find Match Now'}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="h-0.5 flex-1 bg-zinc-300" />
            <span className="font-pixel text-[11px] font-bold text-zinc-500 uppercase">
              {language === 'vi' ? 'Hoặc tạo phòng riêng' : 'Or Private Room'}
            </span>
            <div className="h-0.5 flex-1 bg-zinc-300" />
          </div>

          {/* Tạo phòng & Nhập mã phòng */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={onCreateOnlineRoom}
              disabled={isCreatingOnline}
              className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-amber-300 py-2.5 font-pixel text-xs font-bold uppercase tracking-wider text-zinc-900 hover:bg-amber-200"
            >
              <span>{isCreatingOnline ? (language === 'vi' ? 'Đang tạo phòng...' : 'Creating...') : (language === 'vi' ? 'Tạo Phòng Riêng & Lấy Mã Mời' : 'Create Room & Get Code')}</span>
            </button>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputCode.trim().length >= 4 && onJoinOnlineRoom) {
                  onJoinOnlineRoom(inputCode.trim().toUpperCase());
                }
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                maxLength={8}
                placeholder={language === 'vi' ? 'NHẬP MÃ 6 KÝ TỰ...' : 'ENTER 6-CHAR CODE...'}
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                className="pixel-input flex-1 px-3.5 py-2 text-xs font-mono font-bold tracking-wider uppercase"
              />
              <button
                type="submit"
                disabled={isJoiningOnline || inputCode.trim().length < 4}
                className="pixel-btn bg-zinc-900 px-4 py-2 font-pixel text-xs font-bold uppercase text-white hover:bg-zinc-800 disabled:opacity-40"
              >
                {language === 'vi' ? 'Vào phòng' : 'Join'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Accordion Hướng dẫn luật chơi Cờ Tướng */}
      <div className="mt-5 pixel-box-sm bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRules(!showRules)}
          className="w-full flex items-center justify-between p-3.5 hover:bg-amber-50 text-left transition-colors"
        >
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-amber-600" />
            <span className="font-pixel text-xs font-bold uppercase text-zinc-900">
              {language === 'vi' ? 'Quy tắc di chuyển quân Cờ Tướng tóm tắt' : 'Quick Xiangqi Rules Summary'}
            </span>
          </div>
          {showRules ? (
            <ChevronUp className="h-4 w-4 text-zinc-700" />
          ) : (
            <ChevronDown className="h-4 w-4 text-zinc-700" />
          )}
        </button>

        {showRules && (
          <div className="border-t-2 border-zinc-900 p-4 bg-amber-50/50 text-xs text-zinc-700 space-y-2 leading-relaxed">
            <p>• <strong>Xe (俥 / 車):</strong> Đi ngang dọc tự do không hạn chế số ô nếu không có quân cản.</p>
            <p>• <strong>Pháo (炮 / 砲):</strong> Đi như Xe khi không ăn. Khi ăn bắt buộc <em>nhảy qua đúng 1 quân làm ngòi</em>.</p>
            <p>• <strong>Mã (傌 / 馬):</strong> Đi hình chữ nhật (1 thẳng 1 chéo). Có luật <em>cản chân Mã</em> (ô trước hướng đi bị chắn thì không nhảy được).</p>
            <p>• <strong>Tượng (相 / 象):</strong> Đi chéo 2 ô, có luật <em>cản mắt Tượng</em> và <em>tuyệt đối không được qua sông</em>.</p>
            <p>• <strong>Sĩ (仕 / 士) & Tướng (帥 / 將):</strong> Chỉ đi trong Cung (3x3). Cấm luật <em>Lộ mặt Tướng</em> (hai tướng nhìn thẳng mặt nhau không có quân chắn).</p>
            <p>• <strong>Binh / Tốt (兵 / 卒):</strong> Chưa qua sông chỉ đi thẳng 1 ô. Qua sông được đi thẳng hoặc ngang 1 ô. Không được đi lùi.</p>
          </div>
        )}
      </div>
    </div>
  );
}
