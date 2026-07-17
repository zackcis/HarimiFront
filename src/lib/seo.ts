import type { Metadata } from 'next';
import type { Locale } from '@/lib/types';
import { LOCALES } from '@/lib/i18n';

export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'HARIMI';

export function siteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    'http://localhost:3000';
  if (raw.startsWith('http://') || raw.startsWith('https://')) {
    return raw.replace(/\/$/, '');
  }
  return `https://${raw.replace(/\/$/, '')}`;
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  if (!path || path === '/') return base;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

const descriptions: Record<Locale, string> = {
  it: 'Boutique multi-brand di intimates — eleganza quotidiana, selezione curata.',
  en: 'Multi-brand intimates boutique — everyday elegance, curated selection.',
};

export function siteDescription(locale: Locale): string {
  return descriptions[locale];
}

export function localeAlternates(
  locale: Locale,
  pathWithoutLocale: string,
): Metadata['alternates'] {
  const normalized =
    !pathWithoutLocale || pathWithoutLocale === '/'
      ? ''
      : pathWithoutLocale.startsWith('/')
        ? pathWithoutLocale
        : `/${pathWithoutLocale}`;

  const languages: Record<string, string> = {};
  for (const loc of LOCALES) {
    languages[loc] = absoluteUrl(`/${loc}${normalized}`);
  }
  languages['x-default'] = absoluteUrl(`/it${normalized}`);

  return {
    canonical: absoluteUrl(`/${locale}${normalized}`),
    languages,
  };
}

export function pageMetadata({
  locale,
  title,
  description,
  pathWithoutLocale = '',
  image,
  noIndex = false,
}: {
  locale: Locale;
  title?: string;
  description?: string;
  /** Path after locale, e.g. `/women/shop` or `/p/slug` */
  pathWithoutLocale?: string;
  image?: string | null;
  noIndex?: boolean;
}): Metadata {
  const desc = description ?? siteDescription(locale);
  const images =
    image && (image.startsWith('http://') || image.startsWith('https://'))
      ? [{ url: image }]
      : image
        ? [{ url: absoluteUrl(image) }]
        : undefined;

  return {
    title: title ? { absolute: `${title} · ${SITE_NAME}` } : undefined,
    description: desc,
    alternates: localeAlternates(locale, pathWithoutLocale),
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      locale: locale === 'it' ? 'it_IT' : 'en_GB',
      title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
      description: desc,
      url: absoluteUrl(`/${locale}${pathWithoutLocale || ''}`),
      images,
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} · ${SITE_NAME}` : SITE_NAME,
      description: desc,
      images: images?.map((i) => i.url),
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function productJsonLd(input: {
  locale: Locale;
  name: string;
  description: string | null;
  slug: string;
  image: string | null;
  brandName: string | null;
  price: string | null;
  currency: string;
  inStock: boolean;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: input.name,
    description: input.description ?? undefined,
    image: input.image ? [input.image] : undefined,
    brand: input.brandName
      ? { '@type': 'Brand', name: input.brandName }
      : undefined,
    offers: input.price
      ? {
          '@type': 'Offer',
          url: absoluteUrl(`/${input.locale}/p/${input.slug}`),
          priceCurrency: input.currency,
          price: input.price,
          availability: input.inStock
            ? 'https://schema.org/InStock'
            : 'https://schema.org/OutOfStock',
        }
      : undefined,
  };
}
