'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  SudokuDifficulty,
  SudokuGrid,
  CellPosition,
  SudokuMove,
  SavedSudokuGame,
} from './types';
import { generateSudoku } from './generator';
import { findConflictingCells, isBoardComplete } from './validator';
import {
  saveSudokuGame,
  loadSudokuGame,
  clearSavedSudokuGame,
} from './storage';
import { SudokuBoard } from './SudokuBoard';
import { NumberPad } from './NumberPad';
import { SudokuControls } from './SudokuControls';
import { VictoryModal } from './VictoryModal';
import { GameOverModal } from './GameOverModal';
import { recordSudokuVictory } from './sudokuStatsService';
import { sounds } from '@/lib/sound/soundService';

export function SudokuGame() {
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('easy');
  const [initialBoard, setInitialBoard] = useState<SudokuGrid>(() =>
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );
  const [board, setBoard] = useState<SudokuGrid>(() =>
    Array.from({ length: 9 }, () => Array(9).fill(null))
  );
  const [solution, setSolution] = useState<number[][]>(() =>
    Array.from({ length: 9 }, () => Array(9).fill(0))
  );
  const [selectedCell, setSelectedCell] = useState<CellPosition | null>({
    row: 0,
    col: 0,
  });
  const [moveHistory, setMoveHistory] = useState<SudokuMove[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [mistakes, setMistakes] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [highlightErrors, setHighlightErrors] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Start a new game
  const startNewGame = useCallback((newDiff: SudokuDifficulty) => {
    const { puzzle, solution: solved } = generateSudoku(newDiff);
    setDifficulty(newDiff);
    setInitialBoard(puzzle);
    setBoard(puzzle.map((row) => [...row]));
    setSolution(solved);
    setSelectedCell({ row: 0, col: 0 });
    setMoveHistory([]);
    setElapsedSeconds(0);
    setMistakes(0);
    setIsPaused(false);
    setIsCompleted(false);
    setIsGameOver(false);
    setShowVictoryModal(false);

    clearSavedSudokuGame();
  }, []);

  // Initialize or load game on mount
  useEffect(() => {
    const saved = loadSudokuGame();
    if (saved && !saved.isCompleted && saved.initialBoard && saved.currentBoard) {
      setDifficulty(saved.difficulty);
      setInitialBoard(saved.initialBoard);
      setBoard(saved.currentBoard);
      setSolution(saved.solution);
      setElapsedSeconds(saved.elapsedSeconds);
      setMistakes(saved.mistakes || 0);
      setMoveHistory(saved.moveHistory || []);
      setIsCompleted(false);
      setIsGameOver(saved.isGameOver || false);
    } else {
      startNewGame('easy');
    }
    setIsInitialized(true);
  }, [startNewGame]);

  // Timer interval
  useEffect(() => {
    if (!isInitialized || isPaused || isCompleted || isGameOver) return;

    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isInitialized, isPaused, isCompleted, isGameOver]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!isInitialized || isCompleted) return;

    const gameData: SavedSudokuGame = {
      difficulty,
      initialBoard,
      currentBoard: board,
      solution,
      elapsedSeconds,
      mistakes,
      isCompleted,
      isGameOver,
      moveHistory,
    };
    saveSudokuGame(gameData);
  }, [
    isInitialized,
    difficulty,
    initialBoard,
    board,
    solution,
    elapsedSeconds,
    mistakes,
    isCompleted,
    isGameOver,
    moveHistory,
  ]);

  // Compute conflicting cells
  const conflictingCells = useMemo(() => {
    return findConflictingCells(board);
  }, [board]);

  // Check if a move creates a conflict
  const checkMoveConflict = useCallback(
    (row: number, col: number, num: number): boolean => {
      // 1. Direct row conflict
      for (let c = 0; c < 9; c++) {
        if (c !== col && board[row][c] === num) return true;
      }
      // 2. Direct column conflict
      for (let r = 0; r < 9; r++) {
        if (r !== row && board[r][col] === num) return true;
      }
      // 3. Direct 3x3 box conflict
      const startRow = Math.floor(row / 3) * 3;
      const startCol = Math.floor(col / 3) * 3;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const cr = startRow + r;
          const cc = startCol + c;
          if ((cr !== row || cc !== col) && board[cr][cc] === num) return true;
        }
      }
      // 4. Or does not match unique solution
      if (solution[row] && solution[row][col] !== 0 && solution[row][col] !== num) {
        return true;
      }
      return false;
    },
    [board, solution]
  );

  // Input a number into current selected cell
  const handleInputNumber = useCallback(
    (num: number) => {
      if (!selectedCell || isPaused || isCompleted || isGameOver) return;
      const { row, col } = selectedCell;

      // Cannot modify initial clue cells
      if (initialBoard[row]?.[col] !== null) return;

      const currentValue = board[row][col];
      if (currentValue === num) return; // No change

      const isConflict = checkMoveConflict(row, col, num);

      const newBoard = board.map((r) => [...r]);
      newBoard[row][col] = num;

      setMoveHistory((prev) => [
        ...prev,
        { row, col, prevValue: currentValue, newValue: num },
      ]);
      setBoard(newBoard);

      // Handle mistake tracking
      if (isConflict) {
        sounds.playError();
        const nextMistakes = mistakes + 1;
        setMistakes(nextMistakes);

        if (nextMistakes >= 3) {
          setIsGameOver(true);
          return;
        }
      } else {
        sounds.playClick();
      }

      // Check win condition
      if (isBoardComplete(newBoard, solution)) {
        sounds.playVictory();
        recordSudokuVictory(difficulty, elapsedSeconds);
        setIsCompleted(true);
        setShowVictoryModal(true);
        clearSavedSudokuGame();
      }
    },
    [
      selectedCell,
      isPaused,
      isCompleted,
      isGameOver,
      initialBoard,
      board,
      solution,
      mistakes,
      checkMoveConflict,
    ]
  );

  // Erase number in current selected cell
  const handleErase = useCallback(() => {
    if (!selectedCell || isPaused || isCompleted || isGameOver) return;
    const { row, col } = selectedCell;

    if (initialBoard[row]?.[col] !== null) return;

    const currentValue = board[row][col];
    if (currentValue === null) return;

    const newBoard = board.map((r) => [...r]);
    newBoard[row][col] = null;

    setMoveHistory((prev) => [
      ...prev,
      { row, col, prevValue: currentValue, newValue: null },
    ]);
    setBoard(newBoard);
    sounds.playClick();
  }, [selectedCell, isPaused, isCompleted, isGameOver, initialBoard, board]);

  // Undo last action
  const handleUndo = useCallback(() => {
    if (moveHistory.length === 0 || isPaused || isCompleted || isGameOver) return;

    const lastMove = moveHistory[moveHistory.length - 1];
    const newBoard = board.map((r) => [...r]);
    newBoard[lastMove.row][lastMove.col] = lastMove.prevValue;

    setBoard(newBoard);
    setSelectedCell({ row: lastMove.row, col: lastMove.col });
    setMoveHistory((prev) => prev.slice(0, -1));
    sounds.playClick();
  }, [moveHistory, isPaused, isCompleted, isGameOver, board]);

  // Reset current board to initial clues
  const handleReset = useCallback(() => {
    setBoard(initialBoard.map((row) => [...row]));
    setMoveHistory([]);
    setMistakes(0);
    setIsGameOver(false);
    setSelectedCell({ row: 0, col: 0 });
  }, [initialBoard]);

  // Request Reset with confirmation if game in progress
  const handleRequestReset = useCallback(() => {
    if (window.confirm('Bạn có chắc muốn chơi lại ván này từ đầu không?')) {
      handleReset();
    }
  }, [handleReset]);

  // Change difficulty
  const handleChangeDifficulty = useCallback(
    (newDiff: SudokuDifficulty) => {
      if (newDiff === difficulty) return;
      if (
        window.confirm(
          `Bắt đầu ván mới ở cấp độ ${
            newDiff === 'easy' ? 'Dễ' : newDiff === 'medium' ? 'Vừa' : 'Khó'
          }? Tiến độ ván hiện tại sẽ được thay thế.`
        )
      ) {
        startNewGame(newDiff);
      }
    },
    [difficulty, startNewGame]
  );

  // New game request
  const handleNewGame = useCallback(() => {
    startNewGame(difficulty);
  }, [startNewGame, difficulty]);

  // Keyboard navigation & inputs
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        handleInputNumber(parseInt(e.key, 10));
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleErase();
        return;
      }

      if (e.key === 'u' || e.key === 'U' || (e.ctrlKey && e.key === 'z')) {
        e.preventDefault();
        handleUndo();
        return;
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelectedCell((prev) => {
          if (!prev) return { row: 0, col: 0 };
          let { row, col } = prev;
          if (e.key === 'ArrowUp') row = Math.max(0, row - 1);
          if (e.key === 'ArrowDown') row = Math.min(8, row + 1);
          if (e.key === 'ArrowLeft') col = Math.max(0, col - 1);
          if (e.key === 'ArrowRight') col = Math.min(8, col + 1);
          return { row, col };
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleInputNumber, handleErase, handleUndo]);

  return (
    <div className="flex flex-col items-center justify-center">
      <SudokuControls
        difficulty={difficulty}
        elapsedSeconds={elapsedSeconds}
        mistakes={mistakes}
        isPaused={isPaused}
        highlightErrors={highlightErrors}
        onChangeDifficulty={handleChangeDifficulty}
        onTogglePause={() => setIsPaused((prev) => !prev)}
        onReset={handleRequestReset}
        onNewGame={handleNewGame}
        onToggleHighlightErrors={() => setHighlightErrors((prev) => !prev)}
      />

      <SudokuBoard
        board={board}
        initialBoard={initialBoard}
        selectedCell={selectedCell}
        conflictingCells={conflictingCells}
        highlightErrors={highlightErrors}
        isPaused={isPaused}
        onSelectCell={(pos) => setSelectedCell(pos)}
      />

      <NumberPad
        board={board}
        onInputNumber={handleInputNumber}
        onErase={handleErase}
        onUndo={handleUndo}
        canUndo={moveHistory.length > 0}
        disabled={isPaused || isCompleted || isGameOver}
      />

      {/* Victory modal */}
      <VictoryModal
        isOpen={showVictoryModal}
        difficulty={difficulty}
        elapsedSeconds={elapsedSeconds}
        onPlayAgain={handleNewGame}
        onClose={() => setShowVictoryModal(false)}
      />

      {/* Game Over Modal (3 mistakes) */}
      <GameOverModal
        isOpen={isGameOver}
        onReset={handleReset}
        onNewGame={handleNewGame}
      />
    </div>
  );
}
