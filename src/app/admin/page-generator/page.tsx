
import { Card, CardContent } from "@/components/ui/card";

export default function PageGenerator() {
  return (
    <div className="animate-in fade-in duration-500 space-y-8 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold">Yapay Zeka Sayfa Oluşturucu</h1>
        <p className="text-muted-foreground">
          Aşağıdaki arayüzü kullanarak web siteniz için yeni sayfalar oluşturun.
        </p>
      </div>
      <Card className="flex-grow">
        <CardContent className="p-0 h-full">
            <iframe
                src="https://enzostvs-deepsite.hf.space/projects/new"
                className="w-full h-full border-0 rounded-b-lg"
                title="AI Page Generator"
                allow="fullscreen"
            ></iframe>
        </CardContent>
      </Card>
    </div>
  );
}
