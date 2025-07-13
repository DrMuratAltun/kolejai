
"use client";

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Wand2, Sparkles, Bold, Italic, Strikethrough, Underline, List, ListOrdered, Link2, Image as ImageIcon, Code, Split, ChevronDown, AlignLeft, AlignCenter, AlignRight, AlignJustify } from 'lucide-react';
import { generateText, rewriteText, rewriteSelection } from '@/ai/flows/content-tools';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import UnderlineExtension from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import { cn } from '@/lib/utils';
import { uploadEditorImageAction } from '@/app/admin/pages/actions';


const Toolbar = ({ editor, onImageUploadClick, isUploadingImage }: { editor: Editor | null, onImageUploadClick: () => void, isUploadingImage: boolean }) => {
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
  
  return (
    <div className="border border-input rounded-t-md p-1 flex flex-wrap items-center gap-1">
      <Button type="button" onClick={() => editor.chain().focus().toggleBold().run()} variant={editor.isActive('bold') ? 'secondary' : 'ghost'} size="icon" aria-label="Bold"><Bold className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} variant={editor.isActive('italic') ? 'secondary' : 'ghost'} size="icon" aria-label="Italic"><Italic className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} variant={editor.isActive('underline') ? 'secondary' : 'ghost'} size="icon" aria-label="Underline"><Underline className="h-4 w-4" /></Button>
      <Button type="button" onClick={() => editor.chain().focus().toggleStrike().run()} variant={editor.isActive('strike') ? 'secondary' : 'ghost'} size="icon" aria-label="Strikethrough"><Strikethrough className="h-4 w-4" /></Button>
      
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
        <SelectTrigger className="w-[120px] h-8 px-2">
          <SelectValue placeholder="Stil" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="p">Paragraf</SelectItem>
          <SelectItem value="h1">Başlık 1</SelectItem>
          <SelectItem value="h2">Başlık 2</SelectItem>
          <SelectItem value="h3">Başlık 3</SelectItem>
        </SelectContent>
      </Select>
      
      <div className="flex items-center gap-1 border-l pl-1">
        <Button type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'} size="icon" aria-label="Align Left"><AlignLeft className="h-4 w-4" /></Button>
        <Button type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'} size="icon" aria-label="Align Center"><AlignCenter className="h-4 w-4" /></Button>
        <Button type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'} size="icon" aria-label="Align Right"><AlignRight className="h-4 w-4" /></Button>
      </div>

      <div className="flex items-center gap-1 border-l pl-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon"><div className="w-4 h-4 rounded-sm" style={{ backgroundColor: editor.getAttributes('textStyle').color || 'hsl(var(--foreground))' }} /></Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-1">
            <input type="color" className="w-24 h-10 border-0 bg-transparent" value={editor.getAttributes('textStyle').color || '#000000'} onChange={e => editor.chain().focus().setColor(e.target.value).run()} />
            <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().unsetColor().run()}>Rengi Sıfırla</Button>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex items-center gap-1 border-l pl-1">
        <Button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'} size="icon" aria-label="Bullet List"><List className="h-4 w-4" /></Button>
        <Button type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'} size="icon" aria-label="Ordered List"><ListOrdered className="h-4 w-4" /></Button>
        <Button type="button" onClick={setLink} variant={editor.isActive('link') ? 'secondary' : 'ghost'} size="icon" aria-label="Add Link"><Link2 className="h-4 w-4" /></Button>
        <Button type="button" onClick={onImageUploadClick} variant="ghost" size="icon" aria-label="Insert Image" disabled={isUploadingImage}>
          {isUploadingImage ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

interface AiTextEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
}

