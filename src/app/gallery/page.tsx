import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { getGalleryItems } from "@/services/galleryService";

export default async function GalleryPage() {
  const photos = await getGalleryItems();

  return (
    <div className="container mx-auto px-4 pb-16 pt-28 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Okul Hayatımızdan Kareler</h1>
        <div className="w-20 h-1 bg-primary mx-auto"></div>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-6">Okulumuzdaki renkli anları, etkinlikleri ve öğrencilerimizin başarılarını yansıtan fotoğraf galerimiz.</p>
      </div>
      
      {photos.length === 0 ? (
        <div className="text-center text-muted-foreground">
          <p>Şu anda gösterilecek fotoğraf bulunmamaktadır.</p>
          <p>Lütfen admin panelinden galeriye fotoğraf ekleyiniz.</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
