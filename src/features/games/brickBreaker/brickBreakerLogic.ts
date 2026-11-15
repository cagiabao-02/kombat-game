export const CANVAS_WIDTH = 480;
export const CANVAS_HEIGHT = 640;

export const PADDLE_DEFAULT_WIDTH = 88;
export const PADDLE_EXPANDED_WIDTH = 120;
export const PADDLE_HEIGHT = 14;
export const PADDLE_Y = 596;

export const BALL_RADIUS = 6;
export const BALL_BASE_SPEED = 340;
export const BALL_MAX_SPEED = 540;

export type PowerupType = 'expand' | 'multi' | 'laser' | 'life';

export interface Powerup {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: PowerupType;
  vy: number;
}

export interface Laser {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  vy: number;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  stuckToPaddle: boolean;
  stuckOffset: number;
}

export interface Brick {
  id: string;
  row: number;
  col: number;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  points: number;
  maxHits: number;
  hitsLeft: number;
  isBomb?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  alpha: number;
  life: number;
}

export interface LevelConfig {
  bricks: Brick[];
}

/** Màu sắc và điểm theo hàng của gạch */
const ROW_COLORS = [
  { color: '#EF4444', points: 50 }, // Đỏ
  { color: '#F97316', points: 40 }, // Cam
  { color: '#F59E0B', points: 30 }, // Vàng cam
  { color: '#10B981', points: 20 }, // Xanh lá
  { color: '#3B82F6', points: 10 }, // Xanh dương
];

/** Tạo ma trận gạch theo cấp độ */
export function createLevelBricks(level: number): Brick[] {
  const bricks: Brick[] = [];
  const cols = 7;
  const rows = Math.min(7, 4 + level);
  const paddingX = 24;
  const paddingTop = 74;
  const gap = 6;
  const totalGaps = (cols - 1) * gap;
  const brickWidth = Math.floor((CANVAS_WIDTH - paddingX * 2 - totalGaps) / cols);
  const brickHeight = 18;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Các pattern gạch thú vị theo level
      if (level === 2 && (r + c) % 2 === 0) continue; // Màn 2: Dạng bàn cờ ô thoáng
      if (level >= 3 && r === 0 && (c === 0 || c === cols - 1)) continue;

      const x = paddingX + c * (brickWidth + gap);
      const y = paddingTop + r * (brickHeight + gap);

      const colorData = ROW_COLORS[r % ROW_COLORS.length];
      let maxHits = 1;
      let points = colorData.points;
      let color = colorData.color;
      let isBomb = false;

      // Màn 2 trở lên: thêm gạch thép (2 lần đập) và gạch bom
      if (level >= 2 && r === 1 && (c === 2 || c === 4)) {
        maxHits = 2;
        color = '#94A3B8'; // Thép xám
        points = 70;
      } else if (level >= 2 && r === 2 && c === 3) {
        isBomb = true;
        color = '#D946EF'; // Magenta bom
        points = 60;
      }

      bricks.push({
        id: `${r}-${c}`,
        row: r,
        col: c,
        x,
        y,
        width: brickWidth,
        height: brickHeight,
        color,
        points,
        maxHits,
        hitsLeft: maxHits,
        isBomb,
      });
    }
  }

  return bricks;
}

/** Tạo bóng ban đầu dính trên paddle */
export function createInitialBall(paddleX: number, paddleWidth: number): Ball {
  return {
    id: 'ball-1',
    x: paddleX + paddleWidth / 2,
    y: PADDLE_Y - BALL_RADIUS,
    vx: 0,
    vy: 0,
    speed: BALL_BASE_SPEED,
    stuckToPaddle: true,
    stuckOffset: paddleWidth / 2,
  };
}

/** Phóng bóng bay lên theo góc ngẫu nhiên nhẹ */
export function launchBall(ball: Ball): Ball {
  if (!ball.stuckToPaddle) return ball;
  const angle = -Math.PI / 2 + (Math.random() * 0.4 - 0.2); // Bay xéo nhẹ lên trên
  return {
    ...ball,
    stuckToPaddle: false,
    vx: Math.cos(angle) * ball.speed,
    vy: Math.sin(angle) * ball.speed,
  };
}

/** Tạo các hạt particle pixel khi va chạm vỡ gạch */
export function createBrickParticles(brick: Brick): Particle[] {
  const particles: Particle[] = [];
  const count = 10;
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 60 + Math.random() * 140;
    particles.push({
      x: brick.x + brick.width / 2,
      y: brick.y + brick.height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      color: brick.color,
      size: 3 + Math.random() * 3,
      alpha: 1,
      life: 0.35 + Math.random() * 0.2,
    });
  }
  return particles;
}

/** Tạo vật phẩm buff rơi ngẫu nhiên khi gạch vỡ (22% tỷ lệ) */
export function maybeSpawnPowerup(brick: Brick): Powerup | null {
  if (Math.random() > 0.22) return null;

  const rand = Math.random();
  let type: PowerupType = 'expand';
  if (rand < 0.35) {
    type = 'expand';
  } else if (rand < 0.65) {
    type = 'multi';
  } else if (rand < 0.88) {
    type = 'laser';
  } else {
    type = 'life';
  }

  return {
    id: `pw-${Date.now()}-${Math.random()}`,
    x: brick.x + brick.width / 2 - 12,
    y: brick.y + brick.height / 2,
    width: 24,
    height: 14,
    type,
    vy: 130,
  };
}

/** Tính toán góc nảy bóng khi chạm thanh trượt Paddle */
export function calculatePaddleBounce(
  ballX: number,
  paddleX: number,
  paddleWidth: number,
  ballSpeed: number
): { vx: number; vy: number } {
  // Điểm chạm từ -1 (mép trái) đến 1 (mép phải)
  const hitPoint = Math.max(-1, Math.min(1, ((ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2))));
  // Góc phản xạ tối đa 65 độ
  const maxAngle = (65 * Math.PI) / 180;
  const bounceAngle = hitPoint * maxAngle;

  return {
    vx: Math.sin(bounceAngle) * ballSpeed,
    vy: -Math.abs(Math.cos(bounceAngle) * ballSpeed),
  };
}
