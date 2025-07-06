
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Mail } from "lucide-react";
import Link from "next/link";
import { getStaffMembers } from "@/services/staffService";

export default async function StaffPage() {

  const staff = await getStaffMembers();

  return (
    <div className="container mx-auto px-4 pb-16 pt-28 animate-in fade-in duration-500">
      <div className="text-center mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">Eğitim Kadromuz</h1>
        <div className="w-20 h-1 bg-primary mx-auto"></div>
        <p className="text-muted-foreground max-w-2xl mx-auto mt-6">Alanında uzman, deneyimli ve yenilikçi eğitimcilerden oluşan dinamik kadromuz öğrencilerimizin gelişimini desteklemek için sürekli kendini yenilemektedir.</p>
      </div>
      {staff.length === 0 ? (
        <div className="text-center text-muted-foreground">
          <p>Şu anda gösterilecek personel bulunmamaktadır.</p>
          <p>Lütfen admin panelinden personel ekleyiniz.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {staff.map((member) => (
            <div key={member.id} className="relative rounded-xl overflow-hidden shadow-lg group transform transition-transform duration-300 hover:-translate-y-2">
              <Image
                src={member.photo}
                alt={member.name}
                width={400}
                height={400}
                className="w-full h-96 object-cover"
                data-ai-hint={member.aiHint}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-primary-foreground/80">{member.title}</p>
              </div>
              <div className="absolute inset-0 bg-blue-800/90 flex flex-col justify-end p-6 text-primary-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-blue-200 mb-4">{member.title}</p>
                  <p className="text-sm mb-4">{member.description}</p>
                   <div className="flex space-x-3">
                      <Link href="#" className="text-white hover:text-blue-300"><Linkedin /></Link>
                      <Link href="#" className="text-white hover:text-blue-300"><Mail /></Link>
                  </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
