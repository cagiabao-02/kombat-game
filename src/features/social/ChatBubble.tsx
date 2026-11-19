'use client';

import React from 'react';
import { ActiveSocialMessage } from './types';
import { PixelEmoteIcon } from './PixelEmoteIcon';

interface ChatBubbleProps {
  message: ActiveSocialMessage;
  align?: 'left' | 'right';
  placement?: 'top' | 'bottom';
}

export function ChatBubble({
  message,
  align = 'left',
  placement = 'top',
}: ChatBubbleProps) {
  const isEmote = message.type === 'emote';
  const isTop = placement === 'top';

  return (
    <div
      className={`relative inline-flex items-center px-3 py-1.5 bg-white border-2 border-zinc-950 shadow-pixel-xs animate-in zoom-in-75 fade-in duration-200 select-none z-40 ${
        isTop
          ? align === 'right'
            ? 'rounded-tl-md'
            : 'rounded-tr-md'
          : align === 'right'
          ? 'rounded-bl-md'
          : 'rounded-br-md'
      }`}
    >
      {/* Speech bubble tail pointer */}
      {isTop ? (
        <>
          {/* Outer border tail pointing DOWN */}
          <span
            aria-hidden="true"
            className={`absolute -bottom-2 w-0 h-0 border-x-4 border-x-transparent border-t-[8px] border-t-zinc-950 ${
              align === 'right' ? 'right-4' : 'left-4'
            }`}
          />
          {/* Inner fill tail pointing DOWN */}
          <span
            aria-hidden="true"
            className={`absolute -bottom-1.5 w-0 h-0 border-x-[3px] border-x-transparent border-t-[6px] border-t-white z-10 ${
              align === 'right' ? 'right-[17px]' : 'left-[17px]'
            }`}
          />
        </>
      ) : (
        <>
          {/* Outer border tail pointing UP */}
          <span
            aria-hidden="true"
            className={`absolute -top-2 w-0 h-0 border-x-4 border-x-transparent border-b-[8px] border-b-zinc-950 ${
              align === 'right' ? 'right-4' : 'left-4'
            }`}
          />
          {/* Inner fill tail pointing UP */}
          <span
            aria-hidden="true"
            className={`absolute -top-1.5 w-0 h-0 border-x-[3px] border-x-transparent border-b-[6px] border-b-white z-10 ${
              align === 'right' ? 'right-[17px]' : 'left-[17px]'
            }`}
          />
        </>
      )}

      {isEmote ? (
        <span className="inline-flex items-center justify-center animate-bounce filter drop-shadow-sm">
          <PixelEmoteIcon emoji={message.content} className="w-8 h-8 sm:w-9 sm:h-9" />
        </span>
      ) : (
        <span className="font-pixel text-xs sm:text-sm font-bold text-zinc-950 leading-tight max-w-[200px] sm:max-w-[240px] break-words">
          {message.content}
        </span>
      )}
    </div>
  );
}
