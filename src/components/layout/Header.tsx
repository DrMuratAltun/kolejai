"use client";

import { useState } from "react";
import Link from "next/link";
import { School, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navLinks = [
  { href: "/", label: "Anasayfa" },
  { href: "/#hakkimizda", label: "Hakkımızda" },
  { href: "/staff", label: "Kadromuz" },
  { href: "/gallery", label: "Galeri" },
  { href: "/contact", label: "İletişim" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-sm shadow-md">
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-2xl font-bold text-primary"
          >
            <School className="h-8 w-8" />
            <span>Bilge Yıldız Koleji</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-medium text-foreground/80 transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:block">
            <Button asChild>
              <Link href="/contact">Kayıt Ol</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon">
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Menüyü aç/kapat</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="md:hidden animate-in fade-in-20 slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-1 border-t bg-background p-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-full rounded-md p-3 text-left font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                onClick={() => setIsOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Button asChild className="w-full mt-2">
              <Link href="/contact" onClick={() => setIsOpen(false)}>
                Kayıt Ol
              </Link>
            </Button>
          </nav>
        </CollapsibleContent>
      </header>
    </Collapsible>
  );
}
