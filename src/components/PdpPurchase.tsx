'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { ProductBuyBox } from '@/components/ProductBuyBox';
import { ProductGallery } from '@/components/ProductGallery';
import { imagesForColor } from '@/lib/product-images';
import type { Locale, ProductDetail } from '@/lib/types';

function defaultColorKey(product: ProductDetail): string | null {
  const colors = new Map<string, { name: string; key: string | null }>();
  for (const v of product.variants) {
    if (!v.color) continue;
    if (!colors.has(v.color)) {
      colors.set(v.color, { name: v.color, key: v.color_key ?? v.color });
    }
  }
  const list = [...colors.values()];
  const inStock = list.find((c) =>
    product.variants.some(
      (v) => v.color === c.name && v.in_stock,
    ),
  );
  return (inStock ?? list[0])?.key ?? null;
}

export function PdpPurchase({
  product,
  locale,
  afterBuyBox,
}: {
  product: ProductDetail;
  locale: Locale;
  afterBuyBox?: ReactNode;
}) {
  const [colorKey, setColorKey] = useState<string | null>(() => defaultColorKey(product));

  const galleryImages = useMemo(
    () => imagesForColor(product.images, colorKey),
    [product.images, colorKey],
  );

  return (
    <div className="container-wide grid gap-8 py-6 md:grid-cols-[minmax(0,1.75fr)_minmax(280px,0.85fr)] md:items-start md:gap-10 md:py-10 lg:gap-14">
      <div className="min-w-0 md:sticky md:top-[calc(var(--header-h)+1.5rem)] md:self-start">
        <ProductGallery
          key={colorKey ?? 'all'}
          images={galleryImages}
          title={product.title}
        />
      </div>

      <div className="min-w-0 md:max-w-md md:justify-self-stretch lg:max-w-none">
        <ProductBuyBox
          product={product}
          locale={locale}
          selectedColorKey={colorKey}
          onColorKeyChange={setColorKey}
        />
        {afterBuyBox}
      </div>
    </div>
  );
}
