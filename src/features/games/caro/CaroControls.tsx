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
  isHost = true,
}: CaroControlsProps) {
  const [isMuted, setIsMuted] = useState(soundService.isMuted());
  const [confirmDialog, setConfirmDialog] = useState<'reset' | 'resign' | 'leave' | null>(null);

  const toggleSound = () => {
    const nextMuted = soundService.toggleMute();
    setIsMuted(nextMuted);
  };

  const getTurnText = () => {
    if (isGameOver) return 'Ván đấu kết thúc';

    if (gameMode === 'local') {
      return currentTurn === 'X'
        ? `Lượt của ${hostName} (✕)`
        : `Lượt của ${guestName} (◯)`;
    }

    if (gameMode === 'bot') {
      if (isMyTurn) {
        return 'Lượt của bạn (Hãy đi một nước)';
      }
      return 'Bot đang tính nước cờ...';
    }

    // Online PvP
    if (isMyTurn) {
      return 'Lượt của bạn (Đến lượt đi)';
    }
    return 'Lượt của đối thủ...';
  };

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-3">
      {/* Turn & Status Card */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-gray-200/90 shadow-xs p-3 sm:p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 items-center justify-center rounded-xl font-black text-xl shadow-inner transition-transform ${
              currentTurn === 'X'
                ? 'bg-rose-50 text-rose-600 border border-rose-200 ring-2 ring-rose-400/30'
                : 'bg-indigo-50 text-indigo-600 border border-indigo-200 ring-2 ring-indigo-400/30'
            }`}
          >
            {currentTurn === 'X' ? '✕' : '◯'}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Lượt thứ {moveCount + 1}
              </span>
              {myPiece && (
                <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] font-bold text-gray-600">
                  Bạn: {myPiece === 'X' ? '✕' : '◯'}
                </span>
              )}
            </div>
            <span
              className={`text-sm sm:text-base font-bold ${
                isGameOver
                  ? 'text-gray-500'
                  : isMyTurn
                  ? 'text-gray-900 animate-pulse'
                  : 'text-gray-600'
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
          className="flex h-10 w-10 items-center justify-center rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          aria-label={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
        >
          {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      {/* Control Action Buttons */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setConfirmDialog('leave')}
          className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-all shadow-2xs"
        >
          <Home className="h-4 w-4 text-gray-500" />
          <span>Về sảnh</span>
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
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 active:scale-95 transition-all shadow-2xs"
          >
            <RotateCcw className="h-4 w-4 text-indigo-500" />
            <span>Chơi lại</span>
          </button>
        )}

        {!isGameOver && (
          <button
            type="button"
            onClick={() => setConfirmDialog('resign')}
            className="flex-1 flex items-center justify-center gap-1.5 min-h-[44px] px-3 py-2 rounded-xl text-xs sm:text-sm font-bold text-rose-700 bg-rose-50 border border-rose-200/80 hover:bg-rose-100 active:scale-95 transition-all shadow-2xs"
          >
            <Flag className="h-4 w-4 text-rose-500" />
            <span>Xin thua</span>
          </button>
        )}
      </div>

      {/* In-Game Confirmation Popover Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 mb-3 text-amber-600">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-base font-black text-gray-900">
                {confirmDialog === 'leave' && 'Rời khỏi ván cờ?'}
                {confirmDialog === 'resign' && 'Xác nhận xin thua?'}
                {confirmDialog === 'reset' && 'Bắt đầu lại ván cờ?'}
              </h3>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              {confirmDialog === 'leave' &&
                'Bạn có chắc muốn thoát về sảnh chính? Tiến trình ván cờ hiện tại sẽ kết thúc.'}
              {confirmDialog === 'resign' &&
                'Bạn có chắc chắn muốn chịu thua ván đấu này không?'}
              {confirmDialog === 'reset' &&
                'Ván cờ hiện tại sẽ được khởi tạo lại từ đầu với bàn cờ trống.'}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="flex-1 min-h-[44px] rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
              >
                Tiếp tục chơi
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
                className={`flex-1 min-h-[44px] rounded-xl px-4 py-2 text-sm font-bold text-white active:scale-95 transition-all ${
                  confirmDialog === 'resign'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-200'
                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200'
                }`}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

