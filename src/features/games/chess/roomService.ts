import { supabase } from '@/lib/supabase/client';
import { ChessRoom, ChessGameState, RoomStatus, BotDifficulty } from './types';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export const INITIAL_GAME_STATE: ChessGameState = {
  fen: INITIAL_FEN,
  history: [],
  turn: 'w',
  isCheck: false,
  isCheckmate: false,
  isDraw: false,
  winner: null,
  lastMove: null,
};

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createChessRoom(
  hostId: string,
  hostName: string,
  timeControl: number = 0,
  hostAvatar?: string
): Promise<ChessRoom> {
  let code = generateRoomCode();
  let attempts = 0;

  const initialGameState: ChessGameState = {
    ...INITIAL_GAME_STATE,
    timeControl,
    whiteTime: timeControl,
    blackTime: timeControl,
    lastMoveTimestamp: Date.now(),
    hostAvatar: hostAvatar || '👑',
  };

  while (attempts < 5) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        game_id: 'chess',
        status: 'waiting',
        host_id: hostId,
        host_name: hostName,
        game_state: initialGameState,
      } as any)
      .select('*')
      .single();

    if (!error && data) {
      return data as ChessRoom;
    }

    // If duplicate code, retry with new code
    code = generateRoomCode();
    attempts++;
  }

  throw new Error('Không thể tạo phòng mới, vui lòng thử lại.');
}

export async function getChessRoomByCode(code: string): Promise<ChessRoom | null> {
  const upperCode = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', upperCode)
    .single();

  if (error || !data) {
    return null;
  }
  return data as ChessRoom;
}

export async function joinChessRoom(
  roomId: string,
  guestId: string,
  guestName: string,
  guestAvatar?: string
): Promise<ChessRoom> {
  // Fetch existing room state to preserve hostAvatar
  const { data: currentRoom } = await supabase
    .from('rooms')
    .select('game_state')
    .eq('id', roomId)
    .single();

  const existingState = currentRoom?.game_state || {};

  const { data, error } = await supabase
    .from('rooms')
    .update({
      guest_id: guestId,
      guest_name: guestName,
      status: 'in_progress',
      game_state: {
        ...existingState,
        guestAvatar: guestAvatar || '👑',
      },
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', roomId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'Không thể tham gia phòng này.');
  }

  return data as ChessRoom;
}

export async function updateChessGameState(
  roomId: string,
  gameState: ChessGameState,
  newStatus?: RoomStatus
): Promise<void> {
  const payload: Record<string, any> = {
    game_state: gameState,
    updated_at: new Date().toISOString(),
  };

  if (newStatus) {
    payload.status = newStatus;
  }

  const { error } = await supabase
    .from('rooms')
    .update(payload as any)
    .eq('id', roomId);

  if (error) {
    console.error('Error updating game state:', error);
    throw error;
  }
}

export async function leaveChessRoom(
  roomId: string,
  _userId: string,
  _isHost: boolean
): Promise<void> {
  const payload: Record<string, any> = {
    status: 'abandoned',
    updated_at: new Date().toISOString(),
  };

  await supabase.from('rooms').update(payload as any).eq('id', roomId);
}

export async function findOrCreateQuickMatchRoom(
  userId: string,
  userName: string,
  timeControl: number = 0,
  userAvatar?: string
): Promise<{ room: ChessRoom; role: 'host' | 'guest' }> {
  // 1. Look for existing available room created in the last 15 minutes
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data: availableRooms, error: searchError } = await supabase
    .from('rooms')
    .select('*')
    .eq('game_id', 'chess')
    .eq('status', 'waiting')
    .is('guest_id', null)
    .neq('host_id', userId)
    .gte('created_at', fifteenMinutesAgo)
    .order('created_at', { ascending: true })
    .limit(5);

  if (!searchError && availableRooms && availableRooms.length > 0) {
    // STRICT MATCH: ONLY join if timeControl is EXACTLY identical
    const matchingRoom = availableRooms.find(
      (r: any) => Number(r.game_state?.timeControl ?? 0) === Number(timeControl ?? 0)
    );

    if (matchingRoom) {
      const existingState = matchingRoom.game_state || {};
      // Atomically join this room (concurrency guard: status must still be 'waiting')
      const { data: joinedRoom, error: joinError } = await supabase
        .from('rooms')
        .update({
          guest_id: userId,
          guest_name: userName,
          status: 'in_progress',
          game_state: {
            ...existingState,
            guestAvatar: userAvatar || '👑',
          },
          updated_at: new Date().toISOString(),
        } as any)
        .eq('id', matchingRoom.id)
        .eq('status', 'waiting')
        .is('guest_id', null)
        .select('*')
        .single();

      if (!joinError && joinedRoom) {
        return { room: joinedRoom as ChessRoom, role: 'guest' };
      }
    }
  }

  // 2. If no room available or joining failed due to race condition, create a new waiting room
  const newRoom = await createChessRoom(userId, userName, timeControl, userAvatar);
  return { room: newRoom, role: 'host' };
}

