
'use server';

import { z } from 'zod';
import { addStaffMember, updateStaffMember, deleteStaffMember, type StaffMemberData } from '@/services/staffService';
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
  
  // Handle managerId: if it's 'none' or missing, it should be null.
  const managerValue = rawData.managerId as string | undefined;
  const processedManagerId = managerValue === 'none' || !managerValue ? null : managerValue;

  const dataToParse = { ...rawData, image: imageUrl, managerId: processedManagerId };

  const parsed = serverFormSchema.safeParse(dataToParse);

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.errors.map(e => e.message).join(', ')
    };
  }

  try {
    const { id, ...data } = parsed.data;
    
    // Construct a final, type-safe payload for the database service.
    // This prevents `undefined` values from being sent to Firestore.
    const finalPayload: StaffMemberData = {
        name: data.name,
        role: data.role,
        department: data.department,
        bio: data.bio,
        image: data.image,
        aiHint: data.aiHint || '',
        managerId: data.managerId ?? null,
    };

    if (id) {
      await updateStaffMember(id, finalPayload);
    } else {
      await addStaffMember(finalPayload);
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
