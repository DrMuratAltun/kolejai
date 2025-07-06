
'use server';

import { z } from 'zod';
import { addStaffMember, updateStaffMember, deleteStaffMember, updateStaffParent, type StaffMemberData } from '@/services/staffService';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/firebase-storage';

const serverFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "İsim gerekli"),
  title: z.string().min(1, "Rol/Unvan gerekli"),
  department: z.string().min(1, "Departman gerekli"),
  description: z.string().optional(),
  photo: z.string().optional(),
  aiHint: z.string().optional(),
  parentId: z.string().transform(val => val === 'none' || !val ? null : val).nullable(),
});

export async function handleStaffFormSubmit(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  if (rawData.id === '') delete rawData.id;

  let imageUrl: string = rawData.photo as string;
  const imageValue = rawData.photo as File | string;

  if (imageValue instanceof File && imageValue.size > 0) {
      try {
          imageUrl = await uploadFile(imageValue, 'staff');
      } catch (e: any) {
          return { success: false, error: 'Resim yüklenirken bir hata oluştu: ' + e.message };
      }
  }
  
  const dataToParse = { ...rawData, photo: imageUrl };

  const parsed = serverFormSchema.safeParse(dataToParse);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map(e => e.message).join(', ')
    };
  }

  try {
    const { id, ...data } = parsed.data;
    // Ensure all fields have a default value to maintain data structure consistency
    const dataToSave: StaffMemberData = {
        name: data.name,
        title: data.title,
        department: data.department,
        description: data.description || '',
        photo: data.photo || 'https://placehold.co/400x400.png', // Default placeholder
        aiHint: data.aiHint || '',
        parentId: data.parentId
    };

    if (id) {
      await updateStaffMember(id, dataToSave);
    } else {
      await addStaffMember(dataToSave);
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


export async function updateStaffParentAction(staffId: string, newParentId: string | null) {
    if (!staffId) {
        return { success: false, error: 'Personel ID gerekli.' };
    }
    try {
        await updateStaffParent(staffId, newParentId);
        revalidatePath('/admin/staff/chart');
        revalidatePath('/admin/staff');
        return { success: true, error: null };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
