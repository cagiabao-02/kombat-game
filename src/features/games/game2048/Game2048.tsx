'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Tile,
  Direction,
  initGameTiles,
  moveTiles,
  tilesToGrid,
  isGameOver,
  hasReached2048,
  getMaxTile,
} from './game2048Logic';
import {
  getGame2048Stats,
  recordGame2048Finish,
  Game2048Stats,
} from './game2048StatsService';
import { Game2048Board } from './Game2048Board';
import { Game2048Controls } from './Game2048Controls';
import { Game2048VictoryModal } from './Game2048VictoryModal';
import { Game2048OverModal } from './Game2048OverModal';
import { sounds } from '@/lib/sound/soundService';

export function Game2048() {
  const [initialData] = useState(() => initGameTiles());
  const [tiles, setTiles] = useState<Tile[]>(initialData.tiles);
  const [score, setScore] = useState<number>(initialData.score);
  const [nextId, setNextId] = useState<number>(initialData.nextId);
  const [stats, setStats] = useState<Game2048Stats>(() => getGame2048Stats());

  // 1-step Undo Buffer
  const [previousState, setPreviousState] = useState<{
    tiles: Tile[];
    score: number;
    nextId: number;
  } | null>(null);

  // Modals & Milestones
  const [hasCelebratedWin, setHasCelebratedWin] = useState<boolean>(false);
  const [isVictoryModalOpen, setIsVictoryModalOpen] = useState<boolean>(false);
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);

  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync latest stats on mount
  useEffect(() => {
    setStats(getGame2048Stats());
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  const handleRestart = useCallback(() => {
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    const fresh = initGameTiles();
    setTiles(fresh.tiles);
    setScore(fresh.score);
    setNextId(fresh.nextId);
    setPreviousState(null);
    setHasCelebratedWin(false);
    setIsVictoryModalOpen(false);
    setIsGameOverModalOpen(false);
    setIsNewHighScore(false);
    setStats(getGame2048Stats());
  }, []);

  const handleUndo = useCallback(() => {
    if (!previousState) return;
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    setTiles(previousState.tiles);
    setScore(previousState.score);
    setNextId(previousState.nextId);
    setPreviousState(null);
    sounds.play2048Slide();
  }, [previousState]);

  const handleMove = useCallback(
    (direction: Direction) => {
      if (isGameOverModalOpen) return;

      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }

      const result = moveTiles(tiles, direction, nextId);
      if (!result.moved) {
        // Nước đi không hợp lệ / không thay đổi bàn cờ
        return;
      }

      // Lưu trạng thái trước nước đi để phục vụ Undo 1 bước
      setPreviousState({
        tiles: tiles.filter((t) => !t.isDeleted),
        score,
        nextId,
      });

      // Âm thanh chiptune
      if (result.maxMergedValue > 0) {
        sounds.play2048Merge(result.maxMergedValue);
      } else {
        sounds.play2048Slide();
      }

      const nextScore = score + result.scoreGained;
      const nextGrid = tilesToGrid(result.tiles);
      const maxTileValue = getMaxTile(nextGrid);

      setTiles(result.tiles);
      setScore(nextScore);
      setNextId(result.nextId);

      // Sau khi animation trượt kết thúc (115ms), dọn dẹp các ô đã bị gộp/xóa
      cleanupTimeoutRef.current = setTimeout(() => {
        setTiles((prev) => prev.filter((t) => !t.isDeleted));
      }, 115);

      // Cập nhật High Score tức thời nếu vượt qua
      if (nextScore > stats.highScore) {
        setStats((prev) => ({ ...prev, highScore: nextScore }));
      }

      // Kiểm tra mốc chiến thắng 2048 (chỉ chúc mừng 1 lần đầu tiên trong ván)
      if (!hasCelebratedWin && hasReached2048(nextGrid)) {
        setHasCelebratedWin(true);
        setIsVictoryModalOpen(true);
        sounds.play2048Win();
      }

      // Kiểm tra Game Over (không còn nước đi hợp lệ)
      if (isGameOver(nextGrid)) {
        const record = recordGame2048Finish(nextScore, maxTileValue);
        setIsNewHighScore(record.isNewHighScore);
        setStats(record.stats);
        setIsGameOverModalOpen(true);
      }
    },
    [tiles, nextId, score, stats.highScore, hasCelebratedWin, isGameOverModalOpen]
  );

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang gõ trong input/textarea
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      let handled = false;

      switch (e.code) {
        case 'ArrowUp':
        case 'KeyW':
          handleMove('UP');
          handled = true;
          break;
        case 'ArrowDown':
        case 'KeyS':
          handleMove('DOWN');
          handled = true;
          break;
        case 'ArrowLeft':
        case 'KeyA':
          handleMove('LEFT');
          handled = true;
          break;
        case 'ArrowRight':
        case 'KeyD':
          handleMove('RIGHT');
          handled = true;
          break;
        case 'KeyZ':
        case 'KeyU':
          handleUndo();
          handled = true;
          break;
        default:
          break;
      }

      if (handled) {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleMove, handleUndo]);

  const currentGrid = tilesToGrid(tiles);
  const currentMaxTile = getMaxTile(currentGrid);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-2">
      {/* 2048 Board with Smooth Sliding Animation */}
      <Game2048Board
        tiles={tiles}
        onMove={handleMove}
        disabled={isGameOverModalOpen || isVictoryModalOpen}
      />

      {/* Control Panel */}
      <Game2048Controls
        score={score}
        highScore={Math.max(score, stats.highScore)}
        maxTile={currentMaxTile}
        canUndo={previousState !== null}
        onUndo={handleUndo}
        onRestart={handleRestart}
        onMove={handleMove}
        disabled={isGameOverModalOpen || isVictoryModalOpen}
      />

      {/* Victory Celebration Modal */}
      <Game2048VictoryModal
        isOpen={isVictoryModalOpen}
        score={score}
        maxTile={currentMaxTile}
        onContinue={() => setIsVictoryModalOpen(false)}
        onRestart={handleRestart}
      />

      {/* Game Over Modal */}
      <Game2048OverModal
        isOpen={isGameOverModalOpen}
        score={score}
        highScore={stats.highScore}
        maxTile={currentMaxTile}
        isNewHighScore={isNewHighScore}
        onRestart={handleRestart}
      />
    </div>
  );
}
