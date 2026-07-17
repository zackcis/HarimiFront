'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { formatEur } from '@/lib/api';
import { useCart } from '@/lib/cart';
import type { Locale, ProductDetail } from '@/lib/types';

export function ProductBuyBox({
  product,
  locale,
}: {
  product: ProductDetail;
  locale: Locale;
}) {
  const { addItem } = useCart();
  const it = locale === 'it';

  const colors = useMemo(() => {
    const map = new Map<string, string | null>();
    for (const v of product.variants) {
      if (!v.color) continue;
      if (!map.has(v.color)) map.set(v.color, v.color_hex);
    }
    return [...map.entries()].map(([name, hex]) => ({ name, hex }));
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
    )?.name ?? colors[0]?.name ?? null;

  const [color, setColor] = useState<string | null>(defaultColor);
  const [size, setSize] = useState<string | null>(() => {
    const first = product.variants.find(
      (v) => v.in_stock && (!defaultColor || v.color === defaultColor),
    );
    return first?.size ?? sizes[0] ?? null;
  });
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');

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
        imageUrl:
          product.images.find((i) => i.is_primary)?.url ??
          product.images[0]?.url ??
          null,
      },
      qty,
    );
    setMessage(it ? 'Aggiunto alla borsa' : 'Added to bag');
  };

  const anyInStock = product.variants.some((v) => v.in_stock);

  return (
    <div className="space-y-8">
      {product.brand?.name ? (
        <Link
          href={`/${locale}/brands/${product.brand.slug}`}
          className="text-[11px] tracking-[0.2em] text-muted uppercase hover:text-ink"
        >
          {product.brand.name}
        </Link>
      ) : null}

      <div>
        <h1 className="font-serif text-4xl leading-tight md:text-5xl">{product.title}</h1>
        <p className="mt-4 text-lg">
          {selected
            ? formatEur(selected.price, locale)
            : product.variants[0]
              ? formatEur(product.variants[0].price, locale)
              : '—'}
        </p>
      </div>

      {!anyInStock ? (
        <p className="text-sm text-muted">{it ? 'Prodotto esaurito' : 'Sold out'}</p>
      ) : (
        <>
          {colors.length > 0 ? (
            <div>
              <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
                {it ? 'Colore' : 'Color'}
                {color ? ` · ${color}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-3">
                {colors.map((c) => {
                  const active = color === c.name;
                  return (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => {
                        setColor(c.name);
                        const nextSize = product.variants.find(
                          (v) => v.color === c.name && v.in_stock,
                        )?.size;
                        if (nextSize) setSize(nextSize);
                        setQty(1);
                      }}
                      className={`h-8 w-8 rounded-full border ${
                        active ? 'border-ink ring-1 ring-ink' : 'border-line'
                      }`}
                      style={{ backgroundColor: c.hex || '#ccc' }}
                    />
                  );
                })}
              </div>
            </div>
          ) : null}

          {sizes.length > 0 ? (
            <div>
              <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
                {it ? 'Taglia' : 'Size'}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const available = sizeAvailable(s);
                  const active = size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!available}
                      onClick={() => {
                        setSize(s);
                        setQty(1);
                      }}
                      className={`min-w-12 border px-3 py-2 text-sm ${
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
            <p className="text-[11px] tracking-[0.18em] text-muted uppercase">
              {it ? 'Quantità' : 'Quantity'}
            </p>
            <div className="mt-3 inline-flex items-center border border-line">
              <button
                type="button"
                className="h-11 w-11 text-lg"
                disabled={qty <= 1}
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="w-10 text-center text-sm">{qty}</span>
              <button
                type="button"
                className="h-11 w-11 text-lg"
                disabled={qty >= maxQty}
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
              >
                +
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onAdd}
            disabled={!selected?.in_stock || maxQty < 1}
            className="h-12 w-full bg-ink text-[11px] tracking-[0.2em] text-ivory uppercase transition hover:opacity-90 disabled:opacity-40"
          >
            {it ? 'Aggiungi alla borsa' : 'Add to bag'}
          </button>
          {message ? <p className="text-sm text-muted">{message}</p> : null}
        </>
      )}

      <div className="space-y-2 border-t border-line pt-6 text-sm text-muted">
        <p>
          <Link href={`/${locale}/size-guide`} className="underline hover:text-ink">
            {it ? 'Guida alle taglie' : 'Size guide'}
          </Link>
        </p>
        <p>
          <Link href={`/${locale}/shipping-returns`} className="underline hover:text-ink">
            {it ? 'Spedizioni e resi' : 'Shipping & returns'}
          </Link>
        </p>
      </div>
    </div>
  );
}
