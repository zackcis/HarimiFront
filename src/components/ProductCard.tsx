import Link from 'next/link';
import type { Locale } from '@/lib/types';
import { formatEur } from '@/lib/api';
import type { ProductCard } from '@/lib/types';
import { QuickLookButton } from '@/components/QuickLook';

function discountPercent(from: string | null, compare: string | null): number | null {
  const now = Number(from);
  const was = Number(compare);
  if (!Number.isFinite(now) || !Number.isFinite(was) || was <= now || was <= 0) {
    return null;
  }
  return Math.round((1 - now / was) * 100);
}

const SWATCH_MAX = 5;

function ColorSwatches({
  colors,
}: {
  colors: Array<{ name: string; hex: string | null }>;
}) {
  if (colors.length <= 1) return null;
  const shown = colors.slice(0, SWATCH_MAX);
  const extra = colors.length - shown.length;
  const label = colors.map((c) => c.name).join(', ');

  return (
    <span
      className="mt-2 flex items-center gap-1.5"
      aria-label={label}
    >
      {shown.map((color) => (
        <span
          key={`${color.name}-${color.hex ?? ''}`}
          aria-hidden
          className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-line"
          style={{ backgroundColor: color.hex || '#c4beb6' }}
          title={color.name}
        />
      ))}
      {extra > 0 ? (
        <span aria-hidden className="text-[10px] tracking-wide text-muted">
          +{extra}
        </span>
      ) : null}
    </span>
  );
}

export function ProductCardView({
  product,
  locale,
  quickLook = 'bar',
}: {
  product: ProductCard;
  locale: Locale;
  quickLook?: 'bar' | 'plus';
}) {
  const it = locale === 'it';
  const onSale = Boolean(product.compare_at_from);
  const pct = discountPercent(product.price_from, product.compare_at_from);

  const pdpHref = `/${locale}/p/${product.slug}`;

  return (
    <div className="group relative">
      <div className="product-card-media">
        <Link href={pdpHref} aria-label={product.title} className="block h-full w-full">
          {product.primary_image_url ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={product.primary_image_url} alt={product.title} className="img-zoom" />
              {product.secondary_image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.secondary_image_url} alt="" aria-hidden className="media-secondary" />
              ) : null}
            </>
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="harimi-mark text-[10px] text-muted">HARIMI</span>
            </div>
          )}
        </Link>

        {!product.in_stock ? (
          <span className="eyebrow pointer-events-none absolute left-3 top-3 z-10 text-muted">
            {it ? 'Esaurito' : 'Sold out'}
          </span>
        ) : onSale && pct ? (
          <span className="pointer-events-none absolute left-2.5 top-2.5 z-10 bg-ivory/90 px-1.5 py-0.5 text-[11px] leading-none tracking-normal text-sale tabular-nums backdrop-blur-[2px] sm:left-3 sm:top-3 sm:text-xs">
            −{pct}%
          </span>
        ) : null}

        {product.primary_image_url && product.in_stock ? (
          <QuickLookButton slug={product.slug} locale={locale} variant={quickLook} />
        ) : null}
      </div>

      <Link href={pdpHref} className="mt-3 block space-y-1 md:mt-4">
        {product.brand?.name ? (
          <p className="eyebrow text-muted">{product.brand.name}</p>
        ) : null}
        <h3 className="font-serif text-[1.05rem] leading-snug text-ink md:text-[1.15rem] md:text-xl">
          {product.title}
        </h3>
        {onSale ? (
          <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1 text-sm">
            <span className="text-sale">
              {product.price_from ? formatEur(product.price_from, locale) : '—'}
            </span>
            <span className="text-muted line-through">
              {formatEur(product.compare_at_from, locale)}
            </span>
          </p>
        ) : (
          <p className="pt-1 text-sm text-ink/75">
            {product.price_from ? formatEur(product.price_from, locale) : '—'}
          </p>
        )}
        <ColorSwatches colors={product.colors ?? []} />
      </Link>
    </div>
  );
}
