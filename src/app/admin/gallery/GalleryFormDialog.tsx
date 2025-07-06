"use client";

import React, { useEffect, useState } from 'react';
import type { GalleryItem } from '@/services/galleryService';
import { useToast } from "@/hooks/use-toast";
import { handleGalleryFormSubmit } from './actions';
import { generateImage } from '@/ai/flows/image-generation';
import { dataURLtoFile } from '@/lib/firebase-storage';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2, Sparkles } from 'lucide-react';

interface GalleryFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingItem: GalleryItem | null;
}

const formSchema = z.object({
  id: z.string().optional(),
  src: z.any().refine(val => (typeof val === 'string' && val.length > 0) || (typeof window !== 'undefined' && val instanceof File), {
    message: "Resim gerekli.",
  }),
  alt: z.string().min(1, "Alternatif metin gerekli"),
  aiHint: z.string().optional().default(''),
});

type GalleryFormValues = z.infer<typeof formSchema>;

export function GalleryFormDialog({ isOpen, setIsOpen, editingItem }: GalleryFormDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      src: '',
      alt: '',
      aiHint: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (editingItem) {
            form.reset({ ...editingItem });
            setImagePreview(editingItem.src);
        } else {
            form.reset({
                id: undefined,
                src: '',
                alt: '',
                aiHint: ''
            });
            setImagePreview(null);
        }
    }
  }, [editingItem, isOpen, form]);
  
  const watchedAlt = form.watch('alt');
  const watchedAiHint = form.watch('aiHint');

  const onSubmit = (values: GalleryFormValues) => {
    const formData = new FormData();
    // Use alt for aiHint if aiHint is empty
    if (!values.aiHint && values.alt) {
        formData.append('aiHint', values.alt.split(' ').slice(0, 2).join(' '));
    }
    
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (key === 'src' && value instanceof File) {
            formData.append(key, value, value.name);
        } else if (typeof value === 'string') {
            formData.append(key, value);
        } else if (key !== 'src') { // append other form values
            formData.append(key, value as string);
        }
      }
    });

    startTransition(async () => {
      const result = await handleGalleryFormSubmit(null, formData);
      if (result.success) {
        toast({
          title: "Başarılı!",
          description: `Galeri öğesi başarıyla ${editingItem ? 'güncellendi' : 'oluşturuldu'}.`,
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
      form.setValue('src', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    const prompt = form.getValues('aiHint') || form.getValues('alt');

    if (!prompt) {
        toast({
            variant: "destructive",
            title: "Hata",
            description: "Görsel üretmek için lütfen bir 'Alternatif Metin' veya 'AI İpucu' girin.",
        });
        return;
    }

    setIsGeneratingImage(true);
    setImagePreview(null);
    try {
        const result = await generateImage({ prompt });
        if (result.imageUrl) {
            const filename = `${prompt.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.png`;
            const file = dataURLtoFile(result.imageUrl, filename);
            form.setValue('src', file, { shouldValidate: true });
            setImagePreview(URL.createObjectURL(file));
            toast({
                title: "Başarılı!",
                description: "Yapay zeka ile görsel başarıyla üretildi ve forma eklendi.",
            });
        }
    } catch (error) {
        console.error("Image generation error:", error);
        toast({
            variant: "destructive",
            title: "Hata!",
            description: "Görsel üretilirken bir hata oluştu. Lütfen tekrar deneyin.",
        });
        setImagePreview(null);
    } finally {
        setIsGeneratingImage(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Galeri Öğesini Düzenle' : 'Yeni Galeri Öğesi Ekle'}</DialogTitle>
          <DialogDescription>Galeri resim bilgilerini buradan yönetin.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
             <FormField
                control={form.control}
                name="src"
                render={() => (
                  <FormItem>
                    <FormLabel>Resim Dosyası</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={handleImageChange} disabled={isPending || isGeneratingImage} />
                    </FormControl>
                    {isGeneratingImage && (
                      <div className="w-full flex justify-center items-center h-48 bg-muted rounded-md">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    {!isGeneratingImage && imagePreview && (
                      <div className="mt-4 relative w-full aspect-video">
                        <Image src={imagePreview} alt="Görsel Önizleme" fill sizes="500px" className="rounded-md object-cover" />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField control={form.control} name="alt" render={({ field }) => (<FormItem><FormLabel>Alternatif Metin (Açıklama)</FormLabel><FormControl><Input {...field} placeholder="Örn: Bilim Fuarı'ndan bir kare" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="aiHint" render={({ field }) => (<FormItem><FormLabel>AI İpucu (isteğe bağlı)</FormLabel><FormControl><Input {...field} placeholder="e.g. science fair students" /></FormControl><FormMessage /></FormItem>)} />
            
            <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleGenerateImage}
                disabled={isPending || isGeneratingImage || (!watchedAlt && !watchedAiHint)}
                >
                {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                Yapay Zeka ile Görsel Üret ve Değiştir
            </Button>

            <DialogFooter>
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
