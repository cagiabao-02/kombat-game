import { BlockBlastActiveState } from './types';

const BLOCK_BLAST_ACTIVE_KEY = 'kombat_block_blast_active_state_v1';

/**
 * Lưu trạng thái đang chơi dở vào LocalStorage
 */
export function saveBlockBlastActiveState(state: BlockBlastActiveState): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(BLOCK_BLAST_ACTIVE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Không thể lưu trạng thái ván đấu Block Blast:', err);
  }
}

/**
 * Đọc trạng thái ván đấu đang chơi dở (nếu có)
 */
export function loadBlockBlastActiveState(): BlockBlastActiveState | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(BLOCK_BLAST_ACTIVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as BlockBlastActiveState;

    // Kiểm tra tính hợp lệ cơ bản của dữ liệu (bàn 8x8, khay bài)
    if (
      Array.isArray(parsed.board) &&
      parsed.board.length === 8 &&
      Array.isArray(parsed.tray) &&
      parsed.tray.length === 3 &&
      typeof parsed.score === 'number'
    ) {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Xóa trạng thái đang chơi dở khi kết thúc ván (Game Over) hoặc người chơi chủ động "Chơi lại từ đầu"
 */
export function clearBlockBlastActiveState(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(BLOCK_BLAST_ACTIVE_KEY);
  } catch {}
}
