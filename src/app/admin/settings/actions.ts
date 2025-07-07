
'use server';

import { z } from 'zod';
import { updateSiteSettings } from '@/services/settingsService';
import { revalidatePath } from 'next/cache';
import { uploadFile } from '@/lib/firebase-storage';

const formSchema = z.object({
  schoolName: z.string().min(1, 'Okul adı gerekli.'),
  logoUrl: z.string().optional(),
  heroBannerUrl: z.string().optional(),
  address: z.string().min(1, 'Adres gerekli.'),
  phone: z.string().min(1, 'Telefon gerekli.'),
  email: z.string().email('Geçerli bir e-posta adresi girin.'),
  'socialLinks.facebook': z.string().url().or(z.literal('')).optional(),
  'socialLinks.twitter': z.string().url().or(z.literal('')).optional(),
  'socialLinks.instagram': z.string().url().or(z.literal('')).optional(),
  'socialLinks.linkedin': z.string().url().or(z.literal('')).optional(),
});


export async function handleSettingsFormSubmit(prevState: any, formData: FormData) {
  const rawData: { [k: string]: any } = {};
  formData.forEach((value, key) => {
      rawData[key] = value;
  });

  try {
      // Handle file uploads
      const logoFile = formData.get('logo') as File | null;
      const bannerFile = formData.get('heroBanner') as File | null;

      let logoUrl = formData.get('logoUrl') as string;
      if (logoFile && logoFile.size > 0) {
          logoUrl = await uploadFile(logoFile, 'settings');
      }
      
      let heroBannerUrl = formData.get('heroBannerUrl') as string;
      if (bannerFile && bannerFile.size > 0) {
          heroBannerUrl = await uploadFile(bannerFile, 'settings');
      }

      const dataToSave = {
          schoolName: rawData.schoolName,
          logoUrl: logoUrl,
          heroBannerUrl: heroBannerUrl,
          address: rawData.address,
          phone: rawData.phone,
          email: rawData.email,
          socialLinks: {
              facebook: rawData['socialLinks.facebook'],
              twitter: rawData['socialLinks.twitter'],
              instagram: rawData['socialLinks.instagram'],
              linkedin: rawData['socialLinks.linkedin'],
          }
      };

      await updateSiteSettings(dataToSave);
      
      revalidatePath('/', 'layout');

      return { success: true, message: 'Ayarlar başarıyla güncellendi.' };
  } catch (e: any) {
    return {
        success: false,
        message: "Ayarlar güncellenirken bir hata oluştu: " + e.message
    };
  }
}
