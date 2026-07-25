'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname, useSearchParams } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { MiniCart } from '@/components/MiniCart';
import { audienceLabel } from '@/lib/i18n';
import {
  categoryLandingHref,
  categoryShopHref,
  navCopy,
  offersHref,
  shopHref,
} from '@/lib/nav';
import type { Audience, Brand, CategoryNode, Locale } from '@/lib/types';

type Panel = 'women' | 'men' | 'brands' | 'search' | 'mobile' | null;

type DrawerFrame =
  | { kind: 'root' }
  | { kind: 'audience'; audience: Audience; root: CategoryNode; label: string }
  | { kind: 'category'; audience: Audience; node: CategoryNode };

const WOMEN_ORDER = ['bras', 'knickers', 'lingerie', 'knitwear', 'nightwear'];
const MEN_ORDER = ['boxers', 'briefs', 'tops', 'easywear', 'socks', 'swimsuits'];
const KIDS_ORDER = ['kids-underwear', 'kids-undershirts', 'kids-pyjamas', 'kids-socks'];

function orderForAudience(audience: Audience): string[] {
  if (audience === 'women') return WOMEN_ORDER;
  if (audience === 'men') return MEN_ORDER;
  return KIDS_ORDER;
}

function sortChildren(audience: Audience, children: CategoryNode[]): CategoryNode[] {
  const order = orderForAudience(audience);
  return [...children].sort((a, b) => {
    const ai = order.indexOf(a.slug);
    const bi = order.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

/** Locale segment is parts[0]; audience lives at parts[1] on shop/home routes. */
function audienceFromPath(pathname: string): Audience | null {
  const segment = pathname.split('/').filter(Boolean)[1];
  if (segment === 'kids' || segment === 'men' || segment === 'women') {
    return segment;
  }
  return null;
}

export function SiteHeader({
  locale,
  audience: audienceProp,
  categories,
  brands,
}: {
  locale: Locale;
  audience?: Audience;
  categories: CategoryNode[];
  brands: Brand[];
}) {
  const pathname = usePathname() || '';
  const searchParams = useSearchParams();
  // Prefer URL path so search/offers stay on kids/men when browsing those worlds.
  // Locale layout used to always pass audience="women", which hid pathname.
  const audience = audienceFromPath(pathname) ?? audienceProp ?? 'women';
  const { count, ready: cartReady, openMiniCart } = useCart();
  const copy = navCopy(locale);
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');
  const [bagPulse, setBagPulse] = useState(false);
  const prevBagCount = useRef<number | null>(null);

  const openBag = () => {
    setPanel(null);
    openMiniCart();
  };

  useEffect(() => {
    if (!cartReady) return;
    if (prevBagCount.current === null) {
      prevBagCount.current = count;
      return;
    }
    if (count > prevBagCount.current) {
      setBagPulse(true);
      const timer = window.setTimeout(() => setBagPulse(false), 520);
      prevBagCount.current = count;
      return () => window.clearTimeout(timer);
    }
    prevBagCount.current = count;
  }, [count, cartReady]);

  const womenRoot = useMemo(
    () => categories.find((c) => c.slug === 'women'),
    [categories],
  );
  const menRoot = useMemo(
    () => categories.find((c) => c.slug === 'men'),
    [categories],
  );

  const otherLocale: Locale = locale === 'it' ? 'en' : 'it';
  const otherLocaleHref = useMemo(() => {
    const swapped =
      pathname.replace(/^\/(it|en)(?=\/|$)/, `/${otherLocale}`) || `/${otherLocale}`;
    const qs = searchParams.toString();
    return qs ? `${swapped}?${qs}` : swapped;
  }, [pathname, otherLocale, searchParams]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanel(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    window.location.href = shopHref(locale, audience, q ? { q } : {});
  };

  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const open = (next: Panel) => {
    cancelClose();
    setPanel(next);
  };

  const close = () => {
    cancelClose();
    setPanel(null);
  };

  // Grace period so moving the cursor from a nav link into the open panel
  // (crossing the header's border gap) does not immediately close it.
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setPanel(null), 150);
  };

  useEffect(() => () => cancelClose(), []);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-ivory/95 backdrop-blur-md">
      <div className="container-wide grid h-[var(--header-h)] grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center">
          <button
            type="button"
          className="eyebrow tap -ml-2 inline-flex items-center justify-center px-2 text-muted transition-colors duration-(--dur-fast) hover:text-ink md:hidden"
            onClick={() => open(panel === 'mobile' ? null : 'mobile')}
            aria-expanded={panel === 'mobile'}
          >
            {copy.menu}
          </button>

          <nav
            className="hidden items-center gap-5 md:flex lg:gap-7"
            onMouseLeave={scheduleClose}
            onMouseEnter={cancelClose}
          >
            <NavTrigger
              label={copy.women}
              active={panel === 'women'}
              onEnter={() => open('women')}
              href={`/${locale}/women`}
            />
            <NavTrigger
              label={copy.men}
              active={panel === 'men'}
              onEnter={() => open('men')}
              href={`/${locale}/men`}
            />
            <Link
              href={`/${locale}/kids`}
              className="nav-link-underline eyebrow text-ink"
              onMouseEnter={close}
            >
              {copy.kids}
            </Link>
            <NavTrigger
              label={copy.brands}
              active={panel === 'brands'}
              onEnter={() => open('brands')}
              href={`/${locale}/brands`}
            />
            <Link
              href={offersHref(locale, audience)}
              className="nav-link-underline eyebrow text-ink"
              onMouseEnter={close}
            >
              {copy.offers}
            </Link>
          </nav>
        </div>

        <Link
          href={`/${locale}/${audience}`}
          className="justify-self-center text-center"
          onMouseEnter={close}
        >
          <span className="harimi-mark text-sm md:text-base">HARIMI</span>
          <span className="harimi-rule mx-auto" />
        </Link>

        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            type="button"
            className="eyebrow tap hidden items-center justify-center px-2 text-muted transition hover:text-ink md:inline-flex"
            onClick={() => open(panel === 'search' ? null : 'search')}
            aria-expanded={panel === 'search'}
          >
            {copy.search}
          </button>
          <Link
            href={otherLocaleHref}
            className="eyebrow tap inline-flex items-center justify-center px-2 text-muted transition hover:text-ink"
          >
            {otherLocale.toUpperCase()}
          </Link>
          <button
            type="button"
            onClick={openBag}
            className={`eyebrow tap inline-flex items-center justify-center px-2 transition hover:text-muted${
              bagPulse ? ' bag-pulse' : ''
            }`}
            aria-haspopup="dialog"
          >
            {copy.bag}
            {count > 0 ? ` (${count})` : ''}
          </button>
        </div>
      </div>

      {panel === 'women' || panel === 'men' ? (
        <MegaCategoryPanel
          key={panel}
          locale={locale}
          audience={panel}
          root={panel === 'women' ? womenRoot : menRoot}
          copy={copy}
          onClose={close}
          onHoverEnter={cancelClose}
          onHoverLeave={scheduleClose}
        />
      ) : null}

      {panel === 'brands' ? (
        <div
          className="mega-enter absolute inset-x-0 top-full border-b border-line bg-ivory shadow-[0_24px_48px_rgba(20,20,20,0.06)]"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="container-wide grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="eyebrow text-muted">{copy.brands}</p>
              <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-4 md:grid-cols-3">
                {brands.slice(0, 12).map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/${locale}/brands/${brand.slug}`}
                    className="nav-link-underline w-fit text-sm tracking-[0.06em]"
                    onClick={close}
                  >
                    {brand.name}
                  </Link>
                ))}
              </div>
              <Link
                href={`/${locale}/brands`}
                className="eyebrow mt-10 inline-flex items-center underline underline-offset-4"
                onClick={close}
              >
                {copy.allBrands}
              </Link>
            </div>
            <div className="hidden min-h-[220px] items-center justify-center bg-ivory-2 px-8 text-center md:flex">
              <p className="font-serif text-3xl text-ink/80">
                {locale === 'it'
                  ? 'I marchi che amiamo, in un solo posto.'
                  : 'The brands we love, in one place.'}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {panel === 'search' ? (
        <div className="mega-enter absolute inset-x-0 top-full border-b border-line bg-ivory px-6 py-6 md:px-10">
          <form onSubmit={onSearch} className="container-wide flex gap-3">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="h-12 flex-1 border-b border-ink bg-transparent text-sm outline-none placeholder:text-muted"
            />
            <button
              type="submit"
              className="text-[11px] tracking-[0.18em] uppercase"
            >
              {copy.search}
            </button>
          </form>
        </div>
      ) : null}

      {panel === 'mobile' ? (
        <MobileDrawer
          locale={locale}
          audience={audience}
          womenRoot={womenRoot}
          menRoot={menRoot}
          brands={brands}
          copy={copy}
          onClose={close}
          onOpenBag={() => {
            close();
            openMiniCart();
          }}
          onSearch={(q) => {
            window.location.href = shopHref(locale, audience, q ? { q } : {});
          }}
        />
      ) : null}

      <MiniCart locale={locale} />

      {panel && panel !== 'mobile' ? (
        <button
          type="button"
          className="fixed inset-0 top-[var(--header-h)] z-[-1] cursor-default bg-ink/10"
          aria-label={copy.close}
          onClick={close}
        />
      ) : null}
    </header>
  );
}

function NavTrigger({
  label,
  href,
  active,
  onEnter,
}: {
  label: string;
  href: string;
  active: boolean;
  onEnter: () => void;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'true' : undefined}
      className="nav-link-underline eyebrow text-ink"
      onMouseEnter={onEnter}
      onFocus={onEnter}
    >
      {label}
    </Link>
  );
}

function MegaCategoryPanel({
  locale,
  audience,
  root,
  copy,
  onClose,
  onHoverEnter,
  onHoverLeave,
}: {
  locale: Locale;
  audience: Audience;
  root?: CategoryNode;
  copy: ReturnType<typeof navCopy>;
  onClose: () => void;
  onHoverEnter?: () => void;
  onHoverLeave?: () => void;
}) {
  const parents = sortChildren(audience, root?.children ?? []);
  const [activeId, setActiveId] = useState<number | null>(() => parents[0]?.id ?? null);
  const activeParent = parents.find((p) => p.id === activeId) ?? parents[0] ?? null;
  const subtypes = activeParent?.children ?? [];
  const featuredUrl = activeParent?.image_url || root?.image_url;

  return (
    <div
      className="mega-enter absolute inset-x-0 top-full border-b border-line bg-ivory shadow-[0_24px_48px_rgba(20,20,20,0.06)]"
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      <div className="container-wide grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,0.95fr)]">
        {/* Col 1 — parent categories */}
        <div className="border-line py-10 md:border-r md:pr-8 md:py-12">
          <p className="eyebrow text-muted">{audienceLabel(audience, locale)}</p>
          <ul className="mt-6 max-h-[min(58vh,420px)] space-y-1 overflow-y-auto">
            {parents.map((parent) => {
              const active = parent.id === activeParent?.id;
              return (
                <li key={parent.id}>
                  <button
                    type="button"
                    className={`flex w-full cursor-pointer items-center justify-between gap-3 py-2.5 text-left font-serif text-xl transition md:text-2xl ${
                      active ? 'text-ink' : 'text-ink/55 hover:text-ink'
                    }`}
                    onMouseEnter={() => setActiveId(parent.id)}
                    onFocus={() => setActiveId(parent.id)}
                  >
                    <span>{parent.name}</span>
                    {active ? (
                      <span aria-hidden className="text-sm text-muted">
                        →
                      </span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            href={shopHref(locale, audience, { category: root?.slug })}
            className="eyebrow mt-8 inline-flex items-center underline underline-offset-4"
            onClick={onClose}
          >
            {copy.shopAll}
          </Link>
        </div>

        {/* Col 2 — subtypes for hovered parent */}
        <div className="border-line py-10 md:border-r md:px-8 md:py-12">
          {activeParent ? (
            <>
              <p className="eyebrow text-muted">{copy.type}</p>
              <ul className="mt-6 max-h-[min(58vh,420px)] space-y-3 overflow-y-auto">
                <li>
                  <Link
                    href={categoryShopHref(locale, audience, activeParent.slug)}
                    className="block text-sm tracking-[0.04em] text-ink transition hover:text-muted"
                    onClick={onClose}
                  >
                    {copy.viewAll}
                  </Link>
                </li>
                {subtypes.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={categoryShopHref(locale, audience, child.slug)}
                      className="block text-sm tracking-[0.04em] text-ink/80 transition hover:text-ink"
                      onClick={onClose}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>

        {/* Col 3 — featured visual */}
        <div className="hidden py-10 pl-8 md:block md:py-12">
          {activeParent ? (
            <Link
              href={categoryShopHref(locale, audience, activeParent.slug)}
              className="group relative flex min-h-[260px] flex-col justify-end overflow-hidden bg-ivory-2"
              onClick={onClose}
            >
              {featuredUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featuredUrl}
                  alt=""
                  className="img-zoom absolute inset-0 h-full w-full object-cover object-[center_18%]"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/20 to-transparent" />
              <span className="relative z-10 flex items-center justify-between gap-3 p-5 font-serif text-2xl text-ivory">
                {activeParent.name}
                <span aria-hidden>→</span>
              </span>
            </Link>
          ) : (
            <div className="flex min-h-[260px] items-center justify-center bg-ivory-2 px-8 text-center">
              <p className="font-serif text-3xl text-ink/80">
                {locale === 'it'
                  ? 'Selezione curata, ogni giorno.'
                  : 'Curated selection, every day.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MobileDrawer({
  locale,
  audience,
  womenRoot,
  menRoot,
  brands,
  copy,
  onClose,
  onOpenBag,
  onSearch,
}: {
  locale: Locale;
  audience: Audience;
  womenRoot?: CategoryNode;
  menRoot?: CategoryNode;
  brands: Brand[];
  copy: ReturnType<typeof navCopy>;
  onClose: () => void;
  onOpenBag: () => void;
  onSearch: (q: string) => void;
}) {
  const [q, setQ] = useState('');
  const [stack, setStack] = useState<DrawerFrame[]>([{ kind: 'root' }]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const depth = stack.length - 1;
  const current = stack[stack.length - 1];

  const title =
    current.kind === 'root'
      ? 'HARIMI'
      : current.kind === 'audience'
        ? current.label
        : current.node.name;

  const push = (frame: DrawerFrame) => setStack((s) => [...s, frame]);
  const back = () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s));

  const openAudience = (key: Audience, root: CategoryNode | undefined, label: string) => {
    if (!root?.children?.length) {
      window.location.href = `/${locale}/${key}`;
      return;
    }
    push({ kind: 'audience', audience: key, root, label });
  };

  const openCategory = (aud: Audience, node: CategoryNode) => {
    if (node.children?.length) {
      push({ kind: 'category', audience: aud, node });
      return;
    }
    window.location.href = categoryLandingHref(locale, aud, node.slug);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={copy.menu}
      className="fixed inset-0 z-100 flex flex-col bg-ivory text-ink md:hidden"
    >
      <div className="relative flex h-(--header-h) shrink-0 items-center justify-center border-b border-line bg-ivory px-5">
        {depth > 0 ? (
          <button
            type="button"
            className="eyebrow tap absolute left-3 inline-flex cursor-pointer items-center justify-center px-2"
            onClick={back}
            aria-label={copy.back}
          >
            ←
          </button>
        ) : (
          <span className="harimi-mark absolute left-5 text-sm">HARIMI</span>
        )}
        <span className={depth > 0 ? 'font-serif text-lg' : 'sr-only'}>{title}</span>
        <button
          type="button"
          className="eyebrow tap absolute right-3 inline-flex items-center justify-center px-2"
          onClick={onClose}
        >
          {copy.close}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <div
          className="drawer-track"
          style={{ transform: `translateX(-${depth * 100}%)` }}
        >
          {/* Root */}
          <div className="drawer-pane px-5 py-8">
            <form
              className="mb-10 flex gap-2 border-b border-ink pb-3"
              onSubmit={(e) => {
                e.preventDefault();
                onSearch(q.trim());
              }}
            >
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={copy.searchPlaceholder}
                className="h-11 flex-1 bg-transparent text-base text-ink outline-none placeholder:text-muted"
              />
              <button type="submit" className="eyebrow tap inline-flex items-center px-2">
                {copy.search}
              </button>
            </form>

            <div className="space-y-1 border-b border-line pb-4">
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between py-3 font-serif text-3xl"
                onClick={() => openAudience('women', womenRoot, copy.women)}
              >
                {copy.women}
                <span aria-hidden className="text-sm text-muted">
                  →
                </span>
              </button>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between py-3 font-serif text-3xl"
                onClick={() => openAudience('men', menRoot, copy.men)}
              >
                {copy.men}
                <span aria-hidden className="text-sm text-muted">
                  →
                </span>
              </button>
            </div>

            <div className="space-y-4 py-6">
              <Link href={`/${locale}/kids`} className="block font-serif text-2xl" onClick={onClose}>
                {copy.kids}
              </Link>
              <Link href={`/${locale}/brands`} className="block font-serif text-2xl" onClick={onClose}>
                {copy.brands}
              </Link>
              <Link
                href={offersHref(locale, audience)}
                className="block font-serif text-2xl"
                onClick={onClose}
              >
                {copy.offers}
              </Link>
              <button
                type="button"
                className="block w-full text-left font-serif text-2xl"
                onClick={onOpenBag}
              >
                {copy.bag}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4">
              {brands.slice(0, 6).map((b) => (
                <Link
                  key={b.id}
                  href={`/${locale}/brands/${b.slug}`}
                  className="border border-line px-3 py-4 text-center text-[11px] tracking-[0.14em] uppercase"
                  onClick={onClose}
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Audience + category panes — render stacked frames after root */}
          {stack.slice(1).map((frame, i) => {
            if (frame.kind === 'audience') {
              const kids = sortChildren(frame.audience, frame.root.children ?? []);
              return (
                <div key={`aud-${frame.audience}-${i}`} className="drawer-pane px-5 py-8">
                  <ul className="space-y-1">
                    {kids.map((child) => {
                      const hasKids = Boolean(child.children?.length);
                      if (hasKids) {
                        return (
                          <li key={child.id}>
                            <button
                              type="button"
                              className="flex w-full cursor-pointer items-center justify-between border-b border-line py-4 text-left font-serif text-2xl"
                              onClick={() => openCategory(frame.audience, child)}
                            >
                              {child.name}
                              <span aria-hidden className="text-sm text-muted">
                                →
                              </span>
                            </button>
                          </li>
                        );
                      }
                      return (
                        <li key={child.id}>
                          <Link
                            href={categoryLandingHref(locale, frame.audience, child.slug)}
                            className="block border-b border-line py-4 font-serif text-2xl"
                            onClick={onClose}
                          >
                            {child.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                  <Link
                    href={`/${locale}/${frame.audience}`}
                    className="eyebrow mt-8 inline-flex underline underline-offset-4"
                    onClick={onClose}
                  >
                    Home {frame.label}
                  </Link>
                </div>
              );
            }

            // category subtypes
            const types = frame.node.children ?? [];
            return (
              <div key={`cat-${frame.node.id}-${i}`} className="drawer-pane px-5 py-8">
                <p className="eyebrow text-muted">{copy.type}</p>
                <ul className="mt-4 space-y-1">
                  <li>
                    <Link
                      href={categoryShopHref(locale, frame.audience, frame.node.slug)}
                      className="block border-b border-line py-3.5 text-base"
                      onClick={onClose}
                    >
                      {copy.viewAll}
                    </Link>
                  </li>
                  {types.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={categoryShopHref(locale, frame.audience, child.slug)}
                        className="block border-b border-line py-3.5 text-base text-ink/85"
                        onClick={onClose}
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
