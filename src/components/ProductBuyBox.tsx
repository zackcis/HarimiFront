'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { formatEur } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { InfoModal } from '@/components/info/InfoModal';
import { ShippingReturnsBody } from '@/components/info/ShippingReturnsBody';
import { SizeGuideBody } from '@/components/info/SizeGuideBody';
import { primaryImageUrlForColor } from '@/lib/product-images';
import type { Locale, ProductDetail } from '@/lib/types';

function discountPercent(price: string | null | undefined, compare: string | null | undefined) {
  const now = Number(price);
  const was = Number(compare);
  if (!Number.isFinite(now) || !Number.isFinite(was) || was <= now || was <= 0) {
    return null;
  }
  return Math.round((1 - now / was) * 100);
}

type InfoKind = 'size' | 'shipping' | null;

export function ProductBuyBox({
  product,
  locale,
  selectedColorKey,
  onColorKeyChange,
}: {
  product: ProductDetail;
  locale: Locale;
  selectedColorKey?: string | null;
  onColorKeyChange?: (colorKey: string | null) => void;
}) {
  const { addItem } = useCart();
  const it = locale === 'it';

  const colors = useMemo(() => {
    const map = new Map<string, { name: string; key: string; hex: string | null }>();
    for (const v of product.variants) {
      if (!v.color) continue;
      if (!map.has(v.color)) {
        map.set(v.color, {
          name: v.color,
          key: v.color_key ?? v.color,
          hex: v.color_hex,
        });
      }
    }
    return [...map.values()];
  }, [product.variants]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    for (const v of product.variants) {
      if (v.size) set.add(v.size);
    }
    return [...set];
  }, [product.variants]);

  const defaultColor =
    colors.find((c) =>
      product.variants.some((v) => v.color === c.name && v.in_stock),
    ) ?? colors[0] ?? null;

  const [internalColorKey, setInternalColorKey] = useState<string | null>(
    defaultColor?.key ?? null,
  );
  const colorKey =
    selectedColorKey !== undefined ? selectedColorKey : internalColorKey;
  const setColorKey = (next: string | null) => {
    if (selectedColorKey === undefined) setInternalColorKey(next);
    onColorKeyChange?.(next);
  };

  const color =
    colors.find((c) => c.key === colorKey)?.name ??
    colors.find((c) => c.name === colorKey)?.name ??
    defaultColor?.name ??
    null;

  const [size, setSize] = useState<string | null>(() => {
    const first = product.variants.find(
      (v) =>
        v.in_stock &&
        (!defaultColor || v.color === defaultColor.name),
    );
    return first?.size ?? sizes[0] ?? null;
  });
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const [info, setInfo] = useState<InfoKind>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    [],
  );

  const selected = useMemo(
    () =>
      product.variants.find(
        (v) =>
          (color ? v.color === color : true) &&
          (size ? v.size === size : true),
      ),
    [product.variants, color, size],
  );

  const sizeAvailable = (s: string) =>
    product.variants.some(
      (v) => v.size === s && (!color || v.color === color) && v.in_stock,
    );

  const maxQty = selected?.in_stock ? Math.min(selected.stock, 10) : 0;

  const priceVariant = selected ?? product.variants[0];
  const onSale =
    priceVariant?.compare_at_price != null &&
    Number(priceVariant.compare_at_price) > Number(priceVariant.price);
  const pct = onSale
    ? discountPercent(priceVariant?.price, priceVariant?.compare_at_price)
    : null;

  const onAdd = () => {
    if (!selected?.in_stock) return;
    addItem(
      {
        variantId: selected.id,
        productId: product.id,
        productSlug: product.slug,
        title: product.title,
        size: selected.size,
        color: selected.color,
        colorHex: selected.color_hex,
        unitPrice: selected.price,
        imageUrl: primaryImageUrlForColor(
          product.images,
          selected.color_key ?? selected.color,
        ),
      },
      qty,
    );
    setJustAdded(true);
    setMessage(it ? 'Aggiunto alla borsa' : 'Added to bag');
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 2000);
  };

  const anyInStock = product.variants.some((v) => v.in_stock);

  return (
    <div>
      {product.brand?.name ? (
        <Link
          href={`/${locale}/brands/${product.brand.slug}`}
          className="eyebrow text-muted transition-colors duration-(--dur-fast) hover:text-ink"
        >
          {product.brand.name}
        </Link>
      ) : null}

      <h1 className="mt-3 font-serif text-[clamp(1.85rem,4vw,2.75rem)] leading-[1.12] tracking-tight text-ink">
        {product.title}
      </h1>

      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2">
        {onSale ? (
          <>
            <span className="text-lg text-sale">
              {formatEur(priceVariant?.price ?? null, locale)}
            </span>
            <span className="text-base text-muted line-through">
              {formatEur(priceVariant?.compare_at_price ?? null, locale)}
            </span>
            {pct ? (
              <span className="bg-ivory-2 px-1.5 py-0.5 text-[11px] leading-none tracking-normal text-sale tabular-nums">
                −{pct}%
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-lg text-ink">
            {priceVariant ? formatEur(priceVariant.price, locale) : '—'}
          </span>
        )}
      </div>

      {!anyInStock ? (
        <p className="mt-8 text-sm text-muted">{it ? 'Prodotto esaurito' : 'Sold out'}</p>
      ) : (
        <div className="mt-8 space-y-6">
          {colors.length > 0 ? (
            <div>
              <p className="eyebrow text-muted">
                {it ? 'Colore' : 'Color'}
                {color ? ` · ${color}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {colors.map((c) => {
                  const active = colorKey === c.key || color === c.name;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      title={c.name}
                      aria-label={c.name}
                      aria-pressed={active}
                      onClick={() => {
                        setColorKey(c.key);
                        const nextSize = product.variants.find(
                          (v) => v.color === c.name && v.in_stock,
                        )?.size;
                        if (nextSize) setSize(nextSize);
                        setQty(1);
                      }}
                      className="tap inline-flex items-center justify-center rounded-full"
                    >
                      <span
                        className={`inline-block h-8 w-8 rounded-full border transition-[box-shadow,border-color] duration-(--dur-fast) ${
                          active
                            ? 'border-ink ring-2 ring-ink ring-offset-2 ring-offset-background'
                            : 'border-line'
                        }`}
                        style={{ backgroundColor: c.hex || '#ccc' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {sizes.length > 0 ? (
            <div>
              <p className="eyebrow text-muted">{it ? 'Taglia' : 'Size'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const available = sizeAvailable(s);
                  const active = size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!available}
                      aria-pressed={active}
                      onClick={() => {
                        setSize(s);
                        setQty(1);
                      }}
                      className={`inline-flex min-h-11 min-w-12 items-center justify-center border px-3 text-sm transition-colors duration-(--dur-fast) ${
                        active
                          ? 'border-ink bg-ink text-ivory'
                          : available
                            ? 'border-line hover:border-ink'
                            : 'cursor-not-allowed border-line text-muted line-through opacity-40'
                      }`}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          <div>
            <p className="eyebrow text-muted">{it ? 'Quantità' : 'Quantity'}</p>
            <div className="mt-3 inline-flex items-center border border-line">
              <button
                type="button"
                className="h-11 w-11 text-lg transition-opacity duration-(--dur-fast) disabled:opacity-30"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-10 text-center text-sm tabular-nums">{qty}</span>
              <button
                type="button"
                className="h-11 w-11 text-lg transition-opacity duration-(--dur-fast) disabled:opacity-30"
                disabled={qty >= maxQty}
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onAdd}
              disabled={!selected?.in_stock || maxQty < 1}
              className={`h-12 w-full text-[11px] tracking-[0.2em] uppercase transition-[opacity,background-color,color] duration-(--dur-base) disabled:opacity-40${
                justAdded
                  ? ' add-confirm border border-ink bg-ivory text-ink'
                  : ' bg-ink text-ivory hover:opacity-90'
              }`}
            >
              {justAdded
                ? it
                  ? 'Aggiunto ✓'
                  : 'Added ✓'
                : it
                  ? 'Aggiungi alla borsa'
                  : 'Add to bag'}
            </button>
            {message ? (
              <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
                <span>{message}</span>
                <Link
                  href={`/${locale}/cart`}
                  className="underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-ink"
                >
                  {it ? 'Vedi la borsa' : 'View bag'}
                </Link>
              </p>
            ) : null}
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {it
                ? 'Spedizione standard 2–5 giorni lavorativi · €5,90'
                : 'Standard shipping 2–5 business days · €5.90'}
            </p>
          </div>
        </div>
      )}

      <div className="mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t border-line pt-5 text-sm text-muted">
        <button
          type="button"
          onClick={() => setInfo('size')}
          className="underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-ink"
        >
          {it ? 'Guida alle taglie' : 'Size guide'}
        </button>
        <button
          type="button"
          onClick={() => setInfo('shipping')}
          className="underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-ink"
        >
          {it ? 'Spedizioni e resi' : 'Shipping & returns'}
        </button>
      </div>

      {info === 'size' ? (
        <InfoModal
          title={it ? 'Guida alle taglie' : 'Size guide'}
          closeLabel={it ? 'Chiudi' : 'Close'}
          onClose={() => setInfo(null)}
        >
          <SizeGuideBody locale={locale} />
        </InfoModal>
      ) : null}
      {info === 'shipping' ? (
        <InfoModal
          title={it ? 'Spedizioni e resi' : 'Shipping & returns'}
          closeLabel={it ? 'Chiudi' : 'Close'}
          onClose={() => setInfo(null)}
        >
          <ShippingReturnsBody locale={locale} />
        </InfoModal>
      ) : null}
    </div>
  );
}
