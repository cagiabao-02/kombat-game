'use client';

import React, { useState } from 'react';
import { CaroPiece, CaroGameMode } from './types';
import { RotateCcw, Flag, Home, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import { soundService } from '@/lib/sound/soundService';

interface CaroControlsProps {
  currentTurn: CaroPiece;
  myPiece?: CaroPiece;
  isMyTurn: boolean;
  gameMode: CaroGameMode;
  moveCount: number;
  isGameOver: boolean;
  onReset: () => void;
  onResign: () => void;
  onLeave: () => void;
  hostName?: string;
  guestName?: string;
  isHost?: boolean;
}

export function CaroControls({
  currentTurn,
  myPiece,
  isMyTurn,
  gameMode,
  moveCount,
  isGameOver,
  onReset,
  onResign,
  onLeave,
  hostName = 'Người chơi 1',
  guestName = 'Người chơi 2',
}: CaroControlsProps) {
  const [isMuted, setIsMuted] = useState(soundService.isMuted());
  const [confirmDialog, setConfirmDialog] = useState<'reset' | 'resign' | 'leave' | null>(null);

  const toggleSound = () => {
    const nextMuted = soundService.toggleMute();
    setIsMuted(nextMuted);
  };

  const getTurnText = () => {
    if (isGameOver) return 'VÁN ĐẤU KẾT THÚC';

    if (gameMode === 'local') {
      return currentTurn === 'X'
        ? `LƯỢT CỦA ${hostName} [X]`
        : `LƯỢT CỦA ${guestName} [O]`;
    }

    if (gameMode === 'bot') {
      if (isMyTurn) {
        return 'LƯỢT CỦA BẠN (HÃY ĐI NƯỚC CỜ)';
      }
      return 'BOT AI ĐANG TÍNH TOÁN...';
    }

    // Online PvP
    if (isMyTurn) {
      return 'LƯỢT CỦA BẠN (ĐẾN LƯỢT ĐI)';
    }
    return 'CHỜ NƯỚC ĐI ĐỐI THỦ...';
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
      {/* Turn & Status Arcade LCD Card */}
      <div className="pixel-box flex items-center justify-between bg-[#FFFDF8] p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center font-pixel font-bold text-xl border-2 border-zinc-900 shadow-pixel-xs ${
              currentTurn === 'X'
                ? 'bg-rose-100 text-rose-600'
                : 'bg-indigo-100 text-indigo-700'
            }`}
          >
            {currentTurn === 'X' ? 'X' : 'O'}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-500">
                MOVE #{String(moveCount + 1).padStart(2, '0')}
              </span>
              {myPiece && (
                <span className="bg-zinc-900 px-1.5 py-0.5 font-pixel text-[10px] font-bold text-amber-300">
                  BẠN: {myPiece}
                </span>
              )}
            </div>
            <span
              className={`font-pixel text-sm sm:text-base font-bold ${
                isGameOver
                  ? 'text-zinc-500'
                  : isMyTurn
                  ? 'text-zinc-950 animate-pulse'
                  : 'text-zinc-600'
              }`}
            >
              {getTurnText()}
            </span>
          </div>
        </div>

        {/* Sound toggle button */}
        <button
          type="button"
          onClick={toggleSound}
          className="pixel-btn flex h-10 w-10 items-center justify-center bg-white text-zinc-800 hover:bg-amber-100"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="h-5 w-5 text-zinc-400" /> : <Volume2 className="h-5 w-5 text-indigo-700" />}
        </button>
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center justify-between gap-2.5">
        <button
          type="button"
          onClick={() => setConfirmDialog('leave')}
          className="pixel-btn flex-1 flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 text-xs sm:text-sm font-bold text-zinc-900 bg-white hover:bg-zinc-100"
        >
          <Home className="h-4 w-4 text-zinc-700" />
          <span>VỀ SẢNH</span>
        </button>

        {gameMode !== 'pvp' && (
          <button
            type="button"
            onClick={() => {
              if (moveCount > 0 && !isGameOver) {
                setConfirmDialog('reset');
              } else {
                onReset();
              }
            }}
            className="pixel-btn flex-1 flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 text-xs sm:text-sm font-bold text-zinc-900 bg-amber-200 hover:bg-amber-300"
          >
            <RotateCcw className="h-4 w-4 text-zinc-900" />
            <span>CHƠI LẠI</span>
          </button>
        )}

        {!isGameOver && (
          <button
            type="button"
            onClick={() => setConfirmDialog('resign')}
            className="pixel-btn flex-1 flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 text-xs sm:text-sm font-bold text-rose-900 bg-rose-200 hover:bg-rose-300"
          >
            <Flag className="h-4 w-4 text-rose-700" />
            <span>XIN THUA</span>
          </button>
        )}
      </div>

      {/* In-Game Confirmation Popover Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-in fade-in duration-150">
          <div className="pixel-box-lg w-full max-w-sm bg-[#FFFDF8] p-6 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3 text-amber-800">
              <div className="flex h-10 w-10 items-center justify-center bg-amber-300 border-2 border-zinc-900 text-zinc-900">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="font-pixel text-base font-bold text-zinc-950 uppercase">
                {confirmDialog === 'leave' && 'RỜI KHỎI VÁN CỜ?'}
                {confirmDialog === 'resign' && 'XÁC NHẬN XIN THUA?'}
                {confirmDialog === 'reset' && 'KHỞI TẠO VÁN MỚI?'}
              </h3>
            </div>

            <p className="text-xs sm:text-sm font-mono text-zinc-700 mb-6 leading-relaxed">
              {confirmDialog === 'leave' &&
                'Bạn có chắc muốn thoát về sảnh chính? Tiến trình ván cờ hiện tại sẽ kết thúc.'}
              {confirmDialog === 'resign' &&
                'Bạn có chắc chắn muốn nhận thua ván đấu này không?'}
              {confirmDialog === 'reset' &&
                'Ván cờ hiện tại sẽ được làm mới lại từ đầu với bàn cờ trống.'}
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="pixel-btn flex-1 min-h-[44px] bg-white px-4 py-2 text-xs sm:text-sm font-bold text-zinc-900 hover:bg-zinc-100"
              >
                TIẾP TỤC
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmDialog;
                  setConfirmDialog(null);
                  if (action === 'leave') onLeave();
                  if (action === 'resign') onResign();
                  if (action === 'reset') onReset();
                }}
                className={`pixel-btn flex-1 min-h-[44px] px-4 py-2 text-xs sm:text-sm font-bold ${
                  confirmDialog === 'resign'
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-amber-300'
                }`}
              >
                XÁC NHẬN
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
