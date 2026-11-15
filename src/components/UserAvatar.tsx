'use client';

import React from 'react';

interface UserAvatarProps {
  avatar?: string | null;
  className?: string;
  fallback?: string;
  alt?: string;
}

export function isCustomImageAvatar(avatar?: string | null): boolean {
  if (!avatar) return false;
  return (
    avatar.startsWith('data:image') ||
    avatar.startsWith('http://') ||
    avatar.startsWith('https://')
  );
}

export function PixelAvatarSprite({ symbol }: { symbol: string }) {
  switch (symbol) {
    case '🥷': // Ninja
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#E0E7FF" />
          {/* Hood */}
          <path d="M4 2h8v2h2v9h-2v2H4v-2H2V4h2V2z" fill="#18181B" />
          {/* Red Headband */}
          <path d="M2 5h12v2H2V5zm12 1h1v2h-1V6z" fill="#EF4444" />
          {/* Face opening */}
          <rect x="4" y="7" width="8" height="3" fill="#FDE68A" />
          {/* Eyes */}
          <rect x="5" y="8" width="2" height="1" fill="#18181B" />
          <rect x="9" y="8" width="2" height="1" fill="#18181B" />
          {/* Mask shade */}
          <rect x="4" y="10" width="8" height="3" fill="#27272A" />
        </svg>
      );

    case '🤖': // Robot
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#E0F2FE" />
          {/* Antenna */}
          <rect x="7" y="1" width="2" height="1" fill="#EF4444" />
          <rect x="7" y="2" width="2" height="2" fill="#18181B" />
          {/* Head outline */}
          <path d="M3 4h10v9H3V4zm-1 3h1v3H2V7zm11 0h1v3h-1V7z" fill="#18181B" />
          {/* Metallic face */}
          <rect x="4" y="5" width="8" height="7" fill="#94A3B8" />
          <rect x="4" y="5" width="8" height="1" fill="#E2E8F0" />
          {/* Glowing Eyes */}
          <rect x="5" y="7" width="2" height="2" fill="#38BDF8" />
          <rect x="9" y="7" width="2" height="2" fill="#38BDF8" />
          {/* Mouth grill */}
          <path d="M5 10h6v1H5v-1z" fill="#1E293B" />
        </svg>
      );

    case '🧠': // Brain / Mastermind
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#FCE7F3" />
          {/* Outline */}
          <path d="M4 3h8v1h2v3h1v3h-1v2h-2v1H4v-1H2v-2H1V7h1V4h2V3z" fill="#18181B" />
          {/* Pink Brain Lobes */}
          <path d="M4 4h3v8H4v-1H3V7h1V4zm5 0h3v3h1v4h-1v1H9V4z" fill="#F472B6" />
          {/* Highlights & folds */}
          <path d="M4 4h3v1H4V4zm5 0h3v1H9V4zM5 7h2v1H5V7zm4 2h2v1H9V9z" fill="#FBCFE8" />
        </svg>
      );

    case '⚡': // Lightning
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#1E1B4B" />
          {/* Outline */}
          <path d="M8 1h5v3h-1v2h3v3h-2v2h-2v2H9v2H5v-4h1V9H3V6h2V4h2V2h1V1z" fill="#18181B" />
          {/* Bolt */}
          <path d="M8 2h3v2H9v2h4v1h-2v2H9v2H7v2H6v-3h2V8H4V7h2V5h2V2z" fill="#FACC15" />
          <path d="M8 2h2v2H8V2zm-2 5h3v1H6V7z" fill="#FEF08A" />
        </svg>
      );

    case '🐱': // Clever Cat
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#FEF3C7" />
          {/* Outline */}
          <path d="M2 2h3v2h6V2h3v10h-1v2H3v-2H2V2z" fill="#18181B" />
          {/* Fur */}
          <path d="M3 3h1v2h8V3h1v9H3V3z" fill="#FB923C" />
          {/* Stripes & Cheeks */}
          <path d="M7 4h2v2H7V4z" fill="#EA580C" />
          <path d="M4 10h8v2H4v-2z" fill="#FFEDD5" />
          {/* Eyes & Nose */}
          <rect x="4" y="7" width="2" height="2" fill="#18181B" />
          <rect x="10" y="7" width="2" height="2" fill="#18181B" />
          <rect x="7" y="9" width="2" height="1" fill="#F43F5E" />
        </svg>
      );

    case '🦊': // Swift Fox
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#ECFDF5" />
          {/* Outline */}
          <path d="M2 2h3v2h6V2h3v9h-1v2h-2v1H5v-1H3v-2H2V2z" fill="#18181B" />
          {/* Ears */}
          <path d="M3 3h1v2H3V3zm9 0h1v2h-1V3z" fill="#27272A" />
          {/* Orange Face */}
          <path d="M3 5h10v5H3V5zm3 5h4v3H6v-3z" fill="#EA580C" />
          {/* White Cheeks */}
          <path d="M3 9h3v3H4v-1H3V9zm7 0h3v2h-1v1h-2V9z" fill="#FFFFFF" />
          {/* Eyes & Nose */}
          <rect x="4" y="7" width="2" height="1" fill="#18181B" />
          <rect x="10" y="7" width="2" height="1" fill="#18181B" />
          <rect x="7" y="11" width="2" height="2" fill="#18181B" />
        </svg>
      );

    case '🐉': // Dragon
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#FEF2F2" />
          {/* Outline */}
          <path d="M3 1h3v2h4V1h3v4h1v6h-2v3H4v-3H2V5h1V1z" fill="#18181B" />
          {/* Golden Horns */}
          <path d="M4 2h1v2H4V2zm7 0h1v2h-1V2z" fill="#F59E0B" />
          {/* Green Scales */}
          <path d="M3 5h10v5H3V5zm2 5h6v3H5v-3z" fill="#10B981" />
          {/* Glowing Red Eyes & Snout */}
          <rect x="4" y="6" width="2" height="2" fill="#FEF08A" />
          <rect x="5" y="7" width="1" height="1" fill="#EF4444" />
          <rect x="10" y="6" width="2" height="2" fill="#FEF08A" />
          <rect x="10" y="7" width="1" height="1" fill="#EF4444" />
          <path d="M6 10h1v1H6v-1zm3 0h1v1H9v-1z" fill="#064E3B" />
        </svg>
      );

    case '🎯': // Target
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#F0F9FF" />
          <path d="M5 2h6v1h2v2h1v6h-1v2h-2v1H5v-1H3v-2H2V5h1V3h2V2z" fill="#18181B" />
          <path d="M5 3h6v1h1v1h1v6h-1v1h-1v1H5v-1H4v-1H3V5h1V4h1V3z" fill="#EF4444" />
          <path d="M6 5h4v1h1v4h-1v1H6v-1H5V6h1V5z" fill="#FFFFFF" />
          <rect x="7" y="7" width="2" height="2" fill="#EF4444" />
        </svg>
      );

    case '🚀': // Rocket
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#1E1B4B" />
          {/* Rocket body */}
          <path d="M7 1h2v2h2v5h2v3h-2v1H5v-1H3V8h2V3h2V1z" fill="#18181B" />
          <path d="M7 2h2v2H7V2zM4 9h1v2H4V9zm7 0h1v2h-1V9z" fill="#EF4444" />
          <rect x="6" y="4" width="4" height="7" fill="#F8FAFC" />
          <rect x="7" y="5" width="2" height="2" fill="#38BDF8" />
          {/* Flame */}
          <path d="M6 12h4v2H9v1H7v-1H6v-2z" fill="#F97316" />
          <rect x="7" y="12" width="2" height="2" fill="#FACC15" />
        </svg>
      );

    case '🛡️': // Shield
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#FEF3C7" />
          <path d="M3 2h10v6h-1v3h-2v2H8v1H7v-1H6v-2H4V8H3V2z" fill="#18181B" />
          <path d="M4 3h8v5h-1v2H9v2H7v-2H5V8H4V3z" fill="#2563EB" />
          {/* Golden Cross */}
          <path d="M7 3h2v9H7V3zM4 6h8v2H4V6z" fill="#FACC15" />
        </svg>
      );

    case '💎': // Diamond
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#1E1B4B" />
          <path d="M4 2h8v2h2v3h-1v2h-2v2H9v2H7v-2H5V9H3V7H2V4h2V2z" fill="#18181B" />
          <path d="M4 3h8v2h1v2h-1v2h-2v2H8v1H7v-1H6V9H4V7H3V5h1V3z" fill="#06B6D4" />
          <path d="M5 3h6v2H5V3zM4 5h8v1H4V5z" fill="#A5F3FC" />
          <path d="M6 6h4v2H8v2H7V8H6V6z" fill="#67E8F9" />
        </svg>
      );

    case '👑':
    default: // Crown (Default)
      return (
        <svg viewBox="0 0 16 16" className="h-full w-full pixelated" shapeRendering="crispEdges">
          <rect width="16" height="16" fill="#FEF3C7" />
          {/* Outline */}
          <path d="M1 4h2v2h2V4h2V2h2v2h2v2h2V4h2v9H1V4z" fill="#18181B" />
          {/* Gold Crown Body */}
          <path d="M2 5h1v3h3V5h1V3h2v2h1v3h3V5h1v6H2V5z" fill="#FACC15" />
          <rect x="2" y="11" width="12" height="1" fill="#D97706" />
          {/* Gems */}
          <rect x="4" y="9" width="1" height="1" fill="#EF4444" />
          <rect x="7" y="8" width="2" height="2" fill="#EF4444" />
          <rect x="11" y="9" width="1" height="1" fill="#EF4444" />
        </svg>
      );
  }
}

export function UserAvatar({
  avatar,
  className = 'h-8 w-8 text-base',
  fallback = '👑',
  alt = 'Avatar',
}: UserAvatarProps) {
  const isImage = isCustomImageAvatar(avatar);

  if (isImage && avatar) {
    return (
      <div
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[2px] border-2 border-zinc-900 bg-white shadow-pixel-xs ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt={alt}
          className="h-full w-full object-cover pixelated"
          loading="lazy"
        />
      </div>
    );
  }

  const symbol = avatar || fallback;

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[2px] border-2 border-zinc-900 bg-amber-50 shadow-pixel-xs select-none ${className}`}
      title={alt}
    >
      <PixelAvatarSprite symbol={symbol} />
    </div>
  );
}
