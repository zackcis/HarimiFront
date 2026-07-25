'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatEur } from '@/lib/api';
import { useCart } from '@/lib/cart';
import type { Locale } from '@/lib/types';

export function MiniCart({ locale }: { locale: Locale }) {
  const {
    lines,
    count,
    miniCartOpen,
    closeMiniCart,
    openMiniCart,
    lastAddedVariantId,
    updateQty,
    removeItem,
  } = useCart();
  const it = locale === 'it';
  const panelRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLLIElement>(null);

  const subtotal = lines.reduce(
    (sum, line) => sum + Number(line.unitPrice) * line.quantity,
    0,
  );

  /** Keep panel open if the shopper starts editing during the auto-close window. */
  const pinOpen = () => openMiniCart();

  useEffect(() => {
    if (!miniCartOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMiniCart();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [miniCartOpen, closeMiniCart]);

  useEffect(() => {
    if (!miniCartOpen || lastAddedVariantId == null) return;
    highlightRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [miniCartOpen, lastAddedVariantId, lines]);

  if (!miniCartOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-100" role="presentation">
      <button
        type="button"
        className="overlay-enter absolute inset-0 cursor-default bg-ink/25"
        aria-label={it ? 'Chiudi' : 'Close'}
        onClick={closeMiniCart}
      />
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={it ? 'Borsa' : 'Bag'}
        className="mini-cart-enter absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-line bg-ivory shadow-[0_0_48px_rgba(20,20,20,0.12)]"
      >
        <header className="flex h-(--header-h) shrink-0 items-center justify-between border-b border-line px-5">
          <div>
            <p className="eyebrow text-muted">{it ? 'La tua borsa' : 'Your bag'}</p>
            <p className="mt-0.5 font-serif text-2xl">
              {count > 0
                ? `${count} ${it ? (count === 1 ? 'articolo' : 'articoli') : count === 1 ? 'item' : 'items'}`
                : it
                  ? 'Vuota'
                  : 'Empty'}
            </p>
          </div>
          <button
            type="button"
            className="eyebrow tap px-2 text-muted transition hover:text-ink"
            onClick={closeMiniCart}
          >
            {it ? 'Chiudi' : 'Close'}
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5">
          {count === 0 ? (
            <div className="py-16 text-center">
              <p className="font-serif text-xl">
                {it ? 'Nessun articolo ancora.' : 'No items yet.'}
              </p>
              <button
                type="button"
                className="eyebrow mt-6 inline-flex min-h-11 items-center underline underline-offset-4"
                onClick={closeMiniCart}
              >
                {it ? 'Continua lo shopping' : 'Continue shopping'}
              </button>
            </div>
          ) : (
            <ul className="divide-y divide-line">
              {lines.map((line) => {
                const highlighted = line.variantId === lastAddedVariantId;
                return (
                  <li
                    key={line.variantId}
                    ref={highlighted ? highlightRef : undefined}
                    className={`flex gap-4 py-5 transition-colors duration-(--dur-base)${
                      highlighted ? ' bg-ivory-2/80 -mx-5 px-5' : ''
                    }`}
                  >
                    <Link
                      href={`/${locale}/p/${line.productSlug}`}
                      onClick={closeMiniCart}
                      className="h-24 w-20 shrink-0 overflow-hidden bg-ivory-2"
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
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/${locale}/p/${line.productSlug}`}
                          onClick={closeMiniCart}
                          className="font-serif text-lg leading-snug hover:text-muted"
                        >
                          {line.title}
                        </Link>
                        <p className="shrink-0 text-sm tabular-nums">
                          {formatEur(Number(line.unitPrice) * line.quantity, locale)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-muted">
                        {[line.color, line.size].filter(Boolean).join(' / ')}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        <div className="inline-flex items-center border border-line">
                          <button
                            type="button"
                            aria-label={it ? 'Diminuisci' : 'Decrease'}
                            className="tap h-9 w-9 text-lg disabled:opacity-40"
                            disabled={line.quantity <= 1}
                            onClick={() => {
                              pinOpen();
                              updateQty(line.variantId, Math.max(1, line.quantity - 1));
                            }}
                          >
                            −
                          </button>
                          <span className="w-8 text-center text-sm tabular-nums">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            aria-label={it ? 'Aumenta' : 'Increase'}
                            className="tap h-9 w-9 text-lg"
                            onClick={() => {
                              pinOpen();
                              updateQty(line.variantId, line.quantity + 1);
                            }}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            pinOpen();
                            removeItem(line.variantId);
                          }}
                          className="eyebrow text-muted transition hover:text-ink"
                        >
                          {it ? 'Rimuovi' : 'Remove'}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {count > 0 ? (
          <footer className="shrink-0 border-t border-line bg-ivory px-5 py-5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="eyebrow text-muted">{it ? 'Subtotale' : 'Subtotal'}</span>
              <span className="font-serif text-2xl">{formatEur(subtotal, locale)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {it
                ? 'Spedizione calcolata al checkout.'
                : 'Shipping calculated at checkout.'}
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link
                href={`/${locale}/cart`}
                onClick={closeMiniCart}
                className="eyebrow flex h-12 items-center justify-center border border-ink bg-transparent text-ink transition hover:bg-ink hover:text-ivory"
              >
                {it ? 'Vedi la borsa' : 'View bag'}
              </Link>
              <Link
                href={`/${locale}/checkout`}
                onClick={closeMiniCart}
                className="eyebrow flex h-12 items-center justify-center bg-ink text-ivory transition hover:opacity-90"
              >
                {it ? 'Checkout' : 'Checkout'}
              </Link>
            </div>
          </footer>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
