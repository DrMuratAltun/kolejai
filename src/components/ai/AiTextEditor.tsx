"use client";

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2 } from 'lucide-react';
import { generateText, rewriteText } from '@/ai/flows/content-tools';
import { useToast } from '@/hooks/use-toast';

interface AiTextEditorProps {
  form: ReturnType<typeof useFormContext>;
  fieldName: string;
  initialValue: string;
}

const AiTextEditor: React.FC<AiTextEditorProps> = ({ form, fieldName, initialValue }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [generationTopic, setGenerationTopic] = useState('');
  
  const handleRewrite = async (instruction: string) => {
    setIsLoading(true);
    const currentValue = form.getValues(fieldName);
    if (!currentValue) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Yeniden yazılacak metin yok.' });
      setIsLoading(false);
      return;
    }
    try {
      const result = await rewriteText({ text: currentValue, instruction });
      form.setValue(fieldName, result.rewrittenText, { shouldValidate: true });
      toast({ title: 'Başarılı!', description: 'Metin yeniden yazıldı.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata!', description: 'Metin yeniden yazılamadı.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!generationTopic) return;
    setIsLoading(true);
    setPopoverOpen(false);
    try {
      const result = await generateText({ topic: generationTopic });
      form.setValue(fieldName, result.generatedText, { shouldValidate: true });
      toast({ title: 'Başarılı!', description: 'Metin oluşturuldu.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata!', description: 'Metin oluşturulamadı.' });
    } finally {
      setGenerationTopic('');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        {...form.register(fieldName)}
        defaultValue={initialValue}
        className="min-h-[200px]"
        disabled={isLoading}
      />
      <div className="flex flex-wrap gap-2 items-center">
        {isLoading ? (
          <Button variant="outline" size="sm" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            İşleniyor...
          </Button>
        ) : (
          <>
            <Button type="button" variant="outline" size="sm" onClick={() => handleRewrite('make it shorter')}>Kısalt</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleRewrite('make it longer')}>Uzat</Button>
            <Button type="button" variant="outline" size="sm" onClick={() => handleRewrite('make the tone more formal')}>Daha Resmi Yap</Button>
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button type="button" variant="default" size="sm">
                  <Wand2 className="mr-2 h-4 w-4" /> Konudan Metin Üret
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium leading-none">Metin Üret</h4>
                    <p className="text-sm text-muted-foreground">
                      Hangi konuda metin üretmek istersiniz?
                    </p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="topic">Konu</Label>
                    <Input id="topic" value={generationTopic} onChange={(e) => setGenerationTopic(e.target.value)} />
                    <Button onClick={handleGenerate}>Üret</Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          </>
        )}
      </div>
    </div>
  );
};

export default AiTextEditor;
