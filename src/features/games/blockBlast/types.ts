export type GridCell = string | null; // null: ô trống; string: mã màu retro của khối
export type BoardGrid = GridCell[][]; // Ma trận 8x8

export interface ShapeCell {
  r: number;
  c: number;
}

export interface BlockShape {
  id: string;
  name: string;
  color: string; // Mã màu hex hoặc CSS class
  borderColor: string;
  matrix: number[][]; // Ma trận 0 và 1 thể hiện hình dạng
  cellsCount: number; // Tổng số ô 1 (để tính điểm đặt)
}

export interface TraySlot {
  id: string; // Unique ID cho mỗi slot chia bài
  shape: BlockShape;
  used: boolean;
}

export interface BlockBlastActiveState {
  board: BoardGrid;
  tray: TraySlot[];
  score: number;
  comboStreak: number;
  linesCleared: number;
  lastUpdated: number;
}

export interface ClearedLineInfo {
  rows: number[];
  cols: number[];
  clearedCellCoords: { r: number; c: number }[];
  totalLines: number;
}
