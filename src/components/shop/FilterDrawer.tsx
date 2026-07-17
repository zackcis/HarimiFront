'use client';

import { useState } from 'react';
import { ShopFilters } from '@/components/shop/ShopFilters';
import type { Audience, CategoryNode, Locale } from '@/lib/types';
import type { ShopFacets, ShopQuery } from '@/lib/shop';

export function FilterDrawer({
  locale,
  audience,
  query,
  facets,
  categories,
  audienceRootSlug,
}: {
  locale: Locale;
  audience: Audience;
  query: ShopQuery;
  facets: ShopFacets;
  categories: CategoryNode[];
  audienceRootSlug: string;
}) {
  const [open, setOpen] = useState(false);
  const it = locale === 'it';

  return (
    <>
      <button
        type="button"
        className="border border-ink px-4 py-2 text-[11px] tracking-[0.16em] uppercase lg:hidden"
        onClick={() => setOpen(true)}
      >
        {it ? 'Filtra' : 'Filter'}
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-ivory lg:hidden">
          <div className="flex h-[var(--header-h)] items-center justify-between border-b border-line px-5">
            <span className="text-[11px] tracking-[0.18em] uppercase">
              {it ? 'Filtri' : 'Filters'}
            </span>
            <button
              type="button"
              className="text-[11px] tracking-[0.16em] uppercase"
              onClick={() => setOpen(false)}
            >
              {it ? 'Chiudi' : 'Close'}
            </button>
          </div>
          <div className="max-h-[calc(100vh-var(--header-h))] overflow-y-auto px-5 py-8">
            <ShopFilters
              locale={locale}
              audience={audience}
              query={query}
              facets={facets}
              categories={categories}
              audienceRootSlug={audienceRootSlug}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
