
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
import { getPages, type Page } from '@/services/pageService';
import { MoreHorizontal, Pencil, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface PageNode extends Page {
  children: PageNode[];
}

const buildPageTree = (pages: Page[]): PageNode[] => {
  const pageMap = new Map<string, PageNode>();
  const rootNodes: PageNode[] = [];

  pages.forEach(page => {
    pageMap.set(page.id, { ...page, children: [] });
  });

  pages.forEach(page => {
    const node = pageMap.get(page.id);
    if (node) {
      if (page.parentId && pageMap.has(page.parentId)) {
        const parentNode = pageMap.get(page.parentId);
        parentNode?.children.push(node);
      } else {
        rootNodes.push(node);
      }
    }
  });

  const sortByMenuOrder = (a: PageNode, b: PageNode) => a.menuOrder - b.menuOrder;
  rootNodes.sort(sortByMenuOrder);
  pageMap.forEach(node => node.children.sort(sortByMenuOrder));

  return rootNodes;
};

const PageRow = ({ page, level }: { page: PageNode, level: number }) => {
  return (
    <>
      <TableRow key={page.id}>
        <TableCell className="font-medium">
          <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 1.5}rem` }}>
             { level > 0 && <span className="text-muted-foreground">└─</span> }
            <span>{page.title}</span>
          </div>
        </TableCell>
        <TableCell>
          <a href={`/p/${page.slug}`} target="_blank" rel="noopener noreferrer">
            <Badge variant="outline">/p/{page.slug}</Badge>
          </a>
        </TableCell>
         <TableCell>
            <Badge variant={page.showInMenu ? "secondary" : "outline"}>
                {page.showInMenu && <CheckCircle className="h-3 w-3 mr-1"/>}
                {page.showInMenu ? 'Menüde Gösteriliyor' : 'Menüde Gizli'}
            </Badge>
        </TableCell>
        <TableCell>{page.menuOrder}</TableCell>
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
      {page.children.map(child => <PageRow key={child.id} page={child} level={level + 1} />)}
    </>
  );
};


export default async function PagesListPage() {
  const pages = await getPages();
  const pageTree = buildPageTree(pages);

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sayfa & Menü Yönetimi</h1>
          <p className="text-muted-foreground">
            Web sitenizdeki sayfaları ve bu sayfaların menüdeki hiyerarşik yapısını buradan yönetin.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">Yeni Sayfa Oluştur</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Sayfalar ve Menü Yapısı</CardTitle>
          <CardDescription>
            Bir sayfanın içeriğini, menüdeki yerini ve sırasını değiştirmek için 'Düzenle' butonuna tıklayın.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sayfa Başlığı</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Menü Durumu</TableHead>
                <TableHead>Sıra</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageTree.length === 0 ? (
                 <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                    Henüz hiç sayfa oluşturulmamış.
                    </TableCell>
                </TableRow>
              ) : (
                pageTree.map((page) => (
                  <PageRow key={page.id} page={page} level={0} />
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
