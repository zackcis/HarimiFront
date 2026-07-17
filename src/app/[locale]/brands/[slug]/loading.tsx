import { HeroSkeleton, ProductGridSkeleton, SkeletonBlock } from '@/components/EmptyState';

export default function BrandLandingLoading() {
  return (
    <div>
      <HeroSkeleton />
      <div className="container-wide section-y space-y-4">
        <SkeletonBlock className="h-5 w-full max-w-2xl" />
        <SkeletonBlock className="h-5 w-3/4 max-w-xl" />
      </div>
      <div className="container-wide pb-20">
        <SkeletonBlock className="mb-12 h-10 w-56" />
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
