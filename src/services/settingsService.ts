
'use server';

import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { unstable_noStore as noStore } from 'next/cache';

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface SiteSettings {
  id: string;
  schoolName: string;
  logoUrl: string;
  logoDisplayMode: 'contain' | 'cover';
  heroBannerUrl: string;
  showHeroBanner: boolean;
  address: string;
  phone: string;
  email: string;
  socialLinks: SocialLinks;
  updatedAt?: string | null;
}

export type SiteSettingsData = Omit<SiteSettings, 'id' | 'updatedAt'>;

const settingsDocRef = doc(db, "settings", "global");

const fromFirestore = (snapshot: any): SiteSettings => {
  const data = snapshot.data();
  const updatedAtTimestamp = data.updatedAt;
  return {
    id: snapshot.id,
    schoolName: data.schoolName || 'Bilge Yıldız Koleji',
    logoUrl: data.logoUrl || 'https://placehold.co/150x150.png',
    logoDisplayMode: data.logoDisplayMode || 'contain',
    heroBannerUrl: data.heroBannerUrl || 'https://placehold.co/1200x400.png',
    showHeroBanner: data.showHeroBanner === undefined ? true : data.showHeroBanner,
    address: data.address || '',
    phone: data.phone || '',
    email: data.email || '',
    socialLinks: data.socialLinks || {},
    updatedAt: updatedAtTimestamp ? (updatedAtTimestamp.toDate() as Date).toISOString() : null,
  };
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    noStore();
    try {
        const docSnap = await getDoc(settingsDocRef);
        if (!docSnap.exists()) {
            const defaultSettings: SiteSettingsData = {
                schoolName: 'Bilge Yıldız Koleji',
                logoUrl: 'https://placehold.co/150x150.png',
                logoDisplayMode: 'contain',
                heroBannerUrl: 'https://placehold.co/1200x400.png',
                showHeroBanner: true,
                address: 'Örnek Mah. Okul Sk. No:123, 34762 Üsküdar/İstanbul',
                phone: '+90 (216) 123 45 67',
                email: 'info@bilgeyildiz.com',
                socialLinks: {
                    facebook: '#', twitter: '#', instagram: '#', linkedin: '#'
                }
            };
            await setDoc(settingsDocRef, defaultSettings);
            return fromFirestore({ id: 'global', data: () => defaultSettings });
        }
        return fromFirestore(docSnap);
    } catch (error) {
        console.error("Error fetching site settings:", error);
        throw new Error("Site ayarları alınamadı.");
    }
};

export const updateSiteSettings = async (data: Partial<SiteSettingsData>) => {
  return await setDoc(settingsDocRef, {
      ...data,
      updatedAt: serverTimestamp()
  }, { merge: true });
};
