import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  return pageMetadata({
    locale,
    title: locale === 'it' ? 'Spedizioni e resi' : 'Shipping & returns',
    description:
      locale === 'it'
        ? 'Tempi di consegna, costi di spedizione e politica resi HARIMI.'
        : 'HARIMI delivery times, shipping costs and returns policy.',
    pathWithoutLocale: '/shipping-returns',
  });
}

export default async function ShippingReturnsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const it = locale === 'it';

  return (
    <>
<main className="container-page py-12 md:py-16">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">
          {it ? 'Assistenza' : 'Help'}
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">
          {it ? 'Spedizioni e resi' : 'Shipping & returns'}
        </h1>

        <section className="mt-12 max-w-2xl space-y-4 text-sm leading-relaxed">
          <h2 className="font-serif text-2xl">{it ? 'Spedizione' : 'Shipping'}</h2>
          <p className="text-muted">
            {it
              ? 'Consegniamo in tutta Italia. La spedizione standard ha un costo fisso di €5,90 (salvo promozioni). I tempi indicativi sono 2–5 giorni lavorativi dalla conferma del pagamento.'
              : 'We ship across Italy. Standard shipping is a flat €5.90 (unless on promotion). Typical delivery is 2–5 business days after payment confirmation.'}
          </p>
          <p className="text-muted">
            {it
              ? 'Riceverai un’email con il tracking quando l’ordine viene spedito.'
              : 'You will receive an email with tracking when your order ships.'}
          </p>
        </section>

        <section className="mt-12 max-w-2xl space-y-4 text-sm leading-relaxed">
          <h2 className="font-serif text-2xl">{it ? 'Resi e cambi' : 'Returns & exchanges'}</h2>
          <p className="text-muted">
            {it
              ? 'Hai 14 giorni dalla ricezione per richiedere un reso o un cambio taglia, se l’articolo è integro, non indossato e con etichette. Gli articoli intimi devono rispettare le norme igieniche (imbusto di protezione chiuso, dove presente).'
              : 'You have 14 days from delivery to request a return or size exchange if the item is unused, unworn and labelled. Intimate apparel must meet hygiene rules (protective seal intact where applicable).'}
          </p>
          <p className="text-muted">
            {it
              ? 'Scrivi a assistenza indicando il numero ordine. Il rimborso viene effettuato sul metodo di pagamento originale dopo controllo merce.'
              : 'Email customer care with your order number. Refunds go to the original payment method after we inspect the goods.'}
          </p>
        </section>

        <section className="mt-12 max-w-2xl space-y-4 text-sm leading-relaxed">
          <h2 className="font-serif text-2xl">{it ? 'Pagamenti' : 'Payments'}</h2>
          <p className="text-muted">
            {it
              ? 'Pagamenti sicuri tramite Stripe (carte e metodi disponibili al checkout). Non conserviamo i dati della carta.'
              : 'Secure payments via Stripe (cards and methods available at checkout). We never store card details.'}
          </p>
        </section>

        <p className="mt-12 text-sm text-muted">
          <Link href={`/${locale}/size-guide`} className="underline hover:text-ink">
            {it ? 'Guida alle taglie' : 'Size guide'}
          </Link>
        </p>
      </main>
    </>
  );
}
