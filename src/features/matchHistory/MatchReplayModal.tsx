'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MatchRecord } from './types';
import { Chess } from 'chess.js';
import { ChessBoard } from '@/features/games/chess/ChessBoard';
import { CaroBoard } from '@/features/games/caro/CaroBoard';
import { CaroBoard as CaroBoardType } from '@/features/games/caro/types';
import { XiangqiBoard } from '@/features/games/xiangqi/XiangqiBoard';
import { Board as XiangqiBoardType, createInitialBoard, cloneBoard, isSideInCheck } from '@/features/games/xiangqi/xiangqiLogic';
import { sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Calendar,
  Users,
  Clock,
} from 'lucide-react';

interface MatchReplayModalProps {
  match: MatchRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchReplayModal({ match, isOpen, onClose }: MatchReplayModalProps) {
  const { language } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalMoves = match ? match.moves.length : 0;

  // Reset về nước cuối cùng khi mở một ván đấu mới
  useEffect(() => {
    if (match && isOpen) {
      setCurrentStep(match.moves.length);
      setIsPlaying(false);
    }
  }, [match, isOpen]);

  // Tự động phát nước đi (Auto Play)
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalMoves) {
            setIsPlaying(false);
            return prev;
          }
          sounds.playMove();
          return prev + 1;
        });
      }, 1100);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }

    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying, totalMoves]);

  // --- RECONSTRUCT CHESS BOARD ---
  const chessState = useMemo(() => {
    if (!match || match.gameId !== 'chess') {
      return { fen: 'start', lastMove: null, isCheck: false };
    }

    const game = new Chess();
    let lm = null;
    for (let i = 0; i < currentStep; i++) {
      try {
        const moveStr = match.moves[i] as string;
        const res = game.move(moveStr);
        if (res) lm = { from: res.from, to: res.to };
      } catch {}
    }

    return {
      fen: game.fen(),
      lastMove: lm,
      isCheck: game.inCheck(),
    };
  }, [match, currentStep]);

  // --- RECONSTRUCT CARO BOARD ---
  const caroState = useMemo(() => {
    if (!match || match.gameId !== 'caro') {
      return { board: [] as CaroBoardType, lastMove: null };
    }

    const b: CaroBoardType = Array.from({ length: 15 }, () => Array(15).fill(null));
    let lm: { row: number; col: number } | null = null;

    for (let i = 0; i < currentStep; i++) {
      const m = match.moves[i];
      if (m && m.row >= 0 && m.row < 15 && m.col >= 0 && m.col < 15) {
        b[m.row][m.col] = m.player;
        lm = { row: m.row, col: m.col };
      }
    }

    return { board: b, lastMove: lm };
  }, [match, currentStep]);

  // --- RECONSTRUCT XIANGQI BOARD ---
  const xiangqiState = useMemo(() => {
    if (!match || match.gameId !== 'xiangqi') {
      return { board: [] as XiangqiBoardType, lastMove: null, isCheck: false };
    }

    let b = createInitialBoard();
    let lm = null;

    for (let i = 0; i < currentStep; i++) {
      const m = match.moves[i];
      if (m && m.from && m.to) {
        const nextB = cloneBoard(b);
        nextB[m.to.row][m.to.col] = nextB[m.from.row][m.from.col];
        nextB[m.from.row][m.from.col] = null;
        b = nextB;
        lm = m;
      }
    }

    const currentTurn = currentStep % 2 === 0 ? 'red' : 'black';
    const inCheck = b.length > 0 ? isSideInCheck(b, currentTurn) : false;

    return { board: b, lastMove: lm, isCheck: inCheck };
  }, [match, currentStep]);

  if (!isOpen || !match) return null;

  const handleStep = (targetStep: number) => {
    setIsPlaying(false);
    const clamped = Math.max(0, Math.min(totalMoves, targetStep));
    setCurrentStep(clamped);
    sounds.playMove();
  };

  const formattedDate = new Date(match.playedAt).toLocaleDateString(
    language === 'vi' ? 'vi-VN' : 'en-US',
    {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }
  );

  const getResultBadge = () => {
    if (match.result === 'win') {
      return {
        bg: 'bg-emerald-300 text-emerald-950 border-emerald-900',
        text: language === 'vi' ? 'CHIẾN THẮNG 🏆' : 'VICTORY 🏆',
      };
    }
    if (match.result === 'loss') {
      return {
        bg: 'bg-rose-200 text-rose-950 border-rose-900',
        text: language === 'vi' ? 'THẤT BẠI 💀' : 'DEFEAT 💀',
      };
    }
    return {
      bg: 'bg-amber-200 text-amber-950 border-amber-900',
      text: language === 'vi' ? 'HÒA CỜ 🤝' : 'DRAW 🤝',
    };
  };

  const badge = getResultBadge();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="pixel-box-lg relative flex flex-col w-full max-w-2xl max-h-[96vh] bg-[#FFFDF8] border-4 border-zinc-900 shadow-pixel-lg overflow-hidden">
        {/* Header Bar */}
        <div className="flex items-center justify-between bg-indigo-700 px-4 py-3 text-white border-b-2 border-zinc-900">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center bg-amber-300 text-zinc-950 font-pixel text-lg border-2 border-zinc-900 shadow-pixel-xs">
              {match.gameId === 'chess' ? '♟️' : match.gameId === 'caro' ? '❌' : '帥'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-pixel text-sm font-bold text-amber-300 uppercase tracking-wide">
                  {match.gameId === 'chess'
                    ? language === 'vi' ? 'XEM LẠI CỜ VUA' : 'CHESS REPLAY'
                    : match.gameId === 'caro'
                    ? language === 'vi' ? 'XEM LẠI CỜ CARO' : 'CARO REPLAY'
                    : language === 'vi' ? 'XEM LẠI CỜ TƯỚNG' : 'XIANGQI REPLAY'}
                </h3>
                <span className={`px-1.5 py-0.2 font-pixel text-[10px] font-bold border ${badge.bg}`}>
                  {badge.text}
                </span>
              </div>
              <p className="text-[11px] font-mono text-indigo-100 flex items-center gap-2 mt-0.5">
                <span>VS {match.opponentName}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-300" />
                  {formattedDate}
                </span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="pixel-btn bg-white p-1.5 text-zinc-900 hover:bg-rose-100 border-2 border-zinc-900 shadow-pixel-xs"
            aria-label="Đóng"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Board Viewport Area */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4 flex flex-col items-center justify-center bg-[#F4F1EA]">
          <div className="w-full flex items-center justify-center max-h-[48vh] sm:max-h-[52vh]">
            {match.gameId === 'chess' && (
              <div className="w-full max-w-[340px] sm:max-w-[400px]">
                <ChessBoard
                  fen={chessState.fen}
                  playerColor={match.playerColor === 'b' ? 'black' : 'white'}
                  isMyTurn={false}
                  lastMove={chessState.lastMove}
                  isCheck={chessState.isCheck}
                  onMakeMove={() => {}}
                  disabled={true}
                />
              </div>
            )}

            {match.gameId === 'caro' && (
              <div className="w-full max-w-[340px] sm:max-w-[420px]">
                <CaroBoard
                  board={caroState.board}
                  lastMove={caroState.lastMove}
                  winningLine={null}
                  disabled={true}
                  onCellClick={() => {}}
                />
              </div>
            )}

            {match.gameId === 'xiangqi' && (
              <div className="w-full max-w-[320px] sm:max-w-[380px]">
                <XiangqiBoard
                  board={xiangqiState.board}
                  turn={currentStep % 2 === 0 ? 'red' : 'black'}
                  selectedPos={null}
                  legalMoves={[]}
                  lastMove={xiangqiState.lastMove}
                  isCheck={xiangqiState.isCheck}
                  flipped={match.playerColor === 'black'}
                  disabled={true}
                  onSelectPiece={() => {}}
                  onMakeMove={() => {}}
                />
              </div>
            )}
          </div>
        </div>

        {/* Control Scrubber & Step Bar */}
        <div className="bg-[#FFFDF8] border-t-2 border-zinc-900 p-3 sm:p-4 space-y-2.5">
          {/* Progress & Step Counter */}
          <div className="flex items-center justify-between font-mono text-xs font-bold text-zinc-700">
            <span className="font-pixel text-zinc-900">
              {language === 'vi' ? 'NƯỚC ĐI:' : 'MOVE:'}{' '}
              <span className="text-emerald-700 font-bold">{currentStep}</span> / {totalMoves}
            </span>

            {/* Slider */}
            <div className="flex-1 mx-3">
              <input
                type="range"
                min="0"
                max={totalMoves}
                value={currentStep}
                onChange={(e) => handleStep(parseInt(e.target.value, 10))}
                className="pixel-range w-full"
                aria-label="Thanh tua nước đi"
              />
            </div>

            <span className="text-[11px] text-zinc-500 font-pixel">
              {match.reason || (language === 'vi' ? 'Hoàn tất ván' : 'Completed')}
            </span>
          </div>

          {/* Action Buttons: Start, Prev, Play/Pause, Next, End */}
          <div className="flex items-center justify-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => handleStep(0)}
              disabled={currentStep === 0}
              className="pixel-btn p-2 bg-white hover:bg-zinc-100 disabled:opacity-40 border-2 border-zinc-900 shadow-pixel-xs"
              title={language === 'vi' ? 'Về nước đầu tiên' : 'First Move'}
            >
              <SkipBack className="w-4 h-4 text-zinc-800" />
            </button>

            <button
              type="button"
              onClick={() => handleStep(currentStep - 1)}
              disabled={currentStep === 0}
              className="pixel-btn px-3 py-2 bg-white hover:bg-zinc-100 disabled:opacity-40 border-2 border-zinc-900 shadow-pixel-xs flex items-center gap-1 font-pixel text-xs font-bold"
              title={language === 'vi' ? 'Lùi 1 nước' : 'Previous Move'}
            >
              <ChevronLeft className="w-4 h-4 text-zinc-800" />
              <span className="hidden sm:inline">{language === 'vi' ? 'LÙI' : 'PREV'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className={`pixel-btn px-4 py-2 border-2 border-zinc-900 shadow-pixel-sm flex items-center gap-1.5 font-pixel text-xs font-bold transition-transform active:scale-95 ${
                isPlaying ? 'bg-amber-400 text-zinc-950' : 'bg-indigo-600 text-amber-300 hover:bg-indigo-500'
              }`}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>
                {isPlaying
                  ? language === 'vi' ? 'TẠM DỪNG' : 'PAUSE'
                  : language === 'vi' ? 'TỰ ĐỘNG PHÁT' : 'AUTO PLAY'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleStep(currentStep + 1)}
              disabled={currentStep >= totalMoves}
              className="pixel-btn px-3 py-2 bg-white hover:bg-zinc-100 disabled:opacity-40 border-2 border-zinc-900 shadow-pixel-xs flex items-center gap-1 font-pixel text-xs font-bold"
              title={language === 'vi' ? 'Tiến 1 nước' : 'Next Move'}
            >
              <span className="hidden sm:inline">{language === 'vi' ? 'TIẾN' : 'NEXT'}</span>
              <ChevronRight className="w-4 h-4 text-zinc-800" />
            </button>

            <button
              type="button"
              onClick={() => handleStep(totalMoves)}
              disabled={currentStep >= totalMoves}
              className="pixel-btn p-2 bg-white hover:bg-zinc-100 disabled:opacity-40 border-2 border-zinc-900 shadow-pixel-xs"
              title={language === 'vi' ? 'Đến nước cuối cùng' : 'Last Move'}
            >
              <SkipForward className="w-4 h-4 text-zinc-800" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
