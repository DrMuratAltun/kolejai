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
import { ArrowLeft, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generatePageContent } from '@/ai/flows/page-generator';
import { useToast } from '@/hooks/use-toast';
import { savePageAction } from './actions';
import type { Page } from '@/services/pageService';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import dynamic from 'next/dynamic';

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
    .replace(/\s+/g, '-') 
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};


function SubmitButton({ isGenerating }: { isGenerating: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending || isGenerating}>
      {(pending || isGenerating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Sayfayı Kaydet
    </Button>
  );
}

interface PageEditorProps {
    page?: Page;
    allPages: Page[];
}

export default function PageEditor({ page, allPages }: PageEditorProps) {
  const { toast } = useToast();
  
  const [title, setTitle] = useState(page?.title || '');
  const [slug, setSlug] = useState(page?.slug || '');
  const [topic, setTopic] = useState('');
  const [htmlContent, setHtmlContent] = useState(page?.htmlContent || '');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState(page?.parentId || 'none');

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
    setSlug(slugify(newTitle));
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
        <h1 className="text-3xl font-bold">{page ? 'Sayfayı Düzenle' : 'Yeni Sayfa Oluştur'}</h1>
      </div>
      
      <form action={formAction}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
                <input type="hidden" name="id" value={page?.id || ''} />
                <input type="hidden" name="htmlContent" value={htmlContent} />
                <input type="hidden" name="parentId" value={selectedParentId} />

                <Card>
                <CardHeader>
                    <CardTitle>Sayfa Detayları</CardTitle>
                    <CardDescription>
                    {page ? 'Sayfa bilgilerini güncelleyin.' : 'Sayfanız için temel bilgileri ve yapay zeka için talimatları buraya girin.'}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="title">Sayfa Başlığı</Label>
                        <Input id="title" name="title" value={title} onChange={handleTitleChange} placeholder="Örn: Hakkımızda" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">URL Adresi</Label>
                        <Input id="slug" name="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="örn: hakkimizda" required />
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Menü Ayarları</Label>
                        <div className="border p-3 rounded-md space-y-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="showInMenu" name="showInMenu" defaultChecked={page?.showInMenu || false} />
                                <Label htmlFor="showInMenu">Ana menüde göster</Label>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="parentId">Üst Menü</Label>
                                <Select onValueChange={setSelectedParentId} defaultValue={selectedParentId}>
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
                                <Label htmlFor="menuOrder">Menü Sırası</Label>
                                <Input id="menuOrder" name="menuOrder" type="number" defaultValue={page?.menuOrder || 0} placeholder="0" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2 pt-4">
                        <Label htmlFor="topic">İçerik Konusu (Yapay Zeka İçin)</Label>
                        <Textarea id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="Okulumuzun vizyonu, misyonu ve eğitim anlayışı hakkında detaylı bir sayfa oluştur." rows={5} />
                    </div>
                    <Button type="button" className="w-full" onClick={handleGenerateContent} disabled={isGenerating}>
                    {isGenerating ? (<Loader2 className="mr-2 h-4 w-4 animate-spin" />) : (<Sparkles className="mr-2 h-4 w-4" />)}
                    AI ile İçerik Üret/Değiştir
                    </Button>
                </CardContent>
                <CardFooter className="flex justify-end">
                    <SubmitButton isGenerating={isGenerating} />
                </CardFooter>
                </Card>
            </div>

            <div className="lg:col-span-2">
                <Card className="h-full">
                <CardHeader>
                    <CardTitle>Sayfa İçeriği</CardTitle>
                    <CardDescription>İçeriği burada düzenleyebilirsiniz.</CardDescription>
                </CardHeader>
                <CardContent>
                    {isGenerating && (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-8">
                            <Wand2 className="h-16 w-16 mb-4 animate-pulse text-primary" />
                            <p className="text-lg font-medium">Sayfa içeriği oluşturuluyor...</p>
                            <p>Bu işlem biraz zaman alabilir.</p>
                        </div>
                    )}
                    <div className={isGenerating ? 'hidden' : 'block'}>
                       <AiTextEditor content={htmlContent} onContentChange={setHtmlContent} placeholder="İçeriğinizi buraya yazın veya AI ile üretin..." />
                    </div>
                </CardContent>
                </Card>
            </div>
        </div>
      </form>
    </div>
  );
}
