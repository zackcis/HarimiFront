import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BrandStrip } from '@/components/home/BrandStrip';
import { EditorialBreak } from '@/components/home/EditorialBreak';
import { ExploreCategories } from '@/components/home/ExploreCategories';
import { HomeHero } from '@/components/home/HomeHero';
import { OppositeGenderBand } from '@/components/home/OppositeGenderBand';
import { ProductRail } from '@/components/ProductRail';
import { fetchBrands, fetchCategories, fetchMerchandising } from '@/lib/api';
import { audienceLabel, isAudience, isLocale } from '@/lib/i18n';
import { homeHeroMediaPath, mediaExists, welcomeMediaPath } from '@/lib/media';
import { otherAudiences, offersHref, shopHref } from '@/lib/nav';
import { pageMetadata } from '@/lib/seo';
import type { Audience, CategoryNode, Locale } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; audience: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, audience: rawAudience } = await params;
  if (!isLocale(rawLocale) || !isAudience(rawAudience)) {
    return {};
  }
  const locale = rawLocale as Locale;
  const audience = rawAudience as Audience;
  const label = audienceLabel(audience, locale);

  return pageMetadata({
    locale,
    title: label,
    description:
      locale === 'it'
        ? `HARIMI ${label} — eleganza quotidiana, selezione curata di intimates.`
        : `HARIMI ${label} — everyday elegance, curated intimates.`,
    pathWithoutLocale: `/${audience}`,
  });
}

export default async function AudienceHomePage({
  params,
}: {
  params: Promise<{ locale: string; audience: string }>;
}) {
  const { locale: rawLocale, audience: rawAudience } = await params;
  if (!isLocale(rawLocale) || !isAudience(rawAudience)) {
    notFound();
  }
  const locale = rawLocale as Locale;
  const audience = rawAudience as Audience;
  const others = otherAudiences(audience);
  const it = locale === 'it';

  let merch: Record<string, Awaited<ReturnType<typeof fetchMerchandising>>[string]> = {};
  let brands: Awaited<ReturnType<typeof fetchBrands>> = [];
  let categories: CategoryNode[] = [];
  try {
    [merch, brands, categories] = await Promise.all([
      fetchMerchandising(locale),
      fetchBrands(locale),
      fetchCategories(locale),
    ]);
  } catch {
    merch = {};
    brands = [];
    categories = [];
  }

  const audienceRoot = categories.find((c) => c.slug === audience);
  const exploreCats = audienceRoot?.children ?? [];
  const heroFallback =
    merch.featured?.[0]?.primary_image_url ??
    merch.best_sellers?.[0]?.primary_image_url ??
    null;

  const discoverWorlds = await Promise.all(
    others.map(async (other) => {
      const heroJpg = homeHeroMediaPath(other);
      const welcomeJpg = welcomeMediaPath(other);
      const [hasHero, hasWelcome] = await Promise.all([
        mediaExists(heroJpg),
        mediaExists(welcomeJpg),
      ]);
      const categoryImage =
        categories.find((c) => c.slug === other)?.image_url ?? null;
      const image = hasHero
        ? heroJpg
        : hasWelcome
          ? welcomeJpg
          : categoryImage;
      return {
        audience: other,
        label: audienceLabel(other, locale),
        href: `/${locale}/${other}`,
        image,
      };
    }),
  );

  return (
      <main>
        <HomeHero locale={locale} audience={audience} fallbackImage={heroFallback} />

        <ProductRail
          title={it ? 'Best seller' : 'Best sellers'}
          products={merch.best_sellers ?? []}
          locale={locale}
          href={shopHref(locale, audience, { shelf: 'best_sellers' })}
          cta={it ? 'Vedi tutti' : 'View all'}
        />

        <OppositeGenderBand locale={locale} worlds={discoverWorlds} />

        <ExploreCategories
          locale={locale}
          audience={audience}
          categories={exploreCats}
        />

        <EditorialBreak
          locale={locale}
          audience={audience}
          products={merch.featured ?? []}
        />

        <ProductRail
          title={it ? 'Offerte speciali' : 'Special offers'}
          products={merch.special_offers ?? []}
          locale={locale}
          href={offersHref(locale, audience)}
          cta={it ? 'Vedi offerte' : 'View offers'}
        />

        <BrandStrip locale={locale} brands={brands} />
      </main>
  );
}

export function generateStaticParams() {
  return [
    { locale: 'it', audience: 'women' },
    { locale: 'it', audience: 'men' },
    { locale: 'it', audience: 'kids' },
    { locale: 'en', audience: 'women' },
    { locale: 'en', audience: 'men' },
    { locale: 'en', audience: 'kids' },
  ];
}
