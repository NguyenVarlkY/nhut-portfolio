import type { Metadata } from 'next';
import { getPosts } from '@/lib/blog';
import BlogContent from '@/components/blog/BlogContent';
import { st } from '@/lib/i18n/server';
import { i18n } from '@/lib/i18n/config';
import type { Lang } from '@/lib/i18n/LanguageContext';

const SITE_URL = 'https://nhuty.dev';

export async function generateMetadata({ params }: { params: { lang: Lang } }): Promise<Metadata> {
  const url = `${SITE_URL}/${params.lang}/blog`;
  const title = st(params.lang, 'blog.metaTitle');
  const description = st(params.lang, 'blog.metaDescription');
  const languages = Object.fromEntries(i18n.locales.map((l) => [l, `${SITE_URL}/${l}/blog`]));
  return {
    title,
    description,
    alternates: { canonical: url, languages },
    openGraph: { type: 'website', url, title, description },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function BlogPage({ params }: { params: { lang: Lang } }) {
  const posts = await getPosts(params.lang);

  return (
    <div className="container-port section-pad">
      <BlogContent posts={posts} lang={params.lang} />
    </div>
  );
}
