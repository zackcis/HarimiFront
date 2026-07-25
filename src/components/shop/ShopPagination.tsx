import Link from 'next/link';
import type { Audience, Locale } from '@/lib/types';
import { buildShopHref, type ShopQuery } from '@/lib/shop';

function pageList(current: number, last: number): Array<number | '…'> {
  const out: Array<number | '…'> = [];
  const push = (n: number) => out.push(n);
  const window = 1;
  for (let n = 1; n <= last; n += 1) {
    if (n === 1 || n === last || (n >= current - window && n <= current + window)) {
      push(n);
    } else if (out[out.length - 1] !== '…') {
      out.push('…');
    }
  }
  return out;
}

export function ShopPagination({
  locale,
  audience,
  query,
  currentPage,
  lastPage,
}: {
  locale: Locale;
  audience: Audience;
  query: ShopQuery;
  currentPage: number;
  lastPage: number;
}) {
  if (lastPage <= 1) return null;
  const it = locale === 'it';
  const href = (page: number) =>
    buildShopHref(locale, audience, { ...query, page: page > 1 ? String(page) : undefined });

  const pages = pageList(currentPage, lastPage);
  const prevDisabled = currentPage <= 1;
  const nextDisabled = currentPage >= lastPage;

  return (
    <nav
      aria-label={it ? 'Paginazione' : 'Pagination'}
      className="mt-16 flex items-center justify-center gap-2 text-sm"
    >
      {prevDisabled ? (
        <span className="eyebrow inline-flex min-h-11 items-center px-3 text-muted opacity-40">
          {it ? 'Prec.' : 'Prev'}
        </span>
      ) : (
        <Link
          href={href(currentPage - 1)}
          rel="prev"
          className="eyebrow inline-flex min-h-11 items-center px-3 text-muted transition-colors duration-(--dur-fast) hover:text-ink"
        >
          {it ? 'Prec.' : 'Prev'}
        </Link>
      )}

      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`gap-${i}`} className="px-2 text-muted">
              …
            </span>
          ) : (
            <Link
              key={p}
              href={href(p)}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`inline-flex h-11 min-w-11 items-center justify-center px-1 transition-colors duration-(--dur-fast) ${
                p === currentPage
                  ? 'text-ink underline underline-offset-4'
                  : 'text-muted hover:text-ink'
              }`}
            >
              {p}
            </Link>
          ),
        )}
      </div>

      {nextDisabled ? (
        <span className="eyebrow inline-flex min-h-11 items-center px-3 text-muted opacity-40">
          {it ? 'Succ.' : 'Next'}
        </span>
      ) : (
        <Link
          href={href(currentPage + 1)}
          rel="next"
          className="eyebrow inline-flex min-h-11 items-center px-3 text-muted transition-colors duration-(--dur-fast) hover:text-ink"
        >
          {it ? 'Succ.' : 'Next'}
        </Link>
      )}
    </nav>
  );
}
