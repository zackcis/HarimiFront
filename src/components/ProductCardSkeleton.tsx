export function ProductCardSkeleton() {
  return (
    <div className="block">
      <div className="skeleton aspect-3/4 w-full" />
      <div className="mt-4 space-y-2">
        <div className="skeleton h-2.5 w-20" />
        <div className="skeleton h-4 w-3/4" />
        <div className="skeleton h-3 w-16" />
      </div>
    </div>
  );
}
