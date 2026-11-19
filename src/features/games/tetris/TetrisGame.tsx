'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  TETRIS_COLS,
  TETRIS_ROWS,
  TETROMINO_COLORS,
  TETROMINO_SHAPES,
  calculateLineScore,
  createEmptyTetrisBoard,
  generateSevenBag,
  getDropIntervalMs,
  getGhostRow,
  isValidPosition,
  lockPieceAndClearLines,
  spawnPiece,
  tryRotatePiece,
} from './tetrisLogic';
import { ActivePiece, TetrisBoard, TetrominoType } from './types';
import {
  clearTetrisState,
  loadTetrisState,
  saveTetrisState,
} from './tetrisStorage';
import { getTetrisStats, recordTetrisGameFinish } from './tetrisStatsService';
import { sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ChevronsDown,
  Pause,
  Play,
  RefreshCw,
  RotateCw,
  Trophy,
  Volume2,
  VolumeX,
  Package,
} from 'lucide-react';

const CELL_PX = 24;
const CANVAS_W = TETRIS_COLS * CELL_PX; // 240
const CANVAS_H = TETRIS_ROWS * CELL_PX; // 480

/** Component vẽ mini Tetromino (3x4 hoặc 4x4) cho khung HOLD & NEXT */
const MiniPiecePreview: React.FC<{
  type: TetrominoType | null;
  dimmed?: boolean;
}> = ({ type, dimmed = false }) => {
  if (!type) {
    return (
      <div className="h-10 w-14 flex items-center justify-center text-[10px] font-mono text-zinc-500">
        —
      </div>
    );
  }

  const shape = TETROMINO_SHAPES[type];
  const color = TETROMINO_COLORS[type];
  const cols = shape[0].length;

  return (
    <div
      className={`grid gap-[1px] ${dimmed ? 'opacity-40' : ''}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, 11px)`,
      }}
    >
      {shape.flatMap((row, r) =>
        row.map((val, c) =>
          val ? (
            <div
              key={`${r}-${c}`}
              className="w-[11px] h-[11px] border border-zinc-950"
              style={{
                backgroundColor: color.main,
                boxShadow: `inset 2px 2px 0 ${color.light}, inset -2px -2px 0 ${color.dark}`,
              }}
            />
          ) : (
            <div key={`${r}-${c}`} className="w-[11px] h-[11px]" />
          )
        )
      )}
    </div>
  );
};

