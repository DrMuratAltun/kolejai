import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Eye,
  Newspaper,
  Calendar,
  Megaphone,
  Files,
  GalleryHorizontal,
  User,
  Mail,
  MessageSquare,
  Menu,
  Palette,
  Bot,
  Database,
  School
} from 'lucide-react';
import { cn } from '@/lib/utils';

const quickAccessItems = [
  { href: '/admin/news', label: 'Haber, Duyuru & Etkinlik', icon: Newspaper, borderColor: 'border-blue-500', textColor: 'text-blue-500' },
  { href: '/admin/pages', label: 'Sayfalar', icon: Files, borderColor: 'border-orange-500', textColor: 'text-orange-500', disabled: false },
  { href: '/admin/gallery', label: 'Galeri', icon: GalleryHorizontal, borderColor: 'border-pink-500', textColor: 'text-pink-500' },
  { href: '#', label: 'Müdür Mesajı', icon: User, borderColor: 'border-red-500', textColor: 'text-red-500', disabled: true },
  { href: '/admin/submissions', label: 'İletişim Bilgileri', icon: Mail, borderColor: 'border-orange-500', textColor: 'text-orange-500' },
  { href: '/admin/submissions', label: 'Mesajlar', icon: MessageSquare, borderColor: 'border-teal-500', textColor: 'text-teal-500' },
  { href: '#', label: 'Menü Yapısı', icon: Menu, borderColor: 'border-slate-500', textColor: 'text-slate-500', disabled: true },
  { href: '#', label: 'Site Görünümü', icon: Palette, borderColor: 'border-rose-500', textColor: 'text-rose-500', disabled: true },
  { href: '/admin/chatbot', label: 'Chatbot Ayarları', icon: Bot, borderColor: 'border-cyan-500', textColor: 'text-cyan-500' },
  { href: '#', label: 'Veritabanı Güncelle', icon: Database, borderColor: 'border-indigo-500', textColor: 'text-indigo-500', disabled: true },
];


export default function DashboardPage() {
  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="rounded-xl bg-gradient-to-br from-primary to-blue-700 p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">Okul Web Yönetim Paneli</h1>
        <p className="text-primary-foreground/80 mb-6">Web sitenizi ve chatbot'unuzu buradan yönetebilirsiniz.</p>
        <Button asChild variant="outline" className="bg-white/20 border-white text-white backdrop-blur-sm hover:bg-white hover:text-primary">
          <Link href="/">
            <Eye className="mr-2 h-4 w-4" />
            Siteyi Görüntüle
          </Link>
        </Button>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4">Hızlı Erişim</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {quickAccessItems.map((item) => (
            <Link href={item.href} key={item.label} className={item.disabled ? 'pointer-events-none' : ''}>
              <Card className={cn('group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 transform border-t-4', item.borderColor, item.disabled && 'opacity-60 bg-muted/50')}>
                <CardContent className="p-6 flex flex-col items-center justify-center text-center space-y-3">
                  <item.icon className={cn('w-10 h-10', item.textColor)} />
                  <p className="font-semibold text-sm text-foreground">{item.label}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
