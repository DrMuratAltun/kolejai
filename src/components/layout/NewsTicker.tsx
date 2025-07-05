"use client";

import Link from "next/link";
import Marquee from "react-fast-marquee";
import { Newspaper, CalendarDays, Megaphone } from "lucide-react";

interface TickerItem {
  type: string;
  title: string;
  href: string;
}

interface NewsTickerProps {
  items: TickerItem[];
}

const TickerIcon = ({ type }: { type: string }) => {
  if (type === 'Haber') return <Newspaper className="h-4 w-4 mr-2 flex-shrink-0" />;
  if (type === 'Etkinlik') return <CalendarDays className="h-4 w-4 mr-2 flex-shrink-0" />;
  if (type === 'Duyuru') return <Megaphone className="h-4 w-4 mr-2 flex-shrink-0" />;
  return null;
}

export default function NewsTicker({ items }: NewsTickerProps) {
  if (!items || items.length === 0) {
    return null;
  }
  
  const displayItems = items.length < 5 ? [...items, ...items, ...items] : items;

  return (
    <div className="bg-secondary text-secondary-foreground border-b">
      <Marquee pauseOnHover={true} speed={40}>
        <div className="flex">
          {displayItems.map((item, index) => (
            <Link href={item.href} key={index} className="flex items-center mx-8 py-2 whitespace-nowrap text-sm font-medium hover:text-primary transition-colors">
              <TickerIcon type={item.type} />
              <span className="font-bold mr-2">{item.type}:</span>
              <span>{item.title}</span>
            </Link>
          ))}
        </div>
      </Marquee>
    </div>
  );
}
