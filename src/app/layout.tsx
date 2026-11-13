import type { Metadata, Viewport } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { AuthProvider } from '@/features/auth/AuthContext';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Kombat - Sảnh Mini-Game Indie',
  description: 'Sảnh trò chơi ngắn gọn nhẹ, chơi mượt mà trên di động và máy tính.',
  manifest: '/manifest.webmanifest',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Kombat',
  },
};

export const viewport: Viewport = {
  themeColor: '#4F46E5',
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
      <head />
      <body suppressHydrationWarning className="min-h-screen flex flex-col bg-[#F6F7FB] text-[#1F2937] antialiased">
        <AuthProvider>
          <LanguageProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
              <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                <p>&copy; {new Date().getFullYear()} Kombat. Indie game experiment.</p>
                <p className="text-gray-400">Mobile-first &bull; No install &bull; Guest session</p>
              </div>
            </footer>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
