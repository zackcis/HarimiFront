'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GalleryViewer } from '@/components/GalleryViewer';

export function ProductGallery({
  images,
  title,
}: {
  images: Array<{ url: string | null; is_primary: boolean; position: number }>;
  title: string;
}) {
  const ordered = [...images]
    .sort((a, b) => a.position - b.position)
    .filter((i): i is { url: string; is_primary: boolean; position: number } =>
      Boolean(i.url),
    );
  const initial = Math.max(
    0,
    ordered.findIndex((i) => i.is_primary),
  );
  const [active, setActive] = useState(initial === -1 ? 0 : initial);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const railRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);

  const scrollToIndex = useCallback((index: number) => {
    const el = slideRefs.current[index];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', inline: 'start', block: 'nearest' });
    setActive(index);
  }, []);

  const openViewer = useCallback((index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail || ordered.length < 2) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const idx = Number((visible.target as HTMLElement).dataset.index);
        if (!Number.isNaN(idx)) setActive(idx);
      },
      { root: rail, threshold: [0.55, 0.7] },
    );

    for (const slide of slideRefs.current) {
      if (slide) observer.observe(slide);
    }
    return () => observer.disconnect();
  }, [ordered.length]);

  useEffect(() => {
    if (viewerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (ordered.length < 2) return;
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        scrollToIndex((active + 1) % ordered.length);
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        scrollToIndex((active - 1 + ordered.length) % ordered.length);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, ordered.length, scrollToIndex, viewerOpen]);

  if (ordered.length === 0) {
    return (
      <div className="flex aspect-3/4 items-center justify-center bg-ivory-2">
        <span className="harimi-mark text-xs text-muted">HARIMI</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:gap-4">
      <div
        ref={railRef}
        className="gallery-rail scroll-rail -mx-(--gutter) flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-(--gutter) sm:mx-0 sm:gap-3.5 sm:px-0"
        tabIndex={0}
        aria-label={title}
      >
        {ordered.map((image, index) => (
          <div
            key={`${image.url}-${index}`}
            ref={(node) => {
              slideRefs.current[index] = node;
            }}
            data-index={index}
            className="gallery-slide relative aspect-3/4 w-[82vw] max-w-[480px] shrink-0 snap-start overflow-hidden bg-ivory-2 sm:w-[52%] sm:max-w-none lg:w-[56%]"
          >
            <button
              type="button"
              onClick={() => openViewer(index)}
              className="absolute inset-0 cursor-zoom-in"
              aria-label={`View image ${index + 1} of ${ordered.length}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt={index === 0 ? title : ''}
                className="h-full w-full object-cover object-[center_18%]"
                draggable={false}
              />
            </button>
          </div>
        ))}
      </div>

      {ordered.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-0.5">
          {ordered.map((image, index) => (
            <button
              key={`thumb-${image.url}-${index}`}
              type="button"
              onClick={() => scrollToIndex(index)}
              className={`relative aspect-3/4 h-14 w-auto shrink-0 overflow-hidden border transition-[opacity,border-color] duration-(--dur-fast) sm:h-16 ${
                active === index
                  ? 'border-ink opacity-100'
                  : 'border-transparent opacity-50 hover:opacity-100'
              }`}
              aria-label={`${title} — ${index + 1}`}
              aria-current={active === index ? 'true' : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.url}
                alt=""
                className="h-full w-full object-cover object-[center_18%]"
              />
            </button>
          ))}
        </div>
      ) : null}

      {viewerOpen ? (
        <GalleryViewer
          images={ordered.map((img) => ({ url: img.url }))}
          title={title}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
        />
      ) : null}
    </div>
  );
}
