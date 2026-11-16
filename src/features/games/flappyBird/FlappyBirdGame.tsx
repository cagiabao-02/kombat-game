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
      // 2. RENDER GRAPHICS ON CANVAS
      // ==========================================
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // --- A. Bầu trời (Day / Night) ---
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      if (s.isNight) {
        skyGrad.addColorStop(0, '#0d1b2a');
        skyGrad.addColorStop(0.7, '#1b263b');
        skyGrad.addColorStop(1, '#415a77');
      } else {
        skyGrad.addColorStop(0, '#4ec0ca');
        skyGrad.addColorStop(0.7, '#70c5ce');
        skyGrad.addColorStop(1, '#b8e3e9');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

      // Mặt trăng / Mặt trời
      if (s.isNight) {
        // Mặt trăng lưỡi liềm pixel
        ctx.fillStyle = '#fdf0cd';
        ctx.beginPath();
        ctx.arc(290, 75, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0d1b2a';
        ctx.beginPath();
        ctx.arc(283, 72, 16, 0, Math.PI * 2);
        ctx.fill();

        // Những vì sao lấp lánh
        ctx.fillStyle = '#ffffff';
        [[40, 50], [90, 85], [140, 40], [210, 65], [320, 110], [180, 105]].forEach(([sx, sy]) => {
          ctx.fillRect(sx, sy, 2, 2);
        });
      } else {
        // Mặt trời dịu dàng góc xa
        ctx.fillStyle = '#fff4a3';
        ctx.beginPath();
        ctx.arc(285, 75, 22, 0, Math.PI * 2);
        ctx.fill();
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

  // Vẽ các đám mây
  const drawClouds = (ctx: CanvasRenderingContext2D, isNight: boolean) => {
    ctx.fillStyle = isNight ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.75)';
    const clouds = [
      { x: 30, y: 160, w: 75, h: 28 },
      { x: 170, y: 120, w: 90, h: 32 },
      { x: 280, y: 180, w: 65, h: 26 },
    ];
    for (const c of clouds) {
      ctx.beginPath();
      ctx.roundRect(c.x, c.y, c.w, c.h, 12);
      ctx.fill();
      ctx.beginPath();
      ctx.roundRect(c.x + 15, c.y - 12, c.w * 0.55, c.h, 10);
      ctx.fill();
    }
  };

  // Vẽ nền thành phố đằng xa
  const drawSkyline = (ctx: CanvasRenderingContext2D, isNight: boolean) => {
    ctx.fillStyle = isNight ? '#162b3d' : '#88d8b0';
    const buildings = [
      { x: 0, w: 35, h: 70 },
      { x: 35, w: 25, h: 50 },
      { x: 60, w: 40, h: 90 },
      { x: 100, w: 30, h: 60 },
      { x: 130, w: 45, h: 80 },
      { x: 175, w: 35, h: 65 },
      { x: 210, w: 50, h: 95 },
      { x: 260, w: 30, h: 55 },
      { x: 290, w: 40, h: 75 },
      { x: 330, w: 35, h: 85 },
    ];
    for (const b of buildings) {
      ctx.fillRect(b.x, GROUND_Y - b.h, b.w, b.h);
      // Cửa sổ pixel
      ctx.fillStyle = isNight ? 'rgba(255, 230, 110, 0.45)' : 'rgba(255, 255, 255, 0.3)';
      for (let wy = GROUND_Y - b.h + 8; wy < GROUND_Y - 12; wy += 14) {
        ctx.fillRect(b.x + 6, wy, 5, 6);
        if (b.w > 30) {
          ctx.fillRect(b.x + 18, wy, 5, 6);
        }
      }
      ctx.fillStyle = isNight ? '#162b3d' : '#88d8b0';
    }
  };

  // Vẽ cặp cột ống nước Retro Green
  const drawPipePair = (ctx: CanvasRenderingContext2D, pipe: PipePair) => {
    const px = pipe.x;
    const rimHeight = 24;
    const rimOverhang = 3;

    // --- CỘT TRÊN (Top Pipe) ---
    // Thân cột trên
    const topBodyGrad = ctx.createLinearGradient(px, 0, px + PIPE_WIDTH, 0);
    topBodyGrad.addColorStop(0, '#53a018');
    topBodyGrad.addColorStop(0.2, '#73bf2e');
    topBodyGrad.addColorStop(0.65, '#5aa71e');
    topBodyGrad.addColorStop(1, '#2d5e0b');

    ctx.fillStyle = topBodyGrad;
    ctx.fillRect(px, 0, PIPE_WIDTH, pipe.topHeight - rimHeight);
    ctx.strokeStyle = '#183804';
    ctx.lineWidth = 2.5;
    ctx.strokeRect(px, 0, PIPE_WIDTH, pipe.topHeight - rimHeight);

    // Vành miệng cột trên
    const rimTopY = pipe.topHeight - rimHeight;
    ctx.fillStyle = topBodyGrad;
    ctx.fillRect(px - rimOverhang, rimTopY, PIPE_WIDTH + rimOverhang * 2, rimHeight);
    ctx.strokeStyle = '#183804';
    ctx.strokeRect(px - rimOverhang, rimTopY, PIPE_WIDTH + rimOverhang * 2, rimHeight);

    // Vạch sáng bóng trên vành
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(px + 4, 0, 4, pipe.topHeight - rimHeight);
    ctx.fillRect(px + 3, rimTopY + 2, 4, rimHeight - 4);

    // --- CỘT DƯỚI (Bottom Pipe) ---
    // Vành miệng cột dưới
    const rimBottomY = pipe.bottomY;
    ctx.fillStyle = topBodyGrad;
    ctx.fillRect(px - rimOverhang, rimBottomY, PIPE_WIDTH + rimOverhang * 2, rimHeight);
    ctx.strokeStyle = '#183804';
    ctx.strokeRect(px - rimOverhang, rimBottomY, PIPE_WIDTH + rimOverhang * 2, rimHeight);

    // Thân cột dưới
    ctx.fillStyle = topBodyGrad;
    ctx.fillRect(px, rimBottomY + rimHeight, PIPE_WIDTH, pipe.bottomHeight - rimHeight);
    ctx.strokeRect(px, rimBottomY + rimHeight, PIPE_WIDTH, pipe.bottomHeight - rimHeight);

    // Vạch sáng bóng cột dưới
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.fillRect(px + 3, rimBottomY + 2, 4, rimHeight - 4);
    ctx.fillRect(px + 4, rimBottomY + rimHeight, 4, pipe.bottomHeight - rimHeight);
  };

  // Vẽ Chú chim Flappy Bird Pixel kinh điển
  const drawFlappyBird = (
    ctx: CanvasRenderingContext2D,
    bx: number,
    by: number,
    rot: number,
    wingFrame: number
  ) => {
    ctx.save();
    ctx.translate(bx + BIRD_WIDTH / 2, by + BIRD_HEIGHT / 2);
    ctx.rotate(rot);

    const w = BIRD_WIDTH;
    const h = BIRD_HEIGHT;
    const x = -w / 2;
    const y = -h / 2;

    // 1. Thân tròn vàng ấm
    ctx.fillStyle = '#f6d02f';
    ctx.beginPath();
    ctx.ellipse(x + 16, y + 12, 15, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#272002';
    ctx.stroke();

    // 2. Bụng trắng mềm
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(x + 12, y + 16, 7, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();

    // 3. Mắt to tròn đặc trưng
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x + 23, y + 7, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#272002';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Con ngươi mắt
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(x + 25, y + 7, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Điểm sáng trong mắt
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 24, y + 6, 1.5, 1.5);

    // 4. Mỏ cam rực rỡ
    ctx.fillStyle = '#f05323';
    ctx.beginPath();
    ctx.moveTo(x + 26, y + 8);
    ctx.lineTo(x + 36, y + 12);
    ctx.lineTo(x + 26, y + 17);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Đường rãnh giữa mỏ
    ctx.strokeStyle = '#7c1e05';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x + 26, y + 12.5);
    ctx.lineTo(x + 34, y + 12.5);
    ctx.stroke();

    // 5. Cánh vỗ theo frame (0: Lên, 1: Giữa, 2: Xuống)
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#272002';
    ctx.lineWidth = 2;
    ctx.beginPath();

    if (wingFrame === 0) {
      // Cánh vểnh lên
      ctx.ellipse(x + 9, y + 6, 7, 4.5, -0.5, 0, Math.PI * 2);
    } else if (wingFrame === 1) {
      // Cánh ngang
      ctx.ellipse(x + 9, y + 13, 7, 4.5, 0, 0, Math.PI * 2);
    } else {
      // Cánh đập chúc xuống
      ctx.ellipse(x + 9, y + 18, 7, 4.5, 0.6, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  };

  // Vẽ mặt đất cuộn liên tục
  const drawGround = (ctx: CanvasRenderingContext2D, offset: number) => {
    // Nền đất cát
    ctx.fillStyle = '#ded895';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);

    // Dải cỏ xanh bên trên
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 14);

    // Vạch cỏ nhấp nhô pixel
    ctx.fillStyle = '#9ce659';
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 4);

    // Đường viền đen ngăn cách
    ctx.strokeStyle = '#2d5e0b';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y);
    ctx.moveTo(0, GROUND_Y + 14);
    ctx.lineTo(CANVAS_WIDTH, GROUND_Y + 14);
    ctx.stroke();

    // Họa tiết vạch chéo mặt đất cuộn theo chuyển động
    ctx.strokeStyle = '#cbbe72';
    ctx.lineWidth = 3;
    for (let x = -offset - 20; x < CANVAS_WIDTH + 30; x += 22) {
      ctx.beginPath();
      ctx.moveTo(x, GROUND_Y + 16);
      ctx.lineTo(x - 12, CANVAS_HEIGHT);
      ctx.stroke();
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
          <div className="w-8 h-8 rounded bg-amber-300 border-2 border-zinc-900 flex items-center justify-center font-pixel text-base">
            🐦
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
          className="block w-full max-w-[360px] h-auto aspect-[360/580]"
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
