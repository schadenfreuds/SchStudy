import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SchStudy • The Sch Suite',
  description: 'YKS 50k & IELTS 7.0+ Oyunlaştırılmış Hazırlık ve Odak Pusulası',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#6366f1',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark">
      <body className="antialiased selection:bg-indigo-500/30 selection:text-indigo-200 bg-[#09090b] text-[#f4f4f5]">
        {children}
      </body>
    </html>
  );
}
