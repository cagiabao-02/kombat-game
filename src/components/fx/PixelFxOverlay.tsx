'use client';

import React, { useRef, useEffect } from 'react';
import { createFrame, compositeToImageData } from '@/features/fx/core';
import { PixelConfettiFx } from '@/features/fx/effects/pixelConfetti';

interface PixelFxOverlayProps {
  active: boolean;
  type?: 'confetti';
  className?: string;
  onFinish?: () => void;
}

export function PixelFxOverlay({
  active,
  type = 'confetti',
  className = '',
  onFinish,
}: PixelFxOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!active || typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Pixel art virtual resolution
    const virtualW = 240;
    const virtualH = 160;

    canvas.width = virtualW;
    canvas.height = virtualH;

    const frame = createFrame(virtualW, virtualH);
    const imgData = ctx.createImageData(virtualW, virtualH);

    let fxInstance = new PixelConfettiFx(virtualW, virtualH);
    let animId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05); // Cap delta at 50ms to prevent jumps
      lastTime = currentTime;

      fxInstance.update(dt);
      fxInstance.draw(frame);
      compositeToImageData(frame, imgData);
      ctx.putImageData(imgData, 0, 0);

      if (!fxInstance.isFinished()) {
        animId = requestAnimationFrame(loop);
      } else {
        if (onFinish) {
          onFinish();
        }
      }
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [active, type, onFinish]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 z-50 h-full w-full [image-rendering:pixelated] ${className}`}
      aria-hidden="true"
    />
  );
}
