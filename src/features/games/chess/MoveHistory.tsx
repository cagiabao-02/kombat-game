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
    <div className="pixel-box bg-[#FFFDF8] p-3">
      <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-2 mb-2">
        <div className="flex items-center gap-1.5 font-pixel text-xs font-bold text-zinc-950 uppercase">
          <History className="h-3.5 w-3.5 text-indigo-700" />
          <span>{t.chess.moveHistory}</span>
        </div>
        <span className="pixel-badge bg-amber-200 px-2 py-0.5 text-[10px] font-bold text-zinc-900">
          {history.length} {language === 'vi' ? 'NƯỚC' : 'MOVES'}
        </span>
      </div>

      {history.length === 0 ? (
        <div className="py-4 text-center font-mono text-xs text-zinc-500">
          {t.chess.noMovesYet}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="max-h-32 overflow-y-auto pr-1 space-y-1 font-mono text-xs bg-[#ECE8DD] border-2 border-zinc-900 p-2 shadow-pixel-inset"
        >
          {pairs.map((p) => (
            <div
              key={p.round}
              className="flex items-center px-2 py-0.5 hover:bg-amber-100 transition-colors"
            >
              <span className="w-8 font-bold text-zinc-500">{p.round}.</span>
              <span className="w-16 font-bold text-zinc-950">{p.white}</span>
              <span className="w-16 font-bold text-indigo-800">
                {p.black ? p.black : '...'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
