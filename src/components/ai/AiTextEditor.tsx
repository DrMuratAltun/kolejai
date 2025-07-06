"use client";

import React, { useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Sparkles, Bold, Italic, Strikethrough, Underline, List, ListOrdered, Link2, Image as ImageIcon } from 'lucide-react';
import { generateText, rewriteText } from '@/ai/flows/content-tools';
import { generateImage } from '@/ai/flows/image-generation';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import { cn } from '@/lib/utils';
import { uploadFile } from '@/lib/firebase-storage';


const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) {
    return null;
  }

  const setLink = useCallback(() => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  }, [editor]);
  
  const addImage = useCallback(() => {
    const url = window.prompt('URL');

    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);


  return (
    <div className="border border-input rounded-t-md p-2 flex flex-wrap items-center gap-2">
      <Button type="button" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'default' : 'ghost'} size="icon" aria-label="Bold"><Bold className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'default' : 'ghost'} size="icon" aria-label="Italic"><Italic className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} variant={editor.isActive('underline') ? 'default' : 'ghost'} size="icon" aria-label="Underline"><Underline className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} variant={editor.isActive('strike') ? 'default' : 'ghost'} size="icon" aria-label="Strikethrough"><Strikethrough className="h-4 w-4" /></Button>
      
      <Select onValueChange={(value) => {
        if (value === 'p') {
          editor.chain().focus().setParagraph().run();
        } else {
          editor.chain().focus().toggleHeading({ level: parseInt(value.replace('h','')) as any }).run();
        }
      }}
      value={
        editor.isActive('heading', { level: 1 }) ? 'h1' :
        editor.isActive('heading', { level: 2 }) ? 'h2' :
        editor.isActive('heading', { level: 3 }) ? 'h3' : 'p'
      }
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Stil" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p">Paragraf</SelectItem>
          <SelectItem value="h1">Başlık 1</SelectItem>
          <SelectItem value="h2">Başlık 2</SelectItem>
          <SelectItem value="h3">Başlık 3</SelectItem>
        </SelectContent>
      </Select>

      <Button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'default' : 'ghost'} size="icon" aria-label="Bullet List"><List className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'default' : 'ghost'} size="icon" aria-label="Ordered List"><ListOrdered className="h-4 w-4" /></Button>
      <Button type="button" onClick={setLink} variant={editor.isActive('link') ? 'default' : 'ghost'} size="icon" aria-label="Add Link"><Link2 className="h-4 w-4" /></Button>
      <Button type="button" onClick={addImage} variant={editor.isActive('image') ? 'default' : 'ghost'} size="icon" aria-label="Insert Image"><ImageIcon className="h-4 w-4" /></Button>
    </div>
  );
};


interface AiTextEditorProps {
  form: ReturnType<typeof useFormContext>;
  fieldName: string;
  initialValue: string;
}

