import Link from 'next/link';
import type { Audience, Locale } from '@/lib/types';
import { buildShopHref, type ShopQuery, withShopQuery } from '@/lib/shop';

export function ActiveFilterChips({
  locale,
  audience,
  query,
  categoryLabel,
  brandLabel,
}: {
  locale: Locale;
  audience: Audience;
  query: ShopQuery;
  categoryLabel?: string;
  brandLabel?: string;
}) {
  const it = locale === 'it';
  const chips: Array<{ key: keyof ShopQuery; label: string }> = [];

  if (query.category && categoryLabel && query.category !== audience) {
    chips.push({ key: 'category', label: categoryLabel });
  }
  if (query.brand && brandLabel) {
    chips.push({ key: 'brand', label: brandLabel });
  }
  if (query.size) chips.push({ key: 'size', label: query.size });
  if (query.color) chips.push({ key: 'color', label: query.color });
  if (query.q) chips.push({ key: 'q', label: `“${query.q}”` });

  if (!chips.length) return null;

  const clearAll = buildShopHref(locale, audience, {
    category: audience,
    sort: query.sort,
  });

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Link
          key={chip.key}
          href={buildShopHref(
            locale,
            audience,
            withShopQuery(query, {}, [chip.key]),
          )}
          className="inline-flex min-h-9 items-center border border-line px-3 py-1.5 text-xs text-muted transition hover:border-ink hover:text-ink"
        >
          {chip.label} ×
        </Link>
      ))}
      <Link
        href={clearAll}
        className="eyebrow inline-flex min-h-9 items-center underline"
      >
        {it ? 'Azzera' : 'Clear all'}
      </Link>
    </div>
  );
}
