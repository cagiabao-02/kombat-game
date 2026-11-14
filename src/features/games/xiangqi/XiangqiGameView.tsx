'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabase/client';
import {
  createNewGame,
  makeMove,
  getLegalMoves,
  GameState,
  Position,
  Side,
} from './xiangqiLogic';
import { XiangqiBoard } from './XiangqiBoard';
import { XiangqiControls } from './XiangqiControls';
import { getBestXiangqiBotMove, XiangqiBotDifficulty } from './ai/xiangqiBot';
import { XiangqiRoom, XiangqiGameState } from './types';
import {
  updateXiangqiGameState,
  leaveXiangqiRoom,
  startXiangqiRematch,
} from './xiangqiRoomService';
import { recordXiangqiGameResult } from './xiangqiStatsService';
import { sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  Trophy,
  RotateCcw,
  Home,
  Sparkles,
  Copy,
  Check,
  Users,
  Wifi,
  Handshake,
} from 'lucide-react';

interface XiangqiGameViewProps {
  gameMode?: 'local' | 'bot' | 'online';
  botDifficulty?: XiangqiBotDifficulty;
  botSide?: Side;
  playerRedName?: string;
  playerBlackName?: string;
  onlineRoom?: XiangqiRoom | null;
  currentUserId?: string;
  onLeave: () => void;
}

