import { getGalleryItems } from "@/services/galleryService";
import GalleryClient from "./GalleryClient";

export default async function GalleryManagementPage() {
  const galleryItems = await getGalleryItems();

  return (
    <div className="animate-in fade-in duration-500">
      <GalleryClient initialItems={galleryItems} />
    </div>
  );
}
