

'use client'

import React, { useMemo } from 'react';
import Link from 'next/link';
import { DndContext, useDraggable, useDroppable, type DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { getPages, type Page } from '@/services/pageService';
import { MoreHorizontal, Pencil, CheckCircle, GripVertical, Link as LinkIcon, FileText, BoxSelect } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';
import { updatePageOrderAndParentAction } from './actions';


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

  const sortByMenuOrder = (a: PageNode, b: PageNode) => (a.menuOrder || 0) - (b.menuOrder || 0);
  rootNodes.sort(sortByMenuOrder);
  pageMap.forEach(node => node.children.sort(sortByMenuOrder));

  return rootNodes;
};

function PageRow({ page, level, allPages }: { page: PageNode, level: number, allPages: Page[] }) {
    const { attributes, listeners, setNodeRef: setDraggableNodeRef, transform, isDragging } = useDraggable({
        id: page.id,
    });
    const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
        id: page.id,
    });

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : 1,
        zIndex: isDragging ? 1000 : 1
    };
    
    const getIcon = (type: Page['type']) => {
        switch (type) {
            case 'page': return <FileText className="h-4 w-4 mr-2 text-sky-500"/>;
            case 'link': return <LinkIcon className="h-4 w-4 mr-2 text-green-500"/>;
            case 'container': return <BoxSelect className="h-4 w-4 mr-2 text-orange-500"/>;
            default: return <FileText className="h-4 w-4 mr-2 text-sky-500"/>;
        }
    }

    const getLink = (page: Page) => {
      if (page.type === 'link') return page.href;
      if (page.type === 'page' && page.slug) return `/p/${page.slug}`;
      return '#';
    }
    
    const canBeDroppedOn = page.type === 'container' || page.type === 'page';

    return (
      <div ref={setDraggableNodeRef} style={style}>
          <div ref={canBeDroppedOn ? setDroppableNodeRef : null} className={cn('bg-card rounded-md my-1', isOver && canBeDroppedOn && 'ring-2 ring-primary')}>
              <div className="flex items-center border rounded-md p-2">
                  <div className="flex-grow flex items-center" style={{ paddingLeft: `${level * 2}rem` }}>
                      <div className="flex items-center gap-2 w-full">
                          <GripVertical {...attributes} {...listeners} className="cursor-grab text-muted-foreground" />
                          {level > 0 && <span className="text-muted-foreground">└─</span>}
                          {getIcon(page.type)}
                          <span className="font-medium">{page.title}</span>
                          <Badge variant="outline" className="ml-2">{page.type}</Badge>
                      </div>
                  </div>
                  <div className="flex-shrink-0 flex items-center gap-4">
                      <a href={getLink(page) || undefined} target="_blank" rel="noopener noreferrer">
                          <Badge variant={getLink(page) === '#' ? 'destructive' : 'secondary'}>
                              {getLink(page) === '#' ? 'Bağlantı Yok' : (getLink(page)?.startsWith('/') ? getLink(page) : 'Dış Bağlantı')}
                          </Badge>
                      </a>
                       <Badge variant={page.showInMenu ? "secondary" : "outline"}>
                          {page.showInMenu && <CheckCircle className="h-3 w-3 mr-1"/>}
                          {page.showInMenu ? 'Menüde' : 'Gizli'}
                      </Badge>
                       <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                  <Link href={`/admin/pages/edit/${page.id}`}><Pencil className="mr-2 h-4 w-4" /> Düzenle</Link>
                              </DropdownMenuItem>
                          </DropdownMenuContent>
                      </DropdownMenu>
                  </div>
              </div>
          </div>
          {page.children.length > 0 && (
              <div style={{ paddingLeft: `${level > 0 ? 2 : 0}rem` }}>
                  {page.children.map(child => <PageRow key={child.id} page={child} level={level + 1} allPages={allPages}/>)}
              </div>
          )}
      </div>
    );
};


export default function PagesListPage() {
  const [pages, setPages] = React.useState<Page[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    getPages().then(setPages);
  }, []);
  
  const pageTree = useMemo(() => buildPageTree(pages), [pages]);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (active && over && active.id !== over.id) {
      const activePage = pages.find(p => p.id === active.id);
      if (!activePage) return;

      const overContainerId = over.id as string;
      
      toast({ title: 'Menü güncelleniyor...' });
      
      const result = await updatePageOrderAndParentAction(
        active.id as string,
        overContainerId,
        activePage.menuOrder
      );

      if (result.success) {
          toast({ title: "Başarılı!", description: "Menü hiyerarşisi güncellendi." });
          // Refresh pages from server
          getPages().then(setPages);
      } else {
          toast({ variant: "destructive", title: "Hata!", description: result.error as string });
      }
    }
  };


  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Menü Oluşturucu</h1>
          <p className="text-muted-foreground">
            Sürükle-bırak ile menü hiyerarşinizi yönetin. Bir öğeyi diğerinin altına taşımak için sürükleyin.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/pages/new">Yeni Menü Öğesi Oluştur</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Menü Yapısı</CardTitle>
          <CardDescription>
            Menüdeki öğeleri sürükleyip bırakarak yeniden sıralayabilir veya hiyerarşisini değiştirebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent>
           <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
              {pageTree.length === 0 ? (
                 <div className="h-24 text-center flex items-center justify-center">
                  Henüz hiç menü öğesi oluşturulmamış.
                 </div>
              ) : (
                pageTree.map((page) => (
                  <PageRow key={page.id} page={page} level={0} allPages={pages} />
                ))
              )}
            </DndContext>
        </CardContent>
      </Card>
    </div>
  );
}
