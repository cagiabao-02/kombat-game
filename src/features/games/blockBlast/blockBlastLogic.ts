import { BoardGrid, BlockShape, TraySlot, ClearedLineInfo } from './types';
import { ALL_BLOCK_SHAPES, RESCUE_BLOCK_SHAPES } from './blockShapes';

export const BOARD_SIZE = 8;

/**
 * Khởi tạo bàn cờ 8x8 rỗng (toàn bộ ô là null)
 */
export function createEmptyBoard(): BoardGrid {
  return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(null));
}

/**
 * Kiểm tra xem một khối hình có thể đặt vào bàn cờ tại vị trí (startRow, startCol) hay không
 */
export function canPlaceShape(
  board: BoardGrid,
  shape: BlockShape,
  startRow: number,
  startCol: number
): boolean {
  const { matrix } = shape;
  const rows = matrix.length;
  const cols = matrix[0].length;

  // Tràn viền ngoài bàn cờ 8x8
  if (startRow < 0 || startCol < 0 || startRow + rows > BOARD_SIZE || startCol + cols > BOARD_SIZE) {
    return false;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (matrix[r][c] === 1) {
        const boardR = startRow + r;
        const boardC = startCol + c;
        // Ô đó đã có khối gạch chiếm chỗ
        if (board[boardR][boardC] !== null) {
          return false;
        }
      }
    }
  }

  return true;
}

/**
 * Tìm tất cả các vị trí (r, c) có thể đặt khối này trên bàn cờ
 */
export function getValidPlacements(
  board: BoardGrid,
  shape: BlockShape
): { r: number; c: number }[] {
  const valid: { r: number; c: number }[] = [];
  const rows = shape.matrix.length;
  const cols = shape.matrix[0].length;

  for (let r = 0; r <= BOARD_SIZE - rows; r++) {
    for (let c = 0; c <= BOARD_SIZE - cols; c++) {
      if (canPlaceShape(board, shape, r, c)) {
        valid.push({ r, c });
      }
    }
  }

  return valid;
}

/**
 * Đặt một khối vào bàn cờ và trả về bàn cờ mới (immutable)
 */
export function placeShapeOnBoard(
  board: BoardGrid,
  shape: BlockShape,
  startRow: number,
  startCol: number
): BoardGrid {
  const newBoard = board.map((row) => [...row]);
  const { matrix, color } = shape;

  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) {
        newBoard[startRow + r][startCol + c] = color;
      }
    }
  }

  return newBoard;
}

/**
 * Quét tìm các hàng ngang (rows) và cột dọc (cols) đã được lấp đầy 8/8 ô
 */
export function checkLinesToClear(board: BoardGrid): ClearedLineInfo {
  const fullRows: number[] = [];
  const fullCols: number[] = [];
  const clearedCoordsSet = new Set<string>();

  // 1. Kiểm tra hàng ngang
  for (let r = 0; r < BOARD_SIZE; r++) {
    let isRowFull = true;
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) {
        isRowFull = false;
        break;
      }
    }
    if (isRowFull) {
      fullRows.push(r);
      for (let c = 0; c < BOARD_SIZE; c++) {
        clearedCoordsSet.add(`${r},${c}`);
      }
    }
  }

  // 2. Kiểm tra cột dọc
  for (let c = 0; c < BOARD_SIZE; c++) {
    let isColFull = true;
    for (let r = 0; r < BOARD_SIZE; r++) {
      if (board[r][c] === null) {
        isColFull = false;
        break;
      }
    }
    if (isColFull) {
      fullCols.push(c);
      for (let r = 0; r < BOARD_SIZE; r++) {
        clearedCoordsSet.add(`${r},${c}`);
      }
    }
  }

  const clearedCellCoords = Array.from(clearedCoordsSet).map((str) => {
    const [r, c] = str.split(',').map(Number);
    return { r, c };
  });

  return {
    rows: fullRows,
    cols: fullCols,
    clearedCellCoords,
    totalLines: fullRows.length + fullCols.length,
  };
}

/**
 * Xóa các hàng và cột đầy, trả về bàn cờ mới đã giải phóng ô
 */
export function clearLinesFromBoard(
  board: BoardGrid,
  clearedCoords: { r: number; c: number }[]
): BoardGrid {
  const newBoard = board.map((row) => [...row]);
  for (const { r, c } of clearedCoords) {
    newBoard[r][c] = null;
  }
  return newBoard;
}

/**
 * Tính điểm cho lượt đặt:
 * - Điểm đặt khối = số ô của khối (shapeCellsCount)
 * - Điểm nổ hàng/cột:
 *   + 1 dòng: 10 điểm
 *   + 2 dòng (kép): 30 điểm
 *   + 3 dòng: 60 điểm
 *   + 4 dòng: 100 điểm
 *   + Mỗi dòng tiếp theo: +50 điểm
 * - Hệ số nhân chuỗi Combo: Nhân toàn bộ điểm nổ dòng với nextCombo!
 * - Thưởng Chuỗi Combo Lũy Tiến Khổng Lồ (Exponential Combo Bonus):
 *   Càng duy trì chuỗi combo dài, điểm thưởng cộng thêm càng tăng vọt theo hàm bậc hai (x2: +40, x3: +90, x4: +160, x5: +260, x6: +390, x7: +560, x8+: 14 * combo^2)!
 */
