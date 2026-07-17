import Link from 'next/link';
import { categoryLandingHref } from '@/lib/nav';
import type { Audience, CategoryNode, Locale } from '@/lib/types';

const WOMEN_ORDER = ['bras', 'knickers', 'lingerie', 'knitwear', 'nightwear'];
const MEN_ORDER = ['boxers', 'briefs', 'tops', 'easywear', 'socks', 'swimsuits'];
const KIDS_ORDER = ['kids-underwear', 'kids-undershirts', 'kids-pyjamas', 'kids-socks'];

function orderFor(audience: Audience): string[] {
  if (audience === 'women') return WOMEN_ORDER;
  if (audience === 'men') return MEN_ORDER;
  return KIDS_ORDER;
}

function sortCategories(audience: Audience, categories: CategoryNode[]): CategoryNode[] {
  const order = orderFor(audience);
  return [...categories].sort((a, b) => {
    const ai = order.indexOf(a.slug);
    const bi = order.indexOf(b.slug);
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
  });
}

export function ExploreCategories({
  locale,
  audience,
  categories,
}: {
  locale: Locale;
  audience: Audience;
  categories: CategoryNode[];
}) {
  const ordered = sortCategories(audience, categories);
  if (!ordered.length) return null;
  const it = locale === 'it';

  return (
    <section id="explore" className="section-y border-t border-line">
      <div className="container-wide">
        <p className="text-[11px] tracking-[0.22em] text-muted uppercase">
          {it ? 'Esplora' : 'Explore'}
        </p>
        <h2 className="mt-3 font-serif text-4xl md:text-5xl">
          {it ? 'Per categoria' : 'By category'}
        </h2>
        <div className="mt-12 grid grid-cols-2 gap-px bg-line md:grid-cols-3 lg:grid-cols-5">
          {ordered.map((cat) => (
            <Link
              key={cat.id}
              href={categoryLandingHref(locale, audience, cat.slug)}
              className="group relative flex min-h-[180px] flex-col justify-end bg-ivory p-6 transition hover:bg-ivory-2 md:min-h-[240px]"
            >
              {cat.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.image_url}
                  alt=""
                  className="img-zoom absolute inset-0 h-full w-full object-cover opacity-0 transition group-hover:opacity-20"
                />
              ) : null}
              <span className="relative font-serif text-2xl md:text-3xl">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
