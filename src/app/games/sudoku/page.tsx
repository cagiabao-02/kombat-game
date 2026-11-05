'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/i18n/LanguageContext';
import { ArrowLeft, Sparkles } from 'lucide-react';

export default function SudokuPage() {
  const { language, t } = useLanguage();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:py-12">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>{t.common.backToLobby}</span>
      </Link>

      <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            {language === 'vi' ? 'Chơi đơn' : 'Single Player'}
          </span>
        </div>
        <h1 className="text-2xl font-black text-gray-900 sm:text-3xl">
          Sudoku
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {language === 'vi'
            ? 'Khu vực trò chơi Sudoku đang được chuẩn bị ở Chặng 2 theo lộ trình phát triển.'
            : 'Sudoku game area is being prepared for Stage 2 of development roadmap.'}
        </p>

        <div className="mt-8 rounded-xl border border-dashed border-gray-300 p-8 text-center bg-gray-50/50">
          <Sparkles className="mx-auto h-8 w-8 text-indigo-500 mb-2" />
          <p className="text-sm font-medium text-gray-700">
            {language === 'vi' ? 'Sẵn sàng triển khai logic Sudoku' : 'Ready to implement Sudoku logic'}
          </p>
        </div>
      </div>
    </div>
  );
}

