'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Menu, X } from 'lucide-react';
import { UserAvatar } from '@/components/UserAvatar';
import {
  PixelTrophy,
  PixelGlobe,
  PixelShieldCheck,
} from '@/components/PixelIcons';
import { VolumePopover, VolumeSliderInline } from '@/components/VolumeControl';

const ProfileAuthModal = dynamic(
  () => import('@/features/auth/ProfileAuthModal').then((mod) => mod.ProfileAuthModal),
  { ssr: false }
);

const LeaderboardModal = dynamic(
  () => import('@/features/leaderboard/LeaderboardModal').then((mod) => mod.LeaderboardModal),
  { ssr: false }
);

export function Header() {
  const { language, setLanguage } = useLanguage();
  const { guestName, avatar, isAnonymous } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const openProfile = () => {
    setIsProfileOpen(true);
  };

  const openLeaderboard = () => {
    setIsLeaderboardOpen(true);
  };

  return (
    <>
      <header suppressHydrationWarning className="sticky top-0 z-40 w-full border-b-[3px] border-zinc-900 bg-[#FFFDF8]">
        <div suppressHydrationWarning className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center bg-indigo-600 font-pixel text-base font-bold text-amber-300 border-2 border-zinc-900 shadow-pixel-sm transition-transform group-hover:-translate-y-0.5">
              KB
            </div>
            <span className="font-pixel text-xl font-bold tracking-wider text-zinc-900">
              KOMBAT
            </span>
          </Link>

          <div suppressHydrationWarning className="flex items-center gap-2 sm:gap-2.5 relative z-10 pointer-events-auto">
            {/* User Profile Coin Token Pill (Always visible) */}
            <button
              type="button"
              onClick={openProfile}
              className="pixel-btn flex items-center gap-2 min-h-[40px] bg-amber-100 hover:bg-amber-200 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-zinc-900 outline-none"
              title={
                language === 'vi'
                  ? 'Hồ sơ, Avatar & Tài khoản / Profile & Account'
                  : 'Profile, Avatar & Account'
              }
            >
              <UserAvatar
                avatar={avatar}
                className="h-5 w-5 text-xs border border-zinc-900 shadow-none bg-white"
              />
              <span className="max-w-[80px] sm:max-w-[130px] truncate font-pixel text-xs font-bold tracking-wide">
                {guestName}
              </span>
              {!isAnonymous && (
                <PixelShieldCheck className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
              )}
            </button>

            {/* Desktop Buttons Row (Hidden on mobile < sm) */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Leaderboard Button */}
              <button
                type="button"
                onClick={openLeaderboard}
                className="pixel-btn flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center bg-amber-400 hover:bg-amber-300 text-zinc-900 outline-none"
                title={language === 'vi' ? 'Bảng xếp hạng / Leaderboard' : 'Leaderboard'}
                aria-label="Leaderboard"
              >
                <PixelTrophy className="h-4 w-4" />
              </button>

              {/* Sound & Volume Control Popover */}
              <VolumePopover />

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="pixel-btn flex h-10 min-h-[40px] items-center gap-1.5 bg-white hover:bg-indigo-50 px-3 text-xs font-bold text-zinc-900 outline-none"
                title="Chuyển đổi ngôn ngữ / Switch language"
                aria-label="Switch Language"
              >
                <PixelGlobe className="h-4 w-4 text-indigo-600" />
                <span className="font-pixel">{language.toUpperCase()}</span>
              </button>
            </div>

            {/* Mobile Hamburger Menu Button (Visible on mobile only < sm) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="pixel-btn flex sm:hidden h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center bg-white text-zinc-900 outline-none"
              title="Menu"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-zinc-900" />
              ) : (
                <Menu className="h-5 w-5 text-zinc-900" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Dropdown Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/50 animate-in fade-in duration-150"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Dropdown Sheet */}
          <div className="absolute top-18 right-4 left-4 pixel-box-lg bg-[#FFFDF8] p-4 animate-in slide-in-from-top-3 duration-150">
            {/* Header info in menu */}
            <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <UserAvatar avatar={avatar} className="h-10 w-10 text-base" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-pixel text-sm font-bold text-zinc-900">{guestName}</span>
                    {!isAnonymous && <PixelShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                  <span className="text-[11px] text-zinc-500 font-mono">
                    {isAnonymous
                      ? (language === 'vi' ? 'PLAYER: KHÁCH TẠM THỜI' : 'PLAYER: GUEST MODE')
                      : (language === 'vi' ? 'PLAYER: ĐÃ LIÊN KẾT' : 'PLAYER: LINKED')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openProfile();
                }}
                className="pixel-btn bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white"
              >
                {language === 'vi' ? 'HỒ SƠ' : 'PROFILE'}
              </button>
            </div>

            {/* Menu List Items */}
            <div className="space-y-2.5">
              {/* Leaderboard Item */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openLeaderboard();
                }}
                className="pixel-btn flex w-full items-center justify-between bg-amber-50 hover:bg-amber-100 p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-amber-400 text-zinc-900 border-2 border-zinc-900">
                    <PixelTrophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-pixel text-sm font-bold text-zinc-900">
                      {language === 'vi' ? 'BẢNG XẾP HẠNG' : 'HIGH SCORES'}
                    </p>
                    <p className="text-xs font-mono text-zinc-600">
                      {language === 'vi' ? 'Top cao thủ 4 bộ môn' : 'Hall of Fame & Rankings'}
                    </p>
                  </div>
                </div>
                <span className="pixel-badge bg-amber-300 px-2.5 py-1 text-xs font-bold text-zinc-900">
                  TOP
                </span>
              </button>

              {/* Interactive Volume Slider Item */}
              <VolumeSliderInline />

              {/* Language Switcher Item */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="pixel-btn flex w-full items-center justify-between bg-white hover:bg-zinc-50 p-3 text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center bg-sky-100 text-sky-800 border-2 border-zinc-900">
                    <PixelGlobe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-pixel text-sm font-bold text-zinc-900">
                      {language === 'vi' ? 'NGÔN NGỮ / LANG' : 'INTERFACE LANG'}
                    </p>
                    <p className="text-xs font-mono text-zinc-600">
                      {language === 'vi' ? 'Tiếng Việt (VI)' : 'English (EN)'}
                    </p>
                  </div>
                </div>
                <span className="pixel-badge bg-sky-200 px-2.5 py-1 text-xs font-bold text-zinc-900">
                  {language === 'vi' ? 'VI' : 'EN'}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile & Auth Modal */}
      {isProfileOpen && (
        <ProfileAuthModal
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}

      {/* Leaderboard Modal */}
      {isLeaderboardOpen && (
        <LeaderboardModal
          isOpen={isLeaderboardOpen}
          onClose={() => setIsLeaderboardOpen(false)}
        />
      )}
    </>
  );
}
