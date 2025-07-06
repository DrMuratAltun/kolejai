import { useState } from "react";
import Link from "next/link";
import { School, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { getMenuPages } from "@/services/pageService";
import HeaderClient from "./HeaderClient";


export default async function Header() {
  const dynamicPages = await getMenuPages();
  
  const staticLinks = [
    { href: "/", label: "Anasayfa" },
    { href: "/#hakkimizda", label: "Hakkımızda" },
    { href: "/staff", label: "Kadromuz" },
    { href: "/gallery", label: "Galeri" },
  ];

  const dynamicLinks = dynamicPages.map(page => ({
    href: `/p/${page.slug}`,
    label: page.title
  }));
  
  const allLinks = [...staticLinks, ...dynamicLinks, { href: "/contact", label: "İletişim" }];

  return (
    <HeaderClient navLinks={allLinks} />
  );
}
