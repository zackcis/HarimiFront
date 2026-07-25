import Link from 'next/link';
import {
  homeHeroMediaPath,
  homeHeroVideoPaths,
  mediaExists,
} from '@/lib/media';
import { shopHref } from '@/lib/nav';
import { audienceLabel } from '@/lib/i18n';
import type { Audience, Locale } from '@/lib/types';
import { HomeHeroMedia } from '@/components/home/HomeHeroMedia';

export async function HomeHero({
  locale,
  audience,
  fallbackImage,
  apiStill,
  apiMp4,
  apiWebm,
}: {
  locale: Locale;
  audience: Audience;
  fallbackImage?: string | null;
  apiStill?: string | null;
  apiMp4?: string | null;
  apiWebm?: string | null;
}) {
  const it = locale === 'it';
  const mediaPath = homeHeroMediaPath(audience);
  const videos = homeHeroVideoPaths(audience);
  const [hasImage, hasMp4, hasWebm] = await Promise.all([
    mediaExists(mediaPath),
    mediaExists(videos.mp4),
    mediaExists(videos.webm),
  ]);

  // CMS wins: API video and/or still; local files only when CMS has neither
  const hasApiVideo = Boolean(apiMp4 || apiWebm);
  const hasApiStill = Boolean(apiStill);

  let mp4: string | null = null;
  let webm: string | null = null;
  let image: string | null = null;

  if (hasApiVideo || hasApiStill) {
    mp4 = apiMp4 || null;
    webm = apiWebm || null;
    // Only use CMS still (or product fallback) — do not pull local still to pair with CMS video
    image = apiStill || (!hasApiVideo ? fallbackImage ?? null : null);
  } else {
    mp4 = hasMp4 ? videos.mp4 : null;
    webm = hasWebm ? videos.webm : null;
    image = (hasImage ? mediaPath : null) || fallbackImage || null;
  }

  return (
    <section className="relative min-h-[88vh] overflow-hidden bg-ink text-ivory">
      <HomeHeroMedia image={image} mp4={mp4} webm={webm} />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/30" />
      <div className="container-wide relative z-10 flex min-h-[88vh] flex-col justify-end pb-16 pt-28 md:pb-24">
        <p className="text-[11px] tracking-[0.28em] uppercase text-ivory/55 hero-reveal">
          {audienceLabel(audience, locale)}
        </p>
        <h1 className="hero-title mt-5 max-w-3xl font-serif hero-reveal hero-reveal-delay-1">
          {it
            ? 'Eleganza quotidiana, selezione curata.'
            : 'Everyday elegance, curated selection.'}
        </h1>
        <p className="mt-6 max-w-md text-sm leading-relaxed text-ivory/80 hero-reveal hero-reveal-delay-2 md:text-[15px]">
          {it
            ? 'HARIMI riunisce i migliori brand di intimates in un’esperienza editoriale, semplice e preziosa.'
            : 'HARIMI gathers the finest intimates brands in an editorial experience—simple, precious.'}
        </p>
        <div className="mt-12 flex flex-wrap items-center gap-4 hero-reveal hero-reveal-delay-3 md:mt-14">
          <Link
            href={shopHref(locale, audience)}
            className="bg-ivory px-8 py-4 text-[11px] tracking-[0.22em] text-ink uppercase transition duration-(--dur-base) hover:bg-ivory-2"
          >
            {it ? 'Acquista ora' : 'Shop now'}
          </Link>
          <Link
            href="#explore"
            className="border border-ivory bg-ink/30 px-8 py-4 text-[11px] tracking-[0.22em] text-ivory uppercase backdrop-blur-sm transition duration-(--dur-base) hover:bg-ivory hover:text-ink"
          >
            {it ? 'Esplora categorie' : 'Explore categories'}
          </Link>
        </div>
      </div>
    </section>
  );
}
