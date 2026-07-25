'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { fetchOrderLive, formatEur } from '@/lib/api';
import { useCart } from '@/lib/cart';
import type { CheckoutOrder, Locale } from '@/lib/types';

const POLL_MS = 2500;
const MAX_POLLS = 24; // ~60s

type Props = {
  locale: Locale;
  reference: string;
  token: string;
  initialOrder: CheckoutOrder;
};

export function ConfirmationStatus({ locale, reference, token, initialOrder }: Props) {
  const { clear, ready: cartReady } = useCart();
  const clearedRef = useRef(false);
  const [order, setOrder] = useState(initialOrder);
  const [polling, setPolling] = useState(initialOrder.payment_status === 'pending_payment');
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    // Wait for localStorage hydrate — clearing before ready lets hydrate restore the bag.
    if (!cartReady) return;
    if (order.payment_status === 'paid' && !clearedRef.current) {
      clearedRef.current = true;
      clear();
    }
  }, [order.payment_status, clear, cartReady]);

  useEffect(() => {
    if (order.payment_status !== 'pending_payment') {
      setPolling(false);
      return;
    }

    let cancelled = false;
    let attempts = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const tick = async () => {
      attempts += 1;
      try {
        const next = await fetchOrderLive(locale, reference, token);
        if (cancelled) return;
        setOrder(next);
        if (next.payment_status === 'paid') {
          setPolling(false);
          return;
        }
        if (
          next.payment_status === 'cancelled' ||
          next.payment_status === 'failed' ||
          next.payment_status === 'refunded' ||
          next.status === 'cancelled'
        ) {
          setPolling(false);
          return;
        }
      } catch {
        // Keep trying until timeout.
      }

      if (cancelled) return;
      if (attempts >= MAX_POLLS) {
        setPolling(false);
        setTimedOut(true);
        return;
      }
      timer = setTimeout(tick, POLL_MS);
    };

    timer = setTimeout(tick, POLL_MS);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [locale, reference, token, order.payment_status]);

  const paid = order.payment_status === 'paid';
  const refunded = order.payment_status === 'refunded';
  const shipped = order.status === 'shipped';
  const failed =
    order.payment_status === 'failed' ||
    order.payment_status === 'cancelled' ||
    (order.status === 'cancelled' && !refunded && !paid);

  const hasTracking = Boolean(
    order.shipment?.tracking_number || order.shipment?.carrier || order.shipment?.tracking_url,
  );

  const eyebrow = refunded
    ? locale === 'it'
      ? 'Ordine rimborsato'
      : 'Order refunded'
    : shipped
      ? locale === 'it'
        ? 'Ordine spedito'
        : 'Order shipped'
      : paid
        ? locale === 'it'
          ? 'Pagamento confermato'
          : 'Payment confirmed'
        : failed
          ? locale === 'it'
            ? 'Ordine non completato'
            : 'Order not completed'
          : locale === 'it'
            ? 'Conferma in corso'
            : 'Confirming payment';

  const title = refunded
    ? locale === 'it'
      ? 'Rimborso effettuato'
      : 'Refund completed'
    : shipped
      ? locale === 'it'
        ? 'In viaggio'
        : 'On its way'
      : paid
        ? locale === 'it'
          ? 'Grazie'
          : 'Thank you'
        : failed
          ? locale === 'it'
            ? 'Pagamento non riuscito'
            : 'Payment unsuccessful'
          : locale === 'it'
            ? 'Quasi fatto'
            : 'Almost there';

  const body = refunded
    ? locale === 'it'
      ? 'Abbiamo rimborsato questo ordine. L’importo tornerà sul metodo di pagamento utilizzato.'
      : 'This order was refunded. The amount will return to your original payment method.'
    : shipped
      ? locale === 'it'
        ? 'Il tuo ordine è stato spedito. Trovi i dettagli di tracking qui sotto.'
        : 'Your order has shipped. Tracking details are below.'
      : paid
        ? locale === 'it'
          ? 'Il pagamento è andato a buon fine. Ti abbiamo inviato una email di conferma. Ti avviseremo quando la spedizione parte.'
          : 'Payment succeeded. A confirmation email is on its way. We’ll email you when it ships.'
        : failed
          ? locale === 'it'
            ? 'Questo ordine non risulta pagato. Puoi tornare al checkout e riprovare.'
            : 'This order was not paid. You can return to checkout and try again.'
          : polling
            ? locale === 'it'
              ? 'Stiamo confermando il pagamento con Stripe. Resta su questa pagina…'
              : 'Confirming your payment with Stripe. Stay on this page…'
            : timedOut
              ? locale === 'it'
                ? 'La conferma sta impiegando più del previsto. Controlla la tua email tra poco, oppure aggiorna questa pagina.'
                : 'Confirmation is taking longer than expected. Check your email shortly, or refresh this page.'
              : locale === 'it'
                ? 'Se hai appena pagato, la conferma può richiedere qualche secondo.'
                : 'If you just paid, confirmation can take a moment.';

  const paymentLabel = (() => {
    switch (order.payment_status) {
      case 'paid':
        return locale === 'it' ? 'Pagato' : 'Paid';
      case 'pending_payment':
        return locale === 'it' ? 'In attesa di conferma' : 'Awaiting confirmation';
      case 'failed':
        return locale === 'it' ? 'Fallito' : 'Failed';
      case 'cancelled':
        return locale === 'it' ? 'Annullato' : 'Cancelled';
      case 'refunded':
        return locale === 'it' ? 'Rimborsato' : 'Refunded';
      default:
        return order.payment_status;
    }
  })();

  const fulfillmentLabel = (() => {
    switch (order.status) {
      case 'shipped':
        return locale === 'it' ? 'Spedito' : 'Shipped';
      case 'confirmed':
        return locale === 'it' ? 'Confermato' : 'Confirmed';
      case 'cancelled':
        return locale === 'it' ? 'Annullato' : 'Cancelled';
      default:
        return locale === 'it' ? 'In preparazione' : 'Processing';
    }
  })();

  return (
    <main className="container-page py-16 md:py-20">
      <p className="text-xs tracking-[0.2em] text-muted uppercase">{eyebrow}</p>
      <h1 className="mt-3 font-serif text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 max-w-lg text-sm text-muted">{body}</p>
      {polling ? (
        <p className="mt-3 text-xs tracking-[0.14em] text-muted uppercase">
          {locale === 'it' ? 'Verifica in corso' : 'Checking status'}
        </p>
      ) : null}

      <div className="mt-10 max-w-xl border border-line p-6">
        <p className="text-sm">
          <span className="text-muted">{locale === 'it' ? 'Riferimento' : 'Reference'}: </span>
          {order.reference}
        </p>
        <p className="mt-2 text-sm">
          <span className="text-muted">{locale === 'it' ? 'Stato pagamento' : 'Payment'}: </span>
          {paymentLabel}
        </p>
        <p className="mt-2 text-sm">
          <span className="text-muted">{locale === 'it' ? 'Stato ordine' : 'Order'}: </span>
          {fulfillmentLabel}
        </p>
        <p className="mt-2 text-sm">
          <span className="text-muted">Total: </span>
          {formatEur(order.total_amount, locale)}
        </p>
        <ul className="mt-6 space-y-2 border-t border-line pt-4 text-sm">
          {order.items?.map((item, index) => (
            <li key={`${item.product_name}-${index}`} className="flex justify-between gap-3">
              <span>
                {item.product_name} × {item.quantity}
              </span>
              <span>{formatEur(item.line_total, locale)}</span>
            </li>
          ))}
        </ul>
      </div>

      {hasTracking ? (
        <div className="mt-6 max-w-xl border border-line p-6">
          <p className="text-xs tracking-[0.16em] text-muted uppercase">
            {locale === 'it' ? 'Spedizione' : 'Shipment'}
          </p>
          {order.shipment?.carrier ? (
            <p className="mt-3 text-sm">
              <span className="text-muted">{locale === 'it' ? 'Corriere' : 'Carrier'}: </span>
              {order.shipment.carrier}
            </p>
          ) : null}
          {order.shipment?.tracking_number ? (
            <p className="mt-2 text-sm">
              <span className="text-muted">Tracking: </span>
              {order.shipment.tracking_number}
            </p>
          ) : null}
          {order.shipment?.tracking_url ? (
            <a
              href={order.shipment.tracking_url}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block border border-ink px-4 py-2 text-xs tracking-[0.16em] uppercase"
            >
              {locale === 'it' ? 'Segui la spedizione' : 'Track shipment'}
            </a>
          ) : null}
        </div>
      ) : null}

      <div className="mt-10 flex flex-wrap gap-3">
        {failed ? (
          <Link
            href={`/${locale}/checkout`}
            className="inline-block bg-ink px-5 py-2 text-xs tracking-[0.16em] text-ivory uppercase"
          >
            {locale === 'it' ? 'Torna al checkout' : 'Back to checkout'}
          </Link>
        ) : null}
        <Link
          href={`/${locale}/women`}
          className="inline-block border border-ink px-5 py-2 text-xs tracking-[0.16em] uppercase"
        >
          {locale === 'it' ? 'Torna allo shop' : 'Back to shop'}
        </Link>
      </div>
    </main>
  );
}
