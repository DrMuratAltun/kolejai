import PageEditor from '../PageEditor';
import { getPages } from '@/services/pageService';

export default async function NewPage() {
  const allPages = await getPages();
  return <PageEditor allPages={allPages} />;
}
