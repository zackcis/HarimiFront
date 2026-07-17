import Link from 'next/link';
import {
  homeHeroMediaPath,
  homeHeroVideoPaths,
  mediaExists,
} from '@/lib/media';
import { shopHref } from '@/lib/nav';
import { audienceLabel } from '@/lib/i18n';
import type { Audience, Locale } from '@/lib/types';

export async function HomeHero({
  locale,
  audience,
  fallbackImage,
}: {
  locale: Locale;
  audience: Audience;
  fallbackImage?: string | null;
}) {
  const it = locale === 'it';
  const mediaPath = homeHeroMediaPath(audience);
  const videos = homeHeroVideoPaths(audience);
  const [hasImage, hasMp4, hasWebm] = await Promise.all([
    mediaExists(mediaPath),
    mediaExists(videos.mp4),
    mediaExists(videos.webm),
  ]);
  const hasVideo = hasMp4 || hasWebm;
  const image = hasImage ? mediaPath : fallbackImage ?? null;

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-ink text-ivory">
      {hasVideo ? (
        <video
          className="absolute inset-0 h-full w-full object-cover opacity-70 hero-media"
          autoPlay
          muted
          loop
          playsInline
          poster={image ?? undefined}
          aria-hidden
        >
          {hasWebm ? <source src={videos.webm} type="video/webm" /> : null}
          {hasMp4 ? <source src={videos.mp4} type="video/mp4" /> : null}
        </video>
      ) : image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-70 hero-media"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(247,243,236,0.16),transparent_50%),linear-gradient(135deg,#161616,#0a0a0a)]"
          aria-hidden
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/30" />
      <div className="container-wide relative z-10 flex min-h-[88vh] flex-col justify-end pb-16 pt-28 md:pb-24">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ivory/55 hero-reveal">
          {audienceLabel(audience, locale)}
        </p>
        <h1 className="mt-5 max-w-3xl font-serif text-5xl leading-[1.02] md:text-7xl lg:text-8xl hero-reveal hero-reveal-delay-1">
          {it
            ? 'Eleganza quotidiana, selezione curata.'
            : 'Everyday elegance, curated selection.'}
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/70 hero-reveal hero-reveal-delay-2 md:text-[15px]">
          {it
            ? 'HARIMI riunisce i migliori brand di intimates in un’esperienza editoriale, semplice e preziosa.'
            : 'HARIMI gathers the finest intimates brands in an editorial experience—simple, precious.'}
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4 hero-reveal hero-reveal-delay-3">
          <Link
            href={shopHref(locale, audience)}
            className="bg-ivory px-8 py-4 text-[11px] tracking-[0.22em] text-ink uppercase transition hover:bg-ivory-2"
          >
            {it ? 'Acquista ora' : 'Shop now'}
          </Link>
          <Link
            href="#explore"
            className="border border-ivory bg-ink/30 px-8 py-4 text-[11px] tracking-[0.22em] text-ivory uppercase backdrop-blur-sm transition hover:bg-ivory hover:text-ink"
          >
            {it ? 'Esplora categorie' : 'Explore categories'}
          </Link>
        </div>
      </div>
    </section>
  );
}
