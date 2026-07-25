'use client';

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { createPortal } from 'react-dom';
import {
  clampZoom,
  CROSSFADE_MS,
  GESTURE_LOCK_PX,
  roundZoom,
  SWIPE_AXIS_RATIO,
  SWIPE_THRESHOLD_PX,
  TAP_SLOP_PX,
  zoomTowardPoint,
  ZOOM_MAX,
  ZOOM_MIN,
  ZOOM_STEP,
  ZOOM_TOGGLE,
} from '@/lib/gallery-viewer';

type GalleryImage = { url: string; alt?: string };

type Props = {
  images: GalleryImage[];
  title: string;
  initialIndex?: number;
  onClose: () => void;
};

type Point = { x: number; y: number };
type GestureMode = 'pending' | 'pan' | 'swipe' | 'pinch' | 'none';

function dist(a: Point, b: Point) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function mid(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function IconClose({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconMinus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="1.25">
      <path d="M5 12h14" />
    </svg>
  );
}

export function GalleryViewer({
  images,
  title,
  initialIndex = 0,
  onClose,
}: Props) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  const [index, setIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, images.length - 1)),
  );
  const [scale, setScale] = useState(ZOOM_MIN);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [visible, setVisible] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [imgOpacity, setImgOpacity] = useState(1);
  const [fadeUrl, setFadeUrl] = useState<string | null>(null);
  const [fadeOpacity, setFadeOpacity] = useState(0);

  const pointers = useRef<Map<number, Point>>(new Map());
  const panOrigin = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);
  const pinchOrigin = useRef<{
    distance: number;
    scale: number;
    tx: number;
    ty: number;
  } | null>(null);
  const swipeOrigin = useRef<{ x: number; y: number } | null>(null);
  const gestureMode = useRef<GestureMode>('none');
  const lastTap = useRef(0);
  const reduceMotion = useRef(false);
  const transformRef = useRef({ scale: ZOOM_MIN, tx: 0, ty: 0 });
  const indexRef = useRef(index);
  const fadeTimer = useRef<number | null>(null);

  useEffect(() => {
    transformRef.current = { scale, tx, ty };
  }, [scale, tx, ty]);

  useEffect(() => {
    indexRef.current = index;
  }, [index]);

  const resetTransform = useCallback(() => {
    setScale(ZOOM_MIN);
    setTx(0);
    setTy(0);
    transformRef.current = { scale: ZOOM_MIN, tx: 0, ty: 0 };
  }, []);

  const applyTransform = useCallback((next: { scale: number; tx: number; ty: number }) => {
    transformRef.current = next;
    setScale(next.scale);
    setTx(next.tx);
    setTy(next.ty);
  }, []);

  const goTo = useCallback(
    (next: number) => {
      if (images.length === 0) return;
      const i = ((next % images.length) + images.length) % images.length;
      if (i === indexRef.current) return;

      const prevUrl = images[indexRef.current]?.url ?? null;

      if (fadeTimer.current != null) {
        window.clearTimeout(fadeTimer.current);
        fadeTimer.current = null;
      }

      if (reduceMotion.current || !prevUrl) {
        setIndex(i);
        resetTransform();
        setImgOpacity(1);
        setFadeUrl(null);
        setFadeOpacity(0);
        return;
      }

      // Crossfade: hold previous as overlay while new image fades in
      setFadeUrl(prevUrl);
      setFadeOpacity(1);
      setImgOpacity(0);
      setIndex(i);
      resetTransform();

      requestAnimationFrame(() => {
        setFadeOpacity(0);
        setImgOpacity(1);
      });

      fadeTimer.current = window.setTimeout(() => {
        setFadeUrl(null);
        fadeTimer.current = null;
      }, CROSSFADE_MS);
    },
    [images, resetTransform],
  );

  const setZoom = useCallback(
    (next: number) => {
      const { scale: s, tx: x, ty: y } = transformRef.current;
      applyTransform(zoomTowardPoint(s, x, y, next, 0, 0));
    },
    [applyTransform],
  );

  const toggleZoom = useCallback(() => {
    const { scale: s, tx: x, ty: y } = transformRef.current;
    const next = s > ZOOM_MIN + 0.01 ? ZOOM_MIN : ZOOM_TOGGLE;
    applyTransform(zoomTowardPoint(s, x, y, next, 0, 0));
  }, [applyTransform]);

  // Mount + open fade + scroll lock + focus
  useEffect(() => {
    setMounted(true);
    reduceMotion.current =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const id = requestAnimationFrame(() => {
      setVisible(true);
      closeRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(id);
      document.body.style.overflow = prev;
      if (fadeTimer.current != null) window.clearTimeout(fadeTimer.current);
    };
  }, []);

  // Wheel: zoom toward cursor
  useEffect(() => {
    if (!mounted) return;
    const stage = stageRef.current;
    if (!stage) return;

    const onWheelNative = (e: WheelEvent) => {
      e.preventDefault();
      const rect = stage.getBoundingClientRect();
      const ox = e.clientX - rect.left - rect.width / 2;
      const oy = e.clientY - rect.top - rect.height / 2;
      const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
      const { scale: s, tx: x, ty: y } = transformRef.current;
      applyTransform(zoomTowardPoint(s, x, y, s + delta, ox, oy));
    };

    stage.addEventListener('wheel', onWheelNative, { passive: false });
    return () => stage.removeEventListener('wheel', onWheelNative);
  }, [mounted, applyTransform]);

  const requestClose = useCallback(() => {
    if (reduceMotion.current) {
      onClose();
      return;
    }
    setVisible(false);
    window.setTimeout(onClose, 200);
  }, [onClose]);

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        requestClose();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goTo(indexRef.current + 1);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goTo(indexRef.current - 1);
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(transformRef.current.scale + ZOOM_STEP);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(transformRef.current.scale - ZOOM_STEP);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goTo, requestClose, setZoom]);

  // Focus trap
  useEffect(() => {
    const root = rootRef.current;
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

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (!stage) return;
    stage.setPointerCapture(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    gestureMode.current = 'pending';

    if (pointers.current.size === 1) {
      const { scale: s, tx: x, ty: y } = transformRef.current;
      if (s > ZOOM_MIN) {
        panOrigin.current = { x: e.clientX, y: e.clientY, tx: x, ty: y };
        gestureMode.current = 'pan';
        setDragging(true);
      } else {
        swipeOrigin.current = { x: e.clientX, y: e.clientY };
        panOrigin.current = null;
      }
    } else if (pointers.current.size === 2) {
      const pts = [...pointers.current.values()];
      const { scale: s, tx: x, ty: y } = transformRef.current;
      pinchOrigin.current = {
        distance: dist(pts[0], pts[1]),
        scale: s,
        tx: x,
        ty: y,
      };
      panOrigin.current = null;
      swipeOrigin.current = null;
      gestureMode.current = 'pinch';
      setDragging(false);
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (pointers.current.size === 2 && pinchOrigin.current) {
      gestureMode.current = 'pinch';
      const pts = [...pointers.current.values()];
      const d = dist(pts[0], pts[1]);
      if (pinchOrigin.current.distance > 0) {
        const nextScale =
          pinchOrigin.current.scale * (d / pinchOrigin.current.distance);
        // Pinch toward midpoint relative to stage center
        const stage = stageRef.current;
        if (stage) {
          const rect = stage.getBoundingClientRect();
          const m = mid(pts[0], pts[1]);
          const ox = m.x - rect.left - rect.width / 2;
          const oy = m.y - rect.top - rect.height / 2;
          applyTransform(
            zoomTowardPoint(
              pinchOrigin.current.scale,
              pinchOrigin.current.tx,
              pinchOrigin.current.ty,
              nextScale,
              ox,
              oy,
            ),
          );
        } else {
          const z = roundZoom(clampZoom(nextScale));
          applyTransform({
            scale: z,
            tx: z <= ZOOM_MIN ? 0 : pinchOrigin.current.tx,
            ty: z <= ZOOM_MIN ? 0 : pinchOrigin.current.ty,
          });
        }
      }
      return;
    }

    if (pointers.current.size !== 1) return;

    // Lock gesture: pan when zoomed, or swipe vs cancel when at fit
    if (gestureMode.current === 'pan' && panOrigin.current) {
      const p = panOrigin.current;
      applyTransform({
        scale: transformRef.current.scale,
        tx: p.tx + (e.clientX - p.x),
        ty: p.ty + (e.clientY - p.y),
      });
      return;
    }

    if (swipeOrigin.current && transformRef.current.scale <= ZOOM_MIN) {
      const dx = e.clientX - swipeOrigin.current.x;
      const dy = e.clientY - swipeOrigin.current.y;
      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      if (gestureMode.current === 'pending') {
        if (absX < GESTURE_LOCK_PX && absY < GESTURE_LOCK_PX) return;
        if (absX >= absY * SWIPE_AXIS_RATIO) {
          gestureMode.current = 'swipe';
        } else {
          // Vertical-dominant: not a gallery swipe
          gestureMode.current = 'none';
        }
      }
    }
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const stage = stageRef.current;
    if (stage?.hasPointerCapture(e.pointerId)) {
      stage.releasePointerCapture(e.pointerId);
    }
    pointers.current.delete(e.pointerId);

    if (pointers.current.size < 2) {
      pinchOrigin.current = null;
    }

    if (pointers.current.size !== 0) return;

    const mode = gestureMode.current;
    const start = swipeOrigin.current;
    const pan = panOrigin.current;

    const movedFromSwipe = start
      ? Math.hypot(e.clientX - start.x, e.clientY - start.y)
      : 0;
    const movedFromPan = pan
      ? Math.hypot(e.clientX - pan.x, e.clientY - pan.y)
      : 0;
    const moved = Math.max(movedFromSwipe, movedFromPan);

    if (mode === 'swipe' && start && transformRef.current.scale <= ZOOM_MIN) {
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (
        Math.abs(dx) >= SWIPE_THRESHOLD_PX &&
        Math.abs(dx) >= Math.abs(dy) * SWIPE_AXIS_RATIO
      ) {
        goTo(dx < 0 ? indexRef.current + 1 : indexRef.current - 1);
      }
    } else if (mode !== 'pinch' && moved < TAP_SLOP_PX) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // Double-tap toward tap point
        const stageEl = stageRef.current;
        if (stageEl) {
          const rect = stageEl.getBoundingClientRect();
          const ox = e.clientX - rect.left - rect.width / 2;
          const oy = e.clientY - rect.top - rect.height / 2;
          const { scale: s, tx: x, ty: y } = transformRef.current;
          const next = s > ZOOM_MIN + 0.01 ? ZOOM_MIN : ZOOM_TOGGLE;
          applyTransform(zoomTowardPoint(s, x, y, next, ox, oy));
        } else {
          toggleZoom();
        }
        lastTap.current = 0;
      } else {
        lastTap.current = now;
      }
    }

    panOrigin.current = null;
    swipeOrigin.current = null;
    gestureMode.current = 'none';
    setDragging(false);
  };

  const onDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const stage = stageRef.current;
    if (!stage) {
      toggleZoom();
      return;
    }
    const rect = stage.getBoundingClientRect();
    const ox = e.clientX - rect.left - rect.width / 2;
    const oy = e.clientY - rect.top - rect.height / 2;
    const { scale: s, tx: x, ty: y } = transformRef.current;
    const next = s > ZOOM_MIN + 0.01 ? ZOOM_MIN : ZOOM_TOGGLE;
    applyTransform(zoomTowardPoint(s, x, y, next, ox, oy));
  };

  if (!mounted || images.length === 0) return null;

  const current = images[index];
  const fadeClass = reduceMotion.current
    ? 'opacity-100'
    : visible
      ? 'opacity-100'
      : 'opacity-0';

  const imgTransition = reduceMotion.current
    ? 'none'
    : `opacity ${CROSSFADE_MS}ms var(--ease-out-expo)`;

  const content = (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={`fixed inset-0 z-100 flex flex-col bg-ivory transition-opacity duration-(--dur-base) ${fadeClass}`}
    >
      <h2 id={titleId} className="sr-only">
        {title} — {index + 1} / {images.length}
      </h2>

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between p-4 md:p-5">
        <p className="pointer-events-none text-[11px] tracking-[0.14em] text-muted uppercase md:hidden">
          {index + 1} / {images.length}
        </p>
        <div className="pointer-events-auto ml-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setZoom(scale - ZOOM_STEP)}
            disabled={scale <= ZOOM_MIN}
            className="tap hidden h-11 w-11 items-center justify-center text-ink transition-opacity duration-(--dur-fast) hover:opacity-70 disabled:opacity-30 md:inline-flex"
            aria-label="Zoom out"
          >
            <IconMinus className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setZoom(scale + ZOOM_STEP)}
            disabled={scale >= ZOOM_MAX}
            className="tap hidden h-11 w-11 items-center justify-center text-ink transition-opacity duration-(--dur-fast) hover:opacity-70 disabled:opacity-30 md:inline-flex"
            aria-label="Zoom in"
          >
            <IconPlus className="h-5 w-5" />
          </button>
          <button
            ref={closeRef}
            type="button"
            onClick={requestClose}
            className="tap inline-flex h-11 w-11 items-center justify-center text-ink transition-opacity duration-(--dur-fast) hover:opacity-70"
            aria-label="Close gallery"
          >
            <IconClose className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 md:grid md:grid-cols-[4.5rem_minmax(0,1fr)] md:gap-6 md:px-5 md:pt-16 md:pb-5">
        <div className="hidden overflow-y-auto md:block">
          <ul className="flex flex-col gap-2 py-1">
            {images.map((img, i) => (
              <li key={`${img.url}-${i}`}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`${title} — ${i + 1}`}
                  aria-current={i === index ? 'true' : undefined}
                  className={`relative block aspect-3/4 w-full overflow-hidden border transition-[opacity,border-color] duration-(--dur-fast) ${
                    i === index
                      ? 'border-ink opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-100'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt=""
                    className="h-full w-full object-cover object-[center_18%]"
                    draggable={false}
                  />
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative flex min-h-0 flex-1 flex-col">
          <div
            ref={stageRef}
            className={`relative flex min-h-0 flex-1 touch-none items-center justify-center overflow-hidden ${
              scale > ZOOM_MIN
                ? dragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-zoom-in'
            }`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onDoubleClick={onDoubleClick}
          >
            {fadeUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={fadeUrl}
                alt=""
                aria-hidden
                draggable={false}
                className="pointer-events-none absolute max-h-full max-w-full select-none object-contain"
                style={{
                  opacity: fadeOpacity,
                  transition: imgTransition,
                }}
              />
            ) : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={current.url}
              alt={current.alt ?? title}
              draggable={false}
              className="relative max-h-full max-w-full select-none object-contain"
              style={{
                opacity: imgOpacity,
                transition: imgTransition,
                transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
                transformOrigin: 'center center',
                willChange: 'transform, opacity',
              }}
            />
          </div>

          <div className="border-t border-line px-4 py-3 md:hidden">
            <ul className="flex gap-2 overflow-x-auto pb-0.5">
              {images.map((img, i) => (
                <li key={`m-${img.url}-${i}`} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`${title} — ${i + 1}`}
                    aria-current={i === index ? 'true' : undefined}
                    className={`relative block aspect-3/4 h-14 overflow-hidden border transition-[opacity,border-color] duration-(--dur-fast) ${
                      i === index
                        ? 'border-ink opacity-100'
                        : 'border-transparent opacity-50'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt=""
                      className="h-full w-full object-cover object-[center_18%]"
                      draggable={false}
                    />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
