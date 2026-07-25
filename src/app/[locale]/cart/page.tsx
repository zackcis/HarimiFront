'use client';

import Link from 'next/link';
import { formatEur } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { isLocale } from '@/lib/i18n';
import type { Locale } from '@/lib/types';
import { useParams } from 'next/navigation';

export default function CartPage() {
  const params = useParams<{ locale: string }>();
  const locale = (isLocale(params.locale) ? params.locale : 'it') as Locale;
  const { lines, updateQty, removeItem, count } = useCart();

  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.unitPrice) * line.quantity,
    0,
  );

  const it = locale === 'it';

  return (
    <main className="container-page page-enter py-14 md:py-20">
      <header className="flex items-baseline justify-between gap-4 border-b border-line pb-6">
        <h1 className="font-serif text-4xl md:text-5xl">
          {it ? 'Carrello' : 'Shopping bag'}
        </h1>
        {count > 0 ? (
          <span className="eyebrow text-muted">
            {count} {it ? (count === 1 ? 'articolo' : 'articoli') : count === 1 ? 'item' : 'items'}
          </span>
        ) : null}
      </header>

      {count === 0 ? (
        <div className="mx-auto mt-24 max-w-md text-center">
          <p className="eyebrow text-muted">{it ? 'La tua borsa' : 'Your bag'}</p>
          <p className="mt-5 font-serif text-3xl leading-snug">
            {it ? 'Il carrello è ancora vuoto.' : 'Your bag is still empty.'}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            {it
              ? 'Scopri la selezione HARIMI e aggiungi i tuoi capi preferiti.'
              : 'Explore the HARIMI selection and add your favourite pieces.'}
          </p>
          <Link
            href={`/${locale}/women/shop`}
            className="eyebrow mt-8 inline-flex min-h-11 items-center bg-ink px-8 text-ivory transition hover:opacity-90"
          >
            {it ? 'Inizia lo shopping' : 'Start shopping'}
          </Link>
        </div>
      ) : (
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.4fr_0.8fr] lg:gap-16">
          <div>
            <ul className="divide-y divide-line border-b border-line">
              {lines.map((line) => (
                <li key={line.variantId} className="flex gap-5 py-7">
                  <Link
                    href={`/${locale}/p/${line.productSlug}`}
                    className="h-32 w-24 shrink-0 overflow-hidden bg-ivory-2"
                  >
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={line.imageUrl}
                        alt=""
                        className="h-full w-full object-cover object-[center_18%]"
                      />
                    ) : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <Link
                        href={`/${locale}/p/${line.productSlug}`}
                        className="font-serif text-xl leading-snug hover:text-muted"
                      >
                        {line.title}
                      </Link>
                      <p className="shrink-0 text-sm">
                        {formatEur(Number(line.unitPrice) * line.quantity, locale)}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {[line.color, line.size].filter(Boolean).join(' / ')}
                    </p>
                    <div className="mt-auto flex flex-wrap items-center gap-4 pt-4">
                      <div className="inline-flex items-center border border-line">
                        <button
                          type="button"
                          aria-label={it ? 'Diminuisci' : 'Decrease'}
                          className="tap inline-flex items-center justify-center text-lg transition hover:bg-ivory-2 disabled:opacity-40"
                          disabled={line.quantity <= 1}
                          onClick={() =>
                            updateQty(line.variantId, Math.max(1, line.quantity - 1))
                          }
                        >
                          −
                        </button>
                        <span className="w-10 text-center text-sm">{line.quantity}</span>
                        <button
                          type="button"
                          aria-label={it ? 'Aumenta' : 'Increase'}
                          className="tap inline-flex items-center justify-center text-lg transition hover:bg-ivory-2"
                          onClick={() => updateQty(line.variantId, line.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeItem(line.variantId)}
                        className="eyebrow inline-flex min-h-11 items-center text-muted transition hover:text-ink"
                      >
                        {it ? 'Rimuovi' : 'Remove'}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <Link
              href={`/${locale}/women/shop`}
              className="eyebrow mt-8 inline-flex min-h-11 items-center text-muted transition hover:text-ink"
            >
              {it ? '← Continua lo shopping' : '← Continue shopping'}
            </Link>
          </div>

          <aside className="h-fit lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <div className="border border-line p-6 md:p-7">
              <p className="eyebrow text-muted">{it ? 'Riepilogo' : 'Summary'}</p>
              <p className="mt-6 flex items-baseline justify-between border-t border-line pt-6 text-base">
                <span className="text-muted">{it ? 'Subtotale' : 'Subtotal'}</span>
                <span className="font-serif text-2xl">{formatEur(subtotal, locale)}</span>
              </p>
              <p className="mt-4 text-xs leading-relaxed text-muted">
                {it
                  ? 'Spedizione e IVA (inclusa) calcolati al checkout.'
                  : 'Shipping and VAT (incl.) calculated at checkout.'}{' '}
                <Link href={`/${locale}/shipping-returns`} className="underline hover:text-ink">
                  {it ? 'Dettagli' : 'Details'}
                </Link>
              </p>
              <Link
                href={`/${locale}/checkout`}
                className="eyebrow mt-8 flex h-12 items-center justify-center bg-ink text-ivory transition hover:opacity-90"
              >
                {it ? 'Vai al checkout' : 'Checkout'}
              </Link>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
