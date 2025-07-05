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
import { Badge } from "@/components/ui/badge";
import { 
    ArrowRight, 
    Newspaper, 
    Calendar,
    CalendarDays,
    Bus,
    GraduationCap,
    CheckCircle,
    BrainCircuit,
    Languages,
    Bot,
    Leaf,
    HeartHandshake,
    Trophy,
    Quote,
    Star,
    School
} from "lucide-react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { newsAndEvents } from "@/lib/data";

const quickAccessItems = [
    {
        icon: CalendarDays,
        title: "Okul Kayıtları",
        description: "2024-2025 eğitim öğretim yılı kayıtlarımız başladı.",
        color: "blue"
    },
    {
        icon: Bus,
        title: "Servis Hizmeti",
        description: "Güvenli ve konforlu servis ağımız ile hizmetinizdeyiz.",
        color: "yellow"
    },
    {
        icon: GraduationCap,
        title: "Burs İmkanları",
        description: "Başarılı öğrencilerimize özel burs fırsatları.",
        color: "green"
    }
]

const features = [
    { icon: BrainCircuit, title: "STEAM Eğitimi", description: "Bilim, Teknoloji, Mühendislik, Sanat ve Matematik alanlarını birleştiren çok disiplinli eğitim yaklaşımı." },
    { icon: Languages, title: "Çift Dilli Eğitim", description: "Anaokulundan itibaren İngilizce ve İspanyolca eğitimi ile global dünyaya hazırlık." },
    { icon: Bot, title: "Robotik ve Kodlama", description: "Yaş gruplarına özel robotik ve kodlama eğitimleri ile teknoloji okuryazarlığı." },
    { icon: Leaf, title: "Doğa Bilinci", description: "Ekolojik okul projeleri ve doğa kampanyaları ile çevre bilinci kazandırıyoruz." },
    { icon: HeartHandshake, title: "Psikolojik Danışmanlık", description: "Tam zamanlı psikolog ve rehber öğretmenlerle öğrencilerimizin duygusal gelişimini destekliyoruz." },
    { icon: Trophy, title: "Spor ve Sanat", description: "10'dan fazla spor branşı ve sanat atölyeleri ile öğrencilerimizin yeteneklerini keşfediyoruz." }
]

const testimonials = [
    {
        name: "Şebnem Arslan",
        role: "6. Sınıf Velisi",
        image: "https://placehold.co/100x100.png",
        aiHint: "woman portrait",
        comment: "Oğlumun Bilge Yıldız Koleji'ndeki gelişimini görmek çok mutluluk verici. Akademik olarak özgüveni arttı ve sosyal becerileri inanılmaz gelişti. Öğretmenlerin ilgisi ve okulun sunduğu imkanlar için çok teşekkür ederiz.",
        rating: 5
    },
    {
        name: "Burak Demir",
        role: "2. Sınıf Velisi",
        image: "https://placehold.co/100x100.png",
        aiHint: "man portrait",
        comment: "Kızım farklı bir okuldan Bilge Yıldız Koleji'ne geçiş yaptı. Adaptasyon sürecinde gösterdikleri özen ve destek için çok minnettarız. Şimdi kızım okulunu çok seviyor ve her gün öğrenmeye heyecanla gidiyor.",
        rating: 5
    },
    {
        name: "Ayşe Gürsoy",
        role: "10. Sınıf Velisi",
        image: "https://placehold.co/100x100.png",
        aiHint: "woman portrait professional",
        comment: "Liseye başladığından beri kızımın disiplinli çalışma alışkanlıkları kazandığını gözlemliyoruz. Üniversite hazırlık sürecindeki ciddiyetleri ve öğrencileri motive eden yaklaşımları için teşekkür ederiz.",
        rating: 4
    }
]

