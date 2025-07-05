"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const photos = [
  { id: 1, src: "https://placehold.co/600x400.png", alt: "Bilim Fuarı'ndan bir kare", aiHint: "science fair" },
  { id: 2, src: "https://placehold.co/600x400.png", alt: "Bahar Şenliği coşkusu", aiHint: "school festival" },
  { id: 3, src: "https://placehold.co/600x400.png", alt: "Mezuniyet Töreni", aiHint: "graduation ceremony" },
  { id: 4, src: "https://placehold.co/600x400.png", alt: "Spor Müsabakaları", aiHint: "sports day" },
  { id: 5, src: "https://placehold.co/600x400.png", alt: "Resim Sergisi", aiHint: "art exhibition" },
  { id: 6, src: "https://placehold.co/600x400.png", alt: "Okul Gezisi", aiHint: "school trip" },
  { id: 7, src: "https://placehold.co/600x400.png", alt: "Kodlama Atölyesi", aiHint: "coding workshop" },
  { id: 8, src: "https://placehold.co/600x400.png", alt: "Müzik Dinletisi", aiHint: "music concert" },
  { id: 9, src: "https://placehold.co/600x400.png", alt: "Laboratuvar çalışması", aiHint: "science laboratory" },
  { id: 10, src: "https://placehold.co/600x400.png", alt: "Sınıf içi etkinlik", aiHint: "classroom activity" },
  { id: 11, src: "https://placehold.co/600x400.png", alt: "Okul bahçesi", aiHint: "school playground" },
  { id: 12, src: "https://placehold.co/600x400.png", alt: "Tiyatro gösterisi", aiHint: "school play" },
];


export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 pb-16 pt-28 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Okul Hayatımızdan Kareler</h1>
        <div className="w-20 h-1 bg-primary mx-auto"></div>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-6">Okulumuzdaki renkli anları, etkinlikleri ve öğrencilerimizin başarılarını yansıtan fotoğraf galerimiz.</p>
      </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id} className="overflow-hidden group rounded-xl shadow-lg transform transition-transform duration-300 hover:-translate-y-2">
            <CardContent className="p-0">
              <Image
                src={photo.src}
                alt={photo.alt}
                width={600}
                height={400}
                className="aspect-video object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                data-ai-hint={photo.aiHint}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
