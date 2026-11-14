'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslation, type Lang } from '@/lib/i18n/LanguageContext';

interface BlogPostFrontmatter {
  title: string;
  excerpt: string;
  date: string;
}

interface BlogPost {
  slug: string;
  frontmatter: BlogPostFrontmatter;
  lang: string;
  isFallback: boolean;
}

interface Props {
  posts: BlogPost[];
  lang: Lang;
}

export default function BlogContent({ posts, lang }: Props) {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const postsPerPage = 6;

  // Search functionality
  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(post =>
      post.frontmatter.title.toLowerCase().includes(q) ||
      post.frontmatter.excerpt.toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / postsPerPage));
  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredPosts, currentPage, postsPerPage]);

  return (
    <div className="container-port section-pad">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">{t('blog.title')}</h1>
        <div className="mt-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <input
              type="text"
              placeholder={t('blog.searchPlaceholder')}
              aria-label={t('blog.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page when searching
                setShowSuggestions(true); // Show suggestions when typing
              }}
              onBlur={() => {
                // Hide suggestions after a short delay to allow clicking on results
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              onFocus={() => setShowSuggestions(true)} // Show suggestions when focused
              className="px-4 py-2 rounded-lg border border-subtle bg-surface focus:outline-none focus:ring-2 focus:ring-primary-light w-full"
            />
            {showSuggestions && searchQuery.trim() !== '' && (
              <div className="absolute left-0 right-0 mt-1 bg-surface border border-subtle rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
                {filteredPosts.length > 0 ? (
                  filteredPosts.slice(0, 5).map((post) => (
                    <div
                      key={post.slug}
                      className="px-4 py-2 hover:bg-primary-light/10 cursor-pointer border-b last:border-b-0"
                      onClick={() => {
                        setSearchQuery(''); // Clear search when selecting a suggestion
                        setShowSuggestions(false);
                      }}
                    >
                      <div className="font-medium">{post.frontmatter.title}</div>
                      <div className="text-xs text-muted">{post.frontmatter.excerpt}</div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-sm text-muted">
                    {t('blog.noResults')}
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            onClick={() => {
              setSearchQuery('');
              setShowSuggestions(false);
            }}
            className="px-3 py-2 rounded-lg border border-subtle text-sm hover:bg-surface/50 ml-2 lg:ml-0"
          >
            {t('blog.clear')}
          </button>
        </div>
        <div className="text-sm text-muted">
          {t('blog.postCount').replace('{count}', String(filteredPosts.length))}
        </div>
      </div>

      <div className="grid gap-6">
        {paginatedPosts.map((post) => (
          <div key={post.slug} className="overflow-hidden rounded-xl border border-subtle bg-surface hover:shadow-card transition-shadow">
            <Link href={`/${lang}/blog/${post.slug}`} className="block aspect-[1200/630] w-full overflow-hidden bg-base-alt">
              {/* eslint-disable-next-line @next/next/no-img-element -- generated per-post, not a static asset Next/Image can optimize */}
              <img
                src={`/${lang}/blog/${post.slug}/opengraph-image`}
                alt={post.frontmatter.title}
                loading="lazy"
                className="h-full w-full object-cover"
              />
            </Link>
            <div className="p-6" lang={post.lang}>
              <h2 className="text-2xl font-semibold mb-3">{post.frontmatter.title}</h2>
              <p className="text-muted mb-4 line-clamp-3">{post.frontmatter.excerpt}</p>
              <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                <span className="whitespace-nowrap">{post.frontmatter.date}</span>
                {post.isFallback && (
                  <span className="rounded border border-subtle px-1.5 py-0.5 font-mono uppercase">{post.lang}</span>
                )}
              </div>
              <Link href={`/${lang}/blog/${post.slug}`} className="mt-4 inline-block text-accent font-medium hover:underline" lang={lang}>
                {t('blog.readMore')}
              </Link>
            </div>
          </div>
        ))}

        {/* Show message when no posts match search */}
        {filteredPosts.length === 0 && searchQuery.trim() !== '' && (
          <div className="col-span-full text-center py-12">
            <p className="text-muted">{t('blog.noMatch').replace('{query}', searchQuery)}</p>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg border border-subtle hover:bg-primary-light/10 hover:text-primary-light transition-colors"
          >
            {t('blog.prev')}
          </button>

          <span className="px-3 py-2 rounded-lg border border-subtle text-sm">
            {t('blog.pageOf').replace('{current}', String(currentPage)).replace('{total}', String(totalPages))}
          </span>

          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg border border-subtle hover:bg-primary-light/10 hover:text-primary-light transition-colors"
          >
            {t('blog.next')}
          </button>
        </div>
      )}
    </div>
  );
}
