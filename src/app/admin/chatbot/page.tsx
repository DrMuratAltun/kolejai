import AdminChatbotClient from "@/components/chat/AdminChatbotClient";

export default function AdminChatbotPage() {
    return (
        <div className="animate-in fade-in duration-500">
             <h1 className="text-3xl font-bold mb-2">Yönetici Asistanı</h1>
             <p className="text-muted-foreground mb-8">İçerik önerileri almak veya siteyle ilgili sorular sormak için asistanı kullanın.</p>
             <AdminChatbotClient />
        </div>
    )
}
