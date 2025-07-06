"use client";

import React, { useEffect } from 'react';
import type { NewsItem } from '@/services/newsService';
import { useToast } from "@/hooks/use-toast";
import { handleFormSubmit } from './actions';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from 'react-hook-form';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

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
  image: z.string().url({ message: "Geçerli bir resim URL'si giriniz." }),
  aiHint: z.string().optional().default(''),
  href: z.string().default('#'),
});

type NewsFormValues = z.infer<typeof formSchema>;

export function NewsFormDialog({ isOpen, setIsOpen, editingNews }: NewsFormDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '', description: '', type: 'Haber', date: new Date().toLocaleDateString('fr-CA'), // YYYY-MM-DD
      image: 'https://placehold.co/600x400.png', aiHint: '', href: '#'
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (editingNews) {
            form.reset({
                ...editingNews,
            });
        } else {
            form.reset({
                id: undefined, title: '', description: '', type: 'Haber', date: new Date().toLocaleDateString('fr-CA'),
                image: 'https://placehold.co/600x400.png', aiHint: '', href: '#'
            });
        }
    }
  }, [editingNews, isOpen, form]);

  const onSubmit = (values: NewsFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{editingNews ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}</DialogTitle>
          <DialogDescription>Haber, etkinlik veya duyuru bilgilerini buradan yönetin.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Başlık</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Açıklama</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
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
              <FormField control={form.control} name="date" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tarih (GG.AA.YYYY)</FormLabel>
                  <FormControl><Input placeholder="örn: 15.06.2024" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="image" render={({ field }) => (<FormItem><FormLabel>Resim URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="aiHint" render={({ field }) => (<FormItem><FormLabel>AI İpucu (isteğe bağlı)</FormLabel><FormControl><Input {...field} placeholder="e.g. robotics competition" /></FormControl><FormMessage /></FormItem>)} />
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