const AiTextEditor: React.FC<AiTextEditorProps> = ({ form, fieldName, initialValue }) => {
  const { toast } = useToast();
  const [isRewriting, setIsRewriting] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [generationTopic, setGenerationTopic] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [rewriteLength, setRewriteLength] = useState('');
  const [rewriteTone, setRewriteTone] = useState('');

  // New state for image generation
  const [isImagePopoverOpen, setImagePopoverOpen] = useState(false);
  const [imageGenPrompt, setImageGenPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [generatedImageDataUri, setGeneratedImageDataUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const isLoading = isRewriting || isGeneratingText || isGeneratingImage || isUploading;

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error('Invalid data URI');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };


  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      UnderlineExtension,
      Link.configure({
        openOnClick: false,
        autolink: true,
      }),
      Placeholder.configure({
        placeholder: 'Haber, duyuru veya etkinlik detaylarını buraya yazın...',
      }),
      Image,
    ],
    content: initialValue,
    editorProps: {
      attributes: {
        class: cn('prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-full'),
      },
    },
    onUpdate({ editor }) {
      form.setValue(fieldName, editor.getHTML(), { shouldValidate: true });
    },
  });

  useEffect(() => {
    if (editor && initialValue !== editor.getHTML()) {
      editor.commands.setContent(initialValue, false);
    }
  }, [initialValue, editor]);

  
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
    
    setIsRewriting(true);
    const currentValue = editor?.getHTML();
    if (!currentValue) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Yeniden yazılacak metin yok.' });
      setIsRewriting(false);
      return;
    }
    try {
      const result = await rewriteText({ text: currentValue, instruction: instructions.join(' and ') });
      editor?.commands.setContent(result.rewrittenText, true);
      toast({ title: 'Başarılı!', description: 'Metin yeniden yazıldı.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata!', description: 'Metin yeniden yazılamadı.' });
    } finally {
      setIsRewriting(false);
      setRewriteLength('');
      setRewriteTone('');
    }
  };

  const handleGenerateText = async () => {
    if (!generationTopic) return;
    setIsGeneratingText(true);
    setPopoverOpen(false);
    try {
      const result = await generateText({ topic: generationTopic });
      editor?.commands.setContent(result.generatedText, true);
      toast({ title: 'Başarılı!', description: 'Metin oluşturuldu.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata!', description: 'Metin oluşturulamadı.' });
    } finally {
      setGenerationTopic('');
      setIsGeneratingText(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!imageGenPrompt) return;
    setIsGeneratingImage(true);
    setGeneratedImageDataUri(null);
    try {
        const result = await generateImage({ prompt: imageGenPrompt });
        if (result.imageUrl) {
            setGeneratedImageDataUri(result.imageUrl);
            toast({ title: "Başarılı!", description: "Yapay zeka ile resim üretildi." });
        }
    } catch (error) {
        console.error("Image generation error:", error);
        toast({
            variant: "destructive",
            title: "Hata!",
            description: "Resim üretilirken bir hata oluştu.",
        });
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleInsertImage = async () => {
    if (!generatedImageDataUri) return;
    setIsUploading(true);
    try {
      const filename = `${imageGenPrompt.replace(/[^a-z0-9]/gi, '_').toLowerCase().slice(0, 20)}.png`;
      const file = dataURLtoFile(generatedImageDataUri, filename);
      const publicUrl = await uploadFile(file, 'content-images');
      
      editor?.chain().focus().setImage({ src: publicUrl, alt: imageGenPrompt }).run();
      
      toast({ title: "Başarılı!", description: "Resim içeriğe eklendi." });
      
      // Reset and close
      setImagePopoverOpen(false);
      setGeneratedImageDataUri(null);
      setImageGenPrompt('');

    } catch (error) {
        console.error("Image insertion error:", error);
        toast({
            variant: "destructive",
            title: "Hata!",
            description: "Resim yüklenirken veya eklenirken bir hata oluştu.",
        });
    } finally {
        setIsUploading(false);
    }
  };


  return (
    <div className="space-y-2">
      <div className='rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2'>
        <Toolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>

      <div className="flex flex-wrap gap-4 items-center pt-2">
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
                <Input id="topic" value={generationTopic} onChange={(e) => setGenerationTopic(e.target.value)} disabled={isGeneratingText}/>
                <Button onClick={handleGenerateText} disabled={isGeneratingText || !generationTopic}>
                  {isGeneratingText && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Üret
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>

        <Popover open={isImagePopoverOpen} onOpenChange={setImagePopoverOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="default" size="sm" disabled={isLoading}>
              <ImageIcon className="mr-2 h-4 w-4" /> İçeriğe Resim Üret
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none">AI ile Resim Üret</h4>
                <p className="text-sm text-muted-foreground">
                  İçeriğinize eklemek için bir resim üretin.
                </p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image-prompt">Resim Konusu</Label>
                <Input id="image-prompt" value={imageGenPrompt} onChange={(e) => setImageGenPrompt(e.target.value)} disabled={isLoading}/>
                <Button onClick={handleGenerateImage} disabled={isLoading || !imageGenPrompt}>
                  {isGeneratingImage ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4"/>}
                  Resim Üret
                </Button>
              </div>
              {isGeneratingImage && (
                <div className="w-full flex justify-center items-center h-48 bg-muted rounded-md mt-2">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span>Resim üretiliyor...</span>
                    </div>
                </div>
              )}
              {generatedImageDataUri && (
                <div className="mt-4 space-y-4">
                    <p className="text-sm font-medium">Üretilen Resim (Önizleme)</p>
                    <NextImage
                        src={generatedImageDataUri}
                        alt="Yapay zeka tarafından üretilen görsel"
                        width={350}
                        height={350}
                        className="rounded-md object-contain border"
                    />
                    <Button onClick={handleInsertImage} disabled={isLoading} className="w-full">
                        {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Editöre Ekle
                    </Button>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

      </div>
    </div>
  );
};

export default AiTextEditor;
