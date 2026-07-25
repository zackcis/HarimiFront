export type Locale = 'it' | 'en';
export type Audience = 'women' | 'men' | 'kids';

export type ProductCard = {
  id: number;
  slug: string;
  title: string;
  brand: { slug: string; name: string } | null;
  category: { slug: string; name: string } | null;
  primary_image_url: string | null;
  secondary_image_url: string | null;
  price_from: string | null;
  price_to: string | null;
  compare_at_from: string | null;
  currency: string;
  in_stock: boolean;
  colors: Array<{ name: string; hex: string | null }>;
};

export type ProductDetail = {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  fabric: string | null;
  care_notes: string | null;
  fit_notes: string | null;
  brand: { slug: string; name: string; logo_url: string | null } | null;
  category: { slug: string; name: string; path: string[] } | null;
  images: Array<{ url: string | null; is_primary: boolean; position: number }>;
  variants: Array<{
    id: number;
    sku: string | null;
    size: string | null;
    color: string | null;
    color_hex: string | null;
    price: string;
    compare_at_price: string | null;
    currency: string;
    stock: number;
    in_stock: boolean;
  }>;
  complete_the_look?: ProductCard[];
  related?: ProductCard[];
};

export type CategoryNode = {
  id: number;
  slug: string;
  name: string;
  parent_id: number | null;
  image_url: string | null;
  hero_url?: string | null;
  children: CategoryNode[];
};

export type Brand = {
  id: number;
  slug: string;
  name: string;
  logo_url: string | null;
  hero_url?: string | null;
  products_count: number;
};

export type CheckoutPreview = {
  locale: string;
  currency: string;
  items: Array<Record<string, unknown>>;
  subtotal: string;
  shipping_amount: string;
  tax_amount: string;
  total: string;
  prices_include_tax: boolean;
  available: boolean;
  errors: Array<{ variant_id: number; message: string }>;
};

export type CheckoutOrder = {
  reference: string;
  status: string;
  payment_status: string;
  confirmation_token: string;
  total_amount: string;
  currency: string;
  customer: { name: string; email: string; phone: string | null };
  paid_at?: string | null;
  shipped_at?: string | null;
  shipment?: {
    carrier: string | null;
    tracking_number: string | null;
    tracking_url: string | null;
  };
  payment?: {
    mode: string;
    checkout_session_id: string | null;
    checkout_url: string | null;
  };
  items: Array<{
    product_name: string;
    quantity: number;
    unit_price: string;
    line_total: string;
    size: string | null;
    color: string | null;
  }>;
};
