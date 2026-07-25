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

  const it = locale === 'it';

  if (!lines.length) {
    return (
      <main className="container-page page-enter py-24">
        <div className="mx-auto max-w-md text-center">
          <p className="eyebrow text-muted">{it ? 'Checkout' : 'Checkout'}</p>
          <p className="mt-5 font-serif text-3xl leading-snug">
            {it ? 'Il carrello è vuoto.' : 'Your bag is empty.'}
          </p>
          <Link
            href={`/${locale}/women/shop`}
            className="eyebrow mt-8 inline-flex min-h-11 items-center bg-ink px-8 text-ivory transition hover:opacity-90"
          >
            {it ? 'Inizia lo shopping' : 'Start shopping'}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="container-page page-enter py-14 md:py-20">
      <header className="border-b border-line pb-6">
        <h1 className="font-serif text-4xl md:text-5xl">
          {it ? 'Checkout' : 'Checkout'}
        </h1>
        <p className="mt-4 text-sm text-muted">
          {it
            ? 'Acquisto ospite · Spedizione in Italia · Pagamento sicuro con Stripe'
            : 'Guest checkout · Shipping in Italy · Secure Stripe payment'}
        </p>
        <p className="mt-2 text-xs text-muted">
          <Link href={`/${locale}/shipping-returns`} className="underline hover:text-ink">
            {it ? 'Spedizioni e resi' : 'Shipping & returns'}
          </Link>
          {' · '}
          <Link href={`/${locale}/size-guide`} className="underline hover:text-ink">
            {it ? 'Guida alle taglie' : 'Size guide'}
          </Link>
        </p>
      </header>

      {cancelled ? (
        <div className="mt-6 border border-line bg-ivory/60 p-4">
          <p className="text-sm text-ink">
            {it
              ? 'Hai annullato il pagamento su Stripe. Il carrello è ancora pieno: puoi riprovare quando vuoi.'
              : 'You cancelled payment on Stripe. Your bag is still here — try again whenever you like.'}
          </p>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-12 grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
        <div className="space-y-12">
          <fieldset className="space-y-4">
            <legend className="eyebrow mb-2 text-muted">{it ? 'Contatti' : 'Contact'}</legend>
            <Field name="name" label={it ? 'Nome completo' : 'Full name'} required />
            <Field name="email" label="Email" type="email" required />
            <Field name="phone" label={it ? 'Telefono' : 'Phone'} required />
          </fieldset>

          <fieldset className="space-y-4 border-t border-line pt-10">
            <legend className="eyebrow mb-2 text-muted">{it ? 'Spedizione' : 'Shipping'}</legend>
            <Field name="line1" label={it ? 'Indirizzo' : 'Address'} required />
            <Field name="line2" label={it ? 'Interno / note' : 'Apt / notes'} />
            <div className="grid grid-cols-2 gap-3">
              <Field name="city" label={it ? 'Città' : 'City'} required />
              <Field name="province" label={it ? 'Provincia' : 'Province'} required />
            </div>
            <Field name="postal_code" label={it ? 'CAP' : 'Postal code'} required />
          </fieldset>

          <fieldset className="space-y-4 border-t border-line pt-10">
            <legend className="eyebrow mb-2 text-muted">{it ? 'Note' : 'Notes'}</legend>
            <Field name="notes" label={it ? 'Note ordine' : 'Order notes'} />
          </fieldset>
        </div>

        <aside className="h-fit lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
          <div className="border border-line p-6 md:p-7">
            <p className="eyebrow text-muted">{it ? 'Riepilogo' : 'Summary'}</p>
            <ul className="mt-6 space-y-3 text-sm">
              {lines.map((line) => (
                <li key={line.variantId} className="flex justify-between gap-3">
                  <span className="text-muted">
                    {line.title} <span className="text-ink">× {line.quantity}</span>
                  </span>
                  <span className="shrink-0">
                    {formatEur(Number(line.unitPrice) * line.quantity, locale)}
                  </span>
                </li>
              ))}
            </ul>
            {previewTotal ? (
              <p className="mt-6 flex items-baseline justify-between border-t border-line pt-5">
                <span className="text-muted">{it ? 'Totale stimato' : 'Estimated total'}</span>
                <span className="font-serif text-2xl">{formatEur(previewTotal, locale)}</span>
              </p>
            ) : null}
            {error ? <p className="mt-4 text-sm text-sale">{error}</p> : null}
            <button
              type="button"
              onClick={onPreview}
              className="eyebrow mt-6 flex min-h-11 w-full items-center justify-center border border-ink transition hover:bg-ink hover:text-ivory"
            >
              {it ? 'Calcola totale' : 'Calculate total'}
            </button>
            <button
              type="submit"
              disabled={pending}
              className="eyebrow mt-3 flex min-h-11 w-full items-center justify-center bg-ink text-ivory transition hover:opacity-90 disabled:opacity-60"
            >
              {pending
                ? it
                  ? 'Reindirizzamento…'
                  : 'Redirecting…'
                : it
                  ? 'Paga con Stripe'
                  : 'Pay with Stripe'}
            </button>
            <p className="mt-4 text-center text-[11px] text-muted">
              {it ? 'Pagamento sicuro · SSL' : 'Secure payment · SSL'}
            </p>
          </div>
        </aside>
      </form>
    </main>
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
    <label className="eyebrow block text-muted">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 h-11 w-full border border-line bg-transparent px-3 text-base normal-case tracking-normal text-ink outline-none transition focus:border-ink"
      />
    </label>
  );
}
