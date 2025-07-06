import { getPageById, getPages } from "@/services/pageService"
import MenuItemEditor from "../../MenuItemEditor";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: { id: string } }) {
  const [page, allPages] = await Promise.all([
    getPageById(params.id),
    getPages()
  ]);

  if (!page) {
    notFound();
  }

  return (
    <MenuItemEditor page={page} allPages={allPages} />
  );
}
