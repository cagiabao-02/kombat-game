export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export interface Point {
  x: number;
  y: number;
}

export type FoodType = 'normal' | 'golden';

export interface FoodItem extends Point {
  type: FoodType;
  /** Thời điểm táo vàng biến mất nếu không ăn kịp (timestamp ms) */
  expiresAt?: number;
}

export interface SnakeState {
  snake: Point[];
  direction: Direction;
  /** Hàng đợi thao tác đổi hướng (tối đa 2 lệnh để phản hồi mượt khi nhấn phím nhanh) */
  directionQueue: Direction[];
  food: FoodItem;
  goldenFood: FoodItem | null;
  score: number;
  applesEaten: number;
  isGameOver: boolean;
  isPaused: boolean;
}

export const GRID_SIZE = 20;

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

export function isOpposite(dir1: Direction, dir2: Direction): boolean {
  return OPPOSITE_DIRECTIONS[dir1] === dir2;
}

export function calculateSpeed(score: number): number {
  // Bắt đầu 140ms/bước, mỗi 40 điểm giảm 8ms, nhanh nhất là 65ms
  const speed = 140 - Math.floor(score / 40) * 8;
  return Math.max(65, speed);
}

export function spawnRandomPoint(occupied: Point[]): Point {
  const occupiedSet = new Set(occupied.map((p) => `${p.x},${p.y}`));
  const available: Point[] = [];

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let y = 0; y < GRID_SIZE; y++) {
      if (!occupiedSet.has(`${x},${y}`)) {
        available.push({ x, y });
      }
    }
  }

  if (available.length === 0) {
    return { x: 0, y: 0 };
  }

  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

export function getInitialSnakeState(): SnakeState {
  const initialSnake: Point[] = [
    { x: 10, y: 10 }, // Đầu
    { x: 9, y: 10 },
    { x: 8, y: 10 },  // Đuôi
  ];

  const normalFood = spawnRandomPoint(initialSnake);

  return {
    snake: initialSnake,
    direction: 'RIGHT',
    directionQueue: [],
    food: { ...normalFood, type: 'normal' },
    goldenFood: null,
    score: 0,
    applesEaten: 0,
    isGameOver: false,
    isPaused: false,
  };
}

export function changeDirection(state: SnakeState, newDir: Direction): SnakeState {
  if (state.isGameOver || state.isPaused) return state;

  const queue = state.directionQueue || [];
  // Giới hạn tối đa 2 thao tác kế tiếp trong hàng đợi để phản hồi tức thì
  if (queue.length >= 2) return state;

  // Lấy hướng tham chiếu (hướng cuối cùng đã lên lịch, hoặc hướng hiện tại của rắn)
  const lastScheduledDir = queue.length > 0 ? queue[queue.length - 1] : state.direction;

  // Bỏ qua nếu nhấn trùng hướng hoặc quay đầu 180 độ so với hướng sắp tới
  if (newDir === lastScheduledDir || isOpposite(lastScheduledDir, newDir)) {
    return state;
  }

  return {
    ...state,
    directionQueue: [...queue, newDir],
  };
}

export interface StepResult {
  state: SnakeState;
  ateFood: FoodType | null;
  died: boolean;
}

export function stepSnake(state: SnakeState): StepResult {
  if (state.isGameOver || state.isPaused) {
    return { state, ateFood: null, died: false };
  }

  // Lấy hướng tiếp theo từ hàng đợi (nếu có) hoặc giữ nguyên hướng hiện tại
  const queue = state.directionQueue || [];
  const currentDir = queue.length > 0 ? queue[0] : state.direction;
  const remainingQueue = queue.length > 0 ? queue.slice(1) : [];

  const head = state.snake[0];
  let nextHead: Point = { ...head };

  switch (currentDir) {
    case 'UP':
      nextHead.y -= 1;
      break;
    case 'DOWN':
      nextHead.y += 1;
      break;
    case 'LEFT':
      nextHead.x -= 1;
      break;
    case 'RIGHT':
      nextHead.x += 1;
      break;
  }

  // 1. Kiểm tra va chạm tường (cổ điển)
  if (
    nextHead.x < 0 ||
    nextHead.x >= GRID_SIZE ||
    nextHead.y < 0 ||
    nextHead.y >= GRID_SIZE
  ) {
    return {
      state: { ...state, isGameOver: true, direction: currentDir, directionQueue: [] },
      ateFood: null,
      died: true,
    };
  }

  // 2. Kiểm tra cắn vào thân (ngoại trừ đuôi nếu đuôi sắp rút đi)
  const hitsBody = state.snake.slice(0, -1).some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y
  );

  if (hitsBody) {
    return {
      state: { ...state, isGameOver: true, direction: currentDir, directionQueue: [] },
      ateFood: null,
      died: true,
    };
  }

  // 3. Kiểm tra ăn mồi
  let ateFood: FoodType | null = null;
  let newGolden = state.goldenFood;

  // Kiểm tra táo vàng hết hạn (8 giây)
  if (newGolden && newGolden.expiresAt && Date.now() > newGolden.expiresAt) {
    newGolden = null;
  }

  const isEatingNormal = nextHead.x === state.food.x && nextHead.y === state.food.y;
  const isEatingGolden =
    newGolden && nextHead.x === newGolden.x && nextHead.y === newGolden.y;

  let addedScore = 0;
  if (isEatingGolden) {
    ateFood = 'golden';
    addedScore = 50;
    newGolden = null;
  } else if (isEatingNormal) {
    ateFood = 'normal';
    addedScore = 10;
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!ateFood) {
    // Không ăn: bỏ đốt đuôi
    nextSnake.pop();
  }

  // Nếu ăn táo đỏ, sinh táo đỏ mới và có 20% cơ hội xuất hiện táo vàng (nếu chưa có)
  let nextNormalFood = state.food;
  if (isEatingNormal) {
    const occupied = [...nextSnake, ...(newGolden ? [newGolden] : [])];
    const newPt = spawnRandomPoint(occupied);
    nextNormalFood = { ...newPt, type: 'normal' };

    // Táo vàng: 25% tỷ lệ xuất hiện, tồn tại 8 giây
    if (!newGolden && Math.random() < 0.25) {
      const goldenPt = spawnRandomPoint([...nextSnake, nextNormalFood]);
      newGolden = {
        ...goldenPt,
        type: 'golden',
        expiresAt: Date.now() + 8000,
      };
    }
  }

  return {
    state: {
      ...state,
      snake: nextSnake,
      direction: currentDir,
      directionQueue: remainingQueue,
      food: nextNormalFood,
      goldenFood: newGolden,
      score: state.score + addedScore,
      applesEaten: state.applesEaten + (ateFood ? 1 : 0),
    },
    ateFood,
    died: false,
  };
}
