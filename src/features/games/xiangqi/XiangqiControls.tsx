'use client';

import React, { useState } from 'react';
import { Side, Move, Piece, PIECE_INFO } from './xiangqiLogic';
import { RotateCw, Flag, RotateCcw, Home, AlertCircle, ShieldAlert, Languages } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';

interface XiangqiControlsProps {
  turn: Side;
  isCheck: boolean;
  isGameOver: boolean;
  winner: Side | null;
  moveCount: number;
  moveHistory: Move[];
  flipped: boolean;
  showSubLabel: boolean;
  playerRedName?: string;
  playerBlackName?: string;
  gameMode?: 'local' | 'bot' | 'online';
  isBotThinking?: boolean;
  onFlip: () => void;
  onToggleSubLabel: () => void;
  onRestart: () => void;
  onResign: () => void;
  onLeave: () => void;
}

export function XiangqiControls({
  turn,
  isCheck,
  isGameOver,
  winner,
  moveCount,
  moveHistory,
  flipped,
  showSubLabel,
  playerRedName = 'Bên Đỏ',
  playerBlackName = 'Bên Đen',
  gameMode = 'local',
  isBotThinking = false,
  onFlip,
  onToggleSubLabel,
  onRestart,
  onResign,
  onLeave,
}: XiangqiControlsProps) {
  const { language } = useLanguage();
  const [confirmDialog, setConfirmDialog] = useState<'restart' | 'resign' | 'leave' | null>(null);

  // Thống kê các quân đã bị ăn của mỗi bên
  const capturedRedPieces: Piece[] = [];
  const capturedBlackPieces: Piece[] = [];

  moveHistory.forEach((m) => {
    if (m.captured) {
      if (m.captured.side === 'red') {
        capturedRedPieces.push(m.captured);
      } else {
        capturedBlackPieces.push(m.captured);
      }
    }
  });

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col gap-3 select-none">
      {/* Cảnh báo Chiếu Tướng (Check Banner) */}
      {isCheck && !isGameOver && (
        <div className="flex items-center justify-center gap-2 border-2 border-zinc-900 bg-rose-500 p-2.5 text-white shadow-pixel-sm animate-bounce">
          <ShieldAlert className="h-5 w-5 text-white shrink-0" />
          <span className="font-pixel text-xs sm:text-sm font-bold tracking-wider uppercase">
            {language === 'vi'
              ? `CHIẾU TƯỚNG! (${turn === 'red' ? playerRedName : playerBlackName} ĐANG BỊ CHIẾU)`
              : `CHECK! (${turn === 'red' ? 'RED' : 'BLACK'} IS UNDER ATTACK)`}
          </span>
        </div>
      )}

      {/* Thông tin lượt đi & Quân cờ đang thi đấu */}
      <div className="flex items-center justify-between pixel-box-sm bg-white p-3 sm:p-4">
        <div className="flex items-center gap-3">
          {/* Huy hiệu quân cờ lượt hiện tại */}
          <div
            className={`flex h-11 w-11 items-center justify-center border-2 border-zinc-900 font-black text-xl shadow-pixel-xs ${
              turn === 'red'
                ? 'bg-rose-100 text-rose-700'
                : 'bg-zinc-900 text-white'
            }`}
          >
            {turn === 'red' ? '帥' : '將'}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-pixel text-sm font-bold uppercase text-zinc-900">
                {isGameOver
                  ? language === 'vi'
                    ? 'Ván đấu kết thúc'
                    : 'Game Over'
                  : turn === 'red'
                  ? `${playerRedName} (Đỏ)`
                  : `${playerBlackName} (Đen)`}
              </span>
              <span
                className={`inline-flex items-center border border-zinc-900 px-2 py-0.5 font-pixel text-[10px] font-bold uppercase tracking-wider ${
                  turn === 'red'
                    ? 'bg-rose-200 text-rose-900'
                    : 'bg-zinc-200 text-zinc-900'
                }`}
              >
                {isBotThinking
                  ? (language === 'vi' ? 'Đang nghĩ...' : 'Thinking...')
                  : turn === 'red'
                  ? (language === 'vi' ? 'Đi trước' : 'Red')
                  : (language === 'vi' ? 'Đi sau' : 'Black')}
              </span>
            </div>
            <p className="text-xs text-zinc-600 font-bold mt-0.5">
              {isGameOver
                ? winner
                  ? language === 'vi'
                    ? `Bên ${winner === 'red' ? 'Đỏ (帥)' : 'Đen (將)'} giành chiến thắng!`
                    : `${winner === 'red' ? 'Red' : 'Black'} won the match!`
                  : language === 'vi'
                  ? 'Ván cờ hòa'
                  : 'Draw game'
                : isBotThinking
                ? language === 'vi'
                  ? 'Trí tuệ nhân tạo đang phân tích thế cờ...'
                  : 'Bot AI is analyzing the position...'
                : language === 'vi'
                ? `Nước thứ #${moveCount + 1}`
                : `Move #${moveCount + 1}`}
            </p>
          </div>
        </div>

        {/* Nút thao tác nhanh trên header */}
        <div className="flex items-center gap-1.5">
          {/* Nút Xoay bàn cờ */}
          <button
            type="button"
            onClick={onFlip}
            className={`pixel-btn flex h-9 w-9 items-center justify-center ${
              flipped ? 'bg-indigo-600 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
            title={language === 'vi' ? 'Xoay bàn cờ 180°' : 'Flip board 180°'}
          >
            <RotateCw className="h-4 w-4" />
          </button>

          {/* Nút Bật/Tắt nhãn phụ tiếng Việt */}
          <button
            type="button"
            onClick={onToggleSubLabel}
            className={`pixel-btn flex h-9 w-9 items-center justify-center ${
              showSubLabel ? 'bg-amber-300 text-zinc-900' : 'bg-white text-zinc-700 hover:bg-zinc-100'
            }`}
            title={
              language === 'vi'
                ? showSubLabel
                  ? 'Đang bật nhãn phiên âm tiếng Việt'
                  : 'Đang tắt nhãn phiên âm (chỉ hiện chữ Hán)'
                : 'Toggle phonetic sub-labels'
            }
          >
            <Languages className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Khay hiển thị quân cờ đã ăn (Captured pieces tray) */}
      {(capturedRedPieces.length > 0 || capturedBlackPieces.length > 0) && (
        <div className="flex items-center justify-between pixel-box-sm bg-amber-50 px-3 py-2 text-xs">
          {/* Quân Đỏ bị ăn */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[48%] py-0.5">
            <span className="font-pixel text-[10px] font-bold uppercase text-rose-800 shrink-0 mr-1">
              {language === 'vi' ? 'Đỏ mất:' : 'Lost:'}
            </span>
            {capturedRedPieces.map((p, idx) => (
              <span
                key={`cap-red-${idx}`}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border-2 border-rose-700 text-rose-700 text-[10px] font-black"
                title={PIECE_INFO[p.type].red.nameVi}
              >
                {PIECE_INFO[p.type].red.hanzi}
              </span>
            ))}
          </div>

          <div className="h-4 w-0.5 bg-zinc-900" />

          {/* Quân Đen bị ăn */}
          <div className="flex items-center gap-1 overflow-x-auto max-w-[48%] justify-end py-0.5">
            <span className="font-pixel text-[10px] font-bold uppercase text-zinc-800 shrink-0 mr-1">
              {language === 'vi' ? 'Đen mất:' : 'Lost:'}
            </span>
            {capturedBlackPieces.map((p, idx) => (
              <span
                key={`cap-black-${idx}`}
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white border-2 border-zinc-900 text-zinc-900 text-[10px] font-black"
                title={PIECE_INFO[p.type].black.nameVi}
              >
                {PIECE_INFO[p.type].black.hanzi}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Nhóm nút điều khiển ván cờ */}
      <div className="flex items-center gap-2">
        {/* Nút Về sảnh */}
        <button
          type="button"
          onClick={() => {
            if (!isGameOver && moveCount > 0) {
              setConfirmDialog('leave');
            } else {
              onLeave();
            }
          }}
          className="pixel-btn flex-1 flex items-center justify-center gap-1.5 bg-white py-2.5 font-pixel text-xs font-bold uppercase tracking-wider text-zinc-800 hover:bg-zinc-100"
        >
          <Home className="h-4 w-4 text-zinc-600" />
          <span>{language === 'vi' ? 'Về sảnh' : 'Lobby'}</span>
        </button>

        {/* Nút Xin thua (Resign) */}
        {!isGameOver && (
          <button
            type="button"
            onClick={() => setConfirmDialog('resign')}
            className="pixel-btn flex-1 flex items-center justify-center gap-1.5 bg-rose-100 py-2.5 font-pixel text-xs font-bold uppercase tracking-wider text-rose-800 hover:bg-rose-200"
          >
            <Flag className="h-4 w-4 text-rose-700" />
            <span>{language === 'vi' ? 'Xin thua' : 'Resign'}</span>
          </button>
        )}

        {/* Nút Chơi ván mới (Restart / Rematch) */}
        <button
          type="button"
          onClick={() => {
            if (!isGameOver && moveCount > 0) {
              setConfirmDialog('restart');
            } else {
              onRestart();
            }
          }}
          className={`pixel-btn flex-1 flex items-center justify-center gap-1.5 py-2.5 font-pixel text-xs font-bold uppercase tracking-wider ${
            isGameOver
              ? 'bg-indigo-600 text-white hover:bg-indigo-500'
              : 'bg-white text-zinc-800 hover:bg-zinc-100'
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          <span>{isGameOver ? (language === 'vi' ? 'Chơi lại' : 'Rematch') : (language === 'vi' ? 'Làm mới' : 'Reset')}</span>
        </button>
      </div>

      {/* Hộp thoại xác nhận thao tác (Custom in-game popover) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
          <div className="w-full max-w-xs pixel-box-lg bg-white p-5 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center border-2 border-zinc-900 bg-amber-300 text-zinc-900 shadow-pixel-sm">
              <AlertCircle className="h-6 w-6" />
            </div>

            <h3 className="font-pixel text-base font-bold uppercase text-zinc-900 mb-1">
              {confirmDialog === 'resign'
                ? language === 'vi' ? 'Xác nhận xin thua?' : 'Confirm Resignation?'
                : confirmDialog === 'restart'
                ? language === 'vi' ? 'Bắt đầu ván mới?' : 'Restart New Match?'
                : language === 'vi' ? 'Rời bàn cờ về sảnh?' : 'Leave Game to Lobby?'}
            </h3>

            <p className="text-xs font-medium text-zinc-600 mb-5 leading-relaxed">
              {confirmDialog === 'resign'
                ? language === 'vi'
                  ? 'Bạn có chắc chắn muốn đầu hàng và nhường chiến thắng cho đối thủ?'
                  : 'Are you sure you want to resign and award victory to the opponent?'
                : confirmDialog === 'restart'
                ? language === 'vi'
                  ? 'Ván cờ hiện tại sẽ được khởi động lại từ đầu.'
                  : 'The current board will be reset to initial state.'
                : language === 'vi'
                ? 'Tiến độ ván cờ hiện tại sẽ kết thúc nếu bạn thoát ra sảnh.'
                : 'Current game progress will end if you leave.'}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmDialog(null)}
                className="pixel-btn flex-1 bg-zinc-100 py-2.5 font-pixel text-xs font-bold uppercase text-zinc-800 hover:bg-zinc-200"
              >
                {language === 'vi' ? 'Hủy' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const action = confirmDialog;
                  setConfirmDialog(null);
                  if (action === 'resign') onResign();
                  else if (action === 'restart') onRestart();
                  else if (action === 'leave') onLeave();
                }}
                className={`pixel-btn flex-1 py-2.5 font-pixel text-xs font-bold uppercase text-white ${
                  confirmDialog === 'resign'
                    ? 'bg-rose-600 hover:bg-rose-500'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                }`}
              >
                {language === 'vi' ? 'Xác nhận' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
