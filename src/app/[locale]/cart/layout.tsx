import type { Metadata } from 'next';
import { isLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = (isLocale(raw) ? raw : 'it') as Locale;
  return pageMetadata({
    locale,
    title: locale === 'it' ? 'Carrello' : 'Shopping bag',
    pathWithoutLocale: '/cart',
    noIndex: true,
  });
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
