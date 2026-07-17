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
    title: locale === 'it' ? 'Checkout' : 'Checkout',
    pathWithoutLocale: '/checkout',
    noIndex: true,
  });
}

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
