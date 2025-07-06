"use client";

import React, { useEffect } from 'react';
import type { GalleryItem } from '@/services/galleryService';
import { useToast } from "@/hooks/use-toast";
import { handleGalleryFormSubmit } from './actions';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from 'react-hook-form';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

interface GalleryFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingItem: GalleryItem | null;
}

const formSchema = z.object({
  id: z.string().optional(),
  src: z.string().url({ message: "Geçerli bir resim URL'si giriniz." }),
  alt: z.string().min(1, "Alternatif metin gerekli"),
  aiHint: z.string().optional().default(''),
});

type GalleryFormValues = z.infer<typeof formSchema>;

export function GalleryFormDialog({ isOpen, setIsOpen, editingItem }: GalleryFormDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  
  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      src: 'https://placehold.co/600x400.png',
      alt: '',
      aiHint: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (editingItem) {
            form.reset({ ...editingItem });
        } else {
            form.reset({
                id: undefined,
                src: 'https://placehold.co/600x400.png',
                alt: '',
                aiHint: ''
            });
        }
    }
  }, [editingItem, isOpen, form]);

  const onSubmit = (values: GalleryFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{editingItem ? 'Galeri Öğesini Düzenle' : 'Yeni Galeri Öğesi Ekle'}</DialogTitle>
          <DialogDescription>Galeri resim bilgilerini buradan yönetin.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="src" render={({ field }) => (<FormItem><FormLabel>Resim URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="alt" render={({ field }) => (<FormItem><FormLabel>Alternatif Metin (Açıklama)</FormLabel><FormControl><Input {...field} placeholder="Örn: Bilim Fuarı'ndan bir kare" /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="aiHint" render={({ field }) => (<FormItem><FormLabel>AI İpucu (isteğe bağlı)</FormLabel><FormControl><Input {...field} placeholder="e.g. science fair" /></FormControl><FormMessage /></FormItem>)} />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>İptal</Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Kaydet
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
