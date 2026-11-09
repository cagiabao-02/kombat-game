import { supabase } from '@/lib/supabase/client';
import { CaroRoom, CaroGameState, RoomStatus, CaroBotDifficulty, CaroPiece } from './types';
import { createEmptyBoard } from './caroLogic';

export const INITIAL_CARO_GAME_STATE: CaroGameState = {
  board: createEmptyBoard(),
  turn: 'X',
  history: [],
  winner: null,
  winningLine: null,
  isGameOver: false,
  gameMode: 'pvp',
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

export async function createCaroRoom(
  hostId: string,
  hostName: string,
  hostAvatar?: string
): Promise<CaroRoom> {
  let code = generateRoomCode();
  let attempts = 0;

  const initialGameState: CaroGameState = {
    ...INITIAL_CARO_GAME_STATE,
    gameMode: 'pvp',
    hostAvatar: hostAvatar || '👑',
  };

  while (attempts < 5) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        game_id: 'caro',
        status: 'waiting',
        host_id: hostId,
        host_name: hostName,
        game_state: initialGameState,
      } as any)
      .select('*')
      .single();

    if (!error && data) {
      return data as CaroRoom;
    }

    code = generateRoomCode();
    attempts++;
  }

  throw new Error('Không thể tạo phòng mới, vui lòng thử lại.');
}

export async function getCaroRoomByCode(code: string): Promise<CaroRoom | null> {
  const upperCode = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', upperCode)
    .single();

  if (error || !data) {
    return null;
  }
  return data as CaroRoom;
}

export async function joinCaroRoom(
  roomId: string,
  guestId: string,
  guestName: string,
  guestAvatar?: string
): Promise<CaroRoom> {
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

  return data as CaroRoom;
}

export async function updateCaroGameState(
  roomId: string,
  gameState: CaroGameState,
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
    console.error('Error updating caro game state:', error);
    throw error;
  }
}

export async function leaveCaroRoom(roomId: string): Promise<void> {
  const payload: Record<string, any> = {
    status: 'abandoned',
    updated_at: new Date().toISOString(),
  };

  await supabase.from('rooms').update(payload as any).eq('id', roomId);
}

export async function findOrCreateCaroQuickMatch(
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<{ room: CaroRoom; role: 'host' | 'guest' }> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  const { data: availableRooms, error: searchError } = await supabase
    .from('rooms')
    .select('*')
    .eq('game_id', 'caro')
    .eq('status', 'waiting')
    .is('guest_id', null)
    .neq('host_id', userId)
    .gte('created_at', fifteenMinutesAgo)
    .order('created_at', { ascending: true })
    .limit(5);

  if (!searchError && availableRooms && availableRooms.length > 0) {
    const matchingRoom = availableRooms[0];
    const existingState = matchingRoom.game_state || {};

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
      return { room: joinedRoom as CaroRoom, role: 'guest' };
    }
  }

  const newRoom = await createCaroRoom(userId, userName, userAvatar);
  return { room: newRoom, role: 'host' };
}

export async function cancelCaroQuickMatch(roomId: string): Promise<void> {
  await supabase
    .from('rooms')
    .update({
      status: 'abandoned',
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', roomId)
    .eq('status', 'waiting');
}

export async function startCaroRematch(
  roomId: string,
  currentHostId: string,
  currentGuestId: string,
  currentHostName: string,
  currentGuestName: string,
  currentHostAvatar?: string,
  currentGuestAvatar?: string
): Promise<CaroRoom> {
  const initialGameState: CaroGameState = {
    ...INITIAL_CARO_GAME_STATE,
    board: createEmptyBoard(),
    hostAvatar: currentGuestAvatar || '👑',
    guestAvatar: currentHostAvatar || '👑',
  };

  // Swap pieces on rematch: Previous guest becomes Host (X), previous Host becomes Guest (O)
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

  return data as CaroRoom;
}

export function createBotCaroRoom(
  userId: string,
  userName: string,
  playerPieceChoice: 'X' | 'O' | 'random' = 'X',
  difficulty: CaroBotDifficulty = 'medium',
  userAvatar?: string
): CaroRoom {
  const chosenPiece: CaroPiece =
    playerPieceChoice === 'random'
      ? Math.random() < 0.5
        ? 'X'
        : 'O'
      : playerPieceChoice;

  const botPiece: CaroPiece = chosenPiece === 'X' ? 'O' : 'X';
  const botName =
    difficulty === 'easy'
      ? 'Bot Kombat (Dễ)'
      : difficulty === 'medium'
      ? 'Bot Kombat (Vừa)'
      : 'Bot Kombat (Khó)';

  const isPlayerX = chosenPiece === 'X';

  const initialGameState: CaroGameState = {
    ...INITIAL_CARO_GAME_STATE,
    board: createEmptyBoard(),
    gameMode: 'bot',
    botDifficulty: difficulty,
    botPlayer: botPiece,
    hostAvatar: isPlayerX ? userAvatar || '👑' : '🤖',
    guestAvatar: isPlayerX ? '🤖' : userAvatar || '👑',
  };

  return {
    id: `bot_caro_${Date.now()}`,
    code: 'BOTCARO',
    game_id: 'caro',
    status: 'in_progress',
    host_id: isPlayerX ? userId : 'bot_kombat',
    host_name: isPlayerX ? userName : botName,
    guest_id: isPlayerX ? 'bot_kombat' : userId,
    guest_name: isPlayerX ? botName : userName,
    game_state: initialGameState,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    is_bot_game: true,
    bot_difficulty: difficulty,
  };
}

export function startBotCaroRematch(currentRoom: CaroRoom, userAvatar?: string): CaroRoom {
  const previousBotPiece = currentRoom.game_state.botPlayer || 'O';
  const newBotPiece: CaroPiece = previousBotPiece === 'X' ? 'O' : 'X';
  const difficulty = currentRoom.bot_difficulty || 'medium';

  const isPlayerX = newBotPiece === 'O';
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

  const initialGameState: CaroGameState = {
    ...INITIAL_CARO_GAME_STATE,
    board: createEmptyBoard(),
    gameMode: 'bot',
    botDifficulty: difficulty,
    botPlayer: newBotPiece,
    hostAvatar: isPlayerX ? userAvatar || '👑' : '🤖',
    guestAvatar: isPlayerX ? '🤖' : userAvatar || '👑',
  };

  return {
    ...currentRoom,
    id: `bot_caro_${Date.now()}`,
    status: 'in_progress',
    host_id: isPlayerX ? playerId : 'bot_kombat',
    host_name: isPlayerX ? playerName : botName,
    guest_id: isPlayerX ? 'bot_kombat' : playerId,
    guest_name: isPlayerX ? botName : playerName,
    game_state: initialGameState,
    updated_at: new Date().toISOString(),
  };
}

export function createLocalCaroRoom(player1Name: string = 'Người chơi 1', player2Name: string = 'Người chơi 2'): CaroRoom {
  return {
    id: `local_caro_${Date.now()}`,
    code: 'LOCAL',
    game_id: 'caro',
    status: 'in_progress',
    host_id: 'local_p1',
    host_name: player1Name,
    guest_id: 'local_p2',
    guest_name: player2Name,
    game_state: {
      ...INITIAL_CARO_GAME_STATE,
      board: createEmptyBoard(),
      gameMode: 'local',
      hostAvatar: '🔴',
      guestAvatar: '🔵',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

