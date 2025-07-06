'use server';

import { z } from 'zod';
import { addNewsItem, updateNewsItem, deleteNewsItem } from '@/services/newsService';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().min(1, "Açıklama gerekli"),
  type: z.enum(["Haber", "Etkinlik", "Duyuru"]),
  date: z.string().min(1, "Tarih gerekli"),
  image: z.string().url("Geçerli bir URL olmalı"),
  aiHint: z.string().optional(),
  href: z.string().default('#'),
});

export async function handleFormSubmit(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  // Handle empty optional fields
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
