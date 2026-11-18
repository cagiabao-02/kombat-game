'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardSize,
  GoAiDifficulty,
  GoColor,
  GoGameMode,
  GoGameState,
  Point,
  TerritoryScore,
} from './types';
import {
  calculateTerritory,
  createEmptyBoard,
  playMove,
} from './goLogic';
import { getBestGoMove } from './goBot';
import { clearGoState, loadGoState, saveGoState } from './goStorage';
import { recordGoGameResult } from './goStatsService';
import { sounds } from '@/lib/sound/soundService';
import { GoBoardComponent } from './GoBoard';
import { GoScoreBar } from './GoScoreBar';
import { GoGameOverModal } from './GoGameOverModal';
import { GoLobby } from './GoLobby';

export const GoGame: React.FC = () => {
  // Trạng thái sảnh / Đang chơi
  const [inLobby, setInLobby] = useState(true);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Cấu hình ván đấu
  const [boardSize, setBoardSize] = useState<BoardSize>(9);
  const [mode, setMode] = useState<GoGameMode>('ai');
  const [aiDifficulty, setAiDifficulty] = useState<GoAiDifficulty>('easy');
  const [playerColor, setPlayerColor] = useState<GoColor>('black');

  // Trạng thái ván đấu
  const [board, setBoard] = useState(createEmptyBoard(9));
  const [currentTurn, setCurrentTurn] = useState<GoColor>('black');
  const [captures, setCaptures] = useState({ black: 0, white: 0 });
  const [koPoint, setKoPoint] = useState<Point | null>(null);
  const [consecutivePasses, setConsecutivePasses] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [winner, setWinner] = useState<GoColor | null>(null);
  const [resignedBy, setResignedBy] = useState<GoColor | null>(null);
  const [score, setScore] = useState<TerritoryScore | null>(null);
  const [lastMove, setLastMove] = useState<Point | null>(null);

  // Thao tác giao diện
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Ref chống stale closure trong setTimeout
  const gameStateRef = useRef({
    board,
    boardSize,
    currentTurn,
    captures,
    koPoint,
    consecutivePasses,
    isGameOver,
    mode,
    aiDifficulty,
    playerColor,
    lastMove,
  });

  useEffect(() => {
    gameStateRef.current = {
      board,
      boardSize,
      currentTurn,
      captures,
      koPoint,
      consecutivePasses,
      isGameOver,
      mode,
      aiDifficulty,
      playerColor,
      lastMove,
    };
  }, [
    board,
    boardSize,
    currentTurn,
    captures,
    koPoint,
    consecutivePasses,
    isGameOver,
    mode,
    aiDifficulty,
    playerColor,
    lastMove,
  ]);

  // Kiểm tra ván cờ đã lưu khi khởi động
  useEffect(() => {
    const saved = loadGoState();
    if (saved && !saved.isGameOver) {
      setHasSavedGame(true);
    }
  }, []);

  // Bắt đầu ván mới từ sảnh
  const handleStartNewGame = (config: {
    boardSize: BoardSize;
    mode: GoGameMode;
    aiDifficulty: GoAiDifficulty;
    playerColor: GoColor;
  }) => {
    const newBoard = createEmptyBoard(config.boardSize);
    setBoardSize(config.boardSize);
    setMode(config.mode);
    setAiDifficulty(config.aiDifficulty);
    setPlayerColor(config.playerColor);

    setBoard(newBoard);
    setCurrentTurn('black');
    setCaptures({ black: 0, white: 0 });
    setKoPoint(null);
    setConsecutivePasses(0);
    setIsGameOver(false);
    setWinner(null);
    setResignedBy(null);
    setScore(null);
    setLastMove(null);
    setSelectedPoint(null);
    setIsAiThinking(false);
    setInLobby(false);

    clearGoState();
  };

  // Khôi phục ván đang dở
  const handleResumeSavedGame = () => {
    const saved = loadGoState();
    if (saved) {
      setBoardSize(saved.boardSize);
      setBoard(saved.board);
      setCurrentTurn(saved.currentTurn);
      setCaptures(saved.captures);
      setKoPoint(saved.koPoint);
      setConsecutivePasses(saved.consecutivePasses);
      setIsGameOver(saved.isGameOver);
      setWinner(saved.winner);
      setScore(saved.score);
      setMode(saved.mode);
      setAiDifficulty(saved.aiDifficulty);
      setPlayerColor(saved.playerColor);
      setLastMove(saved.lastMove);
      setSelectedPoint(null);
      setIsAiThinking(false);
      setInLobby(false);
    }
  };

  // Kết thúc ván cờ & tính điểm
  const finishGameWithScoring = useCallback(
    (curBoard: typeof board, curCaptures: typeof captures) => {
      const territoryScore = calculateTerritory(curBoard, curCaptures, 6.5);
      setScore(territoryScore);
      setWinner(territoryScore.winner);
      setIsGameOver(true);
      clearGoState();

      if (territoryScore.winner === playerColor) {
        sounds.playVictory();
      } else {
        sounds.playDefeat();
      }

      recordGoGameResult(
        mode,
        territoryScore.winner === playerColor ? 'win' : 'loss',
        curCaptures.black
      );
    },
    [mode, playerColor]
  );

  // Xử lý thực hiện 1 nước đi đặt cờ
  const executeMove = useCallback(
    (p: Point, turn: GoColor) => {
      const {
        board: curBoard,
        captures: curCaptures,
        koPoint: curKo,
        boardSize: curSize,
      } = gameStateRef.current;

      const result = playMove(curBoard, p, turn, curKo);
      if (!result.valid) return false;

      // Cập nhật số tù binh
      const newCaptures = { ...curCaptures };
      if (result.captures.length > 0) {
        if (turn === 'black') {
          newCaptures.black += result.captures.length;
        } else {
          newCaptures.white += result.captures.length;
        }
        sounds.playGoStoneCapture();
      } else {
        sounds.playGoStonePlace();
      }

      const nextTurn: GoColor = turn === 'black' ? 'white' : 'black';

      setBoard(result.newBoard);
      setCaptures(newCaptures);
      setKoPoint(result.newKoPoint);
      setConsecutivePasses(0); // Đặt cờ sẽ reset bộ đếm bỏ lượt
      setLastMove(p);
      setSelectedPoint(null);
      setCurrentTurn(nextTurn);

      // Lưu trạng thái ván cờ
      const nextState: GoGameState = {
        boardSize: curSize,
        board: result.newBoard,
        currentTurn: nextTurn,
        captures: newCaptures,
        koPoint: result.newKoPoint,
        consecutivePasses: 0,
        isGameOver: false,
        winner: null,
        score: null,
        mode,
        aiDifficulty,
        playerColor,
        lastMove: p,
        moveHistory: [],
      };
      saveGoState(nextState);

      return true;
    },
    [aiDifficulty, mode, playerColor]
  );

  // Xử lý Bỏ lượt (Pass)
  const handlePass = useCallback(() => {
    if (isGameOver || isAiThinking) return;

    sounds.playMove();
    setSelectedPoint(null);

    const nextPassCount = consecutivePasses + 1;
    setConsecutivePasses(nextPassCount);

    // 2 lần Bỏ lượt liên tiếp -> Kết thúc ván cờ và tính điểm đất
    if (nextPassCount >= 2) {
      finishGameWithScoring(board, captures);
      return;
    }

    const nextTurn: GoColor = currentTurn === 'black' ? 'white' : 'black';
    setCurrentTurn(nextTurn);

    // Cập nhật lưu trữ
    const nextState: GoGameState = {
      ...gameStateRef.current,
      currentTurn: nextTurn,
      consecutivePasses: nextPassCount,
      winner: null,
      score: null,
      moveHistory: [],
    };
    saveGoState(nextState);
  }, [
    board,
    captures,
    consecutivePasses,
    currentTurn,
    finishGameWithScoring,
    isAiThinking,
    isGameOver,
  ]);

  // Xử lý Xin thua (Resign)
  const handleResign = () => {
    if (isGameOver || isAiThinking) return;

    const resignWinner: GoColor = currentTurn === 'black' ? 'white' : 'black';
    setResignedBy(currentTurn);
    setWinner(resignWinner);
    setIsGameOver(true);
    clearGoState();

    sounds.playDefeat();
    recordGoGameResult(mode, 'loss', captures.black);
  };

  // Bot AI tự động đánh khi đến lượt
  useEffect(() => {
    if (
      inLobby ||
      isGameOver ||
      mode !== 'ai' ||
      currentTurn === playerColor
    ) {
      return;
    }

    setIsAiThinking(true);
    const botTimer = setTimeout(() => {
      const {
        board: curBoard,
        currentTurn: curTurn,
        koPoint: curKo,
        aiDifficulty: curDiff,
      } = gameStateRef.current;

      const botMove = getBestGoMove(curBoard, curTurn, curKo, curDiff);

      setIsAiThinking(false);

      if (botMove === null) {
        // Bot chọn Bỏ lượt
        handlePass();
      } else {
        executeMove(botMove, curTurn);
      }
    }, 450);

    return () => clearTimeout(botTimer);
  }, [currentTurn, executeMove, handlePass, inLobby, isGameOver, mode, playerColor]);

  // Chọn điểm đặt cờ
  const handleSelectPoint = (p: Point) => {
    if (isGameOver || isAiThinking) return;
    if (mode === 'ai' && currentTurn !== playerColor) return;

    // Chạm lần 1: chọn điểm để xem trước
    // Chạm lần 2 đúng điểm đó: xác nhận đặt cờ ngay
    if (selectedPoint && selectedPoint.row === p.row && selectedPoint.col === p.col) {
      executeMove(p, currentTurn);
    } else {
      setSelectedPoint(p);
      sounds.playClick();
    }
  };

  const handleConfirmSelectedPoint = () => {
    if (!selectedPoint) return;
    executeMove(selectedPoint, currentTurn);
  };

  const handleCancelSelectedPoint = () => {
    setSelectedPoint(null);
  };

  const handleResetGame = () => {
    handleStartNewGame({
      boardSize,
      mode,
      aiDifficulty,
      playerColor,
    });
  };

  const handleBackToLobby = () => {
    setInLobby(true);
    const saved = loadGoState();
    setHasSavedGame(!!saved && !saved.isGameOver);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-4">
      {inLobby ? (
        <GoLobby
          hasSavedGame={hasSavedGame}
          onResumeSavedGame={handleResumeSavedGame}
          onStartNewGame={handleStartNewGame}
        />
      ) : (
        <div className="w-full flex flex-col items-center space-y-3">
          {/* Thanh thông tin & công cụ */}
          <GoScoreBar
            currentTurn={currentTurn}
            captures={captures}
            consecutivePasses={consecutivePasses}
            isAiThinking={isAiThinking}
            selectedPoint={selectedPoint}
            onConfirmSelectedPoint={handleConfirmSelectedPoint}
            onCancelSelectedPoint={handleCancelSelectedPoint}
            onPass={handlePass}
            onResign={handleResign}
            onReset={handleResetGame}
            disabled={isGameOver || isAiThinking || (mode === 'ai' && currentTurn !== playerColor)}
          />

          {/* Bàn cờ gỗ Neo-Arcade */}
          <GoBoardComponent
            board={board}
            boardSize={boardSize}
            currentTurn={currentTurn}
            koPoint={koPoint}
            lastMove={lastMove}
            selectedPoint={selectedPoint}
            onSelectPoint={handleSelectPoint}
            onConfirmMove={(p) => executeMove(p, currentTurn)}
            disabled={isGameOver || isAiThinking || (mode === 'ai' && currentTurn !== playerColor)}
          />

          {/* Modal kết thúc ván */}
          <GoGameOverModal
            isOpen={isGameOver}
            winner={winner}
            resignedBy={resignedBy}
            score={score}
            onPlayAgain={handleResetGame}
            onBackToLobby={handleBackToLobby}
          />
        </div>
      )}
    </div>
  );
};
