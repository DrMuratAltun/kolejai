import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, Bus, GraduationCap } from "lucide-react";

const quickAccessItems = [
    {
        icon: CalendarDays,
        title: "Okul Kayıtları",
        description: "2024-2025 eğitim öğretim yılı kayıtlarımız başladı.",
        bgColor: "bg-blue-100 dark:bg-blue-900/50",
        iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
        icon: Bus,
        title: "Servis Hizmeti",
        description: "Güvenli ve konforlu servis ağımız ile hizmetinizdeyiz.",
        bgColor: "bg-yellow-100 dark:bg-yellow-900/50",
        iconColor: "text-yellow-600 dark:text-yellow-400"
    },
    {
        icon: GraduationCap,
        title: "Burs İmkanları",
        description: "Başarılı öğrencilerimize özel burs fırsatları.",
        bgColor: "bg-green-100 dark:bg-green-900/50",
        iconColor: "text-green-600 dark:text-green-400"
    }
];

export default function QuickAccess() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Hızlı Erişim</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                {quickAccessItems.map((item, index) => (
                    <div key={index} className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${item.bgColor} flex-shrink-0`}>
                            <item.icon className={`h-6 w-6 ${item.iconColor}`} />
                        </div>
                        <div>
                            <h3 className="font-bold text-md mb-1 text-foreground">{item.title}</h3>
                            <p className="text-muted-foreground text-sm">{item.description}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
