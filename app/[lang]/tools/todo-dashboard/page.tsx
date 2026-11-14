import TestTodo from '@/components/tools/TestTodo';
import { Metadata } from 'next';
import { st } from '@/lib/i18n/server';
import type { Lang } from '@/lib/i18n/LanguageContext';

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const title = st(params.lang, 'tools.todo.metaTitle');
  const description = st(params.lang, 'tools.todo.metaDescription');
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    },
  };
}

export default function TodoDashboardPage() {
  return (
    <div className="container-port section-pad">
      <TestTodo />
    </div>
  );
}
