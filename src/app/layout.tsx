
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import ConditionalLayout from '@/components/layout/ConditionalLayout';
import { getMenuPages, type Page } from "@/services/pageService";
import { getSiteSettings, type SiteSettings } from "@/services/settingsService";
import type { NavItem } from "@/components/layout/HeaderClient";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: {
      default: `${settings.schoolName} | Geleceğin Liderlerini Yetiştiriyoruz`,
      template: `%s | ${settings.schoolName}`,
    },
    description: 'Öğrencilerimize akademik başarının yanı sıra sosyal ve duygusal gelişimlerini destekleyen bir eğitim ortamı sunuyoruz.',
  };
}


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [flatPages, settings] = await Promise.all([
    getMenuPages(),
    getSiteSettings()
  ]);

  const buildMenuTree = (pages: Page[]): NavItem[] => {
    const pageMap: { [key: string]: NavItem } = {};
    const rootItems: NavItem[] = [];

    pages.forEach(page => {
      pageMap[page.id] = { page, children: [] };
    });

    pages.forEach(page => {
      if (page.parentId && pageMap[page.parentId]) {
        pageMap[page.parentId].children.push(pageMap[page.id]);
      } else {
        rootItems.push(pageMap[page.id]);
      }
    });

    const sortByMenuOrder = (a: NavItem, b: NavItem) => (a.page.menuOrder || 0) - (b.page.menuOrder || 0);
    rootItems.sort(sortByMenuOrder);
    Object.values(pageMap).forEach(item => item.children.sort(sortByMenuOrder));

    return rootItems;
  };

  const menuTree = buildMenuTree(flatPages);
  
  return (
    <html lang="tr" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <ConditionalLayout 
          key={settings.updatedAt || 'initial'}
          dynamicNavItems={menuTree} 
          settings={settings}
        >
          {children}
        </ConditionalLayout>
        <Toaster />
      </body>
    </html>
  );
}
