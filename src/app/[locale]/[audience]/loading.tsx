import { HeroSkeleton, ProductGridSkeleton, SkeletonBlock } from '@/components/EmptyState';

export default function AudienceHomeLoading() {
  return (
    <div>
      <HeroSkeleton tall />
      <div className="container-wide section-y">
        <SkeletonBlock className="mb-12 h-10 w-64" />
        <ProductGridSkeleton count={4} />
      </div>
    </div>
  );
}
