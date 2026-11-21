import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { Header } from '@/components/Header';
import { AchievementToast } from '@/features/achievements/AchievementToast';
import { BgmController } from '@/components/BgmController';
import { PwaManager } from '@/components/PwaManager';

export const metadata: Metadata = {
  title: 'Kombat - Sảnh Mini-Game Indie (Neo-Arcade 16-Bit)',
  description: 'Sảnh trò chơi ngắn phong cách Pixel Arcade 16-bit, chơi mượt mà trên di động và máy tính.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kombat',
  },
};

export const viewport: Viewport = {
  themeColor: '#18181B',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,400..800;1,400..800&family=Pixelify+Sans:wght@400..700&display=swap"
          rel="stylesheet"
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      </head>
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#F4F1EA] text-[#18181B] antialiased">
        <AuthProvider>
          <LanguageProvider>
            <BgmController />
            <AchievementToast />
            <Header />
            <PwaManager />
            <main className="flex-1">{children}</main>
            <footer className="border-t-2 border-zinc-900 bg-zinc-900 py-6 text-center text-xs text-zinc-300 font-pixel">
              <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="inline-block h-2.5 w-2.5 bg-emerald-400 border border-zinc-950 animate-pulse" />
                  <p className="tracking-wider font-bold text-amber-400">
                    &copy; {new Date().getFullYear()} KOMBAT ARCADE SYSTEM [16-BIT EDITION]
                  </p>
                </div>
                <p className="text-zinc-400 font-mono text-[11px] uppercase tracking-wider">
                  INSERT COIN &bull; MOBILE-FIRST &bull; INSTANT PLAY
                </p>
              </div>
            </footer>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
