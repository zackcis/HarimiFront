import { SiteHeader } from '@/components/SiteHeader';
import { fetchBrands, fetchCategories } from '@/lib/api';
import type { Audience, Brand, CategoryNode, Locale } from '@/lib/types';

export async function StoreChrome({
  locale,
  audience,
  children,
  showHeader = true,
}: {
  locale: Locale;
  audience?: Audience;
  children: React.ReactNode;
  showHeader?: boolean;
}) {
  let categories: CategoryNode[] = [];
  let brands: Brand[] = [];
  try {
    [categories, brands] = await Promise.all([
      fetchCategories(locale),
      fetchBrands(locale),
    ]);
  } catch {
    categories = [];
    brands = [];
  }

  return (
    <>
      {showHeader ? (
        <SiteHeader
          locale={locale}
          audience={audience}
          categories={categories}
          brands={brands}
        />
      ) : null}
      {children}
    </>
  );
}