const AiTextEditor: React.FC<AiTextEditorProps> = ({ content, onContentChange, placeholder }) => {
  const { toast } = useToast();
  const [isRewriting, setIsRewriting] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [generationTopic, setGenerationTopic] = useState('');
  const [isGeneratingText, setIsGeneratingText] = useState(false);
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'code' | 'split'>('visual');

  const isLoading = isRewriting || isGeneratingText || isUploadingImage;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      UnderlineExtension,
      Link.configure({ openOnClick: false, autolink: true }),
      Placeholder.configure({ placeholder: placeholder || 'İçeriği buraya yazın...' }),
      Image.configure({ inline: false, allowBase64: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    editorProps: {
      attributes: {
        class: cn('prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-full'),
      },
    },
    onUpdate({ editor }) {
      if (onContentChange) {
        onContentChange(editor.getHTML());
      }
    },
  }, [onContentChange]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);
  
  const handleRewriteSelection = async () => {
    if (!editor || !rewriteInstruction) return;
    const { from, to, content: selectionContent } = editor.state.selection;
    if (selectionContent.size === 0) {
      toast({ variant: 'destructive', title: 'Hata', description: 'Lütfen geliştirmek için bir metin seçin.' });
      return;
    }

    const selectedHtml = editor.getHTML().substring(from, to);

    setIsRewriting(true);
    try {
      const result = await rewriteSelection({ selection: selectedHtml, instruction: rewriteInstruction });
      editor.chain().focus().deleteRange({ from, to }).insertContent(result.rewrittenSelection).run();
      toast({ title: 'Başarılı!', description: 'Seçim yeniden yazıldı.' });
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Hata!', description: 'Seçim yeniden yazılamadı.' });
    } finally {
      setIsRewriting(false);
      setRewriteInstruction('');
      setPopoverOpen(false);
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

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editor) return;

    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
        const result = await uploadEditorImageAction(formData);

        if (result.success && result.url) {
            editor.chain().focus().setImage({ src: result.url, alt: file.name }).run();
            toast({ title: 'Başarılı!', description: 'Resim başarıyla yüklendi ve eklendi.' });
        } else {
            throw new Error(result.error || 'Bilinmeyen bir hata oluştu.');
        }
    } catch(e: any) {
        toast({ variant: 'destructive', title: 'Hata!', description: `Resim yüklenemedi: ${e.message}` });
    } finally {
        setIsUploadingImage(false);
        if (event.target) {
            event.target.value = '';
        }
    }
  }, [editor, toast]);

  const triggerImageUpload = useCallback(() => {
    imageInputRef.current?.click();
  }, []);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newHtml = e.target.value;
    if (editor && onContentChange) {
        editor.commands.setContent(newHtml, false); // Don't emit update yet
        onContentChange(newHtml); // Manually call onContentChange
    }
  }

  const toggleViewMode = (newMode: 'visual' | 'code' | 'split') => {
    if (viewMode === newMode) {
      setViewMode('visual'); // Default back to visual if clicking the same button
    } else {
      setViewMode(newMode);
    }
  }

  const renderContent = () => {
    const visualEditor = (
      <div className='rounded-md border border-input focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 w-full'>
        <Toolbar editor={editor} onImageUploadClick={triggerImageUpload} isUploadingImage={isUploadingImage} />
        <EditorContent editor={editor} className="p-2" />
      </div>
    );

    const codeEditor = (
      <div className="w-full">
        <Label htmlFor="html-editor" className="mb-2 block">HTML Kod Editörü</Label>
        <Textarea
            id="html-editor"
            className="min-h-[400px] font-mono text-sm bg-muted/30"
            value={content}
            onChange={handleCodeChange}
            placeholder="HTML kodunu buraya girin..."
            disabled={isLoading}
        />
      </div>
    );
  
    switch (viewMode) {
      case 'visual':
        return visualEditor;
      case 'code':
        return codeEditor;
      case 'split':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {visualEditor}
            {codeEditor}
          </div>
        );
      default:
        return visualEditor;
    }
  };

  return (
    <div className="space-y-2">
       <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif"
      />
      {renderContent()}

      <div className="flex flex-wrap gap-4 items-center pt-2">
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading}>
                    <Sparkles className="mr-2 h-4 w-4 text-purple-500"/>
                    Yapay Zeka Araçları
                    <ChevronDown className="ml-2 h-4 w-4"/>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96">
                <Tabs defaultValue="generate">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="generate">Yeni Metin Üret</TabsTrigger>
                        <TabsTrigger value="rewrite">Seçimi Geliştir</TabsTrigger>
                    </TabsList>
                    <TabsContent value="generate" className="pt-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Konudan Metin Üret</h4>
                            <p className="text-sm text-muted-foreground">İstediğiniz konuda sıfırdan metin oluşturun.</p>
                        </div>
                        <div className="grid gap-2 pt-4">
                            <Label htmlFor="topic">Konu</Label>
                            <Input id="topic" value={generationTopic} onChange={(e) => setGenerationTopic(e.target.value)} disabled={isGeneratingText}/>
                            <Button onClick={handleGenerateText} disabled={isGeneratingText || !generationTopic}>
                                {isGeneratingText && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Tüm İçeriği Değiştir
                            </Button>
                        </div>
                    </TabsContent>
                    <TabsContent value="rewrite" className="pt-4">
                        <div className="space-y-2">
                            <h4 className="font-medium leading-none">Seçili Alanı Geliştir</h4>
                            <p className="text-sm text-muted-foreground">Editörde seçtiğiniz metni, aşağıdaki komutla yeniden yazdırın.</p>
                        </div>
                        <div className="grid gap-2 pt-4">
                            <Label htmlFor="instruction">Komut</Label>
                            <Input id="instruction" value={rewriteInstruction} onChange={(e) => setRewriteInstruction(e.target.value)} placeholder="Örn: Daha profesyonel yap" disabled={isRewriting}/>
                            <Button onClick={handleRewriteSelection} disabled={isRewriting || !rewriteInstruction}>
                                {isRewriting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Seçimi Geliştir
                            </Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </PopoverContent>
        </Popover>

         <div className="flex gap-2">
            <Button
                type="button"
                variant={viewMode === 'visual' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => toggleViewMode('visual')}
                disabled={isLoading}
            >
                Görsel
            </Button>
             <Button
                type="button"
                variant={viewMode === 'code' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => toggleViewMode('code')}
                disabled={isLoading}
            >
                <Code className="mr-2 h-4 w-4" />
                Kod
            </Button>
             <Button
                type="button"
                variant={viewMode === 'split' ? 'secondary' : 'outline'}
                size="sm"
                onClick={() => toggleViewMode('split')}
                disabled={isLoading}
            >
                <Split className="mr-2 h-4 w-4" />
                Böl
            </Button>
         </div>
      </div>
    </div>
  );
};

export default AiTextEditor;
