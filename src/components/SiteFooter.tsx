import Link from 'next/link';
import type { Locale } from '@/lib/types';

export function SiteFooter({ locale }: { locale: Locale }) {
  const it = locale === 'it';

  return (
    <footer className="mt-auto border-t border-line">
      <div className="container-page grid gap-8 py-14 md:grid-cols-3">
        <div>
          <p className="harimi-mark text-sm">HARIMI</p>
          <span className="harimi-rule" />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            {it
              ? 'Boutique intimates multi-brand. Eleganza quotidiana, selezione curata.'
              : 'Multi-brand intimates boutique. Everyday elegance, curated selection.'}
          </p>
        </div>
        <div className="text-sm text-muted">
          <Link href={`/${locale}/women`} className="block py-1.5 transition-colors duration-(--dur-fast) hover:text-ink">
            {it ? 'Donna' : 'Women'}
          </Link>
          <Link href={`/${locale}/men`} className="block py-1.5 transition-colors duration-(--dur-fast) hover:text-ink">
            {it ? 'Uomo' : 'Men'}
          </Link>
          <Link href={`/${locale}/kids`} className="block py-1.5 transition-colors duration-(--dur-fast) hover:text-ink">
            {it ? 'Bambini' : 'Kids'}
          </Link>
          <Link href={`/${locale}/brands`} className="block py-1.5 transition-colors duration-(--dur-fast) hover:text-ink">
            {it ? 'Marchi' : 'Brands'}
          </Link>
        </div>
        <div className="text-sm text-muted">
          <Link href={`/${locale}/shipping-returns`} className="block py-1.5 transition-colors duration-(--dur-fast) hover:text-ink">
            {it ? 'Spedizioni e resi' : 'Shipping & returns'}
          </Link>
          <Link href={`/${locale}/size-guide`} className="block py-1.5 transition-colors duration-(--dur-fast) hover:text-ink">
            {it ? 'Guida alle taglie' : 'Size guide'}
          </Link>
          <p className="py-1.5">{it ? 'Assistenza clienti' : 'Customer care'}</p>
        </div>
      </div>
    </footer>
  );
}
