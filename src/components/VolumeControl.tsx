'use client';

import React, { useState, useEffect, useRef } from 'react';
import { sounds, BgmTheme } from '@/lib/sound/soundService';
import { useLanguage } from '@/i18n/LanguageContext';
import {
  PixelVolumeOn,
  PixelVolumeOff,
  PixelMusic,
  PixelMusicOff,
} from '@/components/PixelIcons';

const THEME_NAMES: Record<BgmTheme, { vi: string; en: string }> = {
  lobby: { vi: 'Sảnh chờ (Chill)', en: 'Lobby Lounge' },
  arcade: { vi: 'Arcade (Sôi động)', en: 'Pixel Rush' },
  strategy: { vi: 'Chiến thuật (Zen)', en: 'Zen Focus' },
  none: { vi: 'Tạm dừng', en: 'Paused' },
};

/**
 * Volume Popover dành cho Desktop Header với 2 kênh độc lập: Hiệu ứng (SFX) & Nhạc nền (BGM)
 */
export function VolumePopover() {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [sfxVolume, setSfxVolume] = useState(sounds.getSfxVolume());
  const [isSfxMuted, setIsSfxMuted] = useState(sounds.isSfxMuted());
  const [bgmVolume, setBgmVolume] = useState(sounds.getBgmVolume());
  const [isBgmMuted, setIsBgmMuted] = useState(sounds.isBgmMuted());
  const [currentTheme, setCurrentTheme] = useState<BgmTheme>(sounds.getCurrentBgm());
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSfxVolume(sounds.getSfxVolume());
    setIsSfxMuted(sounds.isSfxMuted());
    setBgmVolume(sounds.getBgmVolume());
    setIsBgmMuted(sounds.isBgmMuted());
    setCurrentTheme(sounds.getCurrentBgm());

    const handleVolumeChange = (e: Event) => {
      const custom = e as CustomEvent<{
        sfxVolume: number;
        sfxMuted: boolean;
        bgmVolume: number;
        bgmMuted: boolean;
        theme: BgmTheme;
      }>;
      if (custom.detail) {
        setSfxVolume(custom.detail.sfxVolume);
        setIsSfxMuted(custom.detail.sfxMuted);
        setBgmVolume(custom.detail.bgmVolume);
        setIsBgmMuted(custom.detail.bgmMuted);
        if (custom.detail.theme) {
          setCurrentTheme(custom.detail.theme);
        }
      }
    };

    window.addEventListener('kombat:volume_change', handleVolumeChange);
    return () => {
      window.removeEventListener('kombat:volume_change', handleVolumeChange);
    };
  }, []);

  // Đóng popover khi click ra ngoài
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

  const handleToggleSfxMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.toggleSfxMute();
  };

  const handleToggleBgmMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    sounds.toggleBgmMute();
  };

  const handleSfxSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100;
    sounds.setSfxVolume(val);
  };

  const handleBgmSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value) / 100;
    sounds.setBgmVolume(val);
  };

  const sfxPercent = isSfxMuted ? 0 : Math.round(sfxVolume * 100);
  const bgmPercent = isBgmMuted ? 0 : Math.round(bgmVolume * 100);
  const allMuted = isSfxMuted && isBgmMuted;

  return (
    <div className="relative inline-block" ref={popoverRef}>
      {/* Trigger Button on Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`pixel-btn flex h-10 min-h-[40px] items-center gap-1.5 px-2.5 text-xs outline-none transition-colors ${
          allMuted
            ? 'bg-zinc-100 text-zinc-400 border-zinc-400'
            : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900 border-zinc-900'
        }`}
        title={
          language === 'vi'
            ? `Âm thanh: SFX ${sfxPercent}% | BGM ${bgmPercent}% (Bấm để chỉnh)`
            : `Audio: SFX ${sfxPercent}% | BGM ${bgmPercent}% (Click to adjust)`
        }
        aria-label="Sound Settings"
      >
        {allMuted ? (
          <PixelVolumeOff className="h-4 w-4 text-zinc-500" />
        ) : (
          <div className="flex items-center gap-1">
            <PixelVolumeOn className="h-4 w-4 text-emerald-800" />
            {!isBgmMuted && bgmPercent > 0 && (
              <PixelMusic className="h-3.5 w-3.5 text-indigo-700 animate-pulse" />
            )}
          </div>
        )}
        <span className="font-pixel text-[11px] font-bold">
          {allMuted ? 'OFF' : `${sfxPercent}%`}
        </span>
      </button>

      {/* Retro Popover Box */}
      {isOpen && (
        <div className="pixel-box absolute right-0 top-12 z-50 w-80 bg-[#FFFDF8] p-3.5 border-2 border-zinc-900 shadow-pixel-lg animate-in fade-in zoom-in-95 duration-100">
          {/* Header Title */}
          <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 mb-3">
            <span className="font-pixel text-xs font-bold text-zinc-900 uppercase tracking-wide">
              {language === 'vi' ? 'ĐIỀU CHỈNH ÂM THANH' : 'AUDIO SETTINGS'}
            </span>
            <span className="font-pixel text-[10px] text-zinc-600 bg-zinc-200 px-2 py-0.5 border border-zinc-800">
              8-BIT CHIPTUNE
            </span>
          </div>

          <div className="space-y-3.5">
            {/* CHANNEL 1: SFX (Hiệu ứng) */}
            <div className="border border-zinc-800 bg-white p-2.5 shadow-pixel-xs">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleSfxMute}
                    className={`p-1 border border-zinc-900 shadow-pixel-xs transition-transform active:scale-95 ${
                      isSfxMuted ? 'bg-zinc-200 text-zinc-500' : 'bg-emerald-300 text-emerald-950'
                    }`}
                    title={isSfxMuted ? 'Bật hiệu ứng' : 'Tắt hiệu ứng'}
                  >
                    {isSfxMuted ? (
                      <PixelVolumeOff className="h-3.5 w-3.5" />
                    ) : (
                      <PixelVolumeOn className="h-3.5 w-3.5" />
                    )}
                  </button>
                  <span className="font-pixel text-xs font-bold text-zinc-900">
                    {language === 'vi' ? 'HIỆU ỨNG (SFX)' : 'EFFECTS (SFX)'}
                  </span>
                </div>

                <span
                  className={`font-pixel text-[11px] font-bold px-1.5 py-0.5 border border-zinc-900 ${
                    isSfxMuted ? 'bg-zinc-200 text-zinc-500' : 'bg-emerald-200 text-emerald-950'
                  }`}
                >
                  {isSfxMuted ? (language === 'vi' ? 'TẮT' : 'MUTE') : `${sfxPercent}%`}
                </span>
              </div>

              {/* Slider SFX */}
              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={isSfxMuted ? 0 : sfxPercent}
                  onChange={handleSfxSliderChange}
                  onMouseUp={() => sounds.playVolumePreview()}
                  onTouchEnd={() => sounds.playVolumePreview()}
                  className="pixel-range w-full"
                  aria-label="SFX volume"
                />
              </div>

              {/* Quick Presets SFX */}
              <div className="grid grid-cols-4 gap-1 font-pixel text-[10px] font-bold">
                {[0, 0.3, 0.7, 1.0].map((val) => {
                  const p = Math.round(val * 100);
                  const isSel = !isSfxMuted && sfxPercent === p;
                  return (
                    <button
                      key={`sfx-${val}`}
                      type="button"
                      onClick={() => {
                        sounds.setSfxVolume(val);
                        sounds.playVolumePreview();
                      }}
                      className={`py-0.5 border border-zinc-900 transition-colors ${
                        isSel
                          ? 'bg-zinc-900 text-amber-300'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {p === 0 ? (language === 'vi' ? 'TẮT' : '0%') : `${p}%`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* CHANNEL 2: BGM (Nhạc nền) */}
            <div className="border border-zinc-800 bg-white p-2.5 shadow-pixel-xs">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleToggleBgmMute}
                    className={`p-1 border border-zinc-900 shadow-pixel-xs transition-transform active:scale-95 ${
                      isBgmMuted ? 'bg-zinc-200 text-zinc-500' : 'bg-indigo-300 text-indigo-950'
                    }`}
                    title={isBgmMuted ? 'Bật nhạc nền' : 'Tắt nhạc nền'}
                  >
                    {isBgmMuted ? (
                      <PixelMusicOff className="h-3.5 w-3.5" />
                    ) : (
                      <PixelMusic className="h-3.5 w-3.5 text-indigo-950" />
                    )}
                  </button>
                  <span className="font-pixel text-xs font-bold text-zinc-900">
                    {language === 'vi' ? 'NHẠC NỀN (BGM)' : 'MUSIC (BGM)'}
                  </span>
                </div>

                <span
                  className={`font-pixel text-[11px] font-bold px-1.5 py-0.5 border border-zinc-900 ${
                    isBgmMuted ? 'bg-zinc-200 text-zinc-500' : 'bg-indigo-200 text-indigo-950'
                  }`}
                >
                  {isBgmMuted ? (language === 'vi' ? 'TẮT' : 'MUTE') : `${bgmPercent}%`}
                </span>
              </div>

              {/* Track Name Badge */}
              <div className="flex items-center gap-1.5 mb-2 text-[10px] font-mono text-zinc-600 bg-zinc-50 px-2 py-0.5 border border-zinc-300">
                <span className="text-indigo-600 font-bold">♫</span>
                <span>
                  {language === 'vi' ? 'Giai điệu: ' : 'Track: '}
                  <b className="text-zinc-900">
                    {THEME_NAMES[currentTheme]?.[language === 'vi' ? 'vi' : 'en'] || currentTheme}
                  </b>
                </span>
              </div>

              {/* Slider BGM */}
              <div className="mb-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={isBgmMuted ? 0 : bgmPercent}
                  onChange={handleBgmSliderChange}
                  onMouseUp={() => sounds.playBgmVolumePreview()}
                  onTouchEnd={() => sounds.playBgmVolumePreview()}
                  className="pixel-range w-full"
                  aria-label="BGM volume"
                />
              </div>

              {/* Quick Presets BGM */}
              <div className="grid grid-cols-4 gap-1 font-pixel text-[10px] font-bold">
                {[0, 0.25, 0.5, 0.8].map((val) => {
                  const p = Math.round(val * 100);
                  const isSel = !isBgmMuted && bgmPercent === p;
                  return (
                    <button
                      key={`bgm-${val}`}
                      type="button"
                      onClick={() => {
                        sounds.setBgmVolume(val);
                        sounds.playBgmVolumePreview();
                      }}
                      className={`py-0.5 border border-zinc-900 transition-colors ${
                        isSel
                          ? 'bg-zinc-900 text-amber-300'
                          : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-700'
                      }`}
                    >
                      {p === 0 ? (language === 'vi' ? 'TẮT' : '0%') : `${p}%`}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Volume Controls hiển thị trực tiếp trong Mobile Hamburger Menu
 */
export function VolumeSliderInline() {
  const { language } = useLanguage();
  const [sfxVolume, setSfxVolume] = useState(sounds.getSfxVolume());
  const [isSfxMuted, setIsSfxMuted] = useState(sounds.isSfxMuted());
  const [bgmVolume, setBgmVolume] = useState(sounds.getBgmVolume());
  const [isBgmMuted, setIsBgmMuted] = useState(sounds.isBgmMuted());
  const [currentTheme, setCurrentTheme] = useState<BgmTheme>(sounds.getCurrentBgm());

  useEffect(() => {
    setSfxVolume(sounds.getSfxVolume());
    setIsSfxMuted(sounds.isSfxMuted());
    setBgmVolume(sounds.getBgmVolume());
    setIsBgmMuted(sounds.isBgmMuted());
    setCurrentTheme(sounds.getCurrentBgm());

    const handleVolumeChange = (e: Event) => {
      const custom = e as CustomEvent<{
        sfxVolume: number;
        sfxMuted: boolean;
        bgmVolume: number;
        bgmMuted: boolean;
        theme: BgmTheme;
      }>;
      if (custom.detail) {
        setSfxVolume(custom.detail.sfxVolume);
        setIsSfxMuted(custom.detail.sfxMuted);
        setBgmVolume(custom.detail.bgmVolume);
        setIsBgmMuted(custom.detail.bgmMuted);
        if (custom.detail.theme) {
          setCurrentTheme(custom.detail.theme);
        }
      }
    };

    window.addEventListener('kombat:volume_change', handleVolumeChange);
    return () => {
      window.removeEventListener('kombat:volume_change', handleVolumeChange);
    };
  }, []);

  const sfxPercent = isSfxMuted ? 0 : Math.round(sfxVolume * 100);
  const bgmPercent = isBgmMuted ? 0 : Math.round(bgmVolume * 100);

  return (
    <div className="pixel-box w-full bg-white p-3 border-2 border-zinc-900 space-y-3">
      {/* Title */}
      <div className="flex items-center justify-between border-b border-zinc-300 pb-1.5">
        <p className="font-pixel text-xs font-bold text-zinc-900 uppercase">
          {language === 'vi' ? 'ÂM THANH & NHẠC NỀN' : 'AUDIO & MUSIC'}
        </p>
        <span className="text-[10px] font-mono text-zinc-500">
          ♫ {THEME_NAMES[currentTheme]?.[language === 'vi' ? 'vi' : 'en'] || currentTheme}
        </span>
      </div>

      {/* SFX Channel */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => sounds.toggleSfxMute()}
              className={`p-1.5 border border-zinc-900 transition-transform active:scale-95 ${
                isSfxMuted ? 'bg-zinc-200 text-zinc-500' : 'bg-emerald-300 text-emerald-950'
              }`}
            >
              {isSfxMuted ? (
                <PixelVolumeOff className="h-4 w-4" />
              ) : (
                <PixelVolumeOn className="h-4 w-4" />
              )}
            </button>
            <span className="font-pixel text-xs font-bold text-zinc-900">
              {language === 'vi' ? 'HIỆU ỨNG (SFX)' : 'EFFECTS (SFX)'}
            </span>
          </div>
          <span className="font-pixel text-xs font-bold px-1.5 py-0.5 border border-zinc-800 bg-zinc-100">
            {isSfxMuted ? (language === 'vi' ? 'TẮT' : 'OFF') : `${sfxPercent}%`}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={isSfxMuted ? 0 : sfxPercent}
          onChange={(e) => sounds.setSfxVolume(parseFloat(e.target.value) / 100)}
          onMouseUp={() => sounds.playVolumePreview()}
          onTouchEnd={() => sounds.playVolumePreview()}
          className="pixel-range w-full"
          aria-label="SFX volume slider"
        />
      </div>

      {/* BGM Channel */}
      <div>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => sounds.toggleBgmMute()}
              className={`p-1.5 border border-zinc-900 transition-transform active:scale-95 ${
                isBgmMuted ? 'bg-zinc-200 text-zinc-500' : 'bg-indigo-300 text-indigo-950'
              }`}
            >
              {isBgmMuted ? (
                <PixelMusicOff className="h-4 w-4" />
              ) : (
                <PixelMusic className="h-4 w-4 text-indigo-950" />
              )}
            </button>
            <span className="font-pixel text-xs font-bold text-zinc-900">
              {language === 'vi' ? 'NHẠC NỀN (BGM)' : 'MUSIC (BGM)'}
            </span>
          </div>
          <span className="font-pixel text-xs font-bold px-1.5 py-0.5 border border-zinc-800 bg-zinc-100">
            {isBgmMuted ? (language === 'vi' ? 'TẮT' : 'OFF') : `${bgmPercent}%`}
          </span>
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={isBgmMuted ? 0 : bgmPercent}
          onChange={(e) => sounds.setBgmVolume(parseFloat(e.target.value) / 100)}
          onMouseUp={() => sounds.playBgmVolumePreview()}
          onTouchEnd={() => sounds.playBgmVolumePreview()}
          className="pixel-range w-full"
          aria-label="BGM volume slider"
        />
      </div>
    </div>
  );
}
