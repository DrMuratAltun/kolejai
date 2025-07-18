'use client';

import React, { useState, useActionState, useEffect } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ArrowLeft, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generatePageContent } from '@/ai/flows/page-generator';
import { useToast } from '@/hooks/use-toast';
import { savePageAction } from './actions';
import type { Page } from '@/services/pageService';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import dynamic from 'next/dynamic';
import PagePreview from './PagePreview';

const AiTextEditor = dynamic(() => import('@/components/ai/AiTextEditor'), {
  ssr: false,
  loading: () => (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
  ),
});

const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD') // split an accented letter in the base letter and the accent
    .replace(/[\u0300-\u036f]/g, '') // remove all previously split accents
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};


function SubmitButton({ isGenerating }: { isGenerating: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || isGenerating} size="lg">
      {(pending || isGenerating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Kaydet
    </Button>
  );
}

interface MenuItemEditorProps {
    page?: Page;
    allPages: Page[];
}

export default function MenuItemEditor({ page, allPages }: MenuItemEditorProps) {
  const { toast } = useToast();
  
  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [href, setHref] = useState(page?.href || '');
  const [topic, setTopic] = useState('');
  const [htmlContent, setHtmlContent] = useState(page?.htmlContent || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(page?.parentId || 'none');
  const [showInMenu, setShowInMenu] = useState(page?.showInMenu === undefined ? true : page.showInMenu);
  const [menuItemType, setMenuItemType] = useState<Page['type']>(page?.type || 'page');

  const [state, formAction] = useActionState(savePageAction, { success: false, error: null });

  useEffect(() => {
    if (state?.error) {
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: state.error,
      });
    }
  }, [state, toast]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    if (menuItemType === 'page') {
      setSlug(slugify(newTitle));
    }
  };

  const handleGenerateContent = async () => {
    if (!title || !topic) {
      toast({
        variant: 'destructive',
        title: 'Eksik Bilgi',
        description: 'Lütfen sayfa başlığı ve içerik konusunu belirtin.',
      });
      return;
    }
    setIsGenerating(true);
    setHtmlContent('');
    try {
      const result = await generatePageContent({ title, topic });
      setHtmlContent(result.htmlContent);
      toast({
        title: 'Başarılı!',
        description: 'Sayfa içeriği yapay zeka tarafından oluşturuldu.',
      });
    } catch (error) {
      console.error('Page generation error:', error);
      toast({
        variant: 'destructive',
        title: 'Hata!',
        description: 'İçerik üretilirken bir hata oluştu.',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/pages">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{page ? 'Menü Öğesini Düzenle' : 'Yeni Menü Öğesi Oluştur'}</h1>
      </div>
      
      <form action={formAction}>
        <input type="hidden" name="id" value={page?.id || ''} />
        <input type="hidden" name="htmlContent" value={htmlContent} />
        
        <Card>
            <CardHeader>
                <CardTitle>Menü Öğesi Detayları</CardTitle>
                <CardDescription>
                  Bir menü öğesinin türünü, başlığını, bağlantısını ve hiyerarşisini buradan yönetin.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
                {/* Section 1: Type & Basic Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">Öğe Tipi ve Başlığı</h3>
                     <div className="space-y-2">
                        <Label>Menü Öğesi Tipi</Label>
                        <RadioGroup name="type" value={menuItemType} onValueChange={(value) => setMenuItemType(value as Page['type'])} className="flex gap-4">
                            <div className="flex items-center space-x-2"><RadioGroupItem value="page" id="r1" /><Label htmlFor="r1">Sayfa (İçerik var)</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="link" id="r2" /><Label htmlFor="r2">Bağlantı (URL)</Label></div>
                            <div className="flex items-center space-x-2"><RadioGroupItem value="container" id="r3" /><Label htmlFor="r3">Kapsayıcı (Alt menüler için)</Label></div>
                        </RadioGroup>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="title">Menü Başlığı</Label>
                        <Input id="title" name="title" value={title} onChange={handleTitleChange} placeholder="Örn: Hakkımızda" required />
                    </div>
                </div>

                <Separator />

                {/* Section 2: Link settings */}
                 <div className="space-y-4 animate-in fade-in duration-300">
                    <h3 className="text-lg font-medium text-foreground">Bağlantı Ayarları</h3>
                     {menuItemType === 'page' && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                            <Label htmlFor="slug">URL Adresi (Slug)</Label>
                            <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="örn: hakkimizda" required />
                             <p className="text-sm text-muted-foreground">Sayfanızın adresi: /p/{slug}</p>
                        </div>
                    )}
                     {menuItemType === 'link' && (
                        <div className="space-y-2 animate-in fade-in duration-300">
                            <Label htmlFor="href">URL Adresi</Label>
                            <Input id="href" name="href" value={href} onChange={(e) => setHref(e.target.value)} placeholder="/kadromuz veya https://google.com" required />
                        </div>
                    )}
                    {menuItemType === 'container' && (
                         <div className="p-4 border rounded-md bg-muted/50 animate-in fade-in duration-300">
                            <p className="text-sm text-muted-foreground">Kapsayıcı öğeler bir sayfaya bağlanmaz. Sadece diğer menü öğelerini gruplamak için kullanılırlar.</p>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Section 3: Menu Settings */}
                <div className="space-y-4">
                    <h3 className="text-lg font-medium text-foreground">Menü Hiyerarşisi</h3>
                    <div className="flex items-center space-x-2 p-4 border rounded-md">
                        <Checkbox id="showInMenu" name="showInMenu" checked={showInMenu} onCheckedChange={(checked) => setShowInMenu(checked as boolean)} />
                        <Label htmlFor="showInMenu" className="cursor-pointer">Bu öğeyi ana menüde göster</Label>
                    </div>
                    {showInMenu && (
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 animate-in fade-in duration-300">
                            <div className="space-y-2">
                                <Label htmlFor="parentId">Üst Menü Öğesi</Label>
                                <Select name="parentId" onValueChange={setSelectedParentId} defaultValue={selectedParentId}>
                                    <SelectTrigger><SelectValue placeholder="Bir üst menü seçin" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="none">Yok (Ana Menü Öğesi)</SelectItem>
                                        {allPages.filter(p => p.id !== page?.id).map(p => (
                                            <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="menuOrder">Menüdeki Sırası</Label>
                                <Input id="menuOrder" name="menuOrder" type="number" defaultValue={page?.menuOrder || 0} placeholder="0" />
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                {/* Section 4: Content Editor */}
                {menuItemType === 'page' && (
                    <div className="space-y-4 animate-in fade-in duration-300">
                        <h3 className="text-lg font-medium text-foreground">Sayfa İçeriği</h3>
                        <div className="p-4 border rounded-md space-y-4">
                            <Label htmlFor="topic">Yapay Zeka İçerik Üretici</Label>
                             <Textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Okulumuzun vizyonu, misyonu ve eğitim anlayışı hakkında detaylı, modern ve profesyonel bir dille yazılmış bir sayfa oluştur." rows={3} />
                             <Button type="button" onClick={handleGenerateContent} disabled={isGenerating}>
                                {isGenerating ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Sparkles className="mr-2 h-4 w-4" />)}
                                AI ile İçerik Üret/Değiştir
                             </Button>
                        </div>
                        
                        <Tabs defaultValue="editor">
                            <TabsList>
                                <TabsTrigger value="editor">Düzenleyici</TabsTrigger>
                                <TabsTrigger value="preview">Önizleme</TabsTrigger>
                            </TabsList>
                            <TabsContent value="editor">
                                {isGenerating && (
                                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground p-8 border rounded-md">
                                        <Wand2 className="h-12 w-12 mb-4 animate-pulse text-primary" />
                                        <p className="text-lg font-medium">Sayfa içeriği oluşturuluyor...</p>
                                    </div>
                                )}
                                <div className={isGenerating ? 'hidden' : 'block'}>
                                   <AiTextEditor content={htmlContent} onContentChange={setHtmlContent} placeholder="İçeriğinizi buraya yazın veya AI ile üretin..." />
                                </div>
                            </TabsContent>
                            <TabsContent value="preview">
                                 <PagePreview htmlContent={htmlContent} />
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </CardContent>
            <CardFooter className="flex justify-end border-t pt-6">
                <SubmitButton isGenerating={isGenerating} />
            </CardFooter>
        </Card>
      </form>
    </div>
  );
}
