'use client'

import { usePathname } from 'next/navigation';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import VisitorChatbot from '@/components/chat/VisitorChatbot';

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen">
          <Header />
          <div className="flex-grow">
            <main>{children}</main>
          </div>
          <Footer />
          <VisitorChatbot />
        </div>
    )
}
