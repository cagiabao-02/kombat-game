export const CANVAS_WIDTH = 360;
export const CANVAS_HEIGHT = 580;
export const GROUND_Y = 500;
export const GROUND_HEIGHT = CANVAS_HEIGHT - GROUND_Y; // 80px

export const BIRD_X = 76;
export const BIRD_WIDTH = 34;
export const BIRD_HEIGHT = 24;

export const GRAVITY = 0.26; // Trọng lực dịu nhẹ, chim không bị rớt như đá lăn
export const FLAP_VELOCITY = -5.6; // Lực đập cánh nâng bồng bềnh, dễ kiểm soát
export const TERMINAL_VELOCITY = 6.2; // Giới hạn tốc độ rơi tối đa vừa phải

export const PIPE_WIDTH = 56;
export const PIPE_GAP = 140; // Khe hở thông thoáng, thoải mái lượn qua
export const PIPE_SPEED = 1.9; // Tốc độ trôi nhẹ nhàng, dễ phản xạ
export const PIPE_SPAWN_INTERVAL = 215; // Khoảng cách giữa các cột rộng rãi, không bị dồn dập

export const MIN_PIPE_HEIGHT = 55;
export const MAX_PIPE_HEIGHT = GROUND_Y - PIPE_GAP - MIN_PIPE_HEIGHT;

export type FlappyGameStateStatus = 'ready' | 'playing' | 'crashed' | 'game_over';

export interface PipePair {
  id: string;
  x: number;
  topHeight: number; // Chiều cao cột trên
  bottomY: number;   // Tọa độ Y bắt đầu cột dưới = topHeight + PIPE_GAP
  bottomHeight: number; // Chiều cao cột dưới = GROUND_Y - bottomY
  passed: boolean;
}

export interface FlappyGameState {
  birdY: number;
  birdVy: number;
  birdRotation: number; // Radian
  wingFrame: number;    // 0, 1, 2
  status: FlappyGameStateStatus;
  score: number;
  highScore: number;
  pipes: PipePair[];
  nextPipeDistance: number;
  groundOffset: number;
  isNight: boolean;
}

/** Khởi tạo trạng thái ban đầu */
export function createInitialFlappyState(highScore: number = 0): FlappyGameState {
  return {
    birdY: 240,
    birdVy: 0,
    birdRotation: 0,
    wingFrame: 1,
    status: 'ready',
    score: 0,
    highScore,
    pipes: [],
    nextPipeDistance: 260, // Cặp cột đầu tiên xuất hiện sau khi người chơi đã bắt nhịp
    groundOffset: 0,
    isNight: false,
  };
}

/** Tạo ngẫu nhiên một cặp cột ống nước trên & dưới */
export function generatePipePair(): PipePair {
  const topHeight = Math.floor(
    MIN_PIPE_HEIGHT + Math.random() * (MAX_PIPE_HEIGHT - MIN_PIPE_HEIGHT)
  );
  const bottomY = topHeight + PIPE_GAP;
  const bottomHeight = GROUND_Y - bottomY;

  return {
    id: `pipe_${Date.now()}_${Math.random()}`,
    x: CANVAS_WIDTH + 10,
    topHeight,
    bottomY,
    bottomHeight,
    passed: false,
  };
}

/** Kiểm tra va chạm giữa Chú Chim và Cột / Đất */
export function checkFlappyCollision(
  birdY: number,
  pipes: PipePair[]
): { hit: boolean; hitGround: boolean } {
  // 1. Va chạm mặt đất
  if (birdY + BIRD_HEIGHT >= GROUND_Y) {
    return { hit: true, hitGround: true };
  }

  // 2. Va chạm trần
  if (birdY <= 0) {
    return { hit: true, hitGround: false };
  }

  // 3. Va chạm cột ống nước (Hitbox dung sai rộng rãi để công bằng và tạo cảm giác lướt sát ngoạn mục)
  const paddingX = 5;
  const paddingY = 4;

  const bLeft = BIRD_X + paddingX;
  const bRight = BIRD_X + BIRD_WIDTH - paddingX;
  const bTop = birdY + paddingY;
  const bBottom = birdY + BIRD_HEIGHT - paddingY;

  for (const pipe of pipes) {
    const pLeft = pipe.x;
    const pRight = pipe.x + PIPE_WIDTH;

    // Chỉ xét các cột nằm trong phạm vi ngang của chim
    if (bRight > pLeft && bLeft < pRight) {
      // Cột trên
      if (bTop < pipe.topHeight) {
        return { hit: true, hitGround: false };
      }
      // Cột dưới
      if (bBottom > pipe.bottomY) {
        return { hit: true, hitGround: false };
      }
    }
  }

  return { hit: false, hitGround: false };
}

/** Xác định huy chương đạt được dựa trên số điểm */
export type MedalType = 'bronze' | 'silver' | 'gold' | 'platinum' | null;

export function getMedalForScore(score: number): MedalType {
  if (score >= 40) return 'platinum';
  if (score >= 30) return 'gold';
  if (score >= 20) return 'silver';
  if (score >= 10) return 'bronze';
  return null;
}
