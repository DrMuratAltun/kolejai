
"use client";

import React, { useEffect, useState } from 'react';
import type { StaffMember } from '@/services/staffService';
import { useToast } from "@/hooks/use-toast";
import { handleStaffFormSubmit } from './actions';
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StaffFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingStaff: StaffMember | null;
  allStaffMembers: StaffMember[];
}

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "İsim gerekli"),
  role: z.string().min(1, "Rol gerekli"),
  department: z.string().min(1, "Departman gerekli"),
  bio: z.string().min(1, "Biyografi gerekli"),
  image: z.any().refine(val => (typeof val === 'string' && val.length > 0) || (typeof window !== 'undefined' && val instanceof File), {
    message: "Resim gerekli.",
  }),
  aiHint: z.string().optional().default(''),
  managerId: z.string().optional(),
});

type StaffFormValues = z.infer<typeof formSchema>;

export function StaffFormDialog({ isOpen, setIsOpen, editingStaff, allStaffMembers }: StaffFormDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', role: '', department: '', bio: '',
      image: 'https://placehold.co/400x400.png', aiHint: '', managerId: 'none'
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (editingStaff) {
            form.reset({
                ...editingStaff,
                managerId: editingStaff.managerId || 'none'
            });
            setImagePreview(editingStaff.image);
        } else {
            form.reset({
                id: undefined, name: '', role: '', department: '', bio: '',
                image: 'https://placehold.co/400x400.png', aiHint: '', managerId: 'none'
            });
            setImagePreview('https://placehold.co/400x400.png');
        }
    }
  }, [editingStaff, isOpen, form]);

  const onSubmit = (values: StaffFormValues) => {
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

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue('image', file, { shouldValidate: true });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
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
            
            <FormField control={form.control} name="managerId" render={({ field }) => (
              <FormItem>
                <FormLabel>Yöneticisi</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Bir yönetici seçin" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">Yok</SelectItem>
                    {allStaffMembers
                      .filter(member => member.id !== editingStaff?.id) // Can't be your own manager
                      .map(member => (
                        <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="bio" render={({ field }) => (<FormItem><FormLabel>Biyografi</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
            
            <FormField
                control={form.control}
                name="image"
                render={() => (
                  <FormItem>
                    <FormLabel>Profil Fotoğrafı</FormLabel>
                    <FormControl>
                      <Input type="file" accept="image/*" onChange={handleImageChange} disabled={isPending} />
                    </FormControl>
                    {imagePreview && (
                      <div className="mt-4 relative w-32 h-32">
                        <Image 
                          src={imagePreview} 
                          alt="Görsel Önizleme" 
                          fill
                          sizes="128px"
                          className="rounded-full object-cover"
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

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
