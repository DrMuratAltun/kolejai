import { getNewsItems } from "@/services/newsService";
import NewsClient from "./NewsClient";

export default async function NewsManagementPage() {
  // Fetch initial data on the server
  const newsItems = await getNewsItems();

  return (
    <div className="animate-in fade-in duration-500">
      <NewsClient initialNewsItems={newsItems} />
    </div>
  );
}
