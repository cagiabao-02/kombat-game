'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/features/auth/AuthContext';
import { Globe, User, Edit3, X, Check } from 'lucide-react';

export function Header() {
  const { language, setLanguage } = useLanguage();
  const { guestName, updateGuestName } = useAuth();
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');

  const toggleLanguage = () => {
    setLanguage(language === 'vi' ? 'en' : 'vi');
  };

  const handleOpenEdit = () => {
    setTempName(guestName);
    setIsEditingName(true);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      await updateGuestName(tempName);
      setIsEditingName(false);
    }
  };

  return (
    <>
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

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Guest Identity pill & Edit trigger */}
            <button
              type="button"
              onClick={handleOpenEdit}
              className="flex items-center gap-1.5 rounded-full bg-gray-100 hover:bg-gray-200/80 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors"
              title="Đổi tên hiển thị / Change display name"
            >
              <User className="h-3.5 w-3.5 text-indigo-600" />
              <span className="max-w-[120px] truncate">{guestName}</span>
              <Edit3 className="h-3 w-3 text-gray-400 hover:text-gray-700" />
            </button>

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

      {/* Edit Display Name Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900">
                {language === 'vi' ? 'Đổi tên hiển thị' : 'Change Display Name'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditingName(false)}
                className="rounded-lg p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveName}>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  {language === 'vi' ? 'Tên hiển thị trong phòng chơi:' : 'Display name in rooms:'}
                </label>
                <input
                  type="text"
                  maxLength={20}
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm font-medium text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  placeholder={language === 'vi' ? 'Nhập tên của bạn...' : 'Enter your name...'}
                  autoFocus
                />
                <p className="mt-1.5 text-[11px] text-gray-400">
                  {language === 'vi'
                    ? 'Tên này sẽ hiển thị cho đối thủ thấy khi bạn tham gia phòng đấu.'
                    : 'This name is visible to opponents when you join game rooms.'}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50"
                >
                  {language === 'vi' ? 'Hủy' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  disabled={!tempName.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  <Check className="h-4 w-4" />
                  <span>{language === 'vi' ? 'Lưu' : 'Save'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
