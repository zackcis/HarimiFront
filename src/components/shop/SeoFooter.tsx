import type { EditorialCopy, FaqItem } from '@/lib/editorial';
import type { Locale } from '@/lib/types';

/** Compact SEO band for category/type PLPs: serif intro + FAQ accordion. */
export function SeoFooter({
  locale,
  name,
  copy,
  faqs,
}: {
  locale: Locale;
  name: string;
  copy: EditorialCopy;
  faqs: FaqItem[];
}) {
  const it = locale === 'it';

  return (
    <section className="mt-12 border-t border-line pt-10 md:mt-16 md:pt-12">
      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <p className="eyebrow text-muted">{name}</p>
          <h2 className="mt-3 font-serif text-2xl leading-snug md:text-3xl">
            {copy.headline}
          </h2>
          <p className="mt-4 max-w-prose text-sm leading-relaxed text-muted">
            {copy.body}
          </p>
        </div>

        <div>
          <h3 className="eyebrow text-muted">
            {it ? 'Domande frequenti' : 'Frequently asked questions'}
          </h3>
          <div className="mt-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="accordion border-b border-line">
                <summary className="tap flex items-center justify-between gap-4 py-5 text-sm text-ink">
                  <span>{faq.q}</span>
                  <span
                    aria-hidden
                    className="accordion-marker relative ml-4 inline-flex h-3 w-3 shrink-0 items-center justify-center text-muted"
                  >
                    <span className="absolute h-px w-3 bg-current" />
                    <span className="absolute h-3 w-px bg-current" />
                  </span>
                </summary>
                <div className="accordion-panel pb-6 text-sm leading-7 text-muted">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
