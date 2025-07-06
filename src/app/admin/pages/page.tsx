import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getPages } from '@/services/pageService';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default async function PagesListPage() {
  const pages = await getPages();

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sayfa Yönetimi</h1>
          <p className="text-muted-foreground">
            Dinamik sayfalarınızı yönetin veya AI ile yenilerini oluşturun.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">Yeni Sayfa Oluştur</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mevcut Sayfalar</CardTitle>
          <CardDescription>Toplam {pages.length} sayfa bulundu.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sayfa Başlığı</TableHead>
                <TableHead>URL Adresi</TableHead>
                <TableHead>Oluşturulma Tarihi</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                    Henüz hiç sayfa oluşturulmamış.
                    </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                    <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">/p/{page.slug}</Badge>
                    </TableCell>
                    <TableCell>
                        {page.createdAt?.toDate().toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell className="text-right">
                        {/* Actions Dropdown placeholder */}
                        <Button variant="ghost" size="icon" disabled>
                           <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </TableCell>
                    </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
