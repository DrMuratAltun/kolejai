import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ConditionalLayout from '@/components/layout/ConditionalLayout';

export const metadata: Metadata = {
  title: 'Bilge Yıldız Koleji - Geleceğin Liderlerini Yetiştiriyoruz',
  description: 'Öğrencilerimize akademik başarının yanı sıra sosyal ve duygusal gelişimlerini destekleyen bir eğitim ortamı sunuyoruz.',
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
        <ConditionalLayout>{children}</ConditionalLayout>
        <Toaster />
      </body>
    </html>
  );
}
