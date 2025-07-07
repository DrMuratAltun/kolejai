
import Image from "next/image";
import Link from "next/link";
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
import { 
    ArrowRight, 
    Calendar,
    CheckCircle,
    BrainCircuit,
    Languages,
    Bot,
    Leaf,
    HeartHandshake,
    Trophy,
    Quote,
    Star,
} from "lucide-react";
import { getNewsItems, NewsItem } from "@/services/newsService";
import { getSiteSettings } from "@/services/settingsService";
import NewsCarousel from "@/components/home/NewsCarousel";
import QuickAccess from "@/components/home/QuickAccess";

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
];

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
];

const collaborations = [
    { name: "Bilişim Garajı Eğitimi", logo: "https://placehold.co/200x80.png", aiHint: "technology education" },
    { name: "Drone Pilotluğu Eğitimi", logo: "https://placehold.co/200x80.png", aiHint: "drone technology" },
    { name: "VEX ROBOTICS", logo: "https://placehold.co/200x80.png", aiHint: "robotics brand" },
    { name: "UBTECH ROBOTICS", logo: "https://placehold.co/200x80.png", aiHint: "robotics logo" },
    { name: "Tüzder Yayınları", logo: "https://placehold.co/200x80.png", aiHint: "education publisher" },
    { name: "Global Schools Program", logo: "https://placehold.co/200x80.png", aiHint: "global education" },
];

export default async function Home() {
  const [newsAndEvents, settings] = await Promise.all([
    getNewsItems(),
    getSiteSettings()
  ]);
  
  const upcomingEvents = newsAndEvents.filter(item => item.type === 'Etkinlik');

  return (
    <div className="flex flex-col animate-in fade-in duration-500">
      {/* Hero Section with Banner */}
      <section className="relative w-full h-[250px] md:h-[350px] lg:h-[400px]">
        <Image 
          src={settings.heroBannerUrl} 
          alt={`${settings.schoolName} kampüsü`}
          fill
          className="object-cover"
          data-ai-hint="school campus"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent"></div>
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full shadow-lg">
                <Image
                    src={settings.logoUrl}
                    alt={`${settings.schoolName} Logosu`}
                    width={150}
                    height={150}
                    className="h-28 w-28 md:h-36 md:w-36 rounded-full object-cover"
                    data-ai-hint="school logo"
                />
            </div>
        </div>
      </section>

      {/* Haberler & Duyurular Carousel */}
      <NewsCarousel newsAndEvents={newsAndEvents} />

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
                          <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Neden {settings.schoolName}?</h2>
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
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {institutions.map((inst) => (
                        <Link href={inst.href} key={inst.title} className="relative block aspect-[3/4] rounded-xl overflow-hidden group shadow-lg transform transition-transform duration-300 hover:-translate-y-2 z-0">
                            <Image
                                src={inst.image}
                                alt={inst.title}
                                fill
                                className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                                data-ai-hint={inst.aiHint}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent"></div>
                            <div className="absolute z-10 inset-0 flex flex-col items-center justify-center text-white p-1 text-center">
                                <h3 className="font-bold uppercase tracking-tighter transition-all duration-300 group-hover:-translate-y-4 text-[10px] sm:text-xs md:text-sm">{inst.title}</h3>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature) => (
                  <div key={feature.title} className="group h-80 [perspective:1000px]">
                    <div className="relative h-full w-full rounded-xl shadow-xl transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                      {/* Front Side */}
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-xl [backface-visibility:hidden] text-white p-6 text-center"
                        style={{ backgroundColor: `hsl(var(--${feature.colorVar}))` }}
                      >
                        <feature.icon className="w-20 h-20 mb-4" />
                        <h3 className="text-2xl font-bold">{feature.title}</h3>
                      </div>
                      {/* Back Side */}
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center rounded-xl [backface-visibility:hidden] [transform:rotateY(180deg)] text-white p-6 text-center"
                        style={{ backgroundColor: `hsl(var(--${feature.colorVar}))` }}
                      >
                        <h3 className="text-xl font-bold mb-4">{feature.title}</h3>
                        <p className="text-base">{feature.description}</p>
                      </div>
                    </div>
                  </div>
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

            {/* Eğitim İş Birliklerimiz */}
            <section>
                <div className="text-center mb-12">
                  <h2 className="text-2xl md:text-3xl font-bold text-muted-foreground tracking-wider">
                    ✽ EĞİTİM İŞ BİRLİKLERİMİZ ✽
                  </h2>
                </div>
                <Marquee pauseOnHover={true} speed={40}>
                  {collaborations.map((collab, index) => (
                    <div key={index} className="mx-12 flex items-center justify-center h-24">
                      <Image
                        src={collab.logo}
                        alt={collab.name}
                        width={180}
                        height={60}
                        className="object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                        data-ai-hint={collab.aiHint}
                      />
                    </div>
                  ))}
                </Marquee>
            </section>

            {/* Veli Görüşleri */}
            <section className="overflow-hidden">
                <div className="text-center mb-16">
                      <h2 className="text-3xl md:text-4xl font-bold text-primary mb-4">Veli Görüşleri</h2>
                      <div className="w-20 h-1 bg-primary mx-auto"></div>
                </div>
                <Marquee pauseOnHover={true} speed={40}>
                  {testimonials.map((testimonial, index) => (
                      <Card key={index} className="p-6 mx-4 w-[350px] flex-shrink-0">
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
              <QuickAccess />

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
