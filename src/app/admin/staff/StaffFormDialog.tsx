
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
import { Loader2, User, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface StaffFormDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  editingStaff: StaffMember | null;
  allStaffMembers: StaffMember[];
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "İsim gerekli"),
  title: z.string().min(1, "Rol/Unvan gerekli"),
  department: z.string().min(1, "Departman gerekli"),
  description: z.string().optional(),
  photo: z.any()
    .refine(
      (value) => {
        if (!value || typeof value === 'string') return true;
        if (value instanceof File) return value.size <= MAX_FILE_SIZE;
        return false;
      },
      `Maksimum dosya boyutu 2MB'dir.`
    ).optional(), // Removed the strict MIME type validation
  aiHint: z.string().optional().default(''),
  parentId: z.string().optional(),
});


type StaffFormValues = z.infer<typeof formSchema>;

export function StaffFormDialog({ isOpen, setIsOpen, editingStaff, allStaffMembers }: StaffFormDialogProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const form = useForm<StaffFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '', title: '', department: '', description: '',
      photo: '', 
      aiHint: '', parentId: 'none'
    }
  });

  useEffect(() => {
    if (isOpen) {
        if (editingStaff) {
            form.reset({
                id: editingStaff.id,
                name: editingStaff.name || '',
                title: editingStaff.title || '',
                department: editingStaff.department || '',
                description: editingStaff.description ?? '',
                photo: editingStaff.photo || '',
                aiHint: editingStaff.aiHint ?? '',
                parentId: editingStaff.parentId || 'none',
            });
            setImagePreview(editingStaff.photo);
        } else {
            form.reset({
                id: undefined,
                name: '',
                title: '',
                department: '',
                description: '',
                photo: '',
                aiHint: '',
                parentId: 'none'
            });
            setImagePreview(null);
        }
    }
  }, [editingStaff, isOpen, form]);

  const onSubmit = (values: StaffFormValues) => {
      const formData = new FormData();

      formData.append('name', values.name);
      formData.append('title', values.title);
      formData.append('department', values.department);
      
      if (values.id) formData.append('id', values.id);
      if (values.description) formData.append('description', values.description);
      if (values.aiHint) formData.append('aiHint', values.aiHint);
      if (values.parentId) formData.append('parentId', values.parentId);

      if (values.photo instanceof File) {
          formData.append('photo', values.photo, values.photo.name);
      } else if (typeof values.photo === 'string') {
          formData.append('photo', values.photo);
      }

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
      <DialogContent className="sm:max-w-[625px] h-[90vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-4 border-b flex-shrink-0">
          <DialogTitle>{editingStaff ? 'Personel Düzenle' : 'Yeni Personel Ekle'}</DialogTitle>
          <DialogDescription>Personel bilgilerini buradan yönetin.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col overflow-hidden">
            <div className="flex-grow overflow-y-auto space-y-4 p-6">
              <FormField control={form.control} name="name" render={({ field }) => (<FormItem><FormLabel>İsim Soyisim</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="title" render={({ field }) => (<FormItem><FormLabel>Rol/Unvan</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              <FormField control={form.control} name="department" render={({ field }) => (<FormItem><FormLabel>Departman</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField control={form.control} name="parentId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Yöneticisi</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value ?? 'none'}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Bir yönetici seçin" /></SelectTrigger></FormControl>
                    <SelectContent>
                      <SelectItem value="none">Yok</SelectItem>
                      {allStaffMembers
                        .filter(member => member.id !== editingStaff?.id)
                        .map(member => (
                          <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (<FormItem><FormLabel>Biyografi</FormLabel><FormControl><Textarea {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
              
              <FormField
                control={form.control}
                name="photo"
                render={({ field: { onChange, ...fieldProps } }) => (
                  <FormItem>
                    <FormLabel>Profil Fotoğrafı</FormLabel>
                    <FormControl>
                      <Input
                        {...fieldProps}
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={(event) => {
                          const file = event.target.files?.[0];
                          onChange(file);
                          
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setImagePreview(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          } else {
                            setImagePreview(editingStaff?.photo || null);
                          }
                        }}
                        disabled={isPending}
                      />
                    </FormControl>
                    <div className="mt-4 relative w-32 h-32 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                        {imagePreview ? (
                          <Image 
                            src={imagePreview} 
                            alt="Görsel Önizleme" 
                            fill
                            sizes="128px"
                            className="object-cover"
                          />
                        ) : (
                           <Users className="h-16 w-16 text-muted-foreground" />
                        )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField control={form.control} name="aiHint" render={({ field }) => (<FormItem><FormLabel>AI İpucu (isteğe bağlı)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} placeholder="e.g. woman teacher" /></FormControl><FormMessage /></FormItem>)} />
            </div>
            
            <DialogFooter className="p-6 border-t flex-shrink-0 bg-background">
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
