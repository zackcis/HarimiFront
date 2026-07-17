import Link from 'next/link';
import type { Locale } from '@/lib/types';
import { formatEur } from '@/lib/api';
import type { ProductCard } from '@/lib/types';

export function ProductCardView({
  product,
  locale,
}: {
  product: ProductCard;
  locale: Locale;
}) {
  return (
    <Link href={`/${locale}/p/${product.slug}`} className="group block">
      <div className="product-card-media">
        {product.primary_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.primary_image_url}
            alt={product.title}
            className="img-zoom"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="harimi-mark text-[10px] text-muted">HARIMI</span>
          </div>
        )}
      </div>
      <div className="mt-5 space-y-1.5">
        {product.brand?.name ? (
          <p className="text-[10px] tracking-[0.2em] text-muted uppercase">
            {product.brand.name}
          </p>
        ) : null}
        <h3 className="font-serif text-[1.15rem] leading-snug text-ink md:text-xl">
          {product.title}
        </h3>
        <p className="pt-0.5 text-sm text-ink/75">
          {product.price_from ? formatEur(product.price_from, locale) : '—'}
          {!product.in_stock ? (
            <span className="ml-2 text-muted">
              {locale === 'it' ? 'Esaurito' : 'Sold out'}
            </span>
          ) : null}
        </p>
      </div>
    </Link>
  );
}
