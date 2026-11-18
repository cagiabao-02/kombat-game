'use client';

import React from 'react';
import { Volume2, VolumeX, RotateCcw, Flame } from 'lucide-react';
import { sounds } from '@/lib/sound/soundService';

interface BlockBlastScoreBarProps {
  score: number;
  highScore: number;
  comboStreak: number;
  onResetGame: () => void;
}

export const BlockBlastScoreBar: React.FC<BlockBlastScoreBarProps> = ({
  score,
  highScore,
  comboStreak,
  onResetGame,
}) => {
  const [muted, setMuted] = React.useState(sounds.isSfxMuted());

  React.useEffect(() => {
    setMuted(sounds.isSfxMuted());
    const handleVolumeChange = (e: Event) => {
      const custom = e as CustomEvent<{ sfxMuted: boolean }>;
      if (custom.detail !== undefined) {
        setMuted(custom.detail.sfxMuted);
      }
    };
    window.addEventListener('kombat:volume_change', handleVolumeChange);
    return () => window.removeEventListener('kombat:volume_change', handleVolumeChange);
  }, []);

  const handleToggleSound = () => {
    const nextMuted = sounds.toggleSfxMute();
    setMuted(nextMuted);
  };

  return (
    <div className="w-full max-w-[400px] flex flex-col gap-2">
      {/* Hàng trên: Nút tiện ích & Combo Badge */}
      <div className="flex items-center justify-between min-h-[32px]">
        {/* Combo Badge nếu có */}
        {comboStreak > 1 ? (
          <div
            className={`flex items-center gap-1 px-2.5 py-1 text-white font-pixel text-xs font-bold border-2 border-black shadow-[2px_2px_0px_#000] animate-bounce ${
              comboStreak >= 5
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-400 text-yellow-100 ring-2 ring-yellow-300'
                : comboStreak >= 4
                ? 'bg-gradient-to-r from-rose-600 to-amber-500'
                : comboStreak >= 3
                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                : 'bg-gradient-to-r from-yellow-500 to-amber-500 text-zinc-950'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-yellow-200 fill-yellow-200 animate-pulse" />
            <span>COMBO x{comboStreak}!</span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1.5 ml-auto">
          <button
            onClick={handleToggleSound}
            aria-label="Toggle Sound"
            className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-900 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
          >
            {muted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          <button
            onClick={onResetGame}
            aria-label="Chơi lại từ đầu"
            className="p-1.5 bg-white hover:bg-zinc-100 text-zinc-900 border-2 border-black shadow-[2px_2px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Chơi lại ván mới"
          >
            <RotateCcw className="w-4 h-4 text-indigo-600" />
          </button>
        </div>
      </div>

      {/* Hàng dưới: Bảng điểm và Kỷ lục */}
      <div className="grid grid-cols-2 gap-2">
        {/* Điểm hiện tại */}
        <div className="bg-[#1e232a] border-2 border-black shadow-[3px_3px_0px_#000] p-2 text-center rounded">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Điểm số
          </p>
          <p className="font-pixel text-2xl font-bold text-amber-400">
            {score.toLocaleString()}
          </p>
        </div>

        {/* Kỷ lục */}
        <div className="bg-[#1e232a] border-2 border-black shadow-[3px_3px_0px_#000] p-2 text-center rounded">
          <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
            Kỷ lục
          </p>
          <p className="font-pixel text-2xl font-bold text-emerald-400">
            {highScore.toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
};
