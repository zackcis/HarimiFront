import Link from 'next/link';
import type { Audience, CategoryNode, Locale } from '@/lib/types';
import { buildShopHref, type ShopQuery, withShopQuery } from '@/lib/shop';

export function CategoryStrip({
  locale,
  audience,
  categories,
  query,
  viewAllSlug,
  viewAllLabel,
  viewAllImage,
}: {
  locale: Locale;
  audience: Audience;
  categories: CategoryNode[];
  query: ShopQuery;
  /** Category the "View all" tile filters to (audience root or the L2 parent). */
  viewAllSlug: string;
  viewAllLabel: string;
  viewAllImage?: string | null;
}) {
  if (categories.length === 0) return null;
  const it = locale === 'it';
  const isAll = !query.category || query.category === viewAllSlug;

  const tiles: Array<{
    key: string;
    label: string;
    href: string;
    image: string | null;
    active: boolean;
  }> = [
    {
      key: 'all',
      label: viewAllLabel,
      href: buildShopHref(locale, audience, withShopQuery(query, { category: viewAllSlug }, ['shelf'])),
      image: viewAllImage ?? null,
      active: isAll,
    },
    ...categories.map((cat) => ({
      key: cat.slug,
      label: cat.name,
      href: buildShopHref(locale, audience, withShopQuery(query, { category: cat.slug }, ['shelf'])),
      image: cat.image_url,
      active: query.category === cat.slug,
    })),
  ];

  return (
    <nav
      aria-label={it ? 'Categorie' : 'Categories'}
      className="edge-fade scroll-rail -mx-(--gutter) mt-3 overflow-x-auto px-(--gutter) pb-1 md:mx-0 md:mt-4 md:px-0"
    >
      <ul className="mx-auto flex w-max max-w-full snap-x justify-center gap-3 sm:gap-4 md:gap-5">
        {tiles.map((tile) => (
          <li key={tile.key} className="shrink-0 snap-start">
            <Link
              href={tile.href}
              aria-current={tile.active ? 'true' : undefined}
              className="group flex w-[120px] flex-col items-center gap-1.5 sm:w-[136px]"
            >
              <span
                className={`relative block aspect-square w-full overflow-hidden border transition-colors duration-(--dur-base) ${
                  tile.active ? 'border-ink' : 'border-line group-hover:border-ink/40'
                }`}
              >
                {tile.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={tile.image}
                    alt=""
                    aria-hidden
                    className="img-zoom h-full w-full object-cover object-[center_20%]"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-ivory-2">
                    <span className="harimi-mark text-[9px] text-muted">HARIMI</span>
                  </span>
                )}
              </span>
              <span
                className={`text-center text-[11px] leading-tight tracking-wide ${
                  tile.active ? 'text-ink' : 'text-muted group-hover:text-ink'
                }`}
              >
                {tile.label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
