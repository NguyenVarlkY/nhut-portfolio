export default function BlogListSkeleton() {
  return (
    <div className="grid gap-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-6 rounded-xl border border-subtle bg-surface animate-pulse">
          <div className="h-8 bg-subtle/50 rounded-lg w-3/4 mb-4"></div>
          <div className="h-4 bg-subtle/50 rounded-lg w-full mb-2"></div>
          <div className="h-4 bg-subtle/50 rounded-lg w-5/6 mb-4"></div>
          <div className="h-4 bg-subtle/50 rounded-lg w-1/4"></div>
        </div>
      ))}
    </div>
  );
}
