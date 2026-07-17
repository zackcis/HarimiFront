import { SkeletonBlock } from '@/components/EmptyState';

export default function ProductLoading() {
  return (
    <div className="container-wide grid gap-12 py-12 md:grid-cols-2 md:gap-20 md:py-20">
      <div className="grid gap-4 md:grid-cols-[80px_1fr]">
        <div className="hidden space-y-2.5 md:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBlock key={i} className="aspect-[3/4] w-full" />
          ))}
        </div>
        <SkeletonBlock className="aspect-[3/4] w-full" />
      </div>
      <div className="space-y-6">
        <SkeletonBlock className="h-3 w-24" />
        <SkeletonBlock className="h-12 w-3/4" />
        <SkeletonBlock className="h-6 w-28" />
        <SkeletonBlock className="mt-8 h-8 w-40" />
        <SkeletonBlock className="h-10 w-56" />
        <SkeletonBlock className="h-12 w-full" />
        <SkeletonBlock className="h-24 w-full" />
      </div>
    </div>
  );
}
