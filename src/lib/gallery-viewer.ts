export const ZOOM_MIN = 1;
export const ZOOM_MAX = 3;
export const ZOOM_STEP = 0.25;
export const ZOOM_TOGGLE = 2;
export const SWIPE_THRESHOLD_PX = 56;
/** Movement before we commit to swipe vs ignore (vertical-dominant). */
export const GESTURE_LOCK_PX = 10;
/** Horizontal must exceed vertical by this ratio to count as a swipe. */
export const SWIPE_AXIS_RATIO = 1.35;
export const TAP_SLOP_PX = 10;
export const CROSSFADE_MS = 150;

export function clampZoom(value: number): number {
  return Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, value));
}

export function roundZoom(value: number): number {
  return Math.round(clampZoom(value) * 100) / 100;
}

/**
 * Keep the content point under (ox, oy) fixed when scale changes.
 * ox/oy are offsets from the stage center (same space as tx/ty).
 */
export function zoomTowardPoint(
  scale: number,
  tx: number,
  ty: number,
  nextScale: number,
  ox: number,
  oy: number,
): { scale: number; tx: number; ty: number } {
  const z = roundZoom(nextScale);
  if (z <= ZOOM_MIN) {
    return { scale: ZOOM_MIN, tx: 0, ty: 0 };
  }
  if (scale <= 0) {
    return { scale: z, tx, ty };
  }
  const ratio = z / scale;
  return {
    scale: z,
    tx: ox - (ox - tx) * ratio,
    ty: oy - (oy - ty) * ratio,
  };
}
