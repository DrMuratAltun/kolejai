
'use server';

import { z } from 'zod';
import { addStaffMember, updateStaffMember, deleteStaffMember, updateStaffParent, type StaffMemberData } from '@/services/staffService';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/firebase-storage';
import { v4 as uuidv4 } from 'uuid';

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
  const rawData: { [k: string]: any } = {};
  formData.forEach((value, key) => {
    rawData[key] = value;
  });
  
  if (rawData.id === '') delete rawData.id;

  const imageValue = rawData.photo as File | string;

  if (imageValue instanceof File && imageValue.size > 0) {
      try {
          rawData.photo = await uploadFile(imageValue, 'staff');
      } catch (e: any) {
          return { success: false, error: 'Resim yüklenirken bir hata oluştu: ' + e.message };
      }
  }

  const parsed = serverFormSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map(e => e.message).join(', ')
    };
  }

  try {
    const { id, ...data } = parsed.data;
    
    const dataToSave: StaffMemberData = {
        name: data.name,
        title: data.title,
        department: data.department,
        description: data.description || '',
        photo: data.photo || '',
        aiHint: data.aiHint || '',
        parentId: data.parentId
    };

    if (id) {
      await updateStaffMember(id, dataToSave);
    } else {
      await addStaffMember({ ...dataToSave, id: uuidv4() });
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
