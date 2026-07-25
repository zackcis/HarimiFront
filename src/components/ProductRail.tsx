import Link from 'next/link';
import { ProductCardView } from '@/components/ProductCard';
import { ProductCarousel } from '@/components/ProductCarousel';
import type { Locale, ProductCard } from '@/lib/types';

export function ProductRail({
  title,
  products,
  locale,
  href,
  cta,
  layout = 'grid',
  inset = false,
}: {
  title: string;
  products: ProductCard[];
  locale: Locale;
  href?: string;
  cta?: string;
  /** `carousel` = title + horizontal product strip (centered on mobile, side title on desktop). */
  layout?: 'grid' | 'carousel';
  /** Nested inside an already-padded container — no section-y / container-wide. */
  inset?: boolean;
}) {
  if (!products.length) {
    return null;
  }

  const list = products.slice(0, layout === 'carousel' ? 12 : 8);

  if (layout === 'carousel') {
    return (
      <section className="py-10 md:py-14">
        <div className="container-wide">
          {/* Mobile: centered title + horizontal carousel */}
          <div className="md:hidden">
            <div className="mb-5 text-center">
              <h2 className="font-serif text-3xl tracking-tight">{title}</h2>
              {href && cta ? (
                <Link href={href} className="eyebrow mt-3 inline-flex underline">
                  {cta}
                </Link>
              ) : null}
            </div>
            <ProductCarousel products={list} locale={locale} />
          </div>

          {/* Desktop: title left + horizontal carousel */}
          <div className="hidden md:grid md:grid-cols-[minmax(11rem,22%)_minmax(0,1fr)] md:items-center md:gap-8 lg:gap-12">
            <div className="max-w-[16rem]">
              <h2 className="font-serif text-4xl leading-[1.1] tracking-tight lg:text-5xl">
                {title}
              </h2>
              {href && cta ? (
                <Link href={href} className="eyebrow mt-4 inline-flex underline">
                  {cta}
                </Link>
              ) : null}
            </div>
            <ProductCarousel products={list} locale={locale} />
          </div>
        </div>
      </section>
    );
  }

  const header = (
    <div
      className={`flex flex-wrap items-end justify-between gap-4 ${inset ? 'mb-6' : 'mb-8 md:mb-10'}`}
    >
      <h2 className="font-serif text-3xl tracking-tight md:text-5xl">{title}</h2>
      {href && cta ? (
        <Link href={href} className="eyebrow underline">
          {cta}
        </Link>
      ) : null}
    </div>
  );

  const grid = (
    <div className="product-grid">
      {list.map((product) => (
        <ProductCardView key={product.id} product={product} locale={locale} />
      ))}
    </div>
  );

  if (inset) {
    return (
      <section>
        {header}
        {grid}
      </section>
    );
  }

  return (
    <section className="py-10 md:py-14">
      <div className="container-wide">
        {header}
        {grid}
      </div>
    </section>
  );
}
