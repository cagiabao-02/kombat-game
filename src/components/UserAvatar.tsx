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
        className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xs ${className}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatar}
          alt={alt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-2xs select-none ${className}`}
    >
      <span className="leading-none">{avatar || fallback}</span>
    </div>
  );
}

