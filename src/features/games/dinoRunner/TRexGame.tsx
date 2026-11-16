'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  GROUND_Y,
  DINO_X,
  DINO_STAND_WIDTH,
  DINO_STAND_HEIGHT,
  DINO_DUCK_WIDTH,
  DINO_DUCK_HEIGHT,
  GRAVITY,
  JUMP_VELOCITY,
  DROP_ACCELERATION,
  MAX_SPEED,
  SPEED_ACCELERATION,
  DinoState,
  DinoGameState,
  Obstacle,
  createInitialDinoState,
  generateObstacle,
  checkCollision,
} from './dinoLogic';
import { recordTRexGame, getTRexStats } from './tRexStatsService';
import { sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import {
  RotateCcw,
  Trophy,
  ArrowUp,
  ArrowDown,
  Home,
} from 'lucide-react';

export function TRexGame() {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [gameState, setGameState] = useState<DinoGameState>(() =>
    createInitialDinoState(getTRexStats().highScore)
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isNewHighScore, setIsNewHighScore] = useState(false);
  const [isDuckingPressed, setIsDuckingPressed] = useState(false);

  // Jump counter for stats
  const jumpCountRef = useRef(0);
  const stateRef = useRef<DinoGameState>(gameState);
  stateRef.current = gameState;

  const isDuckingRef = useRef(false);
  isDuckingRef.current = isDuckingPressed;

  const animationFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);
  const nextObstacleDistanceRef = useRef<number>(480);

  // Jump Action
  const handleJump = useCallback(() => {
    const s = stateRef.current;
    if (s.isGameOver) {
      restartGame();
      return;
    }

    if (!isPlaying) {
      setIsPlaying(true);
      s.dinoState = 'running';
    }

    if (s.isGrounded) {
      s.dinoVy = JUMP_VELOCITY;
      s.isGrounded = false;
      s.dinoState = 'jumping';
      jumpCountRef.current += 1;
      sounds.playDinoJump();
    }
  }, [isPlaying]);

  // Duck Action Start / Stop
  const handleDuckStart = useCallback(() => {
    setIsDuckingPressed(true);
    const s = stateRef.current;
    if (s.isGameOver) return;
    if (!isPlaying) {
      setIsPlaying(true);
      s.dinoState = 'ducking';
    } else if (!s.isGrounded) {
      // Fast drop in air
      s.dinoVy += DROP_ACCELERATION * 4;
    } else {
      s.dinoState = 'ducking';
    }
  }, [isPlaying]);

  const handleDuckEnd = useCallback(() => {
    setIsDuckingPressed(false);
    const s = stateRef.current;
    if (s.isGameOver) return;
    if (s.isGrounded) {
      s.dinoState = isPlaying ? 'running' : 'idle';
    }
  }, [isPlaying]);

  // Restart Game
  const restartGame = useCallback(() => {
    const currentHighScore = getTRexStats().highScore;
    const fresh = createInitialDinoState(currentHighScore);
    fresh.dinoState = 'running';
    stateRef.current = fresh;
    jumpCountRef.current = 0;
    nextObstacleDistanceRef.current = 480;
    setIsPlaying(true);
    setIsGameOver(false);
    setIsNewHighScore(false);
    setGameState(fresh);
  }, []);

  // Keyboard Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        handleJump();
      } else if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleDuckStart();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowDown' || e.code === 'KeyS') {
        e.preventDefault();
        handleDuckEnd();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleJump, handleDuckStart, handleDuckEnd]);

  // Touch Swipe on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let touchStartY = 0;
    let touchStartX = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.changedTouches.length === 1) {
        const deltaY = e.changedTouches[0].clientY - touchStartY;
        const deltaX = Math.abs(e.changedTouches[0].clientX - touchStartX);

        if (deltaY < -25 && Math.abs(deltaY) > deltaX) {
          // Swipe Up -> Jump
          handleJump();
        } else if (deltaY > 25 && Math.abs(deltaY) > deltaX) {
          // Swipe Down -> Duck
          handleDuckStart();
          setTimeout(handleDuckEnd, 400);
        } else {
          // Tap -> Jump
          handleJump();
        }
      }
    };

    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleJump, handleDuckStart, handleDuckEnd]);

  // Main Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const gameLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = timestamp;

      const s = stateRef.current;

      // 1. UPDATE GAME STATE
      if (isPlaying && !s.isGameOver) {
        // Speed scaling
        s.speed = Math.min(s.speed + SPEED_ACCELERATION, MAX_SPEED);

        // Distance / Score increment
        s.score += Math.round(s.speed * 0.18);

        // 100-Point Milestone chime & score flash
        const currentMilestone = Math.floor(s.score / 100);
        if (currentMilestone > s.lastMilestoneScore && s.score > 0) {
          s.lastMilestoneScore = currentMilestone;
          s.milestoneFlashCountdown = 28; // flash for ~28 frames
          sounds.playDinoMilestone();
        }
        if (s.milestoneFlashCountdown > 0) {
          s.milestoneFlashCountdown -= 1;
        }

        // Day/Night Cycle (every 700 points, night lasts for 350 points)
        const cycleMod = s.score % 1400;
        const shouldBeNight = cycleMod >= 700 && cycleMod < 1050;
        s.isNight = shouldBeNight;

        // Smooth Night transition
        if (s.isNight && s.nightTransition < 1) {
          s.nightTransition = Math.min(1, s.nightTransition + 0.03);
        } else if (!s.isNight && s.nightTransition > 0) {
          s.nightTransition = Math.max(0, s.nightTransition - 0.03);
        }

        // Dino Physics
        if (!s.isGrounded) {
          // Extra drop force if holding duck key
          const gravityPull = isDuckingRef.current ? GRAVITY + DROP_ACCELERATION : GRAVITY;
          s.dinoVy += gravityPull;
          s.dinoY += s.dinoVy;

          const currentStandHeight = isDuckingRef.current ? DINO_DUCK_HEIGHT : DINO_STAND_HEIGHT;
          const groundLimit = GROUND_Y - currentStandHeight;

          if (s.dinoY >= groundLimit) {
            s.dinoY = groundLimit;
            s.dinoVy = 0;
            s.isGrounded = true;
            s.dinoState = isDuckingRef.current ? 'ducking' : 'running';
          }
        } else {
          s.dinoState = isDuckingRef.current ? 'ducking' : 'running';
        }

        // Animation leg switch
        s.runFrame = (s.runFrame + 0.22) % 2;

        // Update ground offset
        s.groundOffset = (s.groundOffset + s.speed) % 40;

        // Update ground details
        for (const detail of s.groundDetails) {
          detail.x -= s.speed;
          if (detail.x < -10) {
            detail.x = CANVAS_WIDTH + Math.random() * 40;
          }
        }

        // Update clouds
        for (const cloud of s.clouds) {
          cloud.x -= cloud.speed;
          if (cloud.x + cloud.width < 0) {
            cloud.x = CANVAS_WIDTH + Math.random() * 80;
            cloud.y = 25 + Math.random() * 50;
          }
        }

        // Spawn & Update Obstacles
        nextObstacleDistanceRef.current -= s.speed;
        if (nextObstacleDistanceRef.current <= 0) {
          s.obstacles.push(generateObstacle(s.score));
          // Khoảng cách an toàn giữa các vật cản: rộng rãi lúc đầu (~420-560px) để dễ nhảy né
          const baseGap = Math.max(260, 360 - Math.floor(s.score / 25));
          const speedGap = s.speed * 14;
          const randomExtra = Math.floor(Math.random() * 160);
          nextObstacleDistanceRef.current = baseGap + speedGap + randomExtra;
        }

        // Move obstacles & animate pterodactyls
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= s.speed;

          if (obs.type === 'pterodactyl') {
            obs.flapFrame = Math.floor(s.runFrame);
          }

          // Remove off-screen obstacles
          if (obs.x + obs.width < -10) {
            s.obstacles.splice(i, 1);
            continue;
          }

          // Collision Check
          const currentWidth = s.dinoState === 'ducking' ? DINO_DUCK_WIDTH : DINO_STAND_WIDTH;
          const currentHeight = s.dinoState === 'ducking' ? DINO_DUCK_HEIGHT : DINO_STAND_HEIGHT;

          if (checkCollision(DINO_X, s.dinoY, currentWidth, currentHeight, obs)) {
            // CRASH!
            s.isGameOver = true;
            s.dinoState = 'crashed';
            sounds.playDinoHit();

            // Record game result
            const result = recordTRexGame(s.score, jumpCountRef.current);
            setIsGameOver(true);
            setIsNewHighScore(result.isNewHighScore);
            if (result.isNewHighScore) {
              sounds.playVictory();
            }
          }
        }
      }

      // 2. RENDER SCENE
      renderScene(ctx, s);

      animationId = requestAnimationFrame(gameLoop);
    };

    animationId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  /** Hàm vẽ toàn bộ khung cảnh Retro 2D */
  const renderScene = (ctx: CanvasRenderingContext2D, s: DinoGameState) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Bầu trời: Nội suy giữa Ngày (#FFFDF8) và Đêm (#16161A)
    const t = s.nightTransition;
    const bgR = Math.round(255 * (1 - t) + 22 * t);
    const bgG = Math.round(253 * (1 - t) + 22 * t);
    const bgB = Math.round(248 * (1 - t) + 26 * t);
    ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Màu chính của các vật thể (Dino, Cây, Đất): Ngày (#27272A) <-> Đêm (#ECE8DD)
    const objR = Math.round(39 * (1 - t) + 236 * t);
    const objG = Math.round(39 * (1 - t) + 232 * t);
    const objB = Math.round(42 * (1 - t) + 221 * t);
    const primaryColor = `rgb(${objR}, ${objG}, ${objB})`;

    // Màu phụ / Mây / Chi tiết: Ngày (#A1A1AA) <-> Đêm (#71717A)
    const secR = Math.round(161 * (1 - t) + 113 * t);
    const secG = Math.round(161 * (1 - t) + 113 * t);
    const secB = Math.round(170 * (1 - t) + 122 * t);
    const secondaryColor = `rgb(${secR}, ${secG}, ${secB})`;

    // Vẽ Đêm: Mặt trăng & Sao đêm
    if (t > 0.05) {
      ctx.save();
      ctx.globalAlpha = t;

      // Vẽ các vì sao nhấp nháy
      ctx.fillStyle = '#FDE047';
      for (const star of s.stars) {
        ctx.fillRect(star.x, star.y, star.size, star.size);
      }

      // Vẽ Mặt trăng khuyết Pixel
      ctx.fillStyle = '#FEF08A';
      const moonX = 700;
      const moonY = 36;
      ctx.fillRect(moonX + 6, moonY, 14, 2);
      ctx.fillRect(moonX + 2, moonY + 2, 20, 2);
      ctx.fillRect(moonX, moonY + 4, 22, 14);
      ctx.fillRect(moonX + 2, moonY + 18, 20, 2);
      ctx.fillRect(moonX + 6, moonY + 20, 14, 2);
      // Cắt khuyết mặt trăng bằng màu nền đêm
      ctx.fillStyle = `rgb(${bgR}, ${bgG}, ${bgB})`;
      ctx.fillRect(moonX + 10, moonY + 2, 16, 18);

      ctx.restore();
    }

    // Vẽ Mây bay
    ctx.fillStyle = secondaryColor;
    for (const cloud of s.clouds) {
      drawPixelCloud(ctx, cloud.x, cloud.y, cloud.width);
    }

    // Vẽ Đường Đất (Ground line)
    ctx.fillStyle = primaryColor;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 2);

    // Vẽ các gờ đất & sỏi nhỏ nhấp nhô
    for (const d of s.groundDetails) {
      ctx.fillRect(d.x, GROUND_Y + 3, d.length, 2);
    }

    // Vẽ Chướng Ngại Vật (Cây xương rồng / Chim)
    for (const obs of s.obstacles) {
      if (obs.type === 'cactus_small') {
        drawSmallCacti(ctx, obs.x, obs.y, obs.variety || 1, primaryColor);
      } else if (obs.type === 'cactus_large') {
        drawLargeCacti(ctx, obs.x, obs.y, obs.variety || 1, primaryColor);
      } else if (obs.type === 'pterodactyl') {
        drawPterodactyl(ctx, obs.x, obs.y, obs.flapFrame || 0, primaryColor);
      }
    }

    // Vẽ Khủng Long T-Rex
    drawPixelDino(ctx, DINO_X, s.dinoY, s.dinoState, Math.floor(s.runFrame), primaryColor, `rgb(${bgR}, ${bgG}, ${bgB})`);

    // Vẽ HUD Điểm Số (HI 00000  00000)
    ctx.save();
    ctx.font = 'bold 16px monospace';
    ctx.textAlign = 'right';

    // High score
    ctx.fillStyle = secondaryColor;
    const hiText = `HI ${String(Math.max(s.highScore, s.score)).padStart(5, '0')}`;
    ctx.fillText(hiText, CANVAS_WIDTH - 100, 30);

    // Current score (nhấp nháy nếu đang đạt mốc 100đ)
    const shouldFlash = s.milestoneFlashCountdown > 0 && Math.floor(s.milestoneFlashCountdown / 4) % 2 === 0;
    if (!shouldFlash) {
      ctx.fillStyle = primaryColor;
      const scoreText = String(s.score).padStart(5, '0');
      ctx.fillText(scoreText, CANVAS_WIDTH - 24, 30);
    }
    ctx.restore();

    // Thông điệp bắt đầu nếu chưa chơi
    if (!isPlaying && !s.isGameOver) {
      ctx.save();
      ctx.font = 'bold 13px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = primaryColor;
      ctx.fillText(
        language === 'vi' ? 'NHẤN SPACE HOẶC CHẠM ĐỂ CHẠY' : 'PRESS SPACE OR TAP TO JUMP',
        CANVAS_WIDTH / 2,
        GROUND_Y - 70
      );
      ctx.restore();
    }
  };

  /** Vẽ đám mây Pixel */
  const drawPixelCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number) => {
    ctx.fillRect(x + 10, y, w - 20, 4);
    ctx.fillRect(x + 4, y + 4, w - 8, 4);
    ctx.fillRect(x, y + 8, w, 4);
  };

  /** Vẽ cụm xương rồng nhỏ */
  const drawSmallCacti = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    variety: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    for (let i = 0; i < variety; i++) {
      const cx = x + i * 16;
      // Thân chính
      ctx.fillRect(cx + 5, y, 6, 35);
      // Nhánh trái
      ctx.fillRect(cx, y + 8, 5, 4);
      ctx.fillRect(cx, y + 8, 4, 14);
      // Nhánh phải
      ctx.fillRect(cx + 11, y + 14, 5, 4);
      ctx.fillRect(cx + 12, y + 14, 4, 12);
    }
  };

  /** Vẽ cụm xương rồng lớn */
  const drawLargeCacti = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    variety: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    for (let i = 0; i < variety; i++) {
      const cx = x + i * 24;
      // Thân chính
      ctx.fillRect(cx + 8, y, 8, 48);
      // Nhánh trái
      ctx.fillRect(cx, y + 12, 8, 6);
      ctx.fillRect(cx, y + 12, 6, 18);
      // Nhánh phải
      ctx.fillRect(cx + 16, y + 18, 8, 6);
      ctx.fillRect(cx + 18, y + 18, 6, 18);
    }
  };

  /** Vẽ chim Pterodactyl */
  const drawPterodactyl = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    frame: number,
    color: string
  ) => {
    ctx.fillStyle = color;
    // Thân chim
    ctx.fillRect(x + 12, y + 12, 18, 8);
    // Mỏ và đầu
    ctx.fillRect(x, y + 8, 14, 6);
    ctx.fillRect(x + 4, y + 6, 6, 3);
    // Mắt
    ctx.fillRect(x + 2, y + 7, 2, 2);

    if (frame === 0) {
      // Cánh vỗ lên
      ctx.fillRect(x + 16, y, 8, 12);
      ctx.fillRect(x + 22, y + 2, 6, 10);
    } else {
      // Cánh vỗ xuống
      ctx.fillRect(x + 16, y + 20, 8, 12);
      ctx.fillRect(x + 22, y + 18, 6, 10);
    }
  };

  /** Vẽ Khủng Long T-Rex Pixel Art nguyên bản */
  const drawPixelDino = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    state: DinoState,
    frame: number,
    color: string,
    eyeColor: string
  ) => {
    ctx.fillStyle = color;

    if (state === 'ducking') {
      // T-Rex cúi người (Ducking pose)
      // Thân bò dài
      ctx.fillRect(x, y + 12, 38, 14);
      // Đầu đưa về phía trước thấp
      ctx.fillRect(x + 36, y + 6, 20, 14);
      // Mũi và hàm
      ctx.fillRect(x + 48, y + 10, 8, 10);

      // Mắt
      ctx.fillStyle = eyeColor;
      ctx.fillRect(x + 42, y + 8, 3, 3);
      ctx.fillStyle = color;

      // Chân cúi thấp
      if (frame === 0) {
        ctx.fillRect(x + 14, y + 26, 6, 2);
        ctx.fillRect(x + 28, y + 24, 6, 4);
      } else {
        ctx.fillRect(x + 14, y + 24, 6, 4);
        ctx.fillRect(x + 28, y + 26, 6, 2);
      }
      return;
    }

    // T-Rex Đứng / Chạy / Nhảy / Tai nạn
    // Đầu & Hộp sọ
    ctx.fillRect(x + 20, y, 22, 16);
    ctx.fillRect(x + 22, y + 16, 16, 6); // Hàm trên
    ctx.fillRect(x + 26, y + 22, 12, 4); // Hàm dưới

    // Thân
    ctx.fillRect(x + 8, y + 16, 14, 20);
    ctx.fillRect(x, y + 20, 10, 12); // Đuôi sau
    ctx.fillRect(x + 2, y + 24, 8, 6);

    // Tay nhỏ T-Rex
    ctx.fillRect(x + 22, y + 26, 4, 3);
    ctx.fillRect(x + 25, y + 28, 2, 4);

    // Mắt
    if (state === 'crashed') {
      // Mắt chữ X (Game Over)
      ctx.fillStyle = eyeColor;
      ctx.fillRect(x + 28, y + 4, 2, 2);
      ctx.fillRect(x + 32, y + 4, 2, 2);
      ctx.fillRect(x + 30, y + 6, 2, 2);
      ctx.fillRect(x + 28, y + 8, 2, 2);
      ctx.fillRect(x + 32, y + 8, 2, 2);
      ctx.fillStyle = color;
    } else {
      // Mắt bình thường
      ctx.fillStyle = eyeColor;
      ctx.fillRect(x + 28, y + 4, 4, 4);
      ctx.fillStyle = color;
    }

    // Chân & Bàn chân
    if (state === 'jumping' || state === 'idle' || state === 'crashed') {
      // 2 chân tĩnh
      ctx.fillRect(x + 10, y + 36, 4, 10);
      ctx.fillRect(x + 10, y + 46, 6, 2);

      ctx.fillRect(x + 18, y + 36, 4, 10);
      ctx.fillRect(x + 18, y + 46, 6, 2);
    } else {
      // 2 chân chạy so le (alternating running legs)
      if (frame === 0) {
        // Chân trái chạm đất, chân phải gập
        ctx.fillRect(x + 10, y + 36, 4, 12);
        ctx.fillRect(x + 10, y + 46, 6, 2);

        ctx.fillRect(x + 18, y + 36, 4, 6);
        ctx.fillRect(x + 22, y + 40, 4, 2);
      } else {
        // Chân phải chạm đất, chân trái gập
        ctx.fillRect(x + 10, y + 36, 4, 6);
        ctx.fillRect(x + 6, y + 40, 4, 2);

        ctx.fillRect(x + 18, y + 36, 4, 12);
        ctx.fillRect(x + 18, y + 46, 6, 2);
      }
    }
  };

  return (
    <div className="mx-auto flex flex-col items-center gap-4 w-full max-w-3xl select-none">
      {/* Main Game Screen Canvas Container */}
      <div className="pixel-box-lg relative w-full overflow-hidden bg-zinc-900 p-1 sm:p-2 shadow-pixel-md">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="w-full h-auto cursor-pointer block border border-zinc-900"
          style={{ imageRendering: 'pixelated' }}
        />

        {/* Start Game Overlay Banner */}
        {!isPlaying && !isGameOver && (
          <div
            onClick={handleJump}
            className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 backdrop-blur-[1px] cursor-pointer"
          >
            <div className="pixel-box bg-[#FFFDF8] p-4 text-center animate-bounce shadow-pixel-md">
              <p className="font-pixel text-sm sm:text-base font-bold text-zinc-950 uppercase">
                {language === 'vi' ? 'CHẠM ĐỂ CHẠY!' : 'CLICK OR TAP TO RUN!'}
              </p>
              <p className="text-[11px] font-mono text-zinc-600 font-bold mt-1">
                {language === 'vi' ? 'Space: Nhảy • Mũi tên xuống: Cúi' : 'Space: Jump • Down Arrow: Duck'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Touch Controls (Nhảy & Cúi) */}
      <div className="w-full flex items-center justify-between gap-3 px-1 sm:hidden">
        <button
          type="button"
          onTouchStart={handleDuckStart}
          onTouchEnd={handleDuckEnd}
          onMouseDown={handleDuckStart}
          onMouseUp={handleDuckEnd}
          className={`pixel-btn flex-1 flex items-center justify-center gap-2 min-h-[52px] font-pixel text-sm font-bold border-2 border-zinc-900 shadow-pixel-sm ${
            isDuckingPressed ? 'bg-amber-400 text-zinc-950 scale-95' : 'bg-white text-zinc-900'
          }`}
        >
          <ArrowDown className="h-5 w-5" />
          <span>{language === 'vi' ? 'CÚI NÉ (GIỮ)' : 'DUCK (HOLD)'}</span>
        </button>

        <button
          type="button"
          onClick={handleJump}
          className="pixel-btn flex-1 flex items-center justify-center gap-2 min-h-[52px] bg-indigo-600 text-amber-300 hover:bg-indigo-500 font-pixel text-sm font-bold border-2 border-zinc-900 shadow-pixel-sm active:scale-95"
        >
          <ArrowUp className="h-5 w-5" />
          <span>{language === 'vi' ? 'NHẢY LÊN' : 'JUMP'}</span>
        </button>
      </div>

      {/* Desktop Keyboard Hints Bar */}
      <div className="hidden sm:flex items-center justify-between w-full px-2 text-xs font-mono text-zinc-600 font-bold">
        <div className="flex items-center gap-3">
          <span className="bg-zinc-200 border border-zinc-900 px-2 py-0.5 rounded text-zinc-900 font-mono">
            SPACE / ⬆️
          </span>
          <span>{language === 'vi' ? 'Nhảy qua xương rồng & chim thấp' : 'Jump over cacti & low birds'}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="bg-zinc-200 border border-zinc-900 px-2 py-0.5 rounded text-zinc-900 font-mono">
            ⬇️ / S
          </span>
          <span>{language === 'vi' ? 'Cúi né chim bay ngang tầm mắt' : 'Duck under flying pterodactyls'}</span>
        </div>
      </div>

      {/* GAME OVER MODAL */}
      {isGameOver && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-in fade-in duration-150">
          {/* Confetti if high score */}
          {isNewHighScore && <PixelFxOverlay active={true} />}

          <div className="pixel-box-lg relative w-full max-w-sm bg-[#FFFDF8] p-6 text-center animate-in zoom-in-95 duration-150 z-10">
            <div
              className={`mx-auto flex h-14 w-14 items-center justify-center border-2 border-zinc-900 shadow-pixel-sm mb-3 ${
                isNewHighScore ? 'bg-amber-300 text-zinc-950 animate-bounce' : 'bg-zinc-200 text-zinc-800'
              }`}
            >
              {isNewHighScore ? <Trophy className="h-7 w-7 text-zinc-950" /> : <span className="font-pixel text-2xl font-bold">💀</span>}
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
                  ? 'Bạn đã thiết lập cột mốc điểm số cao nhất mới!'
                  : 'You crushed your previous personal record!'
                : language === 'vi'
                ? 'Chú khủng long đã va phải chướng ngại vật.'
                : 'T-Rex crashed into an obstacle.'}
            </p>

            {/* Score Summary Box */}
            <div className="pixel-box bg-amber-50 p-3 mb-5 border-2 border-zinc-900">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-700 mb-1.5">
                <span>{language === 'vi' ? 'Điểm ván này:' : 'Final Score:'}</span>
                <span className="font-pixel text-lg text-emerald-700">{gameState.score}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono font-bold text-zinc-700">
                <span>{language === 'vi' ? 'Kỷ lục cao nhất:' : 'Best Score:'}</span>
                <span className="font-pixel text-base text-amber-700">
                  {Math.max(gameState.highScore, gameState.score)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={restartGame}
                className="pixel-btn min-h-[46px] w-full flex items-center justify-center gap-2 bg-indigo-600 px-4 py-2 text-sm font-bold text-amber-300 hover:bg-indigo-500"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{language === 'vi' ? 'CHẠY LẠI VÁN MỚI (SPACE)' : 'RUN AGAIN (SPACE)'}</span>
              </button>

              <Link
                href="/"
                className="pixel-btn min-h-[44px] w-full flex items-center justify-center gap-1.5 bg-white px-4 py-2 text-sm font-bold text-zinc-900 hover:bg-zinc-100"
              >
                <Home className="h-4 w-4 text-zinc-700" />
                <span>{language === 'vi' ? 'VỀ SẢNH TRÒ CHƠI' : 'BACK TO LOBBY'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
