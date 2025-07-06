'use server';

import { z } from 'zod';
import { addGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/services/galleryService';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  id: z.string().optional(),
  src: z.string().url("Geçerli bir URL olmalı"),
  alt: z.string().min(1, "Alternatif metin gerekli"),
  aiHint: z.string().optional(),
});

export async function handleGalleryFormSubmit(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  if (rawData.id === '') delete rawData.id;
  if (rawData.aiHint === '') delete rawData.aiHint;

  const parsed = formSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map(e => e.message).join(', ')
    };
  }

  try {
    const { id, ...data } = parsed.data;
    if (id) {
      await updateGalleryItem(id, data);
    } else {
      await addGalleryItem(data as any);
    }
    
    revalidatePath('/gallery');
    revalidatePath('/admin/gallery');

    return { success: true, error: null };
  } catch (e: any) {
    return {
        success: false,
        error: e.message
    };
  }
}

export async function deleteGalleryItemAction(id: string) {
    if (!id) {
        return { success: false, error: 'ID gerekli.' };
    }
    try {
        await deleteGalleryItem(id);
        revalidatePath('/gallery');
        revalidatePath('/admin/gallery');
        return { success: true, error: null };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
