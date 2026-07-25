'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useCart } from '@/lib/cart';
import type { Locale, ProductDetail } from '@/lib/types';

export function AddToCartButton({
  product,
  locale,
}: {
  product: ProductDetail;
  locale: Locale;
}) {
  const { addItem } = useCart();
  const it = locale === 'it';
  const inStockVariants = useMemo(
    () => product.variants.filter((v) => v.in_stock),
    [product.variants],
  );
  const [variantId, setVariantId] = useState<number | ''>(
    inStockVariants[0]?.id ?? '',
  );
  const [message, setMessage] = useState('');
  const [justAdded, setJustAdded] = useState(false);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (addedTimer.current) clearTimeout(addedTimer.current);
    },
    [],
  );

  const selected = product.variants.find((v) => v.id === variantId);

  const onAdd = () => {
    if (!selected) return;
    addItem({
      variantId: selected.id,
      productId: product.id,
      productSlug: product.slug,
      title: product.title,
      size: selected.size,
      color: selected.color,
      colorHex: selected.color_hex,
      unitPrice: selected.price,
      imageUrl: product.images.find((i) => i.is_primary)?.url ?? product.images[0]?.url ?? null,
    });
    setJustAdded(true);
    setMessage(it ? 'Aggiunto al carrello' : 'Added to bag');
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setJustAdded(false), 2000);
  };

  if (!inStockVariants.length) {
    return (
      <p className="text-sm text-muted">
        {it ? 'Prodotto esaurito' : 'Sold out'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-xs tracking-[0.16em] text-muted uppercase">
        {it ? 'Variante' : 'Variant'}
        <select
          className="mt-2 block h-11 w-full border border-line bg-transparent px-3 text-sm text-ink"
          value={variantId}
          onChange={(e) => setVariantId(Number(e.target.value))}
        >
          {inStockVariants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {[variant.color, variant.size].filter(Boolean).join(' / ') || `#${variant.id}`}
              {` — ${variant.price} €`}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        onClick={onAdd}
        className={`h-12 w-full text-xs tracking-[0.2em] uppercase transition-[opacity,background-color,color] duration-(--dur-base)${
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
            ? 'Aggiungi al carrello'
            : 'Add to bag'}
      </button>
      {message ? (
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
          <span>{message}</span>
          <Link
            href={`/${locale}/cart`}
            className="underline underline-offset-4 transition-colors duration-(--dur-fast) hover:text-ink"
          >
            {it ? 'Vedi la borsa' : 'View bag'}
          </Link>
        </p>
      ) : null}
    </div>
  );
}