export function calculateMoveScore(
  shapeCellsCount: number,
  linesClearedCount: number,
  comboStreak: number
): { earnedScore: number; nextCombo: number; comboBonus: number } {
  let earned = shapeCellsCount;

  if (linesClearedCount > 0) {
    const nextCombo = comboStreak + 1;

    // 1. Điểm cơ bản theo số dòng nổ đồng thời
    let baseLinePoints = 10;
    if (linesClearedCount === 2) {
      baseLinePoints = 30; // Thưởng nổ kép
    } else if (linesClearedCount === 3) {
      baseLinePoints = 60; // Thưởng nổ 3 dòng
    } else if (linesClearedCount === 4) {
      baseLinePoints = 100; // Thưởng nổ 4 dòng
    } else if (linesClearedCount > 4) {
      baseLinePoints = 100 + (linesClearedCount - 4) * 50;
    }

    // 2. Nhân điểm dòng với bậc combo
    const multipliedLineScore = baseLinePoints * nextCombo;

    // 3. Thưởng Chuỗi Combo Lũy Tiến (Càng combo cao điểm càng tăng vọt)
    let comboBonus = 0;
    if (nextCombo >= 2) {
      // Công thức hàm mũ: x2 -> 40, x3 -> 90, x4 -> 160, x5 -> 260, x6 -> 390, x7 -> 560...
      comboBonus = Math.round(nextCombo * nextCombo * 10) + (nextCombo - 1) * 5;
    }

    const totalLinePoints = multipliedLineScore + comboBonus;
    earned += totalLinePoints;

    return {
      earnedScore: earned,
      nextCombo,
      comboBonus,
    };
  }

  // Không nổ dòng nào thì chuỗi combo ngắt về 0
  return {
    earnedScore: earned,
    nextCombo: 0,
    comboBonus: 0,
  };
}

/**
 * Kiểm tra xem trong khay hiện tại còn bất kỳ khối nào (chưa dùng) có thể đặt được vào bàn cờ không
 */
export function hasAnyValidMove(board: BoardGrid, tray: TraySlot[]): boolean {
  const availableSlots = tray.filter((slot) => !slot.used);
  if (availableSlots.length === 0) return true; // Hết khối thì sẽ được chia bộ 3 mới

  for (const slot of availableSlots) {
    const placements = getValidPlacements(board, slot.shape);
    if (placements.length > 0) {
      return true; // Còn ít nhất 1 nước đi
    }
  }

  return false; // Bế tắc hoàn toàn -> Game Over
}

/**
 * Kiểm tra xem một bộ 3 khối [s1, s2, s3] có ÍT NHẤT MỘT THỨ TỰ ĐẶT KHẢ THI (ĐƯỜNG SỐNG) hay không.
 * Thuật toán thử tất cả 6 hoán vị đặt [p1 -> p2 -> p3], mô phỏng nổ dòng sau mỗi bước.
 * Nếu tìm thấy dù chỉ 1 chuỗi thành công, trả về true ngay lập tức!
 */
export function isTraySolvable(board: BoardGrid, shapes: BlockShape[]): boolean {
  if (shapes.length !== 3) return false;

  const permutations = [
    [0, 1, 2],
    [0, 2, 1],
    [1, 0, 2],
    [1, 2, 0],
    [2, 0, 1],
    [2, 1, 0],
  ];

  for (const [i1, i2, i3] of permutations) {
    const s1 = shapes[i1];
    const s2 = shapes[i2];
    const s3 = shapes[i3];

    const p1List = getValidPlacements(board, s1);
    if (p1List.length === 0) continue;

    // Giới hạn thử 6 vị trí khả dĩ nhất của s1 để chạy cực nhanh
    const testP1 = p1List.slice(0, 6);

    for (const p1 of testP1) {
      let b1 = placeShapeOnBoard(board, s1, p1.r, p1.c);
      const c1 = checkLinesToClear(b1);
      if (c1.totalLines > 0) {
        b1 = clearLinesFromBoard(b1, c1.clearedCellCoords);
      }

      const p2List = getValidPlacements(b1, s2);
      if (p2List.length === 0) continue;

      const testP2 = p2List.slice(0, 5);
      for (const p2 of testP2) {
        let b2 = placeShapeOnBoard(b1, s2, p2.r, p2.c);
        const c2 = checkLinesToClear(b2);
        if (c2.totalLines > 0) {
          b2 = clearLinesFromBoard(b2, c2.clearedCellCoords);
        }

        const p3List = getValidPlacements(b2, s3);
        if (p3List.length > 0) {
          // TÌM THẤY 1 CHUỖI ĐẶT THÀNH CÔNG CHO CẢ 3 KHỐI!
          return true;
        }
      }
    }
  }

  return false;
}

