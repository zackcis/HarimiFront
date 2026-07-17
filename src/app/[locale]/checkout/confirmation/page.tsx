import { ConfirmationStatus } from '@/components/ConfirmationStatus';
import { fetchOrderLive } from '@/lib/api';
import { isLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = (isLocale(rawLocale) ? rawLocale : 'it') as Locale;
  return pageMetadata({
    locale,
    title: locale === 'it' ? 'Conferma ordine' : 'Order confirmation',
    pathWithoutLocale: '/checkout/confirmation',
    noIndex: true,
  });
}

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ reference?: string; token?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { reference, token } = await searchParams;
  if (!isLocale(rawLocale) || !reference || !token) {
    notFound();
  }
  const locale = rawLocale as Locale;

  let order;
  try {
    order = await fetchOrderLive(locale, reference, token);
  } catch {
    notFound();
  }

  return (
    <>
<ConfirmationStatus
        locale={locale}
        reference={reference}
        token={token}
        initialOrder={order}
      />
    </>
  );
}
