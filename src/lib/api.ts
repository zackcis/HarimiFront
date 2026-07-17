import type {
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

async function apiGet<T>(path: string, locale: Locale, query: Record<string, string | undefined> = {}): Promise<T> {
  const url = new URL(`${API_BASE}${path}`);
  url.searchParams.set('locale', locale);
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, value);
    }
  }

  const res = await fetch(url.toString(), {
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
  children: Array<{ slug: string; name: string; image_url: string | null }>;
};

export async function fetchCategories(locale: Locale): Promise<CategoryNode[]> {
  const json = await apiGet<ApiList<CategoryNode[]>>('/categories', locale);
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
    facets?: {
      sizes: string[];
      colors: Array<{ name: string; hex: string | null }>;
      brands: Array<{ slug: string; name: string }>;
    };
    [key: string]: unknown;
  };
}> {
  const json = await apiGet<
    ApiList<ProductCard[]> & {
      meta?: {
        locale?: string;
        sort?: string;
        facets?: {
          sizes: string[];
          colors: Array<{ name: string; hex: string | null }>;
          brands: Array<{ slug: string; name: string }>;
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

export async function fetchMerchandising(locale: Locale): Promise<Record<string, ProductCard[]>> {
  const json = await apiGet<ApiList<Record<string, unknown>>>('/merchandising', locale);
  const raw = json.data ?? {};
  const out: Record<string, ProductCard[]> = {};
  for (const [key, value] of Object.entries(raw)) {
    out[key] = unwrapProductList(value);
  }
  return out;
}

export async function fetchMerchandisingShelf(locale: Locale, shelf: string): Promise<ProductCard[]> {
  const json = await apiGet<ApiList<unknown>>(`/merchandising/${shelf}`, locale);
  return unwrapProductList(json.data);
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
