/**
 * PixelFX Core - Software rasterizer for low-res pixel art effects
 * Inspired by patch-gg/pixelfx (MIT License)
 */

export interface PixelFrame {
  width: number;
  height: number;
  data: Uint32Array; // ABGR / RGBA 32-bit packed colors for maximum CPU performance
}

export function createFrame(width: number, height: number): PixelFrame {
  return {
    width,
    height,
    data: new Uint32Array(width * height),
  };
}

export function clearFrame(frame: PixelFrame, clearColor: number = 0x00000000): void {
  frame.data.fill(clearColor);
}

/**
 * Packs RGBA (0-255) into a 32-bit integer (Little-endian: ABGR for standard browser ImageData)
 */
export function packColor(r: number, g: number, b: number, a: number = 255): number {
  return ((a & 0xff) << 24) | ((b & 0xff) << 16) | ((g & 0xff) << 8) | (r & 0xff);
}

/**
 * Draws a single pixel onto the frame
 */
export function setPixel(frame: PixelFrame, x: number, y: number, color: number): void {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  if (ix < 0 || ix >= frame.width || iy < 0 || iy >= frame.height) return;
  frame.data[iy * frame.width + ix] = color;
}

/**
 * Draws a filled pixel rectangle
 */
export function fillRect(
  frame: PixelFrame,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number
): void {
  const x0 = Math.max(0, Math.floor(x));
  const y0 = Math.max(0, Math.floor(y));
  const x1 = Math.min(frame.width, Math.floor(x + w));
  const y1 = Math.min(frame.height, Math.floor(y + h));

  for (let cy = y0; cy < y1; cy++) {
    const rowOffset = cy * frame.width;
    for (let cx = x0; cx < x1; cx++) {
      frame.data[rowOffset + cx] = color;
    }
  }
}

/**
 * Composites the PixelFrame into the browser's Canvas ImageData Uint8ClampedArray
 */
export function compositeToImageData(frame: PixelFrame, target: ImageData): void {
  const targetUint32 = new Uint32Array(target.data.buffer);
  targetUint32.set(frame.data);
}
