import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/EmptyState';
import { ProductCardView } from '@/components/ProductCard';
import { ProductRail } from '@/components/ProductRail';
import { ActiveFilterChips } from '@/components/shop/ActiveFilterChips';
import { CategoryStrip } from '@/components/shop/CategoryStrip';
import { FilterDrawer } from '@/components/shop/FilterDrawer';
import { ShopFilters } from '@/components/shop/ShopFilters';
import { SeoFooter } from '@/components/shop/SeoFooter';
import { ShopPagination } from '@/components/shop/ShopPagination';
import { ShopToolbar } from '@/components/shop/ShopToolbar';
import { categoryEditorial, categoryFaq } from '@/lib/editorial';
import { fetchBrands, fetchCategories, fetchMerchandisingShelf, fetchProducts } from '@/lib/api';
import { audienceLabel, isAudience, isLocale } from '@/lib/i18n';
import { audienceCategorySlug } from '@/lib/nav';
import { pageMetadata } from '@/lib/seo';
import {
  buildShopHref,
  findCategoryInTree,
  type CategoryLookup,
  type ShopFacets,
  type ShopQuery,
} from '@/lib/shop';
import type { Audience, Brand, CategoryNode, Locale, ProductCard } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; audience: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, audience: rawAudience } = await params;
  if (!isLocale(rawLocale) || !isAudience(rawAudience)) {
    return {};
  }
  const locale = rawLocale as Locale;
  const audience = rawAudience as Audience;
  const label = audienceLabel(audience, locale);

  return pageMetadata({
    locale,
    title: locale === 'it' ? `Shop ${label}` : `${label} shop`,
    description:
      locale === 'it'
        ? `Catalogo ${label} HARIMI — intimates multi-brand.`
        : `HARIMI ${label} catalog — multi-brand intimates.`,
    pathWithoutLocale: `/${audience}/shop`,
  });
}

