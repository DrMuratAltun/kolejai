"use client";

import React, { useEffect, useState } from 'react';
import type { NewsItem } from '@/services/newsService';
import { useToast } from "@/hooks/use-toast";
import { handleFormSubmit } from './actions';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Loader2 } from 'lucide-react';
import AiTextEditor from '@/components/ai/AiTextEditor';
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";


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
  
  const form = useForm<NewsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '', description: '', type: 'Haber', date: format(new Date(), 'yyyy-MM-dd'),
      image: 'https://placehold.co/600x400.png', aiHint: '', href: '#'
    }
  });

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
    const formData = new FormData();
    // Append all values to FormData, including the file object
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>{editingNews ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}</DialogTitle>
          <DialogDescription>Haber, etkinlik veya duyuru bilgilerini buradan yönetin.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Başlık</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Açıklama</FormLabel>
                  <FormControl>
                    <AiTextEditor form={form} fieldName="description" initialValue={field.value} />
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
            
            <FormItem>
              <FormLabel>Görsel</FormLabel>
              <FormControl>
                <Input type="file" accept="image/*" onChange={handleImageChange} />
              </FormControl>
              {imagePreview && (
                <div className="mt-4">
                  <Image src={imagePreview} alt="Görsel Önizleme" width={200} height={120} className="rounded-md object-cover"/>
                </div>
              )}
              <FormMessage />
            </FormItem>

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
