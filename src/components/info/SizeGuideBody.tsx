import type { Locale } from '@/lib/types';

export function SizeGuideBody({ locale }: { locale: Locale }) {
  const it = locale === 'it';

  return (
    <div className="space-y-8 text-sm">
      <p className="leading-relaxed text-muted">
        {it
          ? 'Tabelle indicative per aiutarti a scegliere. Le misure possono variare leggermente tra i brand: in caso di dubbio, contattaci.'
          : 'Indicative charts to help you choose. Sizing can vary slightly by brand — contact us if unsure.'}
      </p>

      <section>
        <h3 className="font-serif text-xl text-ink">
          {it ? 'Reggiseno (EU)' : 'Bra (EU)'}
        </h3>
        <div className="mt-3 overflow-x-auto border border-line">
          <table className="w-full min-w-[360px] text-left text-sm">
            <thead className="bg-ivory-2 text-xs tracking-wide uppercase text-muted">
              <tr>
                <th className="px-3 py-2.5 font-normal">{it ? 'Taglia' : 'Size'}</th>
                <th className="px-3 py-2.5 font-normal">
                  {it ? 'Torace (cm)' : 'Bust (cm)'}
                </th>
                <th className="px-3 py-2.5 font-normal">
                  {it ? 'Sotto seno (cm)' : 'Underbust (cm)'}
                </th>
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
                    <td key={cell} className="px-3 py-2.5 text-ink">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-serif text-xl text-ink">
          {it ? 'Slip / mutande' : 'Briefs'}
        </h3>
        <div className="mt-3 overflow-x-auto border border-line">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead className="bg-ivory-2 text-xs tracking-wide uppercase text-muted">
              <tr>
                <th className="px-3 py-2.5 font-normal">{it ? 'Taglia' : 'Size'}</th>
                <th className="px-3 py-2.5 font-normal">
                  {it ? 'Fianchi (cm)' : 'Hips (cm)'}
                </th>
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
                    <td key={cell} className="px-3 py-2.5 text-ink">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h3 className="font-serif text-xl text-ink">{it ? 'Uomo' : 'Men'}</h3>
        <div className="mt-3 overflow-x-auto border border-line">
          <table className="w-full min-w-[280px] text-left text-sm">
            <thead className="bg-ivory-2 text-xs tracking-wide uppercase text-muted">
              <tr>
                <th className="px-3 py-2.5 font-normal">{it ? 'Taglia' : 'Size'}</th>
                <th className="px-3 py-2.5 font-normal">
                  {it ? 'Vita (cm)' : 'Waist (cm)'}
                </th>
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
                    <td key={cell} className="px-3 py-2.5 text-ink">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
