import type { Locale, ProductCard } from '@/lib/types';

const INSTAGRAM_HANDLE =
  process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE?.replace(/^@/, '') || 'harimi.it';
const INSTAGRAM_URL =
  process.env.NEXT_PUBLIC_INSTAGRAM_URL ||
  `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

function InstagramGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

type Tile = { src: string; label: string };

/** Editorial Instagram band — CMS slots first, product imagery fills gaps. */
export function InstagramBand({
  locale,
  products,
  collageImages = [],
}: {
  locale: Locale;
  products: ProductCard[];
  collageImages?: (string | null)[];
}) {
  const it = locale === 'it';

  const cmsTiles: Tile[] = collageImages
    .filter((url): url is string => Boolean(url))
    .map((src, index) => ({
      src,
      label: it ? `Apri Instagram — riquadro ${index + 1}` : `Open Instagram — tile ${index + 1}`,
    }));

  const productTiles: Tile[] = products
    .filter((p) => p.primary_image_url)
    .map((product) => ({
      src: product.primary_image_url as string,
      label: it
        ? `Apri Instagram — ${product.title}`
        : `Open Instagram — ${product.title}`,
    }));

  // Curated uploads win; product photos fill remaining slots so a single upload is visible.
  const tiles: Tile[] = [...cmsTiles];
  for (const tile of productTiles) {
    if (tiles.length >= 6) break;
    if (tiles.some((t) => t.src === tile.src)) continue;
    tiles.push(tile);
  }

  if (tiles.length < 3) return null;

  while (tiles.length < 6) {
    tiles.push(tiles[tiles.length % Math.min(3, tiles.length)]);
  }

  return (
    <section className="border-t border-line py-10 md:py-14">
      <div className="container-wide text-center">
        <h2 className="font-serif text-3xl md:text-4xl">
          {it ? 'Seguici su Instagram' : 'Follow us on Instagram'}
        </h2>
        <p className="mt-2 text-sm tracking-[0.04em] text-muted">
          @{INSTAGRAM_HANDLE}
        </p>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="eyebrow mt-3 inline-flex min-h-11 items-center gap-2 text-ink underline underline-offset-4 transition duration-(--dur-base) hover:text-muted"
        >
          <InstagramGlyph className="h-4 w-4" />
          {it ? 'Seguici' : 'Follow'}
        </a>

        <ul className="mt-7 grid grid-cols-2 gap-1.5 sm:gap-2 md:mt-8 md:grid-cols-3 md:gap-2.5">
          {tiles.slice(0, 6).map((tile, index) => (
            <li key={`${tile.src}-${index}`} className="group relative">
              <a
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="relative block aspect-square overflow-hidden bg-ivory-2"
                aria-label={tile.label}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tile.src}
                  alt=""
                  className="img-zoom h-full w-full object-cover object-[center_18%]"
                />
                <span
                  className="pointer-events-none absolute inset-0 flex items-center justify-center bg-ink/0 opacity-0 transition duration-(--dur-base) group-hover:bg-ink/25 group-hover:opacity-100"
                  aria-hidden
                >
                  <InstagramGlyph className="h-6 w-6 text-ivory" />
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
