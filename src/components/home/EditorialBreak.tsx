import Link from 'next/link';
import { QuickLookButton } from '@/components/QuickLook';
import { formatEur } from '@/lib/api';
import { shopHref } from '@/lib/nav';
import type { Audience, Locale, ProductCard } from '@/lib/types';

function EditTile({
  product,
  locale,
  className = '',
  caption = true,
}: {
  product: ProductCard;
  locale: Locale;
  className?: string;
  caption?: boolean;
}) {
  const pdpHref = `/${locale}/p/${product.slug}`;
  const onSale = Boolean(product.compare_at_from);

  return (
    <article className={`group relative flex min-h-0 flex-col ${className}`}>
      <div className="relative min-h-0 flex-1 overflow-hidden bg-ivory-2 [&_button]:h-7 [&_button]:w-7 [&_button]:bottom-2 [&_button]:right-2">
        <Link href={pdpHref} aria-label={product.title} className="absolute inset-0 block">
          {product.primary_image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.primary_image_url}
              alt={product.title}
              className="img-zoom h-full w-full object-cover object-[center_18%]"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="harimi-mark text-[10px] text-muted">HARIMI</span>
            </div>
          )}
        </Link>
        {product.primary_image_url && product.in_stock ? (
          <QuickLookButton slug={product.slug} locale={locale} variant="plus" />
        ) : null}
      </div>
      {caption ? (
        <Link href={pdpHref} className="mt-1.5 shrink-0 space-y-0.5">
          <p className="truncate text-[11px] leading-snug text-ink">{product.title}</p>
          <p className={`text-[11px] ${onSale ? 'text-sale' : 'text-ink/70'}`}>
            {product.price_from ? formatEur(product.price_from, locale) : '—'}
          </p>
        </Link>
      ) : null}
    </article>
  );
}

export function EditorialBreak({
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
  const lead = products[0];
  const side = products.slice(1, 3);
  const selectionHref = shopHref(locale, audience, { shelf: 'featured' });

  return (
    <section className="bg-ivory-2/50 text-ink">
      {/* Desktop: magazine spread in ~90svh */}
      <div className="container-wide hidden h-[90svh] max-h-[900px] min-h-[520px] grid-cols-[minmax(0,0.95fr)_minmax(0,1.35fr)] gap-8 py-8 lg:grid lg:gap-10 lg:py-10">
        <div className="flex flex-col justify-between py-2">
          <div className="max-w-sm">
            <p className="eyebrow text-muted">{it ? 'Editoriale' : 'Editorial'}</p>
            <h2 className="mt-3 font-serif text-[2.35rem] leading-[1.1] tracking-tight xl:text-[2.75rem]">
              {it ? 'La selezione della settimana.' : 'This week’s edit.'}
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
              {it
                ? 'Uno spazio più lento: immagini ampie, pochi pezzi, la stessa cura della boutique.'
                : 'A slower space: wide images, fewer pieces, the same boutique care.'}
            </p>
          </div>
          <Link
            href={selectionHref}
            className="eyebrow mt-8 inline-flex w-fit items-center underline decoration-ink/30 underline-offset-4 transition hover:decoration-ink"
          >
            {it ? 'Vedi la selezione' : 'View the selection'}
            <span aria-hidden className="ml-2 no-underline">
              →
            </span>
          </Link>
        </div>

        <div
          className={`grid min-h-0 gap-3 xl:gap-4 ${
            side.length > 0 ? 'grid-cols-[1.15fr_0.85fr]' : 'grid-cols-1'
          }`}
        >
          <EditTile product={lead} locale={locale} className="h-full" />
          {side.length > 0 ? (
            <div className="grid min-h-0 grid-rows-2 gap-3 xl:gap-4">
              {side.map((product) => (
                <EditTile key={product.id} product={product} locale={locale} className="h-full" />
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile / tablet: compact 90svh stack */}
      <div className="container-wide flex h-[90svh] max-h-[820px] min-h-[560px] flex-col gap-3 py-6 lg:hidden">
        <header className="shrink-0">
          <p className="eyebrow text-muted">{it ? 'Editoriale' : 'Editorial'}</p>
          <h2 className="mt-1.5 font-serif text-2xl leading-tight tracking-tight sm:text-[1.75rem]">
            {it ? 'La selezione della settimana.' : 'This week’s edit.'}
          </h2>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted">
            {it
              ? 'Uno spazio più lento: immagini ampie, pochi pezzi.'
              : 'A slower space: wide images, fewer pieces.'}
          </p>
        </header>

        <EditTile product={lead} locale={locale} className="min-h-0 flex-[1.4]" caption={false} />

        {side.length > 0 ? (
          <div className="grid min-h-0 flex-1 grid-cols-2 gap-2.5">
            {side.map((product) => (
              <EditTile key={product.id} product={product} locale={locale} className="h-full" />
            ))}
          </div>
        ) : null}

        <Link
          href={selectionHref}
          className="eyebrow shrink-0 inline-flex w-fit items-center underline decoration-ink/30 underline-offset-4"
        >
          {it ? 'Vedi la selezione' : 'View the selection'}
          <span aria-hidden className="ml-2 no-underline">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}
