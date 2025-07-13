
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { handleContactSubmitAction } from "./actions";
import { Loader2 } from "lucide-react";
import React from "react";

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

export default function ContactPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = React.useTransition();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      parentName: "",
      phone: "",
      email: "",
      studentName: "",
      kvkk: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      const result = await handleContactSubmitAction(values);
      if (result.success) {
        toast({
          title: "Başarılı!",
          description: "Formunuz başarıyla gönderildi. En kısa sürede sizinle iletişime geçeceğiz.",
        });
        form.reset();
      } else {
        toast({
          variant: "destructive",
          title: "Hata!",
          description: result.error,
        });
      }
    });
  }

  return (
    <div className="bg-primary/90 pt-20">
      <div className="container mx-auto px-4 py-16 md:py-24 animate-in fade-in duration-500">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Kayıt Bilgi Formu</h2>
            <p className="text-primary-foreground/80 max-w-2xl mx-auto">Çocuğunuzun eğitim yolculuğuna Elit Gençler Koleji ile başlaması için aşağıdaki formu doldurun, sizinle en kısa sürede iletişime geçelim.</p>
          </div>
          <Card>
            <CardContent className="p-8">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="parentName" render={({ field }) => ( <FormItem> <FormLabel>Veli Ad Soyad*</FormLabel> <FormControl> <Input placeholder="Adınız ve soyadınız..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem> <FormLabel>Telefon*</FormLabel> <FormControl> <Input type="tel" placeholder="Telefon numaranız..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="email" render={({ field }) => ( <FormItem> <FormLabel>E-posta Adresiniz*</FormLabel> <FormControl> <Input type="email" placeholder="ornek@eposta.com" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="studentName" render={({ field }) => ( <FormItem> <FormLabel>Öğrenci Ad Soyad*</FormLabel> <FormControl> <Input placeholder="Öğrencinin adı ve soyadı..." {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="grade" render={({ field }) => ( <FormItem> <FormLabel>Sınıf Seçimi*</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Kayıt olunacak sınıfı seçin" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="anaokulu">Anaokulu</SelectItem> {[...Array(12)].map((_, i) => ( <SelectItem key={i+1} value={`${i + 1}. Sinif`}>{i + 1}. Sınıf</SelectItem> ))} </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                    <FormField control={form.control} name="source" render={({ field }) => ( <FormItem> <FormLabel>Bizi Nereden Duydunuz?</FormLabel> <Select onValueChange={field.onChange} defaultValue={field.value}> <FormControl> <SelectTrigger> <SelectValue placeholder="Seçiniz" /> </SelectTrigger> </FormControl> <SelectContent> <SelectItem value="internet">İnternet Arama</SelectItem> <SelectItem value="social">Sosyal Medya</SelectItem> <SelectItem value="friend">Arkadaş/Tanıdık Tavsiyesi</SelectItem> <SelectItem value="ad">Reklam</SelectItem> <SelectItem value="other">Diğer</SelectItem> </SelectContent> </Select> <FormMessage /> </FormItem> )} />
                  </div>
                  <FormField control={form.control} name="message" render={({ field }) => ( <FormItem> <FormLabel>Eklemek İstedikleriniz</FormLabel> <FormControl> <Textarea placeholder="Mesajınız..." className="min-h-[100px]" {...field} /> </FormControl> <FormMessage /> </FormItem> )} />
                  <FormField control={form.control} name="kvkk" render={({ field }) => ( <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4"> <FormControl> <Checkbox checked={field.value} onCheckedChange={field.onChange} /> </FormControl> <div className="space-y-1 leading-none"> <FormLabel> <a href="#" className="text-primary hover:underline">KVKK Aydınlatma Metni</a>'ni okudum ve onaylıyorum. </FormLabel> </div> <FormMessage /> </FormItem> )} />
                  
                  <Button type="submit" className="w-full" size="lg" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Bilgi İstek Formunu Gönder
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
