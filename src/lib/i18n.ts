import type { Audience, Locale } from '@/lib/types';

export const LOCALES: Locale[] = ['it', 'en'];

export function isLocale(value: string): value is Locale {
  return value === 'it' || value === 'en';
}

export function isAudience(value: string): value is Audience {
  return value === 'women' || value === 'men' || value === 'kids';
}

export function audienceLabel(audience: Audience, locale: Locale): string {
  if (locale === 'en') {
    if (audience === 'women') return 'Women';
    if (audience === 'men') return 'Men';
    return 'Kids';
  }
  if (audience === 'women') return 'Donna';
  if (audience === 'men') return 'Uomo';
  return 'Bambini';
}

export function audienceHomeHref(locale: Locale, audience: Audience): string {
  return `/${locale}/${audience}`;
}
