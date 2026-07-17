import Link from 'next/link';
import { ProductCardView } from '@/components/ProductCard';
import { shopHref } from '@/lib/nav';
import type { Audience, Locale, ProductCard } from '@/lib/types';

export function EditorialBreak({
  locale,
  audience,
  products,
}: {
  locale: Locale;
  audience: Audience;
  products: ProductCard[];
}) {
  if (!products.length) return null;
  const it = locale === 'it';
  const lead = products[0];
  const rest = products.slice(1, 4);

  return (
    <section className="section-y bg-ivory-2/40">
      <div className="container-wide">
        <div className="max-w-md">
          <p className="text-[11px] tracking-[0.22em] text-muted uppercase">
            {it ? 'Editoriale' : 'Editorial'}
          </p>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            {it ? 'La selezione della settimana.' : 'This week’s edit.'}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-muted">
            {it
              ? 'Uno spazio più lento: immagini ampie, pochi pezzi, la stessa cura della boutique.'
              : 'A slower space: wide images, fewer pieces, the same boutique care.'}
          </p>
        </div>
      </div>

      <div className="mt-16 md:mt-24">
        <div className="md:pl-[30vw]">
          <div className="grid gap-10 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="px-5 md:px-0 md:pr-8">
              <ProductCardView product={lead} locale={locale} />
            </div>
            <div className="grid grid-cols-2 gap-6 px-5 md:px-0 md:gap-8">
              {rest.map((product) => (
                <ProductCardView key={product.id} product={product} locale={locale} />
              ))}
            </div>
          </div>
          <div className="mt-12 px-5 md:px-0">
            <Link
              href={shopHref(locale, audience, { shelf: 'featured' })}
              className="text-[11px] tracking-[0.18em] uppercase underline"
            >
              {it ? 'Vedi la selezione' : 'View the selection'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
