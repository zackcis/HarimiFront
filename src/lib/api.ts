import type {
  Audience,
  Brand,
  CategoryNode,
  CheckoutOrder,
  CheckoutPreview,
  Locale,
  ProductCard,
  ProductDetail,
} from '@/lib/types';

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ||
  'http://127.0.0.1:8000/api/v1';

/** Fail fast when Laravel is down — never hang SSR until the laptop OOM-kills. */
const FETCH_TIMEOUT_MS = 8_000;

type ApiList<T> = { data: T; meta?: Record<string, unknown> };

function unwrapProductList(value: unknown): ProductCard[] {
  if (Array.isArray(value)) {
    return value as ProductCard[];
  }
  if (
    value &&
    typeof value === 'object' &&
    Array.isArray((value as { data?: unknown }).data)
  ) {
    return (value as { data: ProductCard[] }).data;
  }
  return [];
}

function apiSignal(ms = FETCH_TIMEOUT_MS): AbortSignal {
  return AbortSignal.timeout(ms);
}

async function apiGet<T>(path: string, locale: Locale, query: Record<string, string | undefined> = {}): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set('locale', locale);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
    signal: apiSignal(),
    next: { revalidate: 30 },
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: ${path}`);
  }

  return res.json() as Promise<T>;
}

async function apiPost<T>(path: string, locale: Locale, body: unknown): Promise<{ status: number; json: T }> {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set('locale', locale);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: apiSignal(15_000),
  });

  const json = (await res.json()) as T;
  return { status: res.status, json };
}

export type CategoryDetail = {
  id: number;
  slug: string;
  name: string;
  parent: { slug: string; name: string } | null;
  image_url: string | null;
  hero_url?: string | null;
  children: Array<{
    slug: string;
    name: string;
    image_url: string | null;
    hero_url?: string | null;
  }>;
};

export type SiteMediaSlot = {
  welcome: string | null;
  home_still: string | null;
  home_video_mp4: string | null;
  home_video_webm: string | null;
  new_arrivals_still: string | null;
  instagram_1: string | null;
  instagram_2: string | null;
  instagram_3: string | null;
  instagram_4: string | null;
  instagram_5: string | null;
  instagram_6: string | null;
};

export const EMPTY_SITE_MEDIA_SLOT: SiteMediaSlot = {
  welcome: null,
  home_still: null,
  home_video_mp4: null,
  home_video_webm: null,
  new_arrivals_still: null,
  instagram_1: null,
  instagram_2: null,
  instagram_3: null,
  instagram_4: null,
  instagram_5: null,
  instagram_6: null,
};

export type SiteMediaMap = Record<'women' | 'men' | 'kids', SiteMediaSlot>;

export function instagramCollageFromSlot(slot: SiteMediaSlot): (string | null)[] {
  return [
    slot.instagram_1,
    slot.instagram_2,
    slot.instagram_3,
    slot.instagram_4,
    slot.instagram_5,
    slot.instagram_6,
  ];
}

export type MerchandisingResult = {
  shelves: Record<string, ProductCard[]>;
  titles: Record<string, string>;
};

export async function fetchCategories(locale: Locale): Promise<CategoryNode[]> {
  const url = new URL(`${API_BASE}/categories`);
  url.searchParams.set('locale', locale);
  const res = await fetch(url.toString(), {
    signal: apiSignal(),
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`API ${res.status}: /categories`);
  }
  const json = (await res.json()) as ApiList<CategoryNode[]>;
  return json.data ?? [];
}

export async function fetchCategory(locale: Locale, slug: string): Promise<CategoryDetail> {
  const json = await apiGet<{ data: CategoryDetail }>(
    `/categories/${encodeURIComponent(slug)}`,
    locale,
  );
  return json.data;
}

export async function fetchBrand(locale: Locale, slug: string): Promise<Brand> {
  const json = await apiGet<{ data: Brand }>(`/brands/${encodeURIComponent(slug)}`, locale);
  return json.data;
}

export async function fetchBrands(locale: Locale): Promise<Brand[]> {
  const json = await apiGet<ApiList<Brand[]>>('/brands', locale);
  return json.data ?? [];
}

export type SearchCategoryHit = {
  id: number;
  slug: string;
  name: string;
  audience: Audience;
  image_url: string | null;
};

export type SearchBrandHit = {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
};

export type SearchProductHit = ProductCard & {
  audience: Audience | null;
};

export type SearchResult = {
  categories: SearchCategoryHit[];
  brands: SearchBrandHit[];
  products: SearchProductHit[];
};

export async function fetchSearch(locale: Locale, q: string): Promise<SearchResult> {
  const json = await apiGet<ApiList<SearchResult>>('/search', locale, { q });
  return {
    categories: json.data?.categories ?? [],
    brands: json.data?.brands ?? [],
    products: json.data?.products ?? [],
  };
}

export async function fetchProducts(
  locale: Locale,
  query: {
    category?: string;
    brand?: string;
    q?: string;
    in_stock?: string;
    sort?: string;
    page?: string;
    size?: string;
    color?: string;
    per_page?: string;
  } = {},
): Promise<{
  data: ProductCard[];
  meta?: {
    locale?: string;
    sort?: string;
    current_page?: number;
    last_page?: number;
    per_page?: number;
    total?: number;
    facets?: {
      sizes: string[];
      colors: Array<{ name: string; hex: string | null }>;
      brands: Array<{ slug: string; name: string }>;
      categories: Array<{ slug: string; count: number }>;
    };
    [key: string]: unknown;
  };
}> {
  const json = await apiGet<
    ApiList<ProductCard[]> & {
      meta?: {
        locale?: string;
        sort?: string;
        current_page?: number;
        last_page?: number;
        per_page?: number;
        total?: number;
        facets?: {
          sizes: string[];
          colors: Array<{ name: string; hex: string | null }>;
          brands: Array<{ slug: string; name: string }>;
          categories: Array<{ slug: string; count: number }>;
        };
      };
    }
  >('/products', locale, query);
  return { data: unwrapProductList(json.data ?? json), meta: json.meta };
}

export async function fetchProduct(locale: Locale, slug: string): Promise<ProductDetail> {
  const json = await apiGet<{ data: ProductDetail }>(`/products/${encodeURIComponent(slug)}`, locale);
  return json.data;
}

export async function fetchMerchandising(locale: Locale): Promise<MerchandisingResult> {
  const json = await apiGet<
    ApiList<Record<string, unknown>> & {
      meta?: { sections?: Record<string, { title?: string }> };
    }
  >('/merchandising', locale);
  const raw = json.data ?? {};
  const shelves: Record<string, ProductCard[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    shelves[key] = unwrapProductList(value);
  }
  const titles: Record<string, string> = {};
  const sections = json.meta?.sections ?? {};
  for (const [key, section] of Object.entries(sections)) {
    if (section?.title) {
      titles[key] = section.title;
    }
  }
  return { shelves, titles };
}

export async function fetchMerchandisingShelf(locale: Locale, shelf: string): Promise<ProductCard[]> {
  const json = await apiGet<ApiList<unknown>>(`/merchandising/${shelf}`, locale);
  return unwrapProductList(json.data);
}

export async function fetchSiteMedia(locale: Locale): Promise<SiteMediaMap> {
  const empty = EMPTY_SITE_MEDIA_SLOT;
  try {
    const json = await apiGet<ApiList<Partial<SiteMediaMap>>>('/site-media', locale);
    const data = json.data ?? {};
    return {
      women: { ...empty, ...(data.women ?? {}) },
      men: { ...empty, ...(data.men ?? {}) },
      kids: { ...empty, ...(data.kids ?? {}) },
    };
  } catch {
    return { women: { ...empty }, men: { ...empty }, kids: { ...empty } };
  }
}

export async function previewCheckout(
  locale: Locale,
  items: Array<{ variant_id: number; quantity: number }>,
): Promise<{ status: number; data: CheckoutPreview }> {
  const { status, json } = await apiPost<{ data: CheckoutPreview }>('/checkout/preview', locale, { items });
  return { status, data: json.data };
}

export async function placeOrder(
  locale: Locale,
  body: Record<string, unknown>,
): Promise<{ status: number; data?: CheckoutOrder; errors?: unknown }> {
  const { status, json } = await apiPost<{ data?: CheckoutOrder; message?: string; errors?: unknown }>(
    '/checkout/orders',
    locale,
    body,
  );
  return { status, data: json.data, errors: json.errors ?? json };
}

export async function fetchOrder(
  locale: Locale,
  reference: string,
  token: string,
): Promise<CheckoutOrder> {
  const json = await apiGet<{ data: CheckoutOrder }>(
    `/checkout/orders/${reference}`,
    locale,
    { token },
  );
  return json.data;
}

/** Uncached order fetch for confirmation polling (client or server). */
export async function fetchOrderLive(
  locale: Locale,
  reference: string,
  token: string,
): Promise<CheckoutOrder> {
  const url = new URL(`${API_BASE}/checkout/orders/${encodeURIComponent(reference)}`);
  url.searchParams.set('locale', locale);
  url.searchParams.set('token', token);

  const res = await fetch(url.toString(), {
    method: 'GET',
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: apiSignal(),
  });

  if (!res.ok) {
    throw new Error(`API ${res.status}: /checkout/orders/${reference}`);
  }

  const json = (await res.json()) as { data: CheckoutOrder };
  return json.data;
}

export function formatEur(value: string | number | null | undefined, locale: Locale = 'it'): string {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0);
  return new Intl.NumberFormat(locale === 'it' ? 'it-IT' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
  }).format(Number.isFinite(amount) ? amount : 0);
}
