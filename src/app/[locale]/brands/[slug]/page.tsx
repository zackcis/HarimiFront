import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyState } from '@/components/EmptyState';
import { ProductCardView } from '@/components/ProductCard';
import { ProductRail } from '@/components/ProductRail';
import { fetchBrand, fetchProducts } from '@/lib/api';
import { brandEditorial } from '@/lib/editorial';
import { isLocale } from '@/lib/i18n';
import { brandMediaPath, mediaExists } from '@/lib/media';
import { pageMetadata } from '@/lib/seo';
import type { Locale, ProductCard } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;

  try {
    const brand = await fetchBrand(locale, slug);
    const copy = brandEditorial(brand.slug, brand.name, locale);
    return pageMetadata({
      locale,
      title: brand.name,
      description: copy.body.slice(0, 160),
      pathWithoutLocale: `/brands/${slug}`,
      image: brand.logo_url,
    });
  } catch {
    return pageMetadata({
      locale,
      title: slug,
      pathWithoutLocale: `/brands/${slug}`,
    });
  }
}

export default async function BrandLandingPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const it = locale === 'it';

  let brand;
  try {
    brand = await fetchBrand(locale, slug);
  } catch {
    notFound();
  }

  const copy = brandEditorial(brand.slug, brand.name, locale);
  const mediaPath = brandMediaPath(brand.slug);
  const hasMedia = await mediaExists(mediaPath);

  let products: ProductCard[] = [];
  try {
    const result = await fetchProducts(locale, {
      brand: slug,
      in_stock: '1',
      sort: 'newest',
    });
    products = result.data ?? [];
  } catch {
    products = [];
  }

  const featured = products.slice(0, 4);
  const showFeaturedStrip = products.length > 4;
  const gridProducts = showFeaturedStrip ? products.slice(4) : products;

  return (
    <main>
      <section className="relative overflow-hidden bg-ink text-ivory">
        {hasMedia ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={mediaPath}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-40 hero-media"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/70 to-ink/50" />
        <div className="container-wide relative z-10 flex min-h-[52vh] flex-col justify-end pb-14 pt-28 md:min-h-[58vh] md:pb-20">
          <p className="text-[11px] tracking-[0.28em] uppercase text-ivory/55 hero-reveal">
            {it ? 'Marchio' : 'Brand'}
          </p>
          {brand.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={brand.logo_url}
              alt={brand.name}
              className="mt-6 h-10 w-auto max-w-[200px] object-contain brightness-0 invert hero-reveal hero-reveal-delay-1"
            />
          ) : (
            <h1 className="mt-5 font-serif text-5xl md:text-7xl hero-reveal hero-reveal-delay-1">
              {brand.name}
            </h1>
          )}
          {brand.logo_url ? (
            <h1 className="sr-only">{brand.name}</h1>
          ) : null}
          <p className="mt-6 max-w-lg text-sm leading-relaxed text-ivory/70 hero-reveal hero-reveal-delay-2">
            {copy.headline}
          </p>
        </div>
      </section>

      <section className="section-y border-b border-line">
        <div className="container-wide grid gap-10 md:grid-cols-[1fr_auto] md:items-end">
          <div className="page-enter max-w-2xl">
            <p className="text-base leading-relaxed text-muted md:text-lg">{copy.body}</p>
            {brand.products_count > 0 ? (
              <p className="mt-6 text-[11px] tracking-[0.18em] uppercase text-muted">
                {brand.products_count}{' '}
                {it
                  ? brand.products_count === 1
                    ? 'prodotto'
                    : 'prodotti'
                  : brand.products_count === 1
                    ? 'product'
                    : 'products'}
              </p>
            ) : null}
          </div>
          <Link
            href={`/${locale}/brands`}
            className="text-[11px] tracking-[0.18em] uppercase underline underline-offset-4 page-enter"
          >
            {it ? 'Tutti i marchi' : 'All brands'}
          </Link>
        </div>
      </section>

      {products.length === 0 ? (
        <div className="container-wide py-16 md:py-24">
          <EmptyState
            title={it ? 'Collezione in arrivo' : 'Collection coming soon'}
            body={
              it
                ? 'Stiamo curando i pezzi di questo marchio. Esplora gli altri brand HARIMI.'
                : 'We’re curating pieces from this brand. Explore other HARIMI houses.'
            }
            actionHref={`/${locale}/brands`}
            actionLabel={it ? 'Vedi i marchi' : 'Browse brands'}
          />
        </div>
      ) : (
        <>
          {showFeaturedStrip ? (
            <ProductRail
              title={it ? 'Selezione' : 'Featured'}
              products={featured}
              locale={locale}
            />
          ) : null}

          <section className={showFeaturedStrip ? 'pb-[var(--section-y)]' : 'section-y'}>
            <div className="container-wide">
              {showFeaturedStrip ? (
                <h2 className="mb-12 font-serif text-3xl md:text-4xl">
                  {it ? 'La collezione' : 'The collection'}
                </h2>
              ) : (
                <h2 className="mb-12 font-serif text-3xl md:text-4xl">
                  {it ? 'La collezione' : 'The collection'}
                </h2>
              )}
              <div className="product-grid">
                {(showFeaturedStrip ? gridProducts : products).map((product) => (
                  <ProductCardView key={product.id} product={product} locale={locale} />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