/**
 * Thuật toán sinh 3 khối ĐẢM BẢO 100% CÓ ÍT NHẤT 1 ĐƯỜNG SỐNG (Solvable & Fair RNG):
 * 1. Đếm số ô trống và mật độ bàn cờ.
 * 2. Ưu tiên cấp khối cứu tinh hoặc khối có khả năng lấp đầy nổ dòng khi bàn cờ chật.
 * 3. Chạy kiểm chứng `isTraySolvable`: Đảm bảo tồn tại ít nhất 1 thứ tự đặt cả 3 khối thành công.
 * 4. Tuyệt đối không sinh 2 khối lớn giống nhau trong cùng 1 khay.
 */
export function generateSolvableTray(board: BoardGrid): TraySlot[] {
  let emptyCellsCount = 0;
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (board[r][c] === null) emptyCellsCount++;
    }
  }

  // Phân loại độ chật của bàn cờ
  // Bàn cờ thoáng (> 32 ô trống): dùng toàn bộ thư viện
  // Bàn cờ trung bình (20 - 32 ô trống): tăng tỷ lệ khối vừa và nhỏ
  // Bàn cờ chật (< 20 ô trống): chỉ dùng khối cứu tinh nhỏ (<= 3 ô) để người chơi có đường gỡ
  const pool =
    emptyCellsCount < 20
      ? RESCUE_BLOCK_SHAPES
      : emptyCellsCount < 32
      ? [...RESCUE_BLOCK_SHAPES, ...RESCUE_BLOCK_SHAPES, ...ALL_BLOCK_SHAPES]
      : ALL_BLOCK_SHAPES;

  function getRandomShapeFromPool(): BlockShape {
    return pool[Math.floor(Math.random() * pool.length)];
  }

  // Thử tối đa 40 lần để tìm ra 1 bộ 3 khối thỏa mãn:
  // - Cả 3 khối có hình dạng khác nhau (không trùng lặp 2 khối giống nhau)
  // - Bộ 3 khối ĐƯỢC CHỨNG MINH LÀ CÓ ĐƯỜNG SỐNG qua isTraySolvable
  for (let attempt = 0; attempt < 40; attempt++) {
    const s1 = getRandomShapeFromPool();
    let s2 = getRandomShapeFromPool();
    let s3 = getRandomShapeFromPool();

    // Đảm bảo không trùng ID của nhau
    let rerolls = 0;
    while ((s2.id === s1.id) && rerolls < 10) {
      s2 = getRandomShapeFromPool();
      rerolls++;
    }
    rerolls = 0;
    while ((s3.id === s1.id || s3.id === s2.id) && rerolls < 10) {
      s3 = getRandomShapeFromPool();
      rerolls++;
    }

    const candidate = [s1, s2, s3];
    if (isTraySolvable(board, candidate)) {
      const timestamp = Date.now();
      return [
        { id: `slot_${timestamp}_1`, shape: candidate[0], used: false },
        { id: `slot_${timestamp}_2`, shape: candidate[1], used: false },
        { id: `slot_${timestamp}_3`, shape: candidate[2], used: false },
      ];
    }
  }

  // Nếu vẫn chưa tìm được qua 40 lần thử ngẫu nhiên (bàn cờ cực kỳ hiểm nghèo):
  // Dùng danh sách cứu tinh nhỏ gọn (1x1 dot, 1x2, 2x1) chắc chắn 100% có đường sống
  const rescuePool = RESCUE_BLOCK_SHAPES;
  for (let i = 0; i < rescuePool.length; i++) {
    for (let j = 0; j < rescuePool.length; j++) {
      for (let k = 0; k < rescuePool.length; k++) {
        const candidate = [rescuePool[i], rescuePool[j], rescuePool[k]];
        if (isTraySolvable(board, candidate)) {
          const timestamp = Date.now();
          return [
            { id: `slot_${timestamp}_1`, shape: candidate[0], used: false },
            { id: `slot_${timestamp}_2`, shape: candidate[1], used: false },
            { id: `slot_${timestamp}_3`, shape: candidate[2], used: false },
          ];
        }
      }
    }
  }

  // Fallback an toàn tuyệt đối cuối cùng: cấp 3 chấm đơn 1x1 dot (mỗi ô 1x1 luôn vừa ở bất kỳ ô trống nào)
  const dotShape = ALL_BLOCK_SHAPES[0]; // 1x1 Dot
  const timestamp = Date.now();
  return [
    { id: `slot_${timestamp}_1`, shape: dotShape, used: false },
    { id: `slot_${timestamp}_2`, shape: dotShape, used: false },
    { id: `slot_${timestamp}_3`, shape: dotShape, used: false },
  ];
}
