'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Globe, Volume2, VolumeX, ShieldCheck, Trophy, Menu, X } from 'lucide-react';
import { sounds } from '@/lib/sound/soundService';
import { UserAvatar } from '@/components/UserAvatar';

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
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sounds.isMuted());
  }, []);

  const toggleSound = () => {
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

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
      <header suppressHydrationWarning className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
        <div suppressHydrationWarning className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-sm transition-transform group-hover:scale-105">
              KB
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-gray-900">KOMBAT</span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium text-gray-400">
                Indie Lobby
              </span>
            </div>
          </Link>

          <div suppressHydrationWarning className="flex items-center gap-2 sm:gap-3 relative z-10 pointer-events-auto">
            {/* User Profile Pill & Modal Trigger (Always visible) */}
            <button
              type="button"
              onClick={openProfile}
              className="flex items-center gap-1.5 min-h-[40px] rounded-full bg-gray-100 hover:bg-gray-200/90 px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-gray-800 transition-all border border-gray-200/80 shadow-2xs hover:scale-102 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
              title={
                language === 'vi'
                  ? 'Hồ sơ, Avatar & Tài khoản / Profile & Account'
                  : 'Profile, Avatar & Account'
              }
            >
              <UserAvatar
                avatar={avatar}
                className="h-5 w-5 text-xs rounded-full border-0 shadow-none bg-transparent"
              />
              <span className="max-w-[75px] sm:max-w-[130px] truncate font-semibold">
                {guestName}
              </span>
              {!isAnonymous && (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              )}
            </button>

            {/* Desktop Buttons Row (Hidden on mobile < sm) */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-3">
              {/* Leaderboard Button */}
              <button
                type="button"
                onClick={openLeaderboard}
                className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-amber-200/90 bg-amber-50 text-amber-600 shadow-2xs transition-all hover:bg-amber-100 hover:border-amber-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 outline-none"
                title={language === 'vi' ? 'Bảng xếp hạng / Leaderboard' : 'Leaderboard'}
                aria-label="Leaderboard"
              >
                <Trophy className="h-4 w-4 fill-current" />
              </button>

              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleSound}
                className="flex h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-gray-200 bg-white text-xs text-gray-700 shadow-2xs transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
                title={isMuted ? 'Bật âm thanh / Unmute' : 'Tắt âm thanh / Mute'}
                aria-label="Toggle Sound"
              >
                {isMuted ? (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                ) : (
                  <Volume2 className="h-4 w-4 text-indigo-600" />
                )}
              </button>

              {/* Language Switcher */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex h-10 min-h-[40px] items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 text-xs font-bold text-gray-700 shadow-2xs transition-all hover:bg-gray-50 hover:border-gray-300 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
                title="Chuyển đổi ngôn ngữ / Switch language"
                aria-label="Switch Language"
              >
                <Globe className="h-4 w-4 text-indigo-600" />
                <span>{language.toUpperCase()}</span>
              </button>
            </div>

            {/* Mobile Hamburger Menu Button (Visible on mobile only < sm) */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex sm:hidden h-10 w-10 min-h-[40px] min-w-[40px] items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 transition-all outline-none"
              title="Menu"
              aria-label="Menu"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5 text-gray-800" />
              ) : (
                <Menu className="h-5 w-5 text-gray-800" />
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
            className="fixed inset-0 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu Dropdown Sheet */}
          <div className="absolute top-18 right-4 left-4 rounded-3xl border border-gray-100 bg-white p-4 shadow-2xl animate-in slide-in-from-top-3 zoom-in-95 duration-150">
            {/* Header info in menu */}
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-2">
              <div className="flex items-center gap-2.5">
                <UserAvatar avatar={avatar} className="h-10 w-10 text-base" />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-black text-gray-900">{guestName}</span>
                    {!isAnonymous && <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />}
                  </div>
                  <span className="text-[11px] text-gray-400 font-medium">
                    {isAnonymous
                      ? (language === 'vi' ? 'Tài khoản khách tạm thời' : 'Temporary Guest')
                      : (language === 'vi' ? 'Đã liên kết tài khoản' : 'Linked Account')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openProfile();
                }}
                className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
              >
                {language === 'vi' ? 'Hồ sơ' : 'Profile'}
              </button>
            </div>

            {/* Menu List Items */}
            <div className="space-y-1.5">
              {/* Leaderboard Item */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  openLeaderboard();
                }}
                className="flex w-full items-center justify-between rounded-2xl p-3 hover:bg-amber-50/60 active:bg-amber-100/60 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 border border-amber-200/90 shadow-2xs">
                    <Trophy className="h-5 w-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      {language === 'vi' ? 'Bảng Xếp Hạng' : 'Leaderboard'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {language === 'vi' ? 'Top cao thủ Cờ vua, Caro & Sudoku' : 'Rankings & Top Players'}
                    </p>
                  </div>
                </div>
                <span className="rounded-xl bg-amber-100 px-2.5 py-1 text-xs font-black text-amber-800">
                  TOP 🏆
                </span>
              </button>

              {/* Sound Toggle Item */}
              <button
                type="button"
                onClick={toggleSound}
                className="flex w-full items-center justify-between rounded-2xl p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-2xs">
                    {isMuted ? (
                      <VolumeX className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-indigo-600" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      {language === 'vi' ? 'Âm Thanh Trò Chơi' : 'Sound Effects'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isMuted
                        ? (language === 'vi' ? 'Đang tắt hiệu ứng âm thanh' : 'Sound muted')
                        : (language === 'vi' ? 'Đang bật hiệu ứng âm thanh' : 'Sound active')}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                    isMuted
                      ? 'bg-gray-100 text-gray-500'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {isMuted ? (language === 'vi' ? 'ĐANG TẮT' : 'OFF') : (language === 'vi' ? 'ĐANG BẬT' : 'ON')}
                </span>
              </button>

              {/* Language Switcher Item */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="flex w-full items-center justify-between rounded-2xl p-3 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 border border-blue-100 shadow-2xs">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      {language === 'vi' ? 'Ngôn Ngữ Hiển Thị' : 'Interface Language'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {language === 'vi' ? 'Đang chọn Tiếng Việt' : 'English selected'}
                    </p>
                  </div>
                </div>
                <span className="rounded-xl bg-blue-50 border border-blue-100 px-3 py-1 text-xs font-black text-blue-700">
                  {language === 'vi' ? 'VI 🇻🇳' : 'EN 🇬🇧'}
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
