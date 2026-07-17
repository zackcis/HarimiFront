import type { MetadataRoute } from 'next';
import { fetchBrands, fetchCategories, fetchProducts } from '@/lib/api';
import { LOCALES } from '@/lib/i18n';
import { absoluteUrl } from '@/lib/seo';
import type { Locale } from '@/lib/types';

const AUDIENCES = ['women', 'men', 'kids'] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];

  for (const locale of LOCALES) {
    for (const audience of AUDIENCES) {
      entries.push({
        url: absoluteUrl(`/${locale}/${audience}`),
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.9,
      });
      entries.push({
        url: absoluteUrl(`/${locale}/${audience}/shop`),
        lastModified: now,
        changeFrequency: 'daily',
        priority: 0.8,
      });

      try {
        const cats = await fetchCategories(locale as Locale);
        const root = cats.find((c) => c.slug === audience);
        for (const child of root?.children ?? []) {
          entries.push({
            url: absoluteUrl(`/${locale}/${audience}/c/${child.slug}`),
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.75,
          });
        }
      } catch {
        // ignore
      }
    }

    entries.push({
      url: absoluteUrl(`/${locale}/brands`),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    });
    entries.push({
      url: absoluteUrl(`/${locale}/size-guide`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });
    entries.push({
      url: absoluteUrl(`/${locale}/shipping-returns`),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    });

    try {
      const brands = await fetchBrands(locale);
      for (const brand of brands) {
        entries.push({
          url: absoluteUrl(`/${locale}/brands/${brand.slug}`),
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    } catch {
      // API unavailable during build — static routes still shipped
    }

    try {
      const products = await fetchProducts(locale as Locale, {
        sort: 'newest',
        in_stock: '1',
      });
      for (const product of products.data ?? []) {
        entries.push({
          url: absoluteUrl(`/${locale}/p/${product.slug}`),
          lastModified: now,
          changeFrequency: 'daily',
          priority: 0.7,
        });
      }
    } catch {
      // ignore
    }
  }

  return entries;
}
