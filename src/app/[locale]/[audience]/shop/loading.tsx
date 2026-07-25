import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';

export default function Loading() {
  return (
    <main className="container-wide py-10 md:py-14">
      <div className="skeleton h-3 w-40" />
      <div className="skeleton mt-6 h-11 w-64" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[220px_1fr]">
        <div className="hidden space-y-6 lg:block">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skeleton h-4 w-32" />
          ))}
        </div>
        <div className="mt-8 product-grid lg:mt-0">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
