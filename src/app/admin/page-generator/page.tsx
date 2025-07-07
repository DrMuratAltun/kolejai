
export default function PageGenerator() {
  return (
    <div className="flex h-full flex-col animate-in fade-in duration-500">
      <div className="mb-8 flex-shrink-0">
        <h1 className="text-3xl font-bold">Yapay Zeka Sayfa Oluşturucu</h1>
        <p className="text-muted-foreground">
          Aşağıdaki arayüzü kullanarak web siteniz için yeni sayfalar oluşturun.
        </p>
      </div>
      <div className="flex-grow rounded-lg border">
        <iframe
            src="https://enzostvs-deepsite.hf.space/projects/new"
            className="h-full w-full rounded-lg border-0"
            title="AI Page Generator"
            allow="fullscreen"
        ></iframe>
      </div>
    </div>
  );
}
