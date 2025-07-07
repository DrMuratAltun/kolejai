"use client";

import * as React from "react";
import { usePathname } from 'next/navigation';
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminHeader from "@/components/layout/AdminHeader";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Bot } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Do not render the main admin layout for the login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-muted/40">
        <AdminSidebar />
        <SidebarInset>
            <AdminHeader />
            <main className="relative flex-1 p-4 lg:p-8 pt-6 h-[calc(100vh-64px)]">
              {children}
            </main>
            <div className="fixed bottom-6 right-8 z-50 group">
              <Button asChild size="icon" className="h-16 w-16 rounded-full shadow-lg bg-slate-900 hover:bg-slate-700">
                  <Link href="/admin/chatbot">
                    <Bot className="h-8 w-8"/>
                    <span className="sr-only">Admin Chatbot</span>
                  </Link>
              </Button>
              <div className="absolute -top-1 -right-2 pointer-events-none">
                  <span className="flex h-5 w-auto min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 text-xs text-white font-bold">
                      ADMIN
                  </span>
              </div>
            </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
