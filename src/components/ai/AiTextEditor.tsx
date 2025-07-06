"use client";

import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Sparkles } from 'lucide-react';
import { generateText, rewriteText } from '@/ai/flows/content-tools';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AiTextEditorProps {
  form: ReturnType<typeof useFormContext>;
  fieldName: string;
  initialValue: string;
}

const AiTextEditor: React.FC<AiTextEditorProps> = ({ form, fieldName, initialValue }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [generationTopic, setGenerationTopic] = useState('');
  const [rewriteLength, setRewriteLength] = useState('');
  const [rewriteTone, setRewriteTone] = useState('');
  
  const handleRewrite = async () => {
    const instructions: string[] = [];
    if (rewriteLength) instructions.push(rewriteLength);
    if (rewriteTone) instructions.push(rewriteTone);

    if (instructions.length === 0) {
      toast({
        variant: "destructive",
        title: "Eksik Seçim",
        description: "Lütfen en az bir yeniden yazma seçeneği (uzunluk veya ton) belirtin.",
      });
      return;
    }
    
    setIsLoading(true);
    setIsRewriting(true);

    const currentValue = form.getValues(fieldName);
    if (!currentValue) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Yeniden yazılacak metin yok.' });
      setIsLoading(false);
      setIsRewriting(false);
      return;
    }
    try {
      const result = await rewriteText({ text: currentValue, instruction: instructions.join(' and ') });
      form.setValue(fieldName, result.rewrittenText, { shouldValidate: true });
      toast({ title: 'Başarılı!', description: 'Metin yeniden yazıldı.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata!', description: 'Metin yeniden yazılamadı.' });
    } finally {
      setIsLoading(false);
      setIsRewriting(false);
      setRewriteLength('');
      setRewriteTone('');
    }
  };

  const handleGenerate = async () => {
    if (!generationTopic) return;
    setIsLoading(true);
    setIsGenerating(true);
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
      setIsGenerating(false);
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
      <div className="flex flex-wrap gap-4 items-center">
        {/* Rewrite Section */}
        <div className="flex flex-wrap gap-2 items-center p-2 border rounded-lg">
           <Sparkles className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0"/>
           <Select onValueChange={setRewriteLength} value={rewriteLength} disabled={isLoading}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Uzunluk" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="make it shorter">Kısalt</SelectItem>
                <SelectItem value="make it longer">Uzat</SelectItem>
              </SelectContent>
            </Select>
            <Select onValueChange={setRewriteTone} value={rewriteTone} disabled={isLoading}>
              <SelectTrigger className="w-[140px] h-9"><SelectValue placeholder="Ton" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="make it more formal">Daha Resmi</SelectItem>
                <SelectItem value="make it more friendly">Daha Samimi</SelectItem>
                <SelectItem value="simplify the text">Basitleştir</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" size="sm" onClick={handleRewrite} disabled={isLoading || (!rewriteLength && !rewriteTone)}>
              {isRewriting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Yeniden Yaz
            </Button>
        </div>

        {/* Generate Section */}
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="default" size="sm" disabled={isLoading}>
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
                <Input id="topic" value={generationTopic} onChange={(e) => setGenerationTopic(e.target.value)} disabled={isGenerating}/>
                <Button onClick={handleGenerate} disabled={isGenerating || !generationTopic}>
                  {isGenerating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Üret
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default AiTextEditor;
