'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  BoardSize,
  GoAiDifficulty,
  GoColor,
  GoGameMode,
  GoGameState,
  GoRoom,
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
import { updateGoGameState, leaveGoRoom, startGoRematch } from './goRoomService';
import { recordMatch } from '@/features/matchHistory/matchHistoryService';
import { MatchRecord } from '@/features/matchHistory/types';
import { MatchReplayModal } from '@/features/matchHistory/MatchReplayModal';
import { sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/lib/supabase/client';
import { GoBoardComponent } from './GoBoard';
import { GoScoreBar } from './GoScoreBar';
import { GoGameOverModal } from './GoGameOverModal';
import { GoLobby } from './GoLobby';
import { ChatBubble } from '@/features/social/ChatBubble';
import { InGameSocialPicker } from '@/features/social/InGameSocialPicker';
import { ActiveSocialMessage, SocialContentType } from '@/features/social/types';
import { Copy, Check, Users, ArrowLeft } from 'lucide-react';

interface GoGameProps {
  initialMode?: GoGameMode;
  onlineRoom?: GoRoom | null;
  currentUserId?: string;
  currentUserName?: string;
  currentUserAvatar?: string;
  onLeaveOnlineRoom?: () => void;
  onCreateOnlineRoom?: (boardSize: BoardSize) => void;
  onJoinOnlineRoom?: (code: string) => void;
  onStartQuickMatch?: (boardSize: BoardSize) => void;
  onCancelQuickMatch?: () => void;
  isCreatingOnline?: boolean;
  isJoiningOnline?: boolean;
  isSearchingQuickMatch?: boolean;
  errorMessage?: string | null;
}

export const GoGame: React.FC<GoGameProps> = ({
  initialMode = 'ai',
  onlineRoom = null,
  currentUserId = '',
  currentUserName = 'Kỳ thủ',
  currentUserAvatar = '👑',
  onLeaveOnlineRoom,
  onCreateOnlineRoom,
  onJoinOnlineRoom,
  onStartQuickMatch,
  onCancelQuickMatch,
  isCreatingOnline = false,
  isJoiningOnline = false,
  isSearchingQuickMatch = false,
  errorMessage = null,
}) => {
  const { language } = useLanguage();

  // Trạng thái sảnh / Đang chơi
  const [inLobby, setInLobby] = useState(!onlineRoom);
  const [hasSavedGame, setHasSavedGame] = useState(false);

  // Online Room State
  const [room, setRoom] = useState<GoRoom | null>(onlineRoom);
  const isOnline = Boolean(room);

  // Xác định vai trò trong trận Online
  const isHost = isOnline && room?.host_id === currentUserId;
  const isGuest = isOnline && room?.guest_id === currentUserId;
  const myOnlineColor: GoColor = isHost ? 'black' : 'white';

  // Cấu hình ván đấu
  const [boardSize, setBoardSize] = useState<BoardSize>(
    onlineRoom?.game_state?.boardSize || 9
  );
  const [mode, setMode] = useState<GoGameMode>(
    onlineRoom ? 'online' : initialMode
  );
  const [aiDifficulty, setAiDifficulty] = useState<GoAiDifficulty>('easy');
  const [playerColor, setPlayerColor] = useState<GoColor>(
    onlineRoom ? myOnlineColor : 'black'
  );

  // Trạng thái ván đấu
  const [board, setBoard] = useState(
    onlineRoom?.game_state?.board || createEmptyBoard(boardSize)
  );
  const [currentTurn, setCurrentTurn] = useState<GoColor>(
    onlineRoom?.game_state?.currentTurn || 'black'
  );
  const [captures, setCaptures] = useState(
    onlineRoom?.game_state?.captures || { black: 0, white: 0 }
  );
  const [koPoint, setKoPoint] = useState<Point | null>(
    onlineRoom?.game_state?.koPoint || null
  );
  const [consecutivePasses, setConsecutivePasses] = useState(
    onlineRoom?.game_state?.consecutivePasses || 0
  );
  const [isGameOver, setIsGameOver] = useState(
    onlineRoom?.game_state?.isGameOver || false
  );
  const [winner, setWinner] = useState<GoColor | null>(
    onlineRoom?.game_state?.winner || null
  );
  const [resignedBy, setResignedBy] = useState<GoColor | null>(
    onlineRoom?.game_state?.resignedBy || null
  );
  const [score, setScore] = useState<TerritoryScore | null>(
    onlineRoom?.game_state?.score || null
  );
  const [lastMove, setLastMove] = useState<Point | null>(
    onlineRoom?.game_state?.lastMove || null
  );
  const [moveHistory, setMoveHistory] = useState<
    Array<{ turn: GoColor; point: Point | null; capturesCount: number }>
  >(onlineRoom?.game_state?.moveHistory || []);

  // Lịch sử thi đấu & Trình xem lại
  const [lastRecordedMatch, setLastRecordedMatch] = useState<MatchRecord | null>(null);
  const [showReplayModal, setShowReplayModal] = useState<boolean>(false);
  const matchRecordedRef = useRef<boolean>(false);

  // Thao tác giao diện
  const [selectedPoint, setSelectedPoint] = useState<Point | null>(null);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Tái đấu Online
  const [rematchRequestedByMe, setRematchRequestedByMe] = useState(false);
  const [rematchOfferedByOpponent, setRematchOfferedByOpponent] = useState(false);

  // Social Chat & Emotes
  const [activeSocialMessages, setActiveSocialMessages] = useState<ActiveSocialMessage[]>([]);
  const channelRef = useRef<any>(null);

  // Ref chống stale closure trong async & Realtime
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
    moveHistory,
    isOnline,
    roomId: room?.id,
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
      moveHistory,
      isOnline,
      roomId: room?.id,
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
    moveHistory,
    isOnline,
    room?.id,
  ]);

  // Cập nhật khi prop onlineRoom thay đổi
  useEffect(() => {
    if (onlineRoom) {
      setRoom(onlineRoom);
      setMode('online');
      setInLobby(false);
      setBoardSize(onlineRoom.game_state?.boardSize || 9);
      if (onlineRoom.game_state) {
        setBoard(onlineRoom.game_state.board);
        setCurrentTurn(onlineRoom.game_state.currentTurn);
        setCaptures(onlineRoom.game_state.captures);
        setKoPoint(onlineRoom.game_state.koPoint);
        setConsecutivePasses(onlineRoom.game_state.consecutivePasses);
        setIsGameOver(onlineRoom.game_state.isGameOver);
        setWinner(onlineRoom.game_state.winner);
        setResignedBy(onlineRoom.game_state.resignedBy || null);
        setScore(onlineRoom.game_state.score);
        setLastMove(onlineRoom.game_state.lastMove);
        setMoveHistory(onlineRoom.game_state.moveHistory || []);
      }
    }
  }, [onlineRoom]);

  // Kiểm tra ván cờ đã lưu khi khởi động
  useEffect(() => {
    if (!onlineRoom) {
      const saved = loadGoState();
      if (saved && !saved.isGameOver) {
        setHasSavedGame(true);
      }
    }
  }, [onlineRoom]);

  // Ghi nhận ván cờ vào Lịch sử thi đấu (Match History)
  const saveGoMatchRecord = useCallback(
    (
      finalWinner: GoColor | null,
      finalResignedBy: GoColor | null,
      finalScore: TerritoryScore | null,
      finalHistory: Array<{ turn: GoColor; point: Point | null; capturesCount: number }>
    ) => {
      if (matchRecordedRef.current) return;
      matchRecordedRef.current = true;

      const isHostRole = isOnline && room?.host_id === currentUserId;
      const mySide: GoColor = isOnline ? (isHostRole ? 'black' : 'white') : playerColor;

      let matchResult: 'win' | 'loss' | 'draw' = 'draw';
      if (finalWinner) {
        matchResult = finalWinner === mySide ? 'win' : 'loss';
      }

      let opponentName = 'Bot AI';
      let opponentAvatar = '🤖';
      if (isOnline) {
        opponentName = isHostRole
          ? room?.guest_name || 'Kỳ thủ'
          : room?.host_name || 'Kỳ thủ';
        opponentAvatar = isHostRole
          ? room?.game_state?.guestAvatar || '⚪'
          : room?.game_state?.hostAvatar || '⚪';
      } else if (mode === 'pass_and_play') {
        opponentName = language === 'vi' ? 'Người chơi 2' : 'Player 2';
        opponentAvatar = '⚪';
      }

      const reason = finalResignedBy
        ? language === 'vi' ? 'Đối phương đầu hàng' : 'Opponent resigned'
        : finalScore
        ? language === 'vi'
          ? `Tính điểm đất (Cách biệt ${finalScore.margin}đ)`
          : `Territory score (${finalScore.margin} pts margin)`
        : language === 'vi' ? 'Hoàn tất ván' : 'Game over';

      const rec = recordMatch({
        gameId: 'go',
        mode: isOnline ? 'pvp' : mode === 'ai' ? 'bot' : 'local',
        result: matchResult,
        opponentName,
        opponentAvatar,
        totalMoves: finalHistory.length,
        playerColor: mySide,
        boardSize,
        moves: finalHistory,
        score: finalScore
          ? {
              blackTotal: finalScore.blackTotal,
              whiteTotal: finalScore.whiteTotal,
              margin: finalScore.margin,
            }
          : null,
        reason,
      });

      setLastRecordedMatch(rec);
    },
    [boardSize, currentUserId, isOnline, language, mode, playerColor, room]
  );

  // Xử lý tin nhắn Social đến
  const handleIncomingSocial = useCallback(
    (type: SocialContentType, content: string, target: 'me' | 'opponent') => {
      sounds.playSocialPop();
      const id = `${Date.now()}_${Math.random()}`;
      setActiveSocialMessages((prev) => [
        ...prev,
        { id, type, content, target, createdAt: Date.now() },
      ]);
      setTimeout(() => {
        setActiveSocialMessages((prev) => prev.filter((r) => r.id !== id));
      }, 3500);
    },
    []
  );

  // Gửi tin nhắn Social
  const handleSendSocial = useCallback(
    (type: SocialContentType, content: string) => {
      handleIncomingSocial(type, content, 'me');

      if (isOnline && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'in_game_social',
          payload: {
            from: currentUserId,
            type,
            content,
          },
        });
      } else if (mode === 'ai') {
        // Bot tự động tương tác phản hồi vui vẻ
        if (Math.random() < 0.5) {
          setTimeout(() => {
            const replies =
              type === 'chat'
                ? [
                    '🤔 Nước cờ thú vị đấy!',
                    '🔥 Kỳ phùng địch thủ!',
                    '👑 Cờ Vây biến hóa khôn lường!',
                    '☕ Tập trung chiếm góc và cạnh nào!',
                  ]
                : ['👍', '🔥', '🤔', '👏', '😎'];
            const randomReply = replies[Math.floor(Math.random() * replies.length)];
            handleIncomingSocial(type, randomReply, 'opponent');
          }, 800);
        }
      }
    },
    [currentUserId, handleIncomingSocial, isOnline, mode]
  );

  // Online Realtime Supabase Channel
  useEffect(() => {
    if (!isOnline || !room?.id) return;

    const channelName = `go_room:${room.id}`;

    // Hủy các kênh cũ nếu có trùng lặp
    if ((supabase as any).realtime?.channels) {
      (supabase as any).realtime.channels = (supabase as any).realtime.channels.filter(
        (ch: any) => ch.topic !== channelName
      );
    }

    const channel = supabase
      .channel(channelName, {
        config: {
          broadcast: { self: false },
          presence: { key: currentUserId },
        },
      })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.new) {
            const updated = payload.new as GoRoom;
            setRoom(updated);

            // Nếu đối thủ rời phòng khi chưa xong -> xử thắng cho ta
            if (updated.status === 'abandoned' && !isGameOver) {
              const mySide: GoColor = isHost ? 'black' : 'white';
              setWinner(mySide);
              setIsGameOver(true);
              sounds.playVictory();
              saveGoMatchRecord(mySide, null, null, gameStateRef.current.moveHistory);
              return;
            }

            // Đồng bộ nước cờ mới từ đối thủ
            if (updated.game_state) {
              const gs = updated.game_state;
              setBoard(gs.board);
              setCurrentTurn(gs.currentTurn);
              setCaptures(gs.captures);
              setKoPoint(gs.koPoint);
              setConsecutivePasses(gs.consecutivePasses);
              setIsGameOver(gs.isGameOver);
              setWinner(gs.winner);
              setResignedBy(gs.resignedBy || null);
              setScore(gs.score);
              setLastMove(gs.lastMove);
              setMoveHistory(gs.moveHistory || []);

              // Nếu ván đấu vừa kết thúc từ phía đối phương
              if (gs.isGameOver) {
                saveGoMatchRecord(
                  gs.winner,
                  gs.resignedBy || null,
                  gs.score,
                  gs.moveHistory || []
                );
              }

              // Phát âm thanh nếu đối thủ vừa đi
              if (gs.lastMove) {
                sounds.playGoStonePlace();
              }
            }
          }
        }
      )
      .on('broadcast', { event: 'in_game_social' }, (payload) => {
        if (payload?.payload?.from !== currentUserId) {
          handleIncomingSocial(
            payload.payload.type,
            payload.payload.content,
            'opponent'
          );
        }
      })
      .on('broadcast', { event: 'rematch_request' }, (payload) => {
        if (payload?.payload?.from !== currentUserId) {
          setRematchOfferedByOpponent(true);
          sounds.playClick();
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
    };
  }, [currentUserId, handleIncomingSocial, isGameOver, isHost, isOnline, room?.id, saveGoMatchRecord]);

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
    setMoveHistory([]);
    setSelectedPoint(null);
    setIsAiThinking(false);
    setInLobby(false);
    setRoom(null);
    setLastRecordedMatch(null);
    matchRecordedRef.current = false;

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
      setMoveHistory(saved.moveHistory || []);
      setSelectedPoint(null);
      setIsAiThinking(false);
      setInLobby(false);
      setRoom(null);
      matchRecordedRef.current = false;
    }
  };

  // Kết thúc ván cờ & tính điểm đất
  const finishGameWithScoring = useCallback(
    async (curBoard: typeof board, curCaptures: typeof captures) => {
      const territoryScore = calculateTerritory(curBoard, curCaptures, 6.5);
      setScore(territoryScore);
      setWinner(territoryScore.winner);
      setIsGameOver(true);
      clearGoState();

      const myColor = isOnline ? myOnlineColor : playerColor;
      if (territoryScore.winner === myColor) {
        sounds.playVictory();
      } else {
        sounds.playDefeat();
      }

      recordGoGameResult(
        mode,
        territoryScore.winner === myColor ? 'win' : 'loss',
        curCaptures.black
      );

      // Lưu vào Lịch sử đấu (Match History)
      saveGoMatchRecord(
        territoryScore.winner,
        null,
        territoryScore,
        gameStateRef.current.moveHistory
      );

      // Đồng bộ nếu là online
      if (isOnline && room?.id) {
        try {
          const nextState: GoGameState = {
            ...gameStateRef.current,
            board: curBoard,
            captures: curCaptures,
            isGameOver: true,
            winner: territoryScore.winner,
            score: territoryScore,
            moveHistory: gameStateRef.current.moveHistory,
          };
          await updateGoGameState(room.id, nextState, 'completed');
        } catch (err) {
          console.error('Failed to sync game end:', err);
        }
      }
    },
    [isOnline, mode, myOnlineColor, playerColor, room?.id, saveGoMatchRecord]
  );

  // Xử lý thực hiện 1 nước đi đặt cờ
  const executeMove = useCallback(
    async (p: Point, turn: GoColor) => {
      const {
        board: curBoard,
        captures: curCaptures,
        koPoint: curKo,
        boardSize: curSize,
        moveHistory: curHistory,
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
      const updatedHistory = [
        ...curHistory,
        { turn, point: p, capturesCount: result.captures.length },
      ];

      setBoard(result.newBoard);
      setCaptures(newCaptures);
      setKoPoint(result.newKoPoint);
      setConsecutivePasses(0); // Reset bộ đếm bỏ lượt
      setLastMove(p);
      setMoveHistory(updatedHistory);
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
        resignedBy: null,
        score: null,
        mode,
        aiDifficulty,
        playerColor,
        lastMove: p,
        moveHistory: updatedHistory,
      };

      if (!isOnline) {
        saveGoState(nextState);
      } else if (room?.id) {
        // Đồng bộ lên Supabase Realtime
        try {
          await updateGoGameState(room.id, nextState);
        } catch (err) {
          console.error('Failed to sync move to Supabase:', err);
        }
      }

      return true;
    },
    [aiDifficulty, isOnline, mode, playerColor, room?.id]
  );

  // Thực thi Bỏ lượt (Pass) dùng chung cho cả Người chơi và Bot AI (đọc từ ref chống stale closure)
  const executePass = useCallback(async () => {
    const {
      board: curBoard,
      captures: curCaptures,
      consecutivePasses: curPasses,
      currentTurn: curTurn,
      isGameOver: curGameOver,
      moveHistory: curHistory,
      isOnline: curIsOnline,
      roomId: curRoomId,
    } = gameStateRef.current;

    if (curGameOver) return;

    sounds.playMove();
    setSelectedPoint(null);

    const nextPassCount = curPasses + 1;
    const updatedHistory = [
      ...curHistory,
      { turn: curTurn, point: null, capturesCount: 0 },
    ];
    setMoveHistory(updatedHistory);
    setConsecutivePasses(nextPassCount);

    // 2 lần Bỏ lượt liên tiếp -> Kết thúc ván cờ và tính điểm đất
    if (nextPassCount >= 2) {
      await finishGameWithScoring(curBoard, curCaptures);
      return;
    }

    const nextTurn: GoColor = curTurn === 'black' ? 'white' : 'black';
    setCurrentTurn(nextTurn);

    // Cập nhật lưu trữ
    const nextState: GoGameState = {
      ...gameStateRef.current,
      currentTurn: nextTurn,
      consecutivePasses: nextPassCount,
      winner: null,
      score: null,
      moveHistory: updatedHistory,
    };

    if (!curIsOnline) {
      saveGoState(nextState);
    } else if (curRoomId) {
      try {
        await updateGoGameState(curRoomId, nextState);
      } catch (err) {
        console.error('Failed to sync pass to Supabase:', err);
      }
    }
  }, [finishGameWithScoring]);

  // Xử lý khi Người chơi bấm nút Bỏ lượt (Pass)
  const handlePass = useCallback(async () => {
    if (isGameOver || isAiThinking) return;
    await executePass();
  }, [executePass, isAiThinking, isGameOver]);

  // Xử lý Xin thua (Resign)
  const handleResign = async () => {
    if (isGameOver || isAiThinking) return;

    const resignWinner: GoColor = currentTurn === 'black' ? 'white' : 'black';
    setResignedBy(currentTurn);
    setWinner(resignWinner);
    setIsGameOver(true);
    clearGoState();

    sounds.playDefeat();
    recordGoGameResult(mode, 'loss', captures.black);

    // Lưu vào Lịch sử đấu (Match History)
    saveGoMatchRecord(
      resignWinner,
      currentTurn,
      null,
      gameStateRef.current.moveHistory
    );

    if (isOnline && room?.id) {
      try {
        const nextState: GoGameState = {
          ...gameStateRef.current,
          isGameOver: true,
          winner: resignWinner,
          resignedBy: currentTurn,
          score: null,
          moveHistory: gameStateRef.current.moveHistory,
        };
        await updateGoGameState(room.id, nextState, 'completed');
      } catch (err) {
        console.error('Failed to sync resignation:', err);
      }
    }
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
        executePass();
      } else {
        executeMove(botMove, curTurn);
      }
    }, 450);

    return () => clearTimeout(botTimer);
  }, [currentTurn, executeMove, executePass, inLobby, isGameOver, mode, playerColor]);

  // Chọn điểm đặt cờ
  const handleSelectPoint = (p: Point) => {
    if (isGameOver || isAiThinking) return;
    if (mode === 'ai' && currentTurn !== playerColor) return;
    if (isOnline) {
      if (room?.status !== 'in_progress') return;
      if (currentTurn !== myOnlineColor) return;
    }

    // Chạm lần 1: xem trước | Chạm lần 2 đúng điểm: xác nhận đặt
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

  // Rời phòng hoặc quay về Sảnh
  const handleBackToLobby = async () => {
    if (isOnline && room?.id) {
      try {
        await leaveGoRoom(room.id);
      } catch (e) {
        console.error(e);
      }
      if (onLeaveOnlineRoom) {
        onLeaveOnlineRoom();
      }
    }
    setRoom(null);
    setInLobby(true);
    const saved = loadGoState();
    setHasSavedGame(!!saved && !saved.isGameOver);
    matchRecordedRef.current = false;
  };

  // Xử lý Tái đấu Online (Đảo phe)
  const handleOnlineRematch = async () => {
    if (!room || !channelRef.current) return;

    if (!rematchOfferedByOpponent) {
      // Gửi lời mời tái đấu
      setRematchRequestedByMe(true);
      channelRef.current.send({
        type: 'broadcast',
        event: 'rematch_request',
        payload: { from: currentUserId },
      });
      return;
    }

    // Cả 2 cùng đồng ý -> Bắt đầu ván mới đảo phe
    try {
      const updatedRoom = await startGoRematch(
        room.id,
        room.host_id,
        room.guest_id || '',
        room.host_name,
        room.guest_name || 'Kỳ thủ',
        room.game_state?.hostAvatar,
        room.game_state?.guestAvatar,
        boardSize
      );

      setRoom(updatedRoom);
      setRematchRequestedByMe(false);
      setRematchOfferedByOpponent(false);
      setIsGameOver(false);
      setWinner(null);
      setResignedBy(null);
      setScore(null);
      setBoard(createEmptyBoard(boardSize));
      setCurrentTurn('black');
      setCaptures({ black: 0, white: 0 });
      setKoPoint(null);
      setConsecutivePasses(0);
      setLastMove(null);
      setMoveHistory([]);
      setLastRecordedMatch(null);
      matchRecordedRef.current = false;
      sounds.playClick();
    } catch (err) {
      console.error('Failed to rematch:', err);
    }
  };

  // Sao chép link mời bạn bè
  const handleCopyRoomLink = () => {
    if (!room?.code) return;
    const url = `${window.location.origin}/games/go?room=${room.code}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    sounds.playClick();
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Xác định cờ được phép thao tác
  const isInputDisabled =
    isGameOver ||
    isAiThinking ||
    (mode === 'ai' && currentTurn !== playerColor) ||
    (isOnline && (room?.status !== 'in_progress' || currentTurn !== myOnlineColor));

  // Tên người chơi
  const blackName = isOnline
    ? room?.host_name || (language === 'vi' ? 'Quân Đen' : 'Black')
    : mode === 'ai'
    ? playerColor === 'black' ? (currentUserName || (language === 'vi' ? 'Bạn' : 'You')) : 'Bot AI'
    : (language === 'vi' ? 'Quân Đen' : 'Black');

  const whiteName = isOnline
    ? room?.guest_name || (room?.status === 'waiting' ? (language === 'vi' ? 'Đang đợi...' : 'Waiting...') : (language === 'vi' ? 'Quân Trắng' : 'White'))
    : mode === 'ai'
    ? playerColor === 'white' ? (currentUserName || (language === 'vi' ? 'Bạn' : 'You')) : 'Bot AI'
    : (language === 'vi' ? 'Quân Trắng' : 'White');

  return (
    <div className="w-full flex flex-col items-center justify-center space-y-3 relative">
      {/* Bong bóng Social Chat */}
      <div className="absolute top-2 left-4 flex flex-col items-start gap-1 pointer-events-none z-40">
        {activeSocialMessages
          .filter((m) => m.target === 'opponent')
          .map((m) => (
            <ChatBubble key={m.id} message={m} align="left" placement="top" />
          ))}
      </div>
      <div className="absolute top-2 right-4 flex flex-col items-end gap-1 pointer-events-none z-40">
        {activeSocialMessages
          .filter((m) => m.target === 'me')
          .map((m) => (
            <ChatBubble key={m.id} message={m} align="right" placement="top" />
          ))}
      </div>

      {inLobby ? (
        <GoLobby
          hasSavedGame={hasSavedGame}
          onResumeSavedGame={handleResumeSavedGame}
          onStartNewGame={handleStartNewGame}
          onCreateOnlineRoom={onCreateOnlineRoom}
          onJoinOnlineRoom={onJoinOnlineRoom}
          onStartQuickMatch={onStartQuickMatch}
          onCancelQuickMatch={onCancelQuickMatch}
          isCreatingOnline={isCreatingOnline}
          isJoiningOnline={isJoiningOnline}
          isSearchingQuickMatch={isSearchingQuickMatch}
          errorMessage={errorMessage}
        />
      ) : isOnline && room?.status === 'waiting' ? (
        /* MÀN HÌNH CHỜ ĐỐI THỦ VÀO PHÒNG ONLINE */
        <div className="w-full max-w-md mx-auto pixel-box bg-[#FFFDF8] border-3 border-zinc-900 p-5 space-y-4 shadow-[4px_4px_0px_#000] text-center select-none animate-in fade-in">
          <div className="border-b-2 border-zinc-900 pb-3">
            <div className="inline-flex p-3 bg-amber-300 border-2 border-black rounded-full mb-1">
              <Users className="w-6 h-6 text-zinc-950" />
            </div>
            <h2 className="font-pixel text-lg sm:text-xl font-bold uppercase text-zinc-950">
              {language === 'vi' ? 'PHÒNG CHỜ ĐẤU CỜ VÂY' : 'WAITING FOR OPPONENT'}
            </h2>
            <p className="text-xs font-mono text-zinc-600">
              {language === 'vi'
                ? `Bàn cờ ${boardSize}x${boardSize} • Hãy gửi mã hoặc link cho bạn bè!`
                : `${boardSize}x${boardSize} board • Share code or link with a friend!`}
            </p>
          </div>

          {/* Mã phòng lớn */}
          <div className="bg-amber-100 border-2 border-dashed border-amber-600 p-4">
            <span className="text-xs font-mono text-amber-900 block mb-1 uppercase">
              {language === 'vi' ? 'MÃ PHÒNG CỦA BẠN:' : 'YOUR ROOM CODE:'}
            </span>
            <div className="font-mono text-3xl font-black tracking-widest text-zinc-950 select-all">
              {room?.code}
            </div>
          </div>

          {/* Nút copy link */}
          <button
            type="button"
            onClick={handleCopyRoomLink}
            className="w-full pixel-btn bg-amber-400 hover:bg-amber-300 text-zinc-950 py-2.5 font-pixel text-xs font-bold flex items-center justify-center gap-2 shadow-[2px_2px_0px_#000]"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-800" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? (language === 'vi' ? 'ĐÃ CHÉP LINK MỜI!' : 'LINK COPIED!') : (language === 'vi' ? 'CHÉP LINK MỜI BẠN' : 'COPY INVITE LINK')}</span>
          </button>

          {/* Spinner chờ */}
          <div className="flex items-center justify-center gap-2 py-2 text-xs font-mono text-zinc-600">
            <span className="w-4 h-4 border-2 border-zinc-900 border-t-transparent animate-spin rounded-full" />
            <span>{language === 'vi' ? 'Đang đợi người chơi thứ hai tham gia...' : 'Waiting for guest to join...'}</span>
          </div>

          <button
            type="button"
            onClick={handleBackToLobby}
            className="w-full pixel-btn bg-zinc-200 hover:bg-zinc-300 text-zinc-800 py-2 font-pixel text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{language === 'vi' ? 'HỦY & VỀ SẢNH' : 'CANCEL & LOBBY'}</span>
          </button>
        </div>
      ) : (
        /* MÀN HÌNH ĐANG CHƠI */
        <div className="w-full flex flex-col items-center space-y-3">
          {/* Thanh điểm số & thông tin */}
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
            disabled={isInputDisabled}
            blackPlayerName={blackName}
            whitePlayerName={whiteName}
            isOnline={isOnline}
            roomCode={room?.code}
            onCopyRoomLink={handleCopyRoomLink}
            copiedLink={copiedLink}
          />

          {/* Bàn cờ Cờ Vây Neo-Arcade */}
          <GoBoardComponent
            board={board}
            boardSize={boardSize}
            currentTurn={currentTurn}
            koPoint={koPoint}
            lastMove={lastMove}
            selectedPoint={selectedPoint}
            onSelectPoint={handleSelectPoint}
            onConfirmMove={(p) => executeMove(p, currentTurn)}
            disabled={isInputDisabled}
          />

          {/* Social Picker + Nút Quay về Sảnh khi đang trong ván */}
          <div className="w-full max-w-[540px] flex items-center justify-between px-1">
            <button
              type="button"
              onClick={handleBackToLobby}
              className="pixel-btn bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-3 py-1.5 text-xs font-pixel flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{language === 'vi' ? 'Sảnh Cờ Vây' : 'Lobby'}</span>
            </button>

            {/* Bộ chọn Biểu cảm & Chat nhanh */}
            <InGameSocialPicker onSendMessage={handleSendSocial} />
          </div>

          {/* Modal kết thúc ván */}
          <GoGameOverModal
            isOpen={isGameOver}
            winner={winner}
            resignedBy={resignedBy}
            score={score}
            isOnline={isOnline}
            rematchRequestedByMe={rematchRequestedByMe}
            rematchOfferedByOpponent={rematchOfferedByOpponent}
            onRematch={handleOnlineRematch}
            onReplayMatch={lastRecordedMatch ? () => setShowReplayModal(true) : undefined}
            onPlayAgain={handleResetGame}
            onBackToLobby={handleBackToLobby}
          />

          {/* Modal Xem lại ván đấu tương tác (Replay Viewer) */}
          <MatchReplayModal
            match={lastRecordedMatch}
            isOpen={showReplayModal}
            onClose={() => setShowReplayModal(false)}
          />
        </div>
      )}
    </div>
  );
};
