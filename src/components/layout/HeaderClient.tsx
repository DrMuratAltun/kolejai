
"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { School, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import type { Page } from "@/services/pageService";
import type { SiteSettings } from "@/services/settingsService";

export type NavItem = {
  page: Page;
  children: NavItem[];
};

interface HeaderClientProps {
    dynamicNavItems: NavItem[];
    settings: SiteSettings;
}

const getHref = (page: Page): string => {
    if (page.type === 'link') return page.href || '#';
    if (page.type === 'page') return `/p/${page.slug}`;
    return '#'; // For containers
}

const ListItem = React.forwardRef<
  React.ElementRef<typeof Link>,
  React.ComponentPropsWithoutRef<typeof Link>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";


export default function HeaderClient({ dynamicNavItems, settings }: HeaderClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  
  // Header is transparent only if on homepage AND banner is shown.
  const isHeaderTransparent = isHomePage && settings.showHeroBanner;

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        isHeaderTransparent ? "bg-transparent" : "bg-background/90 backdrop-blur-sm shadow-md"
      )}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 text-xl font-bold",
              isHeaderTransparent ? "text-white" : "text-primary"
            )}
          >
            {settings.logoUrl ? (
                <div className="relative h-14 w-40 flex-shrink-0">
                    <Image 
                        src={settings.logoUrl} 
                        alt={settings.schoolName} 
                        fill
                        sizes="(max-width: 768px) 100px, 160px"
                        className={cn(
                            'rounded-md',
                            settings.logoDisplayMode === 'contain' ? 'object-contain' : 'object-cover'
                        )}
                    />
                </div>
            ) : (
                <School className="h-8 w-8" />
            )}
            {settings.showSchoolNameInHeader && <span>{settings.schoolName}</span>}
          </Link>
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {dynamicNavItems.map(item => (
                  <NavigationMenuItem key={item.page.id}>
                    {item.children.length > 0 ? (
                      <>
                        <NavigationMenuTrigger className={cn(isHeaderTransparent && "bg-transparent text-white hover:bg-white/10")}>
                            {item.page.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1">
                            {item.children.map(childItem => (
                               <ListItem key={childItem.page.id} href={getHref(childItem.page)} title={childItem.page.title}>
                                 {/* Description could go here if available */}
                               </ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link href={getHref(item.page)} className={cn(navigationMenuTriggerStyle(), isHeaderTransparent && "bg-transparent text-white hover:bg-white/10")}>
                          {item.page.title}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                ))}

              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button asChild className={cn(isHeaderTransparent && "bg-white text-primary hover:bg-white/90")}>
              <Link href="/contact">Kayıt Ol</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon" className={cn(isHeaderTransparent && "text-white border-white hover:bg-white/10 hover:text-white")}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Menüyü aç/kapat</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="md:hidden animate-in fade-in-20 slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-1 border-t bg-background p-4">
            {dynamicNavItems.map((item) => (
              <React.Fragment key={item.page.id}>
                <Link href={getHref(item.page)} className="w-full rounded-md p-3 text-left font-medium transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setIsOpen(false)}>
                  {item.page.title}
                </Link>
                {item.children.length > 0 && (
                  <div className="pl-6 flex flex-col gap-1">
                    {item.children.map(childItem => (
                       <Link key={childItem.page.id} href={getHref(childItem.page)} className="w-full rounded-md p-2 text-left font-medium text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setIsOpen(false)}>
                         - {childItem.page.title}
                       </Link>
                    ))}
                  </div>
                )}
              </React.Fragment>
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
