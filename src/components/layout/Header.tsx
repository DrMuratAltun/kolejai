"use client";

import { useState } from "react";
import Link from "next/link";
import { School, Home, Users, GalleryHorizontal, Mail, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const navLinks = [
  { href: "/", label: "Anasayfa", icon: Home },
  { href: "/staff", label: "Kadromuz", icon: Users },
  { href: "/gallery", label: "Galeri", icon: GalleryHorizontal },
  { href: "/contact", label: "İletişim", icon: Mail },
];

export default function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm shadow-md">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
          <School className="h-8 w-8" />
          <span>Bilge Yıldız Koleji</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-base font-medium text-foreground/80 transition-colors hover:text-primary">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden md:flex items-center gap-2">
            <Button asChild>
                <Link href="/contact">Kayıt Ol</Link>
            </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <Sheet open={isMenuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Menüyü aç</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
               <SheetTitle className="sr-only">Menü</SheetTitle>
              <div className="flex flex-col h-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary" onClick={() => setMenuOpen(false)}>
                        <School className="h-7 w-7" />
                        <span>Bilge Yıldız Koleji</span>
                    </Link>
                    <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)}>
                        <X className="h-6 w-6" />
                        <span className="sr-only">Menüyü kapat</span>
                    </Button>
                </div>
                <nav className="flex flex-col p-4 space-y-2 mt-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-4 rounded-md p-3 text-lg font-medium hover:bg-accent hover:text-accent-foreground"
                    >
                      <link.icon className="h-6 w-6 text-primary" />
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto p-4 border-t">
                    <Button asChild className="w-full">
                        <Link href="/contact" onClick={() => setMenuOpen(false)}>
                           Kayıt Ol
                        </Link>
                    </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
