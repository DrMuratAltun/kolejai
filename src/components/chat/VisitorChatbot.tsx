"use client";

import { useState, useRef, useEffect, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Send, Bot, User, Loader2 } from "lucide-react";
import { visitorChatbot } from "@/ai/flows/visitor-chatbot";
import { cn } from "@/lib/utils";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function VisitorChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Merhaba! Akıllı Okul Web Platformu'na hoş geldiniz. Size nasıl yardımcı olabilirim?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await visitorChatbot({ query: input });
      const assistantMessage: Message = { role: "assistant", content: response.answer };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Chatbot error:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: "Üzgünüm, bir hata oluştu. Lütfen daha sonra tekrar deneyin.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);


  return (
    <>
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-lg"
                    size="icon"
                >
                    <MessageSquare className="h-8 w-8" />
                    <span className="sr-only">Open Chat</span>
                </Button>
            </SheetTrigger>
            <SheetContent className="flex flex-col p-0">
                <SheetHeader className="p-4 border-b">
                    <SheetTitle className="flex items-center gap-2">
                        <Bot />
                        Yardımcı Bot
                    </SheetTitle>
                </SheetHeader>
                <div className="flex-grow flex flex-col">
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4">
                        {messages.map((message, index) => (
                            <div
                            key={index}
                            className={cn(
                                "flex items-start gap-3",
                                message.role === "user" ? "justify-end" : "justify-start"
                            )}
                            >
                            {message.role === "assistant" && (
                                <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                            )}
                            <div
                                className={cn(
                                "max-w-xs md:max-w-md rounded-lg p-3 text-sm",
                                message.role === "user"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                )}
                            >
                                {message.content}
                            </div>
                            {message.role === "user" && (
                                <Avatar className="h-8 w-8">
                                <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                                </Avatar>
                            )}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex items-start gap-3 justify-start">
                            <Avatar className="h-8 w-8">
                                <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="h-5 w-5"/></AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg p-3 flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                            </div>
                        )}
                        </div>
                    </ScrollArea>
                    <div className="p-4 border-t bg-background">
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Mesajınızı yazın..."
                            disabled={isLoading}
                        />
                        <Button type="submit" size="icon" disabled={isLoading || !input.trim()}>
                            {isLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                            <Send className="h-4 w-4" />
                            )}
                            <span className="sr-only">Gönder</span>
                        </Button>
                        </form>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    </>
  );
}
