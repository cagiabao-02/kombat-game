'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sounds } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import { PixelVolumeOn, PixelVolumeOff } from '@/components/PixelIcons';

/**
 * Volume Popover dành cho Desktop Header
 */
export function VolumePopover() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [volume, setVolume] = useState(sounds.getVolume());
  const [isMuted, setIsMuted] = useState(sounds.isMuted());
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setVolume(sounds.getVolume());
    setIsMuted(sounds.isMuted());

    const handleVolumeChange = (e: Event) => {
      const custom = e as CustomEvent<{ volume: number; muted: boolean }>;
      if (custom.detail) {
        setVolume(custom.detail.volume);
        setIsMuted(custom.detail.muted);
      }
    };

    window.addEventListener('kombat:volume_change', handleVolumeChange);
    return () => {
      window.removeEventListener('kombat:volume_change', handleVolumeChange);
    };
  }, []);

  // Đóng popover khi bấm ra ngoài
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.toggleMute();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100;
    sounds.setVolume(val);
  };

  const handleSliderCommit = () => {
    sounds.playVolumePreview();
  };

  const handlePreset = (val: number) => {
    sounds.setVolume(val);
    sounds.playVolumePreview();
  };

  const percent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button on Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`pixel-btn flex h-10 min-h-[40px] items-center gap-1.5 px-2.5 text-xs outline-none transition-colors ${
          isMuted
            ? 'bg-zinc-100 text-zinc-400 border-zinc-400'
            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-zinc-900'
        }`}
        title={
          language === 'vi'
            ? `Âm lượng: ${isMuted ? 'Tắt' : `${percent}%`} (Bấm để chỉnh)`
            : `Volume: ${isMuted ? 'Muted' : `${percent}%`} (Click to adjust)`
        }
        aria-label="Sound Settings"
      >
        {isMuted ? (
          <PixelVolumeOff className="h-4 w-4 text-zinc-500" />
        ) : (
          <PixelVolumeOn className="h-4 w-4 text-emerald-800" />
        )}
        <span className="font-pixel text-[11px] font-bold">
          {isMuted ? 'OFF' : `${percent}%`}
        </span>
      </button>

      {/* Retro Popover Box */}
      {isOpen && (
        <div className="pixel-box absolute right-0 top-12 z-50 w-64 bg-[#FFFDF8] p-3.5 border-2 border-zinc-900 shadow-pixel-lg animate-in fade-in zoom-in-95 duration-100">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 mb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleToggleMute}
                className={`p-1.5 border-2 border-zinc-900 shadow-pixel-xs transition-transform active:scale-95 ${
                  isMuted ? 'bg-zinc-200 text-zinc-600' : 'bg-amber-300 text-zinc-950'
                }`}
                title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
              >
                {isMuted ? (
                  <PixelVolumeOff className="h-4 w-4" />
                ) : (
                  <PixelVolumeOn className="h-4 w-4" />
                )}
              </button>
              <span className="font-pixel text-xs font-bold text-zinc-900 uppercase">
                {language === 'vi' ? 'ÂM LƯỢNG' : 'VOLUME'}
              </span>
            </div>

            <span
              className={`font-pixel text-xs font-bold px-2 py-0.5 border border-zinc-900 ${
                isMuted
                  ? 'bg-zinc-200 text-zinc-500'
                  : 'bg-emerald-300 text-emerald-950'
              }`}
            >
              {isMuted ? (language === 'vi' ? 'TẮT' : 'MUTE') : `${percent}%`}
            </span>
          </div>

          {/* Slider Row */}
          <div className="mb-3 space-y-1">
            <div className="relative flex items-center">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={isMuted ? 0 : percent}
                onChange={handleSliderChange}
                onMouseUp={handleSliderCommit}
                onTouchEnd={handleSliderCommit}
                className="pixel-range"
                aria-label="Điều chỉnh âm lượng"
              />
            </div>
          </div>

          {/* Quick Presets Buttons */}
          <div className="grid grid-cols-4 gap-1.5 font-pixel text-[10px] font-bold">
            <button
              type="button"
              onClick={() => handlePreset(0)}
              className={`py-1 border border-zinc-900 transition-colors ${
                isMuted || percent === 0
                  ? 'bg-zinc-900 text-amber-300'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              {language === 'vi' ? 'TẮT' : '0%'}
            </button>
            <button
              type="button"
              onClick={() => handlePreset(0.3)}
              className={`py-1 border border-zinc-900 transition-colors ${
                !isMuted && percent === 30
                  ? 'bg-zinc-900 text-amber-300'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              30%
            </button>
            <button
              type="button"
              onClick={() => handlePreset(0.7)}
              className={`py-1 border border-zinc-900 transition-colors ${
                !isMuted && percent === 70
                  ? 'bg-zinc-900 text-amber-300'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              70%
            </button>
            <button
              type="button"
              onClick={() => handlePreset(1.0)}
              className={`py-1 border border-zinc-900 transition-colors ${
                !isMuted && percent === 100
                  ? 'bg-zinc-900 text-amber-300'
                  : 'bg-white hover:bg-zinc-100 text-zinc-700'
              }`}
            >
              100%
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Volume Slider hiển thị trực tiếp trong Mobile Hamburger Menu
 */
export function VolumeSliderInline() {
  const { language } = useLanguage();
  const [volume, setVolume] = useState(sounds.getVolume());
  const [isMuted, setIsMuted] = useState(sounds.isMuted());

  useEffect(() => {
    setVolume(sounds.getVolume());
    setIsMuted(sounds.isMuted());

    const handleVolumeChange = (e: Event) => {
      const custom = e as CustomEvent<{ volume: number; muted: boolean }>;
      if (custom.detail) {
        setVolume(custom.detail.volume);
        setIsMuted(custom.detail.muted);
      }
    };

    window.addEventListener('kombat:volume_change', handleVolumeChange);
    return () => {
      window.removeEventListener('kombat:volume_change', handleVolumeChange);
    };
  }, []);

  const handleToggleMute = () => {
    sounds.toggleMute();
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100;
    sounds.setVolume(val);
  };

  const handleSliderCommit = () => {
    sounds.playVolumePreview();
  };

  const handlePreset = (val: number) => {
    sounds.setVolume(val);
    sounds.playVolumePreview();
  };

  const percent = isMuted ? 0 : Math.round(volume * 100);

  return (
    <div className="pixel-box w-full bg-white p-3 border-2 border-zinc-900">
      {/* Top row */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleMute}
            className={`flex h-10 w-10 items-center justify-center border-2 border-zinc-900 shadow-pixel-xs transition-transform active:scale-95 ${
              isMuted ? 'bg-zinc-200 text-zinc-600' : 'bg-indigo-100 text-indigo-700'
            }`}
            title={isMuted ? 'Bật âm thanh' : 'Tắt âm thanh'}
          >
            {isMuted ? (
              <PixelVolumeOff className="h-5 w-5 text-zinc-500" />
            ) : (
              <PixelVolumeOn className="h-5 w-5 text-indigo-700" />
            )}
          </button>
          <div>
            <p className="font-pixel text-sm font-bold text-zinc-900">
              {language === 'vi' ? 'ÂM LƯỢNG 8-BIT' : '8-BIT AUDIO'}
            </p>
            <p className="text-xs font-mono text-zinc-600">
              {isMuted
                ? language === 'vi'
                  ? 'Đang tắt âm thanh'
                  : 'Sound muted'
                : language === 'vi'
                ? `Mức âm lượng: ${percent}%`
                : `Volume level: ${percent}%`}
            </p>
          </div>
        </div>

        <span
          className={`pixel-badge px-2.5 py-1 text-xs font-bold ${
            isMuted
              ? 'bg-zinc-200 text-zinc-600'
              : 'bg-emerald-300 text-zinc-900'
          }`}
        >
          {isMuted ? (language === 'vi' ? 'TẮT' : 'OFF') : `${percent}%`}
        </span>
      </div>

      {/* Slider */}
      <div className="mb-2 px-1">
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={isMuted ? 0 : percent}
          onChange={handleSliderChange}
          onMouseUp={handleSliderCommit}
          onTouchEnd={handleSliderCommit}
          className="pixel-range w-full"
          aria-label="Thanh trượt âm lượng"
        />
      </div>

      {/* Presets */}
      <div className="grid grid-cols-4 gap-1.5 font-pixel text-xs font-bold mt-2">
        <button
          type="button"
          onClick={() => handlePreset(0)}
          className={`py-1 border border-zinc-900 ${
            isMuted || percent === 0
              ? 'bg-zinc-900 text-amber-300'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
          }`}
        >
          {language === 'vi' ? 'TẮT' : '0%'}
        </button>
        <button
          type="button"
          onClick={() => handlePreset(0.3)}
          className={`py-1 border border-zinc-900 ${
            !isMuted && percent === 30
              ? 'bg-zinc-900 text-amber-300'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
          }`}
        >
          30%
        </button>
        <button
          type="button"
          onClick={() => handlePreset(0.7)}
          className={`py-1 border border-zinc-900 ${
            !isMuted && percent === 70
              ? 'bg-zinc-900 text-amber-300'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
          }`}
        >
          70%
        </button>
        <button
          type="button"
          onClick={() => handlePreset(1.0)}
          className={`py-1 border border-zinc-900 ${
            !isMuted && percent === 100
              ? 'bg-zinc-900 text-amber-300'
              : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
          }`}
        >
          100%
        </button>
      </div>
    </div>
  );
}
