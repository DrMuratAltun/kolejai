
'use client';

import React, { useEffect, useState, useActionState, useCallback } from 'react';
import { useFormStatus } from 'react-dom';
import Image from 'next/image';

import { getSiteSettings, type SiteSettings } from '@/services/settingsService';
import { handleSettingsFormSubmit } from './actions';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Ayarları Kaydet
    </Button>
  );
}

export default function SiteSettingsPage() {
    const { toast } = useToast();
    const [settings, setSettings] = useState<SiteSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("general");

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [state, formAction] = useActionState(handleSettingsFormSubmit, { success: false, message: "" });
    
    const fetchSettingsData = useCallback(() => {
        setIsLoading(true);
        getSiteSettings().then(data => {
            setSettings(data);
            setLogoPreview(data.logoUrl);
            setBannerPreview(data.heroBannerUrl);
            setIsLoading(false);
        }).catch(err => {
            toast({ variant: 'destructive', title: 'Hata', description: 'Site ayarları yüklenemedi.' });
            setIsLoading(false);
        });
    }, [toast]);

    useEffect(() => {
        fetchSettingsData();
    }, [fetchSettingsData]);

    useEffect(() => {
        if (state.message) {
            if (state.success) {
                toast({ title: 'Başarılı!', description: state.message });
                fetchSettingsData(); // Re-fetch data on success
            } else {
                toast({ variant: 'destructive', title: 'Hata!', description: state.message });
            }
        }
    }, [state, toast, fetchSettingsData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setPreview: (url: string | null) => void) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };
    
    if (isLoading || !settings) {
        return (
            <div className="space-y-4">
                 <Skeleton className="h-10 w-48" />
                 <Skeleton className="h-8 w-full" />
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-32" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                 </Card>
            </div>
        )
    }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold">Site Ayarları</h1>
        <p className="text-muted-foreground">Web sitesinin genel ayarlarını buradan yönetin.</p>
      </div>

      <form action={formAction}>
        {/* Hidden inputs to pass existing URLs */}
        <input type="hidden" name="logoUrl" value={settings.logoUrl} />
        <input type="hidden" name="heroBannerUrl" value={settings.heroBannerUrl} />
        {/* Hidden inputs to track active tab for form submission */}
        {activeTab === 'general' && <input type="hidden" name="generalTabActive" value="true" />}
        {activeTab === 'homepage' && <input type="hidden" name="homepageTabActive" value="true" />}

        <Tabs defaultValue="general" onValueChange={setActiveTab}>
            <TabsList>
                <TabsTrigger value="general">Genel Bilgiler</TabsTrigger>
                <TabsTrigger value="contact">İletişim & Sosyal Medya</TabsTrigger>
                <TabsTrigger value="homepage">Anasayfa Ayarları</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
                <Card>
                    <CardHeader>
                        <CardTitle>Okul Bilgileri</CardTitle>
                        <CardDescription>Okulunuzun temel kimlik bilgileri.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="schoolName">Okul Adı</Label>
                            <Input id="schoolName" name="schoolName" defaultValue={settings.schoolName} required />
                        </div>
                        <div className="flex items-center space-x-2 p-4 border rounded-md">
                            <Checkbox id="showSchoolNameInHeader" name="showSchoolNameInHeader" defaultChecked={settings.showSchoolNameInHeader} />
                            <Label htmlFor="showSchoolNameInHeader" className="cursor-pointer text-base">Okul Adını Başlıkta Göster</Label>
                        </div>
                        <div className="space-y-4">
                            <Label>Logo</Label>
                             <div className="flex flex-col md:flex-row gap-6">
                                <div className="space-y-2 flex-1">
                                    <Label htmlFor="logo" className="text-xs text-muted-foreground">Logo Dosyası</Label>
                                    <Input id="logo" name="logo" type="file" accept="image/png, image/jpeg, image/svg+xml" onChange={(e) => handleFileChange(e, setLogoPreview)} />
                                    {logoPreview && <Image src={logoPreview} alt="Logo Preview" width={100} height={100} className="mt-2 rounded-md bg-muted p-2" />}
                                </div>
                                <div className="space-y-2 flex-1">
                                    <Label className="text-xs text-muted-foreground">Logo Gösterim Stili</Label>
                                    <RadioGroup name="logoDisplayMode" defaultValue={settings.logoDisplayMode} className="p-3 border rounded-md">
                                        <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="contain" id="contain" />
                                            <Label htmlFor="contain" className="font-normal cursor-pointer">Sığdır (Orijinal boyutlar korunur)</Label>
                                        </div>
                                         <div className="flex items-center space-x-2">
                                            <RadioGroupItem value="cover" id="cover" />
                                            <Label htmlFor="cover" className="font-normal cursor-pointer">Kapla (Alanı doldurur, kırpılabilir)</Label>
                                        </div>
                                    </RadioGroup>
                                    <p className="text-xs text-muted-foreground">Sığdır: Yatay/dikey logolar için idealdir. Kapla: Kare logolar için daha uygun olabilir.</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="contact">
                <Card>
                    <CardHeader>
                        <CardTitle>İletişim & Sosyal Medya</CardTitle>
                        <CardDescription>Ziyaretçilerin size ulaşabileceği bilgiler ve sosyal medya hesaplarınız.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="address">Adres</Label>
                            <Input id="address" name="address" defaultValue={settings.address} required />
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">Telefon</Label>
                                <Input id="phone" name="phone" defaultValue={settings.phone} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input id="email" name="email" type="email" defaultValue={settings.email} required />
                            </div>
                        </div>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="socialLinks.facebook">Facebook URL</Label>
                                <Input id="socialLinks.facebook" name="socialLinks.facebook" defaultValue={settings.socialLinks?.facebook} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="socialLinks.twitter">Twitter URL</Label>
                                <Input id="socialLinks.twitter" name="socialLinks.twitter" defaultValue={settings.socialLinks?.twitter} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="socialLinks.instagram">Instagram URL</Label>
                                <Input id="socialLinks.instagram" name="socialLinks.instagram" defaultValue={settings.socialLinks?.instagram} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="socialLinks.linkedin">LinkedIn URL</Label>
                                <Input id="socialLinks.linkedin" name="socialLinks.linkedin" defaultValue={settings.socialLinks?.linkedin} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="homepage">
                <Card>
                    <CardHeader>
                        <CardTitle>Anasayfa Ayarları</CardTitle>
                        <CardDescription>Anasayfada gösterilen genel görselleri ve özellikleri yönetin.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center space-x-2 p-4 border rounded-md">
                            <Checkbox id="showHeroBanner" name="showHeroBanner" defaultChecked={settings.showHeroBanner} />
                            <Label htmlFor="showHeroBanner" className="cursor-pointer text-base">Anasayfa Banner'ını Göster</Label>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="heroBanner">Anasayfa Banner Görseli</Label>
                            <Input id="heroBanner" name="heroBanner" type="file" accept="image/png, image/jpeg, image/webp" onChange={(e) => handleFileChange(e, setBannerPreview)} />
                             <p className="text-sm text-muted-foreground">Önerilen boyut: 1200x400 piksel. Banner gösterilmeyecekse bu alanın bir önemi yoktur.</p>
                            {bannerPreview && <Image src={bannerPreview} alt="Banner Preview" width={600} height={200} className="mt-2 rounded-md aspect-[3/1] object-cover" />}
                        </div>
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
        
        <div className="flex justify-end pt-4">
            <SubmitButton />
        </div>
      </form>
    </div>
  );
}
