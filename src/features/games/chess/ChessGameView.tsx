'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Chess, Move } from 'chess.js';
import { supabase } from '@/lib/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { ChessRoom, ChessGameState, PlayerColor, RoomStatus } from './types';
import { updateChessGameState, leaveChessRoom, startRematchRoom, startBotRematchRoom } from './roomService';
import { ChessBoard } from './ChessBoard';
import { MoveHistory } from './MoveHistory';
import { sounds } from '@/lib/sound/soundService';
import { getBotMove, simulateBotThinkingDelay } from './ai/chessBot';
import { recordChessGameResult } from './statsService';
import { Copy, Check, Users, Flag, LogOut, Sparkles, AlertCircle, Clock, WifiOff, Trophy, Eye, RotateCcw, Bot, Smile } from 'lucide-react';

interface ChessGameViewProps {
  initialRoom: ChessRoom;
  currentUserId: string;
  onExitRoom: () => void;
}

export function ChessGameView({
  initialRoom,
  currentUserId,
  onExitRoom,
}: ChessGameViewProps) {
  const { t, language } = useLanguage();
  const [room, setRoom] = useState<ChessRoom>(initialRoom);
  const [copied, setCopied] = useState(false);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const channelRef = useRef<any>(null);

  const isHost = room.host_id === currentUserId;
  const isBotGame = Boolean(room.is_bot_game || room.game_state.isBotGame);
  const myColor: PlayerColor = isHost ? 'white' : 'black';
  const myTurnChar = myColor === 'white' ? 'w' : 'b';
  const isMyTurn = room.status === 'in_progress' && room.game_state.turn === myTurnChar;

  const botColor: PlayerColor = room.game_state.botColor || (myColor === 'white' ? 'black' : 'white');
  const botTurnChar = botColor === 'white' ? 'w' : 'b';
  const isBotTurn = isBotGame && room.status === 'in_progress' && room.game_state.turn === botTurnChar;
  const [isBotThinking, setIsBotThinking] = useState(false);

  const opponentId = isHost ? room.guest_id : room.host_id;
  const opponentIdRef = useRef<string | null | undefined>(opponentId);
  opponentIdRef.current = opponentId;

  const roomStatusRef = useRef<RoomStatus>(room.status);
  roomStatusRef.current = room.status;

  const [isOpponentDisconnected, setIsOpponentDisconnected] = useState(false);
  const [disconnectCountdown, setDisconnectCountdown] = useState(30);
  const [showGameOverModal, setShowGameOverModal] = useState(true);
  const [rematchRequestedByMe, setRematchRequestedByMe] = useState(false);
  const [rematchOfferedByOpponent, setRematchOfferedByOpponent] = useState(false);

  // Emoji Reactions State
  const [activeReactions, setActiveReactions] = useState<{
    id: string;
    emoji: string;
    target: 'me' | 'opponent';
  }[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const EMOJI_OPTIONS = ['👍', '🔥', '👏', '🤔', '😂', '😭'];

  // Ref to prevent duplicate recording of match stats
  const hasRecordedResultRef = useRef<string | null>(null);

  const handleIncomingReaction = useCallback(
    (emoji: string, target: 'me' | 'opponent') => {
      sounds.playClick();
      const id = `${Date.now()}_${Math.random()}`;
      setActiveReactions((prev) => [...prev, { id, emoji, target }]);
      setTimeout(() => {
        setActiveReactions((prev) => prev.filter((r) => r.id !== id));
      }, 2500);
    },
    []
  );

  const handleSendReaction = useCallback(
    (emoji: string) => {
      handleIncomingReaction(emoji, 'me');
      setShowReactionPicker(false);

      if (!isBotGame && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'chess_reaction',
          payload: {
            from: currentUserId,
            emoji,
          },
        });
      }

      // If playing with Bot, bot playfully replies with subtle probability
      if (isBotGame) {
        if (Math.random() < 0.45) {
          setTimeout(() => {
            const botReplies = ['👍', '🔥', '🤔', '👏'];
            const randomReply =
              botReplies[Math.floor(Math.random() * botReplies.length)];
            handleIncomingReaction(randomReply, 'opponent');
          }, 850);
        }
      }
    },
    [currentUserId, isBotGame, handleIncomingReaction]
  );

  // Auto record match stats in localStorage once when game ends
  useEffect(() => {
    if (room.status === 'completed' && room.game_state.winner) {
      if (hasRecordedResultRef.current !== room.id) {
        hasRecordedResultRef.current = room.id;
        const result: 'win' | 'loss' | 'draw' =
          room.game_state.winner === myColor
            ? 'win'
            : room.game_state.winner === 'draw'
            ? 'draw'
            : 'loss';
        recordChessGameResult(result, isBotGame);
      }
    }
  }, [room.status, room.game_state.winner, room.id, myColor, isBotGame]);

  const timeControl = room.game_state.timeControl ?? 0;
  const [whiteSeconds, setWhiteSeconds] = useState<number>(
    room.game_state.whiteTime ?? (timeControl > 0 ? timeControl : 0)
  );
  const [blackSeconds, setBlackSeconds] = useState<number>(
    room.game_state.blackTime ?? (timeControl > 0 ? timeControl : 0)
  );

  // Sync remaining seconds when room state updates from server / peer
  useEffect(() => {
    if (room.game_state.whiteTime !== undefined) {
      setWhiteSeconds(room.game_state.whiteTime);
    }
    if (room.game_state.blackTime !== undefined) {
      setBlackSeconds(room.game_state.blackTime);
    }
    if (room.status === 'in_progress') {
      setShowGameOverModal(true);
      setRematchRequestedByMe(false);
      setRematchOfferedByOpponent(false);
    }
  }, [
    room.game_state.whiteTime,
    room.game_state.blackTime,
    room.game_state.history.length,
    room.status,
  ]);

  const handleTimeout = useCallback(
    async (timedOutSide: 'white' | 'black') => {
      if (room.status !== 'in_progress') return;
      const winner = timedOutSide === 'white' ? 'black' : 'white';
      const newGameState: ChessGameState = {
        ...room.game_state,
        winner,
        isTimeout: true,
        whiteTime: timedOutSide === 'white' ? 0 : whiteSeconds,
        blackTime: timedOutSide === 'black' ? 0 : blackSeconds,
      };

      const updatedRoom: ChessRoom = {
        ...room,
        game_state: newGameState,
        status: 'completed',
      };

      setRoom(updatedRoom);
      sounds.playVictory();

      if (!isBotGame && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'room_state',
          payload: updatedRoom,
        });
      }

      if (!isBotGame) {
        await updateChessGameState(room.id, newGameState, 'completed');
      }
    },
    [room, whiteSeconds, blackSeconds, isBotGame]
  );

  // Claim victory when opponent disconnects
  const handleClaimVictory = useCallback(async () => {
    if (room.status !== 'in_progress') return;

    const winner = myColor;
    const newGameState: ChessGameState = {
      ...room.game_state,
      winner,
    };
    const updatedRoom: ChessRoom = {
      ...room,
      game_state: newGameState,
      status: 'completed',
    };

    setRoom(updatedRoom);
    sounds.playVictory();

    if (!isBotGame && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'room_state',
        payload: updatedRoom,
      });
    }

    if (!isBotGame) {
      await updateChessGameState(room.id, newGameState, 'completed');
    }
  }, [room, myColor, isBotGame]);

  // Offer rematch to opponent
  const handleOfferRematch = useCallback(() => {
    if (isBotGame) {
      const newRoom = startBotRematchRoom(room);
      setRoom(newRoom);
      setShowGameOverModal(true);
      setRematchRequestedByMe(false);
      setRematchOfferedByOpponent(false);
      sounds.playMatchFound();
      return;
    }

    setRematchRequestedByMe(true);
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'rematch_offer',
        payload: { from: currentUserId },
      });
    }
  }, [currentUserId, isBotGame, room]);

  // Accept rematch from opponent
  const handleAcceptRematch = useCallback(async () => {
    try {
      if (!room.guest_id) return;
      const newRoom = await startRematchRoom(
        room.id,
        room.host_id,
        room.guest_id,
        room.host_name,
        room.guest_name || '',
        room.game_state.timeControl || 0
      );

      setRoom(newRoom);
      setShowGameOverModal(true);
      setRematchRequestedByMe(false);
      setRematchOfferedByOpponent(false);
      sounds.playMatchFound();

      if (channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'rematch_accepted',
          payload: newRoom,
        });
      }
    } catch (err) {
      console.error('Failed to accept rematch:', err);
    }
  }, [room]);

  // Disconnection countdown (auto claim victory after 30s)
  useEffect(() => {
    if (isBotGame || !isOpponentDisconnected || room.status !== 'in_progress') {
      setDisconnectCountdown(30);
      return;
    }

    const timer = setInterval(() => {
      setDisconnectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleClaimVictory();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpponentDisconnected, room.status, handleClaimVictory, isBotGame]);

  // Clean disconnect on tab close
  useEffect(() => {
    if (isBotGame) return;
    const handleBeforeUnload = () => {
      if (channelRef.current) {
        channelRef.current.untrack();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isBotGame]);

  // Clock countdown interval
  useEffect(() => {
    if (room.status !== 'in_progress' || timeControl <= 0) return;

    const timer = setInterval(() => {
      if (room.game_state.turn === 'w') {
        setWhiteSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout('white');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleTimeout('black');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [room.status, room.game_state.turn, timeControl, handleTimeout]);

  const formatTime = (seconds: number) => {
    const s = Math.max(0, Math.floor(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return `${String(m).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
  };

  const mySeconds = myColor === 'white' ? whiteSeconds : blackSeconds;
  const opponentSeconds = myColor === 'white' ? blackSeconds : whiteSeconds;

  // Bot Turn Execution
  useEffect(() => {
    if (!isBotTurn) return;

    let isCancelled = false;

    const executeBotTurn = async () => {
      setIsBotThinking(true);
      await simulateBotThinkingDelay(room.bot_difficulty || 'medium');

      if (isCancelled || room.status !== 'in_progress') {
        setIsBotThinking(false);
        return;
      }

      const chess = new Chess(room.game_state.fen);
      const botMove = getBotMove(chess, room.bot_difficulty || 'medium');

      if (!botMove || isCancelled) {
        setIsBotThinking(false);
        return;
      }

      const moveResult = chess.move(botMove);
      if (!moveResult || isCancelled) {
        setIsBotThinking(false);
        return;
      }

      const isCheckmate = chess.isCheckmate();
      const isDraw = chess.isDraw();
      const isCheck = chess.inCheck();
      const isCaptured = moveResult.captured;

      if (isCheckmate) {
        sounds.playVictory();
      } else if (isCheck) {
        sounds.playCheck();
      } else if (isCaptured) {
        sounds.playCapture();
      } else {
        sounds.playMove();
      }

      let winner: 'white' | 'black' | 'draw' | null = null;
      let newStatus: RoomStatus = room.status;

      if (isCheckmate) {
        winner = botColor;
        newStatus = 'completed';
      } else if (isDraw) {
        winner = 'draw';
        newStatus = 'completed';
      }

      const newGameState: ChessGameState = {
        ...room.game_state,
        fen: chess.fen(),
        history: [...room.game_state.history, moveResult.san],
        turn: chess.turn() as 'w' | 'b',
        isCheck,
        isCheckmate,
        isDraw,
        winner,
        lastMove: { from: botMove.from, to: botMove.to },
        lastMoveTimestamp: Date.now(),
      };

      const updatedRoom: ChessRoom = {
        ...room,
        game_state: newGameState,
        status: newStatus,
      };

      setRoom(updatedRoom);
      setIsBotThinking(false);
    };

    executeBotTurn();

    return () => {
      isCancelled = true;
    };
  }, [isBotTurn, room.game_state.fen, room.status, room.bot_difficulty, botColor]);

  // Supabase Realtime: Postgres Changes + Broadcast + Presence tracking
  useEffect(() => {
    if (isBotGame) return;
    const channelName = `chess_room_${room.id}`;

    // Safely remove any existing channel with the same topic to avoid duplicate callback errors
    const channels = supabase.getChannels();
    for (const ch of channels) {
      if (ch.topic === `realtime:${channelName}` || ch.subTopic === channelName) {
        ch.unsubscribe();
        supabase.removeChannel(ch);
      }
    }
    // Also synchronously purge from RealtimeClient internal cache to prevent reusing an already subscribed instance
    if ((supabase as any).realtime?.channels) {
      (supabase as any).realtime.channels = (supabase as any).realtime.channels.filter(
        (ch: any) => ch.topic !== `realtime:${channelName}` && ch.subTopic !== channelName
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
            const updated = payload.new as ChessRoom;
            setRoom(updated);
            if (updated.status === 'abandoned' || updated.game_state?.winner) {
              sounds.playVictory();
            }
          }
        }
      )
      .on('broadcast', { event: 'room_state' }, ({ payload }) => {
        if (payload) {
          const updated = payload as ChessRoom;
          setRoom(updated);
          // Play sound for opponent move or victory
          if (
            updated.status === 'abandoned' ||
            updated.game_state.isCheckmate ||
            updated.game_state.winner
          ) {
            sounds.playVictory();
          } else if (updated.game_state.isCheck) {
            sounds.playCheck();
          } else if (updated.game_state.lastMove) {
            sounds.playMove();
          }
        }
      })
      .on('broadcast', { event: 'rematch_offer' }, ({ payload }) => {
        if (payload && payload.from !== currentUserId) {
          setRematchOfferedByOpponent(true);
          sounds.playClick();
        }
      })
      .on('broadcast', { event: 'rematch_accepted' }, ({ payload }) => {
        if (payload) {
          const updated = payload as ChessRoom;
          setRoom(updated);
          setShowGameOverModal(true);
          setRematchRequestedByMe(false);
          setRematchOfferedByOpponent(false);
          sounds.playMatchFound();
        }
      })
      .on('broadcast', { event: 'chess_reaction' }, ({ payload }) => {
        if (payload && payload.from !== currentUserId && payload.emoji) {
          handleIncomingReaction(payload.emoji, 'opponent');
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const curOpponentId = opponentIdRef.current;
        const curStatus = roomStatusRef.current;
        if (curOpponentId && curStatus === 'in_progress') {
          const hasOpponent = Boolean(
            state[curOpponentId] && (state[curOpponentId] as any[]).length > 0
          );
          if (!hasOpponent) {
            setIsOpponentDisconnected(true);
          } else {
            setIsOpponentDisconnected(false);
          }
        }
      })
      .on('presence', { event: 'join' }, ({ key }) => {
        if (key === opponentIdRef.current) {
          setIsOpponentDisconnected(false);
          setDisconnectCountdown(30);
        }
      })
      .on('presence', { event: 'leave' }, ({ key }) => {
        if (key === opponentIdRef.current && roomStatusRef.current === 'in_progress') {
          setIsOpponentDisconnected(true);
        }
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            userId: currentUserId,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      if ((supabase as any).realtime?.channels) {
        (supabase as any).realtime.channels = (supabase as any).realtime.channels.filter(
          (ch: any) => ch !== channel
        );
      }
      channelRef.current = null;
    };
  }, [room.id, currentUserId, isBotGame]);

  // Fallback Polling (mỗi 1.5s khi đang chờ đối thủ, và 3s trong trận) để đảm bảo không bị lỡ sự kiện
  useEffect(() => {
    if (isBotGame || room.status === 'completed' || room.status === 'abandoned') return;

    const intervalTime = room.status === 'waiting' ? 1500 : 3000;

    const interval = setInterval(async () => {
      try {
        const { data } = await supabase
          .from('rooms')
          .select('*')
          .eq('id', room.id)
          .single();

        if (data) {
          // If room state updated on server
          setRoom((prev) => {
            if (
              prev.status !== data.status ||
              prev.guest_id !== data.guest_id ||
              prev.game_state.fen !== data.game_state.fen ||
              prev.game_state.winner !== data.game_state.winner
            ) {
              return data as ChessRoom;
            }
            return prev;
          });
        }
      } catch (err) {
        // Ignore polling error
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [room.id, room.status]);

  // Handle player making a move on the board
  const handleMakeMove = useCallback(
    async (moveData: { from: string; to: string; promotion?: string }) => {
      if (!isMyTurn || isSubmittingMove || room.status !== 'in_progress') return;

      try {
        setIsSubmittingMove(true);
        const chess = new Chess(room.game_state.fen);

        const moveResult = chess.move({
          from: moveData.from,
          to: moveData.to,
          promotion: moveData.promotion || 'q',
        }) as Move | null;

        if (!moveResult) {
          setIsSubmittingMove(false);
          return;
        }

        const isCheckmate = chess.isCheckmate();
        const isDraw = chess.isDraw();
        const isCheck = chess.inCheck();
        const isCaptured = moveResult.captured;

        // Play tactile local sound
        if (isCheckmate) {
          sounds.playVictory();
        } else if (isCheck) {
          sounds.playCheck();
        } else if (isCaptured) {
          sounds.playCapture();
        } else {
          sounds.playMove();
        }

        let winner: 'white' | 'black' | 'draw' | null = null;
        let newStatus: RoomStatus = room.status;

        if (isCheckmate) {
          winner = myColor;
          newStatus = 'completed';
        } else if (isDraw) {
          winner = 'draw';
          newStatus = 'completed';
        }

        const newGameState: ChessGameState = {
          fen: chess.fen(),
          history: [...room.game_state.history, moveResult.san],
          turn: chess.turn() as 'w' | 'b',
          isCheck,
          isCheckmate,
          isDraw,
          winner,
          lastMove: { from: moveData.from, to: moveData.to },
          timeControl,
          whiteTime: whiteSeconds,
          blackTime: blackSeconds,
          lastMoveTimestamp: Date.now(),
        };

        const updatedRoom: ChessRoom = {
          ...room,
          game_state: newGameState,
          status: newStatus,
        };

        // Optimistically update local state for instant feedback
        setRoom(updatedRoom);

        // Broadcast to opponent via Realtime
        if (!isBotGame && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'room_state',
            payload: updatedRoom,
          });
        }

        // Persist to Supabase Database
        if (!isBotGame) {
          await updateChessGameState(room.id, newGameState, newStatus);
        }
      } catch (err) {
        console.error('Failed to make move:', err);
      } finally {
        setIsSubmittingMove(false);
      }
    },
    [isMyTurn, isSubmittingMove, room, myColor, timeControl, whiteSeconds, blackSeconds, isBotGame]
  );

  // Copy room link
  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/games/chess?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Resign match
  const handleResign = async () => {
    if (window.confirm('Bạn có chắc chắn muốn đầu hàng ván đấu này không?')) {
      const winner = myColor === 'white' ? 'black' : 'white';
      const newGameState: ChessGameState = {
        ...room.game_state,
        winner,
        isResigned: true,
      };
      const updatedRoom: ChessRoom = {
        ...room,
        game_state: newGameState,
        status: 'completed',
      };
      setRoom(updatedRoom);

      if (!isBotGame && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'room_state',
          payload: updatedRoom,
        });
      }

      if (!isBotGame) {
        await updateChessGameState(room.id, newGameState, 'completed');
      }
    }
  };

  // Leave room
  const handleLeave = async () => {
    if (window.confirm('Bạn có chắc muốn rời khỏi phòng chơi?')) {
      if (room.status === 'in_progress') {
        const winner = myColor === 'white' ? 'black' : 'white';
        const newGameState: ChessGameState = {
          ...room.game_state,
          winner,
          isResigned: true,
        };
        const updatedRoom: ChessRoom = {
          ...room,
          game_state: newGameState,
          status: 'completed',
        };
        if (!isBotGame && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'room_state',
            payload: updatedRoom,
          });
        }
        if (!isBotGame) {
          await updateChessGameState(room.id, newGameState, 'completed');
        }
      } else if (!isBotGame) {
        await leaveChessRoom(room.id, currentUserId, isHost);
      }
      onExitRoom();
    }
  };

  const opponentName = isHost
    ? room.guest_name || t.chess.waitingOpponent
    : room.host_name;
  const opponentColor = myColor === 'white' ? 'black' : 'white';

  return (
    <div className="mx-auto max-w-xl pb-10">
      {/* Waiting Lobby Overlay if waiting for 2nd player */}
      {room.status === 'waiting' && (
        <div className="mb-6 rounded-3xl border border-amber-200 bg-white p-6 sm:p-8 text-center shadow-lg animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 mb-4 animate-pulse">
            <Users className="h-7 w-7" />
          </div>

          <h2 className="text-xl font-black text-gray-900 sm:text-2xl">
            {t.chess.waitingOpponent}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm text-gray-600">
            {t.chess.waitingDesc}
          </p>

          {/* Room Code Banner */}
          <div className="my-6 inline-flex flex-col items-center justify-center rounded-2xl bg-gray-50 border border-gray-200 px-6 py-4">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              {t.chess.roomCode}
            </span>
            <span className="mt-1 font-mono text-3xl font-black tracking-widest text-indigo-700">
              {room.code}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? t.common.copied : t.chess.copyLink}</span>
            </button>

            <button
              type="button"
              onClick={handleLeave}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-3 text-xs font-semibold text-gray-600 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.chess.leaveRoom}</span>
            </button>
          </div>
        </div>
      )}

      {/* Opponent Profile Bar */}
      <div className="relative flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3 mb-3 shadow-sm">
        {/* Floating Opponent Reactions */}
        <div className="absolute -top-7 left-8 flex items-center gap-1.5 pointer-events-none z-30">
          {activeReactions
            .filter((r) => r.target === 'opponent')
            .map((r) => (
              <span
                key={r.id}
                className="inline-block text-2xl animate-bounce filter drop-shadow-md select-none transform transition-all duration-300"
              >
                {r.emoji}
              </span>
            ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm ${
              isBotGame
                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                : opponentColor === 'white'
                ? 'bg-gray-100 text-gray-800 border border-gray-300'
                : 'bg-gray-900 text-white'
            }`}
          >
            {isBotGame ? <Bot className="h-4 w-4" /> : opponentColor === 'white' ? '♔' : '♚'}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              {room.status === 'in_progress' && (
                <span
                  className={`h-2 w-2 rounded-full ${
                    isBotGame
                      ? 'bg-purple-500'
                      : isOpponentDisconnected
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-emerald-500'
                  }`}
                  title={isBotGame ? 'AI Bot' : isOpponentDisconnected ? 'Offline' : 'Online'}
                />
              )}
              <p className="text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[140px] sm:max-w-[200px]">
                {opponentName}
              </p>
            </div>
            <span className="text-[10px] text-gray-400 font-medium">
              {isBotGame
                ? `${opponentColor === 'white' ? t.chess.white : t.chess.black} • AI`
                : isOpponentDisconnected && room.status === 'in_progress'
                ? (language === 'vi' ? 'Đang mất kết nối...' : 'Disconnected...')
                : (opponentColor === 'white' ? t.chess.white : t.chess.black)}
            </span>
          </div>
        </div>

        {/* Opponent turn & Clock indicator */}
        <div className="flex items-center gap-2">
          {timeControl > 0 && (
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                opponentSeconds < 30 && room.status === 'in_progress'
                  ? 'border-red-400 bg-red-50 text-red-600 animate-pulse'
                  : !isMyTurn && room.status === 'in_progress'
                  ? 'border-amber-400 bg-amber-50 text-amber-800 ring-2 ring-amber-200'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(opponentSeconds)}</span>
            </div>
          )}

          {isBotThinking ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2.5 py-1 text-[11px] font-bold text-purple-800 animate-pulse">
              <Bot className="h-3 w-3" />
              <span>{t.chess.botThinking}</span>
            </span>
          ) : room.status === 'in_progress' && !isMyTurn ? (
            <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800 animate-pulse">
              {t.chess.opponentTurn}
            </span>
          ) : null}
        </div>
      </div>

      {/* Opponent Disconnected Alert Banner */}
      {isOpponentDisconnected && room.status === 'in_progress' && (
        <div className="mb-3 rounded-2xl border border-amber-300 bg-amber-50 p-3.5 shadow-sm animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-800 animate-pulse">
              <WifiOff className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                {t.chess.opponentDisconnected}
              </p>
              <p className="text-[11px] text-amber-700">
                {t.chess.reconnectingCountdown.replace('{seconds}', String(disconnectCountdown))}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Chess Board */}
      <ChessBoard
        fen={room.game_state.fen}
        playerColor={myColor}
        isMyTurn={isMyTurn}
        lastMove={room.game_state.lastMove}
        isCheck={room.game_state.isCheck}
        onMakeMove={handleMakeMove}
        disabled={room.status !== 'in_progress'}
      />

      {/* Player Profile & Controls Bar */}
      <div className="relative mt-3 flex items-center justify-between rounded-xl bg-white border border-gray-200 px-4 py-3 shadow-sm">
        {/* Floating Player Reactions */}
        <div className="absolute -top-7 left-8 flex items-center gap-1.5 pointer-events-none z-30">
          {activeReactions
            .filter((r) => r.target === 'me')
            .map((r) => (
              <span
                key={r.id}
                className="inline-block text-2xl animate-bounce filter drop-shadow-md select-none transform transition-all duration-300"
              >
                {r.emoji}
              </span>
            ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div
            className={`flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm ${
              myColor === 'white'
                ? 'bg-gray-100 text-gray-800 border border-gray-300'
                : 'bg-gray-900 text-white'
            }`}
          >
            {myColor === 'white' ? '♔' : '♚'}
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-indigo-700 truncate max-w-[140px] sm:max-w-[200px]">
              {isHost ? room.host_name : room.guest_name} ({language === 'vi' ? 'Bạn' : 'You'})
            </p>
            <span className="text-[10px] text-gray-400 font-medium">
              {myColor === 'white' ? t.chess.white : t.chess.black}
            </span>
          </div>
        </div>

        {/* Player turn indicator, Clock & Actions */}
        <div className="flex items-center gap-2">
          {timeControl > 0 && (
            <div
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 font-mono text-xs font-bold transition-all ${
                mySeconds < 30 && room.status === 'in_progress'
                  ? 'border-red-400 bg-red-50 text-red-600 animate-pulse'
                  : isMyTurn && room.status === 'in_progress'
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-800 ring-2 ring-emerald-200'
                  : 'border-gray-200 bg-gray-50 text-gray-700'
              }`}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{formatTime(mySeconds)}</span>
            </div>
          )}

          {room.status === 'in_progress' && isMyTurn && (
            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold text-emerald-800 animate-pulse">
              {t.chess.yourTurn}
            </span>
          )}

          {/* Reaction Emoji Picker */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowReactionPicker((prev) => !prev)}
              className={`rounded-lg border p-1.5 transition-colors ${
                showReactionPicker
                  ? 'border-indigo-400 bg-indigo-50 text-indigo-600'
                  : 'border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              }`}
              title={t.chess.sendReaction}
            >
              <Smile className="h-4 w-4" />
            </button>

            {/* Reaction Popover */}
            {showReactionPicker && (
              <div className="absolute bottom-full right-0 mb-2 flex items-center gap-1 rounded-2xl border border-gray-200 bg-white/95 backdrop-blur-sm p-1.5 shadow-xl animate-scale-up z-40">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSendReaction(emoji)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl text-lg hover:bg-gray-100 hover:scale-125 active:scale-95 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {room.status === 'in_progress' && (
            <button
              type="button"
              onClick={handleResign}
              className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
              title={t.chess.resign}
            >
              <Flag className="h-4 w-4" />
            </button>
          )}

          <button
            type="button"
            onClick={handleLeave}
            className="rounded-lg border border-gray-200 p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            title={t.chess.leaveRoom}
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Move History */}
      <div className="mt-3">
        <MoveHistory history={room.game_state.history} />
      </div>

      {/* Check Alert Banner */}
      {room.game_state.isCheck && room.status === 'in_progress' && (
        <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-2 px-4 text-xs font-bold text-red-700 animate-bounce">
          <AlertCircle className="h-4 w-4" />
          <span>{t.chess.check}</span>
        </div>
      )}

      {/* Game Over Centered Modal */}
      {room.status === 'completed' && showGameOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-gray-100 animate-scale-up">
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl mb-4 ${
                room.game_state.winner === myColor
                  ? 'bg-amber-100 text-amber-600'
                  : room.game_state.winner === 'draw'
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {room.game_state.winner === myColor ? (
                <Trophy className="h-8 w-8 animate-bounce" />
              ) : (
                <Sparkles className="h-8 w-8" />
              )}
            </div>

            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {room.game_state.winner === myColor
                ? t.chess.youWon
                : room.game_state.winner === 'draw'
                ? t.chess.draw
                : t.chess.youLost}
            </h3>

            <p className="mt-2 text-sm text-gray-600">
              {room.game_state.isCheckmate
                ? t.chess.checkmate
                : room.game_state.isTimeout
                ? room.game_state.winner === myColor
                  ? t.chess.timeoutWon
                  : t.chess.timeoutLost
                : room.game_state.isResigned
                ? room.game_state.winner === myColor
                  ? t.chess.resignedWon
                  : t.chess.resignedLost
                : isOpponentDisconnected && room.game_state.winner === myColor
                ? t.chess.opponentAbandonedWin
                : ''}
            </p>

            <div className="mt-6 flex flex-col gap-2.5">
              {/* Rematch Button */}
              {isBotGame ? (
                <button
                  type="button"
                  onClick={handleOfferRematch}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 py-3 text-sm font-bold text-white shadow-md hover:bg-purple-700 active:scale-95 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{t.chess.rematch}</span>
                </button>
              ) : rematchOfferedByOpponent ? (
                <button
                  type="button"
                  onClick={handleAcceptRematch}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all animate-pulse"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{t.chess.acceptRematch}</span>
                </button>
              ) : rematchRequestedByMe ? (
                <button
                  type="button"
                  disabled
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 py-3 text-xs font-semibold text-indigo-700 opacity-90 cursor-not-allowed"
                >
                  <Clock className="h-4 w-4 animate-spin text-indigo-600" />
                  <span>{t.chess.rematchWaiting}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOfferRematch}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>{t.chess.rematch}</span>
                </button>
              )}

              {/* Review Board Button */}
              <button
                type="button"
                onClick={() => setShowGameOverModal(false)}
                className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition-all"
              >
                <Eye className="h-4 w-4" />
                <span>{language === 'vi' ? 'Xem lại bàn cờ' : 'Review Board'}</span>
              </button>

              {/* Back to Lobby Button */}
              <button
                type="button"
                onClick={onExitRoom}
                className="w-full rounded-xl border border-transparent bg-gray-100 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-200 active:scale-95 transition-all"
              >
                {t.common.backToLobby}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Review Banner at Bottom (when modal is dismissed) */}
      {room.status === 'completed' && !showGameOverModal && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-indigo-200 bg-white p-4 shadow-sm animate-fade-in">
          <div>
            <h4 className="text-sm font-bold text-gray-900">
              {room.game_state.winner === myColor
                ? t.chess.youWon
                : room.game_state.winner === 'draw'
                ? t.chess.draw
                : t.chess.youLost}
            </h4>
            <p className="text-xs text-gray-500">
              {room.game_state.isCheckmate
                ? t.chess.checkmate
                : room.game_state.isTimeout
                ? room.game_state.winner === myColor
                  ? t.chess.timeoutWon
                  : t.chess.timeoutLost
                : room.game_state.isResigned
                ? room.game_state.winner === myColor
                  ? t.chess.resignedWon
                  : t.chess.resignedLost
                : isOpponentDisconnected && room.game_state.winner === myColor
                ? t.chess.opponentAbandonedWin
                : ''}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isBotGame ? (
              <button
                type="button"
                onClick={handleOfferRematch}
                className="inline-flex items-center gap-1.5 rounded-xl bg-purple-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-purple-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.chess.rematch}</span>
              </button>
            ) : rematchOfferedByOpponent ? (
              <button
                type="button"
                onClick={handleAcceptRematch}
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 animate-pulse"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.chess.acceptRematch}</span>
              </button>
            ) : rematchRequestedByMe ? (
              <span className="rounded-xl bg-indigo-50 px-3 py-2 text-[11px] font-semibold text-indigo-700">
                {t.chess.rematchWaiting}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleOfferRematch}
                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.chess.rematch}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExitRoom}
              className="rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 hover:bg-gray-50"
            >
              {t.common.backToLobby}
            </button>
          </div>
        </div>
      )}

      {/* Opponent Abandoned / Left Modal -> Award victory to remaining player */}
      {room.status === 'abandoned' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 sm:p-8 text-center shadow-2xl border border-gray-100 animate-scale-up">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-4">
              <Trophy className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">
              {t.chess.youWon}
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              {t.chess.opponentLeftWin}
            </p>
            <button
              type="button"
              onClick={onExitRoom}
              className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {t.common.backToLobby}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
