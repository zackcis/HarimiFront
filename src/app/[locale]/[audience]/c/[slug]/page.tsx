import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  CategoryLandingBody,
  CategoryLandingHero,
} from '@/components/category/CategoryLanding';
import { fetchCategories, fetchCategory, fetchProducts } from '@/lib/api';
import { categoryEditorial } from '@/lib/editorial';
import { audienceLabel, isAudience, isLocale } from '@/lib/i18n';
import { categoryMediaPath, preferMedia } from '@/lib/media';
import { audienceCategorySlug, categoryShopHref } from '@/lib/nav';
import { pageMetadata } from '@/lib/seo';
import { findCategoryInTree } from '@/lib/shop';
import type { Audience, CategoryNode, Locale, ProductCard } from '@/lib/types';

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

  // Allow any category whose ancestry reaches the audience root (L2, L3, …).
  let inAudienceTree = false;
  try {
    const tree = await fetchCategories(locale);
    const audienceRoot = tree.find((c) => c.slug === audienceCategorySlug(audience));
    inAudienceTree = Boolean(audienceRoot && findCategoryInTree(audienceRoot, category.slug));
  } catch {
    // Tree unavailable — fall back to the shallow parent check.
    const parentSlug = category.parent?.slug;
    inAudienceTree = (category.slug === audience && !parentSlug) || parentSlug === audience;
  }
  if (!inAudienceTree) {
    notFound();
  }

  const copy = categoryEditorial(category.slug, category.name, locale);
  const heroImage =
    (await preferMedia(category.hero_url, categoryMediaPath(category.slug))) ??
    category.image_url;

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
  const typeCategories: CategoryNode[] =
    category.children?.length > 0
      ? category.children.map((child, index) => ({
          id: index + 1,
          slug: child.slug,
          name: child.name,
          parent_id: category.id,
          image_url: child.image_url,
          children: [],
        }))
      : [];

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
        typeCategories={typeCategories}
        categorySlug={category.slug}
        categoryImage={category.image_url}
      />
    </main>
  );
}
