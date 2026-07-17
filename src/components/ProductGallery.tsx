'use client';

import { useEffect, useState } from 'react';

export function ProductGallery({
  images,
  title,
}: {
  images: Array<{ url: string | null; is_primary: boolean; position: number }>;
  title: string;
}) {
  const ordered = [...images].sort((a, b) => a.position - b.position);
  const initial =
    ordered.findIndex((i) => i.is_primary && i.url) >= 0
      ? ordered.findIndex((i) => i.is_primary && i.url)
      : ordered.findIndex((i) => i.url);
  const [active, setActive] = useState(Math.max(0, initial));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (ordered.length < 2) return;
      if (e.key === 'ArrowRight') {
        setActive((i) => (i + 1) % ordered.length);
      }
      if (e.key === 'ArrowLeft') {
        setActive((i) => (i - 1 + ordered.length) % ordered.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [ordered.length]);

  const current = ordered[active];

  return (
    <div className="grid gap-4 md:grid-cols-[80px_1fr] md:gap-5">
      {ordered.length > 1 ? (
        <div className="order-2 flex gap-2.5 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible md:pb-0">
          {ordered.map((image, index) =>
            image.url ? (
              <button
                key={`${image.url}-${index}`}
                type="button"
                onClick={() => setActive(index)}
                className={`relative aspect-[3/4] h-20 w-auto shrink-0 overflow-hidden border transition md:h-auto md:w-full ${
                  active === index ? 'border-ink' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
                aria-label={`Image ${index + 1}`}
                aria-current={active === index}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt=""
                  className="h-full w-full object-cover object-[center_18%]"
                />
              </button>
            ) : null,
          )}
        </div>
      ) : (
        <div className="hidden md:block" />
      )}

      <div className="group relative order-1 aspect-[3/4] overflow-hidden bg-ivory-2 md:order-2">
        {current?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={title}
            className="img-zoom h-full w-full object-cover object-[center_18%]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="harimi-mark text-xs text-muted">HARIMI</span>
          </div>
        )}
      </div>
    </div>
  );
}
