'use client';

import React, { useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Plus, Users, ArrowRight, ShieldCheck, Sparkles, Clock } from 'lucide-react';

interface ChessLobbyViewProps {
  onCreateRoom: (timeControl: number) => void;
  onJoinRoom: (code: string) => void;
  isCreating: boolean;
  isJoining: boolean;
  errorMessage?: string | null;
}

export function ChessLobbyView({
  onCreateRoom,
  onJoinRoom,
  isCreating,
  isJoining,
  errorMessage,
}: ChessLobbyViewProps) {
  const { t, language } = useLanguage();
  const [inputCode, setInputCode] = useState('');
  const [selectedTime, setSelectedTime] = useState<number>(0);

  const timeOptions = [
    { value: 0, label: t.chess.timeUnlimited },
    { value: 180, label: t.chess.time3m },
    { value: 300, label: t.chess.time5m },
    { value: 600, label: t.chess.time10m },
  ];

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim().length >= 4) {
      onJoinRoom(inputCode.trim().toUpperCase());
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 mb-2">
          <Sparkles className="h-3.5 w-3.5" />
          <span>{language === 'vi' ? 'Đấu trí 1v1 Realtime' : 'Realtime 1v1 Showdown'}</span>
        </div>
        <h1 className="text-3xl font-black tracking-tight text-gray-900">
          {t.chess.title}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          {language === 'vi'
            ? 'Tạo phòng riêng hoặc nhập mã để so tài cùng bạn bè mọi lúc mọi nơi.'
            : 'Create a private room or enter room code to challenge a friend.'}
        </p>
      </div>

      {/* Error alert */}
      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 animate-fade-in">
          {errorMessage}
        </div>
      )}

      {/* Action Cards */}
      <div className="flex flex-col gap-5">
        {/* Card 1: Create Room */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t.chess.createRoom}</h3>
              <p className="text-xs text-gray-500">
                {language === 'vi' ? 'Lấy mã mời gửi bạn bè (Bạn cầm quân Trắng)' : 'Get invite code for a friend (You play White)'}
              </p>
            </div>
          </div>

          {/* Time control selection */}
          <div className="mb-4">
            <label className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700">
              <Clock className="h-3.5 w-3.5 text-indigo-600" />
              <span>{t.chess.timeControl}</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {timeOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSelectedTime(opt.value)}
                  className={`rounded-xl border py-2 px-3 text-xs font-semibold transition-all ${
                    selectedTime === opt.value
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-600'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={isCreating || isJoining}
            onClick={() => onCreateRoom(selectedTime)}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-indigo-700 active:scale-95 disabled:opacity-50"
          >
            {isCreating ? t.common.loading : t.chess.createRoom}
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-gray-200" />
          <span className="absolute bg-[#F6F7FB] px-3 text-xs font-bold uppercase text-gray-400">
            {language === 'vi' ? 'HOẶC' : 'OR'}
          </span>
        </div>

        {/* Card 2: Join Room */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-300">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{t.chess.joinRoom}</h3>
              <p className="text-xs text-gray-500">
                {language === 'vi' ? 'Nhập mã 6 ký tự do bạn bè gửi' : 'Enter 6-char code shared by your friend'}
              </p>
            </div>
          </div>

          <form onSubmit={handleJoinSubmit} className="flex gap-2">
            <input
              type="text"
              maxLength={8}
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value.toUpperCase())}
              placeholder="VD: 8K2M9A"
              className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-center font-mono text-base font-bold tracking-widest text-gray-900 uppercase placeholder:text-gray-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
            <button
              type="submit"
              disabled={isJoining || isCreating || inputCode.trim().length < 4}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition-all hover:bg-black active:scale-95 disabled:opacity-50"
            >
              <span>{isJoining ? t.common.loading : t.chess.joinButton}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 flex items-center justify-center gap-1.5 text-xs text-gray-400">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        <span>{t.app.loginNotice}</span>
      </div>
    </div>
  );
}

