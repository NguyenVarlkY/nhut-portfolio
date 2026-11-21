import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Giscus from '@/components/blog/Giscus';
import { getPost, getPostLangs, getSlugs } from '@/lib/blog';
import { ArrowLeft, Clock, Languages } from 'lucide-react';
import Link from 'next/link';
import { st } from '@/lib/i18n/server';
import { i18n } from '@/lib/i18n/config';
import { siteUrl } from '@/lib/seo';
import type { Lang } from '@/lib/i18n/LanguageContext';


type Params = { lang: Lang; slug: string };

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const SITE_URL = await siteUrl();
  const post = await getPost(params.slug, params.lang);
  if (!post) return {};
  const { frontmatter } = post;
  const url = `${SITE_URL}/${params.lang}/blog/${params.slug}`;
  const title = `${frontmatter.title} — NGUYEN BUI NHUT Y`;
  const description = frontmatter.excerpt || frontmatter.title;

  // Only advertise language versions that really exist; a fallback page
  // points its canonical at the original so it isn't indexed as a duplicate.
  const available = await getPostLangs(params.slug, i18n.locales);
  const languages = Object.fromEntries(available.map((l) => [l, `${SITE_URL}/${l}/blog/${params.slug}`]));
  const canonical = post.isFallback ? `${SITE_URL}/${post.lang}/blog/${params.slug}` : url;

  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: { type: 'article', url, title, description, publishedTime: frontmatter.date, locale: post.lang },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default async function PostPage({ params }: { params: Params }) {
  const { lang } = params;
  const post = await getPost(params.slug, lang);
  if (!post) notFound();
  const { frontmatter, content, readingTime } = post;
  const SITE_URL = await siteUrl();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: frontmatter.title,
    datePublished: frontmatter.date,
    inLanguage: post.lang,
    author: {
      "@type": "Person",
      name: "Nguyen Bui Nhut Y",
    },
    description: frontmatter.excerpt,
    url: `${SITE_URL}/${lang}/blog/${params.slug}`,
  };

  return (
    <div className="container-port section-pad max-w-[800px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/${lang}/blog`}
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-8 group"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        {st(lang, 'blog.backToBlog')}
      </Link>

      {post.isFallback && (
        <p className="mb-6 flex items-start gap-2 rounded-lg border border-subtle bg-surface px-4 py-3 text-sm text-muted">
          <Languages size={16} className="mt-0.5 shrink-0 text-primary-light" />
          {st(lang, 'blog.translationNotice')}
        </p>
      )}

      {post.cover && (
        // eslint-disable-next-line @next/next/no-img-element -- uploaded in /admin, served by /api/media
        <img src={post.cover} alt="" className="mb-8 aspect-[1200/630] w-full rounded-xl border border-subtle object-cover" />
      )}

      <h1 className="text-4xl font-bold mb-4" lang={post.lang}>{frontmatter.title}</h1>
      {!!post.tags?.length && (
        <div className="mb-4 flex flex-wrap gap-2">{post.tags.map((t) => <span key={t} className="chip">{t}</span>)}</div>
      )}

      <div className="flex items-center gap-4 text-sm text-muted mb-8">
        <span>{frontmatter.date}</span>
        <span className="w-1 h-1 rounded-full bg-subtle" />
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {st(lang, 'blog.minRead').replace('{count}', String(readingTime))}
        </span>
      </div>

      <div className="prose prose-invert max-w-none mb-12" lang={post.lang}>
        <MDXRemote
          source={content}
          options={{
            parseFrontmatter: false,
            // posts can be written in /admin: never run code from them
            blockJS: true,
            blockDangerousJS: true,
          }}
        />
      </div>
      <Giscus />
    </div>
  );
}

export async function generateStaticParams() {
  return getSlugs().map((slug) => ({ slug }));
}
