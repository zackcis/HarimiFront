import Link from 'next/link';
import { ProductCardView } from '@/components/ProductCard';
import type { Locale, ProductCard } from '@/lib/types';

export function ProductRail({
  title,
  products,
  locale,
  href,
  cta,
}: {
  title: string;
  products: ProductCard[];
  locale: Locale;
  href?: string;
  cta?: string;
}) {
  if (!products.length) {
    return null;
  }

  return (
    <section className="section-y">
      <div className="container-wide">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-serif text-3xl tracking-tight md:text-5xl">{title}</h2>
          {href && cta ? (
            <Link href={href} className="text-[11px] tracking-[0.18em] uppercase underline">
              {cta}
            </Link>
          ) : null}
        </div>
        <div className="product-grid">
          {products.slice(0, 8).map((product) => (
            <ProductCardView key={product.id} product={product} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
