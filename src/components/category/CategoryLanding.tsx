import Link from 'next/link';
import { ProductRail } from '@/components/ProductRail';
import type { EditorialCopy } from '@/lib/editorial';
import type { Audience, Locale, ProductCard } from '@/lib/types';

export function CategoryLandingHero({
  name,
  copy,
  image,
  audienceLabel,
}: {
  name: string;
  copy: EditorialCopy;
  image: string | null;
  audienceLabel: string;
}) {
  return (
    <section className="relative min-h-[70vh] overflow-hidden bg-ink text-ivory md:min-h-[78vh]">
      {image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-65 hero-media"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_65%_25%,rgba(247,243,236,0.14),transparent_48%),linear-gradient(145deg,#1a1a1a,#0a0a0a)]"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-ink/15" />
      <div className="container-wide relative z-10 flex min-h-[70vh] flex-col justify-end pb-14 pt-28 md:min-h-[78vh] md:pb-20">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ivory/55 hero-reveal">
          {copy.eyebrow ?? audienceLabel}
        </p>
        <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] md:text-7xl hero-reveal hero-reveal-delay-1">
          {copy.headline}
        </h1>
        <p className="mt-2 text-[11px] tracking-[0.2em] uppercase text-ivory/45 hero-reveal hero-reveal-delay-1">
          {name}
        </p>
      </div>
    </section>
  );
}

export function CategoryLandingBody({
  locale,
  audience,
  copy,
  shopHref,
  featured,
  childLinks,
}: {
  locale: Locale;
  audience: Audience;
  copy: EditorialCopy;
  shopHref: string;
  featured: ProductCard[];
  childLinks?: Array<{ href: string; name: string }>;
}) {
  const it = locale === 'it';

  return (
    <>
      <section className="section-y border-b border-line">
        <div className="container-wide grid gap-10 md:grid-cols-[1fr_0.85fr] md:items-end">
          <div className="page-enter">
            <p className="max-w-xl text-base leading-relaxed text-muted md:text-lg">
              {copy.body}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 md:justify-end page-enter page-enter-delay">
            <Link
              href={shopHref}
              className="bg-ink px-7 py-3.5 text-[11px] tracking-[0.2em] text-ivory uppercase transition hover:opacity-90"
            >
              {it ? 'Vedi la collezione' : 'Shop the collection'}
            </Link>
            <Link
              href={`/${locale}/${audience}`}
              className="text-[11px] tracking-[0.18em] uppercase underline underline-offset-4"
            >
              {it ? 'Torna alla home' : 'Back to home'}
            </Link>
          </div>
        </div>

        {childLinks && childLinks.length > 0 ? (
          <div className="container-wide mt-14 flex flex-wrap gap-x-8 gap-y-3">
            {childLinks.map((child) => (
              <Link
                key={child.href}
                href={child.href}
                className="font-serif text-xl text-ink/80 transition hover:text-ink md:text-2xl"
              >
                {child.name}
              </Link>
            ))}
          </div>
        ) : null}
      </section>

      {featured.length > 0 ? (
        <ProductRail
          title={it ? 'In evidenza' : 'Featured'}
          products={featured}
          locale={locale}
          href={shopHref}
          cta={it ? 'Vedi tutto' : 'View all'}
        />
      ) : null}

      <section className="pb-[var(--section-y)]">
        <div className="container-wide border-t border-line pt-14 text-center">
          <p className="font-serif text-2xl md:text-3xl">
            {it ? 'Continua nello shop' : 'Continue to the shop'}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted">
            {it
              ? 'Filtra per taglia, colore e brand nella collezione completa.'
              : 'Filter by size, colour and brand in the full collection.'}
          </p>
          <Link
            href={shopHref}
            className="mt-8 inline-block border border-ink px-8 py-3.5 text-[11px] tracking-[0.2em] uppercase transition hover:bg-ink hover:text-ivory"
          >
            {it ? 'Apri il catalogo' : 'Open the catalogue'}
          </Link>
        </div>
      </section>
    </>
  );
}
