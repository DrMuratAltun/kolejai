"use client";

import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, { message: "İsim en az 2 karakter olmalıdır." }),
  email: z.string().email({ message: "Geçerli bir e-posta adresi giriniz." }),
  subject: z.string().min(5, { message: "Konu en az 5 karakter olmalıdır." }),
  message: z.string().min(10, { message: "Mesaj en az 10 karakter olmalıdır." }),
});

export default function ContactPage() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    // In a real app, you would handle form submission here.
    console.log(values);
    alert("Mesajınız başarıyla gönderildi! (Bu bir demo mesajıdır.)");
    form.reset();
  }

  return (
    <div className="container mx-auto px-4 py-16 animate-in fade-in duration-500">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold">Bize Ulaşın</h1>
        <p className="text-muted-foreground mt-4 text-lg">Sorularınız, önerileriniz veya kayıt işlemleri için bizimle iletişime geçin.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Info & Map */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>İletişim Bilgileri</CardTitle>
              <CardDescription>Aşağıdaki kanallardan bize ulaşabilirsiniz.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <p>Örnek Mah. Okul Sk. No:123, 34762 Üsküdar/İstanbul</p>
              </div>
              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <a href="tel:+902161234567" className="hover:text-primary">+90 (216) 123 45 67</a>
              </div>
              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <a href="mailto:info@akilliokul.com" className="hover:text-primary">info@akilliokul.com</a>
              </div>
            </CardContent>
          </Card>
          <Card className="overflow-hidden">
             <CardHeader>
              <CardTitle>Konumumuz</CardTitle>
            </CardHeader>
             <CardContent>
               <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
                <Image src="https://placehold.co/600x400.png" alt="Okulun konumu" width={600} height={400} className="w-full h-full object-cover" data-ai-hint="map location"/>
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Contact Form */}
        <Card>
          <CardHeader>
            <CardTitle>Mesaj Gönderin</CardTitle>
            <CardDescription>Formu doldurarak bize hızlıca bir mesaj gönderebilirsiniz.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Adınız Soyadınız</FormLabel>
                      <FormControl>
                        <Input placeholder="İsminiz..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta Adresiniz</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ornek@eposta.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konu</FormLabel>
                      <FormControl>
                        <Input placeholder="Mesajınızın konusu..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mesajınız</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Mesajınızı buraya yazın..." className="min-h-[120px]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" size="lg">Mesajı Gönder</Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}