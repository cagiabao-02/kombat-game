'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  SnakeState,
  Direction,
  getInitialSnakeState,
  stepSnake,
  changeDirection,
  calculateSpeed,
} from './snakeLogic';
import { SnakeBoard } from './SnakeBoard';
import { SnakeControls } from './SnakeControls';
import { GameOverModal } from './GameOverModal';
import { getSnakeStats, recordSnakeGameResult, SnakeRecordResult } from './snakeStatsService';
import { sounds } from '@/lib/sound/soundService';

export function SnakeGame() {
  const [state, setState] = useState<SnakeState>(getInitialSnakeState);
  const [highScore, setHighScore] = useState<number>(() => getSnakeStats().highScore);
  const [recordInfo, setRecordInfo] = useState<SnakeRecordResult | null>(null);

  const stateRef = useRef(state);
  stateRef.current = state;

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Khởi động lại ván chơi
  const handleRestart = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    const fresh = getInitialSnakeState();
    setState(fresh);
    setRecordInfo(null);
    sounds.playClick();
  }, []);

  // Đổi hướng
  const handleChangeDirection = useCallback((dir: Direction) => {
    setState((prev) => changeDirection(prev, dir));
  }, []);

  // Tạm dừng / Tiếp tục
  const handleTogglePause = useCallback(() => {
    setState((prev) => {
      if (prev.isGameOver) return prev;
      sounds.playClick();
      return { ...prev, isPaused: !prev.isPaused };
    });
  }, []);

  // Game Loop chính
  useEffect(() => {
    if (state.isGameOver || state.isPaused) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const currentSpeed = calculateSpeed(state.score);

    timerRef.current = setTimeout(() => {
      const { state: nextState, ateFood, died } = stepSnake(stateRef.current);

      if (died) {
        sounds.playSnakeDie();
        const rec = recordSnakeGameResult(nextState.score, nextState.applesEaten);
        setRecordInfo(rec);
        if (rec.isNewHighScore) {
          sounds.playVictory();
          setHighScore(rec.stats.highScore);
        }
      } else if (ateFood === 'golden') {
        sounds.playSnakeGolden();
      } else if (ateFood === 'normal') {
        sounds.playSnakeEat();
      }

      setState(nextState);
    }, currentSpeed);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [state.isGameOver, state.isPaused, state.score, state.snake, state.direction, state.directionQueue]);

  // Lắng nghe bàn phím Desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          handleChangeDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          handleChangeDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          handleChangeDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          handleChangeDirection('RIGHT');
          break;
        case ' ':
        case 'p':
        case 'P':
          handleTogglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleChangeDirection, handleTogglePause]);

  return (
    <div className="flex flex-col items-center justify-center w-full px-2">
      <SnakeBoard state={state} onSwipeDirection={handleChangeDirection} />

      <SnakeControls
        score={state.score}
        highScore={highScore}
        applesEaten={state.applesEaten}
        isPaused={state.isPaused}
        isGameOver={state.isGameOver}
        onTogglePause={handleTogglePause}
        onRestart={handleRestart}
        onChangeDirection={handleChangeDirection}
      />

      {/* Modal Game Over / Record Breaker */}
      <GameOverModal
        isOpen={state.isGameOver}
        score={state.score}
        highScore={highScore}
        applesEaten={state.applesEaten}
        isNewHighScore={recordInfo?.isNewHighScore ?? false}
        prevHighScore={recordInfo?.prevHighScore ?? highScore}
        onPlayAgain={handleRestart}
      />
    </div>
  );
}
