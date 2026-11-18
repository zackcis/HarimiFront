import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PdpPurchase } from '@/components/PdpPurchase';
import { ProductDescription } from '@/components/ProductDescription';
import { ProductRail } from '@/components/ProductRail';
import { fetchProduct } from '@/lib/api';
import { isAudience, isLocale } from '@/lib/i18n';
import { categoryShopHref } from '@/lib/nav';
import { pageMetadata, productJsonLd } from '@/lib/seo';
import type { Audience, Locale, ProductCard } from '@/lib/types';

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
    const plainDesc = product.description
      ? product.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
      : '';
    const desc =
      plainDesc.slice(0, 160) ||
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

function PdpAccordion({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  return (
    <details className="accordion border-b border-line" open={defaultOpen}>
      <summary className="tap flex items-center justify-between py-5">
        <span className="eyebrow">{title}</span>
        <span
          aria-hidden
          className="accordion-marker relative ml-4 inline-flex h-3 w-3 items-center justify-center text-muted"
        >
          <span className="absolute h-px w-3 bg-current" />
          <span className="absolute h-3 w-px bg-current" />
        </span>
      </summary>
      <div className="accordion-panel pb-6 text-sm leading-7 text-muted">{children}</div>
    </details>
  );
}

function CompleteTheLook({
  items,
  locale,
}: {
  items: ProductCard[];
  locale: Locale;
}) {
  const it = locale === 'it';
  const list = items.slice(0, 4);
  if (!list.length) return null;

  return (
    <div className="mt-10 border-t border-line pt-8">
      <p className="eyebrow text-muted">
        {it ? 'Completa il look' : 'Complete the look'}
      </p>
      <ul className="mt-4 flex gap-3 overflow-x-auto pb-1 sm:gap-4">
        {list.map((item) => (
          <li key={item.id} className="w-30 shrink-0 sm:w-32">
            <Link href={`/${locale}/p/${item.slug}`} className="group block">
              <span className="relative block aspect-3/4 overflow-hidden bg-ivory-2">
                {item.primary_image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.primary_image_url}
                    alt=""
                    className="h-full w-full object-cover object-[center_18%] transition-opacity duration-(--dur-fast) group-hover:opacity-90"
                  />
                ) : null}
              </span>
              <span className="mt-2 block truncate text-sm leading-snug text-ink">
                {item.title}
              </span>
              <span className="mt-0.5 block text-sm text-muted">
                {item.price_from
                  ? new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-IE', {
                      style: 'currency',
                      currency: item.currency || 'EUR',
                    }).format(Number(item.price_from))
                  : '—'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function audienceFromPath(path: string[] | undefined): Audience {
  const root = path?.[0]?.toLowerCase() ?? '';
  if (root.includes('uomo') || root.includes('men')) return 'men';
  if (root.includes('bambin') || root.includes('kids')) return 'kids';
  if (isAudience(root)) return root;
  return 'women';
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
  const crumbs = product.category?.path ?? [];
  const audience = audienceFromPath(crumbs);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main>
        <nav
          aria-label="Breadcrumb"
          className="container-wide pt-4 text-[11px] tracking-[0.14em] uppercase text-muted md:pt-6"
        >
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <li>
              <Link href={`/${locale}/${audience}`} className="hover:text-ink">
                {crumbs[0] ?? (it ? 'Home' : 'Home')}
              </Link>
            </li>
            {crumbs.slice(1).map((label, i) => {
              const isLast = i === crumbs.slice(1).length - 1;
              return (
                <li key={`${label}-${i}`} className="flex items-center gap-2">
                  <span aria-hidden>/</span>
                  {isLast && product.category?.slug ? (
                    <Link
                      href={categoryShopHref(locale, audience, product.category.slug)}
                      className="hover:text-ink"
                    >
                      {label}
                    </Link>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              );
            })}
            <li className="flex items-center gap-2">
              <span aria-hidden>/</span>
              <span className="text-ink">{product.title}</span>
            </li>
          </ol>
        </nav>

        <PdpPurchase
          product={product}
          locale={locale}
          afterBuyBox={
            <>
              <CompleteTheLook items={look} locale={locale} />

              <div className="mt-10 border-t border-line">
                {product.description ? (
                  <PdpAccordion title={it ? 'Descrizione' : 'Description'} defaultOpen>
                    <ProductDescription value={product.description} />
                  </PdpAccordion>
                ) : null}
                {(() => {
                  const details: Array<{ label: string; value: string }> = [];
                  if (product.fabric?.trim()) {
                    details.push({
                      label: it ? 'Materiale' : 'Material',
                      value: product.fabric.trim(),
                    });
                  }
                  if (product.fit_notes?.trim()) {
                    details.push({
                      label: it ? 'Vestibilità' : 'Fit',
                      value: product.fit_notes.trim(),
                    });
                  }
                  if (product.season?.trim()) {
                    details.push({
                      label: it ? 'Stagione' : 'Season',
                      value: product.season.trim(),
                    });
                  }
                  if (product.care_notes?.trim()) {
                    details.push({
                      label: it ? 'Lavaggio' : 'Washing',
                      value: product.care_notes.trim(),
                    });
                  }
                  if (product.warranty?.trim()) {
                    details.push({
                      label: it ? 'Garanzia' : 'Warranty',
                      value: product.warranty.trim(),
                    });
                  }
                  if (details.length === 0) return null;
                  return (
                    <PdpAccordion title={it ? 'Dettagli' : 'Details'} defaultOpen>
                      <ul className="list-disc space-y-2 pl-5 text-ink">
                        {details.map((row) => (
                          <li key={row.label}>
                            <strong>{row.label}:</strong> {row.value}
                          </li>
                        ))}
                      </ul>
                    </PdpAccordion>
                  );
                })()}
                <PdpAccordion title={it ? 'Spedizioni e resi' : 'Shipping & returns'}>
                  <Link
                    href={`/${locale}/shipping-returns`}
                    className="underline hover:text-ink"
                  >
                    {it
                      ? 'Spedizione in tutta Italia · Resi e cambi'
                      : 'Shipping across Italy · Returns'}
                  </Link>
                </PdpAccordion>
              </div>
            </>
          }
        />

        {related.length > 0 ? (
          <div className="container-wide mt-12 border-t border-line pt-10 md:mt-16 md:pt-12">
            <ProductRail
              title={it ? 'Potrebbe piacerti' : 'You may also like'}
              products={related}
              locale={locale}
              inset
            />
          </div>
        ) : null}

        <div className="h-10 md:h-14" />
      </main>
    </>
  );
}
