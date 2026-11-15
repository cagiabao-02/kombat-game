import { PixelFrame, clearFrame, fillRect, packColor, setPixel } from '../core';

export interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: number;
  width: number;
  height: number;
  angle: number;
  rotSpeed: number;
  oscillationPhase: number;
  oscillationSpeed: number;
  type: 'bit' | 'streamer';
  trail?: { x: number; y: number }[];
}

// 8-bit / 16-bit arcade celebratory color palette (Little-endian ABGR)
const CONFETTI_PALETTE = [
  packColor(255, 71, 126),  // Neon Rose
  packColor(255, 128, 0),   // Electric Orange
  packColor(255, 209, 102), // Golden Yellow
  packColor(6, 214, 160),   // Mint Emerald
  packColor(17, 138, 178),  // Sky Blue
  packColor(114, 9, 183),   // Royal Violet
  packColor(255, 255, 255), // Pure White Sparkle
];

export class PixelConfettiFx {
  private particles: ConfettiParticle[] = [];
  private elapsed: number = 0;
  private duration: number = 3.6; // 3.6 seconds total
  private poppedLeft: boolean = false;
  private poppedRight: boolean = false;
  private width: number;
  private height: number;

  constructor(width: number = 240, height: number = 160) {
    this.width = width;
    this.height = height;
    this.spawnCannon(0.2, -1); // Left cannon at x = 20% width
  }

  private spawnCannon(xRatio: number, dirX: number): void {
    const originX = this.width * xRatio;
    const originY = this.height * 0.95; // From bottom
    const count = 55;

    for (let i = 0; i < count; i++) {
      // Angle: 45° to 85° towards center
      const spreadAngle = (Math.PI / 4) + (Math.random() * (Math.PI / 3));
      const speed = 120 + Math.random() * 110;
      const isRight = dirX < 0; // firing to the right if dirX < 0

      const vx = (isRight ? 1 : -1) * Math.cos(spreadAngle) * speed + (Math.random() - 0.5) * 30;
      const vy = -Math.sin(spreadAngle) * speed;

      const color = CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)];
      const isStreamer = Math.random() < 0.2;

      this.particles.push({
        x: originX,
        y: originY,
        vx,
        vy,
        color,
        width: isStreamer ? 2 : 2 + Math.floor(Math.random() * 2), // 2-3 pixels wide
        height: isStreamer ? 5 : 2 + Math.floor(Math.random() * 2), // 2-3 pixels high
        angle: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 8,
        oscillationPhase: Math.random() * Math.PI * 2,
        oscillationSpeed: 4 + Math.random() * 6,
        type: isStreamer ? 'streamer' : 'bit',
        trail: isStreamer ? [] : undefined,
      });
    }
  }

  public update(dt: number): void {
    this.elapsed += dt;

    // Cannon 2 fires at 0.18s for sequential dual party poppers
    if (!this.poppedRight && this.elapsed >= 0.18) {
      this.poppedRight = true;
      this.spawnCannon(0.8, 1); // Right cannon at x = 80% width firing left
    }

    const gravity = 85; // Gravity acceleration
    const drag = 0.96;   // Air resistance

    for (const p of this.particles) {
      p.vx *= drag;
      p.vy = p.vy * drag + gravity * dt;

      // Flutter sideways motion (wind turbulence)
      p.oscillationPhase += p.oscillationSpeed * dt;
      const flutterX = Math.sin(p.oscillationPhase) * 12;

      p.x += (p.vx + flutterX) * dt;
      p.y += p.vy * dt;
      p.angle += p.rotSpeed * dt;

      // Streamer trail
      if (p.trail) {
        p.trail.unshift({ x: p.x, y: p.y });
        if (p.trail.length > 5) {
          p.trail.pop();
        }
      }
    }
  }

  public draw(frame: PixelFrame): void {
    clearFrame(frame);

    // Fade out during last 0.6s
    const alpha = this.elapsed > this.duration - 0.6
      ? Math.max(0, (this.duration - this.elapsed) / 0.6)
      : 1;

    if (alpha <= 0) return;

    for (const p of this.particles) {
      if (p.y < -10 || p.y > frame.height + 10 || p.x < -10 || p.x > frame.width + 10) {
        continue;
      }

      // Draw streamer trail ribbons
      if (p.trail && p.trail.length > 1) {
        for (let t = 0; t < p.trail.length; t++) {
          const pt = p.trail[t];
          setPixel(frame, pt.x, pt.y, p.color);
        }
      }

      // 3D paper tumbling flip effect: width oscillates between -p.width and +p.width
      const flipScale = Math.cos(p.angle);
      const renderW = Math.max(1, Math.round(p.width * Math.abs(flipScale)));
      const renderH = p.height;

      fillRect(frame, p.x - renderW / 2, p.y - renderH / 2, renderW, renderH, p.color);
    }
  }

  public isFinished(): boolean {
    return this.elapsed >= this.duration;
  }
}
