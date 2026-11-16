export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 260;
export const GROUND_Y = 216;

export const DINO_X = 54;
export const DINO_STAND_WIDTH = 44;
export const DINO_STAND_HEIGHT = 48;
export const DINO_DUCK_WIDTH = 56;
export const DINO_DUCK_HEIGHT = 28;

export const GRAVITY = 0.54;
export const JUMP_VELOCITY = -10.8;
export const DROP_ACCELERATION = 1.2;

export const INITIAL_SPEED = 4.2;
export const MAX_SPEED = 10.8;
export const SPEED_ACCELERATION = 0.0010;

export type DinoState = 'idle' | 'running' | 'jumping' | 'ducking' | 'crashed';

export type ObstacleType = 'cactus_small' | 'cactus_large' | 'pterodactyl';

export interface Obstacle {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  variety?: number; // 1, 2, or 3 for cacti
  altitude?: 'low' | 'medium' | 'high'; // for pterodactyl
  flapFrame?: number; // 0 or 1
}

export interface Cloud {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  speed: number;
}

export interface Star {
  x: number;
  y: number;
  size: number;
  alpha: number;
}

export interface GroundDetail {
  x: number;
  length: number;
}

export interface DinoGameState {
  dinoY: number;
  dinoVy: number;
  dinoState: DinoState;
  isGrounded: boolean;
  score: number;
  highScore: number;
  speed: number;
  obstacles: Obstacle[];
  clouds: Cloud[];
  stars: Star[];
  groundDetails: GroundDetail[];
  groundOffset: number;
  runFrame: number;
  isGameOver: boolean;
  isNight: boolean;
  nightTransition: number; // 0 (day) to 1 (night)
  lastMilestoneScore: number;
  milestoneFlashCountdown: number; // flash score every 100 points
}

/** Khởi tạo trạng thái ban đầu của trò chơi */
export function createInitialDinoState(highScore: number = 0): DinoGameState {
  const clouds: Cloud[] = [
    { id: 'c1', x: 200, y: 50, width: 46, height: 14, speed: 1.0 },
    { id: 'c2', x: 450, y: 35, width: 54, height: 16, speed: 1.2 },
    { id: 'c3', x: 680, y: 65, width: 40, height: 12, speed: 0.9 },
  ];

  const stars: Star[] = [
    { x: 120, y: 40, size: 2, alpha: 0.8 },
    { x: 280, y: 30, size: 3, alpha: 0.9 },
    { x: 400, y: 55, size: 2, alpha: 0.7 },
    { x: 530, y: 25, size: 2, alpha: 0.85 },
    { x: 660, y: 45, size: 3, alpha: 0.95 },
    { x: 750, y: 35, size: 2, alpha: 0.75 },
  ];

  const groundDetails: GroundDetail[] = [];
  for (let i = 0; i < 30; i++) {
    groundDetails.push({
      x: i * 30 + Math.floor(Math.random() * 15),
      length: 2 + Math.floor(Math.random() * 5),
    });
  }

  return {
    dinoY: GROUND_Y - DINO_STAND_HEIGHT,
    dinoVy: 0,
    dinoState: 'idle',
    isGrounded: true,
    score: 0,
    highScore,
    speed: INITIAL_SPEED,
    obstacles: [],
    clouds,
    stars,
    groundDetails,
    groundOffset: 0,
    runFrame: 0,
    isGameOver: false,
    isNight: false,
    nightTransition: 0,
    lastMilestoneScore: 0,
    milestoneFlashCountdown: 0,
  };
}

/** Tạo ngẫu nhiên chướng ngại vật tiếp theo theo độ khó tăng dần */
export function generateObstacle(score: number): Obstacle {
  const id = `obs_${Date.now()}_${Math.random()}`;
  const startX = CANVAS_WIDTH + 20;

  // Chim Pterodactyl chỉ xuất hiện khi score >= 500 với xác suất ~28%
  const allowPterodactyl = score >= 500;
  const isPterodactyl = allowPterodactyl && Math.random() < 0.28;

  if (isPterodactyl) {
    const altitudes: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
    const altitude = altitudes[Math.floor(Math.random() * altitudes.length)];
    let y = 110;
    if (altitude === 'medium') {
      y = 158; // Buộc phải cúi né!
    } else if (altitude === 'low') {
      y = 184; // Buộc phải nhảy qua!
    }

    return {
      id,
      type: 'pterodactyl',
      x: startX,
      y,
      width: 44,
      height: 32,
      altitude,
      flapFrame: 0,
    };
  }

  // Ở giai đoạn đầu (score < 200), CHỈ xuất hiện 1 cây xương rồng nhỏ đơn lẻ để người chơi làm quen nhịp chạy
  if (score < 200) {
    return {
      id,
      type: 'cactus_small',
      x: startX,
      y: GROUND_Y - 35,
      width: 16,
      height: 35,
      variety: 1,
    };
  }

  // Từ 200 điểm trở lên: Cây xương rồng lớn hoặc cụm xương rồng nhỏ
  const allowLarge = score >= 300;
  const isLarge = allowLarge && Math.random() < 0.4;

  if (isLarge) {
    const variety = score >= 450 && Math.random() < 0.35 ? 2 : 1; // 1 hoặc 2 cây lớn
    const width = variety === 1 ? 24 : 48;
    const height = 48;
    return {
      id,
      type: 'cactus_large',
      x: startX,
      y: GROUND_Y - height,
      width,
      height,
      variety,
    };
  } else {
    // Cây nhỏ: 1, 2 hoặc 3 cây
    const variety = score < 350
      ? (Math.random() < 0.6 ? 1 : 2)
      : (Math.random() < 0.45 ? 1 : Math.random() < 0.8 ? 2 : 3);
    const width = variety === 1 ? 16 : variety === 2 ? 32 : 48;
    const height = 35;
    return {
      id,
      type: 'cactus_small',
      x: startX,
      y: GROUND_Y - height,
      width,
      height,
      variety,
    };
  }
}

/** Kiểm tra va chạm giữa Khủng long và Chướng ngại vật (với hitbox tinh chỉnh hợp lý) */
export function checkCollision(
  dinoX: number,
  dinoY: number,
  dinoWidth: number,
  dinoHeight: number,
  obs: Obstacle
): boolean {
  // Dung sai pixel để tránh ức chế người chơi khi chạm sát mép
  const dinoPaddingX = 6;
  const dinoPaddingY = 4;
  const obsPaddingX = 4;
  const obsPaddingY = 4;

  const dLeft = dinoX + dinoPaddingX;
  const dRight = dinoX + dinoWidth - dinoPaddingX;
  const dTop = dinoY + dinoPaddingY;
  const dBottom = dinoY + dinoHeight - dinoPaddingY;

  const oLeft = obs.x + obsPaddingX;
  const oRight = obs.x + obs.width - obsPaddingX;
  const oTop = obs.y + obsPaddingY;
  const oBottom = obs.y + obs.height - obsPaddingY;

  return dRight > oLeft && dLeft < oRight && dBottom > oTop && dTop < oBottom;
}
