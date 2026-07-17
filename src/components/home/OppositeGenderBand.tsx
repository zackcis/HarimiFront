import Link from 'next/link';
import type { Locale } from '@/lib/types';

export type DiscoverWorld = {
  audience: string;
  label: string;
  href: string;
  image: string | null;
};

export function OppositeGenderBand({
  locale,
  worlds,
}: {
  locale: Locale;
  worlds: DiscoverWorld[];
}) {
  const it = locale === 'it';
  if (worlds.length === 0) return null;

  return (
    <section className="section-y bg-ink text-ivory">
      <div className="container-wide">
        <p className="text-[11px] tracking-[0.24em] uppercase text-ivory/50 page-enter">
          {it ? 'Scopri anche' : 'Also discover'}
        </p>
        <h2 className="mt-4 max-w-xl font-serif text-4xl md:text-5xl page-enter page-enter-delay">
          {it ? 'Altri mondi HARIMI' : 'Other HARIMI worlds'}
        </h2>

        <div
          className={`mt-12 grid gap-6 md:mt-16 md:gap-8 ${
            worlds.length > 1 ? 'md:grid-cols-2' : 'md:grid-cols-1'
          }`}
        >
          {worlds.map((world) => (
            <Link
              key={world.audience}
              href={world.href}
              className="group relative block aspect-[16/10] overflow-hidden bg-ivory-2/10 page-enter"
            >
              {world.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={world.image}
                  alt=""
                  className="img-zoom absolute inset-0 h-full w-full object-cover object-[center_25%] opacity-70 transition group-hover:opacity-90"
                />
              ) : (
                <div
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(247,243,236,0.16),transparent_55%),linear-gradient(160deg,#1c1c1c,#0a0a0a)]"
                  aria-hidden
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent transition group-hover:from-ink/70" />
              <div className="absolute inset-0 flex flex-col items-start justify-end p-8 md:p-10">
                <h3 className="font-serif text-4xl md:text-5xl">{world.label}</h3>
                <span className="mt-4 inline-flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-ivory/80 transition group-hover:text-ivory">
                  {it ? 'Entra' : 'Enter'}
                  <span
                    aria-hidden
                    className="inline-block transition-transform duration-500 group-hover:translate-x-1"
                  >
                    &rarr;
                  </span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
