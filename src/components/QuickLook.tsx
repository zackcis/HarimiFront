'use client';

import Link from 'next/link';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { formatEur } from '@/lib/api';
import { useCart } from '@/lib/cart';
import { imagesForColor, primaryImageUrlForColor } from '@/lib/product-images';
import type { Locale, ProductDetail } from '@/lib/types';

type QuickLookContextValue = { open: (slug: string, locale: Locale) => void };

const QuickLookContext = createContext<QuickLookContextValue | null>(null);

export function useQuickLook() {
  const ctx = useContext(QuickLookContext);
  if (!ctx) {
    throw new Error('useQuickLook must be used within QuickLookProvider');
  }
  return ctx;
}

export function QuickLookProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<{ slug: string; locale: Locale } | null>(null);
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const openerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((slug: string, locale: Locale) => {
    openerRef.current = (document.activeElement as HTMLElement) ?? null;
    setTarget({ slug, locale });
  }, []);

  const close = useCallback(() => {
    setTarget(null);
    setProduct(null);
    setError(false);
    const opener = openerRef.current;
    if (opener && typeof opener.focus === 'function') {
      requestAnimationFrame(() => opener.focus());
    }
  }, []);

  useEffect(() => {
    if (!target) return;
    let cancelled = false;
    setLoading(true);
    setError(false);
    setProduct(null);
    fetch(`/api/quick-look/${encodeURIComponent(target.slug)}?locale=${target.locale}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('not ok'))))
      .then((data: ProductDetail) => {
        if (!cancelled) setProduct(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [target]);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <QuickLookContext.Provider value={value}>
      {children}
      {target ? (
        <QuickLookModal
          locale={target.locale}
          product={product}
          loading={loading}
          error={error}
          onClose={close}
        />
      ) : null}
    </QuickLookContext.Provider>
  );
}

function QuickLookModal({
  locale,
  product,
  loading,
  error,
  onClose,
}: {
  locale: Locale;
  product: ProductDetail | null;
  loading: boolean;
  error: boolean;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const it = locale === 'it';
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === 'Tab') {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = Array.from(
          root.querySelectorAll<HTMLElement>(
            'a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])',
          ),
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const root = dialogRef.current;
    if (!root) return;
    const focusable = root.querySelector<HTMLElement>('button, a[href], input, select, textarea');
    (focusable ?? root).focus();
  }, [product, loading, error]);

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-80 flex items-end justify-center sm:items-center sm:p-6">
      <div
        className="overlay-enter absolute inset-0 bg-ink/45"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={it ? 'Sguardo rapido' : 'Quick look'}
        tabIndex={-1}
        className="panel-enter relative z-10 w-full max-h-[min(78dvh,640px)] overflow-y-auto overscroll-contain rounded-t-2xl bg-ivory outline-none sm:flex sm:max-h-[min(88vh,900px)] sm:w-[min(920px,92vw)] sm:flex-col sm:overflow-hidden sm:rounded-sm"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        <div className="sticky top-0 z-20 flex items-center justify-center border-b border-line bg-ivory px-4 py-3 sm:static sm:justify-end sm:border-b-0 sm:px-5 sm:py-4">
          <div
            className="absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line sm:hidden"
            aria-hidden
          />
          <p className="eyebrow pt-2 text-muted sm:hidden">
            {it ? 'Sguardo rapido' : 'Quick look'}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label={it ? 'Chiudi' : 'Close'}
            className="eyebrow tap absolute right-3 top-1/2 inline-flex min-h-11 min-w-11 -translate-y-1/2 items-center justify-center text-muted transition hover:text-ink sm:right-4"
          >
            {it ? 'Chiudi' : 'Close'}
          </button>
        </div>

        {loading ? (
          <QuickLookSkeleton />
        ) : error || !product ? (
          <div className="p-8 text-sm text-muted sm:p-10">
            {it ? 'Impossibile caricare il prodotto.' : 'Could not load product.'}
          </div>
        ) : (
          <QuickLookPanel key={product.id} product={product} locale={locale} onClose={onClose} />
        )}
      </div>
    </div>,
    document.body,
  );
}

function QuickLookSkeleton() {
  return (
    <div className="overflow-y-auto sm:grid sm:grid-cols-2">
      <div className="skeleton aspect-[4/5] max-h-[28dvh] w-full sm:aspect-3/4 sm:max-h-none" />
      <div className="space-y-4 p-5 sm:p-8">
        <div className="skeleton h-3 w-24" />
        <div className="skeleton h-8 w-3/4" />
        <div className="skeleton h-4 w-20" />
        <div className="skeleton h-10 w-full" />
        <div className="skeleton h-12 w-full" />
      </div>
    </div>
  );
}

function QuickLookPanel({
  product,
  locale,
  onClose,
}: {
  product: ProductDetail;
  locale: Locale;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const it = locale === 'it';

  const colors = useMemo(() => {
    const map = new Map<string, { name: string; key: string; hex: string | null }>();
    for (const v of product.variants) {
      if (!v.color) continue;
      if (!map.has(v.color)) {
        map.set(v.color, {
          name: v.color,
          key: v.color_key ?? v.color,
          hex: v.color_hex,
        });
      }
    }
    return [...map.values()];
  }, [product.variants]);

  const sizes = useMemo(() => {
    const set = new Set<string>();
    for (const v of product.variants) {
      if (v.size) set.add(v.size);
    }
    return [...set];
  }, [product.variants]);

  const defaultColor =
    colors.find((c) => product.variants.some((v) => v.color === c.name && v.in_stock)) ??
    colors[0] ??
    null;

  const [colorKey, setColorKey] = useState<string | null>(defaultColor?.key ?? null);
  const color =
    colors.find((c) => c.key === colorKey)?.name ?? defaultColor?.name ?? null;

  const images = useMemo(() => {
    const filtered = imagesForColor(product.images, colorKey).filter((i) => i.url);
    return [...filtered].sort((a, b) => a.position - b.position);
  }, [product.images, colorKey]);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    setActiveImg(0);
  }, [colorKey]);

  const [size, setSize] = useState<string | null>(() => {
    const first = product.variants.find(
      (v) => v.in_stock && (!defaultColor || v.color === defaultColor.name),
    );
    return first?.size ?? sizes[0] ?? null;
  });
  const [qty, setQty] = useState(1);

  const selected = useMemo(
    () =>
      product.variants.find(
        (v) => (color ? v.color === color : true) && (size ? v.size === size : true),
      ),
    [product.variants, color, size],
  );

  const sizeAvailable = (s: string) =>
    product.variants.some((v) => v.size === s && (!color || v.color === color) && v.in_stock);

  const maxQty = selected?.in_stock ? Math.min(selected.stock, 10) : 0;
  const anyInStock = product.variants.some((v) => v.in_stock);

  const onSale =
    selected?.compare_at_price != null &&
    Number(selected.compare_at_price) > Number(selected.price);

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
        imageUrl: primaryImageUrlForColor(
          product.images,
          selected.color_key ?? selected.color,
        ),
      },
      qty,
    );
    // Close Quick Look first so Mini Cart is the only overlay on mobile.
    onClose();
  };

  const media = (
    <div className="bg-ivory-2">
      <div className="relative mx-auto aspect-[4/5] max-h-[28dvh] w-full overflow-hidden sm:aspect-3/4 sm:max-h-none sm:h-full sm:min-h-[28rem]">
        {images[activeImg]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={images[activeImg].url ?? ''}
            alt={product.title}
            className="h-full w-full object-cover object-[center_18%]"
          />
        ) : (
          <div className="flex h-full min-h-48 items-center justify-center">
            <span className="harimi-mark text-xs text-muted">HARIMI</span>
          </div>
        )}
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto px-4 py-3 sm:px-3">
          {images.slice(0, 5).map((img, i) => (
            <button
              key={`${img.url}-${i}`}
              type="button"
              onClick={() => setActiveImg(i)}
              aria-label={`${it ? 'Immagine' : 'Image'} ${i + 1}`}
              aria-current={i === activeImg}
              className={`relative aspect-3/4 h-12 w-auto shrink-0 overflow-hidden border sm:h-16 ${
                i === activeImg ? 'border-ink' : 'border-transparent opacity-70'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img.url ?? ''}
                alt=""
                className="h-full w-full object-cover object-[center_18%]"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );

  const details = (
    <div className="space-y-4 px-5 pb-3 pt-3 sm:space-y-6 sm:p-8 sm:pb-6">
      {product.brand?.name ? (
        <p className="eyebrow text-muted">{product.brand.name}</p>
      ) : null}
      <div>
        <h2 className="font-serif text-xl leading-tight sm:text-3xl">{product.title}</h2>
        <p className="mt-1.5 flex items-baseline gap-2 text-base sm:mt-3 sm:text-lg">
          {onSale ? (
            <>
              <span className="text-sale">{formatEur(selected?.price ?? null, locale)}</span>
              <span className="text-sm text-muted line-through sm:text-base">
                {formatEur(selected?.compare_at_price ?? null, locale)}
              </span>
            </>
          ) : (
            <span>
              {selected
                ? formatEur(selected.price, locale)
                : product.variants[0]
                  ? formatEur(product.variants[0].price, locale)
                  : '—'}
            </span>
          )}
        </p>
      </div>

      {!anyInStock ? (
        <p className="text-sm text-muted">{it ? 'Prodotto esaurito' : 'Sold out'}</p>
      ) : (
        <>
          {colors.length > 0 ? (
            <div>
              <p className="eyebrow text-muted">
                {it ? 'Colore' : 'Color'}
                {color ? ` · ${color}` : ''}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {colors.map((c) => {
                  const active = colorKey === c.key || color === c.name;
                  return (
                    <button
                      key={c.key}
                      type="button"
                      aria-label={c.name}
                      aria-pressed={active}
                      onClick={() => {
                        setColorKey(c.key);
                        const nextSize = product.variants.find(
                          (v) => v.color === c.name && v.in_stock,
                        )?.size;
                        if (nextSize) setSize(nextSize);
                        setQty(1);
                      }}
                      className="tap inline-flex items-center justify-center rounded-full"
                    >
                      <span
                        className={`inline-block h-8 w-8 rounded-full border ${
                          active
                            ? 'border-ink ring-2 ring-ink ring-offset-2 ring-offset-background'
                            : 'border-line'
                        }`}
                        style={{ backgroundColor: c.hex || '#ccc' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          ) : null}

          {sizes.length > 0 ? (
            <div>
              <p className="eyebrow text-muted">{it ? 'Taglia' : 'Size'}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const available = sizeAvailable(s);
                  const active = size === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={!available}
                      aria-pressed={active}
                      onClick={() => {
                        setSize(s);
                        setQty(1);
                      }}
                      className={`inline-flex min-h-11 min-w-12 items-center justify-center border px-3 text-sm ${
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
        </>
      )}

      <Link
        href={`/${locale}/p/${product.slug}`}
        onClick={onClose}
        className="eyebrow inline-flex min-h-11 items-center underline underline-offset-4"
      >
        {it ? 'Vedi i dettagli' : 'View full details'}
      </Link>
    </div>
  );

  const buyBar =
    anyInStock ? (
      <div className="border-t border-line bg-ivory px-4 py-3 sm:px-8 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="inline-flex shrink-0 items-center border border-line">
            <button
              type="button"
              className="tap h-11 w-11 text-lg disabled:opacity-40"
              aria-label={it ? 'Diminuisci' : 'Decrease'}
              disabled={qty <= 1}
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </button>
            <span className="w-9 text-center text-sm tabular-nums">{qty}</span>
            <button
              type="button"
              className="tap h-11 w-11 text-lg disabled:opacity-40"
              aria-label={it ? 'Aumenta' : 'Increase'}
              disabled={qty >= maxQty}
              onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={onAdd}
            disabled={!selected?.in_stock || maxQty < 1}
            className="eyebrow h-12 min-w-0 flex-1 bg-ink text-ivory transition hover:opacity-90 disabled:opacity-40"
          >
            {it ? 'Aggiungi alla borsa' : 'Add to bag'}
          </button>
        </div>
      </div>
    ) : null;

  return (
    <>
      {/* Mobile: natural content height — sheet grows with content, scrolls past max-h */}
      <div className="sm:hidden">
        {media}
        {details}
        <div className="sticky bottom-0 z-10">{buyBar}</div>
      </div>

      {/* Desktop: two columns */}
      <div className="hidden min-h-0 flex-1 sm:grid sm:grid-cols-2 sm:overflow-hidden">
        <div className="min-h-0 overflow-y-auto overscroll-contain">{media}</div>
        <div className="flex min-h-0 flex-col overflow-hidden">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{details}</div>
          {buyBar}
        </div>
      </div>
    </>
  );
}

export function QuickLookButton({
  slug,
  locale,
  variant = 'bar',
}: {
  slug: string;
  locale: Locale;
  variant?: 'bar' | 'plus';
}) {
  const { open } = useQuickLook();
  const it = locale === 'it';

  if (variant === 'plus') {
    return (
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          open(slug, locale);
        }}
        aria-label={it ? 'Sguardo rapido' : 'Quick look'}
        className="absolute bottom-3 right-3 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-ivory text-ink shadow-sm transition-[border-color,opacity] duration-(--dur-fast) hover:border-ink hover:opacity-90"
      >
        <span aria-hidden className="text-xl leading-none font-light">
          +
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        open(slug, locale);
      }}
      className="quicklook-trigger absolute inset-x-3 bottom-3 z-10 inline-flex min-h-11 items-center justify-center bg-ivory/95 text-[11px] tracking-[0.18em] text-ink uppercase backdrop-blur-sm transition-[background-color,opacity] duration-(--dur-fast) hover:bg-ivory"
    >
      {it ? 'Sguardo rapido' : 'Quick look'}
    </button>
  );
}
