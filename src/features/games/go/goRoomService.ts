import { supabase } from '@/lib/supabase/client';
import { BoardSize, GoGameState, GoRoom, RoomStatus } from './types';
import { createEmptyBoard } from './goLogic';

export function createInitialGoGameState(boardSize: BoardSize = 9): GoGameState {
  return {
    boardSize,
    board: createEmptyBoard(boardSize),
    currentTurn: 'black',
    captures: {
      black: 0,
      white: 0,
    },
    koPoint: null,
    consecutivePasses: 0,
    isGameOver: false,
    winner: null,
    resignedBy: null,
    score: null,
    mode: 'online',
    aiDifficulty: 'easy',
    playerColor: 'black',
    lastMove: null,
    moveHistory: [],
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

/**
 * Tạo phòng cờ vây mới với kích thước bàn cờ lựa chọn
 */
export async function createGoRoom(
  hostId: string,
  hostName: string,
  hostAvatar?: string,
  boardSize: BoardSize = 9
): Promise<GoRoom> {
  let code = generateRoomCode();
  let attempts = 0;

  const initialGameState = {
    ...createInitialGoGameState(boardSize),
    hostAvatar: hostAvatar || '👑',
  };

  while (attempts < 5) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        game_id: 'go',
        status: 'waiting',
        host_id: hostId,
        host_name: hostName,
        game_state: initialGameState,
      } as any)
      .select('*')
      .single();

    if (!error && data) {
      return data as GoRoom;
    }

    code = generateRoomCode();
    attempts++;
  }

  throw new Error('Không thể tạo phòng cờ vây mới, vui lòng thử lại.');
}

/**
 * Tìm phòng cờ vây theo mã 6 ký tự
 */
export async function getGoRoomByCode(code: string): Promise<GoRoom | null> {
  const upperCode = code.trim().toUpperCase();
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('game_id', 'go')
    .eq('code', upperCode)
    .single();

  if (error || !data) {
    return null;
  }
  return data as GoRoom;
}

/**
 * Khách tham gia phòng cờ vây
 */
export async function joinGoRoom(
  roomId: string,
  guestId: string,
  guestName: string,
  guestAvatar?: string
): Promise<GoRoom> {
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
    throw new Error(error?.message || 'Không thể tham gia phòng cờ vây này.');
  }

  return data as GoRoom;
}

/**
 * Đồng bộ trạng thái ván cờ vây lên Supabase
 */
export async function updateGoGameState(
  roomId: string,
  gameState: GoGameState,
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
    console.error('Error updating go game state:', error);
    throw error;
  }
}

/**
 * Rời phòng cờ vây (đánh dấu abandoned)
 */
export async function leaveGoRoom(roomId: string): Promise<void> {
  const payload: Record<string, any> = {
    status: 'abandoned',
    updated_at: new Date().toISOString(),
  };

  await supabase.from('rooms').update(payload as any).eq('id', roomId);
}

/**
 * Ghép trận nhanh (Quick Match): tìm phòng đang chờ cùng kích thước hoặc tạo phòng mới
 */
export async function findOrCreateGoQuickMatch(
  userId: string,
  userName: string,
  userAvatar?: string,
  boardSize: BoardSize = 9
): Promise<{ room: GoRoom; role: 'host' | 'guest' }> {
  const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();

  // Tìm phòng cờ vây đang chờ
  const { data: availableRooms, error: searchError } = await supabase
    .from('rooms')
    .select('*')
    .eq('game_id', 'go')
    .eq('status', 'waiting')
    .is('guest_id', null)
    .neq('host_id', userId)
    .gte('created_at', fifteenMinutesAgo)
    .order('created_at', { ascending: true })
    .limit(10);

  if (!searchError && availableRooms && availableRooms.length > 0) {
    // Ưu tiên phòng có cùng kích thước bàn cờ
    const matchingRoom =
      availableRooms.find((r) => r.game_state?.boardSize === boardSize) ||
      availableRooms[0];

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
      return { room: joinedRoom as GoRoom, role: 'guest' };
    }
  }

  // Không tìm thấy phòng trống -> tạo phòng mới và làm Host
  const newRoom = await createGoRoom(userId, userName, userAvatar, boardSize);
  return { room: newRoom, role: 'host' };
}

/**
 * Hủy tìm trận nhanh
 */
export async function cancelGoQuickMatch(roomId: string): Promise<void> {
  await supabase
    .from('rooms')
    .update({
      status: 'abandoned',
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', roomId)
    .eq('status', 'waiting');
}

/**
 * Bắt đầu ván tái đấu: đảo bên (Đen <-> Trắng)
 */
export async function startGoRematch(
  roomId: string,
  currentHostId: string,
  currentGuestId: string,
  currentHostName: string,
  currentGuestName: string,
  currentHostAvatar?: string,
  currentGuestAvatar?: string,
  boardSize: BoardSize = 9
): Promise<GoRoom> {
  const initialGameState = {
    ...createInitialGoGameState(boardSize),
    hostAvatar: currentGuestAvatar || '👑',
    guestAvatar: currentHostAvatar || '👑',
  };

  // Đảo phe: Guest cũ thành Host (Đen - đi trước), Host cũ thành Guest (Trắng - đi sau)
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
    throw new Error('Không thể bắt đầu ván tái đấu.');
  }

  return data as GoRoom;
}
