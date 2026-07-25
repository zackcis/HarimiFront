import Link from 'next/link';
import type { Audience, CategoryNode, Locale } from '@/lib/types';
import {
  buildShopHref,
  type ShopFacets,
  type ShopQuery,
  withShopQuery,
} from '@/lib/shop';

const WOMEN_ORDER = ['bras', 'knickers', 'lingerie', 'knitwear', 'nightwear'];
const MEN_ORDER = ['boxers', 'briefs', 'tops', 'easywear', 'socks', 'swimsuits'];
const KIDS_ORDER = ['kids-underwear', 'kids-undershirts', 'kids-pyjamas', 'kids-socks'];

function sortCats(audience: Audience, cats: CategoryNode[]) {
  const order =
    audience === 'women' ? WOMEN_ORDER : audience === 'men' ? MEN_ORDER : KIDS_ORDER;
  return [...cats].sort((a, b) => {
    const ai = order.indexOf(a.slug);
    const bi = order.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

function countForSlug(
  categories: Array<{ slug: string; count: number }> | undefined,
  slug: string,
): number | null {
  const entry = categories?.find((c) => c.slug === slug);
  return entry ? entry.count : null;
}

function categoryLinkClass(active: boolean): string {
  return active
    ? 'border-l border-ink pl-3 font-medium text-ink'
    : 'border-l border-transparent pl-3 text-muted hover:text-ink';
}

export function ShopFilters({
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
  const it = locale === 'it';
  const href = (patch: Partial<ShopQuery>, unset: Array<keyof ShopQuery> = []) =>
    buildShopHref(locale, audience, withShopQuery(query, patch, unset));

  const ordered = sortCats(audience, categories);
  const isAll =
    !query.category || query.category === audienceRootSlug;

  const allCount = countForSlug(facets.categories, audienceRootSlug);
  const formatCount = (n: number | null) => (n === null ? '' : ` (${n})`);

  return (
    <aside className="space-y-8 text-sm [&>div]:border-t [&>div]:border-line [&>div]:pt-8 [&>div:first-child]:border-t-0 [&>div:first-child]:pt-0">
      <div>
        <p className="eyebrow text-muted">
          {it ? 'Categoria' : 'Category'}
        </p>
        <ul className="mt-4 space-y-0.5 [&>li>a]:block [&>li>a]:py-1.5">
          <li>
            <Link
              href={href({ category: audienceRootSlug }, ['shelf'])}
              className={categoryLinkClass(isAll)}
            >
              {it ? 'Tutti' : 'All'}
              {formatCount(allCount)}
            </Link>
          </li>
          {ordered.map((cat) => {
            const active = query.category === cat.slug;
            const count = countForSlug(facets.categories, cat.slug);
            return (
              <li key={cat.id}>
                <Link
                  href={href({ category: cat.slug }, ['shelf'])}
                  className={categoryLinkClass(active)}
                >
                  {cat.name}
                  {formatCount(count)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      {facets.brands.length > 0 ? (
        <div>
          <p className="eyebrow text-muted">
            {it ? 'Marchio' : 'Brand'}
          </p>
          <ul className="mt-4 max-h-56 overflow-y-auto [&>li>a]:block [&>li>a]:py-1.5">
            {facets.brands.map((brand) => (
              <li key={brand.slug}>
                <Link
                  href={
                    query.brand === brand.slug
                      ? href({}, ['brand'])
                      : href({ brand: brand.slug })
                  }
                  className={
                    query.brand === brand.slug
                      ? 'text-ink underline'
                      : 'text-muted hover:text-ink'
                  }
                >
                  {brand.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {facets.sizes.length > 0 ? (
        <div>
          <p className="eyebrow text-muted">
            {it ? 'Taglia' : 'Size'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {facets.sizes.map((size) => {
              const active = query.size === size;
              return (
                <Link
                  key={size}
                  href={active ? href({}, ['size']) : href({ size })}
                  className={`inline-flex min-h-11 min-w-11 items-center justify-center border px-2.5 text-xs ${
                    active
                      ? 'border-ink bg-ink text-ivory'
                      : 'border-line text-ink hover:border-ink'
                  }`}
                >
                  {size}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}

      {facets.colors.length > 0 ? (
        <div>
          <p className="eyebrow text-muted">
            {it ? 'Colore' : 'Color'}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {facets.colors.map((color) => {
              const active = query.color === color.name;
              return (
                <Link
                  key={color.name}
                  href={active ? href({}, ['color']) : href({ color: color.name })}
                  title={color.name}
                  className={`flex items-center gap-2 py-1.5 text-xs ${
                    active ? 'text-ink underline' : 'text-muted hover:text-ink'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 rounded-full border ${
                      active ? 'border-ink ring-1 ring-ink' : 'border-line'
                    }`}
                    style={{ backgroundColor: color.hex || '#ccc' }}
                  />
                  {color.name}
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
