'use client';

import { FormEvent, Suspense, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { formatEur, placeOrder, previewCheckout } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';

export default function CheckoutPage() {
  return (
    <Suspense fallback={null}>
      <CheckoutPageInner />
    </Suspense>
  );
}

function CheckoutPageInner() {
  const params = useParams<{ locale: string }>();
  const locale = (isLocale(params.locale) ? params.locale : 'it') as Locale;
  const router = useRouter();
  const searchParams = useSearchParams();
  const { lines, clear } = useCart();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [previewTotal, setPreviewTotal] = useState<string | null>(null);
  const cancelled = searchParams.get('cancelled') === '1';

  const items = useMemo(
    () => lines.map((l) => ({ variant_id: l.variantId, quantity: l.quantity })),
    [lines],
  );

  const onPreview = async () => {
    if (!items.length) return;
    const result = await previewCheckout(locale, items);
    if (result.data?.total) {
      setPreviewTotal(result.data.total);
    }
    if (!result.data?.available) {
      setError(
        result.data?.errors?.[0]?.message ||
          (locale === 'it' ? 'Disponibilità aggiornata' : 'Availability changed'),
      );
    }
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setPending(true);
    const form = new FormData(e.currentTarget);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';

    try {
      const result = await placeOrder(locale, {
        customer: {
          name: String(form.get('name') || ''),
          email: String(form.get('email') || ''),
          phone: String(form.get('phone') || ''),
        },
        shipping_address: {
          line1: String(form.get('line1') || ''),
          line2: String(form.get('line2') || '') || null,
          city: String(form.get('city') || ''),
          province: String(form.get('province') || ''),
          postal_code: String(form.get('postal_code') || ''),
          country: 'IT',
        },
        billing_same_as_shipping: true,
        notes: String(form.get('notes') || '') || null,
        items,
        idempotency_key:
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `guest-${Date.now()}`,
        success_url: `${origin}/${locale}/checkout/confirmation?reference={ORDER_REFERENCE}&token={CONFIRMATION_TOKEN}`,
        cancel_url: `${origin}/${locale}/checkout?cancelled=1`,
      });

      if (result.status >= 400 || !result.data) {
        setError(
          locale === 'it'
            ? 'Impossibile creare l’ordine. Controlla disponibilità e dati.'
            : 'Could not place the order. Check stock and details.',
        );
        setPending(false);
        return;
      }

      const checkoutUrl = result.data.payment?.checkout_url;
      if (checkoutUrl) {
        // Keep cart until payment is confirmed — cancel returns with items intact.
        window.location.href = checkoutUrl;
        return;
      }

      const { reference, confirmation_token } = result.data;
      clear();
      router.push(
        `/${locale}/checkout/confirmation?reference=${encodeURIComponent(reference)}&token=${encodeURIComponent(confirmation_token)}`,
      );
    } catch {
      setError(locale === 'it' ? 'Errore di rete' : 'Network error');
      setPending(false);
    }
  };

  if (!lines.length) {
    return (
      <>
<main className="container-page py-16">
          <p className="text-muted">
            {locale === 'it' ? 'Il carrello è vuoto.' : 'Your bag is empty.'}
          </p>
        </main>
      </>
    );
  }

  return (
    <>
<main className="container-page py-12 md:py-16">
        <h1 className="font-serif text-4xl">
          {locale === 'it' ? 'Checkout' : 'Checkout'}
        </h1>
        <p className="mt-3 text-sm text-muted">
          {locale === 'it'
            ? 'Acquisto ospite · Spedizione in Italia · Pagamento sicuro con Stripe'
            : 'Guest checkout · Shipping in Italy · Secure Stripe payment'}
        </p>
        <p className="mt-2 text-xs text-muted">
          <Link href={`/${locale}/shipping-returns`} className="underline hover:text-ink">
            {locale === 'it' ? 'Spedizioni e resi' : 'Shipping & returns'}
          </Link>
          {' · '}
          <Link href={`/${locale}/size-guide`} className="underline hover:text-ink">
            {locale === 'it' ? 'Guida alle taglie' : 'Size guide'}
          </Link>
        </p>
        {cancelled ? (
          <div className="mt-6 border border-line bg-ivory/60 p-4">
            <p className="text-sm text-ink">
              {locale === 'it'
                ? 'Hai annullato il pagamento su Stripe. Il carrello è ancora pieno: puoi riprovare quando vuoi.'
                : 'You cancelled payment on Stripe. Your bag is still here — try again whenever you like.'}
            </p>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="mt-10 grid gap-12 lg:grid-cols-2">
          <div className="space-y-4">
            <Field name="name" label={locale === 'it' ? 'Nome completo' : 'Full name'} required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label={locale === 'it' ? 'Telefono' : 'Phone'} required />
            <Field name="line1" label={locale === 'it' ? 'Indirizzo' : 'Address'} required />
            <Field name="line2" label={locale === 'it' ? 'Interno / note' : 'Apt / notes'} />
            <div className="grid grid-cols-2 gap-3">
              <Field name="city" label={locale === 'it' ? 'Città' : 'City'} required />
              <Field name="province" label={locale === 'it' ? 'Provincia' : 'Province'} required />
            </div>
            <Field name="postal_code" label={locale === 'it' ? 'CAP' : 'Postal code'} required />
            <Field name="notes" label={locale === 'it' ? 'Note ordine' : 'Order notes'} />
          </div>

          <aside className="h-fit border border-line p-6">
            <h2 className="font-serif text-2xl">
              {locale === 'it' ? 'Riepilogo' : 'Summary'}
            </h2>
            <ul className="mt-6 space-y-3 text-sm">
              {lines.map((line) => (
                <li key={line.variantId} className="flex justify-between gap-3">
                  <span>
                    {line.title} × {line.quantity}
                  </span>
                  <span>{formatEur(Number(line.unitPrice) * line.quantity, locale)}</span>
                </li>
              ))}
            </ul>
            {previewTotal ? (
              <p className="mt-6 flex justify-between border-t border-line pt-4 text-sm">
                <span>{locale === 'it' ? 'Totale stimato' : 'Estimated total'}</span>
                <span>{formatEur(previewTotal, locale)}</span>
              </p>
            ) : null}
            {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}
            <button
              type="button"
              onClick={onPreview}
              className="mt-6 w-full border border-ink py-3 text-xs tracking-[0.16em] uppercase"
            >
              {locale === 'it' ? 'Calcola totale' : 'Calculate total'}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="mt-3 w-full bg-ink py-3 text-xs tracking-[0.16em] text-ivory uppercase disabled:opacity-60"
            >
              {pending
                ? locale === 'it'
                  ? 'Reindirizzamento…'
                  : 'Redirecting…'
                : locale === 'it'
                  ? 'Paga con Stripe'
                  : 'Pay with Stripe'}
            </button>
          </aside>
        </form>
      </main>
    </>
  );
}

function Field({
  name,
  label,
  type = 'text',
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block text-xs tracking-[0.14em] text-muted uppercase">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 h-11 w-full border border-line bg-transparent px-3 text-sm normal-case tracking-normal text-ink outline-none focus:border-ink"
      />
    </label>
  );
}
