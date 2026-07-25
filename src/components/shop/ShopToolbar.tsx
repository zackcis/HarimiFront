import Link from 'next/link';
import type { Audience, Locale } from '@/lib/types';
import { buildShopHref, type ShopQuery, withShopQuery } from '@/lib/shop';

const SORTS = [
  { value: 'newest', it: 'Più recenti', en: 'Newest' },
  { value: 'price_asc', it: 'Prezzo ↑', en: 'Price ↑' },
  { value: 'price_desc', it: 'Prezzo ↓', en: 'Price ↓' },
] as const;

export function ShopToolbar({
  locale,
  audience,
  query,
  count,
}: {
  locale: Locale;
  audience: Audience;
  query: ShopQuery;
  count: number;
}) {
  const it = locale === 'it';
  const current = query.sort ?? 'newest';

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-4">
      <p className="text-sm text-muted">
        {count} {it ? 'prodotti' : 'products'}
      </p>
      <div className="eyebrow flex flex-wrap gap-4">
        {SORTS.map((sort) => (
          <Link
            key={sort.value}
            href={buildShopHref(
              locale,
              audience,
              withShopQuery(query, { sort: sort.value }),
            )}
            className={`inline-flex min-h-9 items-center ${
              current === sort.value
                ? 'text-ink underline underline-offset-4'
                : 'nav-link-underline text-muted hover:text-ink'
            }`}
          >
            {it ? sort.it : sort.en}
          </Link>
        ))}
      </div>
    </div>
  );
}
