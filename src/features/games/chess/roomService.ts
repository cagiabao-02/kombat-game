import { supabase } from '@/lib/supabase/client';
import { ChessRoom, ChessGameState, RoomStatus } from './types';

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

export async function createChessRoom(hostId: string, hostName: string): Promise<ChessRoom> {
  let code = generateRoomCode();
  let attempts = 0;

  while (attempts < 5) {
    const { data, error } = await supabase
      .from('rooms')
      .insert({
        code,
        game_id: 'chess',
        status: 'waiting',
        host_id: hostId,
        host_name: hostName,
        game_state: INITIAL_GAME_STATE,
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
  guestName: string
): Promise<ChessRoom> {
  const { data, error } = await supabase
    .from('rooms')
    .update({
      guest_id: guestId,
      guest_name: guestName,
      status: 'in_progress',
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
