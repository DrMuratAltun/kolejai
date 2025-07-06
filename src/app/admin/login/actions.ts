"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";

const schema = z.object({
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
  password: z.string().min(1, { message: "Şifre boş olamaz." }),
});

export async function loginAction(prevState: any, formData: FormData) {
  const parsed = schema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return { success: false, message: parsed.error.errors.map(e => e.message).join(', ') };
  }

  const { email, password } = parsed.data;

  // This is a simple placeholder authentication.
  // In a real application, you should use a proper authentication provider
  // like Firebase Auth and validate credentials securely.
  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    cookies().set("session", "authenticated", { expires, httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    redirect("/admin/dashboard");
  }

  return { success: false, message: "E-posta veya şifre hatalı." };
}
