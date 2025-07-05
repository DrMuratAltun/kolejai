import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VisitorChatbot from '@/components/chat/VisitorChatbot';
import NewsTicker from '@/components/layout/NewsTicker';
import { newsAndEvents } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Bilge Yıldız Koleji - Geleceğin Liderlerini Yetiştiriyoruz',
  description: 'Öğrencilerimize akademik başarının yanı sıra sosyal ve duygusal gelişimlerini destekleyen bir eğitim ortamı sunuyoruz.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const tickerItems = newsAndEvents.map(item => ({
    type: item.type,
    title: item.title,
    href: item.href || '#'
  }));

  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow pt-20">
            <NewsTicker items={tickerItems} />
            <main>{children}</main>
          </div>
          <Footer />
        </div>
        <VisitorChatbot />
        <Toaster />
      </body>
    </html>
  );
}
