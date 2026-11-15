import React from 'react';

interface PixelIconProps {
  className?: string;
}

export function PixelGamepad({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      {/* Gamepad body frame */}
      <path d="M3 4h10v1h1v1h1v5h-1v1h-2v-1h-1v-1H5v1H4v1H2v-1H1V6h1V5h1V4zm0 2v4h1V9h8v1h1V6H3z" />
      {/* D-pad */}
      <path d="M4 6h1v1h1v1H5v1H4V8H3V7h1V6z" />
      {/* A / B Buttons */}
      <rect x="11" y="6" width="1" height="1" />
      <rect x="9" y="7" width="1" height="1" />
    </svg>
  );
}

export function PixelTrophy({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M4 2h8v1h2v3h-1v1h-1v1h-2v2h1v2h2v2H3v-2h2v-2H4V8H2V7H1V6H0V3h2V2h2zm-2 2v2h2V4H2zm10 0v2h2V4h-2zM6 10h4v2H6v-2z" />
    </svg>
  );
}

export function PixelVolumeOn({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      {/* Speaker cone */}
      <path d="M7 2h1v12H7v-1H6v-1H5v-1H3v-1H2V6h1V5h2V4h1V3h1V2z" />
      {/* Sound waves */}
      <path d="M10 5h1v2h1v2h-1v2h-1V9h1V7h-1V5zm2-2h1v2h1v6h-1v2h-1v-2h1V5h-1V3z" />
    </svg>
  );
}

export function PixelVolumeOff({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      {/* Speaker cone */}
      <path d="M7 2h1v12H7v-1H6v-1H5v-1H3v-1H2V6h1V5h2V4h1V3h1V2z" />
      {/* Pixel X */}
      <path d="M10 5h1v1h1v1h1V6h1V5h1v1h-1v1h-1v2h1v1h1v1h-1v-1h-1V9h-1v1h-1v1h-1v-1h1V9h1V7h-1V6h-1V5z" />
    </svg>
  );
}

export function PixelGlobe({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M5 1h6v1h2v1h1v2h1v6h-1v2h-1v1h-2v1H5v-1H3v-1H2v-2H1V5h1V3h1V2h2V1zm1 2v2H3v2h3v2H3v2h3v2h1v-2h2v2h1v-2h3V9h-3V7h3V5h-3V3H9v2H7V3H6zm1 4h2v2H7V7z" />
    </svg>
  );
}

export function PixelShieldCheck({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M7 1h2v1h4v6h-1v3h-1v2H9v1H7v-1H5v-2H4V8H3V2h4V1zm0 8H5V7h2v2zm2-2h2V5H9v2zm-2 2h2V7H7v2z" />
    </svg>
  );
}

export function PixelBolt({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M8 1h4v2h-1v2h-1v2h3v2h-2v2H9v2H7v2H5v-3h1v-2h1V9H4V7h1V5h1V3h2V1z" />
    </svg>
  );
}

export function PixelBot({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M7 1h2v2h4v2h1v6h-1v2H3v-2H2V5h1V3h4V1zm-3 4v6h8V5H4zm1 2h2v2H5V7zm4 0h2v2H9V7zm-3 3h4v1H6v-1z" />
    </svg>
  );
}

export function PixelUsers({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M4 2h4v4H4V2zm6 1h3v3h-3V3zM2 8h8v2h1v4H1v-4h1V8zm9 1h3v1h1v4h-3v-3h-1V9z" />
    </svg>
  );
}

export function PixelBrain({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M4 2h3v1h2V2h3v2h2v3h-1v1h1v3h-2v2H9v-1H7v1H4v-2H2V8h1V7H2V4h2V2zm1 2v3h2V4H5zm4 0v3h2V4H9zM5 9v2h2V9H5zm4 0v2h2V9H9z" />
    </svg>
  );
}

export function PixelPlay({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M4 2h2v2h2v2h2v1h2v2h-2v1H8v2H6v2H4V2z" />
    </svg>
  );
}

export function PixelSparkles({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M7 1h2v3h2v2h3v2h-3v2H9v3H7v-3H5V8H2V6h3V4h2V1zm6 10h1v1h1v1h-1v1h-1v-1h-1v-1h1v-1zM2 11h1v1h1v1H3v1H2v-1H1v-1h1v-1z" />
    </svg>
  );
}

export function PixelSwords({ className = 'h-4 w-4' }: PixelIconProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`pixelated shrink-0 ${className}`}
      shapeRendering="crispEdges"
      fill="currentColor"
    >
      <path d="M12 2h2v2h-1v2h-2v2H9v2H7v1h1v2H6v-1H4v1H2v-2h1v-2h2V8h2V6h2V4h2V2h1zM2 2h2v2h2v2h1v2H5V6H3V4H2V2zm9 9h2v2h1v2h-2v-1h-2v-2h1v-1z" />
    </svg>
  );
}
