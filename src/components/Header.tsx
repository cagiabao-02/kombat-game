'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Globe, Volume2, VolumeX, ShieldCheck, Trophy } from 'lucide-react';
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
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsMuted(sounds.isMuted());
  }, []);

  const toggleSound = () => {
    console.log('[Header Click] Toggle sound clicked!');
    const next = sounds.toggleMute();
    setIsMuted(next);
  };

  const toggleLanguage = () => {
    console.log('[Header Click] Toggle language clicked! Current:', language);
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const openProfile = () => {
    console.log('[Header Click] Open profile clicked!');
    setIsProfileOpen(true);
  };

  const openLeaderboard = () => {
    console.log('[Header Click] Open leaderboard clicked!');
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
            {/* User Profile Pill & Modal Trigger */}
            <button
              type="button"
              onClick={openProfile}
              className="flex items-center gap-1.5 min-h-[40px] rounded-full bg-gray-100 hover:bg-gray-200/90 px-3 py-1.5 text-xs font-semibold text-gray-800 transition-all border border-gray-200/80 shadow-2xs hover:scale-102 active:scale-95 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 outline-none"
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
              <span className="max-w-[95px] sm:max-w-[130px] truncate font-semibold">
                {guestName}
              </span>
              {!isAnonymous && (
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              )}
            </button>

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
        </div>
      </header>

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
