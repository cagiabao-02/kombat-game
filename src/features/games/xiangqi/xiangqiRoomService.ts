import { supabase } from '@/lib/supabase/client';
import { XiangqiRoom, XiangqiGameState, RoomStatus } from './types';
import { createInitialBoard } from './xiangqiLogic';

export const INITIAL_XIANGQI_GAME_STATE: XiangqiGameState = {
  board: createInitialBoard(),
  turn: 'red',
  moveHistory: [],
  isCheck: false,
  isCheckmate: false,
  isStalemate: false,
  winner: null,
  gameMode: 'pvp',
};

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function createXiangqiRoom(
  hostId: string,
  hostName: string,
  hostAvatar?: string
): Promise<XiangqiRoom> {
  let code = generateRoomCode();
  let attempts = 0;

  const initialGameState: XiangqiGameState = {
    ...INITIAL_XIANGQI_GAME_STATE,
    gameMode: 'pvp',
    hostAvatar: hostAvatar || '👑',
  };

  while (attempts < 5) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        game_id: 'xiangqi',
        status: 'waiting',
        host_id: hostId,
        host_name: hostName,
        game_state: initialGameState,
      } as any)
      .select('*')
      .single();

    if (!error && data) {
      return data as XiangqiRoom;
    }

    code = generateRoomCode();
    attempts++;
  }

  throw new Error('Không thể tạo phòng cờ tướng mới, vui lòng thử lại.');
}

export async function getXiangqiRoomByCode(code: string): Promise<XiangqiRoom | null> {
  const upperCode = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('game_id', 'xiangqi')
    .eq('code', upperCode)
    .single();

  if (error || !data) {
    return null;
  }
  return data as XiangqiRoom;
}

export async function joinXiangqiRoom(
  roomId: string,
  guestId: string,
  guestName: string,
  guestAvatar?: string
): Promise<XiangqiRoom> {
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
    throw new Error(error?.message || 'Không thể tham gia phòng cờ tướng này.');
  }

  return data as XiangqiRoom;
}

export async function updateXiangqiGameState(
  roomId: string,
  gameState: XiangqiGameState,
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
    console.error('Error updating xiangqi game state:', error);
    throw error;
  }
}

export async function leaveXiangqiRoom(roomId: string): Promise<void> {
  const payload: Record<string, any> = {
    status: 'abandoned',
    updated_at: new Date().toISOString(),
  };

  await supabase.from('rooms').update(payload as any).eq('id', roomId);
}

export async function findOrCreateXiangqiQuickMatch(
  userId: string,
  userName: string,
  userAvatar?: string
): Promise<{ room: XiangqiRoom; role: 'host' | 'guest' }> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // Tìm phòng cờ tướng đang chờ
  const { data: availableRooms, error: searchError } = await supabase
    .from('rooms')
    .select('*')
    .eq('game_id', 'xiangqi')
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
      return { room: joinedRoom as XiangqiRoom, role: 'guest' };
    }
  }

  // Không tìm thấy phòng trống -> tạo phòng mới và làm Host
  const newRoom = await createXiangqiRoom(userId, userName, userAvatar);
  return { room: newRoom, role: 'host' };
}

export async function cancelXiangqiQuickMatch(roomId: string): Promise<void> {
  await supabase
    .from('rooms')
    .update({
      status: 'abandoned',
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', roomId)
    .eq('status', 'waiting');
}

export async function startXiangqiRematch(
  roomId: string,
  currentHostId: string,
  currentGuestId: string,
  currentHostName: string,
  currentGuestName: string,
  currentHostAvatar?: string,
  currentGuestAvatar?: string
): Promise<XiangqiRoom> {
  const initialGameState: XiangqiGameState = {
    ...INITIAL_XIANGQI_GAME_STATE,
    board: createInitialBoard(),
    hostAvatar: currentGuestAvatar || '👑',
    guestAvatar: currentHostAvatar || '👑',
  };

  // Đảo phe: Guest cũ thành Host (Đỏ - đi trước), Host cũ thành Guest (Đen - đi sau)
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

  return data as XiangqiRoom;
}

