import { getPageById, getPages } from "@/services/pageService"
import PageEditor from "../../PageEditor";
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
    <PageEditor page={page} allPages={allPages} />
  );
}
