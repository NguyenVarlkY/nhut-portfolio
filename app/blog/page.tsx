import { getPosts } from '@/lib/blog';
import BlogContent from '@/components/BlogContent';

export default async function BlogPage() {
  const posts = await getPosts();
  
  return (
    <div className="container-port section-pad">
      <BlogContent posts={posts} />
    </div>
  );
}