import { getPageBySlug, Page } from '@/services/pageService';
import { notFound } from 'next/navigation';
import HtmlRenderer from '@/components/layout/HtmlRenderer';

type Props = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: Props) {
    const page = await getPageBySlug(params.slug);
    if (!page) {
        return {
            title: 'Sayfa Bulunamadı',
        }
    }
    return {
        title: `${page.title} | Bilge Yıldız Koleji`,
    }
}


export default async function DynamicPage({ params }: Props) {
  const page: Page | null = await getPageBySlug(params.slug);

  if (!page) {
    notFound();
  }

  return (
    <div className="bg-background pt-24 pb-16">
        <div className="container mx-auto px-4">
             <HtmlRenderer htmlContent={page.htmlContent || ''} />
        </div>
    </div>
  );
}
