import Link from 'next/link';
import { fetchBrands } from '@/lib/api';
import { isLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import type { Brand, Locale } from '@/lib/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EmptyState } from '@/components/EmptyState';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) return {};
  const locale = rawLocale as Locale;

  return pageMetadata({
    locale,
    title: locale === 'it' ? 'Marchi' : 'Brands',
    description:
      locale === 'it'
        ? 'I marchi di intimates selezionati da HARIMI.'
        : 'Intimates brands curated by HARIMI.',
    pathWithoutLocale: '/brands',
  });
}

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  if (!isLocale(rawLocale)) notFound();
  const locale = rawLocale as Locale;
  const it = locale === 'it';

  let brands: Brand[] = [];
  try {
    brands = await fetchBrands(locale);
  } catch {
    brands = [];
  }

  return (
    <main>
      <section className="border-b border-line section-y">
        <div className="container-wide page-enter">
          <p className="eyebrow text-muted">HARIMI</p>
          <h1 className="mt-4 font-serif text-5xl md:text-6xl">
            {it ? 'Marchi' : 'Brands'}
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted md:text-base">
            {it
              ? 'Case selezionate per qualità, vestibilità e carattere. Ogni marchio è presentato come in boutique.'
              : 'Houses chosen for quality, fit and character. Each brand is presented as in boutique.'}
          </p>
        </div>
      </section>

      <section className="container-wide py-14 md:py-20">
        {brands.length === 0 ? (
          <EmptyState
            title={it ? 'Nessun marchio' : 'No brands yet'}
            body={
              it
                ? 'Torna presto: stiamo aggiornando la selezione.'
                : 'Check back soon—we’re updating the selection.'
            }
            actionHref={`/${locale}/women`}
            actionLabel={it ? 'Vai allo shop' : 'Go to shop'}
          />
        ) : (
          <div className="grid grid-cols-1 gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/${locale}/brands/${brand.slug}`}
                className="group flex min-h-[160px] flex-col items-center justify-center bg-ivory px-6 py-12 text-center transition hover:bg-ivory-2"
              >
                {brand.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo_url}
                    alt=""
                    className="mb-4 h-8 w-auto max-w-[140px] object-contain opacity-80 transition group-hover:opacity-100"
                  />
                ) : null}
                <span className="font-serif text-2xl">{brand.name}</span>
                <span className="eyebrow mt-3 text-muted">
                  {brand.products_count}{' '}
                  {it
                    ? brand.products_count === 1
                      ? 'prodotto'
                      : 'prodotti'
                    : brand.products_count === 1
                      ? 'product'
                      : 'products'}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
