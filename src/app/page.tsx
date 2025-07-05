import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Megaphone, Newspaper, Calendar } from "lucide-react";

const announcements = [
  {
    title: "2024-2025 Eğitim Yılı Kayıtları Başladı",
    date: "15.08.2024",
    content: "Yeni dönem kayıtlarımız için kontenjanlarımız dolmadan yerinizi ayırtın. Detaylı bilgi için okulumuzu ziyaret edebilirsiniz.",
    image: "https://placehold.co/600x400.png",
    aiHint: "school registration",
  },
  {
    title: "Yaz Okulu Programı Açıklandı",
    date: "10.06.2024",
    content: "Öğrencilerimiz için eğlence ve öğrenme dolu yaz okulu programımız hazır. Spor, sanat ve bilim atölyeleriyle dolu bir yaz sizi bekliyor.",
    image: "https://placehold.co/600x400.png",
    aiHint: "summer school",
  },
  {
    title: "Veli Toplantısı Duyurusu",
    date: "01.06.2024",
    content: "Tüm velilerimiz, 15 Haziran Cumartesi günü yapılacak olan genel veli toplantımıza davetlidir.",
    image: "https://placehold.co/600x400.png",
    aiHint: "parent meeting",
  },
];

const newsAndEvents = [
  {
    id: 1,
    type: "Haber",
    title: "Bilim Fuarımız Büyük İlgi Gördü",
    description: "Öğrencilerimizin yıl boyunca hazırladığı projeler, bilim fuarımızda sergilendi ve ziyaretçilerden tam not aldı.",
    image: "https://placehold.co/600x400.png",
    aiHint: "science fair",
  },
  {
    id: 2,
    type: "Etkinlik",
    title: "Geleneksel Bahar Şenliği",
    description: "Okul bahçemizde düzenlediğimiz bahar şenliğinde öğrencilerimiz ve velilerimizle keyifli bir gün geçirdik.",
    image: "https://placehold.co/600x400.png",
    aiHint: "school festival",
  },
  {
    id: 3,
    type: "Haber",
    title: "Satranç Turnuvası Şampiyonları Belli Oldu",
    description: "İlçemizde düzenlenen okullar arası satranç turnuvasında öğrencilerimiz büyük bir başarıya imza attı.",
    image: "https://placehold.co/600x400.png",
    aiHint: "chess tournament",
  },
  {
    id: 4,
    type: "Etkinlik",
    title: "Tiyatro Kulübü Yıl Sonu Gösterisi",
    description: "Tiyatro kulübümüzün sahnelediği 'Hayal Perdesi' adlı oyun, izleyicilerden büyük alkış topladı.",
    image: "https://placehold.co/600x400.png",
    aiHint: "school play",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      {/* Hero Section */}
      <section className="w-full bg-gradient-to-br from-primary via-blue-500 to-accent text-primary-foreground">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-2 items-center gap-8 px-4 py-20 md:py-28">
          <div className="space-y-6 text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight">
              Geleceğe Açılan Kapı: Akıllı Okul
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90">
              Modern eğitim anlayışımız, teknolojik altyapımız ve uzman kadromuzla öğrencilerinizi geleceğe hazırlıyoruz.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button asChild size="lg" className="bg-white text-blue-700 hover:bg-white/90">
                <Link href="/contact">Kayıt Olun</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10 hover:text-white">
                <Link href="/staff">Kadromuz</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center items-center">
            <Image
              src="https://placehold.co/500x500.png"
              alt="Mutlu öğrenciler"
              width={500}
              height={500}
              className="rounded-full shadow-2xl aspect-square object-cover"
              data-ai-hint="happy students"
            />
          </div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Duyurular</h2>
            <p className="text-muted-foreground mt-2">Okulumuzdan en son haberler ve önemli bilgilendirmeler.</p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {announcements.map((announcement, index) => (
                <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="flex flex-col h-full transform hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-xl overflow-hidden">
                       <Image
                        src={announcement.image}
                        alt={announcement.title}
                        width={600}
                        height={400}
                        className="w-full h-48 object-cover"
                        data-ai-hint={announcement.aiHint}
                      />
                      <CardHeader>
                        <Badge variant={"outline"} className="w-fit bg-primary/20 text-primary mb-2 flex items-center gap-1 border-primary/50">
                            <Megaphone className="h-4 w-4" />
                            Duyuru
                        </Badge>
                        <CardTitle>{announcement.title}</CardTitle>
                        <CardDescription>{announcement.date}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{announcement.content}</p>
                      </CardContent>
                      <CardFooter>
                         <Button variant="link" className="p-0 text-primary">
                           Devamını Oku <ArrowRight className="ml-2 h-4 w-4" />
                         </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      </section>

      {/* News and Events Section */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Haberler & Etkinlikler</h2>
            <p className="text-muted-foreground mt-2">Okulumuzda gerçekleşen renkli etkinlikler ve başarı dolu haberler.</p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full"
          >
            <CarouselContent>
              {newsAndEvents.map((item) => (
                <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1 h-full">
                    <Card className="flex flex-col h-full transform hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-xl overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={600}
                        height={400}
                        className="w-full h-48 object-cover"
                        data-ai-hint={item.aiHint}
                      />
                      <CardHeader>
                        <Badge variant={item.type === 'Haber' ? 'default' : 'secondary'} className="w-fit bg-accent text-accent-foreground mb-2 flex items-center gap-1">
                          {item.type === 'Haber' ? <Newspaper className="h-4 w-4" /> : <Calendar className="h-4 w-4" />}
                          {item.type}
                        </Badge>
                        <CardTitle>{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2" />
            <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2" />
          </Carousel>
        </div>
      </section>
    </div>
  );
}
