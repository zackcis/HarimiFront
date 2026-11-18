'use client';

import Link from 'next/link';
import { ProductCarousel } from '@/components/ProductCarousel';
import { shopHref } from '@/lib/nav';
import type { Audience, Locale, ProductCard } from '@/lib/types';

function LifestylePanel({
  image,
  href,
  cta,
  className = '',
}: {
  image: string | null;
  href: string;
  cta: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-ink ${className}`}>
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_40%_30%,rgba(247,243,236,0.14),transparent_55%),linear-gradient(160deg,#1a1a1a,#0c0c0c)]"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-black/35 via-transparent to-transparent" aria-hidden />
      <div className="absolute top-0 left-0 p-6 md:p-8 lg:p-10">
        <Link
          href={href}
          className="inline-flex min-h-11 items-center bg-ivory px-7 py-3.5 text-[11px] tracking-[0.22em] text-ink uppercase transition duration-(--dur-base) hover:bg-ivory/90"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}

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

  if (!products.length && !lifestyleImage) {
    return null;
  }

  const href = shopHref(locale, audience, { shelf: 'new_arrivals' });
  const cta = it ? 'Acquista ora' : 'Shop now';
  const subtitle = it
    ? 'Scopri le ultime novità della collezione.'
    : 'Discover the latest from the collection.';

  const copy = (
    <div className="max-w-md">
      <h2 className="font-serif text-3xl font-normal tracking-tight text-ink md:text-4xl lg:text-[2.75rem] lg:leading-none">
        {title}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-muted md:text-[15px]">{subtitle}</p>
      <Link
        href={href}
        className="mt-6 inline-flex min-h-11 items-center bg-ink px-7 py-3.5 text-[11px] tracking-[0.22em] text-ivory uppercase transition duration-(--dur-base) hover:bg-ink/85"
      >
        {cta}
      </Link>
    </div>
  );

  const empty = (
    <p className="mt-8 text-sm text-muted">
      {it
        ? 'Nessun prodotto in Novità. Curateli da Merchandising.'
        : 'No products in New arrivals yet. Curate them in Merchandising.'}
    </p>
  );

  return (
    <section className="border-t border-line bg-ivory">
      {/* Mobile / tablet: copy + rail first, short lifestyle strip below */}
      <div className="lg:hidden">
        <div className="container-wide py-10 md:py-14">
          <div className="mb-6 text-center md:mb-8 md:text-left">{copy}</div>
          {products.length > 0 ? (
            <ProductCarousel products={products} locale={locale} />
          ) : (
            empty
          )}
        </div>
        {lifestyleImage || !products.length ? (
          <LifestylePanel
            image={lifestyleImage}
            href={href}
            cta={cta}
            className="aspect-16/10 max-h-[32vh] w-full min-h-36"
          />
        ) : null}
      </div>

      {/* Desktop: lifestyle | copy + rail */}
      <div className="hidden lg:grid lg:grid-cols-2">
        <LifestylePanel
          image={lifestyleImage}
          href={href}
          cta={cta}
          className="min-h-[70vh]"
        />
        <div className="flex flex-col justify-center py-16 pl-12 pr-(--gutter) xl:py-20">
          {copy}
          {products.length > 0 ? (
            <div className="mt-10">
              <ProductCarousel products={products} locale={locale} />
            </div>
          ) : (
            empty
          )}
        </div>
      </div>
    </section>
  );
}
