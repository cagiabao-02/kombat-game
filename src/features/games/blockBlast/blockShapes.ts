import { BlockShape } from './types';

// Bảng màu Retro Pixel rực rỡ và hài hòa với theme Kombat
export const BLOCK_COLORS = {
  CYAN: { bg: '#06b6d4', border: '#0891b2' },    // Thanh ngang / dọc dài
  YELLOW: { bg: '#eab308', border: '#ca8a04' },  // Vuông 2x2, 3x3
  PURPLE: { bg: '#a855f7', border: '#9333ea' },  // Chữ T
  GREEN: { bg: '#22c55e', border: '#16a34a' },   // Khối S / Z
  RED: { bg: '#ef4444', border: '#dc2626' },     // Chữ L
  BLUE: { bg: '#3b82f6', border: '#2563eb' },    // Chữ J
  ORANGE: { bg: '#f97316', border: '#ea580c' },  // Góc chữ L 2x2
  PINK: { bg: '#ec4899', border: '#db2777' },    // Chấm đơn 1x1, 1x2
};

function createShape(
  id: string,
  name: string,
  color: { bg: string; border: string },
  matrix: number[][]
): BlockShape {
  let cellsCount = 0;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) cellsCount++;
    }
  }
  return {
    id,
    name,
    color: color.bg,
    borderColor: color.border,
    matrix,
    cellsCount,
  };
}

