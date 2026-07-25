'use client';

import { useMemo, useState } from 'react';
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
  const inStockVariants = useMemo(
    () => product.variants.filter((v) => v.in_stock),
    [product.variants],
  );
  const [variantId, setVariantId] = useState<number | ''>(
    inStockVariants[0]?.id ?? '',
  );
  const [message, setMessage] = useState('');

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
    setMessage(locale === 'it' ? 'Aggiunto al carrello' : 'Added to bag');
  };

  if (!inStockVariants.length) {
    return (
      <p className="text-sm text-muted">
        {locale === 'it' ? 'Prodotto esaurito' : 'Sold out'}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-xs tracking-[0.16em] text-muted uppercase">
        {locale === 'it' ? 'Variante' : 'Variant'}
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
        className="h-12 w-full bg-ink text-xs tracking-[0.2em] text-ivory uppercase transition-opacity duration-(--dur-base) hover:opacity-90"
      >
        {locale === 'it' ? 'Aggiungi al carrello' : 'Add to bag'}
      </button>
      {message ? <p className="text-sm text-muted">{message}</p> : null}
    </div>
  );
}
