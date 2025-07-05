import Link from "next/link";
import { School, Facebook, Twitter, Instagram, Linkedin, Phone, Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background/80">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
              <School className="h-8 w-8" />
              <span className="text-white">Bilge Yıldız</span>
            </Link>
            <p className="text-muted-foreground">
              Eğitimde mükemmelliği hedefleyen, yenilikçi ve öğrenci odaklı bir kurum.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Hızlı Erişim</h3>
            <ul className="space-y-2">
              <li><Link href="/staff" className="text-muted-foreground hover:text-primary">Kadromuz</Link></li>
              <li><Link href="/gallery" className="text-muted-foreground hover:text-primary">Galeri</Link></li>
              <li><Link href="/#hakkimizda" className="text-muted-foreground hover:text-primary">Hakkımızda</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-primary">İletişim</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
             <h3 className="text-lg font-semibold mb-4 text-white">İletişim</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-1 text-primary flex-shrink-0" />
                <span>Örnek Mah. Okul Sk. No:123, 34762 Üsküdar/İstanbul</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a href="mailto:info@bilgeyildiz.com" className="hover:text-primary">info@bilgeyildiz.com</a>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:+902161234567" className="hover:text-primary">+90 (216) 123 45 67</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
           <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Bülten</h3>
            <p className="text-muted-foreground mb-4">Gelişmelerden haberdar olmak için bültenimize kaydolun.</p>
            <form className="flex gap-2">
                <Input type="email" placeholder="E-posta adresiniz" className="bg-gray-800 border-gray-700 text-white" />
                <Button type="submit">Abone Ol</Button>
            </form>
          </div>
        </div>
      </div>
      <div className="bg-background/10">
        <div className="container mx-auto px-4 py-4 text-center text-muted-foreground text-sm">
          &copy; {new Date().getFullYear()} Bilge Yıldız Koleji. Tüm hakları saklıdır.
        </div>
      </div>
    </footer>
  );
}
