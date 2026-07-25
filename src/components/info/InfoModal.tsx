'use client';

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export function InfoModal({
  title,
  closeLabel = 'Close',
  onClose,
  children,
}: {
  title: string;
  closeLabel?: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const root = panelRef.current;
    if (!root) return;
    const onTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusable = root.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    root.addEventListener('keydown', onTab);
    return () => root.removeEventListener('keydown', onTab);
  }, []);

  return createPortal(
    <div className="fixed inset-0 z-70 flex items-end justify-center sm:items-center">
      <button
        type="button"
        className="overlay-enter absolute inset-0 bg-ink/40"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="panel-enter relative z-10 flex max-h-[90vh] w-full flex-col bg-ivory outline-none sm:max-h-[86vh] sm:w-[min(560px,92vw)]"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-line px-5 py-4 md:px-6">
          <h2 id={titleId} className="font-serif text-2xl leading-tight text-ink md:text-3xl">
            {title}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={closeLabel}
            className="eyebrow tap shrink-0 text-muted transition-colors duration-(--dur-fast) hover:text-ink"
          >
            {closeLabel}
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-6 md:py-6">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
