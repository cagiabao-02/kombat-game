'use client';

import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import { Download, Share, Smartphone, WifiOff, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_STORAGE_KEY = 'kombat_pwa_install_dismissed_at';
const DISMISS_COOLDOWN_MS = 7 * 24 * 60 * 60 * 1000; // 7 ngày

export function PwaManager() {
  const { language } = useLanguage();
  const [isOnline, setIsOnline] = useState(true);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIosInstallable, setIsIosInstallable] = useState(false);
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Đăng ký Service Worker cho chế độ Offline
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }

    // 2. Theo dõi trạng thái kết nối mạng
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // 3. Kiểm tra xem app đã cài đặt Standalone chưa
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((window.navigator as any).standalone);

    const dismissedAt = Number(localStorage.getItem(DISMISS_STORAGE_KEY) || 0);
    const recentlyDismissed =
      dismissedAt > 0 && Date.now() - dismissedAt < DISMISS_COOLDOWN_MS;

    if (!isStandalone && !recentlyDismissed) {
      setIsDismissed(false);

      // Phát hiện iOS Safari để hiện hướng dẫn 1 chạm
      const ua = window.navigator.userAgent.toLowerCase();
      const isIos = /iphone|ipad|ipod/.test(ua);
      const isSafari = /safari/.test(ua) && !/crios|fxios|edgios/.test(ua);
      if (isIos && isSafari) {
        setIsIosInstallable(true);
      }
    }

    // 4. Bắt sự kiện cài đặt Chrome/Android/Edge
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      if (!recentlyDismissed && !isStandalone) {
        setIsDismissed(false);
      }
    };

    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsIosInstallable(false);
      setIsDismissed(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setDeferredPrompt(null);
        setIsDismissed(true);
      }
      return;
    }

    if (isIosInstallable) {
      setShowIosGuide((prev) => !prev);
    }
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    setShowIosGuide(false);
    try {
      localStorage.setItem(DISMISS_STORAGE_KEY, String(Date.now()));
    } catch {}
  };

  const canShowInstallBanner =
    !isDismissed && (Boolean(deferredPrompt) || isIosInstallable);

  return (
    <>
      {/* Thanh thông báo Offline khi mất mạng */}
      {!isOnline && (
        <div className="sticky top-16 z-30 w-full border-b-2 border-zinc-900 bg-amber-300 px-3 py-1.5 text-center font-pixel text-[11px] font-bold text-zinc-950 shadow-sm">
          <div className="mx-auto flex max-w-5xl items-center justify-center gap-1.5">
            <WifiOff className="h-3.5 w-3.5 shrink-0" />
            <span>
              {language === 'vi'
                ? 'ĐANG NGOẠI TUYẾN (OFFLINE) — Các game 1 người & Chơi đôi vẫn hoạt động mượt mà!'
                : 'OFFLINE MODE — Single-player & Pass & Play games remain fully playable!'}
            </span>
          </div>
        </div>
      )}

      {/* Banner Cài đặt App 1-Chạm (Add to Home Screen) */}
      {canShowInstallBanner && (
        <div className="fixed bottom-3 right-3 left-3 sm:left-auto sm:max-w-sm z-40 animate-in slide-in-from-bottom-4 duration-200 select-none">
          <div className="pixel-box bg-[#FFFDF8] border-3 border-zinc-900 p-3 shadow-[4px_4px_0px_#000] space-y-2.5">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-indigo-600 font-pixel text-sm font-bold text-amber-300 border-2 border-zinc-900">
                  KB
                </div>
                <div>
                  <p className="font-pixel text-xs font-black text-zinc-950 uppercase">
                    {language === 'vi'
                      ? 'CÀI ĐẶT APP KOMBAT'
                      : 'INSTALL KOMBAT APP'}
                  </p>
                  <p className="text-[11px] font-mono text-zinc-600 leading-snug">
                    {language === 'vi'
                      ? 'Mở nhanh từ màn hình chính & chơi Offline!'
                      : 'Launch from home screen & play Offline!'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleDismiss}
                className="p-1 text-zinc-500 hover:text-zinc-900"
                aria-label="Đóng"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {showIosGuide && isIosInstallable ? (
              <div className="bg-amber-50 border-2 border-zinc-900 p-2.5 text-[11px] font-mono text-zinc-800 space-y-1">
                <p className="font-bold flex items-center gap-1">
                  <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                  <span>
                    {language === 'vi'
                      ? 'Hướng dẫn cài trên iPhone / iPad:'
                      : 'How to install on iPhone / iPad:'}
                  </span>
                </p>
                <p className="flex items-center gap-1">
                  <span>1.</span>
                  <span>
                    {language === 'vi' ? 'Nhấn nút Chia sẻ' : 'Tap Share icon'}
                  </span>
                  <Share className="h-3.5 w-3.5 text-sky-600 inline" />
                  <span>
                    {language === 'vi' ? 'ở thanh dưới Safari.' : 'in Safari bar.'}
                  </span>
                </p>
                <p>
                  {language === 'vi'
                    ? '2. Chọn "Thêm vào MH chính" (Add to Home Screen).'
                    : '2. Select "Add to Home Screen".'}
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleInstallClick}
                className="w-full pixel-btn bg-emerald-400 hover:bg-emerald-300 text-zinc-950 py-2 font-pixel text-xs font-black flex items-center justify-center gap-1.5 shadow-[2px_2px_0px_#000]"
              >
                <Download className="h-4 w-4" />
                <span>
                  {language === 'vi'
                    ? 'CÀI ĐẶT NGAY (MIỄN PHÍ)'
                    : 'INSTALL NOW (FREE)'}
                </span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}
