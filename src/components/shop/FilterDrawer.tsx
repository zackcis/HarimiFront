'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ShopFilters } from '@/components/shop/ShopFilters';
import type { Audience, CategoryNode, Locale } from '@/lib/types';
import { buildShopHref, type ShopFacets, type ShopQuery } from '@/lib/shop';

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

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const hasFilters = Boolean(query.brand || query.size || query.color || query.q);
  const clearHref = buildShopHref(locale, audience, { category: audienceRootSlug, sort: query.sort });

  return (
    <>
      <button
        type="button"
        className="eyebrow tap inline-flex items-center border border-ink px-4 transition-[background-color,color] duration-(--dur-fast) hover:bg-ink hover:text-ivory lg:hidden"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {it ? 'Filtra' : 'Filter'}
      </button>
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={it ? 'Filtri' : 'Filters'}
          className="fixed inset-0 z-50 flex flex-col bg-ivory lg:hidden"
        >
          <div className="flex h-(--header-h) shrink-0 items-center justify-between border-b border-line px-5">
            <span className="eyebrow">{it ? 'Filtri' : 'Filters'}</span>
            <button
              type="button"
              className="eyebrow tap inline-flex items-center justify-center px-2"
              onClick={() => setOpen(false)}
            >
              {it ? 'Chiudi' : 'Close'}
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 py-8">
            <ShopFilters
              locale={locale}
              audience={audience}
              query={query}
              facets={facets}
              categories={categories}
              audienceRootSlug={audienceRootSlug}
            />
          </div>

          <div className="shrink-0 border-t border-line bg-ivory px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <div className="flex items-center gap-3">
              <Link
                href={clearHref}
                aria-disabled={!hasFilters}
                className={`eyebrow inline-flex min-h-11 flex-1 items-center justify-center border border-line ${
                  hasFilters ? 'text-ink' : 'pointer-events-none text-muted opacity-40'
                }`}
              >
                {it ? 'Azzera' : 'Clear'}
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="eyebrow inline-flex min-h-11 flex-2 items-center justify-center bg-ink text-ivory"
              >
                {it ? 'Vedi i risultati' : 'View results'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
