'use client';

import React, { useEffect, useRef } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { History } from 'lucide-react';

interface MoveHistoryProps {
  history: string[];
}

export function MoveHistory({ history }: MoveHistoryProps) {
  const { t, language } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new moves
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history.length]);

  const pairs: { round: number; white: string; black?: string }[] = [];
  for (let i = 0; i < history.length; i += 2) {
    pairs.push({
      round: Math.floor(i / 2) + 1,
      white: history[i],
      black: history[i + 1],
    });
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-2">
        <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700">
          <History className="h-3.5 w-3.5 text-indigo-600" />
          <span>{t.chess.moveHistory}</span>
        </div>
        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
          {history.length} {language === 'vi' ? 'nước' : 'moves'}
        </span>
      </div>

      {history.length === 0 ? (
        <div className="py-4 text-center text-xs text-gray-400 italic">
          {t.chess.noMovesYet}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="max-h-32 overflow-y-auto pr-1 space-y-1 font-mono text-xs"
        >
          {pairs.map((p) => (
            <div
              key={p.round}
              className="flex items-center rounded px-2 py-1 hover:bg-gray-50 transition-colors"
            >
              <span className="w-8 font-semibold text-gray-400">{p.round}.</span>
              <span className="w-16 font-medium text-gray-900 font-bold">{p.white}</span>
              <span className="w-16 font-medium text-gray-700">
                {p.black ? p.black : '...'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

