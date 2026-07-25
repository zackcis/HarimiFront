import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { BrandStrip } from '@/components/home/BrandStrip';
import { EditorialBreak } from '@/components/home/EditorialBreak';
import { ExploreCategories } from '@/components/home/ExploreCategories';
import { HomeHero } from '@/components/home/HomeHero';
import { InstagramBand } from '@/components/home/InstagramBand';
import { NewArrivalsBand } from '@/components/home/NewArrivalsBand';
import { OppositeGenderBand } from '@/components/home/OppositeGenderBand';
import { SpecialOffersBand } from '@/components/home/SpecialOffersBand';
import { ProductRail } from '@/components/ProductRail';
import { fetchBrands, fetchCategories, fetchMerchandising, fetchSiteMedia, EMPTY_SITE_MEDIA_SLOT, instagramCollageFromSlot } from '@/lib/api';
import { audienceLabel, isAudience, isLocale } from '@/lib/i18n';
import { homeHeroMediaPath, preferMedia, welcomeMediaPath } from '@/lib/media';
import { otherAudiences, shopHref } from '@/lib/nav';
import { pageMetadata } from '@/lib/seo';
import type { Audience, CategoryNode, Locale, ProductCard } from '@/lib/types';

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

  let merch: Record<string, ProductCard[]> = {};
  let titles: Record<string, string> = {};
  let brands: Awaited<ReturnType<typeof fetchBrands>> = [];
  let categories: CategoryNode[] = [];
  let siteMedia: Awaited<ReturnType<typeof fetchSiteMedia>> = {
    women: { ...EMPTY_SITE_MEDIA_SLOT },
    men: { ...EMPTY_SITE_MEDIA_SLOT },
    kids: { ...EMPTY_SITE_MEDIA_SLOT },
  };
  try {
    const [merchResult, brandList, categoryList, media] = await Promise.all([
      fetchMerchandising(locale),
      fetchBrands(locale),
      fetchCategories(locale),
      fetchSiteMedia(locale),
    ]);
    merch = merchResult.shelves;
    titles = merchResult.titles;
    brands = brandList;
    categories = categoryList;
    siteMedia = media;
  } catch {
    merch = {};
    titles = {};
    brands = [];
    categories = [];
  }

  const audienceRoot = categories.find((c) => c.slug === audience);
  const exploreCats = audienceRoot?.children ?? [];
  const heroFallback =
    merch.featured?.[0]?.primary_image_url ??
    merch.best_sellers?.[0]?.primary_image_url ??
    null;

  const audienceMedia = siteMedia[audience];

  const discoverWorlds = await Promise.all(
    others.map(async (other) => {
      const otherMedia = siteMedia[other];
      const image =
        (await preferMedia(otherMedia.home_still, homeHeroMediaPath(other))) ??
        (await preferMedia(otherMedia.welcome, welcomeMediaPath(other))) ??
        categories.find((c) => c.slug === other)?.image_url ??
        null;
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
        <HomeHero
          locale={locale}
          audience={audience}
          fallbackImage={heroFallback}
          apiStill={audienceMedia.home_still}
          apiMp4={audienceMedia.home_video_mp4}
          apiWebm={audienceMedia.home_video_webm}
        />

        <ProductRail
          title={titles.best_sellers ?? (it ? 'Best seller' : 'Best sellers')}
          products={merch.best_sellers ?? []}
          locale={locale}
          href={shopHref(locale, audience, { shelf: 'best_sellers' })}
          cta={it ? 'Vedi tutti' : 'View all'}
          layout="carousel"
        />

        <ExploreCategories
          locale={locale}
          audience={audience}
          categories={exploreCats}
        />

        <SpecialOffersBand
          locale={locale}
          audience={audience}
          products={merch.special_offers ?? []}
        />

        <NewArrivalsBand
          locale={locale}
          audience={audience}
          title={titles.new_arrivals ?? (it ? 'Novità' : 'New arrivals')}
          products={merch.new_arrivals ?? []}
          lifestyleImage={audienceMedia.new_arrivals_still}
        />

        <EditorialBreak
          locale={locale}
          audience={audience}
          products={merch.featured ?? []}
        />

        <OppositeGenderBand locale={locale} worlds={discoverWorlds} />

        <BrandStrip locale={locale} brands={brands} />

        <InstagramBand
          locale={locale}
          collageImages={instagramCollageFromSlot(audienceMedia)}
          products={[
            ...(merch.featured ?? []),
            ...(merch.best_sellers ?? []),
            ...(merch.new_arrivals ?? []),
          ]}
        />
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
