
'use client'

import { usePathname } from 'next/navigation';
import HeaderClient from "@/components/layout/HeaderClient";
import Footer from "@/components/layout/Footer";
import VisitorChatbot from '@/components/chat/VisitorChatbot';
import type { NavItem } from './HeaderClient';
import type { SiteSettings } from '@/services/settingsService';

interface ConditionalLayoutProps {
  children: React.ReactNode;
  dynamicNavItems: NavItem[];
  settings: SiteSettings;
}

export default function ConditionalLayout({ children, dynamicNavItems, settings }: ConditionalLayoutProps) {
    const pathname = usePathname();
    const isAdminPage = pathname.startsWith('/admin');

    if (isAdminPage) {
        return <>{children}</>;
    }

    return (
        <div className="flex flex-col min-h-screen">
          <HeaderClient dynamicNavItems={dynamicNavItems} settings={settings} />
          <div className="flex-grow">
            <main>{children}</main>
          </div>
          <Footer settings={settings} />
          <VisitorChatbot />
        </div>
    )
}
