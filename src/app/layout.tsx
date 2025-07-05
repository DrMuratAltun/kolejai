import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VisitorChatbot from '@/components/chat/VisitorChatbot';
import BackToTop from '@/components/BackToTop';

export const metadata: Metadata = {
  title: 'Akilli Okul Web',
  description: 'Modern, hızlı, estetik ve mobil uyumlu akıllı eğitim platformu',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
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
          <main className="flex-grow pt-20">{children}</main>
          <Footer />
        </div>
        <VisitorChatbot />
        <BackToTop />
        <Toaster />
      </body>
    </html>
  );
}
