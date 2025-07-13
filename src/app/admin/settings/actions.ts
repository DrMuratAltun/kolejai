
'use server';

import { z } from 'zod';
import { getSiteSettings, updateSiteSettings } from '@/services/settingsService';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/firebase-storage';

// This schema validates the final object, not the raw form data
const settingsSchema = z.object({
  schoolName: z.string().min(1, 'Okul adı gerekli.'),
  logoUrl: z.string().url().or(z.literal('')),
  logoDisplayMode: z.enum(['contain', 'cover']),
  heroBannerUrl: z.string().url().or(z.literal('')),
  showHeroBanner: z.boolean(),
  address: z.string().min(1, 'Adres gerekli.'),
  phone: z.string().min(1, 'Telefon gerekli.'),
  email: z.string().email('Geçerli bir e-posta adresi girin.'),
  socialLinks: z.object({
    facebook: z.string().url().or(z.literal('')).optional(),
    twitter: z.string().url().or(z.literal('')).optional(),
    instagram: z.string().url().or(z.literal('')).optional(),
    linkedin: z.string().url().or(z.literal('')).optional(),
  }),
});


export async function handleSettingsFormSubmit(prevState: any, formData: FormData) {
  try {
    const currentSettings = await getSiteSettings();

    // Handle file uploads first to get URLs
    const logoFile = formData.get('logo') as File | null;
    let logoUrl = formData.get('logoUrl') as string;
    if (logoFile && logoFile.size > 0) {
        logoUrl = await uploadFile(logoFile, 'settings');
    }
    
    const bannerFile = formData.get('heroBanner') as File | null;
    let heroBannerUrl = formData.get('heroBannerUrl') as string;
    if (bannerFile && bannerFile.size > 0) {
        heroBannerUrl = await uploadFile(bannerFile, 'settings');
    }
    
    // Build the potential new settings object by merging form data over current settings
    // This handles fields in inactive (unmounted) tabs
    const dataToValidate = {
        schoolName: formData.get('schoolName') ?? currentSettings.schoolName,
        logoUrl: logoUrl,
        logoDisplayMode: formData.get('logoDisplayMode') ?? currentSettings.logoDisplayMode,
        heroBannerUrl: heroBannerUrl,
        showHeroBanner: formData.has('heroBanner') ? (formData.get('showHeroBanner') === 'on') : currentSettings.showHeroBanner,
        address: formData.get('address') ?? currentSettings.address,
        phone: formData.get('phone') ?? currentSettings.phone,
        email: formData.get('email') ?? currentSettings.email,
        socialLinks: {
            facebook: formData.get('socialLinks.facebook') ?? currentSettings.socialLinks?.facebook,
            twitter: formData.get('socialLinks.twitter') ?? currentSettings.socialLinks?.twitter,
            instagram: formData.get('socialLinks.instagram') ?? currentSettings.socialLinks?.instagram,
            linkedin: formData.get('socialLinks.linkedin') ?? currentSettings.socialLinks?.linkedin,
        }
    };
    
    // Ensure no undefined values are passed to Zod or Firestore
    // Coalesce undefined to empty strings for optional fields
    dataToValidate.socialLinks.facebook = dataToValidate.socialLinks.facebook || '';
    dataToValidate.socialLinks.twitter = dataToValidate.socialLinks.twitter || '';
    dataToValidate.socialLinks.instagram = dataToValidate.socialLinks.instagram || '';
    dataToValidate.socialLinks.linkedin = dataToValidate.socialLinks.linkedin || '';
    dataToValidate.logoUrl = dataToValidate.logoUrl || '';
    dataToValidate.heroBannerUrl = dataToValidate.heroBannerUrl || '';


    // Now validate the complete, merged object
    const parsed = settingsSchema.safeParse(dataToValidate);
    
    if (!parsed.success) {
      return { success: false, message: parsed.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ') };
    }
    
    // Save the valid data
    await updateSiteSettings(parsed.data);
    
    // Aggressive revalidation to ensure cache is cleared everywhere.
    // This forces Next.js to re-fetch the settings on the next visit to any of these pages.
    revalidatePath('/', 'layout'); // Revalidates the root layout, affecting all pages.
    revalidatePath('/'); // Specifically revalidate the homepage.
    revalidatePath('/gallery');
    revalidatePath('/staff');
    revalidatePath('/contact');

    return { success: true, message: 'Ayarlar başarıyla güncellendi.' };
  } catch (e: any) {
    return {
        success: false,
        message: "Ayarlar güncellenirken bir hata oluştu: " + e.message
    };
  }
}
