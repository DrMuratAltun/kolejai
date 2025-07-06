
"use client";

import React, { useEffect } from 'react';
import type { StaffMember } from '@/services/staffService';
import { useToast } from "@/hooks/use-toast";
import { handleStaffFormSubmit } from './actions';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from 'react-hook-form';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

interface StaffFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingStaff: StaffMember | null;
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "İsim gerekli"),
  role: z.string().min(1, "Rol gerekli"),
  department: z.string().min(1, "Departman gerekli"),
  bio: z.string().min(1, "Biyografi gerekli"),
  image: z.string().url({ message: "Geçerli bir resim URL'si giriniz." }),
  aiHint: z.string().optional().default(''),
});

type StaffFormValues = z.infer<typeof formSchema>;

export function StaffFormDialog({ isOpen, setIsOpen, editingStaff }: StaffFormDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', role: '', department: '', bio: '',
      image: 'https://placehold.co/400x400.png', aiHint: ''
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (editingStaff) {
            form.reset({
                ...editingStaff,
            });
        } else {
            form.reset({
                id: undefined, name: '', role: '', department: '', bio: '',
                image: 'https://placehold.co/400x400.png', aiHint: ''
            });
        }
    }
  }, [editingStaff, isOpen, form]);

  const onSubmit = (values: StaffFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value as string);
      }
    });

    startTransition(async () => {
      const result = await handleStaffFormSubmit(null, formData);
      if (result.success) {
        toast({
          title: "Başarılı!",
          description: `Personel başarıyla ${editingStaff ? 'güncellendi' : 'oluşturuldu'}.`,
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
          <DialogTitle>{editingStaff ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</DialogTitle>
          <DialogDescription>Personel bilgilerini buradan yönetin.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>İsim Soyisim</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="role" render={({ field }) => (<FormItem><FormLabel>Rol</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="department" render={({ field }) => (<FormItem><FormLabel>Departman</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Biyografi</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="image" render={({ field }) => (<FormItem><FormLabel>Resim URL</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
            <FormField control={form.control} name="aiHint" render={({ field }) => (<FormItem><FormLabel>AI İpucu (isteğe bağlı)</FormLabel><FormControl><Input {...field} placeholder="e.g. woman teacher" /></FormControl><FormMessage /></FormItem>)} />
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
