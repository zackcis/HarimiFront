import type { Audience, Locale } from '@/lib/types';
import { audienceLabel } from '@/lib/i18n';

/** Root category slug matching Laravel intimates taxonomy */
export function audienceCategorySlug(audience: Audience): Audience {
  return audience;
}

const AUDIENCE_ORDER: Audience[] = ['women', 'men', 'kids'];

/** The other shopping worlds, in canonical order (excludes current). */
export function otherAudiences(audience: Audience): Audience[] {
  return AUDIENCE_ORDER.filter((a) => a !== audience);
}

export function shopHref(
  locale: Locale,
  audience: Audience,
  query: Record<string, string | undefined> = {},
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return `/${locale}/${audience}/shop${qs ? `?${qs}` : ''}`;
}

export function offersHref(locale: Locale, audience: Audience): string {
  return shopHref(locale, audience, { shelf: 'special_offers' });
}

export function categoryShopHref(
  locale: Locale,
  audience: Audience,
  categorySlug: string,
): string {
  return shopHref(locale, audience, { category: categorySlug });
}

/** Editorial category landing — then CTAs into filtered shop */
export function categoryLandingHref(
  locale: Locale,
  audience: Audience,
  categorySlug: string,
): string {
  return `/${locale}/${audience}/c/${encodeURIComponent(categorySlug)}`;
}

export function navCopy(locale: Locale) {
  const it = locale === 'it';
  return {
    women: audienceLabel('women', locale),
    men: audienceLabel('men', locale),
    kids: audienceLabel('kids', locale),
    brands: it ? 'Marchi' : 'Brands',
    offers: it ? 'Offerte' : 'Offers',
    search: it ? 'Cerca' : 'Search',
    bag: it ? 'Borsa' : 'Bag',
    allBrands: it ? 'Tutti i marchi' : 'All brands',
    explore: it ? 'Esplora' : 'Explore',
    shop: it ? 'Acquista' : 'Shop',
    close: it ? 'Chiudi' : 'Close',
    menu: it ? 'Menu' : 'Menu',
    searchPlaceholder: it ? 'Cerca prodotti, brand…' : 'Search products, brands…',
  };
}
