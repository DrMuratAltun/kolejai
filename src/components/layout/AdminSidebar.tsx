
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Newspaper,
  Files,
  GalleryHorizontal,
  User,
  School,
  Mail,
  Users,
  Wand2,
  Settings
} from "lucide-react";

const mainMenuItems = [
  { href: "/admin/dashboard", label: "Ana Panel", icon: LayoutDashboard },
];

const contentMenuItems = [
    { href: "/admin/news", label: "Haber, Duyuru, Etkinlik", icon: Newspaper },
    { href: "/admin/pages", label: "Sayfalar & Menü", icon: Files },
    { href: "/admin/page-generator", label: "AI Sayfa Oluşturucu", icon: Wand2 },
    { href: "/admin/gallery", label: "Galeri", icon: GalleryHorizontal },
    { href: "/admin/staff", label: "Personel", icon: Users },
    { href: "#", label: "Müdür Mesajı", icon: User, disabled: true },
    { href: "#", label: "Kurumlarımız", icon: School, disabled: true },
    { href: "/admin/submissions", label: "İletişim Formları", icon: Mail },
];

const settingsMenuItems = [
    { href: "/admin/settings", label: "Site Ayarları", icon: Settings }
]


export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-lg group-data-[collapsible=icon]:p-1.5">
            <School className="h-6 w-6 text-primary" />
          </div>
          <span className="text-xl font-semibold text-white group-data-[collapsible=icon]:hidden">Yönetici Paneli</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {mainMenuItems.map((item) => (
             <SidebarMenuItem key={item.label}>
              <SidebarMenuButton asChild isActive={pathname === item.href} tooltip={{ children: item.label }}>
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        
        <SidebarGroup>
            <SidebarGroupLabel>İÇERİK YÖNETİMİ</SidebarGroupLabel>
            <SidebarGroupContent>
                 <SidebarMenu>
                     {contentMenuItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton asChild isActive={!item.disabled && pathname.startsWith(item.href)} disabled={item.disabled} tooltip={{ children: item.label }}>
                            <Link href={item.href}>
                            <item.icon />
                            <span>{item.label}</span>
                            </Link>
                        </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                 </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
            <SidebarGroupLabel>SİTE YÖNETİMİ</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {settingsMenuItems.map((item) => (
                        <SidebarMenuItem key={item.label}>
                            <SidebarMenuButton asChild isActive={pathname.startsWith(item.href)} tooltip={{ children: item.label }}>
                                <Link href={item.href}>
                                    <item.icon />
                                    <span>{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>
    </Sidebar>
  );
}
