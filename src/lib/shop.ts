import type { CategoryNode } from '@/lib/types';

export type CategoryLookup = {
  node: CategoryNode;
  /** Ancestors from the searched root down to the node's direct parent. */
  ancestors: CategoryNode[];
};

/** Depth-first lookup of a category slug anywhere in a subtree. */
export function findCategoryInTree(
  root: CategoryNode,
  slug: string,
): CategoryLookup | null {
  if (root.slug === slug) return { node: root, ancestors: [] };
  for (const child of root.children ?? []) {
    const found = findCategoryInTree(child, slug);
    if (found) return { node: found.node, ancestors: [root, ...found.ancestors] };
  }
  return null;
}

export type ShopFacets = {
  sizes: string[];
  colors: Array<{ name: string; hex: string | null }>;
  brands: Array<{ slug: string; name: string }>;
  categories: Array<{ slug: string; count: number }>;
};

export type ShopQuery = {
  q?: string;
  brand?: string;
  category?: string;
  shelf?: string;
  sort?: string;
  size?: string;
  color?: string;
  page?: string;
};

export function buildShopHref(
  locale: string,
  audience: string,
  query: ShopQuery,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value) params.set(key, value);
  }
  const qs = params.toString();
  return `/${locale}/${audience}/shop${qs ? `?${qs}` : ''}`;
}

export function withShopQuery(
  base: ShopQuery,
  patch: Partial<ShopQuery>,
  unset: Array<keyof ShopQuery> = [],
): ShopQuery {
  const next: ShopQuery = { ...base, ...patch };
  for (const key of unset) {
    delete next[key];
  }
  // Changing filters resets page
  if (!('page' in patch)) {
    delete next.page;
  }
  return next;
}
