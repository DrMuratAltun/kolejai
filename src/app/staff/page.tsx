import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Mail } from "lucide-react";
import Link from "next/link";

const staff = [
  {
    name: "Ayşe Yılmaz",
    role: "Okul Müdürü",
    department: "Yönetim",
    bio: "20 yıllık deneyim, Boğaziçi Üniversitesi mezunu.",
    image: "https://placehold.co/400x400.png",
    aiHint: "woman portrait"
  },
  {
    name: "Mehmet Öztürk",
    role: "Müdür Yardımcısı",
    department: "Yönetim",
    bio: "Eğitim yönetimi alanında yüksek lisans derecesine sahiptir.",
    image: "https://placehold.co/400x400.png",
    aiHint: "man portrait"
  },
  {
    name: "Fatma Kaya",
    role: "Matematik Öğretmeni",
    department: "Sayısal",
    bio: "ODTÜ Matematik bölümü mezunu, 15 yıllık deneyim.",
    image: "https://placehold.co/400x400.png",
    aiHint: "woman teacher"
  },
  {
    name: "Ali Demir",
    role: "Türkçe Öğretmeni",
    department: "Sözel",
    bio: "İstanbul Üniversitesi Edebiyat Fakültesi mezunu.",
    image: "https://placehold.co/400x400.png",
    aiHint: "man teacher"
  },
  {
    name: "Zeynep Arslan",
    role: "Fen Bilimleri Öğretmeni",
    department: "Sayısal",
    bio: "TÜBİTAK proje danışmanı ve bilim fuarı koordinatörü.",
    image: "https://placehold.co/400x400.png",
    aiHint: "woman scientist"
  },
  {
    name: "Mustafa Çelik",
    role: "İngilizce Öğretmeni",
    department: "Dil",
    bio: "Yurt dışında eğitim görmüş, anadili seviyesinde İngilizce.",
    image: "https://placehold.co/400x400.png",
    aiHint: "man student"
  },
   {
    name: "Elif Şahin",
    role: "Görsel Sanatlar Öğretmeni",
    department: "Sanat",
    bio: "Mimar Sinan Güzel Sanatlar Üniversitesi mezunu, ödüllü sanatçı.",
    image: "https://placehold.co/400x400.png",
    aiHint: "woman artist"
  },
  {
    name: "Hasan Yıldız",
    role: "Beden Eğitimi Öğretmeni",
    department: "Spor",
    bio: "Milli sporcu, çeşitli branşlarda antrenörlük belgesine sahip.",
    image: "https://placehold.co/400x400.png",
    aiHint: "man athlete"
  },
];

export default function StaffPage() {
  return (
    <div className="container mx-auto px-4 pb-16 pt-28 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Eğitim Kadromuz</h1>
        <div className="w-20 h-1 bg-primary mx-auto"></div>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-6">Alanında uzman, deneyimli ve yenilikçi eğitimcilerden oluşan dinamik kadromuz öğrencilerimizin gelişimini desteklemek için sürekli kendini yenilemektedir.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {staff.map((member, index) => (
          <div key={index} className="relative rounded-xl overflow-hidden shadow-lg group transform transition-transform duration-300 hover:-translate-y-2">
            <Image
              src={member.image}
              alt={member.name}
              width={400}
              height={400}
              className="w-full h-96 object-cover"
              data-ai-hint={member.aiHint}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p className="text-primary-foreground/80">{member.role}</p>
            </div>
            <div className="absolute inset-0 bg-blue-800/90 flex flex-col justify-end p-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                <p className="text-blue-200 mb-4">{member.role}</p>
                <p className="text-sm mb-4">{member.bio}</p>
                 <div className="flex space-x-3">
                    <Link href="#" className="text-white hover:text-blue-300"><Linkedin /></Link>
                    <Link href="#" className="text-white hover:text-blue-300"><Mail /></Link>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
