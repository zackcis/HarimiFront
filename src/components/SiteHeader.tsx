'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/lib/cart';
import { audienceLabel } from '@/lib/i18n';
import {
  categoryLandingHref,
  navCopy,
  offersHref,
  shopHref,
} from '@/lib/nav';
import type { Audience, Brand, CategoryNode, Locale } from '@/lib/types';

type Panel = 'women' | 'men' | 'brands' | 'search' | 'mobile' | null;

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

function audienceFromPath(pathname: string): Audience {
  if (pathname.includes('/kids')) return 'kids';
  if (pathname.includes('/men')) return 'men';
  return 'women';
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
  const audience = audienceProp ?? audienceFromPath(pathname);
  const { count } = useCart();
  const copy = navCopy(locale);
  const [panel, setPanel] = useState<Panel>(null);
  const [query, setQuery] = useState('');

  const womenRoot = useMemo(
    () => categories.find((c) => c.slug === 'women'),
    [categories],
  );
  const menRoot = useMemo(
    () => categories.find((c) => c.slug === 'men'),
    [categories],
  );

  const otherLocale: Locale = locale === 'it' ? 'en' : 'it';

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
      <div className="container-wide flex h-[var(--header-h)] items-center justify-between gap-4">
        <button
          type="button"
          className="text-[11px] tracking-[0.18em] uppercase text-muted md:hidden"
          onClick={() => open(panel === 'mobile' ? null : 'mobile')}
          aria-expanded={panel === 'mobile'}
        >
          {copy.menu}
        </button>

        <nav
          className="hidden items-center gap-7 md:flex"
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
            className="nav-link-underline text-[11px] tracking-[0.18em] uppercase text-ink"
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
            className="nav-link-underline text-[11px] tracking-[0.18em] uppercase text-ink"
            onMouseEnter={close}
          >
            {copy.offers}
          </Link>
        </nav>

        <Link
          href={`/${locale}/${audience}`}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
          onMouseEnter={close}
        >
          <span className="harimi-mark text-sm md:text-base">HARIMI</span>
          <span className="harimi-rule mx-auto" />
        </Link>

        <div className="flex items-center gap-5 text-[11px] tracking-[0.18em] uppercase">
          <button
            type="button"
            className="hidden text-muted transition hover:text-ink md:inline"
            onClick={() => open(panel === 'search' ? null : 'search')}
            aria-expanded={panel === 'search'}
          >
            {copy.search}
          </button>
          <Link
            href={`/${otherLocale}/${audience}`}
            className="text-muted transition hover:text-ink"
          >
            {otherLocale.toUpperCase()}
          </Link>
          <Link href={`/${locale}/cart`} className="transition hover:text-muted">
            {copy.bag}
            {count > 0 ? ` (${count})` : ''}
          </Link>
        </div>
      </div>

      {panel === 'women' || panel === 'men' ? (
        <MegaCategoryPanel
          locale={locale}
          audience={panel}
          root={panel === 'women' ? womenRoot : menRoot}
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
          <div className="container-wide grid gap-8 py-10 md:grid-cols-[1fr_auto]">
            <div className="grid grid-cols-2 gap-x-8 gap-y-4 md:grid-cols-4">
              {brands.slice(0, 12).map((brand) => (
                <Link
                  key={brand.id}
                  href={`/${locale}/brands/${brand.slug}`}
                  className="text-sm tracking-[0.08em] transition hover:text-muted"
                  onClick={close}
                >
                  {brand.name}
                </Link>
              ))}
            </div>
            <Link
              href={`/${locale}/brands`}
              className="self-end text-[11px] tracking-[0.18em] uppercase underline"
              onClick={close}
            >
              {copy.allBrands}
            </Link>
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
          onSearch={(q) => {
            window.location.href = shopHref(locale, audience, q ? { q } : {});
          }}
        />
      ) : null}

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
      className={`nav-link-underline text-[11px] tracking-[0.18em] uppercase ${
        active ? 'text-ink' : 'text-ink'
      }`}
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
  onClose,
  onHoverEnter,
  onHoverLeave,
}: {
  locale: Locale;
  audience: Audience;
  root?: CategoryNode;
  onClose: () => void;
  onHoverEnter?: () => void;
  onHoverLeave?: () => void;
}) {
  const children = sortChildren(audience, root?.children ?? []);

  return (
    <div
      className="mega-enter absolute inset-x-0 top-full border-b border-line bg-ivory shadow-[0_24px_48px_rgba(20,20,20,0.06)]"
      onMouseEnter={onHoverEnter}
      onMouseLeave={onHoverLeave}
    >
      <div className="container-wide grid gap-10 py-12 md:grid-cols-[1.2fr_0.8fr]">
        <div>
          <p className="text-[11px] tracking-[0.22em] text-muted uppercase">
            {audienceLabel(audience, locale)}
          </p>
          <div className="mt-8 grid grid-cols-2 gap-x-10 gap-y-5 md:grid-cols-3">
            {children.map((child) => (
              <Link
                key={child.id}
                href={categoryLandingHref(locale, audience, child.slug)}
                className="font-serif text-2xl transition hover:text-muted"
                onClick={onClose}
              >
                {child.name}
              </Link>
            ))}
          </div>
          <Link
            href={shopHref(locale, audience, { category: root?.slug })}
            className="mt-10 inline-block text-[11px] tracking-[0.18em] uppercase underline"
            onClick={onClose}
          >
            {locale === 'it' ? 'Vedi tutto' : 'Shop all'}
          </Link>
        </div>
        <div className="relative hidden min-h-[220px] overflow-hidden bg-ivory-2 md:block">
          {root?.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={root.image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center px-8 text-center">
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
  onSearch,
}: {
  locale: Locale;
  audience: Audience;
  womenRoot?: CategoryNode;
  menRoot?: CategoryNode;
  brands: Brand[];
  copy: ReturnType<typeof navCopy>;
  onClose: () => void;
  onSearch: (q: string) => void;
}) {
  const [q, setQ] = useState('');
  const [openAudience, setOpenAudience] = useState<Audience | null>(audience);

  return (
    <div className="fixed inset-0 z-50 bg-ivory md:hidden">
      <div className="flex h-[var(--header-h)] items-center justify-between border-b border-line px-5">
        <span className="harimi-mark text-sm">HARIMI</span>
        <button type="button" className="text-[11px] tracking-[0.18em] uppercase" onClick={onClose}>
          {copy.close}
        </button>
      </div>
      <div className="max-h-[calc(100vh-var(--header-h))] overflow-y-auto px-5 py-8">
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
            className="flex-1 bg-transparent text-sm outline-none"
          />
          <button type="submit" className="text-[11px] tracking-[0.16em] uppercase">
            {copy.search}
          </button>
        </form>

        {([
          ['women', womenRoot, copy.women],
          ['men', menRoot, copy.men],
        ] as const).map(([key, root, label]) => (
          <div key={key} className="border-b border-line py-4">
            <button
              type="button"
              className="flex w-full items-center justify-between font-serif text-3xl"
              onClick={() => setOpenAudience(openAudience === key ? null : key)}
            >
              {label}
              <span className="text-sm text-muted">{openAudience === key ? '−' : '+'}</span>
            </button>
            {openAudience === key ? (
              <ul className="mt-4 space-y-3 pb-2">
                {(root?.children
                  ? sortChildren(key, root.children)
                  : []
                ).map((child) => (
                  <li key={child.id}>
                    <Link
                      href={categoryLandingHref(locale, key, child.slug)}
                      className="text-sm text-muted"
                      onClick={onClose}
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link
                    href={`/${locale}/${key}`}
                    className="text-[11px] tracking-[0.16em] uppercase underline"
                    onClick={onClose}
                  >
                    Home {label}
                  </Link>
                </li>
              </ul>
            ) : null}
          </div>
        ))}

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
          <Link href={`/${locale}/cart`} className="block font-serif text-2xl" onClick={onClose}>
            {copy.bag}
          </Link>
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
    </div>
  );
}
