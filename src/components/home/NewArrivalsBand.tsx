'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { ProductCardView } from '@/components/ProductCard';
import { shopHref } from '@/lib/nav';
import type { Audience, Locale, ProductCard } from '@/lib/types';

export function NewArrivalsBand({
  locale,
  audience,
  title,
  products,
  lifestyleImage,
}: {
  locale: Locale;
  audience: Audience;
  title: string;
  products: ProductCard[];
  lifestyleImage: string | null;
}) {
  const it = locale === 'it';
  const scrollerRef = useRef<HTMLDivElement>(null);

  if (!products.length && !lifestyleImage) {
    return null;
  }

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const amount = Math.min(el.clientWidth * 0.7, 280);
    el.scrollBy({ left: dir * amount, behavior: 'smooth' });
  };

  const href = shopHref(locale, audience, { shelf: 'new_arrivals' });
  const subtitle = it
    ? 'Scopri le ultime novità della collezione.'
    : 'Discover the latest from the collection.';

  return (
    <section className="border-t border-line bg-ivory">
      <div className="grid lg:grid-cols-2">
        <div className="relative min-h-[42vh] overflow-hidden bg-ink lg:min-h-[70vh]">
          {lifestyleImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={lifestyleImage}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-90"
            />
          ) : (
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_30%,rgba(247,243,236,0.14),transparent_55%),linear-gradient(160deg,#1a1a1a,#0c0c0c)]"
              aria-hidden
            />
          )}
        </div>

        <div className="flex flex-col justify-center px-(--gutter) py-12 md:py-16 lg:py-20 lg:pl-12 lg:pr-(--gutter)">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-md">
              <h2 className="font-serif text-3xl font-normal tracking-tight text-ink md:text-4xl lg:text-[2.75rem] lg:leading-none">
                {title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted md:text-[15px]">
                {subtitle}
              </p>
              <Link
                href={href}
                className="mt-6 inline-flex bg-ink px-7 py-3.5 text-[11px] tracking-[0.22em] text-ivory uppercase transition duration-(--dur-base) hover:bg-ink/85"
              >
                {it ? 'Acquista ora' : 'Shop now'}
              </Link>
            </div>

            {products.length > 1 ? (
              <div className="flex shrink-0 gap-2 self-start pt-1">
                <button
                  type="button"
                  aria-label={it ? 'Precedente' : 'Previous'}
                  onClick={() => scrollBy(-1)}
                  className="inline-flex h-10 w-10 items-center justify-center border border-line text-ink transition duration-(--dur-base) hover:border-ink"
                >
                  <span aria-hidden className="text-lg leading-none">
                    ‹
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={it ? 'Successivo' : 'Next'}
                  onClick={() => scrollBy(1)}
                  className="inline-flex h-10 w-10 items-center justify-center border border-line text-ink transition duration-(--dur-base) hover:border-ink"
                >
                  <span aria-hidden className="text-lg leading-none">
                    ›
                  </span>
                </button>
              </div>
            ) : null}
          </div>

          {products.length > 0 ? (
            <div
              ref={scrollerRef}
              className="scroll-rail mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 md:gap-5"
            >
              {products.map((product) => (
                <div
                  key={product.id}
                  className="w-[min(48vw,12rem)] shrink-0 snap-start sm:w-48 md:w-52"
                >
                  <ProductCardView product={product} locale={locale} quickLook="plus" />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-10 text-sm text-muted">
              {it
                ? 'Nessun prodotto in Novità. Curateli da Merchandising.'
                : 'No products in New arrivals yet. Curate them in Merchandising.'}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
