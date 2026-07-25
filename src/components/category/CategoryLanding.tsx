import Link from 'next/link';
import { ProductRail } from '@/components/ProductRail';
import { CategoryStrip } from '@/components/shop/CategoryStrip';
import type { EditorialCopy } from '@/lib/editorial';
import type { Audience, CategoryNode, Locale, ProductCard } from '@/lib/types';
import { navCopy } from '@/lib/nav';

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
        <p className="eyebrow text-ivory/55 hero-reveal">
          {copy.eyebrow ?? audienceLabel}
        </p>
        <h1 className="hero-title mt-4 max-w-3xl font-serif hero-reveal hero-reveal-delay-1">
          {copy.headline}
        </h1>
        <p className="eyebrow mt-2 text-ivory/45 hero-reveal hero-reveal-delay-1">
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
  typeCategories,
  categorySlug,
  categoryImage,
}: {
  locale: Locale;
  audience: Audience;
  copy: EditorialCopy;
  shopHref: string;
  featured: ProductCard[];
  /** L3 type children — rendered as Intimissimi-style image strip. */
  typeCategories?: CategoryNode[];
  categorySlug: string;
  categoryImage?: string | null;
}) {
  const it = locale === 'it';
  const copyNav = navCopy(locale);

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
              className="eyebrow inline-flex min-h-11 items-center bg-ink px-7 text-ivory transition hover:opacity-90"
            >
              {it ? 'Vedi la collezione' : 'Shop the collection'}
            </Link>
            <Link
              href={`/${locale}/${audience}`}
              className="eyebrow inline-flex min-h-11 items-center underline underline-offset-4"
            >
              {it ? 'Torna alla home' : 'Back to home'}
            </Link>
          </div>
        </div>

        {typeCategories && typeCategories.length > 0 ? (
          <div className="container-wide mt-14 page-enter page-enter-delay">
            <CategoryStrip
              locale={locale}
              audience={audience}
              categories={typeCategories}
              query={{ category: categorySlug }}
              viewAllSlug={categorySlug}
              viewAllLabel={copyNav.viewAll}
              viewAllImage={categoryImage ?? null}
            />
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
            className="eyebrow mt-8 inline-flex min-h-11 items-center border border-ink px-8 transition hover:bg-ink hover:text-ivory"
          >
            {it ? 'Apri il catalogo' : 'Open the catalogue'}
          </Link>
        </div>
      </section>
    </>
  );
}
