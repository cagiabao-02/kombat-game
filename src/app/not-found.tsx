'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const { language } = useLanguage();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 mb-2">
        404
      </span>
      <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
        {language === 'vi' ? 'Không tìm thấy trang' : 'Page Not Found'}
      </h2>
      <p className="mt-2 text-sm text-gray-600 max-w-md">
        {language === 'vi'
          ? 'Trang hoặc trò chơi bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.'
          : 'The page or game you are looking for does not exist or has been moved.'}
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95"
      >
        <Home className="h-4 w-4" />
        <span>{language === 'vi' ? 'Về sảnh trò chơi' : 'Back to Lobby'}</span>
      </Link>
    </div>
  );
}

