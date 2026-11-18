'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BoardGrid, TraySlot, ShapeCell } from './types';
import {
  createEmptyBoard,
  canPlaceShape,
  placeShapeOnBoard,
  checkLinesToClear,
  clearLinesFromBoard,
  calculateMoveScore,
  hasAnyValidMove,
  generateSolvableTray,
  BOARD_SIZE,
} from './blockBlastLogic';
import {
  loadBlockBlastActiveState,
  saveBlockBlastActiveState,
  clearBlockBlastActiveState,
} from './blockBlastStorage';
import {
  getBlockBlastStats,
  recordBlockBlastFinish,
} from './blockBlastStatsService';
import { sounds } from '@/lib/sound/soundService';
import { BlockBlastBoard } from './BlockBlastBoard';
import { BlockBlastTray } from './BlockBlastTray';
import { BlockBlastScoreBar } from './BlockBlastScoreBar';
import { BlockBlastGameOverModal } from './BlockBlastGameOverModal';

export const BlockBlastGame: React.FC = () => {
  // 1. Game State
  const [board, setBoard] = useState<BoardGrid>(() => createEmptyBoard());
  const [tray, setTray] = useState<TraySlot[]>([]);
  const [score, setScore] = useState<number>(0);
  const [comboStreak, setComboStreak] = useState<number>(0);
  const [linesCleared, setLinesCleared] = useState<number>(0);
  const [maxComboInGame, setMaxComboInGame] = useState<number>(0);

  // Stats & Modals
  const [highScore, setHighScore] = useState<number>(0);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  // Interaction State (Tap or Drag)
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [draggingSlot, setDraggingSlot] = useState<TraySlot | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [isTouchDrag, setIsTouchDrag] = useState<boolean>(false);

  // Ghost Preview State
  const [ghostCells, setGhostCells] = useState<ShapeCell[]>([]);
  const [ghostValid, setGhostValid] = useState<boolean>(false);
  const [ghostColor, setGhostColor] = useState<string>('#3b82f6');
  const [previewClearingCoords, setPreviewClearingCoords] = useState<Set<string>>(new Set());

  // Animation State
  const [clearingCoords, setClearingCoords] = useState<Set<string>>(new Set());
  const [comboBanner, setComboBanner] = useState<{ text: string; points: number; combo: number } | null>(null);
  const comboBannerTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Refs để hit-testing và xử lý drag mượt mà không delay
  const gridRef = useRef<HTMLDivElement>(null);
  const draggingSlotRef = useRef<TraySlot | null>(null);
  const ghostTargetRef = useRef<{ r: number; c: number } | null>(null);
  const ghostValidRef = useRef<boolean>(false);

  // 2. Khởi tạo: Đọc saved active state hoặc tạo ván mới
  useEffect(() => {
    const stats = getBlockBlastStats();
    setHighScore(stats.highScore);

    const saved = loadBlockBlastActiveState();
    if (saved) {
      setBoard(saved.board);
      setTray(saved.tray);
      setScore(saved.score);
      setComboStreak(saved.comboStreak);
      setLinesCleared(saved.linesCleared);
    } else {
      const initialBoard = createEmptyBoard();
      setBoard(initialBoard);
      const initialTray = generateSolvableTray(initialBoard);
      setTray(initialTray);
    }
  }, []);

  // 3. Tự động lưu trạng thái khi có thay đổi (Auto-save)
  useEffect(() => {
    if (tray.length === 3 && !isGameOver) {
      saveBlockBlastActiveState({
        board,
        tray,
        score,
        comboStreak,
        linesCleared,
        lastUpdated: Date.now(),
      });
    }
  }, [board, tray, score, comboStreak, linesCleared, isGameOver]);

  // Tìm slot đang được chọn
  const activeSlot = tray.find((s) => s.id === (draggingSlot?.id || selectedSlotId));

  // 4. Tính toán Ghost Cells khi rê vào ô bàn cờ (startR, startC)
  const updateGhostPreview = useCallback(
    (startR: number, startC: number, slot: TraySlot) => {
      const isValid = canPlaceShape(board, slot.shape, startR, startC);

      // Nếu không thể đặt được tại vị trí này: không hiển thị bất kỳ bóng đen nào
      if (!isValid) {
        ghostTargetRef.current = null;
        ghostValidRef.current = false;
        setGhostCells([]);
        setGhostValid(false);
        setPreviewClearingCoords(new Set());
        return;
      }

      const { matrix, color } = slot.shape;
      const cells: ShapeCell[] = [];

      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] === 1) {
            cells.push({ r: startR + r, c: startC + c });
          }
        }
      }

      ghostTargetRef.current = { r: startR, c: startC };
      ghostValidRef.current = true;
      setGhostCells(cells);
      setGhostValid(true);
      setGhostColor(color);

      // Kiểm tra xem vị trí đặt này có kích hoạt nổ hàng / cột nào không để phát sáng 8 ô
      const tempBoard = placeShapeOnBoard(board, slot.shape, startR, startC);
      const clearInfo = checkLinesToClear(tempBoard);
      if (clearInfo.totalLines > 0) {
        const coordsSet = new Set<string>();
        for (const c of clearInfo.clearedCellCoords) {
          coordsSet.add(`${c.r},${c.c}`);
        }
        setPreviewClearingCoords(coordsSet);
      } else {
        setPreviewClearingCoords(new Set());
      }
    },
    [board]
  );

  const clearGhostPreview = useCallback(() => {
    ghostTargetRef.current = null;
    ghostValidRef.current = false;
    setGhostCells([]);
    setGhostValid(false);
    setPreviewClearingCoords(new Set());
  }, []);

  // 5. Logic Đặt Khối (Core Placement Logic)
  const handlePlacePiece = useCallback(
    (slot: TraySlot, startR: number, startC: number) => {
      if (!canPlaceShape(board, slot.shape, startR, startC)) {
        return false;
      }

      sounds.playBlockPlace();

      // Đặt khối vào bàn cờ
      const newBoard = placeShapeOnBoard(board, slot.shape, startR, startC);

      // Đánh dấu slot đã dùng
      const nextTray = tray.map((s) => (s.id === slot.id ? { ...s, used: true } : s));

      // Kiểm tra xem có hàng / cột nào nổ không
      const clearInfo = checkLinesToClear(newBoard);

      // Tính điểm
      const { earnedScore, nextCombo } = calculateMoveScore(
        slot.shape.cellsCount,
        clearInfo.totalLines,
        comboStreak
      );

      const nextScore = score + earnedScore;
      setScore(nextScore);
      setComboStreak(nextCombo);
      setMaxComboInGame((prev) => Math.max(prev, nextCombo));

      // Reset selection
      setSelectedSlotId(null);
      setDraggingSlot(null);
      setDragPosition(null);
      clearGhostPreview();

      if (clearInfo.totalLines > 0) {
        // Có hàng nổ! Kích hoạt animation & âm thanh
        const coordsSet = new Set(clearInfo.clearedCellCoords.map((c) => `${c.r},${c.c}`));
        setClearingCoords(coordsSet);

        // Hiển thị Floating Combo Banner nếu đạt Combo >= 2
        if (nextCombo >= 2) {
          if (comboBannerTimerRef.current) clearTimeout(comboBannerTimerRef.current);
          const bannerTitle =
            nextCombo === 2
              ? 'COMBO x2!'
              : nextCombo === 3
              ? 'SUPER COMBO x3!'
              : nextCombo === 4
              ? 'MEGA COMBO x4!'
              : nextCombo === 5
              ? 'ULTRA COMBO x5!'
              : `UNSTOPPABLE x${nextCombo}!`;

          setComboBanner({
            text: bannerTitle,
            points: earnedScore,
            combo: nextCombo,
          });

          comboBannerTimerRef.current = setTimeout(() => {
            setComboBanner(null);
          }, 1200);
        }

        if (nextCombo >= 4 || clearInfo.totalLines >= 2) {
          sounds.playBlockComboFanfare();
        } else {
          sounds.playBlockClearLine(nextCombo);
        }

        setTimeout(() => {
          const clearedBoard = clearLinesFromBoard(newBoard, clearInfo.clearedCellCoords);
          setBoard(clearedBoard);
          setClearingCoords(new Set());
          setLinesCleared((prev) => prev + clearInfo.totalLines);

          // Kiểm tra tiếp: nếu cả 3 slot đều đã dùng hết -> Sinh 3 slot mới có đường sống
          handlePostMoveCheck(clearedBoard, nextTray, nextScore);
        }, 250);
      } else {
        setBoard(newBoard);
        handlePostMoveCheck(newBoard, nextTray, nextScore);
      }

      return true;
    },
    [board, tray, score, comboStreak, clearGhostPreview]
  );

  // 6. Kiểm tra sau mỗi nước đi: Chia bài mới hoặc Game Over
  const handlePostMoveCheck = (
    currentBoard: BoardGrid,
    currentTray: TraySlot[],
    currentScore: number
  ) => {
    let activeTray = currentTray;

    // Nếu cả 3 slot đều đã được đặt -> Chia 3 slot mới với thuật toán Solvable RNG
    if (activeTray.every((s) => s.used)) {
      activeTray = generateSolvableTray(currentBoard);
      setTray(activeTray);
    } else {
      setTray(activeTray);
    }

    // Kiểm tra xem còn nước đi hợp lệ nào không
    const canMove = hasAnyValidMove(currentBoard, activeTray);
    if (!canMove) {
      // HẾT NƯỚC ĐI -> GAME OVER
      sounds.playBlockGameOver();
      setIsGameOver(true);
      clearBlockBlastActiveState();

      const { isNewHighScore: isNewRecord, stats } = recordBlockBlastFinish(
        currentScore,
        linesCleared,
        maxComboInGame
      );
      setIsNewHighScore(isNewRecord);
      setHighScore(stats.highScore);
    }
  };

  // 7. Thao tác Click / Tap ô trên bàn cờ
  const handleCellClick = (r: number, col: number) => {
    if (activeSlot) {
      handlePlacePiece(activeSlot, r, col);
    }
  };

  const handleCellMouseEnter = (r: number, col: number) => {
    if (selectedSlotId) {
      const slot = tray.find((s) => s.id === selectedSlotId);
      if (slot) {
        updateGhostPreview(r, col, slot);
      }
    }
  };

  // 8. Chọn slot từ khay (Tap to select)
  const handleSelectSlot = (slot: TraySlot) => {
    if (slot.used) return;
    if (selectedSlotId === slot.id) {
      setSelectedSlotId(null);
      clearGhostPreview();
    } else {
      sounds.playBlockPickup();
      setSelectedSlotId(slot.id);
    }
  };

  // 9. Bắt đầu Kéo khối (Chuột hoặc Cảm ứng)
  const handleDragStartPiece = (slot: TraySlot, clientX: number, clientY: number, isTouch: boolean) => {
    if (slot.used) return;
    sounds.playBlockPickup();
    setDraggingSlot(slot);
    draggingSlotRef.current = slot;
    setIsTouchDrag(isTouch);
    setDragPosition({ x: clientX, y: clientY });
    setSelectedSlotId(slot.id);
  };

  // 10. Lắng nghe chuyển động kéo toàn cục trên Window (chuột di chuyển & tay vuốt)
  useEffect(() => {
    if (!draggingSlot) return;

    const handlePointerMove = (e: PointerEvent) => {
      setDragPosition({ x: e.clientX, y: e.clientY });

      // Tọa độ mục tiêu cần kiểm tra trên bàn cờ
      // Trên mobile touch: nâng khối lên 75px phía trên ngón tay để ngón tay không che tầm nhìn
      // Trên PC mouse: tâm khối nằm chính xác theo con trỏ chuột
      const targetX = e.clientX;
      const targetY = isTouchDrag ? e.clientY - 75 : e.clientY;

      const gridEl = gridRef.current;
      if (gridEl) {
        const rect = gridEl.getBoundingClientRect();
        // Cho phép dung sai 24px viền ngoài bàn cờ để dễ đặt sát mép
        if (
          targetX >= rect.left - 24 &&
          targetX <= rect.right + 24 &&
          targetY >= rect.top - 24 &&
          targetY <= rect.bottom + 24
        ) {
          const cellW = rect.width / BOARD_SIZE;
          const cellH = rect.height / BOARD_SIZE;

          const hoverCol = Math.floor((targetX - rect.left) / cellW);
          const hoverRow = Math.floor((targetY - rect.top) / cellH);

          const shapeRows = draggingSlot.shape.matrix.length;
          const shapeCols = draggingSlot.shape.matrix[0].length;

          // Canh tâm hình khối tương ứng với vị trí ngón tay / con trỏ chuột
          const startR = Math.max(
            0,
            Math.min(BOARD_SIZE - shapeRows, Math.round(hoverRow - shapeRows / 2))
          );
          const startC = Math.max(
            0,
            Math.min(BOARD_SIZE - shapeCols, Math.round(hoverCol - shapeCols / 2))
          );

          updateGhostPreview(startR, startC, draggingSlot);
          return;
        }
      }

      clearGhostPreview();
    };

    const handlePointerUp = () => {
      if (ghostValidRef.current && ghostTargetRef.current && draggingSlotRef.current) {
        handlePlacePiece(
          draggingSlotRef.current,
          ghostTargetRef.current.r,
          ghostTargetRef.current.c
        );
      }
      setDraggingSlot(null);
      draggingSlotRef.current = null;
      setDragPosition(null);
      clearGhostPreview();
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
    };
  }, [draggingSlot, isTouchDrag, updateGhostPreview, clearGhostPreview, handlePlacePiece]);

  // Chơi lại ván mới
  const handleResetGame = () => {
    if (score > 0 && !isGameOver) {
      const confirmReset = window.confirm(
        'Bạn có chắc chắn muốn bỏ ván hiện tại để bắt đầu lại ván mới không?'
      );
      if (!confirmReset) return;
    }
    clearBlockBlastActiveState();
    const newBoard = createEmptyBoard();
    setBoard(newBoard);
    setTray(generateSolvableTray(newBoard));
    setScore(0);
    setComboStreak(0);
    setLinesCleared(0);
    setMaxComboInGame(0);
    setIsGameOver(false);
    setIsNewHighScore(false);
    setSelectedSlotId(null);
    clearGhostPreview();
  };

  return (
    <div className="relative min-h-[calc(100vh-60px)] flex flex-col items-center justify-between p-3 sm:p-4 max-w-lg mx-auto select-none">
      {/* 1. Header & Score Bar */}
      <BlockBlastScoreBar
        score={score}
        highScore={highScore}
        comboStreak={comboStreak}
        onResetGame={handleResetGame}
      />

      {/* 2. Board Container 8x8 */}
      <div className="my-auto py-2 relative">
        <BlockBlastBoard
          board={board}
          ghostCells={ghostCells}
          ghostValid={ghostValid}
          ghostColor={ghostColor}
          clearingCoords={clearingCoords}
          previewClearingCoords={previewClearingCoords}
          gridRef={gridRef}
          onCellClick={handleCellClick}
          onCellMouseEnter={handleCellMouseEnter}
        />

        {/* Floating Combo Popup khi đạt chuỗi Combo */}
        {comboBanner && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30 animate-in zoom-in-75 fade-in duration-150">
            <div
              className={`px-4 py-2 border-4 border-black shadow-[6px_6px_0px_#000] text-center transform -rotate-2 animate-bounce ${
                comboBanner.combo >= 5
                  ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-yellow-200 ring-4 ring-yellow-400'
                  : comboBanner.combo >= 4
                  ? 'bg-gradient-to-r from-rose-600 to-amber-500 text-white ring-2 ring-yellow-300'
                  : 'bg-amber-400 text-zinc-950'
              }`}
            >
              <div className="font-pixel text-lg sm:text-2xl font-black uppercase tracking-wider drop-shadow-[2px_2px_0px_#000]">
                {comboBanner.text}
              </div>
              <div className="font-mono text-xs sm:text-sm font-bold text-white drop-shadow-[1px_1px_0px_#000] mt-0.5">
                +{comboBanner.points} Điểm!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. Piece Tray (Khay 3 khối) */}
      <BlockBlastTray
        tray={tray}
        selectedSlotId={selectedSlotId}
        draggingSlotId={draggingSlot?.id}
        onSelectSlot={handleSelectSlot}
        onDragStartPiece={handleDragStartPiece}
      />

      {/* 4. Khối đang bay theo ngón tay / con trỏ chuột khi Drag */}
      {draggingSlot && dragPosition && (
        <div
          className="fixed pointer-events-none z-50 select-none touch-none transition-none"
          style={{
            left: `${dragPosition.x}px`,
            top: `${isTouchDrag ? dragPosition.y - 75 : dragPosition.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className="grid gap-0.5 sm:gap-1 drop-shadow-[0_12px_24px_rgba(0,0,0,0.65)]"
            style={{
              gridTemplateColumns: `repeat(${draggingSlot.shape.matrix[0].length}, minmax(0, 1fr))`,
            }}
          >
            {draggingSlot.shape.matrix.map((rowArr, r) =>
              rowArr.map((val, c) => (
                <div
                  key={`${r}-${c}`}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-sm"
                  style={{
                    backgroundColor: val === 1 ? draggingSlot.shape.color : 'transparent',
                    boxShadow:
                      val === 1
                        ? 'inset 2px 2px 0px rgba(255,255,255,0.6), inset -2px -2px 0px rgba(0,0,0,0.5)'
                        : 'none',
                    border: val === 1 ? `2px solid ${draggingSlot.shape.borderColor}` : 'none',
                  }}
                />
              ))
            )}
          </div>
        </div>
      )}

      {/* 5. Modal Game Over */}
      <BlockBlastGameOverModal
        isOpen={isGameOver}
        score={score}
        highScore={highScore}
        isNewHighScore={isNewHighScore}
        linesCleared={linesCleared}
        maxCombo={maxComboInGame}
        onRestart={handleResetGame}
      />
    </div>
  );
};
