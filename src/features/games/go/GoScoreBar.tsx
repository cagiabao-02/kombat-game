'use client';

import React from 'react';
import { GoColor, Point } from './types';
import { useLanguage } from '@/i18n/LanguageContext';
import { sounds } from '@/lib/sound/soundService';
import { Volume2, VolumeX, RotateCcw, Flag, SkipForward, Check, X, Copy } from 'lucide-react';

interface GoScoreBarProps {
  currentTurn: GoColor;
  captures: { black: number; white: number };
  consecutivePasses: number;
  isAiThinking: boolean;
  selectedPoint: Point | null;
  onConfirmSelectedPoint: () => void;
  onCancelSelectedPoint: () => void;
  onPass: () => void;
  onResign: () => void;
  onReset: () => void;
  disabled?: boolean;
  blackPlayerName?: string;
  whitePlayerName?: string;
  isOnline?: boolean;
  roomCode?: string;
  onCopyRoomLink?: () => void;
  copiedLink?: boolean;
}

export const GoScoreBar: React.FC<GoScoreBarProps> = ({
  currentTurn,
  captures,
  consecutivePasses,
  isAiThinking,
  selectedPoint,
  onConfirmSelectedPoint,
  onCancelSelectedPoint,
  onPass,
  onResign,
  onReset,
  disabled = false,
  blackPlayerName,
  whitePlayerName,
  isOnline = false,
  roomCode,
  onCopyRoomLink,
  copiedLink = false,
}) => {
  const { language } = useLanguage();
  const [muted, setMuted] = React.useState(sounds.isSfxMuted());

  React.useEffect(() => {
    setMuted(sounds.isSfxMuted());
    const handleVolume = (e: Event) => {
      const custom = e as CustomEvent<{ sfxMuted: boolean }>;
      if (custom.detail !== undefined) {
        setMuted(custom.detail.sfxMuted);
      }
    };
    window.addEventListener('kombat:volume_change', handleVolume);
    return () => window.removeEventListener('kombat:volume_change', handleVolume);
  }, []);

  return (
    <div className="w-full max-w-[540px] flex flex-col gap-2.5 mx-auto select-none">
      {/* Online Room Code Bar nếu đang đấu online */}
      {isOnline && roomCode && (
        <div className="flex items-center justify-between bg-zinc-900 text-amber-300 px-3 py-1.5 border-2 border-zinc-950 font-pixel text-xs shadow-[2px_2px_0px_#000]">
          <div className="flex items-center gap-2">
            <span className="text-zinc-400 uppercase font-mono text-[10px]">
              {language === 'vi' ? 'PHÒNG:' : 'ROOM:'}
            </span>
            <span className="font-bold tracking-widest text-amber-300">{roomCode}</span>
          </div>

          {onCopyRoomLink && (
            <button
              type="button"
              onClick={onCopyRoomLink}
              className="inline-flex items-center gap-1 bg-amber-400 hover:bg-amber-300 text-zinc-950 px-2 py-0.5 text-[10px] font-bold rounded"
            >
              {copiedLink ? <Check className="w-3 h-3 text-emerald-800" /> : <Copy className="w-3 h-3" />}
              <span>{copiedLink ? (language === 'vi' ? 'ĐÃ CHÉP LINK' : 'COPIED') : (language === 'vi' ? 'CHÉP LINK' : 'COPY LINK')}</span>
            </button>
          )}
        </div>
      )}

      {/* Hàng 1: Thẻ thông tin 2 bên & Tù binh */}
      <div className="grid grid-cols-2 gap-2">
        {/* Quân Đen */}
        <div
          className={`pixel-box p-2 sm:p-2.5 flex items-center justify-between transition-all ${
            currentTurn === 'black'
              ? 'bg-zinc-900 text-white ring-2 ring-amber-400 shadow-[2px_2px_0px_#000]'
              : 'bg-zinc-100 text-zinc-800 border border-zinc-300 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-5 h-5 rounded-full bg-black border border-zinc-600 shadow-sm shrink-0 inline-block" />
            <div className="flex flex-col min-w-0">
              <span className="font-pixel text-xs font-bold leading-none truncate">
                {blackPlayerName || (language === 'vi' ? 'QUÂN ĐEN' : 'BLACK')}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {currentTurn === 'black'
                  ? isAiThinking
                    ? language === 'vi' ? 'Đang tính...' : 'Thinking...'
                    : language === 'vi' ? 'Lượt đi' : 'Your turn'
                  : language === 'vi' ? 'Chờ' : 'Wait'}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-pixel text-zinc-400 block leading-none">
              {language === 'vi' ? 'BẮT ĐƯỢC' : 'CAPTURES'}
            </span>
            <span className="font-pixel text-sm font-bold text-amber-300">{captures.black}</span>
          </div>
        </div>

        {/* Quân Trắng */}
        <div
          className={`pixel-box p-2 sm:p-2.5 flex items-center justify-between transition-all ${
            currentTurn === 'white'
              ? 'bg-zinc-900 text-white ring-2 ring-amber-400 shadow-[2px_2px_0px_#000]'
              : 'bg-zinc-100 text-zinc-800 border border-zinc-300 opacity-80'
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="w-5 h-5 rounded-full bg-white border border-zinc-400 shadow-sm shrink-0 inline-block" />
            <div className="flex flex-col min-w-0">
              <span className="font-pixel text-xs font-bold leading-none truncate">
                {whitePlayerName || (language === 'vi' ? 'QUÂN TRẮNG' : 'WHITE')}
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                {currentTurn === 'white'
                  ? isAiThinking
                    ? language === 'vi' ? 'Đang tính...' : 'Thinking...'
                    : language === 'vi' ? 'Lượt đi' : 'Your turn'
                  : language === 'vi' ? 'Chờ' : 'Wait'}
              </span>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="text-[10px] uppercase font-pixel text-zinc-400 block leading-none">
              {language === 'vi' ? 'BẮT ĐƯỢC' : 'CAPTURES'}
            </span>
            <span className="font-pixel text-sm font-bold text-amber-300">{captures.white}</span>
          </div>
        </div>
      </div>

      {/* Cảnh báo khi có 1 lượt Bỏ lượt liên tiếp */}
      {consecutivePasses === 1 && (
        <div className="bg-amber-100 border border-amber-400 text-amber-900 text-xs px-3 py-1 font-mono text-center animate-pulse rounded">
          {language === 'vi'
            ? '⚠️ Đối thủ vừa Bỏ lượt. Nếu bạn cũng Bỏ lượt, ván cờ sẽ kết thúc để tính điểm!'
            : '⚠️ Opponent passed. If you also pass, the game ends to calculate score!'}
        </div>
      )}

      {/* Hàng 2: Thanh công cụ thao tác */}
      <div className="flex items-center justify-between gap-1.5 sm:gap-2">
        {selectedPoint ? (
          /* Khối nút xác nhận nước đi đang chọn */
          <div className="flex-1 flex items-center gap-2 bg-emerald-50 border-2 border-emerald-600 px-3 py-1.5 shadow-[2px_2px_0px_#000]">
            <span className="text-xs font-pixel font-bold text-emerald-950 flex-1 truncate">
              {language === 'vi'
                ? `ĐẶT TẠI [${selectedPoint.row + 1},${selectedPoint.col + 1}]?`
                : `PLAY AT [${selectedPoint.row + 1},${selectedPoint.col + 1}]?`}
            </span>
            <button
              type="button"
              onClick={onConfirmSelectedPoint}
              disabled={disabled}
              className="pixel-btn bg-emerald-500 hover:bg-emerald-400 text-white px-3 py-1 text-xs font-pixel flex items-center gap-1 shrink-0"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'ĐẶT' : 'PLAY'}</span>
            </button>
            <button
              type="button"
              onClick={onCancelSelectedPoint}
              className="pixel-btn bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-2 py-1 text-xs font-pixel shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          /* Cụm nút Bỏ lượt & Xin thua */
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={onPass}
              disabled={disabled || isAiThinking}
              className="pixel-btn bg-amber-400 hover:bg-amber-300 text-zinc-950 px-3 py-2 text-xs font-pixel flex items-center gap-1.5 font-bold disabled:opacity-50"
              title={language === 'vi' ? 'Bỏ lượt không đặt quân' : 'Pass turn'}
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'BỎ LƯỢT' : 'PASS'}</span>
            </button>

            <button
              type="button"
              onClick={onResign}
              disabled={disabled || isAiThinking}
              className="pixel-btn bg-rose-100 hover:bg-rose-200 text-rose-900 border-rose-400 px-2.5 py-2 text-xs font-pixel flex items-center gap-1 disabled:opacity-50"
              title={language === 'vi' ? 'Chấp nhận đầu hàng' : 'Resign game'}
            >
              <Flag className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'vi' ? 'XIN THUA' : 'RESIGN'}
              </span>
            </button>
          </div>
        )}

        {/* Nút tiện ích: Chơi lại & Loa */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!isOnline && (
            <button
              type="button"
              onClick={onReset}
              className="pixel-btn bg-zinc-100 hover:bg-zinc-200 text-zinc-800 p-2 text-xs"
              title={language === 'vi' ? 'Chơi lại ván mới' : 'Restart game'}
              aria-label="Chơi lại"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              const next = sounds.toggleSfxMute();
              setMuted(next);
            }}
            className="pixel-btn bg-zinc-100 hover:bg-zinc-200 text-zinc-800 p-2 text-xs"
            title={
              muted
                ? language === 'vi' ? 'Bật âm thanh' : 'Unmute'
                : language === 'vi' ? 'Tắt âm thanh' : 'Mute'
            }
            aria-label="Âm thanh"
          >
            {muted ? <VolumeX className="w-4 h-4 text-zinc-500" /> : <Volume2 className="w-4 h-4 text-emerald-700" />}
          </button>
        </div>
      </div>
    </div>
  );
};
