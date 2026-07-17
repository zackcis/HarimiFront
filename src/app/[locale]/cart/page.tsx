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

  return (
    <>
<main className="container-page py-12 md:py-16">
        <h1 className="font-serif text-4xl">
          {locale === 'it' ? 'Carrello' : 'Shopping bag'}
        </h1>

        {count === 0 ? (
          <div className="mt-12 border border-line px-6 py-16 text-center">
            <p className="text-muted">
              {locale === 'it' ? 'Il carrello è vuoto.' : 'Your bag is empty.'}
            </p>
            <Link
              href={`/${locale}/women/shop`}
              className="mt-6 inline-block border border-ink px-5 py-2 text-xs tracking-[0.16em] uppercase"
            >
              {locale === 'it' ? 'Continua lo shopping' : 'Continue shopping'}
            </Link>
          </div>
        ) : (
          <div className="mt-10 grid gap-12 lg:grid-cols-[1.4fr_0.8fr]">
            <ul className="divide-y divide-line border-y border-line">
              {lines.map((line) => (
                <li key={line.variantId} className="flex gap-4 py-6">
                  <div className="h-28 w-24 shrink-0 overflow-hidden bg-ivory-2">
                    {line.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={line.imageUrl} alt="" className="h-full w-full object-cover" />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <Link href={`/${locale}/p/${line.productSlug}`} className="font-serif text-xl">
                      {line.title}
                    </Link>
                    <p className="mt-1 text-sm text-muted">
                      {[line.color, line.size].filter(Boolean).join(' / ')}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <input
                        type="number"
                        min={1}
                        value={line.quantity}
                        onChange={(e) => updateQty(line.variantId, Number(e.target.value) || 1)}
                        className="h-9 w-16 border border-line bg-transparent px-2 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(line.variantId)}
                        className="text-xs tracking-[0.14em] text-muted uppercase hover:text-ink"
                      >
                        {locale === 'it' ? 'Rimuovi' : 'Remove'}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm">
                    {formatEur(Number(line.unitPrice) * line.quantity, locale)}
                  </p>
                </li>
              ))}
            </ul>

            <aside className="h-fit border border-line p-6">
              <p className="flex justify-between text-sm">
                <span className="text-muted">{locale === 'it' ? 'Subtotale' : 'Subtotal'}</span>
                <span>{formatEur(subtotal, locale)}</span>
              </p>
              <p className="mt-3 text-xs text-muted">
                {locale === 'it'
                  ? 'Spedizione e IVA (inclusa) calcolati al checkout.'
                  : 'Shipping and VAT (incl.) calculated at checkout.'}{' '}
                <Link href={`/${locale}/shipping-returns`} className="underline hover:text-ink">
                  {locale === 'it' ? 'Dettagli' : 'Details'}
                </Link>
              </p>
              <Link
                href={`/${locale}/checkout`}
                className="mt-8 flex h-12 items-center justify-center bg-ink text-xs tracking-[0.18em] text-ivory uppercase"
              >
                {locale === 'it' ? 'Vai al checkout' : 'Checkout'}
              </Link>
            </aside>
          </div>
        )}
      </main>
    </>
  );
}
