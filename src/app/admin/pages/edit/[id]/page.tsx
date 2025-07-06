import { getPageById } from "@/services/pageService"
import PageEditor from "../../PageEditor";
import { notFound } from "next/navigation";

export default async function EditPage({ params }: { params: { id: string } }) {
  const page = await getPageById(params.id);

  if (!page) {
    notFound();
  }

  return (
    <PageEditor page={page} />
  );
}
