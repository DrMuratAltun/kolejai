"use client";

import { useFormState, useFormStatus } from "react-dom";
import { loginAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, School } from "lucide-react";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Giriş Yap
    </Button>
  );
}

export default function LoginPage() {
  const [state, formAction] = useFormState(loginAction, { success: false, message: "" });
  const { toast } = useToast();

  useEffect(() => {
    if (state.message && !state.success) {
      toast({
        variant: "destructive",
        title: "Giriş Başarısız",
        description: state.message,
      });
    }
  }, [state, toast]);

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center p-4">
       <div className="absolute top-8 left-8">
            <Button variant="outline" asChild>
                <a href="/">Ana Sayfaya Dön</a>
            </Button>
        </div>
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center gap-2 mb-4">
            <School className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Bilge Yıldız</span>
          </div>
          <CardTitle className="text-2xl">Yönetim Paneli</CardTitle>
          <CardDescription>Giriş yapmak için bilgilerinizi girin</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-posta</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="admin@bilgeyildiz.com"
                required
                defaultValue="admin@bilgeyildiz.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input id="password" name="password" type="password" required defaultValue="password123"/>
            </div>
            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
