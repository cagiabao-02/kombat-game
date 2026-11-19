'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  BIRD_X,
  BIRD_WIDTH,
  BIRD_HEIGHT,
  GRAVITY,
  FLAP_VELOCITY,
  TERMINAL_VELOCITY,
  PIPE_WIDTH,
  PIPE_SPEED,
  PIPE_SPAWN_INTERVAL,
  FlappyGameState,
  PipePair,
  createInitialFlappyState,
  generatePipePair,
  checkFlappyCollision,
  getMedalForScore,
  MedalType,
} from './flappyLogic';
import { recordFlappyGame, getFlappyStats } from './flappyStatsService';
import { sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import {
  RotateCcw,
  Trophy,
  ArrowUp,
  Home,
  Volume2,
  VolumeX,
} from 'lucide-react';

export function FlappyBirdGame() {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<FlappyGameState>(() =>
    createInitialFlappyState(getFlappyStats().highScore)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const [earnedMedal, setEarnedMedal] = useState<MedalType>(null);

  // References for render loop & high performance physics
  const stateRef = useRef<FlappyGameState>(gameState);
  stateRef.current = gameState;

  const flapCountRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const wingTickRef = useRef<number>(0);
  const readyBobRef = useRef<number>(0);

  // Sound toggle
  const toggleSound = () => {
    sounds.toggleMute();
    setIsMuted(sounds.isMuted());
  };

  useEffect(() => {
    const handleVolume = (e: Event) => {
      const custom = e as CustomEvent<{ volume: number; muted: boolean }>;
      if (custom.detail) {
        setIsMuted(custom.detail.muted);
      }
    };
    window.addEventListener('kombat:volume_change', handleVolume);
    return () => window.removeEventListener('kombat:volume_change', handleVolume);
  }, []);

  // Flap Action
  const handleFlap = useCallback(() => {
    const s = stateRef.current;

    // Nếu game over, nhấn để restart
    if (s.status === 'game_over') {
      restartGame();
      return;
    }

    // Nếu đang ở màn hình sẵn sàng, bắt đầu ván bay đầu tiên
    if (s.status === 'ready') {
      s.status = 'playing';
      s.birdVy = FLAP_VELOCITY;
      s.birdRotation = -0.38;
      setIsPlaying(true);
      flapCountRef.current += 1;
      sounds.playFlappyFlap();
      return;
    }

    // Khi đang chơi: đập cánh
    if (s.status === 'playing') {
      s.birdVy = FLAP_VELOCITY;
      s.birdRotation = -0.38;
      s.wingFrame = 2; // Cánh đập xuống tạo lực nâng
      flapCountRef.current += 1;
      sounds.playFlappyFlap();
    }
  }, []);

  // Restart Game
  const restartGame = useCallback(() => {
    const freshHighScore = getFlappyStats().highScore;
    const freshState = createInitialFlappyState(freshHighScore);
    stateRef.current = freshState;
    setGameState(freshState);
    setIsPlaying(false);
    setIsGameOver(false);
    setIsNewHighScore(false);
    setEarnedMedal(null);
    flapCountRef.current = 0;
    lastTimeRef.current = 0;
  }, []);

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleFlap();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlap]);

  // Main Game Loop (Physics & Canvas 2D Drawing)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let mounted = true;

    const gameLoop = (timestamp: number) => {
      if (!mounted) return;

      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.05);
      lastTimeRef.current = timestamp;

      // Chuẩn hóa thời gian theo chuẩn 60 FPS (giúp game chạy mượt và đồng nhất trên cả màn hình 60Hz, 120Hz, 144Hz)
      const timeFactor = Math.min(Math.max(deltaTime * 60, 0.5), 1.8);

      const s = stateRef.current;

      // ==========================================
      // 1. UPDATE PHYSICS & GAME STATE
      // ==========================================
      if (s.status === 'ready') {
        // Chim bay lượn bồng bềnh tại chỗ
        readyBobRef.current += deltaTime * 4.5;
        s.birdY = 240 + Math.sin(readyBobRef.current) * 8;
        s.birdRotation = 0;

        // Vỗ cánh nhịp nhàng
        wingTickRef.current += deltaTime * 8;
        s.wingFrame = Math.floor(wingTickRef.current) % 3;

        // Cuộn mặt đất nhẹ nhàng
        s.groundOffset = (s.groundOffset + PIPE_SPEED * timeFactor) % 24;
      } else if (s.status === 'playing') {
        // 1. Áp dụng trọng lực cho chim
        s.birdVy += GRAVITY * timeFactor;
        if (s.birdVy > TERMINAL_VELOCITY) s.birdVy = TERMINAL_VELOCITY;
        s.birdY += s.birdVy * timeFactor;

        // Xoay đầu chim theo hướng bay (lượn tự nhiên, không bị cụp đầu đột ngột)
        if (s.birdVy < 0) {
          s.birdRotation = Math.max(-0.38, s.birdRotation - 0.06 * timeFactor);
        } else if (s.birdVy > 1.2) {
          s.birdRotation = Math.min(1.1, s.birdRotation + 0.04 * timeFactor);
        }

        // Đổi frame vỗ cánh
        if (s.birdVy < 1.0) {
          wingTickRef.current += deltaTime * 12;
          s.wingFrame = Math.floor(wingTickRef.current) % 3;
        } else {
          s.wingFrame = 1; // Giữ cánh lượn khi rơi
        }

        // 2. Cuộn mặt đất
        s.groundOffset = (s.groundOffset + PIPE_SPEED * timeFactor) % 24;

        // 3. Di chuyển và sinh cột
        s.nextPipeDistance -= PIPE_SPEED * timeFactor;
        if (s.nextPipeDistance <= 0) {
          s.pipes.push(generatePipePair());
          s.nextPipeDistance = PIPE_SPAWN_INTERVAL;
        }

        for (let i = s.pipes.length - 1; i >= 0; i--) {
          const pipe = s.pipes[i];
          pipe.x -= PIPE_SPEED * timeFactor;

          // Ghi điểm khi chim bay qua giữa cột
          if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_X) {
            pipe.passed = true;
            s.score += 1;
            sounds.playFlappyScore();
          }

          // Xóa cột đã trôi khỏi màn hình
          if (pipe.x + PIPE_WIDTH < -20) {
            s.pipes.splice(i, 1);
          }
        }

        // Đổi nền trời Ngày/Đêm sau mỗi 20 điểm
        s.isNight = Math.floor(s.score / 20) % 2 === 1;

        // 4. Kiểm tra va chạm
        const collision = checkFlappyCollision(s.birdY, s.pipes);
        if (collision.hit) {
          sounds.playFlappyHit();
          if (collision.hitGround) {
            sounds.playFlappyDie();
            s.status = 'game_over';
            finishGame(s.score);
          } else {
            // Rơi xuống đất sau khi đập vào cột
            s.status = 'crashed';
            s.birdVy = 2.0;
            sounds.playFlappyDie();
          }
        }
      } else if (s.status === 'crashed') {
        // Rơi tự do xuống đất
        s.birdVy += GRAVITY * 1.5 * timeFactor;
        s.birdY += s.birdVy * timeFactor;
        s.birdRotation = Math.min(1.4, s.birdRotation + 0.08 * timeFactor);

        if (s.birdY + BIRD_HEIGHT >= GROUND_Y) {
          s.birdY = GROUND_Y - BIRD_HEIGHT;
          s.status = 'game_over';
          finishGame(s.score);
        }
      }

      // ==========================================
      // 2. RENDER PIXEL ART GRAPHICS ON CANVAS
      // ==========================================
      ctx.imageSmoothingEnabled = false;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // --- A. Bầu trời phân dải màu Pixel (Pixel Sky Bands) ---
      if (s.isNight) {
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, CANVAS_WIDTH, 220);
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(0, 220, CANVAS_WIDTH, 160);
        ctx.fillStyle = '#334155';
        ctx.fillRect(0, 380, CANVAS_WIDTH, GROUND_Y - 380);

        // Mặt trăng lưỡi liềm Pixel (khối 4x4)
        const mx = 276;
        const my = 56;
        const mp = 4;
        ctx.fillStyle = '#fef08a';
        [
          [2, 0], [3, 0], [4, 0],
          [1, 1], [2, 1], [3, 1],
          [0, 2], [1, 2], [2, 2],
          [0, 3], [1, 3], [2, 3],
          [0, 4], [1, 4], [2, 4],
          [1, 5], [2, 5], [3, 5],
          [2, 6], [3, 6], [4, 6],
        ].forEach(([dx, dy]) => {
          ctx.fillRect(mx + dx * mp, my + dy * mp, mp, mp);
        });

        // Những vì sao pixel lấp lánh
        ctx.fillStyle = '#ffffff';
        [[40, 50], [92, 84], [140, 40], [212, 64], [320, 112], [180, 104]].forEach(([sx, sy]) => {
          ctx.fillRect(sx, sy, 3, 3);
        });
        ctx.fillStyle = '#fde047';
        [[64, 120], [236, 36]].forEach(([sx, sy]) => {
          ctx.fillRect(sx - 2, sy, 6, 2);
          ctx.fillRect(sx, sy - 2, 2, 6);
        });
      } else {
        ctx.fillStyle = '#4ec0ca';
        ctx.fillRect(0, 0, CANVAS_WIDTH, 260);
        ctx.fillStyle = '#70c5ce';
        ctx.fillRect(0, 260, CANVAS_WIDTH, 130);
        ctx.fillStyle = '#a5e1e9';
        ctx.fillRect(0, 390, CANVAS_WIDTH, GROUND_Y - 390);

        // Mặt trời Pixel 8-bit nhiều lớp (khối 4x4)
        const sx = 268;
        const sy = 52;
        const sp = 4;
        ctx.fillStyle = '#fef9c3';
        ctx.fillRect(sx + 2 * sp, sy, 4 * sp, 8 * sp);
        ctx.fillRect(sx + 1 * sp, sy + 1 * sp, 6 * sp, 6 * sp);
        ctx.fillRect(sx, sy + 2 * sp, 8 * sp, 4 * sp);
        ctx.fillStyle = '#fde047';
        ctx.fillRect(sx + 2 * sp, sy + 1 * sp, 4 * sp, 6 * sp);
        ctx.fillRect(sx + 1 * sp, sy + 2 * sp, 6 * sp, 4 * sp);
      }

      // --- B. Đám mây pixel trôi nhẹ ---
      drawClouds(ctx, s.isNight);

      // --- C. Dãy nhà cao tầng xa xăm (Skyline) ---
      drawSkyline(ctx, s.isNight);

      // --- D. Vẽ các cặp cột ống nước (Pipes) ---
      for (const pipe of s.pipes) {
        drawPipePair(ctx, pipe);
      }

      // --- E. Vẽ Chú Chim Flappy Bird ---
      drawFlappyBird(ctx, BIRD_X, s.birdY, s.birdRotation, s.wingFrame);

      // --- F. Mặt đất (Ground) & Hoa cỏ ---
      drawGround(ctx, s.groundOffset);

      // --- G. Điểm số nổi trong khi chơi ---
      if (s.status === 'playing') {
        drawScoreHUD(ctx, s.score);
      } else if (s.status === 'ready') {
        drawReadyGuide(ctx);
      }

      animationFrameIdRef.current = requestAnimationFrame(gameLoop);
    };

    animationFrameIdRef.current = requestAnimationFrame(gameLoop);

    return () => {
      mounted = false;
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, []);

  // Xử lý khi Game Over
  const finishGame = (finalScore: number) => {
    setIsGameOver(true);
    setIsPlaying(false);

    // Tính huy chương
    const medal = getMedalForScore(finalScore);
    setEarnedMedal(medal);

    // Ghi nhận và đồng bộ stats
    const { isNewHighScore: newRecord, stats } = recordFlappyGame(
      finalScore,
      flapCountRef.current
    );
    setIsNewHighScore(newRecord);
    setGameState((prev) => ({
      ...prev,
      highScore: stats.highScore,
    }));
  };

  // ==========================================
  // HELPER CANVAS DRAWING ROUTINES
  // ==========================================

  // Vẽ các đám mây Pixel Art xếp bậc thang
  const drawClouds = (ctx: CanvasRenderingContext2D, isNight: boolean) => {
    const mainCol = isNight ? '#334155' : '#ffffff';
    const shadeCol = isNight ? '#1e293b' : '#d8f3f8';
    const clouds = [
      { x: 24, y: 168 },
      { x: 164, y: 120 },
      { x: 268, y: 184 },
    ];
    for (const c of clouds) {
      // Bóng dưới đám mây
      ctx.fillStyle = shadeCol;
      ctx.fillRect(c.x + 4, c.y + 16, 68, 8);
      // Thân chính đám mây pixel
      ctx.fillStyle = mainCol;
      ctx.fillRect(c.x + 4, c.y + 8, 68, 12);
      ctx.fillRect(c.x, c.y + 12, 76, 8);
      ctx.fillRect(c.x + 12, c.y + 4, 44, 8);
      ctx.fillRect(c.x + 20, c.y, 24, 6);
    }
  };

  // Vẽ nền thành phố & bụi cây Pixel đằng xa
  const drawSkyline = (ctx: CanvasRenderingContext2D, isNight: boolean) => {
    const buildingCol = isNight ? '#162b3d' : '#94d9c3';
    const buildingDark = isNight ? '#0f1f2e' : '#7ac9b0';
    const windowCol = isNight ? '#fde047' : '#d1fae5';

    const buildings = [
      { x: 0, w: 36, h: 72 },
      { x: 36, w: 28, h: 52 },
      { x: 64, w: 40, h: 92 },
      { x: 104, w: 32, h: 64 },
      { x: 136, w: 44, h: 84 },
      { x: 180, w: 36, h: 68 },
      { x: 216, w: 48, h: 96 },
      { x: 264, w: 32, h: 56 },
      { x: 296, w: 40, h: 76 },
      { x: 336, w: 28, h: 88 },
    ];
    for (const b of buildings) {
      ctx.fillStyle = buildingCol;
      ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
      // Bóng cạnh phải tòa nhà
      ctx.fillStyle = buildingDark;
      ctx.fillRect(b.x + b.w - 4, GROUND_Y - b.h, 4, b.h);
      // Viền mái bậc thang
      ctx.fillRect(b.x + 4, GROUND_Y - b.h - 4, b.w - 8, 4);

      // Cửa sổ pixel 4x6
      ctx.fillStyle = windowCol;
      for (let wy = GROUND_Y - b.h + 8; wy < GROUND_Y - 22; wy += 12) {
        ctx.fillRect(b.x + 6, wy, 4, 6);
        ctx.fillRect(b.x + 16, wy, 4, 6);
        if (b.w >= 40) {
          ctx.fillRect(b.x + 26, wy, 4, 6);
        }
      }
    }

    // Dải bụi cây xanh Pixel ở chân thành phố
    const bushMain = isNight ? '#1b4332' : '#6ee7b7';
    const bushTop = isNight ? '#2d6a4f' : '#a7f3d0';
    for (let bx = 0; bx < CANVAS_WIDTH; bx += 24) {
      ctx.fillStyle = bushMain;
      ctx.fillRect(bx, GROUND_Y - 12, 24, 12);
      ctx.fillRect(bx + 4, GROUND_Y - 18, 16, 6);
      ctx.fillStyle = bushTop;
      ctx.fillRect(bx + 6, GROUND_Y - 18, 12, 3);
    }
  };

  // Vẽ cặp cột ống nước Retro Green Pixel Shading
  const drawPipePair = (ctx: CanvasRenderingContext2D, pipe: PipePair) => {
    const px = Math.round(pipe.x);
    const rimHeight = 24;
    const rimOverhang = 4;
    const outline = '#18181b';

    const drawShadedRect = (rx: number, ry: number, rw: number, rh: number) => {
      if (rh <= 0) return;
      // Viền đen pixel
      ctx.fillStyle = outline;
      ctx.fillRect(rx, ry, rw, rh);
      // Thân xanh lá chính
      ctx.fillStyle = '#73bf2e';
      ctx.fillRect(rx + 2, ry + 2, rw - 4, rh - 4);
      // Dải sáng bên trái (Highlight pixel bands)
      ctx.fillStyle = '#9ce659';
      ctx.fillRect(rx + 4, ry + 2, 10, rh - 4);
      ctx.fillStyle = '#d9f99d';
      ctx.fillRect(rx + 6, ry + 2, 3, rh - 4);
      // Dải tối bên phải (Shadow pixel bands)
      ctx.fillStyle = '#558c22';
      ctx.fillRect(rx + rw - 12, ry + 2, 10, rh - 4);
      ctx.fillStyle = '#3f6212';
      ctx.fillRect(rx + rw - 6, ry + 2, 4, rh - 4);
    };

    // CỘT TRÊN
    const rimTopY = pipe.topHeight - rimHeight;
    drawShadedRect(px, -2, PIPE_WIDTH, Math.max(0, rimTopY + 2));
    drawShadedRect(px - rimOverhang, rimTopY, PIPE_WIDTH + rimOverhang * 2, rimHeight);

    // CỘT DƯỚI
    const rimBottomY = pipe.bottomY;
    drawShadedRect(px - rimOverhang, rimBottomY, PIPE_WIDTH + rimOverhang * 2, rimHeight);
    drawShadedRect(
      px,
      rimBottomY + rimHeight,
      PIPE_WIDTH,
      Math.max(0, pipe.bottomHeight - rimHeight + 2)
    );
  };

  // Vẽ Chú chim Flappy Bird Pixel 17x12 (p = 2 => 34x24px chuẩn hitbox)
  const drawFlappyBird = (
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    rot: number,
    wingFrame: number
  ) => {
    ctx.save();
    ctx.translate(Math.round(bx + BIRD_WIDTH / 2), Math.round(by + BIRD_HEIGHT / 2));
    ctx.rotate(rot);

    const p = 2; // Mỗi khối pixel = 2x2 px
    const ox = -Math.floor((17 * p) / 2);
    const oy = -Math.floor((12 * p) / 2);

    const rect = (gx: number, gy: number, gw: number, gh: number, color: string) => {
      ctx.fillStyle = color;
      ctx.fillRect(ox + gx * p, oy + gy * p, gw * p, gh * p);
    };

    const outline = '#18181b';
    const bodyGold = '#f6d02f';
    const bodyLight = '#fef08a';
    const bodyShade = '#d97706';

    // 1. Viền đen thân chim (Pixel silhouette)
    rect(5, 0, 6, 1, outline);
    rect(3, 1, 2, 1, outline);
    rect(11, 1, 2, 1, outline);
    rect(2, 2, 1, 2, outline);
    rect(1, 4, 1, 4, outline);
    rect(2, 8, 1, 2, outline);
    rect(3, 10, 3, 1, outline);
    rect(6, 11, 5, 1, outline);
    rect(11, 10, 2, 1, outline);

    // 2. Thân chim màu vàng 3 tầng sáng tối
    rect(5, 1, 6, 1, bodyLight);
    rect(3, 2, 8, 2, bodyGold);
    rect(2, 4, 10, 4, bodyGold);
    rect(3, 8, 9, 2, bodyShade);
    rect(6, 10, 5, 1, bodyShade);
    // Bụng kem trắng dưới ngực
    rect(4, 9, 4, 1, '#fef3c7');

    // 3. Mắt to vuông Pixel đặc trưng
    rect(10, 1, 3, 1, outline);
    rect(9, 2, 1, 4, outline);
    rect(13, 2, 1, 4, outline);
    rect(10, 5, 3, 1, outline);
    rect(10, 2, 3, 3, '#ffffff');
    // Con ngươi đen + đốm sáng
    rect(12, 3, 1, 2, outline);

    // 4. Mỏ cam đỏ 2 tầng
    rect(12, 6, 4, 1, outline);
    rect(11, 7, 1, 3, outline);
    rect(16, 7, 1, 2, outline);
    rect(12, 10, 4, 1, outline);
    // Mỏ trên cam sáng
    rect(12, 7, 4, 1, '#f97316');
    // Khe mỏ đen
    rect(12, 8, 4, 1, '#7c2d12');
    // Mỏ dưới đỏ cam
    rect(12, 9, 3, 1, '#ea580c');

    // 5. Cánh vỗ 3 frame Pixel (0: Vểnh lên, 1: Ngang, 2: Chúc xuống)
    if (wingFrame === 0) {
      rect(3, 2, 4, 1, outline);
      rect(2, 3, 1, 2, outline);
      rect(7, 3, 1, 2, outline);
      rect(3, 5, 4, 1, outline);
      rect(3, 3, 4, 2, '#ffffff');
      rect(4, 4, 2, 1, '#e4e4e7');
    } else if (wingFrame === 1) {
      rect(2, 4, 5, 1, outline);
      rect(1, 5, 1, 2, outline);
      rect(7, 5, 1, 2, outline);
      rect(2, 7, 5, 1, outline);
      rect(2, 5, 5, 2, '#ffffff');
      rect(3, 6, 3, 1, '#e4e4e7');
    } else {
      rect(3, 6, 4, 1, outline);
      rect(2, 7, 1, 2, outline);
      rect(7, 7, 1, 2, outline);
      rect(3, 9, 4, 1, outline);
      rect(3, 7, 4, 2, '#ffffff');
      rect(4, 8, 2, 1, '#e4e4e7');
    }

    ctx.restore();
  };

  // Vẽ mặt đất cuộn Pixel Art (Dải cỏ răng cưa & Sỏi cát)
  const drawGround = (ctx: CanvasRenderingContext2D, offset: number) => {
    const snapOffset = Math.floor(offset / 3) * 3;

    // Nền đất cát
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Đường viền đen ngăn cách bầu trời & mặt đất
    ctx.fillStyle = '#18181b';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 3);

    // Dải cỏ xanh
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, GROUND_Y + 3, CANVAS_WIDTH, 13);

    // Vạch sáng trên ngọn cỏ
    ctx.fillStyle = '#9ce659';
    ctx.fillRect(0, GROUND_Y + 3, CANVAS_WIDTH, 3);

    // Họa tiết cỏ pixel răng cưa cuộn liên tục (bước 24px)
    for (let x = -snapOffset - 24; x < CANVAS_WIDTH + 24; x += 24) {
      ctx.fillStyle = '#9ce659';
      ctx.fillRect(x, GROUND_Y + 6, 12, 4);
      ctx.fillStyle = '#558c22';
      ctx.fillRect(x + 12, GROUND_Y + 10, 12, 6);
    }

    // Viền đen dưới dải cỏ
    ctx.fillStyle = '#558c22';
    ctx.fillRect(0, GROUND_Y + 16, CANVAS_WIDTH, 3);

    // Họa tiết gạch/đá Pixel trên cát cuộn
    ctx.fillStyle = '#d0c874';
    for (let x = -snapOffset - 24; x < CANVAS_WIDTH + 24; x += 24) {
      ctx.fillRect(x + 4, GROUND_Y + 26, 8, 4);
      ctx.fillRect(x + 14, GROUND_Y + 42, 6, 4);
      ctx.fillRect(x + 2, GROUND_Y + 58, 10, 4);
    }
  };

  // Hiển thị điểm số nổi giữa màn hình khi đang chơi
  const drawScoreHUD = (ctx: CanvasRenderingContext2D, score: number) => {
    ctx.save();
    ctx.font = '900 38px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const text = score.toString();
    const x = CANVAS_WIDTH / 2;
    const y = 45;

    // Đổ bóng viền dày đen retro
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 6;
    ctx.strokeText(text, x, y);

    // Màu chữ trắng nổi bật
    ctx.fillStyle = '#ffffff';
    ctx.fillText(text, x, y);
    ctx.restore();
  };

  // Hướng dẫn khi ở màn hình sẵn sàng
  const drawReadyGuide = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    ctx.textAlign = 'center';

    // Banner "FLAPPY BIRD"
    ctx.font = '900 28px "Courier New", monospace';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 5;
    ctx.strokeText('FLAPPY BIRD', CANVAS_WIDTH / 2, 130);
    ctx.fillStyle = '#f6d02f';
    ctx.fillText('FLAPPY BIRD', CANVAS_WIDTH / 2, 130);

    // Khung nút bấm hướng dẫn
    const bx = CANVAS_WIDTH / 2 - 95;
    const by = 310;
    const bw = 190;
    const bh = 54;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx, by, bw, bh);

    // Đổ bóng retro
    ctx.fillStyle = '#18181b';
    ctx.fillRect(bx + 4, by + bh, bw, 4);
    ctx.fillRect(bx + bw, by + 4, 4, bh);

    ctx.font = 'bold 13px monospace';
    ctx.fillStyle = '#18181b';
    ctx.fillText(
      language === 'vi' ? 'CHẠM HOẶC PHÍM CÁCH' : 'TAP OR PRESS SPACE',
      CANVAS_WIDTH / 2,
      by + 22
    );
    ctx.font = 'bold 11px monospace';
    ctx.fillStyle = '#4f46e5';
    ctx.fillText(
      language === 'vi' ? 'ĐỂ BAY QUA ỐNG NƯỚC' : 'TO FLY THROUGH PIPES',
      CANVAS_WIDTH / 2,
      by + 38
    );

    ctx.restore();
  };

  return (
    <div className="flex flex-col items-center select-none w-full max-w-md mx-auto">
      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between bg-white border-2 border-zinc-900 shadow-pixel-sm px-4 py-2.5 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#4ec0ca] border-2 border-zinc-900 flex items-center justify-center">
            <svg viewBox="0 0 12 10" className="w-6 h-5" shapeRendering="crispEdges">
              <rect x="3" y="1" width="5" height="1" fill="#18181b" />
              <rect x="2" y="2" width="7" height="5" fill="#f6d02f" />
              <rect x="7" y="2" width="2" height="2" fill="#ffffff" />
              <rect x="8" y="3" width="1" height="1" fill="#18181b" />
              <rect x="9" y="4" width="3" height="2" fill="#f97316" />
              <rect x="2" y="4" width="3" height="2" fill="#ffffff" />
            </svg>
          </div>
          <div>
            <h2 className="font-pixel text-sm font-bold text-zinc-900 leading-tight">
              FLAPPY BIRD
            </h2>
            <p className="text-[10px] font-mono font-bold text-zinc-500">
              {gameState.isNight
                ? language === 'vi'
                  ? '🌙 BAN ĐÊM'
                  : '🌙 NIGHT SKY'
                : language === 'vi'
                ? '☀️ BAN NGÀY'
                : '☀️ DAY SKY'}
            </p>
          </div>
        </div>

        {/* Audio Mute & Record Preview */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-amber-50 px-2 py-1 border border-zinc-900 text-xs font-mono font-bold text-amber-800">
            <Trophy className="h-3.5 w-3.5 text-amber-600" />
            <span>{gameState.highScore}</span>
          </div>

          <button
            type="button"
            onClick={toggleSound}
            aria-label="Bật/Tắt âm thanh"
            className="w-8 h-8 flex items-center justify-center border-2 border-zinc-900 bg-white hover:bg-zinc-100 shadow-pixel-sm transition-transform active:scale-95"
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4 text-zinc-600" />
            ) : (
              <Volume2 className="h-4 w-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>

      {/* Flappy Bird Canvas Area */}
      <div
        className="relative border-4 border-zinc-900 shadow-pixel-lg overflow-hidden bg-[#4ec0ca] cursor-pointer touch-none"
        onClick={handleFlap}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block w-full max-w-[360px] h-auto aspect-[360/580] [image-rendering:pixelated]"
        />

        {/* Tap Prompt Overlay for First-time player */}
        {!isPlaying && !isGameOver && (
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-end pb-24">
            <div className="animate-bounce bg-white/90 border-2 border-zinc-900 px-3 py-1.5 shadow-pixel-sm">
              <p className="font-pixel text-xs text-zinc-900 font-bold flex items-center gap-1.5">
                <span>👇</span>
                <span>{language === 'vi' ? 'CHẠM ĐỂ BAY' : 'TAP TO FLY'}</span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Big Tap Button */}
      <div className="w-full flex items-center justify-between gap-3 px-1 mt-3 sm:hidden">
        <button
          type="button"
          onClick={handleFlap}
          className="pixel-btn w-full flex items-center justify-center gap-2 min-h-[54px] bg-amber-400 hover:bg-amber-300 text-zinc-950 font-pixel text-base font-bold border-2 border-zinc-900 shadow-pixel-sm active:scale-95"
        >
          <ArrowUp className="h-5 w-5" />
          <span>{language === 'vi' ? 'ĐẬP CÁNH (TAP)' : 'FLAP WINGS (TAP)'}</span>
        </button>
      </div>

      {/* Desktop Keyboard Hints Bar */}
      <div className="hidden sm:flex items-center justify-center gap-4 w-full px-2 mt-3 text-xs font-mono text-zinc-600 font-bold">
        <div className="flex items-center gap-2">
          <span className="bg-zinc-200 border border-zinc-900 px-2 py-0.5 rounded text-zinc-900 font-mono">
            SPACE
          </span>
          <span>/</span>
          <span className="bg-zinc-200 border border-zinc-900 px-2 py-0.5 rounded text-zinc-900 font-mono">
            ⬆️
          </span>
          <span>/</span>
          <span className="bg-zinc-200 border border-zinc-900 px-2 py-0.5 rounded text-zinc-900 font-mono">
            CLICK
          </span>
          <span className="text-zinc-500">
            {language === 'vi' ? 'để đập cánh bay lên' : 'to flap wings and fly'}
          </span>
        </div>
      </div>

      {/* GAME OVER MODAL WITH RETRO MEDAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-150">
          {/* Confetti celebration for high scores or medals */}
          {(isNewHighScore || earnedMedal) && <PixelFxOverlay active={true} />}

          <div className="pixel-box-lg relative w-full max-w-sm bg-[#FFFDF8] p-6 text-center animate-in zoom-in-95 duration-150 z-10 border-4 border-zinc-900 shadow-pixel-lg">
            {/* Header Title */}
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center border-2 border-zinc-900 shadow-pixel-sm mb-3 ${
                isNewHighScore ? 'bg-amber-300 text-zinc-950 animate-bounce' : 'bg-rose-100 text-rose-800'
              }`}
            >
              {isNewHighScore ? (
                <Trophy className="h-7 w-7 text-zinc-950" />
              ) : (
                <span className="font-pixel text-2xl font-bold">💀</span>
              )}
            </div>

            <h3 className="font-pixel text-xl sm:text-2xl font-bold text-zinc-950 uppercase mb-1">
              {isNewHighScore
                ? language === 'vi'
                  ? 'KỶ LỤC MỚI! 👑'
                  : 'NEW HIGH SCORE! 👑'
                : 'GAME OVER!'}
            </h3>

            <p className="text-xs sm:text-sm font-mono text-zinc-600 mb-4">
              {isNewHighScore
                ? language === 'vi'
                  ? 'Xuất sắc! Bạn đã vượt qua kỷ lục trước đó!'
                  : 'Outstanding! You set a new personal record!'
                : language === 'vi'
                ? 'Chú chim đã va vào cột ống nước.'
                : 'Flappy bird crashed into a pipe.'}
            </p>

            {/* Retro Scoreboard Card with Medal */}
            <div className="pixel-box bg-[#F7F2E7] p-4 mb-5 border-2 border-zinc-900">
              <div className="flex items-center justify-between gap-3">
                {/* Medal Box */}
                <div className="flex flex-col items-center justify-center bg-white border-2 border-zinc-900 w-24 h-24 p-1">
                  <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                    {language === 'vi' ? 'Huy chương' : 'Medal'}
                  </p>
                  <div className="my-1">
                    {earnedMedal === 'platinum' && (
                      <span className="text-3xl filter drop-shadow">💎</span>
                    )}
                    {earnedMedal === 'gold' && (
                      <span className="text-3xl filter drop-shadow">🥇</span>
                    )}
                    {earnedMedal === 'silver' && (
                      <span className="text-3xl filter drop-shadow">🥈</span>
                    )}
                    {earnedMedal === 'bronze' && (
                      <span className="text-3xl filter drop-shadow">🥉</span>
                    )}
                    {!earnedMedal && (
                      <span className="text-2xl text-zinc-300">⚪</span>
                    )}
                  </div>
                  <p className="font-pixel text-[10px] font-bold text-zinc-700 capitalize">
                    {earnedMedal
                      ? earnedMedal
                      : language === 'vi'
                      ? 'Chưa có'
                      : 'None'}
                  </p>
                </div>

                {/* Score numbers */}
                <div className="flex-1 space-y-2 text-right">
                  <div className="border-b border-zinc-300 pb-1.5">
                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase">
                      {language === 'vi' ? 'Điểm ván này' : 'Score'}
                    </p>
                    <p className="font-pixel text-2xl font-bold text-emerald-600">
                      {gameState.score}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-mono font-bold text-zinc-500 uppercase flex items-center justify-end gap-1">
                      {isNewHighScore && (
                        <span className="bg-amber-300 text-zinc-950 px-1 py-0.2 rounded font-pixel text-[9px]">
                          NEW
                        </span>
                      )}
                      <span>{language === 'vi' ? 'Kỷ lục' : 'Best'}</span>
                    </p>
                    <p className="font-pixel text-xl font-bold text-amber-600">
                      {Math.max(gameState.highScore, gameState.score)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons: Chơi Lại & Về Sảnh (per user requirement) */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={restartGame}
                className="pixel-btn min-h-[46px] w-full flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2 text-sm font-bold text-amber-300 hover:bg-indigo-500 border-2 border-zinc-900 shadow-pixel-sm active:scale-95"
              >
                <RotateCcw className="h-4 w-4" />
                <span>
                  {language === 'vi' ? 'BAY LẠI (SPACE)' : 'FLY AGAIN (SPACE)'}
                </span>
              </button>

              <Link
                href="/"
                className="pixel-btn min-h-[44px] w-full flex items-center justify-center gap-1.5 bg-white px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-100 border-2 border-zinc-900 shadow-pixel-sm active:scale-95"
              >
                <Home className="h-4 w-4 text-zinc-700" />
                <span>
                  {language === 'vi' ? 'VỀ SẢNH TRÒ CHƠI' : 'BACK TO LOBBY'}
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
