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

  return (
    <aside className="space-y-10 text-sm">
      <div>
        <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
          {it ? 'Categoria' : 'Category'}
        </p>
        <ul className="mt-4 space-y-2">
          <li>
            <Link
              href={href({ category: audienceRootSlug }, ['shelf'])}
              className={isAll ? 'text-ink underline' : 'text-muted hover:text-ink'}
            >
              {it ? 'Tutti' : 'All'}
            </Link>
          </li>
          {ordered.map((cat) => (
            <li key={cat.id}>
              <Link
                href={href({ category: cat.slug }, ['shelf'])}
                className={
                  query.category === cat.slug
                    ? 'text-ink underline'
                    : 'text-muted hover:text-ink'
                }
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {facets.brands.length > 0 ? (
        <div>
          <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
            {it ? 'Marchio' : 'Brand'}
          </p>
          <ul className="mt-4 max-h-48 space-y-2 overflow-y-auto">
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
          <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
            {it ? 'Taglia' : 'Size'}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {facets.sizes.map((size) => {
              const active = query.size === size;
              return (
                <Link
                  key={size}
                  href={active ? href({}, ['size']) : href({ size })}
                  className={`min-w-10 border px-2 py-1.5 text-center text-xs ${
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
          <p className="text-[11px] tracking-[0.2em] text-muted uppercase">
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
                  className={`flex items-center gap-2 text-xs ${
                    active ? 'text-ink underline' : 'text-muted hover:text-ink'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 rounded-full border ${
                      active ? 'border-ink' : 'border-line'
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