// Thư viện các hình khối chuẩn Block Blast
export const ALL_BLOCK_SHAPES: BlockShape[] = [
  // 1x1 Dot (Cứu tinh nhỏ gọn)
  createShape('dot_1', 'Single Dot', BLOCK_COLORS.PINK, [[1]]),

  // Đường thẳng ngang (1x2, 1x3, 1x4, 1x5)
  createShape('h_line_2', 'Line 2H', BLOCK_COLORS.CYAN, [[1, 1]]),
  createShape('h_line_3', 'Line 3H', BLOCK_COLORS.CYAN, [[1, 1, 1]]),
  createShape('h_line_4', 'Line 4H', BLOCK_COLORS.CYAN, [[1, 1, 1, 1]]),
  createShape('h_line_5', 'Line 5H', BLOCK_COLORS.CYAN, [[1, 1, 1, 1, 1]]),

  // Đường thẳng dọc (2x1, 3x1, 4x1, 5x1)
  createShape('v_line_2', 'Line 2V', BLOCK_COLORS.CYAN, [[1], [1]]),
  createShape('v_line_3', 'Line 3V', BLOCK_COLORS.CYAN, [[1], [1], [1]]),
  createShape('v_line_4', 'Line 4V', BLOCK_COLORS.CYAN, [[1], [1], [1], [1]]),
  createShape('v_line_5', 'Line 5V', BLOCK_COLORS.CYAN, [[1], [1], [1], [1], [1]]),

  // Khối vuông (2x2, 3x3)
  createShape('square_2', 'Square 2x2', BLOCK_COLORS.YELLOW, [
    [1, 1],
    [1, 1],
  ]),
  createShape('square_3', 'Square 3x3', BLOCK_COLORS.YELLOW, [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 1],
  ]),

  // Góc nhỏ 2x2 (Corner 2x2 - 4 hướng)
  createShape('corner_2_tl', 'Corner 2 TL', BLOCK_COLORS.ORANGE, [
    [1, 1],
    [1, 0],
  ]),
  createShape('corner_2_tr', 'Corner 2 TR', BLOCK_COLORS.ORANGE, [
    [1, 1],
    [0, 1],
  ]),
  createShape('corner_2_bl', 'Corner 2 BL', BLOCK_COLORS.ORANGE, [
    [1, 0],
    [1, 1],
  ]),
  createShape('corner_2_br', 'Corner 2 BR', BLOCK_COLORS.ORANGE, [
    [0, 1],
    [1, 1],
  ]),

  // Góc lớn 3x3 (Corner 3x3 - 4 hướng)
  createShape('corner_3_tl', 'Corner 3 TL', BLOCK_COLORS.ORANGE, [
    [1, 1, 1],
    [1, 0, 0],
    [1, 0, 0],
  ]),
  createShape('corner_3_tr', 'Corner 3 TR', BLOCK_COLORS.ORANGE, [
    [1, 1, 1],
    [0, 0, 1],
    [0, 0, 1],
  ]),
  createShape('corner_3_bl', 'Corner 3 BL', BLOCK_COLORS.ORANGE, [
    [1, 0, 0],
    [1, 0, 0],
    [1, 1, 1],
  ]),
  createShape('corner_3_br', 'Corner 3 BR', BLOCK_COLORS.ORANGE, [
    [0, 0, 1],
    [0, 0, 1],
    [1, 1, 1],
  ]),

  // Chữ L chuẩn 3x2 (4 hướng xoay)
  createShape('l_shape_up', 'L Shape Up', BLOCK_COLORS.RED, [
    [1, 0],
    [1, 0],
    [1, 1],
  ]),
  createShape('l_shape_down', 'L Shape Down', BLOCK_COLORS.RED, [
    [1, 1],
    [0, 1],
    [0, 1],
  ]),
  createShape('l_shape_left', 'L Shape Left', BLOCK_COLORS.RED, [
    [0, 0, 1],
    [1, 1, 1],
  ]),
  createShape('l_shape_right', 'L Shape Right', BLOCK_COLORS.RED, [
    [1, 1, 1],
    [1, 0, 0],
  ]),

  // Chữ J chuẩn 3x2 (4 hướng xoay)
  createShape('j_shape_up', 'J Shape Up', BLOCK_COLORS.BLUE, [
    [0, 1],
    [0, 1],
    [1, 1],
  ]),
  createShape('j_shape_down', 'J Shape Down', BLOCK_COLORS.BLUE, [
    [1, 1],
    [1, 0],
    [1, 0],
  ]),
  createShape('j_shape_left', 'J Shape Left', BLOCK_COLORS.BLUE, [
    [1, 1, 1],
    [0, 0, 1],
  ]),
  createShape('j_shape_right', 'J Shape Right', BLOCK_COLORS.BLUE, [
    [1, 0, 0],
    [1, 1, 1],
  ]),

  // Chữ T (4 hướng xoay)
  createShape('t_shape_up', 'T Up', BLOCK_COLORS.PURPLE, [
    [0, 1, 0],
    [1, 1, 1],
  ]),
  createShape('t_shape_down', 'T Down', BLOCK_COLORS.PURPLE, [
    [1, 1, 1],
    [0, 1, 0],
  ]),
  createShape('t_shape_left', 'T Left', BLOCK_COLORS.PURPLE, [
    [0, 1],
    [1, 1],
    [0, 1],
  ]),
  createShape('t_shape_right', 'T Right', BLOCK_COLORS.PURPLE, [
    [1, 0],
    [1, 1],
    [1, 0],
  ]),

  // Khối Z và S (Tetris Z/S)
  createShape('z_shape_h', 'Z Horizontal', BLOCK_COLORS.GREEN, [
    [1, 1, 0],
    [0, 1, 1],
  ]),
  createShape('z_shape_v', 'Z Vertical', BLOCK_COLORS.GREEN, [
    [0, 1],
    [1, 1],
    [1, 0],
  ]),
  createShape('s_shape_h', 'S Horizontal', BLOCK_COLORS.GREEN, [
    [0, 1, 1],
    [1, 1, 0],
  ]),
  createShape('s_shape_v', 'S Vertical', BLOCK_COLORS.GREEN, [
    [1, 0],
    [1, 1],
    [0, 1],
  ]),
];

// Nhóm các khối nhỏ dễ cứu sinh (khi bàn cờ quá chật)
export const RESCUE_BLOCK_SHAPES: BlockShape[] = ALL_BLOCK_SHAPES.filter(
  (s) => s.cellsCount <= 3
);
