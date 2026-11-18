'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, RotateCcw, Home, Sparkles } from 'lucide-react';

interface BlockBlastGameOverModalProps {
  isOpen: boolean;
  score: number;
  highScore: number;
  isNewHighScore: boolean;
  linesCleared: number;
  maxCombo: number;
  onRestart: () => void;
}

export const BlockBlastGameOverModal: React.FC<BlockBlastGameOverModalProps> = ({
  isOpen,
  score,
  highScore,
  isNewHighScore,
  linesCleared,
  maxCombo,
  onRestart,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-sm bg-amber-50 border-4 border-black shadow-[8px_8px_0px_#000] p-6 text-center rounded-lg space-y-4">
        {/* Tiêu đề Game Over */}
        <div className="space-y-1">
          <div className="inline-flex p-3 bg-rose-500 text-white border-2 border-black shadow-[3px_3px_0px_#000] rounded-full mb-1">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="font-pixel text-2xl font-bold text-zinc-900 tracking-wide">
            HẾT NƯỚC ĐI!
          </h2>
          <p className="text-xs font-mono text-zinc-600 font-semibold">
            Không còn ô trống vừa với các khối còn lại
          </p>
        </div>

        {/* Điểm số & Kỷ lục */}
        <div className="space-y-2 bg-white border-2 border-black p-3 rounded">
          {isNewHighScore && (
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-400 text-zinc-950 font-pixel text-xs font-bold border border-black shadow-[2px_2px_0px_#000] animate-bounce mb-1">
              <Sparkles className="w-3.5 h-3.5 text-zinc-950 fill-zinc-950" />
              <span>KỶ LỤC MỚI!</span>
            </div>
          )}

          <div>
            <span className="text-[11px] font-mono uppercase text-zinc-500 font-bold block">
              Điểm đạt được
            </span>
            <span className="font-pixel text-3xl font-bold text-indigo-600">
              {score.toLocaleString()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200 text-center font-mono text-xs">
            <div>
              <span className="text-zinc-500 block text-[10px]">Kỷ lục</span>
              <span className="font-bold text-emerald-600">{highScore.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Hàng nổ</span>
              <span className="font-bold text-zinc-800">{linesCleared}</span>
            </div>
            <div>
              <span className="text-zinc-500 block text-[10px]">Combo Max</span>
              <span className="font-bold text-amber-600">x{maxCombo}</span>
            </div>
          </div>
        </div>

        {/* Nút hành động */}
        <div className="flex flex-col gap-2 pt-2">
          <button
            onClick={onRestart}
            className="w-full flex items-center justify-center gap-2 py-3 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-pixel text-sm font-bold border-2 border-black shadow-[4px_4px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] transition-all rounded"
          >
            <RotateCcw className="w-4 h-4" />
            <span>CHƠI LẠI NGAY</span>
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-white hover:bg-zinc-100 text-zinc-900 font-mono text-xs font-bold border-2 border-black shadow-[3px_3px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all rounded"
          >
            <Home className="w-4 h-4" />
            <span>VỀ SẢNH TRÒ CHƠI</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
