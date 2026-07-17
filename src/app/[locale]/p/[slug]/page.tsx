import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ProductBuyBox } from '@/components/ProductBuyBox';
import { ProductGallery } from '@/components/ProductGallery';
import { ProductRail } from '@/components/ProductRail';
import { fetchProduct } from '@/lib/api';
import { isLocale } from '@/lib/i18n';
import { pageMetadata, productJsonLd } from '@/lib/seo';
import type { Locale } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) {
    return {};
  }
  const locale = rawLocale as Locale;

  try {
    const product = await fetchProduct(locale, slug);
    const image =
      product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url ?? null;
    const desc =
      product.description?.slice(0, 160) ||
      (locale === 'it'
        ? `${product.title} su HARIMI — intimates multi-brand.`
        : `${product.title} at HARIMI — multi-brand intimates.`);

    return pageMetadata({
      locale,
      title: product.title,
      description: desc,
      pathWithoutLocale: `/p/${product.slug}`,
      image,
    });
  } catch {
    return pageMetadata({
      locale,
      title: slug,
      pathWithoutLocale: `/p/${slug}`,
    });
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  if (!isLocale(rawLocale)) {
    notFound();
  }
  const locale = rawLocale as Locale;
  const it = locale === 'it';

  let product;
  try {
    product = await fetchProduct(locale, slug);
  } catch {
    notFound();
  }

  const primary =
    product.images.find((i) => i.is_primary)?.url ??
    product.images[0]?.url ??
    null;

  const firstVariant = product.variants[0];
  const jsonLd = productJsonLd({
    locale,
    name: product.title,
    description: product.description,
    slug: product.slug,
    image: primary,
    brandName: product.brand?.name ?? null,
    price: firstVariant?.price ?? null,
    currency: firstVariant?.currency ?? 'EUR',
    inStock: product.variants.some((v) => v.in_stock),
  });

  const look = product.complete_the_look ?? [];
  const related = product.related ?? [];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <div className="container-wide grid gap-12 py-12 md:grid-cols-2 md:gap-20 md:py-20 lg:gap-24">
          <ProductGallery images={product.images} title={product.title} />

          <div className="md:sticky md:top-[calc(var(--header-h)+2rem)] md:self-start">
            <ProductBuyBox product={product} locale={locale} />

            {product.description ? (
              <p className="mt-12 text-[15px] leading-relaxed text-muted whitespace-pre-line">
                {product.description}
              </p>
            ) : null}

            <div className="mt-10 space-y-5 border-t border-line pt-10 text-sm leading-relaxed">
              {product.fabric ? (
                <p>
                  <span className="text-muted">{it ? 'Tessuto' : 'Fabric'}: </span>
                  {product.fabric}
                </p>
              ) : null}
              {product.fit_notes ? (
                <p className="whitespace-pre-line">
                  <span className="text-muted">{it ? 'Vestibilità' : 'Fit'}: </span>
                  {product.fit_notes}
                </p>
              ) : null}
              {product.care_notes ? (
                <p className="whitespace-pre-line">
                  <span className="text-muted">{it ? 'Cura' : 'Care'}: </span>
                  {product.care_notes}
                </p>
              ) : null}
              {product.category?.path?.length ? (
                <p className="text-muted">
                  {product.category.path.join(' · ')}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {look.length > 0 ? (
          <ProductRail
            title={it ? 'Completa il look' : 'Complete the look'}
            products={look}
            locale={locale}
          />
        ) : null}

        {related.length > 0 ? (
          <ProductRail
            title={it ? 'Potrebbe piacerti' : 'You may also like'}
            products={related}
            locale={locale}
          />
        ) : null}

        <div className="container-wide pb-16 text-sm text-muted">
          <Link href={`/${locale}/shipping-returns`} className="underline hover:text-ink">
            {it ? 'Spedizione in tutta Italia · Resi e cambi' : 'Shipping across Italy · Returns'}
          </Link>
        </div>
      </main>
    </>
  );
}
