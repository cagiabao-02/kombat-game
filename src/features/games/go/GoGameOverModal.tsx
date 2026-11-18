'use client';

import React from 'react';
import { GoColor, TerritoryScore } from './types';
import { useLanguage } from '@/i18n/LanguageContext';
import { Trophy, RotateCcw, ArrowLeft } from 'lucide-react';

interface GoGameOverModalProps {
  isOpen: boolean;
  winner: GoColor | null;
  resignedBy?: GoColor | null;
  score: TerritoryScore | null;
  onPlayAgain: () => void;
  onBackToLobby: () => void;
}

export const GoGameOverModal: React.FC<GoGameOverModalProps> = ({
  isOpen,
  winner,
  resignedBy,
  score,
  onPlayAgain,
  onBackToLobby,
}) => {
  const { language } = useLanguage();
  if (!isOpen) return null;

  const isResignation = !!resignedBy;
  const isBlackWinner = winner === 'black';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="pixel-box w-full max-w-md bg-[#FFFDF8] border-4 border-zinc-950 p-5 shadow-[8px_8px_0px_#000] space-y-4">
        {/* Tiêu đề & Cúp vinh danh */}
        <div className="text-center space-y-1 border-b-2 border-zinc-900 pb-3">
          <div className="inline-flex p-3 bg-amber-300 border-2 border-black shadow-[2px_2px_0px_#000] rounded-full mb-1">
            <Trophy className="w-8 h-8 text-zinc-950" />
          </div>
          <h2 className="font-pixel text-xl sm:text-2xl font-bold uppercase text-zinc-950">
            {isBlackWinner
              ? language === 'vi' ? 'QUÂN ĐEN CHIẾN THẮNG!' : 'BLACK WINS!'
              : language === 'vi' ? 'QUÂN TRẮNG CHIẾN THẮNG!' : 'WHITE WINS!'}
          </h2>
          <p className="text-xs font-mono text-zinc-600">
            {isResignation
              ? language === 'vi'
                ? `Đối phương (${resignedBy === 'black' ? 'Đen' : 'Trắng'}) đã xin thua.`
                : `Opponent (${resignedBy === 'black' ? 'Black' : 'White'}) resigned.`
              : score
              ? language === 'vi'
                ? `Thắng cách biệt ${score.margin} điểm theo luật tính đất chuẩn!`
                : `Won by ${score.margin} points (standard territory scoring)!`
              : language === 'vi'
              ? 'Ván cờ đã kết thúc!'
              : 'Game over!'}
          </p>
        </div>

        {/* Bảng chi tiết điểm số nếu kết thúc bằng 2 lượt Pass */}
        {score && !isResignation && (
          <div className="space-y-2 bg-zinc-50 p-3 border-2 border-zinc-900 text-xs font-mono">
            <div className="font-pixel font-bold text-center text-zinc-900 border-b border-zinc-300 pb-1 mb-2">
              {language === 'vi'
                ? 'CHI TIẾT TÍNH ĐIỂM (TERRITORY SCORING)'
                : 'TERRITORY SCORING BREAKDOWN'}
            </div>

            {/* Hàng Quân Đen */}
            <div className="flex items-center justify-between py-1 border-b border-zinc-200">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-3.5 h-3.5 rounded-full bg-black inline-block" />
                {language === 'vi' ? 'ĐEN:' : 'BLACK:'}
              </span>
              <span>
                {score.blackTerritory}{' '}
                {language === 'vi' ? 'đất' : 'territory'} + {score.blackCaptures}{' '}
                {language === 'vi' ? 'tù binh' : 'captures'} ={' '}
                <b className="font-pixel text-sm text-zinc-950">{score.blackTotal}</b>
              </span>
            </div>

            {/* Hàng Quân Trắng */}
            <div className="flex items-center justify-between py-1 border-b border-zinc-200">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-3.5 h-3.5 rounded-full bg-white border border-black inline-block" />
                {language === 'vi' ? 'TRẮNG:' : 'WHITE:'}
              </span>
              <span>
                {score.whiteTerritory}{' '}
                {language === 'vi' ? 'đất' : 'territory'} + {score.whiteCaptures}{' '}
                {language === 'vi' ? 'tù binh' : 'captures'} + {score.komi} Komi ={' '}
                <b className="font-pixel text-sm text-zinc-950">{score.whiteTotal}</b>
              </span>
            </div>

            <div className="text-[11px] text-zinc-500 text-center pt-1">
              {language === 'vi'
                ? '* Điểm chấp (Komi 6.5) cộng cho Trắng để cân bằng lợi thế đi trước của Đen.'
                : '* Komi (6.5 pts) is added to White to balance Black playing first.'}
            </div>
          </div>
        )}

        {/* Nút hành động */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1 font-pixel text-xs font-bold">
          <button
            type="button"
            onClick={onPlayAgain}
            className="flex-1 pixel-btn bg-emerald-400 hover:bg-emerald-300 text-zinc-950 py-3 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{language === 'vi' ? 'CHƠI LẠI VÁN MỚI' : 'PLAY AGAIN'}</span>
          </button>
          <button
            type="button"
            onClick={onBackToLobby}
            className="pixel-btn bg-zinc-200 hover:bg-zinc-300 text-zinc-800 py-3 px-4 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'vi' ? 'CHỌN BÀN CỜ' : 'SELECT BOARD'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