const SHELF_TITLES: Record<string, { it: string; en: string }> = {
  best_sellers: { it: 'Best seller', en: 'Best sellers' },
  new_arrivals: { it: 'Novità', en: 'New arrivals' },
  featured: { it: 'In evidenza', en: 'Featured' },
  special_offers: { it: 'Offerte speciali', en: 'Special offers' },
};

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; audience: string }>;
  searchParams: Promise<ShopQuery>;
}) {
  const { locale: rawLocale, audience: rawAudience } = await params;
  const rawQuery = await searchParams;
  if (!isLocale(rawLocale) || !isAudience(rawAudience)) {
    notFound();
  }
  const locale = rawLocale as Locale;
  const audience = rawAudience as Audience;
  const it = locale === 'it';
  const rootSlug = audienceCategorySlug(audience);

  const isShelf = Boolean(rawQuery.shelf);
  const query: ShopQuery = {
    ...rawQuery,
    category: isShelf ? rawQuery.category : rawQuery.category || rootSlug,
    sort: rawQuery.sort || 'newest',
  };

  let products: ProductCard[] = [];
  let facets: ShopFacets = { sizes: [], colors: [], brands: [], categories: [] };
  let categories: CategoryNode[] = [];
  let brands: Brand[] = [];
  let currentPage = 1;
  let lastPage = 1;
  let audienceRoot: CategoryNode | undefined;
  let lookup: CategoryLookup | null = null;

  try {
    const cats = await fetchCategories(locale);
    audienceRoot = cats.find((c) => c.slug === rootSlug);
    categories = audienceRoot?.children ?? [];
    lookup =
      audienceRoot && query.category
        ? findCategoryInTree(audienceRoot, query.category)
        : null;

    if (isShelf && rawQuery.shelf) {
      products = await fetchMerchandisingShelf(locale, rawQuery.shelf);
    } else {
      const result = await fetchProducts(locale, {
        q: query.q,
        brand: query.brand,
        category: query.category,
        size: query.size,
        color: query.color,
        sort: query.sort,
        page: query.page,
        in_stock: '1',
      });
      products = result.data ?? [];
      facets = {
        sizes: result.meta?.facets?.sizes ?? [],
        colors: result.meta?.facets?.colors ?? [],
        brands: result.meta?.facets?.brands ?? [],
        categories: result.meta?.facets?.categories ?? [],
      };
      currentPage = result.meta?.current_page ?? 1;
      lastPage = result.meta?.last_page ?? 1;
    }
    brands = await fetchBrands(locale);
  } catch {
    products = [];
  }

  let recommendations: ProductCard[] = [];
  if (!isShelf && products.length > 0) {
    try {
      recommendations = (await fetchMerchandisingShelf(locale, 'best_sellers')).slice(0, 4);
    } catch {
      recommendations = [];
    }
  }

  const isSoftEmpty = products.length === 0 && Boolean(query.q?.trim());
  const isFilterEmpty = products.length === 0 && !isSoftEmpty && !isShelf;

  let bestsellers: ProductCard[] = [];
  if (isSoftEmpty) {
    try {
      bestsellers = (await fetchMerchandisingShelf(locale, 'best_sellers')).slice(0, 8);
    } catch {
      bestsellers = [];
    }
  }

  const currentNode = lookup?.node;
  const parentNode =
    lookup && lookup.ancestors.length > 0
      ? lookup.ancestors[lookup.ancestors.length - 1]
      : undefined;

  // Strip context: audience root shows L2 categories; an L2 with children (or
  // an L3 within one) shows that family's types with a "View all" tile.
  let stripCategories: CategoryNode[] = categories;
  let stripViewAllSlug = rootSlug;
  let stripViewAllLabel = it ? 'Tutti' : 'All';
  let stripViewAllImage: string | null = null;
  if (currentNode && currentNode.slug !== rootSlug) {
    if (currentNode.children.length > 0) {
      stripCategories = currentNode.children;
      stripViewAllSlug = currentNode.slug;
      stripViewAllLabel = it ? 'Vedi tutti' : 'View all';
      stripViewAllImage = currentNode.image_url;
    } else if (parentNode && parentNode.slug !== rootSlug) {
      stripCategories = parentNode.children;
      stripViewAllSlug = parentNode.slug;
      stripViewAllLabel = it ? 'Vedi tutti' : 'View all';
      stripViewAllImage = parentNode.image_url;
    }
  }

  const categoryLabel =
    currentNode?.name ??
    categories.find((c) => c.slug === query.category)?.name ??
    (query.category === rootSlug ? audienceLabel(audience, locale) : query.category);
  const brandLabel =
    facets.brands.find((b) => b.slug === query.brand)?.name ??
    brands.find((b) => b.slug === query.brand)?.name;

  const shelfTitle = query.shelf
    ? SHELF_TITLES[query.shelf]?.[it ? 'it' : 'en'] ?? query.shelf
    : null;

  return (
    <main className="container-wide py-10 md:py-14">
      <nav className="text-[11px] tracking-[0.14em] uppercase text-muted">
        <Link href={`/${locale}/${audience}`} className="hover:text-ink">
          {audienceLabel(audience, locale)}
        </Link>
        {!shelfTitle && parentNode && parentNode.slug !== rootSlug ? (
          <>
            <span className="mx-2">/</span>
            <Link
              href={buildShopHref(locale, audience, { category: parentNode.slug })}
              className="hover:text-ink"
            >
              {parentNode.name}
            </Link>
          </>
        ) : null}
        <span className="mx-2">/</span>
        <span className="text-ink">
          {shelfTitle ?? categoryLabel ?? (it ? 'Shop' : 'Shop')}
        </span>
      </nav>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-muted">
            {it ? 'Catalogo' : 'Shop'}
          </p>
          <h1 className="mt-2 font-serif text-4xl md:text-5xl">
            {shelfTitle ?? categoryLabel ?? (it ? 'Tutti i prodotti' : 'All products')}
          </h1>
        </div>
        {!isShelf ? (
          <FilterDrawer
            locale={locale}
            audience={audience}
            query={query}
            facets={facets}
            categories={categories}
            audienceRootSlug={rootSlug}
          />
        ) : null}
      </div>

      {!isShelf ? (
        <CategoryStrip
          locale={locale}
          audience={audience}
          categories={stripCategories}
          query={query}
          viewAllSlug={stripViewAllSlug}
          viewAllLabel={stripViewAllLabel}
          viewAllImage={stripViewAllImage}
        />
      ) : null}

      {!isShelf ? (
        <ActiveFilterChips
          locale={locale}
          audience={audience}
          query={query}
          categoryLabel={categoryLabel}
          brandLabel={brandLabel}
        />
      ) : null}

      <div className={`mt-4 grid gap-10 md:mt-5 ${isShelf ? '' : 'lg:grid-cols-[220px_1fr]'}`}>
        {!isShelf ? (
          <div className="hidden lg:block">
            <ShopFilters
              locale={locale}
              audience={audience}
              query={query}
              facets={facets}
              categories={categories}
              audienceRootSlug={rootSlug}
            />
          </div>
        ) : null}

        <div>
          {!isShelf ? (
            <ShopToolbar
              locale={locale}
              audience={audience}
              query={query}
              count={products.length}
            />
          ) : null}

          {products.length === 0 ? (
            <div className="mt-10 space-y-12">
              <EmptyState
                title={it ? 'Nessun risultato' : 'No results'}
                body={
                  isSoftEmpty
                    ? it
                      ? `Nessun prodotto per “${query.q}”. Ecco alcune idee.`
                      : `No products for “${query.q}”. Here are some ideas.`
                    : it
                      ? 'Prova ad allentare i filtri o esplora un’altra categoria.'
                      : 'Try clearing filters or explore another category.'
                }
                actionHref={
                  isFilterEmpty || isSoftEmpty
                    ? buildShopHref(locale, audience, { category: rootSlug })
                    : undefined
                }
                actionLabel={
                  isFilterEmpty || isSoftEmpty
                    ? it
                      ? 'Azzera filtri'
                      : 'Clear filters'
                    : undefined
                }
              />
              {isSoftEmpty && bestsellers.length > 0 ? (
                <ProductRail
                  title={it ? 'I nostri best seller' : 'Our bestsellers'}
                  products={bestsellers}
                  locale={locale}
                />
              ) : null}
            </div>
          ) : (
            <>
              <div className="mt-8 product-grid">
                {products.map((product) => (
                  <ProductCardView key={product.id} product={product} locale={locale} />
                ))}
              </div>
              {!isShelf ? (
                <ShopPagination
                  locale={locale}
                  audience={audience}
                  query={query}
                  currentPage={currentPage}
                  lastPage={lastPage}
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      {recommendations.length > 0 ? (
        <div className="mt-12 border-t border-line pt-10 md:mt-16 md:pt-12">
          <ProductRail
            title={it ? 'Ti potrebbe piacere' : 'You may also like'}
            products={recommendations}
            locale={locale}
            inset
          />
        </div>
      ) : null}

      {!isShelf && currentNode && currentNode.slug !== rootSlug && products.length > 0 ? (
        <SeoFooter
          locale={locale}
          name={currentNode.name}
          copy={categoryEditorial(currentNode.slug, currentNode.name, locale)}
          faqs={categoryFaq(currentNode.slug, currentNode.name, locale)}
        />
      ) : null}
    </main>
  );
}
