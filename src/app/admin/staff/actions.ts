
'use server';

import { z } from 'zod';
import { addStaffMember, updateStaffMember, deleteStaffMember } from '@/services/staffService';
import { revalidatePath } from 'next/cache';

const formSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "İsim gerekli"),
  role: z.string().min(1, "Rol gerekli"),
  department: z.string().min(1, "Departman gerekli"),
  bio: z.string().min(1, "Biyografi gerekli"),
  image: z.string().url("Geçerli bir URL olmalı"),
  aiHint: z.string().optional(),
});

export async function handleStaffFormSubmit(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
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
      await updateStaffMember(id, data);
    } else {
      await addStaffMember(data as any);
    }
    
    revalidatePath('/staff');
    revalidatePath('/admin/staff');

    return { success: true, error: null };
  } catch (e: any) {
    return {
        success: false,
        error: e.message
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
        return { success: true, error: null };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
