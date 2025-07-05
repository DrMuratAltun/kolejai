"use client";

import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Camera, Video } from "lucide-react";

const photos = [
  { id: 1, src: "https://placehold.co/600x400.png", alt: "Bilim Fuarı'ndan bir kare", aiHint: "science fair" },
  { id: 2, src: "https://placehold.co/600x400.png", alt: "Bahar Şenliği coşkusu", aiHint: "school festival" },
  { id: 3, src: "https://placehold.co/600x400.png", alt: "Mezuniyet Töreni", aiHint: "graduation ceremony" },
  { id: 4, src: "https://placehold.co/600x400.png", alt: "Spor Müsabakaları", aiHint: "sports day" },
  { id: 5, src: "https://placehold.co/600x400.png", alt: "Resim Sergisi", aiHint: "art exhibition" },
  { id: 6, src: "https://placehold.co/600x400.png", alt: "Okul Gezisi", aiHint: "school trip" },
  { id: 7, src: "https://placehold.co/600x400.png", alt: "Kodlama Atölyesi", aiHint: "coding workshop" },
  { id: 8, src: "https://placehold.co/600x400.png", alt: "Müzik Dinletisi", aiHint: "music concert" },
];

const videos = [
  { id: 1, src: "https://placehold.co/600x400.png", alt: "Okul Tanıtım Filmi", aiHint: "school building" },
  { id: 2, src: "https://placehold.co/600x400.png", alt: "23 Nisan Gösterileri", aiHint: "children dancing" },
  { id: 3, src: "https://placehold.co/600x400.png", alt: "Öğrenci Röportajları", aiHint: "student interview" },
  { id: 4, src: "https://placehold.co/600x400.png", alt: "Yıl Sonu Tiyatrosu", aiHint: "school play" },
];

export default function GalleryPage() {
  return (
    <div className="container mx-auto px-4 py-16 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Galeri</h1>
        <p className="text-muted-foreground mt-4 text-lg">Okul hayatımızdan en güzel anılar ve keyifli etkinlikler.</p>
      </div>

      <Tabs defaultValue="photos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2 mx-auto">
          <TabsTrigger value="photos" className="flex items-center gap-2"><Camera /> Fotoğraflar</TabsTrigger>
          <TabsTrigger value="videos" className="flex items-center gap-2"><Video /> Videolar</TabsTrigger>
        </TabsList>
        <TabsContent value="photos" className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <Card key={photo.id} className="overflow-hidden group transform hover:-translate-y-1 transition-transform duration-300">
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
        </TabsContent>
        <TabsContent value="videos" className="mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="overflow-hidden group">
                <CardContent className="p-0 relative">
                  <Image
                    src={video.src}
                    alt={video.alt}
                    width={600}
                    height={400}
                    className="aspect-video object-cover w-full h-full"
                    data-ai-hint={video.aiHint}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                     <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:bg-white/50 transition-colors">
                        <Video className="h-8 w-8 text-white" />
                     </div>
                  </div>
                   <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                      <h3 className="text-white font-semibold text-lg">{video.alt}</h3>
                   </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
