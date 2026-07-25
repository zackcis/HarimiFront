import Link from 'next/link';
import { QuickLookButton } from '@/components/QuickLook';
import { formatEur } from '@/lib/api';
import { offersHref } from '@/lib/nav';
import type { Audience, Locale, ProductCard } from '@/lib/types';

function discountPercent(from: string | null, compare: string | null): number | null {
  const now = Number(from);
  const was = Number(compare);
  if (!Number.isFinite(now) || !Number.isFinite(was) || was <= now || was <= 0) {
    return null;
  }
  return Math.round((1 - now / was) * 100);
}

function maxDiscount(products: ProductCard[]): number | null {
  let max: number | null = null;
  for (const p of products) {
    const pct = discountPercent(p.price_from, p.compare_at_from);
    if (pct != null && (max === null || pct > max)) max = pct;
  }
  return max;
}

function CompactOfferTile({ product, locale }: { product: ProductCard; locale: Locale }) {
  const onSale = Boolean(product.compare_at_from);
  const pct = discountPercent(product.price_from, product.compare_at_from);
  const pdpHref = `/${locale}/p/${product.slug}`;

  return (
    <article className="group flex flex-col bg-ivory text-ink">
      <div className="relative aspect-3/4 overflow-hidden bg-ivory-2 [&_button]:h-7 [&_button]:w-7 [&_button]:bottom-2 [&_button]:right-2 [&_button]:border-0 [&_button]:shadow-none [&_button_span]:text-lg">
        <Link href={pdpHref} aria-label={product.title} className="block h-full w-full">
          {product.primary_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.primary_image_url}
              alt={product.title}
              className="img-zoom h-full w-full object-cover object-[center_18%]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="harimi-mark text-[9px] text-muted">HARIMI</span>
            </div>
          )}
        </Link>

        {pct ? (
          <span className="pointer-events-none absolute top-0 left-0 z-10 bg-ink px-1.5 py-1 text-[9px] leading-none tracking-wide text-ivory">
            −{pct}%
          </span>
        ) : null}

        {product.primary_image_url && product.in_stock ? (
          <QuickLookButton slug={product.slug} locale={locale} variant="plus" />
        ) : null}
      </div>

      <Link href={pdpHref} className="block space-y-0.5 px-2 py-2">
        <p className="truncate text-[11px] leading-snug text-ink">{product.title}</p>
        {onSale ? (
          <p className="flex flex-wrap items-baseline gap-x-1.5 text-[11px]">
            <span className="text-ink">
              {product.price_from ? formatEur(product.price_from, locale) : '—'}
            </span>
            {product.compare_at_from ? (
              <span className="text-muted line-through">
                {formatEur(product.compare_at_from, locale)}
              </span>
            ) : null}
          </p>
        ) : (
          <p className="text-[11px] text-ink/75">
            {product.price_from ? formatEur(product.price_from, locale) : '—'}
          </p>
        )}
      </Link>
    </article>
  );
}

export function SpecialOffersBand({
  locale,
  audience,
  products,
}: {
  locale: Locale;
  audience: Audience;
  products: ProductCard[];
}) {
  if (!products.length) return null;

  const it = locale === 'it';
  const offersUrl = offersHref(locale, audience);
  const featured = products[0];
  const grid = products.slice(1, 5);
  const tiles = grid.length >= 2 ? grid : products.slice(0, 4);
  const peak = maxDiscount(products);

  return (
    <section className="bg-ink text-ivory">
      <div className="container-wide max-w-5xl py-8 md:py-10">
        <header className="mx-auto max-w-lg text-center">
          <p className="eyebrow text-[10px] text-ivory/55">
            {it ? 'Offerta speciale' : 'Special offer'}
          </p>
          <h2 className="mt-2 font-serif text-2xl tracking-tight md:text-[1.85rem]">
            {it ? 'Offerte speciali' : 'Special offers'}
          </h2>
          <p className="mt-2 text-xs leading-relaxed text-ivory/65">
            {peak
              ? it
                ? `Selezione curata con sconti fino al ${peak}%.`
                : `A curated edit with discounts up to ${peak}%.`
              : it
                ? 'Una selezione esclusiva a condizioni privilegiate.'
                : 'An exclusive selection at privileged conditions.'}
          </p>
        </header>

        <div className="mt-6 grid items-stretch gap-2 md:mt-7 md:grid-cols-2 md:gap-2.5">
          {/* Featured story — matches reference overlay hierarchy */}
          <Link
            href={offersUrl}
            className="group relative flex min-h-[220px] flex-col justify-end overflow-hidden md:min-h-0"
          >
            {featured.primary_image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={featured.primary_image_url}
                alt=""
                aria-hidden
                className="img-zoom absolute inset-0 h-full w-full object-cover object-[center_18%] transition group-hover:scale-[1.02]"
              />
            ) : (
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(247,243,236,0.14),transparent_55%),linear-gradient(160deg,#1c1c1c,#0a0a0a)]"
                aria-hidden
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/25 to-transparent" />

            <div className="relative z-10 space-y-1.5 p-4 md:p-5">
              <p className="eyebrow text-[9px] text-ivory/70">{it ? 'La selezione' : 'The edit'}</p>
              <p className="font-serif text-xl leading-tight text-ivory md:text-2xl">
                {it ? 'Scopri le offerte' : 'Shop the offers'}
              </p>
              <span className="inline-flex items-center text-[10px] tracking-[0.16em] text-ivory uppercase underline decoration-ivory/50 underline-offset-4 transition group-hover:decoration-ivory">
                {it ? 'Scopri la selezione' : 'Discover the edit'}
                <span aria-hidden className="ml-1.5 no-underline">
                  →
                </span>
              </span>
            </div>
          </Link>

          {/* 2×2 product mosaic */}
          <div className="grid grid-cols-2 gap-2 md:gap-2.5">
            {tiles.map((product) => (
              <CompactOfferTile key={product.id} product={product} locale={locale} />
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Link
            href={offersUrl}
            className="eyebrow inline-flex min-h-9 items-center border border-ivory/45 px-6 text-[10px] text-ivory transition hover:bg-ivory hover:text-ink"
          >
            {it ? 'Vedi tutte le offerte' : 'View all offers'}
            <span aria-hidden className="ml-2">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