export default function Home() {
  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      {/* Banner Section */}
      <section className="w-full py-8">
        <div className="container mx-auto px-4">
          <Image 
            src="https://placehold.co/1200x400.png" 
            alt="Bilge Yıldız Koleji kampüsü"
            width={1200}
            height={400}
            className="rounded-xl shadow-lg w-full object-cover max-h-[400px]"
            data-ai-hint="school campus"
          />
        </div>
      </section>

      {/* Haberler & Duyurular Section */}
      <section className="py-20 lg:pt-10 lg:pb-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Haberler & Duyurular</h2>
            <div className="w-20 h-1 bg-primary mx-auto"></div>
            <p className="text-muted-foreground max-w-2xl mx-auto mt-6">Okulumuzdan en son haberler, etkinlikler ve önemli duyurular.</p>
          </div>
          <Carousel
            opts={{
              align: "start",
              loop: true,
            }}
            className="w-full max-w-6xl mx-auto"
          >
            <CarouselContent className="-ml-4">
              {newsAndEvents.map((item) => (
                <CarouselItem key={item.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="h-full">
                    <Card className="flex flex-col h-full transform hover:-translate-y-2 transition-transform duration-300 shadow-md hover:shadow-xl overflow-hidden group">
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={600}
                        height={400}
                        className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-105"
                        data-ai-hint={item.aiHint}
                      />
                      <CardHeader>
                        <CardDescription>{item.date}</CardDescription>
                        <CardTitle className="text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <p className="text-muted-foreground">{item.description}</p>
                      </CardContent>
                      <CardFooter>
                        <Button variant="link" asChild className="p-0 text-primary font-semibold">
                          <Link href={item.href}>
                            Devamını Oku <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Hızlı Erişim */}
      <section className="container mx-auto px-4 pb-20 -mt-12 z-10 relative">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickAccessItems.map((item, index) => (
                 <div key={index} className="bg-card p-6 rounded-xl shadow-lg text-center transform transition-transform duration-300 hover:-translate-y-2">
                    <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 bg-primary/10`}>
                        <item.icon className={`text-primary text-3xl`} />
                    </div>
                    <h3 className="font-bold text-lg mb-2 text-foreground">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                </div>
            ))}
        </div>
      </section>

      {/* Hakkımızda */}
      <section id="hakkimizda" className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row items-center gap-12">
                <div className="lg:w-1/2">
                    <Image src="https://placehold.co/600x450.png" alt="Okul binamız" width={600} height={450} className="rounded-xl shadow-xl" data-ai-hint="modern school building"/>
                </div>
                <div className="lg:w-1/2">
                    <div className="text-center lg:text-left mb-8">
                        <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Neden Bilge Yıldız Koleji?</h2>
                        <div className="w-20 h-1 bg-primary mx-auto lg:mx-0"></div>
                    </div>
                    <p className="text-muted-foreground leading-relaxed mb-6">Öğrencilerimizi akademik, sosyal ve kültürel açıdan en iyi şekilde yetiştirerek, 21. yüzyıl becerileriyle donatılmış, özgüvenli ve erdemli bireyler olarak topluma kazandırmak temel vizyonumuzdur.</p>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> <p>Akademik Mükemmellik</p></div>
                        <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> <p>Bireysel Eğitim</p></div>
                        <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> <p>Yabancı Dil Ağırlıklı</p></div>
                        <div className="flex items-center gap-2"><CheckCircle className="h-5 w-5 text-green-500" /> <p>Sosyal Sorumluluk</p></div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Öne Çıkan Özellikler */}
       <section className="py-20 lg:py-28 bg-secondary/50">
        <div className="container mx-auto px-4">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Kolejimizin Öne Çıkan Özellikleri</h2>
                <div className="w-20 h-1 bg-primary mx-auto"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <Card key={index} className="text-center p-6 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl">
                        <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                            <feature.icon className="w-10 h-10 text-primary" />
                        </div>
                        <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
                        <CardDescription>{feature.description}</CardDescription>
                    </Card>
                ))}
            </div>
        </div>
       </section>
      
        {/* İstatistikler */}
        <section className="py-20 bg-gradient-to-br from-primary to-blue-800 text-primary-foreground">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-5xl font-bold mb-2">98%</div>
                        <div className="text-xl opacity-90">Üniversite Yerleşme</div>
                    </div>
                     <div>
                        <div className="text-5xl font-bold mb-2">25+</div>
                        <div className="text-xl opacity-90">Yurt Dışı Üniversite Kabulleri</div>
                    </div>
                     <div>
                        <div className="text-5xl font-bold mb-2">12</div>
                        <div className="text-xl opacity-90">Bilim Olimpiyatları Ödülü</div>
                    </div>
                     <div>
                        <div className="text-5xl font-bold mb-2">100%</div>
                        <div className="text-xl opacity-90">Memnun Veli Oranı</div>
                    </div>
                </div>
            </div>
        </section>

      {/* Veli Görüşleri */}
      <section className="py-20 lg:py-28 bg-secondary/50">
          <div className="container mx-auto px-4">
               <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Veli Görüşleri</h2>
                    <div className="w-20 h-1 bg-primary mx-auto"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <Card key={index} className="p-8">
                            <CardContent className="p-0">
                                <div className="flex items-center mb-6">
                                    <Image src={testimonial.image} alt={testimonial.name} width={64} height={64} className="rounded-full mr-4" data-ai-hint={testimonial.aiHint}/>
                                    <div>
                                        <h4 className="font-bold text-lg">{testimonial.name}</h4>
                                        <p className="text-muted-foreground">{testimonial.role}</p>
                                    </div>
                                </div>
                                <div className="relative text-foreground/80">
                                    <Quote className="absolute -top-2 -left-3 w-8 h-8 text-primary/10" />
                                    <p>{testimonial.comment}</p>
                                </div>
                                <div className="flex mt-4">
                                    {Array.from({length: 5}).map((_, i) => (
                                        <Star key={i} className={`h-5 w-5 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
          </div>
      </section>
    </div>
  );
}
