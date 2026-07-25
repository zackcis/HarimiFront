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

function gridClass(count: number): string {
  if (count <= 4) return 'grid-cols-2 md:grid-cols-4';
  if (count === 5) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-5';
  return 'grid-cols-2 md:grid-cols-3';
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
    <section id="explore" className="border-t border-line">
      <div className="container-wide flex h-[92svh] max-h-[1100px] min-h-[560px] flex-col gap-5 py-7 md:gap-6 md:py-9">
        <header className="shrink-0">
          <p className="eyebrow text-muted">{it ? 'Esplora' : 'Explore'}</p>
          <h2 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
            {it ? 'Per categoria' : 'By category'}
          </h2>
        </header>

        <div className={`grid min-h-0 flex-1 gap-3 md:gap-4 ${gridClass(ordered.length)}`}>
          {ordered.map((cat) => (
            <Link
              key={cat.id}
              href={categoryLandingHref(locale, audience, cat.slug)}
              className="group relative flex min-h-0 flex-col justify-end overflow-hidden bg-ivory-2"
            >
              {cat.image_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={cat.image_url}
                  alt=""
                  aria-hidden
                  className="img-zoom absolute inset-0 h-full w-full object-cover object-[center_18%]"
                />
              ) : null}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/15 to-transparent" />
              <span className="relative z-10 p-5 font-serif text-2xl text-ivory md:p-6 md:text-3xl">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
