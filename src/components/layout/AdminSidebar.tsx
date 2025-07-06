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
  SidebarFooter,
  SidebarGroup,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Bot,
  Newspaper,
  GalleryHorizontal,
  Mail,
  School,
  LogOut,
} from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";

const menuItems = [
  { href: "/admin/dashboard", label: "Gösterge Paneli", icon: LayoutDashboard },
  { href: "/admin/chatbot", label: "Yönetici Chatbot", icon: Bot },
  { href: "#", label: "Haber Yönetimi", icon: Newspaper },
  { href: "#", label: "Galeri Yönetimi", icon: GalleryHorizontal },
  { href: "#", label: "Gelen Formlar", icon: Mail },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar>
      <SidebarHeader>
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <School className="h-7 w-7" />
          <span className="group-data-[collapsible=icon]:hidden">Bilge Yıldız</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(item.href)}
                tooltip={{ children: item.label }}
              >
                <Link href={item.href}>
                  <item.icon />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarGroup>
           <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 group-data-[collapsible=icon]:h-10 group-data-[collapsible=icon]:w-10">
                  <AvatarImage src="https://placehold.co/100x100.png" alt="Admin" data-ai-hint="person avatar" />
                  <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                  <span className="font-semibold text-sm">Admin User</span>
                  <span className="text-xs text-muted-foreground">admin@bilgeyildiz.com</span>
              </div>
              <Button variant="ghost" size="icon" className="ml-auto group-data-[collapsible=icon]:hidden">
                  <LogOut className="h-4 w-4" />
              </Button>
           </div>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
}
