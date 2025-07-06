'use server';

import { z } from 'zod';
import { addNewsItem, updateNewsItem, deleteNewsItem } from '@/services/newsService';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/firebase-storage';

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().min(1, "Açıklama gerekli"),
  type: z.enum(["Haber", "Etkinlik", "Duyuru"]),
  date: z.string().min(1, "Tarih gerekli"),
  image: z.any(),
  aiHint: z.string().optional(),
  href: z.string().default('#'),
});

export async function handleFormSubmit(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  if (rawData.id === '') delete rawData.id;
  if (rawData.aiHint === '') delete rawData.aiHint;

  let imageUrl = rawData.image as string | File;
  if (rawData.image instanceof File) {
      try {
          imageUrl = await uploadFile(rawData.image, 'news');
      } catch (e: any) {
          return { success: false, error: 'Resim yüklenirken bir hata oluştu: ' + e.message };
      }
  }

  const dataToParse = { ...rawData, image: imageUrl };

  const parsed = formSchema.safeParse(dataToParse);

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
    return {
        success: false,
        error: e.message
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
