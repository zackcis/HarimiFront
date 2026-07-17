import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CategoryLandingBody,
  CategoryLandingHero,
} from '@/components/category/CategoryLanding';
import { fetchCategory, fetchProducts } from '@/lib/api';
import { categoryEditorial } from '@/lib/editorial';
import { audienceLabel, isAudience, isLocale } from '@/lib/i18n';
import { categoryMediaPath, mediaExists } from '@/lib/media';
import { categoryLandingHref, categoryShopHref } from '@/lib/nav';
import { pageMetadata } from '@/lib/seo';
import type { Audience, Locale, ProductCard } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; audience: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale, audience: rawAudience, slug } = await params;
  if (!isLocale(rawLocale) || !isAudience(rawAudience)) return {};
  const locale = rawLocale as Locale;
  const audience = rawAudience as Audience;

  try {
    const category = await fetchCategory(locale, slug);
    const copy = categoryEditorial(category.slug, category.name, locale);
    return pageMetadata({
      locale,
      title: category.name,
      description: copy.body.slice(0, 160),
      pathWithoutLocale: `/${audience}/c/${slug}`,
      image: category.image_url,
    });
  } catch {
    return pageMetadata({
      locale,
      title: slug,
      pathWithoutLocale: `/${audience}/c/${slug}`,
    });
  }
}

export default async function CategoryLandingPage({
  params,
}: {
  params: Promise<{ locale: string; audience: string; slug: string }>;
}) {
  const { locale: rawLocale, audience: rawAudience, slug } = await params;
  if (!isLocale(rawLocale) || !isAudience(rawAudience)) notFound();
  const locale = rawLocale as Locale;
  const audience = rawAudience as Audience;

  let category;
  try {
    category = await fetchCategory(locale, slug);
  } catch {
    notFound();
  }

  const parentSlug = category.parent?.slug;
  const isAudienceRoot = category.slug === audience && !parentSlug;
  const isAudienceChild = parentSlug === audience;
  if (!isAudienceRoot && !isAudienceChild) {
    notFound();
  }

  const copy = categoryEditorial(category.slug, category.name, locale);
  const mediaPath = categoryMediaPath(category.slug);
  const hasMedia = await mediaExists(mediaPath);
  const heroImage = hasMedia ? mediaPath : category.image_url;

  let featured: ProductCard[] = [];
  try {
    const result = await fetchProducts(locale, {
      category: category.slug,
      in_stock: '1',
      sort: 'newest',
      per_page: '8',
    });
    featured = (result.data ?? []).slice(0, 8);
  } catch {
    featured = [];
  }

  const shopHref = categoryShopHref(locale, audience, category.slug);
  const childLinks =
    category.children?.length > 0
      ? category.children.map((child) => ({
          name: child.name,
          href: categoryLandingHref(locale, audience, child.slug),
        }))
      : undefined;

  return (
    <main>
      <CategoryLandingHero
        name={category.name}
        copy={copy}
        image={heroImage}
        audienceLabel={audienceLabel(audience, locale)}
      />
      <CategoryLandingBody
        locale={locale}
        audience={audience}
        copy={copy}
        shopHref={shopHref}
        featured={featured}
        childLinks={childLinks}
      />
    </main>
  );
}
