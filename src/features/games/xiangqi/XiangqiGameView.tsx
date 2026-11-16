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
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import { sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import { ChatBubble } from '@/features/social/ChatBubble';
import { ActiveSocialMessage, SocialContentType } from '@/features/social/types';
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

  // In-Game Social Chat & Reactions State
  const [activeSocialMessages, setActiveSocialMessages] = useState<ActiveSocialMessage[]>([]);
  const channelRef = useRef<any>(null);

  const handleIncomingSocial = useCallback(
    (type: SocialContentType, content: string, target: 'me' | 'opponent') => {
      sounds.playSocialPop();
      const id = `${Date.now()}_${Math.random()}`;
      setActiveSocialMessages((prev) => [...prev, { id, type, content, target, createdAt: Date.now() }]);
      setTimeout(() => {
        setActiveSocialMessages((prev) => prev.filter((r) => r.id !== id));
      }, 3500);
    },
    []
  );

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
      }

      // If playing with Bot, bot playfully replies with subtle probability
      if (gameMode === 'bot') {
        if (Math.random() < 0.45) {
          setTimeout(() => {
            if (type === 'chat') {
              const botChatReplies = [
                '🔥 Nước cờ cao kiến!',
                '🤔 Kỳ phùng địch thủ, để mình tính nước...',
                '⚔️ Chiếu tướng hay điều quân vậy bạn?',
                '👑 Tuyệt vời! Cảm ơn!',
                '☕ Nâng chén trà, đàm đạo cờ tướng nào!',
              ];
              const randomReply = botChatReplies[Math.floor(Math.random() * botChatReplies.length)];
              handleIncomingSocial('chat', randomReply, 'opponent');
            } else {
              const botReplies = ['👍', '🔥', '🤔', '👏', '😎'];
              const randomReply = botReplies[Math.floor(Math.random() * botReplies.length)];
              handleIncomingSocial('emote', randomReply, 'opponent');
            }
          }, 900);
        }
      }
    },
    [currentUserId, isOnline, gameMode, handleIncomingSocial]
  );

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

  // Xác định người chơi hiện tại có phải bên chiến thắng không (để bắn pháo hoa)
  const isHumanWinner =
    gameMode === 'local'
      ? Boolean(gameState.winner)
      : gameMode === 'bot'
      ? Boolean(gameState.winner && gameState.winner !== botSide)
      : isOnline && myOnlineSide
      ? gameState.winner === myOnlineSide
      : false;

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
            const willHumanWin = myOnlineSide ? nextState.winner === myOnlineSide : false;
            if (willHumanWin) {
              sounds.playVictory();
            } else {
              sounds.playDefeat();
            }
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
      .on('broadcast', { event: 'in_game_social' }, ({ payload }) => {
        if (payload && payload.from !== currentUserId && payload.content) {
          handleIncomingSocial(payload.type || 'emote', payload.content, 'opponent');
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      channelRef.current = null;
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
      const willHumanWin =
        gameMode === 'local'
          ? true
          : gameMode === 'bot'
          ? nextState.winner !== botSide
          : isOnline && myOnlineSide
          ? nextState.winner === myOnlineSide
          : false;

      if (willHumanWin) {
        sounds.playVictory();
      } else {
        sounds.playDefeat();
      }
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
  const isUserRed = isOnline ? isHost : (gameMode === 'bot' ? botSide !== 'red' : true);
  const isBoardDisabled = isGameOver || isBotThinking || !isMyTurn;
  const lastMove = gameState.moveHistory[gameState.moveHistory.length - 1] || null;

  return (
    <div className="mx-auto flex flex-col items-center gap-4 max-w-lg select-none pb-6">
      {/* Banner Chờ đối thủ tham gia phòng Online */}
      {isWaitingGuest && room && (
        <div className="w-full pixel-box bg-amber-50 p-4 animate-fade-in text-center">
          <div className="pixel-badge bg-amber-300 text-zinc-900 mb-2">
            <span className="h-2 w-2 border border-zinc-900 bg-amber-600 animate-pulse" />
            <span>{language === 'vi' ? 'Đang Chờ Đối Thủ Vào Phòng' : 'Waiting for Opponent'}</span>
          </div>

          <div className="flex items-center justify-center gap-3 my-3">
            <span className="text-2xl font-mono font-black tracking-[0.2em] text-zinc-900 bg-white px-4 py-1.5 border-2 border-zinc-900 shadow-pixel-sm">
              {room.code}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="pixel-btn inline-flex items-center gap-1.5 bg-zinc-900 px-3.5 py-2 font-pixel text-xs font-bold uppercase text-white hover:bg-zinc-800"
            >
              {copiedCode ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              <span>{copiedCode ? (language === 'vi' ? 'Đã chép' : 'Copied') : (language === 'vi' ? 'Chép mã' : 'Copy code')}</span>
            </button>
          </div>

          <p className="text-xs font-bold text-amber-900 leading-relaxed">
            {language === 'vi'
              ? 'Gửi mã 6 ký tự trên cho bạn bè để bắt đầu trận cờ tướng online thời gian thực!'
              : 'Share the 6-character code with your friend to start real-time Xiangqi PvP!'}
          </p>
        </div>
      )}

      {/* Banner thông báo lời mời tái đấu trong Online Mode */}
      {rematchOfferedByOpponent && !gameState.winner && (
        <div className="w-full flex items-center justify-between gap-3 pixel-box-sm bg-indigo-100 p-3.5 animate-fade-in">
          <div className="flex items-center gap-2 font-pixel text-xs font-bold uppercase text-indigo-900">
            <Handshake className="h-4 w-4 text-indigo-600" />
            <span>{language === 'vi' ? 'Đối thủ muốn tái đấu ván mới!' : 'Opponent offered a rematch!'}</span>
          </div>
          <button
            type="button"
            onClick={handleAcceptRematch}
            className="pixel-btn bg-indigo-600 px-3.5 py-1.5 font-pixel text-xs font-bold uppercase text-white hover:bg-indigo-500"
          >
            {language === 'vi' ? 'Đồng ý' : 'Accept'}
          </button>
        </div>
      )}

      {/* Player Header Card */}
      <div className="relative pixel-box w-full max-w-lg flex items-center justify-between bg-[#FFFDF8] px-3 py-2.5">
        {/* Floating Social Speech Bubbles for Red and Black (Below card pointing up) */}
        <div className="absolute top-full mt-2 left-3 sm:left-4 flex flex-col items-start gap-1 pointer-events-none z-40">
          {activeSocialMessages
            .filter((m) => m.target === (isUserRed ? 'me' : 'opponent'))
            .map((m) => (
              <ChatBubble key={m.id} message={m} align="left" placement="bottom" />
            ))}
        </div>
        <div className="absolute top-full mt-2 right-3 sm:right-4 flex flex-col items-end gap-1 pointer-events-none z-40">
          {activeSocialMessages
            .filter((m) => m.target === (isUserRed ? 'opponent' : 'me'))
            .map((m) => (
              <ChatBubble key={m.id} message={m} align="right" placement="bottom" />
            ))}
        </div>

        {/* Red Player (Left) */}
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center bg-rose-100 text-rose-700 font-pixel font-bold text-sm border-2 border-zinc-900 shadow-pixel-xs">
            帥
          </div>
          <div className="flex flex-col">
            <span className="font-pixel text-xs sm:text-sm font-bold text-zinc-950 leading-tight">
              {effectiveRedName}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
              {isOnline && isHost ? 'BẠN (ĐỎ)' : gameMode === 'bot' && botSide === 'black' ? 'BẠN (ĐỎ)' : 'P1 (ĐỎ)'}
            </span>
          </div>
        </div>

        <div className="pixel-badge bg-amber-300 px-2.5 py-0.5 text-[11px] font-bold text-zinc-950">
          <span>VS</span>
        </div>

        {/* Black Player (Right) */}
        <div className="flex items-center gap-2.5 flex-row-reverse text-right">
          <div className="flex h-9 w-9 items-center justify-center bg-zinc-900 text-white font-pixel font-bold text-sm border-2 border-zinc-900 shadow-pixel-xs">
            將
          </div>
          <div className="flex flex-col">
            <span className="font-pixel text-xs sm:text-sm font-bold text-zinc-950 leading-tight">
              {effectiveBlackName}
            </span>
            <span className="text-[10px] font-mono text-zinc-500 font-bold uppercase">
              {isOnline && !isHost ? 'BẠN (ĐEN)' : gameMode === 'bot' ? 'CPU (ĐEN)' : 'P2 (ĐEN)'}
            </span>
          </div>
        </div>
      </div>

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
        onSendMessage={handleSendSocial}
      />

      {/* Modal Vinh danh Kết quả Ván đấu */}
      {showVictoryModal && gameState.winner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in overflow-hidden">
          {/* Pixel Art Confetti Burst - CHỈ BẮN KHI CHIẾN THẮNG */}
          {isHumanWinner && (
            <PixelFxOverlay active={showVictoryModal} />
          )}

          <div className="relative w-full max-w-sm pixel-box-lg bg-white overflow-hidden text-center z-10">
            {/* Arcade Header */}
            <div
              className={`border-b-2 border-zinc-900 py-3 px-4 font-pixel text-xs font-bold uppercase tracking-widest ${
                isHumanWinner ? 'bg-amber-400 text-zinc-900' : 'bg-zinc-800 text-white'
              }`}
            >
              {isHumanWinner ? '★ STAGE CLEAR ★' : 'GAME OVER'}
            </div>

            <div className="p-6">
              {/* Cúp vinh danh (khi thắng) hoặc Biểu tượng Thất bại (khi thua) */}
              <div
                className={`mx-auto mb-3 flex h-16 w-16 items-center justify-center border-2 border-zinc-900 shadow-pixel-sm ${
                  isHumanWinner
                    ? 'bg-amber-300 text-zinc-900'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                <Trophy className="h-8 w-8 fill-current" />
              </div>

              <div
                className={`pixel-badge mb-2 ${
                  isHumanWinner
                    ? 'bg-amber-100 text-zinc-900'
                    : 'bg-zinc-100 text-zinc-700'
                }`}
              >
                <Sparkles className={`h-3.5 w-3.5 ${isHumanWinner ? 'text-amber-600' : 'text-zinc-500'}`} />
                <span>
                  {gameState.isCheckmate
                    ? language === 'vi' ? 'Chiếu Bí (Checkmate)' : 'Checkmate'
                    : gameState.isStalemate
                    ? language === 'vi' ? 'Hết Nước Đi (Stalemate)' : 'Stalemate'
                    : isHumanWinner
                    ? (language === 'vi' ? 'Đối Thủ Đầu Hàng' : 'Resignation')
                    : (language === 'vi' ? 'Đã Xin Thua' : 'Resigned')}
                </span>
              </div>

              <h2 className="font-pixel text-2xl font-bold uppercase tracking-wide text-zinc-900 mb-1">
                {gameMode === 'local'
                  ? (gameState.winner === 'red' ? `${effectiveRedName} (Đỏ) Chiến Thắng!` : `${effectiveBlackName} (Đen) Chiến Thắng!`)
                  : isHumanWinner
                  ? (language === 'vi' ? 'Bạn Đã Chiến Thắng!' : 'Victory!')
                  : (language === 'vi' ? 'Bạn Đã Thua Cuộc!' : 'Defeat!')}
              </h2>

              <p className="text-xs font-bold text-zinc-500 mb-6">
                {language === 'vi'
                  ? `Ván cờ kết thúc sau ${gameState.moveHistory.length} nước đi.`
                  : `Match completed after ${gameState.moveHistory.length} moves.`}
              </p>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={handleLeaveGame}
                  className="pixel-btn flex-1 flex items-center justify-center gap-1.5 bg-white py-3 font-pixel text-xs font-bold uppercase tracking-wider text-zinc-800 hover:bg-zinc-100"
                >
                  <Home className="h-4 w-4" />
                  <span>{language === 'vi' ? 'Về Sảnh' : 'Lobby'}</span>
                </button>

                {isOnline ? (
                  rematchOfferedByOpponent ? (
                    <button
                      type="button"
                      onClick={handleAcceptRematch}
                      className="pixel-btn flex-1 flex items-center justify-center gap-1.5 bg-emerald-500 py-3 font-pixel text-xs font-bold uppercase tracking-wider text-zinc-900 hover:bg-emerald-400"
                    >
                      <Handshake className="h-4 w-4" />
                      <span>{language === 'vi' ? 'Chấp Nhận Tái Đấu' : 'Accept Rematch'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleOfferRematch}
                      disabled={rematchRequestedByMe}
                      className="pixel-btn flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 py-3 font-pixel text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500 disabled:opacity-50"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>{rematchRequestedByMe ? (language === 'vi' ? 'Đã gửi lời mời...' : 'Offered...') : (language === 'vi' ? 'Mời Tái Đấu' : 'Offer Rematch')}</span>
                    </button>
                  )
                ) : (
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="pixel-btn flex-1 flex items-center justify-center gap-1.5 bg-indigo-600 py-3 font-pixel text-xs font-bold uppercase tracking-wider text-white hover:bg-indigo-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{language === 'vi' ? 'Ván Mới' : 'Play Again'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
