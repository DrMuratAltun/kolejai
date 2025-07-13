
import { getPageBySlug, Page } from '@/services/pageService';
import { notFound } from 'next/navigation';

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
        title: page.title,
    }
}

export default async function DynamicPage({ params }: Props) {
  const page: Page | null = await getPageBySlug(params.slug);

  if (!page || !page.htmlContent) {
    notFound();
  }

  // The `not-prose` class is crucial. It tells Tailwind's typography plugin
  // to IGNORE this container, allowing the AI-generated classes (for colors,
  // spacing, shadows, etc.) to be applied without being overridden by
  // the plugin's default styles. This ensures that the generated HTML
  // renders exactly as intended by the AI prompt.
  return (
    <div className="pt-24 pb-16 not-prose">
        <div dangerouslySetInnerHTML={{ __html: page.htmlContent }} />
    </div>
  );
}
