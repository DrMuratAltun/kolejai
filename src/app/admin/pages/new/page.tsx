import MenuItemEditor from '../MenuItemEditor';
import { getPages } from '@/services/pageService';

export default async function NewPage() {
  const allPages = await getPages();
  return <MenuItemEditor allPages={allPages} />;
}
