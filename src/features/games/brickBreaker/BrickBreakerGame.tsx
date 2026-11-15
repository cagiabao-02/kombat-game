'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_DEFAULT_WIDTH,
  PADDLE_EXPANDED_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y,
  BALL_RADIUS,
  BALL_BASE_SPEED,
  BALL_MAX_SPEED,
  Ball,
  Brick,
  Powerup,
  Particle,
  createLevelBricks,
  createInitialBall,
  launchBall,
  createBrickParticles,
  maybeSpawnPowerup,
  calculatePaddleBounce,
} from './brickBreakerLogic';
import {
  getBrickBreakerStats,
  recordBrickBreakerGame,
  BrickBreakerStats,
} from './brickBreakerStatsService';
import { sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { PixelFxOverlay } from '@/components/fx/PixelFxOverlay';
import Link from 'next/link';

export function BrickBreakerGame() {
  const { language } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React state cho UI
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [level, setLevel] = useState<number>(1);
  const [status, setStatus] = useState<'ready' | 'playing' | 'paused' | 'over' | 'victory'>('ready');
  const [stats, setStats] = useState<BrickBreakerStats>(() => getBrickBreakerStats());
  const [combo, setCombo] = useState<number>(0);
  const [isNewRecord, setIsNewRecord] = useState<boolean>(false);

  // Modal Game Over / Victory
  const [overModalOpen, setOverModalOpen] = useState(false);

  // Mutable Game Loop State (tránh re-render liên tục)
  const gameStateRef = useRef({
    paddleX: CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2,
    paddleWidth: PADDLE_DEFAULT_WIDTH,
    paddleTargetX: CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2,
    balls: [createInitialBall(CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2, PADDLE_DEFAULT_WIDTH)],
    bricks: createLevelBricks(1),
    powerups: [] as Powerup[],
    particles: [] as Particle[],
    lives: 3,
    score: 0,
    level: 1,
    combo: 0,
    status: 'ready' as 'ready' | 'playing' | 'paused' | 'over' | 'victory',
    expandTimer: 0,
    keys: { left: false, right: false },
    bricksBrokenTotal: 0,
    lastTime: 0,
  });

  // Khởi động lại ván chơi
  const restartGame = useCallback(() => {
    const s = gameStateRef.current;
    s.paddleWidth = PADDLE_DEFAULT_WIDTH;
    s.paddleX = CANVAS_WIDTH / 2 - PADDLE_DEFAULT_WIDTH / 2;
    s.paddleTargetX = s.paddleX;
    s.balls = [createInitialBall(s.paddleX, s.paddleWidth)];
    s.bricks = createLevelBricks(1);
    s.powerups = [];
    s.particles = [];
    s.lives = 3;
    s.score = 0;
    s.level = 1;
    s.combo = 0;
    s.status = 'ready';
    s.expandTimer = 0;
    s.bricksBrokenTotal = 0;

    setScore(0);
    setLives(3);
    setLevel(1);
    setStatus('ready');
    setCombo(0);
    setIsNewRecord(false);
    setOverModalOpen(false);
    setStats(getBrickBreakerStats());
  }, []);

  // Bắt đầu hoặc phóng bóng
  const handleLaunch = useCallback(() => {
    const s = gameStateRef.current;
    if (s.status === 'ready') {
      s.status = 'playing';
      setStatus('playing');
      s.balls = s.balls.map((b) => launchBall(b));
      sounds.playPaddleBounce();
    } else if (s.status === 'playing') {
      // Nếu có bóng đang dính, phóng nó
      s.balls = s.balls.map((b) => (b.stuckToPaddle ? launchBall(b) : b));
    }
  }, []);

  // Tạm dừng / Tiếp tục
  const handleTogglePause = useCallback(() => {
    const s = gameStateRef.current;
    if (s.status === 'playing') {
      s.status = 'paused';
      setStatus('paused');
    } else if (s.status === 'paused') {
      s.status = 'playing';
      setStatus('playing');
      s.lastTime = performance.now();
    }
  }, []);

  // Lắng nghe sự kiện bàn phím PC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const s = gameStateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        s.keys.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        s.keys.right = true;
      } else if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        handleLaunch();
      } else if (e.key === 'p' || e.key === 'P') {
        handleTogglePause();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const s = gameStateRef.current;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        s.keys.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        s.keys.right = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleLaunch, handleTogglePause]);

  // Pointer & Touch Move trên Canvas
  const updatePaddlePositionFromClientX = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const canvasX = (clientX - rect.left) * scaleX;
    const s = gameStateRef.current;
    s.paddleTargetX = Math.max(0, Math.min(CANVAS_WIDTH - s.paddleWidth, canvasX - s.paddleWidth / 2));
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updatePaddlePositionFromClientX(e.clientX);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    updatePaddlePositionFromClientX(e.clientX);
    handleLaunch();
  };

  // VÒNG LẶP VẬT LÝ VÀ VẼ HÌNH CHÍNH (GAME LOOP)
  useEffect(() => {
    let animId: number;

    const gameLoop = (currentTime: number) => {
      animId = requestAnimationFrame(gameLoop);
      const s = gameStateRef.current;

      if (!s.lastTime) {
        s.lastTime = currentTime;
      }
      const dt = Math.min(0.05, (currentTime - s.lastTime) / 1000);
      s.lastTime = currentTime;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // 1. CẬP NHẬT LOGIC KHI ĐANG CHƠI
      if (s.status === 'playing') {
        // Cập nhật phím di chuyển PC
        const moveSpeed = 480 * dt;
        if (s.keys.left) {
          s.paddleTargetX = Math.max(0, s.paddleTargetX - moveSpeed);
        }
        if (s.keys.right) {
          s.paddleTargetX = Math.min(CANVAS_WIDTH - s.paddleWidth, s.paddleTargetX + moveSpeed);
        }

        // Nội suy mượt vị trí paddle
        s.paddleX += (s.paddleTargetX - s.paddleX) * Math.min(1, dt * 25);

        // Đếm ngược buff Expand
        if (s.expandTimer > 0) {
          s.expandTimer -= dt;
          if (s.expandTimer <= 0) {
            s.paddleWidth = PADDLE_DEFAULT_WIDTH;
          }
        }

        // Cập nhật vật phẩm rơi Powerups
        for (let i = s.powerups.length - 1; i >= 0; i--) {
          const pw = s.powerups[i];
          pw.y += pw.vy * dt;

          // Chạm paddle hứng được vật phẩm
          if (
            pw.y + pw.height >= PADDLE_Y &&
            pw.y <= PADDLE_Y + PADDLE_HEIGHT &&
            pw.x + pw.width >= s.paddleX &&
            pw.x <= s.paddleX + s.paddleWidth
          ) {
            sounds.playPowerupCatch();

            if (pw.type === 'expand') {
              s.paddleWidth = PADDLE_EXPANDED_WIDTH;
              s.expandTimer = 14;
            } else if (pw.type === 'multi') {
              // Nhân đôi số bóng (x2): Mỗi bóng sinh thêm 1 bóng (1 -> 2, 2 -> 4, 3 -> 6, tối đa 24 bóng)
              const MAX_BALLS = 24;
              if (s.balls.length > 0 && s.balls.length < MAX_BALLS) {
                const currentBalls = [...s.balls];
                const newBalls: Ball[] = [];

                for (let k = 0; k < currentBalls.length; k++) {
                  if (s.balls.length + newBalls.length >= MAX_BALLS) break;
                  const src = currentBalls[k];
                  const baseSpeed = src.speed || BALL_BASE_SPEED;
                  const currentAngle = src.stuckToPaddle
                    ? -Math.PI / 2
                    : Math.atan2(src.vy, src.vx);

                  const angleOffset = (k % 2 === 0 ? 1 : -1) * 0.35;
                  const newAngle = currentAngle + angleOffset;

                  newBalls.push({
                    id: `b-m-${Date.now()}-${k}-${Math.random()}`,
                    x: src.x,
                    y: src.y,
                    vx: Math.cos(newAngle) * baseSpeed,
                    vy: Math.sin(newAngle) * baseSpeed,
                    speed: baseSpeed,
                    stuckToPaddle: false,
                    stuckOffset: 0,
                  });
                }
                s.balls.push(...newBalls);
              }
            } else if (pw.type === 'plus2') {
              // Vật phẩm +2: Mỗi bóng hiện có sinh thêm đúng 2 bóng mới (1 -> 3, 2 -> 6, 3 -> 9, tối đa 24 bóng)
              const MAX_BALLS = 24;
              if (s.balls.length > 0 && s.balls.length < MAX_BALLS) {
                const currentBalls = [...s.balls];
                const newBalls: Ball[] = [];

                for (let b = 0; b < currentBalls.length; b++) {
                  const src = currentBalls[b];
                  const baseSpeed = src.speed || BALL_BASE_SPEED;
                  const currentAngle = src.stuckToPaddle
                    ? -Math.PI / 2
                    : Math.atan2(src.vy, src.vx);

                  for (let k = 0; k < 2; k++) {
                    if (s.balls.length + newBalls.length >= MAX_BALLS) break;
                    const angleOffset = (k === 0 ? 1 : -1) * 0.42;
                    const newAngle = currentAngle + angleOffset;

                    newBalls.push({
                      id: `b-p2-${Date.now()}-${b}-${k}-${Math.random()}`,
                      x: src.x,
                      y: src.y,
                      vx: Math.cos(newAngle) * baseSpeed,
                      vy: Math.sin(newAngle) * baseSpeed,
                      speed: baseSpeed,
                      stuckToPaddle: false,
                      stuckOffset: 0,
                    });
                  }
                }
                s.balls.push(...newBalls);
              }
            } else if (pw.type === 'life') {
              s.lives = Math.min(5, s.lives + 1);
              setLives(s.lives);
            }

            s.powerups.splice(i, 1);
            continue;
          }

          // Rơi khỏi màn hình
          if (pw.y > CANVAS_HEIGHT) {
            s.powerups.splice(i, 1);
          }
        }

        // Cập nhật vị trí các quả bóng
        for (let i = s.balls.length - 1; i >= 0; i--) {
          const ball = s.balls[i];

          if (ball.stuckToPaddle) {
            ball.x = s.paddleX + ball.stuckOffset;
            ball.y = PADDLE_Y - BALL_RADIUS;
            continue;
          }

          // Di chuyển bóng
          ball.x += ball.vx * dt;
          ball.y += ball.vy * dt;

          // Va chạm tường trái & phải
          if (ball.x - BALL_RADIUS <= 0) {
            ball.x = BALL_RADIUS;
            ball.vx = Math.abs(ball.vx);
            sounds.playBrickHit(1);
          } else if (ball.x + BALL_RADIUS >= CANVAS_WIDTH) {
            ball.x = CANVAS_WIDTH - BALL_RADIUS;
            ball.vx = -Math.abs(ball.vx);
            sounds.playBrickHit(1);
          }

          // Va chạm trần trên
          if (ball.y - BALL_RADIUS <= 0) {
            ball.y = BALL_RADIUS;
            ball.vy = Math.abs(ball.vy);
            sounds.playBrickHit(1);
          }

          // Va chạm thanh trượt Paddle
          if (
            ball.y + BALL_RADIUS >= PADDLE_Y &&
            ball.y - BALL_RADIUS <= PADDLE_Y + PADDLE_HEIGHT &&
            ball.x >= s.paddleX - 4 &&
            ball.x <= s.paddleX + s.paddleWidth + 4 &&
            ball.vy > 0
          ) {
            const bounce = calculatePaddleBounce(ball.x, s.paddleX, s.paddleWidth, ball.speed);
            ball.vx = bounce.vx;
            ball.vy = bounce.vy;
            ball.y = PADDLE_Y - BALL_RADIUS;
            s.combo = 0; // Đập trúng paddle reset chuỗi combo
            setCombo(0);
            sounds.playPaddleBounce();
          }

          // Va chạm với gạch (Bricks Collision)
          for (let j = s.bricks.length - 1; j >= 0; j--) {
            const br = s.bricks[j];

            // AABB vs Circle
            const nearestX = Math.max(br.x, Math.min(ball.x, br.x + br.width));
            const nearestY = Math.max(br.y, Math.min(ball.y, br.y + br.height));
            const dx = ball.x - nearestX;
            const dy = ball.y - nearestY;

            if (dx * dx + dy * dy <= BALL_RADIUS * BALL_RADIUS) {
              // Phản xạ góc nảy
              const overlapX = BALL_RADIUS - Math.abs(dx);
              const overlapY = BALL_RADIUS - Math.abs(dy);

              if (overlapX < overlapY) {
                ball.vx = -ball.vx;
              } else {
                ball.vy = -ball.vy;
              }

              // Tăng tốc độ bóng nhẹ sau mỗi lần đập gạch
              ball.speed = Math.min(BALL_MAX_SPEED, ball.speed + 3);

              br.hitsLeft--;
              s.combo++;
              setCombo(s.combo);
              s.particles.push(...createBrickParticles(br));
              sounds.playBrickHit(s.combo);

              // Xử lý nổ nếu là gạch bom
              if (br.isBomb) {
                for (let k = s.bricks.length - 1; k >= 0; k--) {
                  const nb = s.bricks[k];
                  if (Math.abs(nb.row - br.row) <= 1 && Math.abs(nb.col - br.col) <= 1) {
                    s.score += nb.points;
                    s.particles.push(...createBrickParticles(nb));
                    s.bricks.splice(k, 1);
                  }
                }
              }

              if (br.hitsLeft <= 0) {
                s.score += br.points * Math.min(4, 1 + Math.floor(s.combo / 4));
                s.bricksBrokenTotal++;
                setScore(s.score);
                const pw = maybeSpawnPowerup(br);
                if (pw) s.powerups.push(pw);
                s.bricks.splice(j, 1);
              }
              break;
            }
          }

          // Rơi đáy (Mất bóng)
          if (ball.y - BALL_RADIUS > CANVAS_HEIGHT) {
            s.balls.splice(i, 1);
          }
        }

        // Xử lý mất mạng khi hết sạch bóng
        if (s.balls.length === 0) {
          s.lives--;
          setLives(s.lives);
          sounds.playLifeLost();

          if (s.lives <= 0) {
            // GAME OVER
            s.status = 'over';
            setStatus('over');
            const result = recordBrickBreakerGame(s.score, s.level, s.bricksBrokenTotal);
            setIsNewRecord(result.isNewHighScore);
            setStats(result.stats);
            setOverModalOpen(true);
          } else {
            // Hồi sinh bóng mới dính trên paddle
            s.balls = [createInitialBall(s.paddleX, s.paddleWidth)];
            s.combo = 0;
            setCombo(0);
          }
        }

        // Xử lý hoàn thành màn chơi (Clear Level)
        if (s.bricks.length === 0) {
          sounds.playLevelUp();
          s.level++;
          setLevel(s.level);
          s.bricks = createLevelBricks(s.level);
          s.balls = [createInitialBall(s.paddleX, s.paddleWidth)];
          s.combo = 0;
          setCombo(0);
        }
      }

      // Cập nhật hiệu ứng hạt Particle
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const p = s.particles[i];
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.life -= dt;
        p.alpha = Math.max(0, p.life / 0.5);
        if (p.life <= 0) {
          s.particles.splice(i, 1);
        }
      }

      // 2. VẼ HÌNH TOÀN BỘ KHUNG CẢNH (RENDER)
      // Nền không gian retro arcade
      ctx.fillStyle = '#090D16';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Lưới ánh sáng pixel mờ
      ctx.strokeStyle = '#1E293B';
      ctx.lineWidth = 1;
      for (let x = 0; x < CANVAS_WIDTH; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 0; y < CANVAS_HEIGHT; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Vẽ Gạch
      for (const br of s.bricks) {
        ctx.fillStyle = br.color;
        ctx.fillRect(br.x, br.y, br.width, br.height);

        // Viền bóng 3D pixel nổi
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(br.x, br.y, br.width, 2);
        ctx.fillRect(br.x, br.y, 2, br.height);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fillRect(br.x, br.y + br.height - 2, br.width, 2);
        ctx.fillRect(br.x + br.width - 2, br.y, 2, br.height);

        // Nếu là gạch thép bị nứt
        if (br.maxHits === 2 && br.hitsLeft === 1) {
          ctx.strokeStyle = '#1E293B';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(br.x + br.width * 0.3, br.y + 2);
          ctx.lineTo(br.x + br.width * 0.5, br.y + br.height * 0.6);
          ctx.lineTo(br.x + br.width * 0.7, br.y + br.height - 2);
          ctx.stroke();
        }

        // Nếu là gạch bom
        if (br.isBomb) {
          ctx.fillStyle = '#FFFFFF';
          ctx.font = '10px monospace';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('💣', br.x + br.width / 2, br.y + br.height / 2 + 1);
        }
      }

      // Vẽ vật phẩm Powerups rơi
      for (const pw of s.powerups) {
        let pwColor = '#10B981';
        let pwLabel = '↔️';
        if (pw.type === 'multi') {
          pwColor = '#F59E0B';
          pwLabel = '⚡';
        } else if (pw.type === 'plus2') {
          pwColor = '#8B5CF6';
          pwLabel = '+2';
        } else if (pw.type === 'life') {
          pwColor = '#EC4899';
          pwLabel = '💖';
        }

        ctx.fillStyle = pwColor;
        ctx.fillRect(pw.x, pw.y, pw.width, pw.height);
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(pw.x, pw.y, pw.width, pw.height);

        ctx.font = 'bold 9px monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#FFFFFF';
        ctx.fillText(pwLabel, pw.x + pw.width / 2, pw.y + pw.height / 2 + 0.5);
      }

      // Vẽ Paddle (Thanh trượt)
      const px = s.paddleX;
      const pw = s.paddleWidth;
      const py = PADDLE_Y;
      const ph = PADDLE_HEIGHT;

      // Thân thanh trượt màu Cyan Neo-Arcade
      ctx.fillStyle = '#06B6D4';
      ctx.fillRect(px, py, pw, ph);

      // Điểm nhấn viền pixel nổi
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(px + 4, py + 2, pw - 8, 3);
      ctx.fillStyle = '#083344';
      ctx.fillRect(px, py + ph - 3, pw, 3);

      // Hai đầu thanh trượt dập bạc
      ctx.fillStyle = '#E2E8F0';
      ctx.fillRect(px, py, 4, ph);
      ctx.fillRect(px + pw - 4, py, 4, ph);

      // Vẽ các quả bóng
      for (const ball of s.balls) {
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, BALL_RADIUS, 0, Math.PI * 2);
        ctx.fill();

        // Viền ánh sáng bóng
        ctx.fillStyle = '#38BDF8';
        ctx.beginPath();
        ctx.arc(ball.x - 1.5, ball.y - 1.5, BALL_RADIUS * 0.45, 0, Math.PI * 2);
        ctx.fill();
      }

      // Vẽ hạt bụi vỡ gạch Particles
      for (const p of s.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      }
      ctx.globalAlpha = 1;

      // Hiển thị chữ gợi ý khi bóng đang sẵn sàng phóng
      if (s.status === 'ready' || s.balls.some((b) => b.stuckToPaddle)) {
        ctx.fillStyle = '#FDE047';
        ctx.font = 'bold 12px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.fillText(
          language === 'vi' ? 'CHẠM HOẶC PHÍM SPACE ĐỂ PHÓNG!' : 'TAP OR SPACEBAR TO LAUNCH!',
          CANVAS_WIDTH / 2,
          PADDLE_Y - 32
        );
      }
    };

    animId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animId);
  }, [language]);

  return (
    <div className="flex flex-col items-center">
      {/* 1. Header Bar: Điểm số, Mạng, Level, Kỷ lục */}
      <div className="mb-3 w-full max-w-[480px] flex items-center justify-between border-4 border-zinc-950 bg-[#18181B] p-2.5 text-white shadow-pixel-sm font-pixel text-xs">
        {/* Số mạng (Trái tim) */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <span
              key={i}
              className={`text-sm ${i < lives ? 'text-rose-500 animate-pulse' : 'text-zinc-700'}`}
            >
              ❤️
            </span>
          ))}
        </div>

        {/* Điểm số & Màn chơi */}
        <div className="flex items-center gap-3">
          <div className="text-center">
            <span className="text-[10px] text-zinc-400 block font-mono">STAGE</span>
            <span className="text-amber-300 font-bold text-sm">{level}</span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block font-mono">SCORE</span>
            <span className="text-emerald-400 font-bold text-base sm:text-lg">
              {score.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Khung vẽ Canvas Game */}
      <div className="relative border-4 border-zinc-950 bg-black shadow-[0_8px_0_0_#18181b] overflow-hidden w-full max-w-[480px] aspect-[3/4]">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          className="h-full w-full touch-none select-none cursor-pointer"
        />

        {/* Combo Badge góc trên màn hình */}
        {combo >= 2 && (
          <div className="pointer-events-none absolute top-3 right-3 bg-amber-400 border-2 border-zinc-950 px-2 py-0.5 text-zinc-950 font-pixel text-[10px] font-bold shadow-pixel-xs animate-bounce">
            COMBO x{combo}!
          </div>
        )}

        {/* Màn che khi Tạm dừng */}
        {status === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/75 z-20">
            <h3 className="font-pixel text-2xl font-bold text-amber-300 uppercase tracking-wider mb-3">
              {language === 'vi' ? 'ĐÃ TẠM DỪNG' : 'PAUSED'}
            </h3>
            <button
              type="button"
              onClick={handleTogglePause}
              className="pixel-btn bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-4 py-2 font-bold font-pixel text-xs border-2 border-zinc-900"
            >
              {language === 'vi' ? 'TIẾP TỤC' : 'RESUME'}
            </button>
          </div>
        )}
      </div>

      {/* 3. Phím bấm điều khiển ảo hỗ trợ Mobile */}
      <div className="mt-3 w-full max-w-[480px] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 sm:hidden">
          <button
            type="button"
            onTouchStart={() => {
              gameStateRef.current.keys.left = true;
            }}
            onTouchEnd={() => {
              gameStateRef.current.keys.left = false;
            }}
            className="flex h-12 w-14 items-center justify-center bg-zinc-900 text-white font-pixel text-base border-2 border-zinc-900 shadow-pixel-xs active:bg-zinc-800"
          >
            ◀
          </button>
          <button
            type="button"
            onTouchStart={() => {
              gameStateRef.current.keys.right = true;
            }}
            onTouchEnd={() => {
              gameStateRef.current.keys.right = false;
            }}
            className="flex h-12 w-14 items-center justify-center bg-zinc-900 text-white font-pixel text-base border-2 border-zinc-900 shadow-pixel-xs active:bg-zinc-800"
          >
            ▶
          </button>
        </div>

        {/* Nút Phóng bóng */}
        <button
          type="button"
          onClick={handleLaunch}
          className="pixel-btn flex-1 h-12 inline-flex items-center justify-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-pixel text-xs font-bold border-2 border-zinc-950 shadow-pixel-xs active:translate-y-0.5"
        >
          <span>🚀</span>
          <span>
            {status === 'ready'
              ? (language === 'vi' ? 'BẮT ĐẦU' : 'START')
              : (language === 'vi' ? 'PHÓNG BÓNG' : 'LAUNCH')}
          </span>
        </button>

        {/* Tạm dừng & Reset */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleTogglePause}
            className="flex h-12 w-12 items-center justify-center bg-white text-zinc-900 border-2 border-zinc-950 shadow-pixel-xs hover:bg-zinc-100"
            title="Pause"
          >
            {status === 'paused' ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
          </button>

          <button
            type="button"
            onClick={restartGame}
            className="flex h-12 w-12 items-center justify-center bg-white text-zinc-900 border-2 border-zinc-950 shadow-pixel-xs hover:bg-zinc-100"
            title="Reset"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Ghi chú PC */}
      <p className="mt-3 text-center font-mono text-[11px] text-zinc-600 hidden sm:block">
        💡 {language === 'vi' ? 'PC: Di chuột hoặc dùng phím A/D để trượt. Bấm Phím Space để phóng bóng / bắn đạn.' : 'PC: Move mouse or press A/D to slide. Press Spacebar to launch / fire.'}
      </p>

      {/* Modal Game Over */}
      {overModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 animate-fade-in overflow-hidden">
          {/* Pháo hoa khi phá kỷ lục điểm cao */}
          <PixelFxOverlay active={isNewRecord} />

          <div className="pixel-box-lg relative w-full max-w-sm bg-[#FFFDF8] p-6 text-center z-10 border-4 border-zinc-950 shadow-[0_8px_0_0_#18181b]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-zinc-900 bg-rose-500 text-white shadow-pixel-sm mb-3">
              <span className="font-pixel text-2xl font-black">KO</span>
            </div>

            {isNewRecord && (
              <div className="mb-2 inline-flex items-center gap-1.5 bg-amber-400 px-3 py-1 font-pixel text-xs font-bold text-zinc-950 border-2 border-zinc-900 shadow-pixel-xs animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                <span>{language === 'vi' ? 'KỶ LỤC MỚI!' : 'NEW HIGH SCORE!'}</span>
              </div>
            )}

            <h3 className="font-pixel text-2xl sm:text-3xl font-bold text-zinc-950 uppercase tracking-wide">
              GAME OVER!
            </h3>

            <div className="my-4 grid grid-cols-2 gap-2 bg-[#ECE8DD] border-2 border-zinc-900 p-3 text-left">
              <div>
                <span className="text-[10px] font-pixel text-zinc-600 uppercase">
                  {language === 'vi' ? 'Điểm số:' : 'Score:'}
                </span>
                <p className="font-pixel text-lg font-bold text-emerald-700">
                  {score.toLocaleString()}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-pixel text-zinc-600 uppercase">
                  {language === 'vi' ? 'Kỷ lục:' : 'Best:'}
                </span>
                <p className="font-pixel text-lg font-bold text-zinc-900">
                  {stats.highScore.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={restartGame}
                className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold py-3 text-sm border-2 border-zinc-900 shadow-pixel-sm active:translate-y-0.5"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{language === 'vi' ? 'CHƠI LẠI NGAY' : 'PLAY AGAIN'}</span>
              </button>

              <Link
                href="/"
                className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-100 text-zinc-900 font-bold py-2.5 text-xs border-2 border-zinc-900 shadow-pixel-xs active:translate-y-0.5"
              >
                <span>{language === 'vi' ? 'VỀ SẢNH CHÍNH' : 'BACK TO LOBBY'}</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
