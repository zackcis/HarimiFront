import type { ProductDetail } from '@/lib/types';

export type ProductImage = ProductDetail['images'][number];

/**
 * Prefer images tagged for the selected color; else shared (untagged); else all.
 */
export function imagesForColor(
  images: ProductImage[],
  colorKey: string | null | undefined,
): ProductImage[] {
  if (!images.length) return [];

  const key = colorKey?.trim() ? colorKey.trim().toLowerCase() : null;
  if (key) {
    const matched = images.filter(
      (img) => (img.color_key ?? '').trim().toLowerCase() === key,
    );
    if (matched.length > 0) return matched;
  }

  const shared = images.filter((img) => !(img.color_key ?? '').trim());
  if (shared.length > 0) return shared;

  return images;
}

export function primaryImageUrlForColor(
  images: ProductImage[],
  colorKey: string | null | undefined,
): string | null {
  const list = imagesForColor(images, colorKey);
  const primary = list.find((i) => i.is_primary && i.url) ?? list.find((i) => i.url);
  return primary?.url ?? null;
}
