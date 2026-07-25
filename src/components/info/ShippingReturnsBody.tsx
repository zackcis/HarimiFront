import type { Locale } from '@/lib/types';

export function ShippingReturnsBody({ locale }: { locale: Locale }) {
  const it = locale === 'it';

  return (
    <div className="space-y-8 text-sm leading-relaxed">
      <section className="space-y-3">
        <h3 className="font-serif text-xl text-ink">
          {it ? 'Spedizione' : 'Shipping'}
        </h3>
        <p className="text-muted">
          {it
            ? 'Consegniamo in tutta Italia. La spedizione standard ha un costo fisso di €5,90 (salvo promozioni). I tempi indicativi sono 2–5 giorni lavorativi dalla conferma del pagamento.'
            : 'We ship across Italy. Standard shipping is a flat €5.90 (unless on promotion). Typical delivery is 2–5 business days after payment confirmation.'}
        </p>
        <p className="text-muted">
          {it
            ? 'Riceverai un’email con il tracking quando l’ordine viene spedito.'
            : 'You will receive an email with tracking when your order ships.'}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-serif text-xl text-ink">
          {it ? 'Resi e cambi' : 'Returns & exchanges'}
        </h3>
        <p className="text-muted">
          {it
            ? 'Hai 14 giorni dalla ricezione per richiedere un reso o un cambio taglia, se l’articolo è integro, non indossato e con etichette. Gli articoli intimi devono rispettare le norme igieniche (imbusto di protezione chiuso, dove presente).'
            : 'You have 14 days from delivery to request a return or size exchange if the item is unused, unworn and labelled. Intimate apparel must meet hygiene rules (protective seal intact where applicable).'}
        </p>
        <p className="text-muted">
          {it
            ? 'Scrivi a assistenza indicando il numero ordine. Il rimborso viene effettuato sul metodo di pagamento originale dopo controllo merce.'
            : 'Email customer care with your order number. Refunds go to the original payment method after we inspect the goods.'}
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-serif text-xl text-ink">
          {it ? 'Pagamenti' : 'Payments'}
        </h3>
        <p className="text-muted">
          {it
            ? 'Pagamenti sicuri tramite Stripe (carte e metodi disponibili al checkout). Non conserviamo i dati della carta.'
            : 'Secure payments via Stripe (cards and methods available at checkout). We never store card details.'}
        </p>
      </section>
    </div>
  );
}
