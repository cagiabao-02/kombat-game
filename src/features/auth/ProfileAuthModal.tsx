'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { AVATAR_OPTIONS, isCustomImageAvatar, getValidAvatar } from './avatarConstants';
import { useLanguage } from '@/i18n/LanguageContext';
import { getChessStats, ChessStats } from '@/features/games/chess/statsService';
import { getCaroStats, CaroStats } from '@/features/games/caro/caroStatsService';
import {
  X,
  User,
  ShieldCheck,
  Mail,
  Lock,
  LogOut,
  Sparkles,
  Trophy,
  Flame,
  Check,
  AlertCircle,
  Loader2,
  Upload,
  Camera,
  Trash2,
} from 'lucide-react';

interface ProfileAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'account';
}

function formatAuthError(rawMsg: string, lang: 'vi' | 'en'): string {
  const lower = rawMsg.toLowerCase();

  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid credentials') ||
    lower.includes('invalid grant')
  ) {
    return lang === 'vi'
      ? 'Email hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại!'
      : 'Invalid email or password. Please check your credentials!';
  }

  if (lower.includes('already registered') || lower.includes('user already exists')) {
    return lang === 'vi'
      ? 'Email này đã được đăng ký tài khoản. Vui lòng chuyển sang tab Đăng nhập!'
      : 'This email is already registered. Please sign in instead!';
  }

  if (
    lower.includes('password should be at least') ||
    lower.includes('password must be at least')
  ) {
    return lang === 'vi'
      ? 'Mật khẩu phải có ít nhất 6 ký tự!'
      : 'Password must be at least 6 characters long!';
  }

  if (lower.includes('email not confirmed')) {
    return lang === 'vi'
      ? 'Email chưa được xác thực. Vui lòng kiểm tra hộp thư của bạn!'
      : 'Email is not confirmed. Please check your inbox!';
  }

  if (lower.includes('too many requests') || lower.includes('rate limit')) {
    return lang === 'vi'
      ? 'Bạn đã thao tác quá nhiều lần. Vui lòng đợi trong giây lát rồi thử lại!'
      : 'Too many attempts. Please wait a moment and try again!';
  }

  if (
    lower.includes('network') ||
    lower.includes('fetch') ||
    lower.includes('failed to fetch')
  ) {
    return lang === 'vi'
      ? 'Lỗi kết nối mạng đến máy chủ Supabase. Vui lòng kiểm tra lại kết nối!'
      : 'Network connection error. Please check your internet connection!';
  }

  return rawMsg;
}

