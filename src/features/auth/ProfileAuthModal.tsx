'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { AVATAR_OPTIONS, isCustomImageAvatar, getValidAvatar } from './avatarConstants';
import { PixelAvatarSprite } from '@/components/UserAvatar';
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
    updateProfile,
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
  const wasOpenRef = useRef(false);

  useEffect(() => {
    // Chỉ khởi tạo giá trị form một lần duy nhất khi Modal vừa mở ra (tránh ghi đè khi đang sửa)
    if (isOpen && !wasOpenRef.current) {
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

      // Kéo dữ liệu mới nhất nếu là tài khoản đám mây (chỉ cập nhật stats nền, không ghi đè form nhập của người dùng)
      if (user && !isAnonymous) {
        refreshUser().then((freshUser) => {
          if (freshUser?.user_metadata) {
            const m = freshUser.user_metadata;
            if (m.caro_stats) setCaroStats(m.caro_stats);
            if (m.chess_stats) setChessStats(m.chess_stats);
          }
        }).catch(() => {});
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, guestName, avatar, user, isAnonymous, refreshUser]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tempName.trim();
    if (!trimmed) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg(null);
    setAuthError(null);
    try {
      const res = await updateProfile({
        displayName: trimmed,
        avatar: tempAvatar,
      });

      if (res?.error) {
        setAuthError(formatAuthError(res.error, language));
        return;
      }

      setProfileSuccessMsg(
        language === 'vi' ? 'Đã lưu hồ sơ thành công!' : 'Profile saved successfully!'
      );
      setTimeout(() => setProfileSuccessMsg(null), 3000);
    } catch (err: any) {
      setAuthError(err?.message || (language === 'vi' ? 'Lỗi lưu hồ sơ' : 'Failed to save profile'));
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 animate-fade-in">
      <div className="pixel-box-lg relative w-full max-w-md overflow-hidden bg-[#FFFDF8] transition-all">
        {/* Header with Avatar preview */}
        <div className="relative bg-indigo-700 border-b-2 border-zinc-900 px-6 pt-6 pb-5 text-white">
          <button
            type="button"
            onClick={onClose}
            className="pixel-btn absolute top-4 right-4 bg-white p-1.5 text-zinc-900 hover:bg-rose-100"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative flex h-16 w-16 items-center justify-center bg-amber-100 text-3xl border-2 border-zinc-900 shadow-pixel-sm overflow-hidden shrink-0">
              {isCustomImageAvatar(tempAvatar) ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={tempAvatar} alt="Avatar" className="h-full w-full object-cover pixelated" />
              ) : (
                <PixelAvatarSprite symbol={tempAvatar} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="font-pixel text-lg font-bold tracking-wide text-amber-300 truncate">
                  {tempName || guestName}
                </h2>
                {!isAnonymous && (
                  <span
                    className="inline-flex items-center gap-1 bg-emerald-400 border border-zinc-900 px-2 py-0.5 font-pixel text-[10px] font-bold text-zinc-950"
                    title={language === 'vi' ? 'Tài khoản đã đồng bộ' : 'Synced Account'}
                  >
                    <ShieldCheck className="h-3 w-3" />
                    <span>CLOUD</span>
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-indigo-100 truncate">
                {!isAnonymous && user?.email
                  ? user.email
                  : language === 'vi'
                    ? 'PLAYER: KHÁCH • LƯU TRÊN MÁY'
                    : 'PLAYER: GUEST • LOCAL SAVE'}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`pixel-btn py-1.5 text-xs font-bold ${activeTab === 'profile'
                  ? 'bg-amber-300 text-zinc-950'
                  : 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
                }`}
            >
              {language === 'vi' ? 'HỒ SƠ & AVATAR' : 'PLAYER CARD'}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('account')}
              className={`pixel-btn py-1.5 text-xs font-bold ${activeTab === 'account'
                  ? 'bg-amber-300 text-zinc-950'
                  : 'bg-indigo-900 text-indigo-200 hover:bg-indigo-800'
                }`}
            >
              {language === 'vi' ? 'TÀI KHOẢN CLOUD' : 'CLOUD SAVE'}
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
                  <label className="font-pixel text-xs font-bold uppercase tracking-wider text-zinc-800">
                    {language === 'vi' ? 'CHỌN LINH VẬT:' : 'SELECT AVATAR:'}
                  </label>
                  <button
                    type="button"
                    onClick={handleUploadClick}
                    className={`pixel-btn inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold ${isAnonymous
                        ? 'bg-amber-100 text-amber-950 hover:bg-amber-200'
                        : 'bg-indigo-100 text-indigo-950 hover:bg-indigo-200'
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
                      <Lock className="h-3.5 w-3.5 text-amber-700" />
                    ) : (
                      <Upload className="h-3.5 w-3.5" />
                    )}
                    <span>
                      {language === 'vi'
                        ? isAnonymous
                          ? 'Tải ảnh (Cần Cloud)'
                          : 'Tải ảnh từ máy'
                        : isAnonymous
                          ? 'Upload (Cloud)'
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
                    className={`mb-3 flex items-center justify-between border-2 border-zinc-900 p-2.5 cursor-pointer shadow-pixel-xs ${tempAvatar === customPhoto
                        ? 'bg-indigo-100'
                        : 'bg-white hover:bg-zinc-50'
                      }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="h-10 w-10 overflow-hidden border-2 border-zinc-900 bg-white">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={customPhoto} alt="Custom" className="h-full w-full object-cover pixelated" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-pixel text-xs font-bold text-zinc-900">
                            {language === 'vi' ? 'ẢNH TỰ TẢI LÊN' : 'CUSTOM PHOTO'}
                          </p>
                        </div>
                        <p className="text-[10px] font-mono text-zinc-600">
                          {tempAvatar === customPhoto
                            ? language === 'vi'
                              ? 'Đang được chọn'
                              : 'Active photo'
                            : language === 'vi'
                              ? 'Bấm để dùng lại ảnh này'
                              : 'Click to select'}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCustomPhoto}
                      title={language === 'vi' ? 'Xóa vĩnh viễn ảnh tải lên' : 'Delete uploaded photo'}
                      className="pixel-btn inline-flex items-center gap-1 bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-800 hover:bg-rose-200 z-10"
                    >
                      <Trash2 className="h-3 w-3" />
                      <span>{language === 'vi' ? 'Gỡ' : 'Remove'}</span>
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
                        className={`pixel-btn group relative flex flex-col items-center justify-center p-2 ${isSelected
                            ? 'bg-amber-300 border-zinc-900'
                            : 'bg-white hover:bg-zinc-100'
                          }`}
                        title={language === 'vi' ? item.nameVi : item.nameEn}
                      >
                        <div className="h-9 w-9 border border-zinc-900 overflow-hidden">
                          <PixelAvatarSprite symbol={item.emoji} />
                        </div>
                        <span className="mt-1 font-pixel text-[9px] font-bold text-zinc-700 truncate max-w-full">
                          {language === 'vi' ? item.nameVi : item.nameEn}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Display Name Input */}
              <div>
                <label className="block font-pixel text-xs font-bold uppercase tracking-wider text-zinc-800 mb-1.5">
                  {language === 'vi' ? 'TÊN HIỂN THỊ (PLAYER NAME):' : 'PLAYER NAME:'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-600">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    maxLength={20}
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    placeholder={language === 'vi' ? 'Nhập tên của bạn...' : 'Enter your name...'}
                    className="pixel-input w-full bg-white pl-9 pr-3.5 py-2.5 text-sm font-bold text-zinc-900"
                  />
                </div>
                <p className="mt-1 text-[11px] font-mono text-zinc-500">
                  {language === 'vi'
                    ? 'Tên và avatar sẽ hiển thị trong phòng đấu.'
                    : 'Name and avatar will appear in game rooms.'}
                </p>
              </div>

              {/* Quick Stats Snapshot */}
              <div className="border-2 border-zinc-900 bg-[#ECE8DD] p-3.5 shadow-pixel-sm">
                <div className="flex items-center justify-between font-pixel text-xs font-bold text-zinc-900 mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Trophy className="h-3.5 w-3.5 text-amber-600" />
                    <span>{language === 'vi' ? 'THÀNH TÍCH' : 'STATS'}</span>
                  </span>
                  <div className="flex items-center gap-1 bg-zinc-900 p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setStatsGameTab('all')}
                      className={`px-2 py-0.5 font-pixel font-bold ${
                        statsGameTab === 'all' ? 'bg-amber-300 text-zinc-950' : 'text-zinc-300 hover:text-white'
                      }`}
                    >
                      {language === 'vi' ? 'Tất cả' : 'All'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatsGameTab('chess')}
                      className={`px-2 py-0.5 font-pixel font-bold ${
                        statsGameTab === 'chess' ? 'bg-amber-300 text-zinc-950' : 'text-zinc-300 hover:text-white'
                      }`}
                    >
                      {language === 'vi' ? 'Cờ vua' : 'Chess'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setStatsGameTab('caro')}
                      className={`px-2 py-0.5 font-pixel font-bold ${
                        statsGameTab === 'caro' ? 'bg-amber-300 text-zinc-950' : 'text-zinc-300 hover:text-white'
                      }`}
                    >
                      {language === 'vi' ? 'Caro' : 'Caro'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-1.5 text-center">
                  <div className="bg-white p-2 border-2 border-zinc-900">
                    <p className="font-pixel text-sm sm:text-base font-bold text-indigo-700">{currentStatData.wins}</p>
                    <p className="text-[10px] font-mono text-zinc-600 font-bold">
                      {language === 'vi' ? 'Thắng' : 'Wins'}
                    </p>
                  </div>
                  <div className="bg-white p-2 border-2 border-zinc-900">
                    <p className="font-pixel text-sm sm:text-base font-bold text-rose-600">{currentStatData.losses}</p>
                    <p className="text-[10px] font-mono text-zinc-600 font-bold">
                      {language === 'vi' ? 'Thua' : 'Losses'}
                    </p>
                  </div>
                  <div className="bg-white p-2 border-2 border-zinc-900">
                    <p className="font-pixel text-sm sm:text-base font-bold text-emerald-700">{currentStatData.rate}%</p>
                    <p className="text-[10px] font-mono text-zinc-600 font-bold">
                      {language === 'vi' ? 'Tỉ lệ' : 'Win%'}
                    </p>
                  </div>
                  <div className="bg-white p-2 border-2 border-zinc-900">
                    <p className="font-pixel text-sm sm:text-base font-bold text-amber-600 flex items-center justify-center gap-0.5">
                      <Flame className="h-3 w-3 fill-amber-500 text-amber-500" />
                      {currentStatData.streak}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-600 font-bold">
                      {language === 'vi' ? 'Chuỗi' : 'Streak'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Feedback Message */}
              {profileSuccessMsg && (
                <div className="flex items-center gap-2 bg-emerald-100 border-2 border-zinc-900 p-2.5 text-xs font-mono font-bold text-emerald-950 animate-fade-in">
                  <Check className="h-4 w-4 shrink-0" />
                  <span>{profileSuccessMsg}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="pixel-btn flex-1 bg-white py-2.5 text-xs font-bold text-zinc-800 hover:bg-zinc-100"
                >
                  {language === 'vi' ? 'ĐÓNG' : 'CLOSE'}
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile || !tempName.trim()}
                  className="pixel-btn flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 py-2.5 text-xs font-bold text-amber-300 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {isSavingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  <span>{language === 'vi' ? 'LƯU HỒ SƠ' : 'SAVE PROFILE'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Authenticated Account View */}
              {!isAnonymous ? (
                <div className="space-y-4">
                  <div className="border-2 border-zinc-900 bg-emerald-100 p-4 shadow-pixel-sm">
                    <div className="flex items-center gap-2 text-emerald-950 font-pixel font-bold text-sm mb-1">
                      <ShieldCheck className="h-4 w-4" />
                      <span>{language === 'vi' ? 'TÀI KHOẢN ĐÃ LIÊN KẾT' : 'LINKED CLOUD ACCOUNT'}</span>
                    </div>
                    <p className="text-xs font-mono text-emerald-900 leading-relaxed">
                      {language === 'vi'
                        ? 'Dữ liệu thành tích và thông tin của bạn đang được đồng bộ đám mây an toàn.'
                        : 'Your stats and profile are safely synced to the cloud.'}
                    </p>
                    <div className="mt-3 text-xs font-mono font-bold text-zinc-900 bg-white p-2.5 border-2 border-zinc-900">
                      <span className="text-zinc-500">Email: </span>
                      <span>{user?.email}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="pixel-btn w-full flex items-center justify-center gap-2 bg-rose-100 py-2.5 text-xs font-bold text-rose-800 hover:bg-rose-200"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{language === 'vi' ? 'ĐĂNG XUẤT TÀI KHOẢN' : 'SIGN OUT'}</span>
                  </button>
                </div>
              ) : (
                /* Anonymous / Upgrade Account View */
                <div>
                  <div className="mb-4 border-2 border-zinc-900 bg-indigo-50 p-3.5 text-xs text-indigo-950 shadow-pixel-xs">
                    <div className="flex items-center gap-1.5 font-pixel font-bold mb-1">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-700" />
                      <span>
                        {language === 'vi'
                          ? 'NÂNG CẤP LÊN TÀI KHOẢN CLOUD'
                          : 'UPGRADE TO CLOUD SAVE'}
                      </span>
                    </div>
                    <p className="text-[11px] font-mono text-indigo-900 leading-relaxed">
                      {language === 'vi'
                        ? 'Đăng ký giúp bạn giữ lại thành tích, chuỗi thắng và tên hiển thị khi đổi thiết bị.'
                        : 'Registering preserves your game records, win streak, and name across devices.'}
                    </p>
                  </div>

                  {/* Switch between Sign In & Sign Up */}
                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className={`pixel-btn py-1.5 text-xs font-bold ${authMode === 'signin'
                          ? 'bg-indigo-600 text-amber-300'
                          : 'bg-white text-zinc-700 hover:bg-zinc-100'
                        }`}
                    >
                      {language === 'vi' ? 'ĐĂNG NHẬP' : 'SIGN IN'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setAuthError(null);
                        setAuthSuccess(null);
                      }}
                      className={`pixel-btn py-1.5 text-xs font-bold ${authMode === 'signup'
                          ? 'bg-indigo-600 text-amber-300'
                          : 'bg-white text-zinc-700 hover:bg-zinc-100'
                        }`}
                    >
                      {language === 'vi' ? 'ĐĂNG KÝ MỚI' : 'REGISTER'}
                    </button>
                  </div>

                  <form onSubmit={handleEmailAuth} className="space-y-3">
                    <div>
                      <label className="block font-pixel text-xs font-bold text-zinc-800 mb-1">EMAIL</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <Mail className="h-4 w-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tenban@example.com"
                          className="pixel-input w-full bg-white pl-9 pr-3 py-2 text-xs font-bold text-zinc-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-pixel text-xs font-bold text-zinc-800 mb-1">
                        {language === 'vi' ? 'MẬT KHẨU' : 'PASSWORD'}
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                          <Lock className="h-4 w-4" />
                        </div>
                        <input
                          type="password"
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="pixel-input w-full bg-white pl-9 pr-3 py-2 text-xs font-bold text-zinc-900"
                        />
                      </div>
                    </div>

                    {authMode === 'signup' && (
                      <div>
                        <label className="block font-pixel text-xs font-bold text-zinc-800 mb-1">
                          {language === 'vi' ? 'XÁC NHẬN MẬT KHẨU' : 'CONFIRM PASSWORD'}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-500">
                            <Lock className="h-4 w-4" />
                          </div>
                          <input
                            type="password"
                            required
                            minLength={6}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="pixel-input w-full bg-white pl-9 pr-3 py-2 text-xs font-bold text-zinc-900"
                          />
                        </div>
                      </div>
                    )}

                    {authError && (
                      <div className="flex items-center gap-1.5 bg-rose-100 p-2.5 text-xs font-mono font-bold text-rose-900 border-2 border-zinc-900">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{authError}</span>
                      </div>
                    )}

                    {authSuccess && (
                      <div className="flex items-center gap-1.5 bg-emerald-100 p-2.5 text-xs font-mono font-bold text-emerald-950 border-2 border-zinc-900">
                        <Check className="h-4 w-4 shrink-0" />
                        <span>{authSuccess}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="pixel-btn w-full inline-flex items-center justify-center gap-2 bg-indigo-600 py-2.5 text-xs font-bold text-amber-300 hover:bg-indigo-500 disabled:opacity-50"
                    >
                      {authLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      <span>
                        {authMode === 'signin'
                          ? language === 'vi'
                            ? 'ĐĂNG NHẬP'
                            : 'SIGN IN'
                          : language === 'vi'
                            ? 'TẠO TÀI KHOẢN'
                            : 'CREATE ACCOUNT'}
                      </span>
                    </button>
                  </form>

                  {/* Google OAuth Option */}
                  <div className="mt-4 pt-3 border-t-2 border-dashed border-zinc-300">
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={authLoading}
                      className="pixel-btn w-full flex items-center justify-center gap-2 bg-white py-2 text-xs font-bold text-zinc-900 hover:bg-zinc-50"
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
                        {language === 'vi' ? 'TIẾP TỤC VỚI GOOGLE' : 'CONTINUE WITH GOOGLE'}
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

