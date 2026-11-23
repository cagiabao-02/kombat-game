'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { WordleGame } from '@/features/games/wordle/WordleGame';

export default function WordlePage() {
  const { language } = useLanguage();

  return (
    <div className="container mx-auto px-3 sm:px-4 py-4">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-pixel text-xs font-bold text-zinc-700 hover:text-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'vi' ? 'Về sảnh chính' : 'Back to Lobby'}</span>
        </Link>
      </div>

      <WordleGame />
    </div>
  );
}
