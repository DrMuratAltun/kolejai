'use server';

import { z } from 'zod';
import { addPage, updatePage } from '@/services/pageService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const formSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Başlık gerekli'),
  slug: z.string().min(1, 'URL adresi gerekli'),
  htmlContent: z.string().min(1, 'Sayfa içeriği boş olamaz'),
  showInMenu: z.preprocess((val) => val === 'on', z.boolean()).optional().default(false),
});

export async function savePageAction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  const parsed = formSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => e.message).join(', '),
    };
  }

  try {
    const { id, ...data } = parsed.data;
    if (id) {
      await updatePage(id, data);
    } else {
      await addPage(data);
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
