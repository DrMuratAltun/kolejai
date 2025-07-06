
'use server';

import { z } from 'zod';
import { addStaffMember, updateStaffMember, deleteStaffMember } from '@/services/staffService';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/firebase-storage';

const serverFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "İsim gerekli"),
  role: z.string().min(1, "Rol gerekli"),
  department: z.string().min(1, "Departman gerekli"),
  bio: z.string().min(1, "Biyografi gerekli"),
  image: z.string().url("Geçerli bir resim URL'si olmalı."),
  aiHint: z.string().optional(),
  managerId: z.string().nullable().optional(),
});

export async function handleStaffFormSubmit(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  if (rawData.id === '') delete rawData.id;
  if (rawData.aiHint === '') delete rawData.aiHint;

  let imageUrl: string;
  const imageValue = rawData.image as File | string;

  if (imageValue instanceof File && imageValue.size > 0) {
      try {
          imageUrl = await uploadFile(imageValue, 'staff');
      } catch (e: any) {
          return { success: false, error: 'Resim yüklenirken bir hata oluştu: ' + e.message };
      }
  } else {
      imageUrl = imageValue as string;
  }
  
  const managerId = rawData.managerId === 'none' ? null : rawData.managerId as string | null;

  const dataToParse = { ...rawData, image: imageUrl, managerId };

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
      await updateStaffMember(id, data);
    } else {
      await addStaffMember(data as any);
    }
    
    revalidatePath('/staff');
    revalidatePath('/admin/staff');
    revalidatePath('/admin/staff/chart');

    return { success: true, error: null };
  } catch (e: any) {
    return {
        success: false,
        error: "Veritabanı işlemi sırasında bir hata oluştu: " + e.message
    };
  }
}

export async function deleteStaffMemberAction(id: string) {
    if (!id) {
        return { success: false, error: 'ID gerekli.' };
    }
    try {
        await deleteStaffMember(id);
        revalidatePath('/staff');
        revalidatePath('/admin/staff');
        revalidatePath('/admin/staff/chart');
        return { success: true, error: null };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
