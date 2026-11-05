'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { Globe, User } from 'lucide-react';

export function Header() {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-gray-200 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-sm transition-transform group-hover:scale-105">
            TG
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-gray-900">TOGAME</span>
            <span className="hidden sm:inline-block ml-2 text-xs font-medium text-gray-400">
              Indie Lobby
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {/* Guest Identity pill */}
          <div className="flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
            <User className="h-3.5 w-3.5 text-gray-500" />
            <span>{t.app.guestBadge}</span>
          </div>

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-colors hover:bg-gray-50 active:scale-95"
            title="Chuyển đổi ngôn ngữ / Switch language"
            aria-label="Switch Language"
          >
            <Globe className="h-3.5 w-3.5 text-indigo-600" />
            <span>{language.toUpperCase()}</span>
          </button>
        </div>
      </div>
    </header>
  );
}

