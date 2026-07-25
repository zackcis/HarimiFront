'use client';

import { useRef } from 'react';
import { ProductCardView } from '@/components/ProductCard';
import type { Locale, ProductCard } from '@/lib/types';

/** Matches ProductCard tile widths so arrow height = one media frame (aspect 3/4). */
const CARD_MEDIA_H =
  'h-[calc(min(42vw,11.5rem)*4/3)] sm:h-64 md:h-[calc(13rem*4/3)] lg:h-[calc(14rem*4/3)]';

export function ProductCarousel({
  products,
  locale,
}: {
  products: ProductCard[];
  locale: Locale;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.75, 320);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {/* Height locked to one product card image — never the full rail width */}
      <div
        className={`pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-2 md:px-3 ${CARD_MEDIA_H}`}
      >
        <button
          type="button"
          aria-label="Previous"
          onClick={() => scrollBy(-1)}
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-ivory/95 text-ink shadow-sm transition-[border-color,opacity] duration-(--dur-base) hover:border-ink hover:opacity-90"
        >
          <span aria-hidden className="text-lg leading-none">
            ‹
          </span>
        </button>
        <button
          type="button"
          aria-label="Next"
          onClick={() => scrollBy(1)}
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-ivory/95 text-ink shadow-sm transition-[border-color,opacity] duration-(--dur-base) hover:border-ink hover:opacity-90"
        >
          <span aria-hidden className="text-lg leading-none">
            ›
          </span>
        </button>
      </div>

      <div
        ref={scrollerRef}
        className="scroll-rail edge-fade flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:gap-5"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="w-[min(42vw,11.5rem)] shrink-0 snap-start sm:w-48 md:w-52 lg:w-56"
          >
            <ProductCardView product={product} locale={locale} quickLook="plus" />
          </div>
        ))}
      </div>
    </div>
  );
}
