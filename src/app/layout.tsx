import type { Metadata } from 'next';
import './globals.css';
import { LanguageProvider } from '@/i18n/LanguageContext';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Togame — Sảnh Mini-Game Indie',
  description: 'Sảnh trò chơi ngắn gọn nhẹ, chơi mượt mà trên di động và máy tính.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className="min-h-screen flex flex-col bg-[#F6F7FB] text-[#1F2937] antialiased">
        <LanguageProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
            <div className="mx-auto max-w-5xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
              <p>© {new Date().getFullYear()} Togame. Indie game experiment.</p>
              <p className="text-gray-400">Mobile-first • No install • Guest session</p>
            </div>
          </footer>
        </LanguageProvider>
      </body>
    </html>
  );
}

