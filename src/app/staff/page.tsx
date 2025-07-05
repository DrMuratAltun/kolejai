import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const staff = [
  {
    name: "Ayşe Yılmaz",
    role: "Okul Müdürü",
    department: "Yönetim",
    image: "https://placehold.co/400x400.png",
    aiHint: "woman portrait"
  },
  {
    name: "Mehmet Öztürk",
    role: "Müdür Yardımcısı",
    department: "Yönetim",
    image: "https://placehold.co/400x400.png",
    aiHint: "man portrait"
  },
  {
    name: "Fatma Kaya",
    role: "Matematik Öğretmeni",
    department: "Sayısal",
    image: "https://placehold.co/400x400.png",
    aiHint: "woman teacher"
  },
  {
    name: "Ali Demir",
    role: "Türkçe Öğretmeni",
    department: "Sözel",
    image: "https://placehold.co/400x400.png",
    aiHint: "man teacher"
  },
  {
    name: "Zeynep Arslan",
    role: "Fen Bilimleri Öğretmeni",
    department: "Sayısal",
    image: "https://placehold.co/400x400.png",
    aiHint: "woman scientist"
  },
  {
    name: "Mustafa Çelik",
    role: "İngilizce Öğretmeni",
    department: "Dil",
    image: "https://placehold.co/400x400.png",
    aiHint: "man student"
  },
   {
    name: "Elif Şahin",
    role: "Görsel Sanatlar Öğretmeni",
    department: "Sanat",
    image: "https://placehold.co/400x400.png",
    aiHint: "woman artist"
  },
  {
    name: "Hasan Yıldız",
    role: "Beden Eğitimi Öğretmeni",
    department: "Spor",
    image: "https://placehold.co/400x400.png",
    aiHint: "man athlete"
  },
];

export default function StaffPage() {
  return (
    <div className="container mx-auto px-4 py-16 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Öğretmen ve Yönetim Kadromuz</h1>
        <p className="text-muted-foreground mt-4 text-lg">Öğrencilerimizin başarısı için çalışan deneyimli ve özverili ekibimiz.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {staff.map((member, index) => (
          <Card key={index} className="text-center transform hover:-translate-y-2 transition-transform duration-300 shadow-lg hover:shadow-xl overflow-hidden">
            <CardHeader className="p-0">
              <Image
                src={member.image}
                alt={member.name}
                width={400}
                height={400}
                className="w-full h-auto object-cover aspect-square"
                data-ai-hint={member.aiHint}
              />
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="text-xl">{member.name}</CardTitle>
              <CardDescription className="text-primary mt-1">{member.role}</CardDescription>
               <Badge variant="outline" className="mt-4">{member.department}</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
