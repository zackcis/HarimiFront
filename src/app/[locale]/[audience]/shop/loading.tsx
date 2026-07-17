import { ProductGridSkeleton, SkeletonBlock } from '@/components/EmptyState';

export default function ShopLoading() {
  return (
    <div className="container-wide py-10 md:py-14">
      <SkeletonBlock className="h-3 w-40" />
      <SkeletonBlock className="mt-6 h-10 w-64" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <div className="hidden space-y-4 lg:block">
          <SkeletonBlock className="h-4 w-24" />
          <SkeletonBlock className="h-32 w-full" />
          <SkeletonBlock className="h-4 w-20" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
        <ProductGridSkeleton count={8} />
      </div>
    </div>
  );
}
