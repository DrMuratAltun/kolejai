import Link from "next/link";
import { getMenuPages, Page } from "@/services/pageService";
import HeaderClient from "./HeaderClient";

export type NavItem = {
  page: Page;
  children: NavItem[];
};

export default async function Header() {
  const flatPages = await getMenuPages();

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

    return rootItems;
  };

  const menuTree = buildMenuTree(flatPages);
  
  const staticLinks = [
    { title: "Anasayfa", href: "/" },
    { title: "Hakkımızda", href: "/#hakkimizda" },
    { title: "Kadromuz", href: "/staff" },
    { title: "Galeri", href: "/gallery" },
  ];

  return (
    <HeaderClient staticLinks={staticLinks} dynamicNavItems={menuTree} />
  );
}
