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
import { MoreHorizontal, Pencil, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

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
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                    Henüz hiç sayfa oluşturulmamış.
                    </TableCell>
                </TableRow>
              ) : (
                pages.map((page) => (
                    <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>
                      <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
                        <Badge variant="outline">/p/{page.slug}</Badge>
                      </a>
                    </TableCell>
                    <TableCell>
                        {page.createdAt?.toDate().toLocaleDateString('tr-TR')}
                    </TableCell>
                    <TableCell>
                        {page.showInMenu && <Badge variant="secondary"><CheckCircle className="h-3 w-3 mr-1"/> Menüde</Badge>}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/admin/pages/edit/${page.id}`}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Düzenle
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
