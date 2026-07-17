import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_NAME, siteDescription, siteUrl } from '@/lib/seo';
import { mediaExists, welcomeMediaPath } from '@/lib/media';

export const metadata: Metadata = {
  title: { absolute: SITE_NAME },
  description: siteDescription('it'),
  alternates: {
    canonical: siteUrl(),
  },
  openGraph: {
    title: SITE_NAME,
    description: siteDescription('it'),
    url: siteUrl(),
    locale: 'it_IT',
    siteName: SITE_NAME,
  },
};

const PANEL_GRADIENT: Record<'women' | 'men' | 'kids', string> = {
  women:
    'bg-[radial-gradient(ellipse_at_30%_40%,rgba(247,243,236,0.18),transparent_55%),linear-gradient(160deg,#1a1a1a,#0c0c0c)]',
  men: 'bg-[radial-gradient(ellipse_at_70%_60%,rgba(247,243,236,0.12),transparent_50%),linear-gradient(200deg,#121212,#080808)]',
  kids: 'bg-[radial-gradient(ellipse_at_50%_35%,rgba(247,243,236,0.15),transparent_52%),linear-gradient(180deg,#171717,#0a0a0a)]',
};

async function WelcomePanel({
  audience,
  label,
  eyebrow,
  href,
  divider,
}: {
  audience: 'women' | 'men' | 'kids';
  label: string;
  eyebrow: string;
  href: string;
  divider: boolean;
}) {
  const path = welcomeMediaPath(audience);
  const hasMedia = await mediaExists(path);

  return (
    <Link
      href={href}
      className={`group relative flex min-h-[36vh] flex-1 items-end overflow-hidden md:min-h-screen ${
        divider ? 'border-b border-ivory/15 md:border-b-0 md:border-r' : ''
      }`}
    >
      {hasMedia ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={path}
          alt=""
          className="img-zoom absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className={`absolute inset-0 ${PANEL_GRADIENT[audience]}`} aria-hidden />
      )}
      <div className="absolute inset-0 bg-ink/35 transition duration-700 group-hover:bg-ink/20" />
      <div className="relative z-10 w-full p-10 md:p-14 lg:p-20">
        <p className="text-[11px] tracking-[0.28em] text-ivory/55 uppercase">
          {eyebrow}
        </p>
        <h2 className="mt-4 font-serif text-5xl font-normal leading-none text-ivory md:text-6xl lg:text-7xl">
          {label}
        </h2>
        <span className="mt-8 inline-block text-xs tracking-[0.22em] text-ivory/80 uppercase transition group-hover:text-ivory">
          Entra · Enter
        </span>
      </div>
    </Link>
  );
}

export default async function WelcomePage() {
  return (
    <main className="relative min-h-screen bg-ink text-ivory">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex flex-col items-center px-6 pt-10 md:pt-12">
        <p className="harimi-mark text-sm text-ivory md:text-base">HARIMI</p>
        <span className="harimi-rule bg-ivory" />
        <p className="mt-6 text-center font-serif text-xl font-normal text-ivory/85 md:text-2xl">
          Seleziona il tuo mondo
        </p>
        <div className="mt-4 flex gap-4 text-[11px] tracking-[0.2em] uppercase text-ivory/50">
          <Link href="/it/women" className="pointer-events-auto hover:text-ivory">
            IT
          </Link>
          <span aria-hidden>·</span>
          <Link href="/en/women" className="pointer-events-auto hover:text-ivory">
            EN
          </Link>
        </div>
      </div>

      <div className="flex min-h-screen flex-col md:flex-row">
        <WelcomePanel
          audience="women"
          label="Donna"
          eyebrow="Women"
          href="/it/women"
          divider
        />
        <WelcomePanel
          audience="men"
          label="Uomo"
          eyebrow="Men"
          href="/it/men"
          divider
        />
        <WelcomePanel
          audience="kids"
          label="Bambini"
          eyebrow="Kids"
          href="/it/kids"
          divider={false}
        />
      </div>
    </main>
  );
}
