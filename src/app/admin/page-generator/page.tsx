
export default function PageGenerator() {
  return (
    <div className="animate-in fade-in duration-500 h-full flex flex-col space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Yapay Zeka Sayfa Oluşturucu</h1>
        <p className="text-muted-foreground">
          Aşağıdaki arayüzü kullanarak web siteniz için yeni sayfalar oluşturun.
        </p>
      </div>
      <div className="flex-grow border rounded-lg overflow-hidden">
        <iframe
            src="https://enzostvs-deepsite.hf.space/projects/new"
            className="w-full h-full border-0"
            title="AI Page Generator"
            allow="fullscreen"
        ></iframe>
      </div>
    </div>
  );
}
