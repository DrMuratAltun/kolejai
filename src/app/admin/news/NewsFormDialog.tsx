
"use client";

import React, { useEffect, useState } from 'react';
import type { NewsItem } from '@/services/newsService';
import { useToast } from "@/hooks/use-toast";
import { handleFormSubmit } from './actions';
import { generateImage } from '@/ai/flows/image-generation';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Loader2, Sparkles } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn, dataURLtoFile } from "@/lib/utils";
import { Skeleton } from '@/components/ui/skeleton';

const AiTextEditor = dynamic(() => import('@/components/ai/AiTextEditor'), {
  ssr: false,
  loading: () => (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-[200px] w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
  ),
});

// Helper to strip HTML tags for AI prompts
const stripHtml = (html: string) => {
  if (typeof window === 'undefined' || !html) return "";
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
}

interface NewsFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingNews: NewsItem | null;
}

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().min(1, "Açıklama gerekli"),
  type: z.enum(["Haber", "Etkinlik", "Duyuru"], { required_error: "Tür seçimi gerekli" }),
  date: z.string().min(1, "Tarih gerekli"),
  image: z.any().refine(val => (typeof val === 'string' && val.length > 0) || (typeof window !== 'undefined' && val instanceof File), {
    message: "Resim gerekli.",
  }),
  aiHint: z.string().optional().default(''),
  href: z.string().default('#'),
});

type NewsFormValues = z.infer<typeof formSchema>;

export function NewsFormDialog({ isOpen, setIsOpen, editingNews }: NewsFormDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '', description: '', type: 'Haber', date: format(new Date(), 'yyyy-MM-dd'),
      image: 'https://placehold.co/600x400.png', aiHint: '', href: '#'
    }
  });
  
  const watchedTitle = form.watch('title');
  const watchedDescription = form.watch('description');
  const isFormEmptyForImageGen = !watchedTitle.trim() && !stripHtml(watchedDescription).trim();


  useEffect(() => {
    if (isOpen) {
        if (editingNews) {
            form.reset({
                ...editingNews,
            });
            setImagePreview(editingNews.image);
        } else {
            form.reset({
                id: undefined, title: '', description: '', type: 'Haber', date: format(new Date(), 'yyyy-MM-dd'),
                image: 'https://placehold.co/600x400.png', aiHint: '', href: '#'
            });
            setImagePreview('https://placehold.co/600x400.png');
        }
    }
  }, [editingNews, isOpen, form]);

  const onSubmit = (values: NewsFormValues) => {
    // Automatically set aiHint from title if it's not set
    if (!values.aiHint && values.title) {
        values.aiHint = values.title.split(' ').slice(0, 2).join(' ');
    }

    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'image' && value instanceof File) {
          formData.append(key, value, value.name);
        } else if (typeof value === 'string') {
          formData.append(key, value);
        }
      }
    });

    startTransition(async () => {
      const result = await handleFormSubmit(null, formData);
      if (result.success) {
        toast({
          title: "Başarılı!",
          description: `Kayıt başarıyla ${editingNews ? 'güncellendi' : 'oluşturuldu'}.`,
        });
        setIsOpen(false);
      } else {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: result.error,
        });
      }
    });
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    const title = form.getValues('title');
    const descriptionHtml = form.getValues('description');
    const descriptionText = stripHtml(descriptionHtml).trim();
    const prompt = descriptionText ? `${title}: ${descriptionText.substring(0, 300)}` : title;

    if (!prompt) {
        toast({
            variant: "destructive",
            title: "Hata",
            description: "Görsel üretmek için lütfen bir başlık veya açıklama girin.",
        });
        return;
    }

    // Set AI Hint from title for the data-ai-hint attribute
    if (title) {
      form.setValue('aiHint', title.split(' ').slice(0, 2).join(' '));
    }

    setIsGeneratingImage(true);
    setImagePreview(null);
    try {
        const result = await generateImage({ prompt });
        if (result.imageUrl) {
            const filename = `${prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
            const file = dataURLtoFile(result.imageUrl, filename);
            form.setValue('image', file, { shouldValidate: true });
            setImagePreview(URL.createObjectURL(file));
            toast({
                title: "Başarılı!",
                description: "Yapay zeka ile görsel başarıyla üretildi.",
            });
        }
    } catch (error) {
        console.error("Image generation error:", error);
        toast({
            variant: "destructive",
            title: "Hata!",
            description: "Görsel üretilirken bir hata oluştu. Lütfen tekrar deneyin.",
        });
        setImagePreview('https://placehold.co/600x400.png'); // Show placeholder on error
    } finally {
        setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>{editingNews ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}</DialogTitle>
          <DialogDescription>Haber, etkinlik veya duyuru bilgilerini buradan yönetin.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow overflow-y-auto space-y-4 p-6">
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Başlık</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Açıklama</FormLabel>
                    <FormControl>
                       <AiTextEditor 
                          content={field.value} 
                          onContentChange={field.onChange} 
                          placeholder="Haber, duyuru veya etkinlik içeriğini buraya yazın..."
                       />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="type" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tür</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Tür seçin" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="Haber">Haber</SelectItem>
                        <SelectItem value="Etkinlik">Etkinlik</SelectItem>
                        <SelectItem value="Duyuru">Duyuru</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col pt-2">
                      <FormLabel>Yayın Tarihi</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(new Date(field.value), "PPP", { locale: tr })
                              ) : (
                                <span>Bir tarih seçin</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value ? new Date(field.value) : undefined}
                            onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : '')}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Görsel</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateImage}
                        disabled={isPending || isGeneratingImage || isFormEmptyForImageGen}
                      >
                        {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                        Yapay Zeka ile Üret
                      </Button>
                    </div>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={handleImageChange} disabled={isPending || isGeneratingImage} />
                    </FormControl>
                    {isGeneratingImage && (
                      <div className="w-full flex justify-center items-center h-32 bg-muted rounded-md">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-8 w-8 animate-spin" />
                          <span>Görsel üretiliyor...</span>
                        </div>
                      </div>
                    )}
                    {!isGeneratingImage && imagePreview && (
                      <div className="mt-4 relative w-[200px] h-[120px]">
                        <Image 
                          src={imagePreview} 
                          alt="Görsel Önizleme" 
                          fill
                          sizes="200px"
                          className="rounded-md object-cover"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="p-6 border-t flex-shrink-0 bg-background">
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>İptal</Button>
              <Button type="submit" disabled={isPending || isGeneratingImage}>
                {(isPending || isGeneratingImage) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
