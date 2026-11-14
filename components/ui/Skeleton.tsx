export default function Skeleton() {
  return (
    <div className="animate-pulse flex flex-col gap-4">
      <div className="h-10 bg-subtle/50 rounded-lg w-3/4"></div>
      <div className="h-4 bg-subtle/50 rounded-lg w-1/4"></div>
      <div className="space-y-3 mt-8">
        <div className="h-4 bg-subtle/50 rounded-lg"></div>
        <div className="h-4 bg-subtle/50 rounded-lg"></div>
        <div className="h-4 bg-subtle/50 rounded-lg w-5/6"></div>
      </div>
    </div>
  );
}
