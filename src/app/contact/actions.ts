'use server';
import { z } from 'zod';
import { addSubmission } from '@/services/submissionService';

const formSchema = z.object({
  parentName: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır." }),
  phone: z.string().min(10, { message: "Geçerli bir telefon numarası giriniz." }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
  studentName: z.string().min(2, { message: "Öğrenci ismi en az 2 karakter olmalıdır." }),
  grade: z.string({ required_error: "Lütfen bir sınıf seçin."}),
  source: z.string().optional(),
  message: z.string().optional(),
  kvkk: z.boolean().default(false).refine(val => val === true, { message: "Devam etmek için KVKK metnini onaylamalısınız." }),
});

export async function handleContactSubmitAction(data: unknown) {
    const parsed = formSchema.safeParse(data);

    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.errors.map((e) => e.message).join(', '),
        };
    }

    try {
        await addSubmission(parsed.data);
        return { success: true, error: null };
    } catch (e: any) {
        return {
            success: false,
            error: e.message,
        };
    }
}
