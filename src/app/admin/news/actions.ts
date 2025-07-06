'use server';

import { z } from 'zod';
import { addNewsItem, updateNewsItem, deleteNewsItem } from '@/services/newsService';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/firebase-storage';

// This schema is used on the server, after the image has been processed.
// The image field must be a URL string.
const serverFormSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().min(1, "Açıklama gerekli"),
  type: z.enum(["Haber", "Etkinlik", "Duyuru"]),
  date: z.string().min(1, "Tarih gerekli"),
  image: z.string().url("Geçerli bir resim URL'si olmalı."),
  aiHint: z.string().optional(),
  href: z.string().default('#'),
});

export async function handleFormSubmit(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  if (rawData.id === '') delete rawData.id;
  if (rawData.aiHint === '') delete rawData.aiHint;

  let imageUrl: string;
  const imageValue = rawData.image as File | string;

  // Check if a new file has been uploaded. A File object will have a 'size' property.
  if (imageValue instanceof File && imageValue.size > 0) {
      try {
          imageUrl = await uploadFile(imageValue, 'news');
      } catch (e: any) {
          console.error("Image upload failed:", e);
          return { success: false, error: 'Resim yüklenirken bir hata oluştu: ' + e.message };
      }
  } else {
      // No new file, so it must be the existing string URL.
      imageUrl = imageValue as string;
  }

  const dataToParse = { ...rawData, image: imageUrl };

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
      await updateNewsItem(id, data);
    } else {
      await addNewsItem(data);
    }
    
    revalidatePath('/');
    revalidatePath('/admin/news');

    return { success: true, error: null };
  } catch (e: any) {
    console.error("Firestore operation failed:", e);
    return {
        success: false,
        error: "Veritabanı işlemi sırasında bir hata oluştu: " + e.message
    };
  }
}

export async function deleteNewsItemAction(id: string) {
    if (!id) {
        return { success: false, error: 'ID gerekli.' };
    }
    try {
        await deleteNewsItem(id);
        revalidatePath('/');
        revalidatePath('/admin/news');
        return { success: true, error: null };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
