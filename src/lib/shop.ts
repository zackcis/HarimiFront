export type ShopFacets = {
  sizes: string[];
  colors: Array<{ name: string; hex: string | null }>;
  brands: Array<{ slug: string; name: string }>;
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
