'use server';

import { z } from 'zod';
import { addPage, updatePage, PageData, deletePage } from '@/services/pageService';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { uploadFile } from '@/lib/firebase-storage';

const baseSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Başlık gerekli'),
  showInMenu: z.preprocess((val) => val === 'on', z.boolean()).optional().default(false),
  parentId: z.string().optional(),
  menuOrder: z.coerce.number().default(0),
});

const formSchema = z.discriminatedUnion("type", [
  baseSchema.extend({
    type: z.literal('page'),
    slug: z.string().min(1, 'URL adresi (slug) gerekli'),
    htmlContent: z.string().optional(), // Can be empty initially
    href: z.string().optional(),
  }),
  baseSchema.extend({
    type: z.literal('link'),
    href: z.string().min(1, 'URL adresi gerekli'),
    slug: z.string().optional(),
    htmlContent: z.string().optional(),
  }),
  baseSchema.extend({
    type: z.literal('container'),
    slug: z.string().optional(),
    href: z.string().optional(),
    htmlContent: z.string().optional(),
  }),
]);


export async function savePageAction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  if (rawData.id === '') delete rawData.id;
  
  const parsed = formSchema.safeParse(rawData);
  
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', '),
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
  
  redirect('/admin/pages');
}

export async function updatePageOrderAndParentAction(pageId: string, parentId: string | null, menuOrder: number) {
  try {
    await updatePage(pageId, { parentId, menuOrder });
    revalidatePath('/admin/pages');
    revalidatePath('/');
    return { success: true, error: null };
  } catch (e: any) {
    console.error("Error updating page parent:", e);
    return { success: false, error: e.message };
  }
}

export async function deletePageAction(id: string) {
    try {
        await deletePage(id);
        revalidatePath('/admin/pages');
        revalidatePath('/');
        return { success: true };
    } catch (e: any) {
        console.error("Error deleting page:", e);
        return { success: false, error: e.message };
    }
}

export async function uploadEditorImageAction(formData: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  const file = formData.get('image') as File | null;

  if (!file) {
    return { success: false, error: 'Resim dosyası bulunamadı.' };
  }

  try {
    const url = await uploadFile(file, 'editor-content');
    return { success: true, url };
  } catch (error: any) {
    return { success: false, error: error.message || 'Resim yüklenemedi.' };
  }
}
