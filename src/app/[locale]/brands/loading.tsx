import { SkeletonBlock } from '@/components/EmptyState';

export default function BrandsLoading() {
  return (
    <div>
      <div className="container-wide section-y space-y-4">
        <SkeletonBlock className="h-3 w-20" />
        <SkeletonBlock className="h-12 w-48" />
        <SkeletonBlock className="h-4 w-full max-w-md" />
      </div>
      <div className="container-wide pb-20">
        <div className="grid grid-cols-2 gap-px bg-line lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <SkeletonBlock key={i} className="min-h-[160px] w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
