"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { NewsItem as NewsItemType } from "@/services/newsService";

interface NewsCarouselProps {
  newsAndEvents: NewsItemType[];
}

export default function NewsCarousel({ newsAndEvents }: NewsCarouselProps) {
  const plugin = React.useRef(
    Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: false })
  );

  if (!newsAndEvents || newsAndEvents.length === 0) {
    return (
        <section className="py-16">
            <div className="container mx-auto px-4 text-center">
                <p className="text-muted-foreground">Şu anda gösterilecek haber veya etkinlik bulunmuyor.</p>
            </div>
        </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <Carousel
          plugins={[plugin.current]}
          className="w-full"
          opts={{
            loop: true,
          }}
        >
          <CarouselContent>
            {newsAndEvents.map((item) => (
              <CarouselItem key={item.id}>
                <Link href={item.href} className="block">
                  <div className="relative h-[400px] md:h-[500px] rounded-xl overflow-hidden group">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                      data-ai-hint={item.aiHint}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute inset-0 flex flex-col justify-end p-8 text-white">
                      <Badge className="w-fit mb-2 bg-primary/80 backdrop-blur-sm border-0">{item.type}</Badge>
                      <h3 className="text-2xl md:text-4xl font-bold leading-tight shadow-lg">
                        {item.title}
                      </h3>
                      <p className="mt-2 max-w-2xl text-primary-foreground/90 shadow-sm">{item.description}</p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
          <CarouselNext className="absolute right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
}
