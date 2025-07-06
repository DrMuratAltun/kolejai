"use client";

import React, { useState } from "react";
import Link from "next/link";
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
import type { NavItem } from "./Header";

interface NavLink {
    title: string;
    href: string;
}

interface HeaderClientProps {
    staticLinks: NavLink[];
    dynamicNavItems: NavItem[];
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
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
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";


export default function HeaderClient({ staticLinks, dynamicNavItems }: HeaderClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  return (
    <Collapsible asChild open={isOpen} onOpenChange={setIsOpen}>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-colors duration-300",
        isHomePage ? "bg-transparent" : "bg-background/90 backdrop-blur-sm shadow-md"
      )}>
        <div className="container mx-auto flex h-20 items-center justify-between px-4">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-2 text-2xl font-bold",
              isHomePage ? "text-white" : "text-primary"
            )}
          >
            <School className="h-8 w-8" />
            <span>Bilge Yıldız</span>
          </Link>
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList>
                {staticLinks.map((link) => (
                  <NavigationMenuItem key={link.href}>
                    <Link href={link.href} legacyBehavior passHref>
                      <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), isHomePage && "bg-transparent text-white hover:bg-white/10")}>
                        {link.title}
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                ))}
                
                {dynamicNavItems.map(item => (
                  <NavigationMenuItem key={item.page.id}>
                    {item.children.length > 0 ? (
                      <>
                        <NavigationMenuTrigger className={cn(isHomePage && "bg-transparent text-white hover:bg-white/10")}>
                            {item.page.title}
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                          <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] grid-cols-1">
                            {item.children.map(childItem => (
                               <ListItem key={childItem.page.id} href={`/p/${childItem.page.slug}`} title={childItem.page.title}>
                                 {/* Description could go here if available */}
                               </ListItem>
                            ))}
                          </ul>
                        </NavigationMenuContent>
                      </>
                    ) : (
                      <Link href={`/p/${item.page.slug}`} legacyBehavior passHref>
                        <NavigationMenuLink className={cn(navigationMenuTriggerStyle(), isHomePage && "bg-transparent text-white hover:bg-white/10")}>
                          {item.page.title}
                        </NavigationMenuLink>
                      </Link>
                    )}
                  </NavigationMenuItem>
                ))}

              </NavigationMenuList>
            </NavigationMenu>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <Button asChild className={cn(isHomePage && "bg-white text-primary hover:bg-white/90")}>
              <Link href="/contact">Kayıt Ol</Link>
            </Button>
          </div>
          <div className="md:hidden">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon" className={cn(isHomePage && "text-white border-white hover:bg-white/10 hover:text-white")}>
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                <span className="sr-only">Menüyü aç/kapat</span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>
        <CollapsibleContent className="md:hidden animate-in fade-in-20 slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-1 border-t bg-background p-4">
             {staticLinks.map((link) => (
              <Link key={link.href} href={link.href} className="w-full rounded-md p-3 text-left font-medium transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setIsOpen(false)}>
                {link.title}
              </Link>
            ))}
            {dynamicNavItems.map((item) => (
              <React.Fragment key={item.page.id}>
                <Link href={`/p/${item.page.slug}`} className="w-full rounded-md p-3 text-left font-medium transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setIsOpen(false)}>
                  {item.page.title}
                </Link>
                {item.children.length > 0 && (
                  <div className="pl-6 flex flex-col gap-1">
                    {item.children.map(childItem => (
                       <Link key={childItem.page.id} href={`/p/${childItem.page.slug}`} className="w-full rounded-md p-2 text-left font-medium text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground" onClick={() => setIsOpen(false)}>
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