export const TetrisGame: React.FC = () => {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [lines, setLines] = useState(0);
  const [combo, setCombo] = useState(0);
  const [holdPiece, setHoldPiece] = useState<TetrominoType | null>(null);
  const [canHold, setCanHold] = useState(true);
  const [nextQueue, setNextQueue] = useState<TetrominoType[]>([]);
  const [isPaused, setIsPaused] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [clearBanner, setClearBanner] = useState<string | null>(null);
  const [muted, setMuted] = useState(sounds.isSfxMuted());

  // Mutable state ref để vòng lặp game chạy mượt mà 60fps không lag re-render
  const engineRef = useRef<{
    board: TetrisBoard;
    currentPiece: ActivePiece;
    holdPiece: TetrominoType | null;
    canHold: boolean;
    nextQueue: TetrominoType[];
    bag: TetrominoType[];
    score: number;
    level: number;
    lines: number;
    combo: number;
    tetrises: number;
    isPaused: boolean;
    isGameOver: boolean;
  } | null>(null);

  const lastDropTimeRef = useRef<number>(0);

  // Sync trạng thái mute từ Header
  useEffect(() => {
    setMuted(sounds.isSfxMuted());
    const handleVol = (e: Event) => {
      const custom = e as CustomEvent<{ sfxMuted: boolean }>;
      if (custom.detail !== undefined) setMuted(custom.detail.sfxMuted);
    };
    window.addEventListener('kombat:volume_change', handleVol);
    return () => window.removeEventListener('kombat:volume_change', handleVol);
  }, []);

  // Helper rút 1 khối từ túi 7-Bag
  const pullFromQueue = (queue: TetrominoType[], bag: TetrominoType[]) => {
    const q = [...queue];
    let b = [...bag];
    while (q.length < 4) {
      if (b.length === 0) b = generateSevenBag();
      q.push(b.shift()!);
    }
    const nextType = q.shift()!;
    while (q.length < 3) {
      if (b.length === 0) b = generateSevenBag();
      q.push(b.shift()!);
    }
    return { nextType, nextQueue: q, nextBag: b };
  };

  // Sync UI state từ engineRef
  const syncUiFromEngine = useCallback(() => {
    const e = engineRef.current;
    if (!e) return;
    setScore(e.score);
    setLevel(e.level);
    setLines(e.lines);
    setCombo(e.combo);
    setHoldPiece(e.holdPiece);
    setCanHold(e.canHold);
    setNextQueue([...e.nextQueue]);
    setIsPaused(e.isPaused);
    setIsGameOver(e.isGameOver);
  }, []);

  // Khởi tạo ván mới hoặc khôi phục ván đang dở
  const initGame = useCallback(
    (forceFresh: boolean = false) => {
      const stats = getTetrisStats();
      setHighScore(stats.highScore);
      setIsNewHighScore(false);
      setClearBanner(null);

      if (!forceFresh) {
        const saved = loadTetrisState();
        if (saved && !saved.isGameOver) {
          engineRef.current = {
            ...saved,
            isPaused: false,
          };
          syncUiFromEngine();
          return;
        }
      }

      clearTetrisState();
      const firstBag = generateSevenBag();
      const firstType = firstBag.shift()!;
      const { nextQueue: q, nextBag: b } = pullFromQueue([], firstBag);

      engineRef.current = {
        board: createEmptyTetrisBoard(),
        currentPiece: spawnPiece(firstType),
        holdPiece: null,
        canHold: true,
        nextQueue: q,
        bag: b,
        score: 0,
        level: 1,
        lines: 0,
        combo: 0,
        tetrises: 0,
        isPaused: false,
        isGameOver: false,
      };
      lastDropTimeRef.current = performance.now();
      syncUiFromEngine();
    },
    [syncUiFromEngine]
  );

  useEffect(() => {
    initGame(false);
  }, [initGame]);

  // Vẽ toàn bộ bàn chơi lên Canvas Pixel 16-bit
  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const e = engineRef.current;
    if (!canvas || !e) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.imageSmoothingEnabled = false;

    // 1. Nền bàn chơi tối cổ điển với lưới mờ
    ctx.fillStyle = '#09090B';
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    ctx.strokeStyle = '#18181B';
    ctx.lineWidth = 1;
    for (let r = 0; r <= TETRIS_ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * CELL_PX);
      ctx.lineTo(CANVAS_W, r * CELL_PX);
      ctx.stroke();
    }
    for (let c = 0; c <= TETRIS_COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * CELL_PX, 0);
      ctx.lineTo(c * CELL_PX, CANVAS_H);
      ctx.stroke();
    }

    const drawBlock = (
      r: number,
      c: number,
      type: TetrominoType,
      isGhost: boolean = false
    ) => {
      if (r < 0 || r >= TETRIS_ROWS || c < 0 || c >= TETRIS_COLS) return;
      const x = c * CELL_PX;
      const y = r * CELL_PX;
      const col = TETROMINO_COLORS[type];

      if (isGhost) {
        ctx.strokeStyle = col.main;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 2, y + 2, CELL_PX - 4, CELL_PX - 4);
        ctx.fillStyle = `${col.main}26`;
        ctx.fillRect(x + 3, y + 3, CELL_PX - 6, CELL_PX - 6);
        return;
      }

      // Khối gạch Pixel 3D Bevel
      ctx.fillStyle = '#000000';
      ctx.fillRect(x, y, CELL_PX, CELL_PX);

      ctx.fillStyle = col.main;
      ctx.fillRect(x + 1, y + 1, CELL_PX - 2, CELL_PX - 2);

      // Viền sáng trên & trái
      ctx.fillStyle = col.light;
      ctx.fillRect(x + 1, y + 1, CELL_PX - 2, 3);
      ctx.fillRect(x + 1, y + 1, 3, CELL_PX - 2);

      // Viền tối dưới & phải
      ctx.fillStyle = col.dark;
      ctx.fillRect(x + 1, y + CELL_PX - 4, CELL_PX - 2, 3);
      ctx.fillRect(x + CELL_PX - 4, y + 1, 3, CELL_PX - 2);

      // Đốm bóng pixel góc trên trái
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(x + 3, y + 3, 2, 2);
    };

    // 2. Vẽ các gạch đã khóa trên bàn
    for (let r = 0; r < TETRIS_ROWS; r++) {
      for (let c = 0; c < TETRIS_COLS; c++) {
        const cell = e.board[r][c];
        if (cell) drawBlock(r, c, cell, false);
      }
    }

    if (!e.isGameOver) {
      // 3. Vẽ Ghost Piece (Bóng mờ điểm rơi)
      const ghostRow = getGhostRow(e.board, e.currentPiece);
      for (let r = 0; r < e.currentPiece.matrix.length; r++) {
        for (let c = 0; c < e.currentPiece.matrix[r].length; c++) {
          if (e.currentPiece.matrix[r][c]) {
            drawBlock(
              ghostRow + r,
              e.currentPiece.col + c,
              e.currentPiece.type,
              true
            );
          }
        }
      }

      // 4. Vẽ Khối hiện tại đang rơi
      for (let r = 0; r < e.currentPiece.matrix.length; r++) {
        for (let c = 0; c < e.currentPiece.matrix[r].length; c++) {
          if (e.currentPiece.matrix[r][c]) {
            drawBlock(
              e.currentPiece.row + r,
              e.currentPiece.col + c,
              e.currentPiece.type,
              false
            );
          }
        }
      }
    }
  }, []);

  // Khóa khối, xóa dòng và sinh khối tiếp theo
  const lockAndSpawnNext = useCallback(() => {
    const e = engineRef.current;
    if (!e || e.isGameOver) return;

    const { newBoard, clearedCount, toppedOut } = lockPieceAndClearLines(
      e.board,
      e.currentPiece
    );

    e.board = newBoard;
    e.canHold = true;

    if (clearedCount > 0) {
      const nextCombo = e.combo + 1;
      const earned = calculateLineScore(clearedCount, e.level, e.combo);
      e.score += earned;
      e.lines += clearedCount;
      e.combo = nextCombo;
      if (clearedCount === 4) e.tetrises += 1;

      const nextLevel = Math.floor(e.lines / 10) + 1;
      e.level = nextLevel;

      sounds.playTetrisClear(clearedCount);

      if (clearedCount === 4) {
        setClearBanner(
          language === 'vi' ? '🔥 TETRIS! (+4 DÒNG)' : '🔥 TETRIS! (+4 LINES)'
        );
      } else if (nextCombo >= 2) {
        setClearBanner(`⚡ COMBO x${nextCombo}!`);
      } else {
        setClearBanner(`+${earned}`);
      }
      setTimeout(() => setClearBanner(null), 1100);
    } else {
      e.combo = 0;
      sounds.playTetrisDrop();
    }

    // Sinh khối mới
    const { nextType, nextQueue: nq, nextBag: nb } = pullFromQueue(
      e.nextQueue,
      e.bag
    );
    const nextPiece = spawnPiece(nextType);
    e.nextQueue = nq;
    e.bag = nb;
    e.currentPiece = nextPiece;

    // Kiểm tra Game Over nếu khối mới sinh ra bị kẹt ngay đỉnh
    if (
      toppedOut ||
      !isValidPosition(e.board, nextPiece.matrix, nextPiece.row, nextPiece.col)
    ) {
      e.isGameOver = true;
      clearTetrisState();
      sounds.playDefeat();
      const { isNewHighScore: newRec, stats } = recordTetrisGameFinish(
        e.score,
        e.level,
        e.lines,
        e.tetrises
      );
      setHighScore(stats.highScore);
      setIsNewHighScore(newRec);
    } else {
      saveTetrisState({
        board: e.board,
        currentPiece: e.currentPiece,
        holdPiece: e.holdPiece,
        canHold: e.canHold,
        nextQueue: e.nextQueue,
        bag: e.bag,
        score: e.score,
        level: e.level,
        lines: e.lines,
        combo: e.combo,
        tetrises: e.tetrises,
        isGameOver: false,
      });
    }

    syncUiFromEngine();
  }, [language, syncUiFromEngine]);

  // Các hành động điều khiển
  const moveHorizontal = useCallback(
    (dc: number) => {
      const e = engineRef.current;
      if (!e || e.isPaused || e.isGameOver) return;
      if (
        isValidPosition(
          e.board,
          e.currentPiece.matrix,
          e.currentPiece.row,
          e.currentPiece.col + dc
        )
      ) {
        e.currentPiece = {
          ...e.currentPiece,
          col: e.currentPiece.col + dc,
        };
        sounds.playTetrisMove();
        renderCanvas();
      }
    },
    [renderCanvas]
  );

  const rotatePiece = useCallback(() => {
    const e = engineRef.current;
    if (!e || e.isPaused || e.isGameOver) return;
    const rotated = tryRotatePiece(e.board, e.currentPiece);
    if (rotated) {
      e.currentPiece = rotated;
      sounds.playTetrisRotate();
      renderCanvas();
    }
  }, [renderCanvas]);

  const softDrop = useCallback(() => {
    const e = engineRef.current;
    if (!e || e.isPaused || e.isGameOver) return;
    if (
      isValidPosition(
        e.board,
        e.currentPiece.matrix,
        e.currentPiece.row + 1,
        e.currentPiece.col
      )
    ) {
      e.currentPiece = {
        ...e.currentPiece,
        row: e.currentPiece.row + 1,
      };
      e.score += 1;
      setScore(e.score);
      lastDropTimeRef.current = performance.now();
      renderCanvas();
    } else {
      lockAndSpawnNext();
      renderCanvas();
    }
  }, [lockAndSpawnNext, renderCanvas]);

  const hardDrop = useCallback(() => {
    const e = engineRef.current;
    if (!e || e.isPaused || e.isGameOver) return;
    const ghostRow = getGhostRow(e.board, e.currentPiece);
    const dropDist = Math.max(0, ghostRow - e.currentPiece.row);
    e.currentPiece = {
      ...e.currentPiece,
      row: ghostRow,
    };
    e.score += dropDist * 2;
    lockAndSpawnNext();
    renderCanvas();
  }, [lockAndSpawnNext, renderCanvas]);

  const handleHoldPiece = useCallback(() => {
    const e = engineRef.current;
    if (!e || e.isPaused || e.isGameOver || !e.canHold) return;

    const currentType = e.currentPiece.type;
    if (e.holdPiece === null) {
      const { nextType, nextQueue: nq, nextBag: nb } = pullFromQueue(
        e.nextQueue,
        e.bag
      );
      e.holdPiece = currentType;
      e.currentPiece = spawnPiece(nextType);
      e.nextQueue = nq;
      e.bag = nb;
    } else {
      const swapped = e.holdPiece;
      e.holdPiece = currentType;
      e.currentPiece = spawnPiece(swapped);
    }

    e.canHold = false;
    sounds.playTetrisRotate();
    syncUiFromEngine();
    renderCanvas();
  }, [renderCanvas, syncUiFromEngine]);

  const togglePause = useCallback(() => {
    const e = engineRef.current;
    if (!e || e.isGameOver) return;
    e.isPaused = !e.isPaused;
    setIsPaused(e.isPaused);
    if (!e.isPaused) {
      lastDropTimeRef.current = performance.now();
    }
  }, []);

  // Vòng lặp Game Loop (Gravity + 60fps Canvas Render)
  useEffect(() => {
    let animId: number;

    const tick = (now: number) => {
      const e = engineRef.current;
      if (e && !e.isPaused && !e.isGameOver) {
        const interval = getDropIntervalMs(e.level);
        if (now - lastDropTimeRef.current >= interval) {
          lastDropTimeRef.current = now;
          if (
            isValidPosition(
              e.board,
              e.currentPiece.matrix,
              e.currentPiece.row + 1,
              e.currentPiece.col
            )
          ) {
            e.currentPiece = {
              ...e.currentPiece,
              row: e.currentPiece.row + 1,
            };
          } else {
            lockAndSpawnNext();
          }
        }
      }
      renderCanvas();
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, [lockAndSpawnNext, renderCanvas]);

  // Điều khiển bằng Bàn phím PC
  useEffect(() => {
    const onKeyDown = (ev: KeyboardEvent) => {
      if (ev.target instanceof HTMLInputElement || ev.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (ev.key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          ev.preventDefault();
          moveHorizontal(-1);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          ev.preventDefault();
          moveHorizontal(1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          ev.preventDefault();
          softDrop();
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          ev.preventDefault();
          rotatePiece();
          break;
        case ' ':
          ev.preventDefault();
          hardDrop();
          break;
        case 'c':
        case 'C':
        case 'Shift':
          ev.preventDefault();
          handleHoldPiece();
          break;
        case 'p':
        case 'P':
        case 'Escape':
          ev.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleHoldPiece, hardDrop, moveHorizontal, rotatePiece, softDrop, togglePause]);

  return (
    <div className="w-full max-w-xl mx-auto select-none space-y-2.5 relative">
      {/* Hiệu ứng Pháo hoa khi lập kỷ lục mới */}
      <PixelFxOverlay active={isGameOver && isNewHighScore} />

      {/* 1. Thanh Thông số HUD */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        <div className="pixel-box bg-zinc-900 text-white p-2 border-2 border-zinc-950 text-center">
          <span className="block font-pixel text-[9px] text-zinc-400">
            {language === 'vi' ? 'ĐIỂM' : 'SCORE'}
          </span>
          <span className="font-mono text-sm sm:text-base font-black text-amber-300">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="pixel-box bg-zinc-900 text-white p-2 border-2 border-zinc-950 text-center">
          <span className="block font-pixel text-[9px] text-zinc-400">
            {language === 'vi' ? 'KỶ LỤC' : 'BEST'}
          </span>
          <span className="font-mono text-sm sm:text-base font-black text-emerald-300">
            {Math.max(highScore, score).toLocaleString()}
          </span>
        </div>

        <div className="pixel-box bg-zinc-900 text-white p-2 border-2 border-zinc-950 text-center">
          <span className="block font-pixel text-[9px] text-zinc-400">
            {language === 'vi' ? 'CẤP' : 'LEVEL'}
          </span>
          <span className="font-mono text-sm sm:text-base font-black text-cyan-300">
            {level}
          </span>
        </div>

        <div className="pixel-box bg-zinc-900 text-white p-2 border-2 border-zinc-950 text-center">
          <span className="block font-pixel text-[9px] text-zinc-400">
            {language === 'vi' ? 'DÒNG' : 'LINES'}
          </span>
          <span className="font-mono text-sm sm:text-base font-black text-rose-300">
            {lines}
          </span>
        </div>
      </div>

      {/* 2. Khu vực Sân chơi chính (HOLD — CANVAS 10×20 — NEXT) */}
      <div className="flex items-start justify-center gap-2 sm:gap-3">
        {/* Cột Trái: HOLD & Tiện ích */}
        <div className="w-16 sm:w-24 flex flex-col gap-2 shrink-0">
          <div className="pixel-box bg-[#FFFDF8] border-2 border-zinc-900 p-2 flex flex-col items-center shadow-[3px_3px_0px_#000]">
            <span className="font-pixel text-[9px] sm:text-[10px] font-bold text-zinc-700 mb-1.5">
              HOLD
            </span>
            <div className="min-h-[44px] flex items-center justify-center">
              <MiniPiecePreview type={holdPiece} dimmed={!canHold} />
            </div>
          </div>

          {combo >= 2 && (
            <div className="bg-amber-300 border-2 border-zinc-950 px-1.5 py-1 text-center font-pixel text-[10px] font-black text-zinc-950 shadow-[2px_2px_0px_#000] animate-bounce">
              COMBO x{combo}
            </div>
          )}

          {/* Nút Tạm dừng, Chơi lại, Âm thanh */}
          <button
            type="button"
            onClick={togglePause}
            disabled={isGameOver}
            className="pixel-btn bg-amber-100 hover:bg-amber-200 text-zinc-900 py-2 flex items-center justify-center gap-1 font-pixel text-[10px] font-bold"
            title={language === 'vi' ? 'Tạm dừng (P)' : 'Pause (P)'}
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5" />
            ) : (
              <Pause className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isPaused
                ? language === 'vi'
                  ? 'TIẾP'
                  : 'PLAY'
                : language === 'vi'
                ? 'DỪNG'
                : 'PAUSE'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => initGame(true)}
            className="pixel-btn bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-2 flex items-center justify-center gap-1 font-pixel text-[10px] font-bold"
            title={language === 'vi' ? 'Chơi lại' : 'Restart'}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">
              {language === 'vi' ? 'LẠI' : 'NEW'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMuted(sounds.toggleSfxMute())}
            className="pixel-btn bg-zinc-100 hover:bg-zinc-200 text-zinc-900 py-2 flex items-center justify-center"
            aria-label="Âm thanh"
          >
            {muted ? (
              <VolumeX className="w-4 h-4 text-zinc-500" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-700" />
            )}
          </button>
        </div>

        {/* Giữa: Bàn chơi 10x20 Pixel */}
        <div className="relative border-4 border-zinc-950 bg-zinc-950 shadow-[5px_5px_0px_#000]">
          <canvas
            ref={canvasRef}
            width={CANVAS_W}
            height={CANVAS_H}
            className="block w-[210px] sm:w-[240px] h-auto aspect-[10/20] [image-rendering:pixelated]"
          />

          {/* Banner nổi khi xóa dòng / TETRIS */}
          {clearBanner && !isGameOver && (
            <div className="pointer-events-none absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-amber-300 border-2 border-black px-2.5 py-0.5 font-pixel text-xs font-black text-zinc-950 shadow-[2px_2px_0px_#000] animate-bounce">
              {clearBanner}
            </div>
          )}

          {/* Overlay Tạm dừng */}
          {isPaused && !isGameOver && (
            <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center gap-3 p-4 text-center">
              <p className="font-pixel text-lg font-bold text-amber-300">
                {language === 'vi' ? 'TẠM DỪNG' : 'PAUSED'}
              </p>
              <button
                type="button"
                onClick={togglePause}
                className="pixel-btn bg-emerald-400 hover:bg-emerald-300 text-zinc-950 px-4 py-2 font-pixel text-xs font-bold flex items-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{language === 'vi' ? 'TIẾP TỤC' : 'RESUME'}</span>
              </button>
            </div>
          )}

          {/* Overlay Game Over */}
          {isGameOver && (
            <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center gap-3 p-4 text-center animate-in fade-in">
              <div className="p-2.5 bg-amber-300 border-2 border-black rounded-full">
                <Trophy className="w-6 h-6 text-zinc-950" />
              </div>
              <h3 className="font-pixel text-lg font-black text-rose-400">
                GAME OVER
              </h3>
              {isNewHighScore && (
                <span className="bg-amber-300 text-zinc-950 px-2 py-0.5 font-pixel text-[10px] font-bold animate-bounce">
                  🏆 {language === 'vi' ? 'KỶ LỤC MỚI!' : 'NEW RECORD!'}
                </span>
              )}
              <div className="text-xs font-mono text-white space-y-0.5">
                <p>
                  {language === 'vi' ? 'Điểm:' : 'Score:'}{' '}
                  <strong className="text-amber-300">{score}</strong>
                </p>
                <p>
                  {language === 'vi' ? 'Số dòng:' : 'Lines:'}{' '}
                  <strong className="text-cyan-300">{lines}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => initGame(true)}
                className="pixel-btn bg-emerald-400 hover:bg-emerald-300 text-zinc-950 px-4 py-2 font-pixel text-xs font-bold flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{language === 'vi' ? 'CHƠI LẠI' : 'PLAY AGAIN'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Cột Phải: NEXT Queue (3 khối tiếp theo) */}
        <div className="w-16 sm:w-24 flex flex-col gap-2 shrink-0">
          <div className="pixel-box bg-[#FFFDF8] border-2 border-zinc-900 p-2 flex flex-col items-center gap-3 shadow-[3px_3px_0px_#000]">
            <span className="font-pixel text-[9px] sm:text-[10px] font-bold text-zinc-700">
              NEXT
            </span>
            {nextQueue.slice(0, 3).map((t, idx) => (
              <div
                key={`${t}-${idx}`}
                className="min-h-[38px] flex items-center justify-center"
              >
                <MiniPiecePreview type={t} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Cụm phím điều khiển cảm ứng (Mobile & Tablet) */}
      <div className="grid grid-cols-6 gap-1.5 pt-1 sm:max-w-md mx-auto">
        <button
          type="button"
          onClick={() => moveHorizontal(-1)}
          className="pixel-btn bg-white active:bg-amber-200 border-2 border-zinc-900 py-3 flex items-center justify-center shadow-[2px_2px_0px_#000]"
          aria-label="Sang trái"
        >
          <ArrowLeft className="w-5 h-5 text-zinc-900" />
        </button>

        <button
          type="button"
          onClick={softDrop}
          className="pixel-btn bg-white active:bg-amber-200 border-2 border-zinc-900 py-3 flex items-center justify-center shadow-[2px_2px_0px_#000]"
          aria-label="Rơi nhanh"
        >
          <ArrowDown className="w-5 h-5 text-zinc-900" />
        </button>

        <button
          type="button"
          onClick={() => moveHorizontal(1)}
          className="pixel-btn bg-white active:bg-amber-200 border-2 border-zinc-900 py-3 flex items-center justify-center shadow-[2px_2px_0px_#000]"
          aria-label="Sang phải"
        >
          <ArrowRight className="w-5 h-5 text-zinc-900" />
        </button>

        <button
          type="button"
          onClick={rotatePiece}
          className="pixel-btn bg-cyan-200 active:bg-cyan-300 border-2 border-zinc-900 py-3 flex flex-col items-center justify-center shadow-[2px_2px_0px_#000]"
          aria-label="Xoay khối"
        >
          <RotateCw className="w-4 h-4 text-zinc-950" />
          <span className="font-pixel text-[8px] font-bold text-zinc-950 mt-0.5">
            {language === 'vi' ? 'XOAY' : 'ROT'}
          </span>
        </button>

        <button
          type="button"
          onClick={hardDrop}
          className="pixel-btn bg-amber-300 active:bg-amber-400 border-2 border-zinc-900 py-3 flex flex-col items-center justify-center shadow-[2px_2px_0px_#000]"
          aria-label="Thả ngay"
        >
          <ChevronsDown className="w-4 h-4 text-zinc-950" />
          <span className="font-pixel text-[8px] font-bold text-zinc-950 mt-0.5">
            {language === 'vi' ? 'THẢ' : 'DROP'}
          </span>
        </button>

        <button
          type="button"
          onClick={handleHoldPiece}
          disabled={!canHold}
          className="pixel-btn bg-purple-200 active:bg-purple-300 border-2 border-zinc-900 py-3 flex flex-col items-center justify-center shadow-[2px_2px_0px_#000] disabled:opacity-40"
          aria-label="Giữ khối"
        >
          <Package className="w-4 h-4 text-zinc-950" />
          <span className="font-pixel text-[8px] font-bold text-zinc-950 mt-0.5">
            HOLD
          </span>
        </button>
      </div>

      {/* Gợi ý phím tắt Desktop */}
      <div className="hidden sm:flex items-center justify-center gap-3 text-[11px] font-mono text-zinc-600 pt-1">
        <span>←/→: {language === 'vi' ? 'Di chuyển' : 'Move'}</span>
        <span>•</span>
        <span>↑/W: {language === 'vi' ? 'Xoay' : 'Rotate'}</span>
        <span>•</span>
        <span>Space: {language === 'vi' ? 'Thả ngay' : 'Hard Drop'}</span>
        <span>•</span>
        <span>C/Shift: Hold</span>
      </div>
    </div>
  );
};
