import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { isLocale } from '@/lib/i18n';
import { pageMetadata } from '@/lib/seo';
import type { Locale } from '@/lib/types';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  return pageMetadata({
    locale,
    title: locale === 'it' ? 'Guida alle taglie' : 'Size guide',
    description:
      locale === 'it'
        ? 'Tabelle taglie HARIMI per reggiseno, slip e uomo.'
        : 'HARIMI size charts for bras, briefs and men.',
    pathWithoutLocale: '/size-guide',
  });
}

export default async function SizeGuidePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const it = locale === 'it';

  return (
    <>
<main className="container-page py-12 md:py-16">
        <p className="text-xs tracking-[0.2em] text-muted uppercase">
          {it ? 'Assistenza' : 'Help'}
        </p>
        <h1 className="mt-2 font-serif text-4xl md:text-5xl">
          {it ? 'Guida alle taglie' : 'Size guide'}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          {it
            ? 'Tabelle indicative per aiutarti a scegliere. Le misure possono variare leggermente tra i brand: in caso di dubbio, contattaci.'
            : 'Indicative charts to help you choose. Sizing can vary slightly by brand — contact us if unsure.'}
        </p>

        <section className="mt-12">
          <h2 className="font-serif text-2xl">{it ? 'Reggiseno (EU)' : 'Bra (EU)'}</h2>
          <div className="mt-4 overflow-x-auto border border-line">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="bg-ivory-2 text-xs tracking-wide uppercase text-muted">
                <tr>
                  <th className="px-4 py-3 font-normal">{it ? 'Taglia' : 'Size'}</th>
                  <th className="px-4 py-3 font-normal">{it ? 'Torace (cm)' : 'Bust (cm)'}</th>
                  <th className="px-4 py-3 font-normal">{it ? 'Sotto seno (cm)' : 'Underbust (cm)'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['2B / 70B', '82–86', '68–72'],
                  ['3B / 75B', '87–91', '73–77'],
                  ['4B / 80B', '92–96', '78–82'],
                  ['5B / 85B', '97–101', '83–87'],
                  ['3C / 75C', '89–93', '73–77'],
                  ['4C / 80C', '94–98', '78–82'],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-line">
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl">{it ? 'Slip / mutande' : 'Briefs'}</h2>
          <div className="mt-4 overflow-x-auto border border-line">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead className="bg-ivory-2 text-xs tracking-wide uppercase text-muted">
                <tr>
                  <th className="px-4 py-3 font-normal">{it ? 'Taglia' : 'Size'}</th>
                  <th className="px-4 py-3 font-normal">{it ? 'Fianchi (cm)' : 'Hips (cm)'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['XS', '86–90'],
                  ['S', '90–94'],
                  ['M', '94–98'],
                  ['L', '98–102'],
                  ['XL', '102–106'],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-line">
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-serif text-2xl">{it ? 'Uomo' : 'Men'}</h2>
          <div className="mt-4 overflow-x-auto border border-line">
            <table className="w-full min-w-[360px] text-left text-sm">
              <thead className="bg-ivory-2 text-xs tracking-wide uppercase text-muted">
                <tr>
                  <th className="px-4 py-3 font-normal">{it ? 'Taglia' : 'Size'}</th>
                  <th className="px-4 py-3 font-normal">{it ? 'Vita (cm)' : 'Waist (cm)'}</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['S', '76–81'],
                  ['M', '81–86'],
                  ['L', '86–91'],
                  ['XL', '91–96'],
                  ['XXL', '96–101'],
                ].map((row) => (
                  <tr key={row[0]} className="border-t border-line">
                    {row.map((cell) => (
                      <td key={cell} className="px-4 py-3">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <p className="mt-12 text-sm text-muted">
          <Link href={`/${locale}/shipping-returns`} className="underline hover:text-ink">
            {it ? 'Spedizioni e resi' : 'Shipping & returns'}
          </Link>
        </p>
      </main>
    </>
  );
}
