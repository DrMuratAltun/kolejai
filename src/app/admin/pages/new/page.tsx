'use client';

import React, { useState } from 'react';
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
import { ArrowLeft, Loader2, Sparkles, Wand2 } from 'lucide-react';
import { generatePageContent } from '@/ai/flows/page-generator';
import { useToast } from '@/hooks/use-toast';
import { savePageAction } from '../actions';

// Helper to generate a URL-friendly slug
const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove all non-word chars
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
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


export default function NewPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [topic, setTopic] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

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
        <h1 className="text-3xl font-bold">Yeni Sayfa Oluştur</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-1">
          <form action={savePageAction}>
            <input type="hidden" name="htmlContent" value={htmlContent} />
            <Card>
              <CardHeader>
                <CardTitle>Sayfa Detayları</CardTitle>
                <CardDescription>
                  Sayfanız için temel bilgileri ve yapay zeka için talimatları
                  buraya girin.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Sayfa Başlığı</Label>
                  <Input
                    id="title"
                    name="title"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="Örn: Hakkımızda"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL Adresi</Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(e) => setSlug(slugify(e.target.value))}
                    placeholder="örn: hakkimizda"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="topic">
                    İçerik Konusu (Yapay Zeka İçin)
                  </Label>
                  <Textarea
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Okulumuzun vizyonu, misyonu ve eğitim anlayışı hakkında detaylı bir sayfa oluştur."
                    rows={5}
                  />
                </div>
                <Button
                  type="button"
                  className="w-full"
                  onClick={handleGenerateContent}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  AI ile İçerik Üret
                </Button>
              </CardContent>
              <CardFooter className="flex justify-end">
                <SubmitButton isGenerating={isGenerating} />
              </CardFooter>
            </Card>
          </form>
        </div>

        {/* Preview Column */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Sayfa Önizlemesi</CardTitle>
              <CardDescription>
                Oluşturulan sayfa burada görünecektir.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg min-h-[60vh] p-4 overflow-y-auto">
                {isGenerating && (
                  <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                    <Wand2 className="h-16 w-16 mb-4 animate-pulse text-primary" />
                    <p className="text-lg font-medium">
                      Sayfa içeriği oluşturuluyor...
                    </p>
                    <p>Bu işlem biraz zaman alabilir.</p>
                  </div>
                )}
                {!isGenerating && !htmlContent && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                        <p>Önizleme burada görünecek.</p>
                    </div>
                )}
                {htmlContent && (
                  <div
                    className="prose dark:prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
