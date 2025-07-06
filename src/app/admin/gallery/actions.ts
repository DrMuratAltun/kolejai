'use server';

import { z } from 'zod';
import { addGalleryItem, updateGalleryItem, deleteGalleryItem } from '@/services/galleryService';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/firebase-storage';

// Schema for server-side validation (after file upload)
const serverFormSchema = z.object({
    id: z.string().optional(),
    src: z.string().url("Geçerli bir resim URL'si olmalı."),
    alt: z.string().min(1, "Alternatif metin gerekli"),
    aiHint: z.string().optional(),
});


export async function handleGalleryFormSubmit(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  if (rawData.id === '') delete rawData.id;
  if (rawData.aiHint === '') delete rawData.aiHint;
  
  let imageUrl: string;
  const imageValue = rawData.src as File | string;

  // Check if a new file has been uploaded
  if (imageValue instanceof File && imageValue.size > 0) {
      try {
          imageUrl = await uploadFile(imageValue, 'gallery');
      } catch (e: any) {
          return { success: false, error: 'Resim yüklenirken bir hata oluştu: ' + e.message };
      }
  } else if (typeof imageValue === 'string' && imageValue.startsWith('http')) {
      // It's an existing URL from an un-edited item
      imageUrl = imageValue;
  } else {
      return { success: false, error: 'Geçerli bir resim dosyası veya URLsi sağlanmadı.' };
  }

  const dataToParse = { ...rawData, src: imageUrl };
  const parsed = serverFormSchema.safeParse(dataToParse);

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