export function XiangqiGameView({
  gameMode = 'local',
  botDifficulty = 'medium',
  botSide = 'black',
  playerRedName = 'Kỳ thủ Đỏ',
  playerBlackName = 'Kỳ thủ Đen',
  onlineRoom = null,
  currentUserId = '',
  onLeave,
}: XiangqiGameViewProps) {
  const { language } = useLanguage();

  const isOnline = gameMode === 'online' && Boolean(onlineRoom);
  const [room, setRoom] = useState<XiangqiRoom | null>(onlineRoom);

  // Khởi tạo GameState
  const [gameState, setGameState] = useState<GameState>(() => {
    if (isOnline && onlineRoom?.game_state) {
      return {
        board: onlineRoom.game_state.board,
        turn: onlineRoom.game_state.turn,
        moveHistory: onlineRoom.game_state.moveHistory || [],
        isCheck: onlineRoom.game_state.isCheck || false,
        isCheckmate: onlineRoom.game_state.isCheckmate || false,
        isStalemate: onlineRoom.game_state.isStalemate || false,
        winner: onlineRoom.game_state.winner || null,
      };
    }
    return createNewGame();
  });

  const [selectedPos, setSelectedPos] = useState<Position | null>(null);
  const [legalMoves, setLegalMoves] = useState<Position[]>([]);
  const [showSubLabel, setShowSubLabel] = useState<boolean>(true);
  const [showVictoryModal, setShowVictoryModal] = useState<boolean>(false);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [rematchRequestedByMe, setRematchRequestedByMe] = useState<boolean>(false);
  const [rematchOfferedByOpponent, setRematchOfferedByOpponent] = useState<boolean>(false);

  // Ref chống ghi nhận chỉ số 2 lần trong 1 ván
  const statsRecordedRef = useRef<boolean>(false);

  // Xác định người chơi cầm phe nào trong Online Mode
  const isHost = isOnline && room?.host_id === currentUserId;
  const isGuest = isOnline && room?.guest_id === currentUserId;
  const myOnlineSide: Side | null = isOnline ? (isHost ? 'red' : 'black') : null;

  // Tự động xoay bàn cờ nếu:
  // - Bot mode mà người chơi cầm Đen (botSide === 'red')
  // - Online mode mà người chơi là Guest (cầm quân Đen)
  const initialFlipped =
    (gameMode === 'bot' && botSide === 'red') || (isOnline && !isHost);
  const [flipped, setFlipped] = useState<boolean>(initialFlipped);

  // Tên người chơi 2 bên
  const effectiveRedName = isOnline
    ? room?.host_name || 'Kỳ thủ Đỏ'
    : playerRedName;
  const effectiveBlackName = isOnline
    ? room?.guest_name || (room?.status === 'waiting' ? (language === 'vi' ? 'Đang đợi...' : 'Waiting...') : 'Kỳ thủ Đen')
    : playerBlackName;

  const isWaitingGuest = isOnline && room?.status === 'waiting';
  const isBotTurn = gameMode === 'bot' && gameState.turn === botSide && !gameState.winner;

  // Lượt đi của tôi:
  // - Local: luôn được đi
  // - Bot: chỉ khi turn !== botSide
  // - Online: chỉ khi không chờ khách, phòng in_progress và turn === myOnlineSide
  const isMyTurn =
    !gameState.winner &&
    (gameMode === 'local'
      ? true
      : gameMode === 'bot'
      ? gameState.turn !== botSide
      : isOnline
      ? room?.status === 'in_progress' && gameState.turn === myOnlineSide
      : false);

  // Đồng bộ room props khi có thay đổi từ bên ngoài
  useEffect(() => {
    if (onlineRoom) {
      setRoom(onlineRoom);
    }
  }, [onlineRoom]);

  // Online Realtime Supabase Channel
  useEffect(() => {
    if (!isOnline || !room?.id) return;

    const channelName = `xiangqi_room:${room.id}`;

    // Hủy các kênh cũ nếu bị trùng lặp
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
            const updated = payload.new as XiangqiRoom;
            setRoom(updated);

            if (updated.status === 'abandoned' && !gameState.winner) {
              // Đối thủ rời phòng -> xử thắng
              const winSide: Side = myOnlineSide || 'red';
              setGameState((prev) => ({
                ...prev,
                winner: winSide,
              }));
              setShowVictoryModal(true);
              sounds.playVictory();
            } else if (updated.game_state) {
              setGameState({
                board: updated.game_state.board,
                turn: updated.game_state.turn,
                moveHistory: updated.game_state.moveHistory || [],
                isCheck: updated.game_state.isCheck || false,
                isCheckmate: updated.game_state.isCheckmate || false,
                isStalemate: updated.game_state.isStalemate || false,
                winner: updated.game_state.winner || null,
              });
              if (updated.game_state.winner) {
                setShowVictoryModal(true);
                sounds.playVictory();
              }
            }
          }
        }
      )
      .on('broadcast', { event: 'xiangqi_state' }, ({ payload }) => {
        if (payload?.game_state) {
          const nextState: GameState = {
            board: payload.game_state.board,
            turn: payload.game_state.turn,
            moveHistory: payload.game_state.moveHistory || [],
            isCheck: payload.game_state.isCheck || false,
            isCheckmate: payload.game_state.isCheckmate || false,
            isStalemate: payload.game_state.isStalemate || false,
            winner: payload.game_state.winner || null,
          };
          setGameState(nextState);

          const last = nextState.moveHistory[nextState.moveHistory.length - 1];
          if (nextState.winner) {
            sounds.playVictory();
            setShowVictoryModal(true);
          } else if (nextState.isCheck) {
            sounds.playCheck();
          } else if (last?.captured) {
            sounds.playCapture();
          } else {
            sounds.playMove();
          }
        }
      })
      .on('broadcast', { event: 'rematch_offer' }, ({ payload }) => {
        if (payload && payload.from !== currentUserId) {
          setRematchOfferedByOpponent(true);
          sounds.playMove();
        }
      })
      .on('broadcast', { event: 'rematch_accepted' }, ({ payload }) => {
        if (payload?.room) {
          const updated = payload.room as XiangqiRoom;
          setRoom(updated);
          setGameState({
            board: updated.game_state.board,
            turn: updated.game_state.turn,
            moveHistory: updated.game_state.moveHistory || [],
            isCheck: updated.game_state.isCheck || false,
            isCheckmate: updated.game_state.isCheckmate || false,
            isStalemate: updated.game_state.isStalemate || false,
            winner: null,
          });
          setShowVictoryModal(false);
          setRematchRequestedByMe(false);
          setRematchOfferedByOpponent(false);
          statsRecordedRef.current = false;
          sounds.playClick();
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnline, room?.id, currentUserId, myOnlineSide, gameState.winner]);

  // Ghi nhận chỉ số thắng/thua khi kết thúc ván
  useEffect(() => {
    if (!gameState.winner || statsRecordedRef.current) return;
    statsRecordedRef.current = true;

    if (isOnline && myOnlineSide) {
      const isWin = gameState.winner === myOnlineSide;
      recordXiangqiGameResult(isWin ? 'win' : 'loss', false);
    } else if (gameMode === 'bot') {
      const humanSide: Side = botSide === 'red' ? 'black' : 'red';
      const isWin = gameState.winner === humanSide;
      recordXiangqiGameResult(isWin ? 'win' : 'loss', true);
    }
  }, [gameState.winner, isOnline, myOnlineSide, gameMode, botSide]);

  // Đi cờ (thực hiện nước đi)
  const handleMakeMove = async (from: Position, to: Position) => {
    const nextState = makeMove(gameState, from, to);
    if (!nextState) return;

    const last = nextState.moveHistory[nextState.moveHistory.length - 1];
    const isCaptured = Boolean(last?.captured);

    // Âm thanh
    if (nextState.winner) {
      sounds.playVictory();
      setShowVictoryModal(true);
    } else if (nextState.isCheck) {
      sounds.playCheck();
    } else if (isCaptured) {
      sounds.playCapture();
    } else {
      sounds.playMove();
    }

    setGameState(nextState);
    setSelectedPos(null);
    setLegalMoves([]);

    // Nếu chơi Online -> đồng bộ lên Supabase Postgres & broadcast cho đối thủ
    if (isOnline && room?.id) {
      const newStatus = nextState.winner ? 'completed' : 'in_progress';
      const onlineState: XiangqiGameState = {
        board: nextState.board,
        turn: nextState.turn,
        moveHistory: nextState.moveHistory,
        isCheck: nextState.isCheck,
        isCheckmate: nextState.isCheckmate,
        isStalemate: nextState.isStalemate,
        winner: nextState.winner,
        gameMode: 'pvp',
        hostAvatar: room.game_state?.hostAvatar,
        guestAvatar: room.game_state?.guestAvatar,
      };

      try {
        await updateXiangqiGameState(room.id, onlineState, newStatus);
        const channelName = `xiangqi_room:${room.id}`;
        const channel = supabase.channel(channelName);
        channel.send({
          type: 'broadcast',
          event: 'xiangqi_state',
          payload: { game_state: onlineState },
        });
      } catch (err) {
        console.error('Failed to sync move to room:', err);
      }
    }
  };

  // Bot AI tự động tính và đi cờ khi đến lượt
  useEffect(() => {
    if (!isBotTurn) return;

    setIsBotThinking(true);
    const thinkTime =
      botDifficulty === 'easy' ? 450 : botDifficulty === 'medium' ? 650 : 850;

    const timer = setTimeout(() => {
      const bestMove = getBestXiangqiBotMove(gameState.board, botSide, botDifficulty);
      if (bestMove) {
        handleMakeMove(bestMove.from, bestMove.to);
      }
      setIsBotThinking(false);
    }, thinkTime);

    return () => clearTimeout(timer);
  }, [isBotTurn, gameState.board, botSide, botDifficulty]);

  // Chọn quân cờ
  const handleSelectPiece = (pos: Position) => {
    if (isBotThinking || !isMyTurn) return;

    if (pos.row === -1) {
      setSelectedPos(null);
      setLegalMoves([]);
      return;
    }

    const piece = gameState.board[pos.row][pos.col];
    if (piece && piece.side === gameState.turn) {
      const moves = getLegalMoves(gameState.board, pos);
      setSelectedPos(pos);
      setLegalMoves(moves);
    }
  };

  // Khởi động lại ván cờ (Local / Bot)
  const handleRestart = () => {
    setGameState(createNewGame());
    setSelectedPos(null);
    setLegalMoves([]);
    setShowVictoryModal(false);
    setIsBotThinking(false);
    statsRecordedRef.current = false;
    sounds.playClick();
  };

  // Yêu cầu tái đấu trong Online Mode
  const handleOfferRematch = async () => {
    if (!isOnline || !room?.id) return;

    setRematchRequestedByMe(true);
    const channelName = `xiangqi_room:${room.id}`;
    const channel = supabase.channel(channelName);
    channel.send({
      type: 'broadcast',
      event: 'rematch_offer',
      payload: { from: currentUserId },
    });
  };

  // Chấp nhận tái đấu trong Online Mode
  const handleAcceptRematch = async () => {
    if (!isOnline || !room?.id || !room.guest_id) return;

    try {
      const updated = await startXiangqiRematch(
        room.id,
        room.host_id,
        room.guest_id,
        room.host_name,
        room.guest_name || 'Đối thủ',
        room.game_state?.hostAvatar,
        room.game_state?.guestAvatar
      );

      setRoom(updated);
      setGameState({
        board: updated.game_state.board,
        turn: updated.game_state.turn,
        moveHistory: [],
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        winner: null,
      });
      setShowVictoryModal(false);
      setRematchRequestedByMe(false);
      setRematchOfferedByOpponent(false);
      statsRecordedRef.current = false;

      const channelName = `xiangqi_room:${room.id}`;
      const channel = supabase.channel(channelName);
      channel.send({
        type: 'broadcast',
        event: 'rematch_accepted',
        payload: { room: updated },
      });
      sounds.playClick();
    } catch (e) {
      console.error('Failed to accept rematch:', e);
    }
  };

  // Đầu hàng / Xin thua
  const handleResign = async () => {
    const resigningTurn = gameState.turn;
    const winner: Side = resigningTurn === 'red' ? 'black' : 'red';

    const nextState: GameState = {
      ...gameState,
      winner,
      isCheckmate: false,
      isStalemate: false,
    };

    setGameState(nextState);
    setShowVictoryModal(true);
    sounds.playDefeat();

    if (isOnline && room?.id) {
      const onlineState: XiangqiGameState = {
        board: nextState.board,
        turn: nextState.turn,
        moveHistory: nextState.moveHistory,
        isCheck: false,
        isCheckmate: false,
        isStalemate: false,
        winner,
        gameMode: 'pvp',
        isResigned: true,
      };
      await updateXiangqiGameState(room.id, onlineState, 'completed');
      const channelName = `xiangqi_room:${room.id}`;
      supabase.channel(channelName).send({
        type: 'broadcast',
        event: 'xiangqi_state',
        payload: { game_state: onlineState },
      });
    }
  };

  // Rời phòng
  const handleLeaveGame = async () => {
    if (isOnline && room?.id) {
      await leaveXiangqiRoom(room.id);
    }
    onLeave();
  };

  // Sao chép mã phòng
  const handleCopyCode = () => {
    if (!room?.code) return;
    navigator.clipboard.writeText(room.code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const isGameOver = Boolean(gameState.winner);
  const isBoardDisabled = isGameOver || isBotThinking || !isMyTurn;
  const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1] || null;

  return (
    <div className="mx-auto flex flex-col items-center gap-4 max-w-lg select-none pb-6">
      {/* Banner Chờ đối thủ tham gia phòng Online */}
      {isWaitingGuest && room && (
        <div className="w-full rounded-2xl border border-amber-200 bg-amber-50/90 p-4 shadow-sm animate-fade-in text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-900 mb-2">
            <span className="h-2 w-2 rounded-full bg-amber-600 animate-pulse" />
            <span>{language === 'vi' ? 'Đang Chờ Đối Thủ Vào Phòng' : 'Waiting for Opponent'}</span>
          </div>

          <div className="flex items-center justify-center gap-3 my-2">
            <span className="text-2xl font-mono font-black tracking-widest text-gray-900 bg-white px-4 py-1.5 rounded-xl border border-amber-300 shadow-xs">
              {room.code}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-gray-800 active:scale-95 transition-all"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedCode ? (language === 'vi' ? 'Đã chép' : 'Copied') : (language === 'vi' ? 'Chép mã' : 'Copy code')}</span>
            </button>
          </div>

          <p className="text-xs text-amber-800 leading-relaxed">
            {language === 'vi'
              ? 'Gửi mã 6 ký tự trên cho bạn bè để bắt đầu trận cờ tướng online thời gian thực!'
              : 'Share the 6-character code with your friend to start real-time Xiangqi PvP!'}
          </p>
        </div>
      )}

      {/* Banner thông báo lời mời tái đấu trong Online Mode */}
      {rematchOfferedByOpponent && !gameState.winner && (
        <div className="w-full flex items-center justify-between gap-3 rounded-2xl bg-indigo-50 border border-indigo-200 p-3.5 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
            <Handshake className="h-4 w-4 text-indigo-600" />
            <span>{language === 'vi' ? 'Đối thủ muốn tái đấu ván mới!' : 'Opponent offered a rematch!'}</span>
          </div>
          <button
            type="button"
            onClick={handleAcceptRematch}
            className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-black text-white hover:bg-indigo-700 active:scale-95 transition-all"
          >
            {language === 'vi' ? 'Đồng ý' : 'Accept'}
          </button>
        </div>
      )}

      {/* Bàn cờ Cờ Tướng */}
      <XiangqiBoard
        board={gameState.board}
        turn={gameState.turn}
        selectedPos={selectedPos}
        legalMoves={legalMoves}
        lastMove={lastMove}
        isCheck={gameState.isCheck}
        flipped={flipped}
        showSubLabel={showSubLabel}
        disabled={isBoardDisabled}
        onSelectPiece={handleSelectPiece}
        onMakeMove={handleMakeMove}
      />

      {/* Bộ điều khiển & Trạng thái ván đấu */}
      <XiangqiControls
        turn={gameState.turn}
        isCheck={gameState.isCheck}
        isGameOver={isGameOver}
        winner={gameState.winner}
        moveCount={gameState.moveHistory.length}
        moveHistory={gameState.moveHistory}
        flipped={flipped}
        showSubLabel={showSubLabel}
        playerRedName={effectiveRedName}
        playerBlackName={effectiveBlackName}
        gameMode={gameMode}
        isBotThinking={isBotThinking}
        onFlip={() => setFlipped((prev) => !prev)}
        onToggleSubLabel={() => setShowSubLabel((prev) => !prev)}
        onRestart={isOnline ? handleOfferRematch : handleRestart}
        onResign={handleResign}
        onLeave={handleLeaveGame}
      />

      {/* Modal Vinh danh Kết quả Ván đấu */}
      {showVictoryModal && gameState.winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-gray-100 text-center animate-scale-up">
            {/* Cúp vinh danh */}
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-amber-950 shadow-lg ring-4 ring-amber-100">
              <Trophy className="h-8 w-8 fill-current" />
            </div>

            <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-800 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-600" />
              <span>
                {gameState.isCheckmate
                  ? language === 'vi' ? 'Chiếu Bí (Checkmate)' : 'Checkmate'
                  : gameState.isStalemate
                  ? language === 'vi' ? 'Hết Nước Đi (Stalemate)' : 'Stalemate'
                  : language === 'vi' ? 'Đối Thủ Đầu Hàng' : 'Resignation'}
              </span>
            </div>

            <h2 className="text-2xl font-black text-gray-900 mb-1">
              {gameState.winner === 'red'
                ? `${effectiveRedName} (Đỏ) Chiến Thắng!`
                : `${effectiveBlackName} (Đen) Chiến Thắng!`}
            </h2>

            <p className="text-xs text-gray-500 mb-6">
              {language === 'vi'
                ? `Ván cờ kết thúc sau ${gameState.moveHistory.length} nước đi.`
                : `Match completed after ${gameState.moveHistory.length} moves.`}
            </p>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={handleLeaveGame}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-3 text-xs font-bold text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Home className="h-4 w-4" />
                <span>{language === 'vi' ? 'Về Sảnh' : 'Lobby'}</span>
              </button>

              {isOnline ? (
                rematchOfferedByOpponent ? (
                  <button
                    type="button"
                    onClick={handleAcceptRematch}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-3 text-xs font-black text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all"
                  >
                    <Handshake className="h-4 w-4" />
                    <span>{language === 'vi' ? 'Chấp Nhận Tái Đấu' : 'Accept Rematch'}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOfferRematch}
                    disabled={rematchRequestedByMe}
                    className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-xs font-black text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all disabled:opacity-50"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{rematchRequestedByMe ? (language === 'vi' ? 'Đã gửi lời mời...' : 'Offered...') : (language === 'vi' ? 'Mời Tái Đấu' : 'Offer Rematch')}</span>
                  </button>
                )
              ) : (
                <button
                  type="button"
                  onClick={handleRestart}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-3 text-xs font-black text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{language === 'vi' ? 'Ván Mới' : 'Play Again'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
