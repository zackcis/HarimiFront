import Link from 'next/link';
import type { Brand, Locale } from '@/lib/types';

/**
 * Consistent logo wall for the homepage.
 * Uses brand.logo_url only (PNG/SVG) — heroes belong on brand detail pages.
 */
export async function BrandStrip({
  locale,
  brands,
}: {
  locale: Locale;
  brands: Brand[];
}) {
  if (!brands.length) return null;
  const it = locale === 'it';
  const shown = brands.slice(0, 8);

  return (
    <section className="border-t border-line py-10 md:py-14">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-muted">{it ? 'Marchi' : 'Brands'}</p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              {it ? 'Selezione multi-brand' : 'Multi-brand selection'}
            </h2>
          </div>
          <Link href={`/${locale}/brands`} className="eyebrow underline">
            {it ? 'Tutti i marchi' : 'All brands'}
          </Link>
        </div>

        <ul className="mt-6 grid grid-cols-2 gap-px bg-line sm:grid-cols-3 md:mt-8 md:grid-cols-4">
          {shown.map((brand) => (
            <li key={brand.id}>
              <Link
                href={`/${locale}/brands/${brand.slug}`}
                className="group flex aspect-4/3 flex-col items-center justify-center gap-2 bg-ivory px-3 py-5 text-center transition duration-(--dur-base) hover:bg-ivory-2 sm:px-5 sm:py-6"
              >
                {brand.logo_url ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="h-[4.5rem] w-auto max-h-[70%] max-w-[90%] object-contain opacity-95 transition duration-(--dur-base) group-hover:opacity-100 sm:h-24 md:h-28 lg:h-32"
                    />
                    <span className="eyebrow max-w-full truncate text-muted opacity-0 transition duration-(--dur-base) group-hover:opacity-100">
                      {brand.name}
                    </span>
                  </>
                ) : (
                  <span className="font-serif text-xl text-ink md:text-2xl">
                    {brand.name}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
