'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MinesweeperDifficulty,
  DIFFICULTIES,
  Board,
  GameStatus,
  createEmptyBoard,
  populateMines,
  revealCell,
  toggleFlag,
  chordCell,
  countFlags,
} from './minesweeperLogic';
import {
  getMinesweeperStats,
  recordMinesweeperWin,
  recordMinesweeperLoss,
  MinesweeperStats,
} from './minesweeperStatsService';
import { sounds } from '@/lib/sound/soundService';
import { MinesweeperControls } from './MinesweeperControls';
import { MinesweeperBoard } from './MinesweeperBoard';
import { MinesweeperWinModal } from './MinesweeperWinModal';
import { MinesweeperOverModal } from './MinesweeperOverModal';

export function Minesweeper() {
  const [difficulty, setDifficulty] = useState<MinesweeperDifficulty>('beginner');
  const [board, setBoard] = useState<Board>(() => {
    const conf = DIFFICULTIES['beginner'];
    return createEmptyBoard(conf.rows, conf.cols);
  });
  const [status, setStatus] = useState<GameStatus>('idle');
  const [isFirstClick, setIsFirstClick] = useState<boolean>(true);
  const [timeSeconds, setTimeSeconds] = useState<number>(0);
  const [activeTool, setActiveTool] = useState<'dig' | 'flag'>('dig');
  const [isPressing, setIsPressing] = useState<boolean>(false);
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [stats, setStats] = useState<MinesweeperStats>(() => getMinesweeperStats());

  // Modal kết quả
  const [winModalOpen, setWinModalOpen] = useState(false);
  const [overModalOpen, setOverModalOpen] = useState(false);
  const [winRecordInfo, setWinRecordInfo] = useState<{ isNew: boolean; prev: number | null }>({
    isNew: false,
    prev: null,
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi tạo hoặc chơi lại
  const handleReset = useCallback(
    (newDiff?: MinesweeperDifficulty) => {
      const targetDiff = newDiff || difficulty;
      const conf = DIFFICULTIES[targetDiff];

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      setBoard(createEmptyBoard(conf.rows, conf.cols));
      setStatus('idle');
      setIsFirstClick(true);
      setTimeSeconds(0);
      setIsPressing(false);
      setWinModalOpen(false);
      setOverModalOpen(false);
      setStats(getMinesweeperStats());
    },
    [difficulty]
  );

  // Đổi cấp độ khó
  const handleSelectDifficulty = (d: MinesweeperDifficulty) => {
    if (d === difficulty) return;
    setDifficulty(d);
    setZoomLevel(100);
    handleReset(d);
  };

  // Điều khiển thu phóng kích thước ô
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(140, prev + 10));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(70, prev - 10));
  const handleZoomReset = () => setZoomLevel(100);

  // Đồng hồ đếm giây (chạy khi status === 'playing')
  useEffect(() => {
    if (status === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeSeconds((prev) => (prev < 999 ? prev + 1 : 999));
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [status]);

  // Hành động 1: Mở ô
  const handleReveal = (row: number, col: number) => {
    if (status === 'won' || status === 'lost') return;

    const conf = DIFFICULTIES[difficulty];
    let currentBoard = board;

    // Nước click đầu tiên: rải mìn an toàn (first click never boom)
    if (isFirstClick) {
      currentBoard = populateMines(board, conf.rows, conf.cols, conf.mines, row, col);
      setIsFirstClick(false);
      setStatus('playing');
    }

    const result = revealCell(currentBoard, row, col, conf.mines);
    setBoard(result.board);

    if (result.status === 'lost') {
      setStatus('lost');
      sounds.playMinesweeperBoom();
      recordMinesweeperLoss();
      setStats(getMinesweeperStats());
      setTimeout(() => setOverModalOpen(true), 600);
    } else if (result.status === 'won') {
      setStatus('won');
      sounds.playMinesweeperWin();
      const winResult = recordMinesweeperWin(difficulty, Math.max(1, timeSeconds));
      setWinRecordInfo({ isNew: winResult.isNewRecord, prev: winResult.prevRecord });
      setStats(winResult.stats);
      setTimeout(() => setWinModalOpen(true), 600);
    } else {
      sounds.playMinesweeperClick();
    }
  };

  // Hành động 2: Cắm / Gỡ cờ
  const handleToggleFlag = (row: number, col: number) => {
    if (status === 'won' || status === 'lost') return;

    // Nếu cắm cờ trước khi mở ô đầu tiên, vẫn chuyển sang playing
    if (status === 'idle') {
      setStatus('playing');
    }

    setBoard((prev) => toggleFlag(prev, row, col));
    sounds.playMinesweeperFlag();
  };

  // Hành động 3: Chord (mở nhanh khi đủ cờ)
  const handleChord = (row: number, col: number) => {
    if (status !== 'playing') return;

    const conf = DIFFICULTIES[difficulty];
    const result = chordCell(board, row, col, conf.mines);
    setBoard(result.board);

    if (result.status === 'lost') {
      setStatus('lost');
      sounds.playMinesweeperBoom();
      recordMinesweeperLoss();
      setStats(getMinesweeperStats());
      setTimeout(() => setOverModalOpen(true), 600);
    } else if (result.status === 'won') {
      setStatus('won');
      sounds.playMinesweeperWin();
      const winResult = recordMinesweeperWin(difficulty, Math.max(1, timeSeconds));
      setWinRecordInfo({ isNew: winResult.isNewRecord, prev: winResult.prevRecord });
      setStats(winResult.stats);
      setTimeout(() => setWinModalOpen(true), 600);
    } else {
      sounds.playMinesweeperClick();
    }
  };

  // Tính số mìn còn lại: totalMines - số cờ đã cắm
  const conf = DIFFICULTIES[difficulty];
  const flaggedCount = countFlags(board);
  const remainingMines = conf.mines - flaggedCount;

  // Trạng thái khuôn mặt
  const faceState: 'idle' | 'scared' | 'won' | 'lost' =
    status === 'won'
      ? 'won'
      : status === 'lost'
      ? 'lost'
      : isPressing
      ? 'scared'
      : 'idle';

  const bestRecord = stats[difficulty]?.bestTimeSeconds ?? null;

  // Tính kích thước ô thực tế theo cấp độ & mức thu phóng zoom
  const baseCellSize = difficulty === 'beginner' ? 38 : difficulty === 'intermediate' ? 30 : 28;
  const cellSize = Math.round((baseCellSize * zoomLevel) / 100);

  return (
    <div className="flex flex-col items-center">
      {/* Khung máy trò chơi Dò mìn */}
      <div className="w-full max-w-4xl bg-[#D4D4D8] border-4 border-zinc-950 p-3 sm:p-5 shadow-[0_8px_0_0_#18181b]">
        {/* Bảng điều khiển */}
        <MinesweeperControls
          difficulty={difficulty}
          onSelectDifficulty={handleSelectDifficulty}
          remainingMines={remainingMines}
          timeSeconds={timeSeconds}
          faceState={faceState}
          onReset={() => handleReset()}
          activeTool={activeTool}
          onToggleTool={setActiveTool}
          bestTime={bestRecord}
          disabled={false}
          zoomLevel={zoomLevel}
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onZoomReset={handleZoomReset}
        />

        {/* Bàn cờ Dò Mìn */}
        <MinesweeperBoard
          board={board}
          cellSize={cellSize}
          onReveal={handleReveal}
          onToggleFlag={handleToggleFlag}
          onChord={handleChord}
          onPressingChange={setIsPressing}
          activeTool={activeTool}
          disabled={status === 'won' || status === 'lost'}
        />

        {/* Ghi chú hướng dẫn nhanh */}
        <div className="mt-3 text-center font-mono text-[11px] text-zinc-600">
          <span>
            {difficulty === 'beginner'
              ? '💡 Bấm chuột trái để mở, chuột phải (hoặc chạm giữ) để cắm cờ 🚩'
              : '💡 Bảng kích thước lớn: Vuốt sang hai bên để xem toàn bộ ô mìn.'}
          </span>
        </div>
      </div>

      {/* Modal Chiến thắng */}
      <MinesweeperWinModal
        isOpen={winModalOpen}
        timeSeconds={timeSeconds}
        difficulty={difficulty}
        isNewRecord={winRecordInfo.isNew}
        prevRecord={winRecordInfo.prev}
        onPlayAgain={() => handleReset()}
      />

      {/* Modal Thua cuộc */}
      <MinesweeperOverModal
        isOpen={overModalOpen}
        timeSeconds={timeSeconds}
        onPlayAgain={() => handleReset()}
      />
    </div>
  );
}
