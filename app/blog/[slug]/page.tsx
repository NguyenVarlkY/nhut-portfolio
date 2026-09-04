import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';
import Giscus from '@/components/Giscus';
import { calculateReadingTime } from '@/lib/blog';
import { ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

const contentDir = path.join(process.cwd(), 'content');

export default async function PostPage({ params }: { params: { slug: string } }) {
  const filePath = path.join(contentDir, `${params.slug}.mdx`);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const { data: frontmatter, content } = matter(fileContent);
  const readingTime = await calculateReadingTime(content);

  return (
    <div className="container-port section-pad max-w-[800px]">
      <Link 
        href="/blog" 
        className="inline-flex items-center gap-2 text-sm text-muted hover:text-primary transition-colors mb-8 group"
      >
        <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
        Back to Blog
      </Link>

      <h1 className="text-4xl font-bold mb-4">{frontmatter.title}</h1>
      
      <div className="flex items-center gap-4 text-sm text-muted mb-8">
        <span>{frontmatter.date}</span>
        <span className="w-1 h-1 rounded-full bg-subtle" />
        <span className="flex items-center gap-1.5">
          <Clock size={14} />
          {readingTime} min read
        </span>
      </div>

      <div className="prose prose-invert max-w-none mb-12">
        <MDXRemote 
          source={content}
          options={{ 
            parseFrontmatter: false 
          }}
        />
      </div>
      <Giscus />
    </div>
  );
}

export async function generateStaticParams() {
  const files = fs.readdirSync(contentDir);
  return files.map((filename) => ({
    slug: filename.replace('.mdx', ''),
  }));
}