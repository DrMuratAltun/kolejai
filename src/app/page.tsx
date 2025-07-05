
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import Autoplay from "embla-carousel-autoplay";
import Marquee from "react-fast-marquee";
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
    School,
    Facebook,
    Twitter,
    Instagram
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
        bgColor: "bg-blue-100 dark:bg-blue-900/50",
        iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
        icon: Bus,
        title: "Servis Hizmeti",
        description: "Güvenli ve konforlu servis ağımız ile hizmetinizdeyiz.",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
        iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
        icon: GraduationCap,
        title: "Burs İmkanları",
        description: "Başarılı öğrencilerimize özel burs fırsatları.",
        bgColor: "bg-green-100 dark:bg-green-900/50",
        iconColor: "text-green-600 dark:text-green-400"
    }
]

const institutions = [
    { title: "Anaokulu", image: "https://placehold.co/600x800.png", aiHint: "kindergarten classroom", href: "#" },
    { title: "İlkokul", image: "https://placehold.co/600x800.png", aiHint: "primary school students", href: "#" },
    { title: "Ortaokul", image: "https://placehold.co/600x800.png", aiHint: "middle school science", href: "#" },
    { title: "Anadolu Lisesi", image: "https://placehold.co/600x800.png", aiHint: "high school students", href: "#" },
    { title: "Akşam Lisesi", image: "https://placehold.co/600x800.png", aiHint: "adult education graduation", href: "#" },
];

