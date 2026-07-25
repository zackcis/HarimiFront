import Link from 'next/link';
import { brandMediaPath, mediaExists } from '@/lib/media';
import type { Brand, Locale } from '@/lib/types';

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
  const media = await Promise.all(
    shown.map(async (brand) => {
      if (brand.hero_url) {
        return brand.hero_url;
      }
      const path = brandMediaPath(brand.slug);
      return (await mediaExists(path)) ? path : null;
    }),
  );

  const hasAnyPhoto = media.some(Boolean);

  return (
    <section className="border-t border-line py-10 md:py-14">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-muted">
              {it ? 'Marchi' : 'Brands'}
            </p>
            <h2 className="mt-2 font-serif text-3xl md:text-4xl">
              {it ? 'Selezione multi-brand' : 'Multi-brand selection'}
            </h2>
          </div>
          <Link
            href={`/${locale}/brands`}
            className="eyebrow underline"
          >
            {it ? 'Tutti i marchi' : 'All brands'}
          </Link>
        </div>

        {hasAnyPhoto ? (
          <div className="edge-fade scroll-rail -mx-(--gutter) mt-6 flex snap-x gap-3 overflow-x-auto px-(--gutter) pb-2 md:mt-8 md:gap-4">
            {shown.map((brand, index) => {
              const mediaSrc = media[index];
              if (mediaSrc) {
                return (
                  <Link
                    key={brand.id}
                    href={`/${locale}/brands/${brand.slug}`}
                    className="group relative flex aspect-4/5 w-40 shrink-0 snap-start items-end overflow-hidden bg-ivory-2 sm:w-48"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaSrc}
                      alt={brand.name}
                      className="img-zoom absolute inset-0 h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent transition duration-(--dur-base) group-hover:from-ink/55" />
                    <span className="relative z-10 p-4 font-serif text-lg text-ivory sm:text-xl">
                      {brand.name}
                    </span>
                  </Link>
                );
              }
              return (
                <Link
                  key={brand.id}
                  href={`/${locale}/brands/${brand.slug}`}
                  className="group flex aspect-5/4 w-36 shrink-0 snap-start flex-col items-center justify-center gap-2 border border-line bg-ivory px-3 text-center transition duration-(--dur-base) hover:border-ink/30 hover:bg-ivory-2 sm:w-40"
                >
                  {brand.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="max-h-12 max-w-36 object-contain opacity-90 transition duration-(--dur-base) group-hover:opacity-100"
                    />
                  ) : (
                    <span className="font-serif text-lg text-ink">{brand.name}</span>
                  )}
                </Link>
              );
            })}
          </div>
        ) : (
          <ul className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:mt-8 md:grid-cols-4 md:gap-3">
            {shown.map((brand) => (
              <li key={brand.id}>
                <Link
                  href={`/${locale}/brands/${brand.slug}`}
                  className="group flex min-h-[5.5rem] items-center justify-center border border-line bg-ivory px-4 py-5 text-center transition duration-(--dur-base) hover:border-ink/30 hover:bg-ivory-2 md:min-h-[6.5rem]"
                >
                  {brand.logo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={brand.logo_url}
                      alt={brand.name}
                      className="max-h-10 max-w-full object-contain opacity-90 transition duration-(--dur-base) group-hover:opacity-100 md:max-h-12"
                    />
                  ) : (
                    <span className="font-serif text-lg text-ink md:text-xl">
                      {brand.name}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
