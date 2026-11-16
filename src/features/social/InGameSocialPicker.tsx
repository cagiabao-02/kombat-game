'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { SocialContentType } from './types';
import { EMOTE_PRESETS, QUICK_CHAT_PRESETS } from './socialPresets';
import { sounds } from '@/lib/sound/soundService';
import { MessageSquare, Smile, X } from 'lucide-react';

interface InGameSocialPickerProps {
  onSendMessage: (type: SocialContentType, content: string) => void;
  disabled?: boolean;
}

export function InGameSocialPicker({
  onSendMessage,
  disabled = false,
}: InGameSocialPickerProps) {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'emotes' | 'chat'>('emotes');
  const [cooldown, setCooldown] = useState(0);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Anti-spam countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSend = (type: SocialContentType, content: string) => {
    if (cooldown > 0) return;
    sounds.playClick();
    onSendMessage(type, content);
    setCooldown(2); // 2 second cooldown
    setIsOpen(false);
  };

  return (
    <div className="relative shrink-0" ref={popoverRef}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        className={`pixel-btn h-9 w-9 sm:h-10 sm:w-10 min-h-[36px] min-w-[36px] flex items-center justify-center transition-all outline-none ${
          isOpen
            ? 'bg-amber-300 text-zinc-950 border-2 border-zinc-900 shadow-pixel-xs'
            : 'bg-white text-zinc-800 hover:bg-amber-100 hover:text-zinc-950'
        } ${cooldown > 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
        title={language === 'vi' ? 'Biểu cảm & Thoại nhanh' : 'Emotes & Quick Chat'}
        aria-label="Emotes and Quick Chat"
      >
        <span className="text-base leading-none">💬</span>
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-72 sm:w-80 pixel-box-sm bg-[#FFFDF8] p-3 z-50 animate-in zoom-in-95 duration-150 shadow-pixel-md">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b-2 border-zinc-900">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('emotes')}
                className={`pixel-btn px-2.5 py-1 text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'emotes'
                    ? 'bg-amber-300 text-zinc-950'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <Smile className="h-3.5 w-3.5" />
                <span>{language === 'vi' ? 'Biểu cảm' : 'Emotes'}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('chat')}
                className={`pixel-btn px-2.5 py-1 text-xs font-bold transition-all flex items-center gap-1 ${
                  activeTab === 'chat'
                    ? 'bg-amber-300 text-zinc-950'
                    : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                }`}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                <span>{language === 'vi' ? 'Thoại nhanh' : 'Quick Chat'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 text-zinc-500 hover:text-zinc-900"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Tab 1: Emotes Grid */}
          {activeTab === 'emotes' && (
            <div className="grid grid-cols-4 gap-1.5 py-1">
              {EMOTE_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  disabled={cooldown > 0}
                  onClick={() => handleSend('emote', preset.emoji)}
                  className="flex h-11 w-full items-center justify-center border-2 border-transparent hover:border-zinc-900 hover:bg-amber-100 text-2xl transition-transform active:scale-90"
                  title={language === 'vi' ? preset.labelVi : preset.labelEn}
                >
                  <span className="transform hover:scale-125 transition-transform">
                    {preset.emoji}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Tab 2: Quick Chat List */}
          {activeTab === 'chat' && (
            <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1 py-1">
              {QUICK_CHAT_PRESETS.map((preset) => {
                const text = language === 'vi' ? preset.textVi : preset.textEn;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    disabled={cooldown > 0}
                    onClick={() => handleSend('chat', text)}
                    className="flex items-center gap-2 w-full text-left p-2 border-2 border-zinc-200 hover:border-zinc-900 hover:bg-amber-50 bg-white transition-all text-xs font-pixel font-bold text-zinc-900"
                  >
                    <span className="text-sm shrink-0">{preset.icon}</span>
                    <span className="truncate">{text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Cooldown notice if active */}
          {cooldown > 0 && (
            <div className="mt-2 text-center text-[10px] font-mono text-zinc-500 font-bold">
              {language === 'vi' ? `Chờ ${cooldown}s để gửi tiếp...` : `Wait ${cooldown}s...`}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
