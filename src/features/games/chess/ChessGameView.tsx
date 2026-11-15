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
import { useAuth } from '@/features/auth/AuthContext';
import { getBotMove, simulateBotThinkingDelay } from './ai/chessBot';
import { recordChessGameResult } from './statsService';
import { UserAvatar } from '@/components/UserAvatar';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
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
  const { avatar: myAvatar } = useAuth();
  const [room, setRoom] = useState<ChessRoom>(initialRoom);
  const [copied, setCopied] = useState(false);
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);
  const channelRef = useRef<any>(null);

  const isHost = room.host_id === currentUserId;
  const isBotGame = Boolean(room.is_bot_game || room.game_state.isBotGame);
  const isLocalGame = Boolean(room.is_local_game || room.host_id === 'local_p1' || room.code === 'LOCAL1');
  const isOnlineGame = !isBotGame && !isLocalGame;

  const botColor: PlayerColor =
    room.game_state.botColor || (room.host_id === 'bot_kombat' ? 'white' : 'black');
  const myColor: PlayerColor = isLocalGame
    ? (room.game_state.turn === 'w' ? 'white' : 'black')
    : isBotGame
    ? (botColor === 'white' ? 'black' : 'white')
    : (isHost ? 'white' : 'black');
  const myTurnChar = myColor === 'white' ? 'w' : 'b';
  const isMyTurn = room.status === 'in_progress' && (isLocalGame ? true : room.game_state.turn === myTurnChar);
  const botTurnChar = botColor === 'white' ? 'w' : 'b';
  const isBotTurn = isBotGame && room.status === 'in_progress' && room.game_state.turn === botTurnChar;
  const [isBotThinking, setIsBotThinking] = useState(false);

  const isHumanWinner = isLocalGame
    ? Boolean(room.game_state.winner && room.game_state.winner !== 'draw')
    : room.game_state.winner === myColor;

  const opponentAvatar = isBotGame
    ? '🤖'
    : isLocalGame
    ? (myColor === 'white' ? '♚' : '♔')
    : isHost
    ? room.game_state.guestAvatar || (myColor === 'white' ? '♚' : '♔')
    : room.game_state.hostAvatar || (myColor === 'white' ? '♚' : '♔');

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
  const [showResignConfirm, setShowResignConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

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
      recordChessGameResult('loss', isBotGame);

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
    if (isLocalGame) {
      const initialGameState: ChessGameState = {
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        history: [],
        turn: 'w',
        isCheck: false,
        isCheckmate: false,
        isDraw: false,
        winner: null,
        lastMove: null,
        timeControl,
        whiteTime: timeControl,
        blackTime: timeControl,
        lastMoveTimestamp: Date.now(),
        hostAvatar: '♔',
        guestAvatar: '♚',
      };
      setRoom({
        ...room,
        game_state: initialGameState,
        status: 'in_progress',
      });
      setShowGameOverModal(false);
      sounds.playMatchFound();
      return;
    }

    if (isBotGame) {
      const newRoom = startBotRematchRoom(room, myAvatar);
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
  }, [currentUserId, isBotGame, isLocalGame, room, myAvatar, timeControl]);

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
        room.game_state.timeControl || 0,
        room.game_state.hostAvatar,
        room.game_state.guestAvatar
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
        sounds.playDefeat();
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
    if (isBotGame || isLocalGame) return;
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
  }, [room.id, currentUserId, isBotGame, isLocalGame]);

  // Fallback Polling (mỗi 1.5s khi đang chờ đối thủ, và 3s trong trận) để đảm bảo không bị lỡ sự kiện
  useEffect(() => {
    if (isBotGame || isLocalGame || room.status === 'completed' || room.status === 'abandoned') return;

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
        if (isOnlineGame && channelRef.current) {
          channelRef.current.send({
            type: 'broadcast',
            event: 'room_state',
            payload: updatedRoom,
          });
        }

        // Persist to Supabase Database
        if (isOnlineGame) {
          await updateChessGameState(room.id, newGameState, newStatus);
        }
      } catch (err) {
        console.error('Failed to make move:', err);
      } finally {
        setIsSubmittingMove(false);
      }
    },
    [isMyTurn, isSubmittingMove, room, myColor, timeControl, whiteSeconds, blackSeconds, isOnlineGame]
  );

  // Copy room link
  const handleCopyLink = () => {
    const inviteUrl = `${window.location.origin}/games/chess?room=${room.code}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Resign match
  const confirmResign = async () => {
    setShowResignConfirm(false);
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
    if (!isLocalGame) {
      recordChessGameResult('loss', isBotGame);
    }
    sounds.playDefeat();

    if (isOnlineGame && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'room_state',
        payload: updatedRoom,
      });
    }

    if (isOnlineGame) {
      await updateChessGameState(room.id, newGameState, 'completed');
    }
  };

  // Leave room
  const confirmLeave = async () => {
    setShowLeaveConfirm(false);
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
      if (!isLocalGame) {
        recordChessGameResult('loss', isBotGame);
      }
      if (isOnlineGame && channelRef.current) {
        channelRef.current.send({
          type: 'broadcast',
          event: 'room_state',
          payload: updatedRoom,
        });
      }
      if (isOnlineGame) {
        await updateChessGameState(room.id, newGameState, 'completed');
      }
    } else if (isOnlineGame) {
      await leaveChessRoom(room.id, currentUserId, isHost);
    }
    onExitRoom();
  };

  const handleLeaveClick = () => {
    if (room.status === 'in_progress') {
      setShowLeaveConfirm((prev) => !prev);
      setShowResignConfirm(false);
      setShowReactionPicker(false);
    } else {
      confirmLeave();
    }
  };

  const opponentName = isLocalGame
    ? (myColor === 'white' ? room.guest_name : room.host_name)
    : isHost
    ? room.guest_name || t.chess.waitingOpponent
    : room.host_name;
  const opponentColor = myColor === 'white' ? 'black' : 'white';
  const myDisplayName = isLocalGame
    ? (myColor === 'white' ? room.host_name : room.guest_name)
    : isHost
    ? room.host_name
    : room.guest_name;

  return (
    <div className="mx-auto max-w-xl pb-10">
      {/* Waiting Lobby Overlay if waiting for 2nd player */}
      {room.status === 'waiting' && (
        <div className="mb-6 pixel-box-lg bg-white p-6 sm:p-8 text-center animate-fade-in">
          <div className="mx-auto flex h-14 w-14 items-center justify-center border-2 border-zinc-900 bg-amber-300 text-zinc-900 shadow-pixel-sm mb-4 animate-pulse">
            <Users className="h-7 w-7" />
          </div>

          <h2 className="font-pixel text-2xl font-bold uppercase tracking-wide text-zinc-900 sm:text-3xl">
            {t.chess.waitingOpponent}
          </h2>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-zinc-600">
            {t.chess.waitingDesc}
          </p>

          {/* Room Code Banner */}
          <div className="my-6 inline-flex flex-col items-center justify-center border-2 border-zinc-900 bg-amber-50 px-8 py-4 shadow-pixel-sm">
            <span className="font-pixel text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              {t.chess.roomCode}
            </span>
            <span className="mt-1 font-mono text-3xl font-black tracking-[0.25em] text-zinc-900">
              {room.code}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="pixel-btn inline-flex w-full sm:w-auto items-center justify-center gap-2 bg-indigo-600 px-5 py-3 font-pixel text-xs sm:text-sm font-bold uppercase tracking-wider text-white hover:bg-indigo-500"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span>{copied ? t.common.copied : t.chess.copyLink}</span>
            </button>

            <button
              type="button"
              onClick={confirmLeave}
              className="pixel-btn inline-flex w-full sm:w-auto items-center justify-center gap-1.5 bg-white px-4 py-3 font-pixel text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-100"
            >
              <LogOut className="h-4 w-4" />
              <span>{t.chess.leaveRoom}</span>
            </button>
          </div>
        </div>
      )}

      {/* Opponent Profile Bar */}
      <div className="relative flex items-center justify-between pixel-box-sm bg-white px-3 py-2.5 sm:px-4 sm:py-3 mb-3 min-w-0">
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

        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-1">
          <div className="relative shrink-0">
            <UserAvatar
              avatar={opponentAvatar}
              className={`h-9 w-9 text-lg ${
                isBotGame
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-white'
              }`}
            />
            <span
              className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center border-2 border-zinc-900 text-[9px] font-bold ${
                opponentColor === 'white'
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-900 text-white'
              }`}
              title={opponentColor === 'white' ? t.chess.white : t.chess.black}
            >
              {isBotGame ? <Bot className="h-2.5 w-2.5" /> : opponentColor === 'white' ? '♔' : '♚'}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              {room.status === 'in_progress' && (
                <span
                  className={`h-2.5 w-2.5 border border-zinc-900 shrink-0 ${
                    isBotGame
                      ? 'bg-purple-500'
                      : isOpponentDisconnected
                      ? 'bg-amber-500 animate-ping'
                      : 'bg-emerald-500'
                  }`}
                  title={isBotGame ? 'AI Bot' : isOpponentDisconnected ? 'Offline' : 'Online'}
                />
              )}
              <p className="font-pixel text-xs sm:text-sm font-bold uppercase text-zinc-900 truncate max-w-[100px] sm:max-w-[200px]">
                {opponentName}
              </p>
            </div>
            <span className="font-pixel text-[10px] text-zinc-500 font-bold uppercase">
              {isBotGame
                ? `${opponentColor === 'white' ? t.chess.white : t.chess.black} • AI`
                : isOpponentDisconnected && room.status === 'in_progress'
                ? (language === 'vi' ? 'Đang mất kết nối...' : 'Disconnected...')
                : (opponentColor === 'white' ? t.chess.white : t.chess.black)}
            </span>
          </div>
        </div>

        {/* Opponent turn & Clock indicator */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {timeControl > 0 && (
            <div
              className={`flex items-center gap-1.5 border-2 border-zinc-900 px-2 py-1 sm:px-2.5 sm:py-1 font-mono text-[11px] sm:text-xs font-black transition-all shrink-0 shadow-pixel-xs ${
                opponentSeconds < 30 && room.status === 'in_progress'
                  ? 'bg-red-500 text-white animate-pulse'
                  : !isMyTurn && room.status === 'in_progress'
                  ? 'bg-amber-300 text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{formatTime(opponentSeconds)}</span>
            </div>
          )}

          {isBotThinking ? (
            <span className="inline-flex items-center gap-1 border-2 border-zinc-900 bg-purple-200 px-2 py-0.5 sm:px-2.5 sm:py-1 font-pixel text-[10px] sm:text-[11px] font-bold uppercase text-purple-900 animate-pulse shrink-0">
              <Bot className="h-3 w-3" />
              <span>{t.chess.botThinking}</span>
            </span>
          ) : room.status === 'in_progress' && !isMyTurn ? (
            <span className="border-2 border-zinc-900 bg-amber-200 px-2 py-0.5 sm:px-2.5 sm:py-1 font-pixel text-[10px] sm:text-[11px] font-bold uppercase text-zinc-900 animate-pulse shrink-0">
              {t.chess.opponentTurn}
            </span>
          ) : null}
        </div>
      </div>

      {/* Opponent Disconnected Alert Banner */}
      {isOpponentDisconnected && room.status === 'in_progress' && (
        <div className="mb-3 pixel-box-sm bg-amber-100 p-3.5 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center border-2 border-zinc-900 bg-amber-300 text-zinc-900 animate-pulse">
              <WifiOff className="h-5 w-5" />
            </div>
            <div>
              <p className="font-pixel text-xs sm:text-sm font-bold uppercase text-zinc-900">
                {t.chess.opponentDisconnected}
              </p>
              <p className="text-[11px] font-bold text-amber-800">
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
      <div className="relative mt-3 flex items-center justify-between pixel-box-sm bg-white px-3 py-2.5 sm:px-4 sm:py-3 min-w-0">
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

        <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 pr-1">
          <div className="relative shrink-0">
            <UserAvatar
              avatar={myAvatar}
              className="h-9 w-9 text-lg bg-white"
            />
            <span
              className={`absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center border-2 border-zinc-900 text-[9px] font-bold ${
                myColor === 'white'
                  ? 'bg-white text-zinc-900'
                  : 'bg-zinc-900 text-white'
              }`}
              title={myColor === 'white' ? t.chess.white : t.chess.black}
            >
              {myColor === 'white' ? '♔' : '♚'}
            </span>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-pixel text-xs sm:text-sm font-bold uppercase text-indigo-700 truncate max-w-[85px] sm:max-w-[160px]">
                {myDisplayName}
              </p>
              {room.status === 'in_progress' && isMyTurn && (
                <span className="sm:hidden border border-zinc-900 bg-emerald-300 px-1.5 py-0.5 font-pixel text-[9px] font-bold uppercase text-zinc-900 animate-pulse shrink-0">
                  {language === 'vi' ? 'Lượt bạn' : 'Turn'}
                </span>
              )}
            </div>
            <span className="font-pixel text-[10px] text-zinc-500 font-bold uppercase">
              {myColor === 'white' ? t.chess.white : t.chess.black} ({language === 'vi' ? 'Bạn' : 'You'})
            </span>
          </div>
        </div>

        {/* Player turn indicator, Clock & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {timeControl > 0 && (
            <div
              className={`flex items-center gap-1.5 border-2 border-zinc-900 px-2 py-1 sm:px-2.5 sm:py-1 font-mono text-[11px] sm:text-xs font-black transition-all shrink-0 shadow-pixel-xs ${
                mySeconds < 30 && room.status === 'in_progress'
                  ? 'bg-red-500 text-white animate-pulse'
                  : isMyTurn && room.status === 'in_progress'
                  ? 'bg-emerald-300 text-zinc-900'
                  : 'bg-zinc-100 text-zinc-700'
              }`}
            >
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span>{formatTime(mySeconds)}</span>
            </div>
          )}

          {room.status === 'in_progress' && isMyTurn && (
            <span className="hidden sm:inline-block border-2 border-zinc-900 bg-emerald-300 px-2.5 py-1 font-pixel text-[11px] font-bold uppercase text-zinc-900 animate-pulse shrink-0">
              {t.chess.yourTurn}
            </span>
          )}

          {/* Reaction Emoji Picker */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => {
                setShowReactionPicker((prev) => !prev);
                setShowResignConfirm(false);
                setShowLeaveConfirm(false);
              }}
              className={`pixel-btn h-9 w-9 sm:h-10 sm:w-10 min-h-[36px] min-w-[36px] flex items-center justify-center outline-none ${
                showReactionPicker
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100'
              }`}
              title={t.chess.sendReaction}
              aria-label="Send Reaction"
            >
              <Smile className="h-4 w-4" />
            </button>

            {/* Reaction Popover */}
            {showReactionPicker && (
              <div className="absolute bottom-full right-0 mb-2 flex items-center gap-1.5 pixel-box bg-white p-1.5 z-40">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => handleSendReaction(emoji)}
                    className="flex h-9 w-9 items-center justify-center border border-transparent hover:border-zinc-900 hover:bg-amber-100 text-lg transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Resign Button & Confirmation Popover */}
          {room.status === 'in_progress' && (
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => {
                  setShowResignConfirm((prev) => !prev);
                  setShowLeaveConfirm(false);
                  setShowReactionPicker(false);
                }}
                className={`pixel-btn h-9 w-9 sm:h-10 sm:w-10 min-h-[36px] min-w-[36px] flex items-center justify-center outline-none ${
                  showResignConfirm
                    ? 'bg-red-500 text-white'
                    : 'bg-white text-zinc-700 hover:bg-red-100 hover:text-red-700'
                }`}
                title={t.chess.resign}
                aria-label="Resign"
              >
                <Flag className="h-4 w-4" />
              </button>

              {showResignConfirm && (
                <div className="absolute bottom-full right-0 mb-2 w-52 pixel-box bg-white p-3 z-40">
                  <p className="font-pixel text-xs font-bold uppercase text-zinc-900 mb-1">
                    {language === 'vi' ? 'Bạn muốn đầu hàng?' : 'Resign this match?'}
                  </p>
                  <p className="text-[11px] font-medium text-zinc-600 mb-2.5">
                    {language === 'vi' ? 'Đối thủ sẽ được xử thắng ván này.' : 'Opponent will be awarded the win.'}
                  </p>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={confirmResign}
                      className="pixel-btn flex-1 bg-red-600 py-1.5 font-pixel text-xs font-bold uppercase text-white hover:bg-red-500"
                    >
                      {language === 'vi' ? 'Đầu hàng' : 'Resign'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResignConfirm(false)}
                      className="pixel-btn flex-1 bg-zinc-100 py-1.5 font-pixel text-xs font-bold uppercase text-zinc-800 hover:bg-zinc-200"
                    >
                      {language === 'vi' ? 'Hủy' : 'Cancel'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Leave Button & Confirmation Popover */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={handleLeaveClick}
              className={`pixel-btn h-9 w-9 sm:h-10 sm:w-10 min-h-[36px] min-w-[36px] flex items-center justify-center outline-none ${
                showLeaveConfirm
                  ? 'bg-zinc-800 text-white'
                  : 'bg-white text-zinc-700 hover:bg-zinc-100'
              }`}
              title={t.chess.leaveRoom}
              aria-label="Leave Room"
            >
              <LogOut className="h-4 w-4" />
            </button>

            {showLeaveConfirm && (
              <div className="absolute bottom-full right-0 mb-2 w-56 pixel-box bg-white p-3 z-40">
                <p className="font-pixel text-xs font-bold uppercase text-zinc-900 mb-1">
                  {language === 'vi' ? 'Rời phòng thi đấu?' : 'Leave this game?'}
                </p>
                <p className="text-[11px] font-medium text-amber-800 mb-2.5">
                  {language === 'vi' ? 'Trận đấu đang diễn ra sẽ bị xử thua!' : 'You will forfeit this ongoing match!'}
                </p>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={confirmLeave}
                    className="pixel-btn flex-1 bg-amber-500 py-1.5 font-pixel text-xs font-bold uppercase text-zinc-900 hover:bg-amber-400"
                  >
                    {language === 'vi' ? 'Rời phòng' : 'Leave'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowLeaveConfirm(false)}
                    className="pixel-btn flex-1 bg-zinc-100 py-1.5 font-pixel text-xs font-bold uppercase text-zinc-800 hover:bg-zinc-200"
                  >
                    {language === 'vi' ? 'Ở lại' : 'Stay'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Move History */}
      <div className="mt-3">
        <MoveHistory history={room.game_state.history} />
      </div>

      {/* Check Alert Banner */}
      {room.game_state.isCheck && room.status === 'in_progress' && (
        <div className="mt-3 flex items-center justify-center gap-2 border-2 border-zinc-900 bg-red-500 py-2 px-4 font-pixel text-xs font-bold uppercase tracking-wider text-white shadow-pixel-sm animate-bounce">
          <AlertCircle className="h-4 w-4" />
          <span>{t.chess.check}</span>
        </div>
      )}

      {/* Game Over Centered Modal */}
      {room.status === 'completed' && showGameOverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in overflow-hidden">
          {/* Pixel Art Confetti Burst on Victory - CHỈ BẮN KHI CHIẾN THẮNG */}
          {isHumanWinner && (
            <PixelFxOverlay active={true} />
          )}

          <div className="relative w-full max-w-sm pixel-box-lg bg-white overflow-hidden text-center z-10">
            {/* Arcade Top Header */}
            <div
              className={`border-b-2 border-zinc-900 py-3 px-4 font-pixel text-xs font-bold uppercase tracking-widest ${
                isHumanWinner
                  ? 'bg-amber-400 text-zinc-900'
                  : room.game_state.winner === 'draw'
                  ? 'bg-sky-400 text-zinc-900'
                  : 'bg-zinc-800 text-white'
              }`}
            >
              {isHumanWinner ? '★ STAGE CLEAR ★' : room.game_state.winner === 'draw' ? 'DRAW GAME' : 'GAME OVER'}
            </div>

            <div className="p-6 sm:p-8">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center border-2 border-zinc-900 shadow-pixel-sm mb-4 ${
                  isHumanWinner
                    ? 'bg-amber-300 text-zinc-900'
                    : room.game_state.winner === 'draw'
                    ? 'bg-sky-200 text-zinc-900'
                    : 'bg-zinc-200 text-zinc-700'
                }`}
              >
                {isHumanWinner ? (
                  <Trophy className="h-8 w-8 animate-bounce" />
                ) : (
                  <Sparkles className="h-8 w-8" />
                )}
              </div>

              <h3 className="font-pixel text-2xl font-bold uppercase tracking-wide text-zinc-900">
                {isLocalGame
                  ? (room.game_state.winner === 'draw' ? t.chess.draw : `${room.game_state.winner === 'white' ? room.host_name : room.guest_name} Chiến Thắng!`)
                  : isHumanWinner
                  ? t.chess.youWon
                  : room.game_state.winner === 'draw'
                  ? t.chess.draw
                  : t.chess.youLost}
              </h3>

              <p className="mt-2 text-xs font-bold text-zinc-600">
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
                    className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-purple-600 py-3 font-pixel text-sm font-bold uppercase tracking-wider text-white hover:bg-purple-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{t.chess.rematch}</span>
                  </button>
                ) : rematchOfferedByOpponent ? (
                  <button
                    type="button"
                    onClick={handleAcceptRematch}
                    className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-emerald-500 py-3 font-pixel text-sm font-bold uppercase tracking-wider text-zinc-900 hover:bg-emerald-400 animate-pulse"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{t.chess.acceptRematch}</span>
                  </button>
                ) : rematchRequestedByMe ? (
                  <button
                    type="button"
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 border-2 border-zinc-900 bg-indigo-100 py-3 font-pixel text-xs font-bold uppercase tracking-wider text-indigo-800 opacity-90 cursor-not-allowed"
                  >
                    <Clock className="h-4 w-4 animate-spin text-indigo-600" />
                    <span>{t.chess.rematchWaiting}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOfferRematch}
                    className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-indigo-600 py-3 font-pixel text-sm font-bold uppercase tracking-wider text-white hover:bg-indigo-500"
                  >
                    <RotateCcw className="h-4 w-4" />
                    <span>{t.chess.rematch}</span>
                  </button>
                )}

                {/* Review Board Button */}
                <button
                  type="button"
                  onClick={() => setShowGameOverModal(false)}
                  className="pixel-btn inline-flex w-full items-center justify-center gap-1.5 bg-white py-2.5 font-pixel text-xs font-bold uppercase tracking-wider text-zinc-700 hover:bg-zinc-100"
                >
                  <Eye className="h-4 w-4" />
                  <span>{language === 'vi' ? 'Xem lại bàn cờ' : 'Review Board'}</span>
                </button>

                {/* Back to Lobby Button */}
                <button
                  type="button"
                  onClick={onExitRoom}
                  className="pixel-btn w-full bg-zinc-200 py-2.5 font-pixel text-xs font-bold uppercase tracking-wider text-zinc-800 hover:bg-zinc-300"
                >
                  {t.common.backToLobby}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Review Banner at Bottom (when modal is dismissed) */}
      {room.status === 'completed' && !showGameOverModal && (
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pixel-box bg-white p-4 animate-fade-in">
          <div>
            <h4 className="font-pixel text-sm font-bold uppercase text-zinc-900">
              {room.game_state.winner === myColor
                ? t.chess.youWon
                : room.game_state.winner === 'draw'
                ? t.chess.draw
                : t.chess.youLost}
            </h4>
            <p className="text-xs font-medium text-zinc-500">
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
                className="pixel-btn inline-flex items-center gap-1.5 bg-purple-600 px-3.5 py-2 font-pixel text-xs font-bold uppercase text-white hover:bg-purple-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.chess.rematch}</span>
              </button>
            ) : rematchOfferedByOpponent ? (
              <button
                type="button"
                onClick={handleAcceptRematch}
                className="pixel-btn inline-flex items-center gap-1.5 bg-emerald-500 px-3.5 py-2 font-pixel text-xs font-bold uppercase text-zinc-900 hover:bg-emerald-400 animate-pulse"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.chess.acceptRematch}</span>
              </button>
            ) : rematchRequestedByMe ? (
              <span className="border-2 border-zinc-900 bg-indigo-100 px-3 py-2 font-pixel text-[11px] font-bold uppercase text-indigo-800">
                {t.chess.rematchWaiting}
              </span>
            ) : (
              <button
                type="button"
                onClick={handleOfferRematch}
                className="pixel-btn inline-flex items-center gap-1.5 bg-indigo-600 px-3.5 py-2 font-pixel text-xs font-bold uppercase text-white hover:bg-indigo-500"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{t.chess.rematch}</span>
              </button>
            )}

            <button
              type="button"
              onClick={onExitRoom}
              className="pixel-btn bg-white px-3.5 py-2 font-pixel text-xs font-bold uppercase text-zinc-800 hover:bg-zinc-100"
            >
              {t.common.backToLobby}
            </button>
          </div>
        </div>
      )}

      {/* Opponent Abandoned / Left Modal -> Award victory to remaining player */}
      {room.status === 'abandoned' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
          <div className="w-full max-w-sm pixel-box-lg bg-white p-6 sm:p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-zinc-900 bg-amber-300 text-zinc-900 shadow-pixel-sm mb-4">
              <Trophy className="h-8 w-8 animate-bounce" />
            </div>
            <h3 className="font-pixel text-2xl font-bold uppercase tracking-wide text-zinc-900">
              {t.chess.youWon}
            </h3>
            <p className="mt-2 text-sm font-medium text-zinc-600">
              {t.chess.opponentLeftWin}
            </p>
            <button
              type="button"
              onClick={onExitRoom}
              className="pixel-btn mt-6 w-full bg-indigo-600 py-3 font-pixel text-sm font-bold uppercase tracking-wider text-white hover:bg-indigo-500"
            >
              {t.common.backToLobby}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