const features = [
    { icon: BrainCircuit, title: "STEAM Eğitimi", description: "Bilim, Teknoloji, Mühendislik, Sanat ve Matematik alanlarını birleştiren çok disiplinli eğitim yaklaşımı.", colorVar: "feature-1" },
    { icon: Languages, title: "Çift Dilli Eğitim", description: "Anaokulundan itibaren İngilizce ve İspanyolca eğitimi ile global dünyaya hazırlık.", colorVar: "feature-2" },
    { icon: Bot, title: "Robotik ve Kodlama", description: "Yaş gruplarına özel robotik ve kodlama eğitimleri ile teknoloji okuryazarlığı.", colorVar: "feature-3" },
    { icon: Leaf, title: "Doğa Bilinci", description: "Ekolojik okul projeleri ve doğa kampanyaları ile çevre bilinci kazandırıyoruz.", colorVar: "feature-4" },
    { icon: HeartHandshake, title: "Psikolojik Danışmanlık", description: "Tam zamanlı psikolog ve rehber öğretmenlerle öğrencilerimizin duygusal gelişimini destekliyoruz.", colorVar: "feature-5" },
    { icon: Trophy, title: "Spor ve Sanat", description: "10'dan fazla spor branşı ve sanat atölyeleri ile öğrencilerimizin yeteneklerini keşfediyoruz.", colorVar: "feature-6" }
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
  const plugin = React.useRef(
    Autoplay({ delay: 5000, stopOnInteraction: true, stopOnMouseEnter: true })
  );

  const upcomingEvents = newsAndEvents.filter(item => item.type === 'Etkinlik');

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      {/* Hero Section with Banner */}
      <section className="relative w-full h-[250px] md:h-[350px] lg:h-[400px]">
        <Image 
          src="https://placehold.co/1200x400.png" 
          alt="Bilge Yıldız Koleji kampüsü"
          fill
          className="object-cover"
          data-ai-hint="school campus"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full shadow-lg">
                <Image
                    src="https://placehold.co/150x150.png"
                    alt="Bilge Yıldız Koleji Logosu"
                    width={150}
                    height={150}
                    className="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover"
                    data-ai-hint="school logo"
                />
            </div>
        </div>
      </section>

      {/* Haberler & Duyurular Carousel */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Carousel
            plugins={[plugin.current]}
            className="w-full"
            opts={{
              loop: true,
            }}
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
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

      {/* Main Content and Sidebar Wrapper */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* Main Content Area */}
          <main className="lg:w-2/3 space-y-24">
            
            {/* Hakkımızda */}
            <section id="hakkimizda">
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
            </section>

            {/* Kurumlarımız */}
            <section id="kurumlarimiz">
                <div className="grid grid-cols-5 gap-4">
                    {institutions.map((inst, index) => (
                        <Link href={inst.href} key={index} className="relative block aspect-[3/4] rounded-xl overflow-hidden group shadow-lg transform transition-transform duration-300 hover:-translate-y-2">
                            <Image
                                src={inst.image}
                                alt={inst.title}
                                fill
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint={inst.aiHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                            <div className="absolute z-10 inset-0 flex flex-col items-center justify-center text-white p-1 text-center">
                                <h3 className="font-bold uppercase tracking-tighter transition-all duration-300 group-hover:-translate-y-4 text-[10px] sm:text-xs">{inst.title}</h3>
                                <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:translate-y-0 translate-y-4">
                                    <Button variant="outline" size="sm" className="bg-white/20 border-white text-white backdrop-blur-sm hover:bg-white hover:text-primary text-xs h-auto px-2 py-1">
                                        İnceleyin <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>

             {/* Öne Çıkan Özellikler */}
            <section>
              <div className="text-center mb-16">
                  <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Kolejimizin Öne Çıkan Özellikleri</h2>
                  <div className="w-20 h-1 bg-primary mx-auto"></div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {features.map((feature, index) => (
                      <Card key={index} className="flex flex-col text-center p-6 transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-xl h-full">
                          <div 
                            className="w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto"
                            style={{ backgroundColor: `hsla(var(--${feature.colorVar}), 0.1)` }}
                          >
                              <feature.icon 
                                className="w-10 h-10"
                                style={{ color: `hsl(var(--${feature.colorVar}))` }}
                              />
                          </div>
                          <CardTitle className="text-xl mb-3">{feature.title}</CardTitle>
                          <CardDescription>{feature.description}</CardDescription>
                      </Card>
                  ))}
              </div>
            </section>
      
            {/* İstatistikler */}
            <section className="py-20 my-12 rounded-xl bg-gradient-to-br from-primary to-blue-800 text-primary-foreground">
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
            <section className="overflow-hidden">
                <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Veli Görüşleri</h2>
                      <div className="w-20 h-1 bg-primary mx-auto"></div>
                </div>
                <Marquee pauseOnHover={true} speed={40}>
                  {testimonials.map((testimonial, index) => (
                      <Card key={index} className="p-6 mx-4 w-[380px] flex-shrink-0">
                          <CardContent className="p-0">
                              <div className="flex items-center mb-4">
                                  <Image src={testimonial.image} alt={testimonial.name} width={56} height={56} className="rounded-full mr-4" data-ai-hint={testimonial.aiHint}/>
                                  <div>
                                      <h4 className="font-bold text-base">{testimonial.name}</h4>
                                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                  </div>
                              </div>
                              <div className="relative text-sm text-foreground/80">
                                  <Quote className="absolute -top-1 -left-2 w-6 h-6 text-primary/10" />
                                  <p>{testimonial.comment}</p>
                              </div>
                              <div className="flex mt-4">
                                  {Array.from({length: 5}).map((_, i) => (
                                      <Star key={i} className={`h-4 w-4 ${i < testimonial.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                                  ))}
                              </div>
                          </CardContent>
                      </Card>
                  ))}
                 </Marquee>
            </section>
          </main>

          {/* Sidebar Area */}
          <aside className="lg:w-1/3 mt-16 lg:mt-0">
            <div className="sticky top-28 space-y-8">
              <Card>
                <CardHeader>
                  <CardTitle>Hızlı Erişim</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                  {quickAccessItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.bgColor} flex-shrink-0`}>
                          <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-md mb-1 text-foreground">{item.title}</h3>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {upcomingEvents.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Yaklaşan Etkinlikler</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {upcomingEvents.map((event) => (
                      <Link href={event.href} key={event.id} className="flex items-start gap-4 group">
                          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-primary/10 flex-shrink-0">
                              <Calendar className="text-primary h-6 w-6" />
                          </div>
                          <div>
                              <h3 className="font-bold text-md mb-1 text-foreground transition-colors group-hover:text-primary">{event.title}</h3>
                              <p className="text-muted-foreground text-sm">{event.date}</p>
                          </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}
