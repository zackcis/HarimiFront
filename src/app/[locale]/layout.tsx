import { notFound } from 'next/navigation';
import { SiteFooter } from '@/components/SiteFooter';
import { StoreChrome } from '@/components/StoreChrome';
import { WhatsAppFab } from '@/components/WhatsAppFab';
import { isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) {
    notFound();
  }
  const locale = raw as Locale;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <StoreChrome locale={locale}>{children}</StoreChrome>
      <SiteFooter locale={locale} />
      <WhatsAppFab locale={locale} />
    </div>
  );
}
