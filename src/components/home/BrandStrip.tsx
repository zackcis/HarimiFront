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
      const path = brandMediaPath(brand.slug);
      return (await mediaExists(path)) ? path : null;
    }),
  );

  return (
    <section className="section-y border-t border-line">
      <div className="container-wide">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] tracking-[0.22em] text-muted uppercase">
              {it ? 'Marchi' : 'Brands'}
            </p>
            <h2 className="mt-3 font-serif text-4xl md:text-5xl">
              {it ? 'Selezione multi-brand' : 'Multi-brand selection'}
            </h2>
          </div>
          <Link
            href={`/${locale}/brands`}
            className="text-[11px] tracking-[0.18em] uppercase underline"
          >
            {it ? 'Tutti i marchi' : 'All brands'}
          </Link>
        </div>
        <div className="mt-14 grid grid-cols-2 gap-px bg-line md:grid-cols-4">
          {shown.map((brand, index) => {
            const mediaSrc = media[index];
            if (mediaSrc) {
              return (
                <Link
                  key={brand.id}
                  href={`/${locale}/brands/${brand.slug}`}
                  className="group relative flex min-h-[200px] items-end overflow-hidden bg-ivory-2"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaSrc}
                    alt={brand.name}
                    className="img-zoom absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
                  <span className="relative z-10 p-5 font-serif text-xl text-ivory">
                    {brand.name}
                  </span>
                </Link>
              );
            }
            return (
              <Link
                key={brand.id}
                href={`/${locale}/brands/${brand.slug}`}
                className="flex min-h-[120px] items-center justify-center bg-ivory px-4 py-10 text-center transition hover:bg-ivory-2"
              >
                {brand.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={brand.logo_url}
                    alt={brand.name}
                    className="max-h-10 max-w-[140px] object-contain opacity-80"
                  />
                ) : (
                  <span className="text-[11px] tracking-[0.22em] uppercase">{brand.name}</span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