export function ProfileAuthModal({
  isOpen,
  onClose,
  defaultTab = 'profile',
}: ProfileAuthModalProps) {
  const {
    user,
    guestName,
    avatar,
    isAnonymous,
    updateGuestName,
    updateAvatar,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signOut,
    refreshUser,
  } = useAuth();
  const { language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'profile' | 'account'>(defaultTab);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  // Profile Form State
  const [tempName, setTempName] = useState(guestName);
  const [tempAvatar, setTempAvatar] = useState(avatar);
  const [customPhoto, setCustomPhoto] = useState<string | null>(
    isCustomImageAvatar(avatar) ? avatar : null
  );
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUploadClick = () => {
    if (isAnonymous) {
      setActiveTab('account');
      setAuthError(
        language === 'vi'
          ? 'Tính năng tải ảnh đại diện cá nhân chỉ dành riêng cho tài khoản đã liên kết. Hãy đăng ký hoặc đăng nhập để mở khóa nhé!'
          : 'Uploading custom photos is exclusive to linked cloud accounts. Please sign in or register to unlock!'
      );
    } else {
      fileInputRef.current?.click();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isAnonymous) return;
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(language === 'vi' ? 'Vui lòng chọn tệp hình ảnh!' : 'Please select an image file!');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const size = Math.min(img.width, img.height);
        const startX = (img.width - size) / 2;
        const startY = (img.height - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, size, size, 0, 0, 128, 128);
          const base64 = canvas.toDataURL('image/jpeg', 0.85);
          setCustomPhoto(base64);
          setTempAvatar(base64);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected if desired
    e.target.value = '';
  };

  const handleRemoveCustomPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomPhoto(null);
    if (tempAvatar === customPhoto || isCustomImageAvatar(tempAvatar)) {
      setTempAvatar('👑');
    }
  };

  // Auth Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  // Stats
  const [chessStats, setChessStats] = useState<ChessStats | null>(null);
  const [caroStats, setCaroStats] = useState<CaroStats | null>(null);
  const [statsGameTab, setStatsGameTab] = useState<'chess' | 'caro' | 'all'>('all');

  useEffect(() => {
    if (isOpen) {
      // 1. Ưu tiên tuyệt đối dữ liệu từ Supabase Cloud
      const meta = user?.user_metadata || {};
      const cloudName = meta.display_name || guestName;
      const cloudAvatar = meta.avatar ? getValidAvatar(meta.avatar) : avatar;

      setTempName(cloudName);
      setTempAvatar(cloudAvatar);
      setCustomPhoto(isCustomImageAvatar(cloudAvatar) ? cloudAvatar : null);

      setProfileSuccessMsg(null);
      setAuthError(null);
      setAuthSuccess(null);

      // Thống kê thi đấu lấy trực tiếp từ Supabase
      setChessStats(meta.chess_stats || getChessStats());
      setCaroStats(meta.caro_stats || getCaroStats());

      // 2. Kéo dữ liệu mới nhất từ Supabase Cloud Server (đồng bộ cả Modal lẫn Header bên ngoài)
      if (user) {
        refreshUser().then((freshUser) => {
          if (freshUser?.user_metadata) {
            const m = freshUser.user_metadata;
            if (m.display_name) setTempName(m.display_name);
            if (m.avatar) {
              const freshAv = getValidAvatar(m.avatar);
              setTempAvatar(freshAv);
              if (isCustomImageAvatar(freshAv)) {
                setCustomPhoto(freshAv);
              }
            }
            if (m.caro_stats) setCaroStats(m.caro_stats);
            if (m.chess_stats) setChessStats(m.chess_stats);
          }
        }).catch(() => {});
      }
    }
  }, [isOpen, guestName, avatar, user, isAnonymous, refreshUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempName.trim();
    if (!trimmed) return;

    setIsSavingProfile(true);
    try {
      if (trimmed !== guestName) {
        await updateGuestName(trimmed);
      }
      if (tempAvatar !== avatar) {
        await updateAvatar(tempAvatar);
      }
      setProfileSuccessMsg(
        language === 'vi' ? 'Đã lưu hồ sơ thành công!' : 'Profile saved successfully!'
      );
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } catch {
      // Error handled in context
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccess(null);

    if (!email || !password) {
      setAuthError(
        language === 'vi'
          ? 'Vui lòng nhập đầy đủ email và mật khẩu'
          : 'Please enter both email and password'
      );
      return;
    }

    if (authMode === 'signup') {
      if (password.length < 6) {
        setAuthError(
          language === 'vi'
            ? 'Mật khẩu phải có ít nhất 6 ký tự'
            : 'Password must be at least 6 characters'
        );
        return;
      }
      if (password !== confirmPassword) {
        setAuthError(
          language === 'vi'
            ? 'Mật khẩu xác nhận không khớp'
            : 'Passwords do not match'
        );
        return;
      }

      setAuthLoading(true);
      const res = await signUpWithEmail(email, password);
      setAuthLoading(false);

      if (res.error) {
        setAuthError(formatAuthError(res.error, language));
      } else {
        setAuthSuccess(
          language === 'vi'
            ? 'Đăng ký thành công! Đã liên kết tài khoản của bạn.'
            : 'Registered successfully! Your account is now linked.'
        );
      }
    } else {
      setAuthLoading(true);
      const res = await signInWithEmail(email, password);
      setAuthLoading(false);

      if (res.error) {
        setAuthError(formatAuthError(res.error, language));
      } else {
        setAuthSuccess(
          language === 'vi' ? 'Đăng nhập thành công!' : 'Signed in successfully!'
        );
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    const res = await signInWithGoogle();
    setAuthLoading(false);
    if (res.error) {
      setAuthError(formatAuthError(res.error, language));
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const currentStatData = React.useMemo(() => {
    if (statsGameTab === 'chess') {
      const wins = chessStats?.wins || 0;
      const losses = chessStats?.losses || 0;
      const draws = chessStats?.draws || 0;
      const total = wins + losses + draws;
      const rate = total > 0 ? Math.round((wins / total) * 100) : 0;
      return { wins, losses, draws, total, rate, streak: chessStats?.streak || chessStats?.currentStreak || 0 };
    }
    if (statsGameTab === 'caro') {
      const wins = caroStats?.wins || 0;
      const losses = caroStats?.losses || 0;
      const draws = caroStats?.draws || 0;
      const total = wins + losses + draws;
      const rate = total > 0 ? Math.round((wins / total) * 100) : 0;
      return { wins, losses, draws, total, rate, streak: caroStats?.currentStreak || 0 };
    }
    // all (tổng hợp)
    const wins = (chessStats?.wins || 0) + (caroStats?.wins || 0);
    const losses = (chessStats?.losses || 0) + (caroStats?.losses || 0);
    const draws = (chessStats?.draws || 0) + (caroStats?.draws || 0);
    const total = wins + losses + draws;
    const rate = total > 0 ? Math.round((wins / total) * 100) : 0;
    const streak = Math.max(chessStats?.streak || 0, caroStats?.currentStreak || 0);
    return { wins, losses, draws, total, rate, streak };
  }, [statsGameTab, chessStats, caroStats]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl transition-all">
        {/* Header with Avatar preview */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 pt-6 pb-5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-full bg-white/20 p-1.5 text-white/90 hover:bg-white/30 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-inner backdrop-blur-md border border-white/30 overflow-hidden shrink-0">
              {isCustomImageAvatar(tempAvatar) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tempAvatar} alt="Avatar" className="h-full w-full object-cover" />
              ) : (
                <span>{tempAvatar}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight truncate">
                  {tempName || guestName}
                </h2>
                {!isAnonymous && (
                  <span
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-bold text-emerald-200"
                    title={language === 'vi' ? 'Tài khoản đã đồng bộ' : 'Synced Account'}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    <span>Cloud</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-100/80 truncate">
                {!isAnonymous && user?.email
                  ? user.email
                  : language === 'vi'
                    ? 'Khách tạm thời • Dữ liệu lưu trình duyệt'
                    : 'Temporary Guest • Saved in browser'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 flex gap-1 rounded-xl bg-black/20 p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 rounded-lg py-1.5 transition-colors ${activeTab === 'profile'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
                }`}
            >
              {language === 'vi' ? 'Hồ sơ & Avatar' : 'Profile & Avatar'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`flex-1 rounded-lg py-1.5 transition-colors ${activeTab === 'account'
                  ? 'bg-white text-indigo-700 shadow-sm'
                  : 'text-white/80 hover:text-white'
                }`}
            >
              {language === 'vi' ? 'Tài khoản Đám mây' : 'Cloud Account'}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {activeTab === 'profile' ? (
            <form onSubmit={handleSaveProfile} className="space-y-5">
              {/* Avatar Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    {language === 'vi' ? 'Ảnh / Linh vật đại diện:' : 'Avatar or photo:'}
                  </label>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold transition-colors ${isAnonymous
                        ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                        : 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                      }`}
                    title={
                      isAnonymous
                        ? language === 'vi'
                          ? 'Dành riêng cho tài khoản đã liên kết'
                          : 'Exclusive to linked accounts'
                        : undefined
                    }
                  >
                    {isAnonymous ? (
                      <Lock className="h-3.5 w-3.5 text-amber-600" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {language === 'vi'
                        ? isAnonymous
                          ? 'Tải ảnh (Cần tài khoản)'
                          : 'Tải ảnh từ máy'
                        : isAnonymous
                          ? 'Upload photo (Account)'
                          : 'Upload photo'}
                    </span>
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>

                {/* Show custom uploaded photo card if available */}
                {customPhoto && (
                  <div
                    onClick={() => setTempAvatar(customPhoto)}
                    className={`mb-3 flex items-center justify-between rounded-2xl p-2.5 transition-all cursor-pointer ${tempAvatar === customPhoto
                        ? 'border-2 border-indigo-600 bg-indigo-50/70 shadow-xs'
                        : 'border border-gray-200 bg-gray-50/80 hover:bg-gray-100 hover:border-gray-300'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`h-10 w-10 overflow-hidden rounded-xl border shadow-xs ${tempAvatar === customPhoto ? 'border-indigo-400' : 'border-gray-200'
                        }`}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={customPhoto} alt="Custom" className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold ${tempAvatar === customPhoto ? 'text-indigo-900' : 'text-gray-800'
                            }`}>
                            {language === 'vi' ? 'Ảnh bạn tự tải lên' : 'Custom uploaded photo'}
                          </p>
                        </div>
                        <p className={`text-[10px] ${tempAvatar === customPhoto ? 'text-indigo-600 font-medium' : 'text-gray-500'
                          }`}>
                          {tempAvatar === customPhoto
                            ? language === 'vi'
                              ? 'Đang được chọn làm đại diện'
                              : 'Active profile photo'
                            : language === 'vi'
                              ? 'Bấm để dùng lại ảnh này'
                              : 'Click to select this photo'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCustomPhoto}
                      title={language === 'vi' ? 'Xóa vĩnh viễn ảnh tải lên' : 'Delete uploaded photo'}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-semibold text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors z-10"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>{language === 'vi' ? 'Gỡ ảnh' : 'Remove'}</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {AVATAR_OPTIONS.map((item) => {
                    const isSelected = tempAvatar === item.emoji;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setTempAvatar(item.emoji)}
                        className={`group relative flex flex-col items-center justify-center rounded-2xl p-2.5 transition-all text-2xl ${isSelected
                            ? 'bg-indigo-50 border-2 border-indigo-600 shadow-sm scale-105'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                          }`}
                        title={language === 'vi' ? item.nameVi : item.nameEn}
                      >
                        <span>{item.emoji}</span>
                        <span className="mt-1 text-[9px] font-medium text-gray-500 truncate max-w-full group-hover:text-gray-900">
                          {language === 'vi' ? item.nameVi : item.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">
                  {language === 'vi' ? 'Tên hiển thị:' : 'Display name:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder={language === 'vi' ? 'Nhập tên của bạn...' : 'Enter your name...'}
                    className="w-full rounded-xl border border-gray-300 pl-9 pr-3.5 py-2.5 text-sm font-semibold text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
                <p className="mt-1 text-[11px] text-gray-400">
                  {language === 'vi'
                    ? 'Tên và avatar này sẽ hiển thị cho đối thủ trong phòng cờ.'
                    : 'Name and avatar will be visible to opponents in game rooms.'}
                </p>
              </div>

              {/* Quick Stats Snapshot */}
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5">
                <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-500" />
                    <span>{language === 'vi' ? 'Thành tích thi đấu' : 'Competitive Record'}</span>
                  </span>
                  <div className="flex items-center gap-1 bg-gray-200/70 p-0.5 rounded-lg text-[10px]">
                    <button
                      type="button"
                      onClick={() => setStatsGameTab('all')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        statsGameTab === 'all' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {language === 'vi' ? 'Tất cả' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatsGameTab('chess')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        statsGameTab === 'chess' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {language === 'vi' ? 'Cờ vua' : 'Chess'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatsGameTab('caro')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        statsGameTab === 'caro' ? 'bg-white text-gray-900 shadow-2xs' : 'text-gray-500 hover:text-gray-900'
                      }`}
                    >
                      {language === 'vi' ? 'Caro' : 'Caro'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="rounded-xl bg-white p-2 border border-gray-200/60 shadow-xs">
                    <p className="text-sm sm:text-base font-black text-indigo-600">{currentStatData.wins}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {language === 'vi' ? 'Thắng' : 'Wins'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-gray-200/60 shadow-xs">
                    <p className="text-sm sm:text-base font-black text-rose-600">{currentStatData.losses}</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {language === 'vi' ? 'Thua' : 'Losses'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-gray-200/60 shadow-xs">
                    <p className="text-sm sm:text-base font-black text-emerald-600">{currentStatData.rate}%</p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {language === 'vi' ? 'Tỉ lệ thắng' : 'Win Rate'}
                    </p>
                  </div>
                  <div className="rounded-xl bg-white p-2 border border-gray-200/60 shadow-xs">
                    <p className="text-sm sm:text-base font-black text-amber-600 flex items-center justify-center gap-0.5">
                      <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {currentStatData.streak}
                    </p>
                    <p className="text-[10px] text-gray-400 font-medium">
                      {language === 'vi' ? 'Chuỗi' : 'Streak'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              {profileSuccessMsg && (
                <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-semibold text-emerald-700 animate-fade-in">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-xl border border-gray-200 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  {language === 'vi' ? 'Đóng' : 'Close'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile || !tempName.trim()}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>{language === 'vi' ? 'Lưu thay đổi' : 'Save Changes'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Authenticated Account View */}
              {!isAnonymous ? (
                <div className="space-y-4">
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{language === 'vi' ? 'Tài khoản đã liên kết' : 'Linked Cloud Account'}</span>
                    </div>
                    <p className="text-xs text-emerald-700/90 leading-relaxed">
                      {language === 'vi'
                        ? 'Dữ liệu thành tích và thông tin của bạn đang được đồng bộ đám mây an toàn với Supabase.'
                        : 'Your stats and profile are safely synced to the cloud with Supabase.'}
                    </p>
                    <div className="mt-3 text-xs font-semibold text-gray-700 bg-white/80 p-2.5 rounded-xl border border-emerald-200/50">
                      <span className="text-gray-400">Email: </span>
                      <span className="font-mono text-gray-900">{user?.email}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50/50 py-2.5 text-xs font-bold text-red-600 hover:bg-red-100/60 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{language === 'vi' ? 'Đăng xuất tài khoản' : 'Sign Out'}</span>
                  </button>
                </div>
              ) : (
                /* Anonymous / Upgrade Account View */
                <div>
                  <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-3.5 text-xs text-indigo-900">
                    <div className="flex items-center gap-1.5 font-bold mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span>
                        {language === 'vi'
                          ? 'Nâng cấp từ Khách lên Tài khoản'
                          : 'Upgrade Guest to Cloud Account'}
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700/90 leading-relaxed">
                      {language === 'vi'
                        ? 'Đăng ký giúp bạn giữ lại thành tích, chuỗi thắng và tên hiển thị khi đổi trình duyệt hoặc thiết bị.'
                        : 'Registering preserves your game records, win streak, and name across devices.'}
                    </p>
                  </div>

                  {/* Switch between Sign In & Sign Up */}
                  <div className="flex rounded-xl bg-gray-100 p-1 text-xs font-bold mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className={`flex-1 rounded-lg py-1.5 transition-colors ${authMode === 'signin'
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      {language === 'vi' ? 'Đăng nhập' : 'Sign In'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className={`flex-1 rounded-lg py-1.5 transition-colors ${authMode === 'signup'
                          ? 'bg-white text-indigo-600 shadow-xs'
                          : 'text-gray-500 hover:text-gray-800'
                        }`}
                    >
                      {language === 'vi' ? 'Đăng ký mới' : 'Register'}
                    </button>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tenban@example.com"
                          className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs font-medium text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        {language === 'vi' ? 'Mật khẩu' : 'Password'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs font-medium text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                        />
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          {language === 'vi' ? 'Xác nhận mật khẩu' : 'Confirm Password'}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Lock className="h-4 w-4" />
                          </div>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full rounded-xl border border-gray-300 pl-9 pr-3 py-2 text-xs font-medium text-gray-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                          />
                        </div>
                      </div>
                    )}

                    {authError && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-red-50 p-2.5 text-xs text-red-600 border border-red-200">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {authSuccess && (
                      <div className="flex items-center gap-1.5 rounded-xl bg-emerald-50 p-2.5 text-xs text-emerald-700 border border-emerald-200">
                        <Check className="h-4 w-4 shrink-0" />
                        <span>{authSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                    >
                      {authLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>
                        {authMode === 'signin'
                          ? language === 'vi'
                            ? 'Đăng nhập'
                            : 'Sign In'
                          : language === 'vi'
                            ? 'Tạo tài khoản'
                            : 'Create Account'}
                      </span>
                    </button>
                  </form>

                  {/* Google OAuth Option */}
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={authLoading}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2 text-xs font-semibold text-gray-700 shadow-xs hover:bg-gray-50 active:scale-98 transition-all"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>
                        {language === 'vi' ? 'Tiếp tục với Google' : 'Continue with Google'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

