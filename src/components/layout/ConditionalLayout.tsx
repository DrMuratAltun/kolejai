'use client'

import { usePathname } from 'next/navigation';
import HeaderClient from "@/components/layout/HeaderClient";
import Footer from "@/components/layout/Footer";
import VisitorChatbot from '@/components/chat/VisitorChatbot';
import type { NavItem } from './HeaderClient';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  dynamicNavItems: NavItem[];
}

export default function ConditionalLayout({ children, dynamicNavItems }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen">
          <HeaderClient dynamicNavItems={dynamicNavItems} />
          <div className="flex-grow">
            <main>{children}</main>
          </div>
          <Footer />
          <VisitorChatbot />
        </div>
    )
}
