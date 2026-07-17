import { HeroSkeleton, ProductGridSkeleton, SkeletonBlock } from '@/components/EmptyState';

export default function CategoryLandingLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="container-wide section-y space-y-6">
        <SkeletonBlock className="h-5 w-full max-w-xl" />
        <SkeletonBlock className="h-5 w-2/3 max-w-md" />
        <SkeletonBlock className="mt-8 h-12 w-48" />
      </div>
      <div className="container-wide pb-20">
        <SkeletonBlock className="mb-12 h-10 w-48" />
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
