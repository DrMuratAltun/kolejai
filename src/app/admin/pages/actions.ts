'use server';

import { z } from 'zod';
import { addPage, updatePage, PageData } from '@/services/pageService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Başlık gerekli'),
  slug: z.string().min(1, 'URL adresi gerekli'),
  htmlContent: z.string().min(1, 'Sayfa içeriği boş olamaz'),
  showInMenu: z.preprocess((val) => val === 'on', z.boolean()).optional().default(false),
  parentId: z.string().optional(),
  menuOrder: z.coerce.number().default(0),
});

export async function savePageAction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  if (rawData.id === '') delete rawData.id;
  
  const parsed = formSchema.safeParse(rawData);
  
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const { id, ...data } = parsed.data;
    
    const dataToSave: Partial<PageData> = {
        ...data,
        parentId: data.parentId === 'none' || !data.parentId ? null : data.parentId,
    };
    
    if (id) {
      await updatePage(id, dataToSave);
    } else {
      await addPage(dataToSave as PageData);
    }

    revalidatePath('/admin/pages');
    revalidatePath(`/p/${data.slug}`);
    revalidatePath('/'); // Revalidate home page to update header menu
  } catch (e: any) {
    return {
      success: false,
      error: 'Veritabanı işlemi sırasında bir hata oluştu: ' + e.message,
    };
  }
  
  // Redirect after successful save
  redirect('/admin/pages');
}
