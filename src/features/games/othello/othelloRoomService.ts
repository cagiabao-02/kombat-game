import { supabase } from '@/lib/supabase/client';
import { createInitialBoard, countPieces, getValidMoves } from './othelloLogic';
import { OthelloGameState, OthelloRoom } from './types';

export function createInitialOthelloGameState(): OthelloGameState {
  const board = createInitialBoard();
  return {
    board,
    currentTurn: 'black',
    counts: countPieces(board),
    validMoves: getValidMoves(board, 'black'),
    lastMove: null,
    lastFlipped: [],
    passedLastTurn: false,
    isGameOver: false,
    winner: null,
    resignedBy: null,
    mode: 'online',
    aiDifficulty: 'medium',
    playerColor: 'black',
    moveCount: 0,
  };
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createOthelloRoom(
  hostId: string,
  hostName: string,
  hostAvatar?: string
): Promise<OthelloRoom> {
  let code = generateRoomCode();
  let attempts = 0;

  const initialGameState: OthelloGameState = {
    ...createInitialOthelloGameState(),
    hostAvatar: hostAvatar || '👑',
  };

  while (attempts < 5) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        game_id: 'othello',
        status: 'waiting',
        host_id: hostId,
        host_name: hostName,
        game_state: initialGameState,
      } as any)
      .select('*')
      .single();

    if (!error && data) {
      return data as OthelloRoom;
    }

    code = generateRoomCode();
    attempts++;
  }

  throw new Error('Không thể tạo phòng Cờ Lật mới, vui lòng thử lại.');
}

export async function getOthelloRoomByCode(code: string): Promise<OthelloRoom | null> {
  const normalizedCode = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('code', normalizedCode)
    .eq('game_id', 'othello')
    .single();

  if (error || !data) return null;
  return data as OthelloRoom;
}

export async function joinOthelloRoom(
  roomId: string,
  guestId: string,
  guestName: string,
  guestAvatar?: string
): Promise<OthelloRoom> {
  const { data: existing, error: fetchError } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (fetchError || !existing) {
    throw new Error('Không tìm thấy phòng chơi.');
  }

  const room = existing as OthelloRoom;

  if (room.host_id === guestId || room.guest_id === guestId) {
    return room;
  }

  if (room.guest_id !== null && room.status !== 'waiting') {
    throw new Error('Phòng này đã đủ 2 người chơi.');
  }

  const updatedState: OthelloGameState = {
    ...room.game_state,
    guestAvatar: guestAvatar || '🦊',
  };

  const { data, error } = await supabase
    .from('rooms')
    .update({
      guest_id: guestId,
      guest_name: guestName,
      status: 'in_progress',
      game_state: updatedState,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', roomId)
    .select('*')
    .single();

  if (error || !data) {
    throw new Error('Không thể tham gia phòng Cờ Lật.');
  }

  return data as OthelloRoom;
}

export async function findOrCreateQuickMatchOthelloRoom(
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<{ room: OthelloRoom; isHost: boolean }> {
  const thirtyMinsAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();

  const { data: waitingRooms } = await supabase
    .from('rooms')
    .select('*')
    .eq('game_id', 'othello')
    .eq('status', 'waiting')
    .is('guest_id', null)
    .neq('host_id', userId)
    .gte('created_at', thirtyMinsAgo)
    .order('created_at', { ascending: true })
    .limit(5);

  if (waitingRooms && waitingRooms.length > 0) {
    for (const candidate of waitingRooms as OthelloRoom[]) {
      try {
        const joined = await joinOthelloRoom(candidate.id, userId, userName, userAvatar);
        return { room: joined, isHost: false };
      } catch {
        continue;
      }
    }
  }

  const created = await createOthelloRoom(userId, userName, userAvatar);
  return { room: created, isHost: true };
}

export async function cancelQuickMatchOthello(roomId: string, hostId: string): Promise<void> {
  await supabase
    .from('rooms')
    .update({ status: 'abandoned', updated_at: new Date().toISOString() } as any)
    .eq('id', roomId)
    .eq('host_id', hostId)
    .eq('status', 'waiting');
}

export async function syncOthelloGameState(
  roomId: string,
  gameState: OthelloGameState,
  status: 'in_progress' | 'completed' | 'abandoned' = 'in_progress'
): Promise<void> {
  const { error } = await supabase
    .from('rooms')
    .update({
      game_state: gameState,
      status,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', roomId);

  if (error) {
    throw new Error('Không thể đồng bộ nước đi Cờ Lật.');
  }
}

export async function requestOthelloRematch(
  roomId: string,
  fromId: string,
  fromName: string,
  currentState: OthelloGameState
): Promise<void> {
  const nextState: OthelloGameState = {
    ...currentState,
    rematchRequest: { fromId, fromName },
  };
  await syncOthelloGameState(roomId, nextState, 'completed');
}

export async function acceptOthelloRematch(
  roomId: string,
  currentState: OthelloGameState
): Promise<OthelloGameState> {
  const fresh = createInitialOthelloGameState();
  const nextState: OthelloGameState = {
    ...fresh,
    hostAvatar: currentState.hostAvatar,
    guestAvatar: currentState.guestAvatar,
  };

  await supabase
    .from('rooms')
    .update({
      game_state: nextState,
      status: 'in_progress',
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', roomId);

  return nextState;
}