export async function cancelQuickMatch(roomId: string): Promise<void> {
  await supabase
    .from('rooms')
    .update({
      status: 'abandoned',
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', roomId)
    .eq('status', 'waiting');
}

export async function startRematchRoom(
  roomId: string,
  currentHostId: string,
  currentGuestId: string,
  currentHostName: string,
  currentGuestName: string,
  timeControl: number = 0,
  currentHostAvatar?: string,
  currentGuestAvatar?: string
): Promise<ChessRoom> {
  const initialGameState: ChessGameState = {
    ...INITIAL_GAME_STATE,
    timeControl,
    whiteTime: timeControl,
    blackTime: timeControl,
    lastMoveTimestamp: Date.now(),
    hostAvatar: currentGuestAvatar || '👑',
    guestAvatar: currentHostAvatar || '👑',
  };

  // Swap colors on rematch: Previous guest becomes host (White), previous host becomes guest (Black)
  const { data, error } = await supabase
    .from('rooms')
    .update({
      host_id: currentGuestId,
      host_name: currentGuestName,
      guest_id: currentHostId,
      guest_name: currentHostName,
      status: 'in_progress',
      game_state: initialGameState,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', roomId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Không thể bắt đầu ván mới.');
  }

  return data as ChessRoom;
}

export function createBotChessRoom(
  userId: string,
  userName: string,
  playerColorChoice: 'white' | 'black' | 'random' = 'white',
  difficulty: BotDifficulty = 'medium',
  timeControl: number = 0,
  userAvatar?: string
): ChessRoom {
  const chosenColor: 'white' | 'black' =
    playerColorChoice === 'random'
      ? Math.random() < 0.5
        ? 'white'
        : 'black'
      : playerColorChoice;

  const botColor: 'white' | 'black' = chosenColor === 'white' ? 'black' : 'white';
  const botName =
    difficulty === 'easy'
      ? 'Bot Kombat (Dễ)'
      : difficulty === 'medium'
      ? 'Bot Kombat (Vừa)'
      : 'Bot Kombat (Khó)';

  const isPlayerWhite = chosenColor === 'white';

  const initialGameState: ChessGameState = {
    ...INITIAL_GAME_STATE,
    timeControl,
    whiteTime: timeControl,
    blackTime: timeControl,
    lastMoveTimestamp: Date.now(),
    isBotGame: true,
    botDifficulty: difficulty,
    botColor,
    hostAvatar: isPlayerWhite ? (userAvatar || '👑') : '🤖',
    guestAvatar: isPlayerWhite ? '🤖' : (userAvatar || '👑'),
  };

  return {
    id: `bot_room_${Date.now()}`,
    code: 'BOTAI1',
    game_id: 'chess',
    status: 'in_progress',
    host_id: isPlayerWhite ? userId : 'bot_kombat',
    host_name: isPlayerWhite ? userName : botName,
    guest_id: isPlayerWhite ? 'bot_kombat' : userId,
    guest_name: isPlayerWhite ? botName : userName,
    game_state: initialGameState,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_bot_game: true,
    bot_difficulty: difficulty,
  };
}

export function startBotRematchRoom(currentRoom: ChessRoom, userAvatar?: string): ChessRoom {
  const previousBotColor = currentRoom.game_state.botColor || 'black';
  const newBotColor = previousBotColor === 'white' ? 'black' : 'white';
  const timeControl = currentRoom.game_state.timeControl || 0;
  const difficulty = currentRoom.bot_difficulty || 'medium';

  const isPlayerWhite = newBotColor === 'black';
  const botName =
    currentRoom.host_id === 'bot_kombat'
      ? currentRoom.host_name
      : currentRoom.guest_name || 'Bot Kombat';
  const playerName =
    currentRoom.host_id !== 'bot_kombat'
      ? currentRoom.host_name
      : currentRoom.guest_name || 'Người chơi';
  const playerId =
    currentRoom.host_id !== 'bot_kombat'
      ? currentRoom.host_id
      : currentRoom.guest_id || 'player';

  const initialGameState: ChessGameState = {
    ...INITIAL_GAME_STATE,
    timeControl,
    whiteTime: timeControl,
    blackTime: timeControl,
    lastMoveTimestamp: Date.now(),
    isBotGame: true,
    botDifficulty: difficulty,
    botColor: newBotColor,
    hostAvatar: isPlayerWhite ? (userAvatar || '👑') : '🤖',
    guestAvatar: isPlayerWhite ? '🤖' : (userAvatar || '👑'),
  };

  return {
    ...currentRoom,
    id: `bot_room_${Date.now()}`,
    status: 'in_progress',
    host_id: isPlayerWhite ? playerId : 'bot_kombat',
    host_name: isPlayerWhite ? playerName : botName,
    guest_id: isPlayerWhite ? 'bot_kombat' : playerId,
    guest_name: isPlayerWhite ? botName : playerName,
    game_state: initialGameState,
    updated_at: new Date().toISOString(),
  };
}
