import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { EmptyState } from '@/components/EmptyState';
import { ProductCardView } from '@/components/ProductCard';
import { fetchSearch } from '@/lib/api';
import { audienceLabel, isAudience, isLocale } from '@/lib/i18n';
import { categoryShopHref, shopHref } from '@/lib/nav';
import { pageMetadata } from '@/lib/seo';
import type { Audience, Locale } from '@/lib/types';

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const { q } = await searchParams;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const it = locale === 'it';
  const query = q?.trim() ?? '';

  return pageMetadata({
    locale,
    title: query
      ? it
        ? `Cerca “${query}”`
        : `Search “${query}”`
      : it
        ? 'Cerca'
        : 'Search',
    description: it
      ? 'Cerca prodotti, brand e categorie su HARIMI.'
      : 'Search products, brands and categories on HARIMI.',
    pathWithoutLocale: '/search',
  });
}

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { q: rawQ } = await searchParams;
  if (!isLocale(rawLocale)) notFound();

  const locale = rawLocale as Locale;
  const it = locale === 'it';
  const q = (rawQ ?? '').trim();

  let categories: Awaited<ReturnType<typeof fetchSearch>>['categories'] = [];
  let brands: Awaited<ReturnType<typeof fetchSearch>>['brands'] = [];
  let products: Awaited<ReturnType<typeof fetchSearch>>['products'] = [];

  if (q) {
    try {
      const result = await fetchSearch(locale, q);
      categories = result.categories;
      brands = result.brands;
      products = result.products;
    } catch {
      categories = [];
      brands = [];
      products = [];
    }
  }

  const total = categories.length + brands.length + products.length;
  const empty = Boolean(q) && total === 0;

  return (
    <main>
      <section className="container-wide py-8 md:py-12">
        <p className="eyebrow text-muted">{it ? 'Cerca' : 'Search'}</p>
        <h1 className="mt-2 font-serif text-3xl md:text-5xl">
          {q
            ? it
              ? `Risultati per “${q}”`
              : `Results for “${q}”`
            : it
              ? 'Cosa stai cercando?'
              : 'What are you looking for?'}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted md:text-base">
          {it
            ? 'Prodotti, brand e categorie in tutto il catalogo Donna, Uomo e Bambini.'
            : 'Products, brands and categories across Women, Men and Kids.'}
        </p>

        <form action={`/${locale}/search`} method="get" className="mt-8 flex gap-3 border-b border-ink pb-3">
          <input
            name="q"
            defaultValue={q}
            placeholder={
              it ? 'Cerca prodotti, brand, categorie…' : 'Search products, brands, categories…'
            }
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
            autoFocus={!q}
          />
          <button type="submit" className="eyebrow">
            {it ? 'Cerca' : 'Search'}
          </button>
        </form>
      </section>

      {!q ? (
        <div className="container-wide pb-16">
          <EmptyState
            title={it ? 'Inizia a cercare' : 'Start searching'}
            body={
              it
                ? 'Prova un brand, una categoria o un prodotto — i risultati aprono il mondo giusto (Donna, Uomo o Bambini).'
                : 'Try a brand, category or product — results open the right world (Women, Men or Kids).'
            }
          />
        </div>
      ) : empty ? (
        <div className="container-wide pb-16">
          <EmptyState
            title={it ? 'Nessun risultato' : 'No results'}
            body={
              it
                ? `Non abbiamo trovato nulla per “${q}”. Prova un altro termine.`
                : `Nothing matched “${q}”. Try another term.`
            }
            actionHref={`/${locale}/women/shop`}
            actionLabel={it ? 'Vai allo shop' : 'Go to shop'}
          />
        </div>
      ) : (
        <div className="container-wide space-y-14 pb-20">
          {categories.length > 0 ? (
            <section>
              <h2 className="font-serif text-2xl md:text-3xl">
                {it ? 'Categorie' : 'Categories'}
              </h2>
              <ul className="mt-5 divide-y divide-line border-y border-line">
                {categories.map((cat) => {
                  const audience = (
                    isAudience(cat.audience) ? cat.audience : 'women'
                  ) as Audience;
                  return (
                    <li key={`cat-${cat.id}`}>
                      <Link
                        href={categoryShopHref(locale, audience, cat.slug)}
                        className="group flex items-center justify-between gap-4 py-4 transition hover:bg-ivory-2"
                      >
                        <div className="min-w-0">
                          <p className="font-serif text-xl md:text-2xl">{cat.name}</p>
                          <p className="eyebrow mt-1 text-muted">
                            {audienceLabel(audience, locale)}
                          </p>
                        </div>
                        <span aria-hidden className="text-muted transition group-hover:text-ink">
                          →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {brands.length > 0 ? (
            <section>
              <h2 className="font-serif text-2xl md:text-3xl">
                {it ? 'Brand' : 'Brands'}
              </h2>
              <ul className="mt-5 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 md:grid-cols-4">
                {brands.map((brand) => (
                  <li key={`brand-${brand.id}`}>
                    <Link
                      href={`/${locale}/brands/${brand.slug}`}
                      className="flex aspect-5/3 flex-col items-center justify-center gap-2 bg-ivory px-4 py-6 text-center transition hover:bg-ivory-2"
                    >
                      {brand.logo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={brand.logo_url}
                          alt=""
                          className="h-8 w-auto max-w-[70%] object-contain opacity-90"
                        />
                      ) : null}
                      <span className="font-serif text-lg">{brand.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {products.length > 0 ? (
            <section>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <h2 className="font-serif text-2xl md:text-3xl">
                  {it ? 'Prodotti' : 'Products'}
                </h2>
                <p className="text-sm text-muted">
                  {products.length}{' '}
                  {it
                    ? products.length === 1
                      ? 'risultato'
                      : 'risultati'
                    : products.length === 1
                      ? 'result'
                      : 'results'}
                </p>
              </div>
              <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 md:grid-cols-3 md:gap-x-4 lg:grid-cols-4">
                {products.map((product) => {
                  const audience =
                    product.audience && isAudience(product.audience)
                      ? product.audience
                      : 'women';
                  return (
                    <li key={`product-${product.id}`} className="min-w-0">
                      <ProductCardView product={product} locale={locale} />
                      {product.category ? (
                        <Link
                          href={
                            product.category.slug
                              ? categoryShopHref(locale, audience, product.category.slug)
                              : shopHref(locale, audience)
                          }
                          className="mt-2 block text-[11px] tracking-[0.14em] uppercase text-muted hover:text-ink"
                        >
                          {audienceLabel(audience, locale)}
                          {product.category.name ? ` · ${product.category.name}` : ''}
                        </Link>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}
        </div>
      )}
    </main>
  );
}
