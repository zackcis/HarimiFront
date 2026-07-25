'use client';

import { useEffect, useRef, useState } from 'react';

const HOLD_MS = 1500;
const FADE_MS = 700;

export function HomeHeroMedia({
  image,
  mp4,
  webm,
}: {
  image: string | null;
  mp4: string | null;
  webm: string | null;
}) {
  const hasVideo = Boolean(mp4 || webm);
  const hasImage = Boolean(image);
  const both = hasVideo && hasImage;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideo, setShowVideo] = useState(!both && hasVideo);

  useEffect(() => {
    if (!both) {
      setShowVideo(hasVideo);
      return;
    }

    setShowVideo(false);
    const timer = window.setTimeout(() => {
      setShowVideo(true);
      const el = videoRef.current;
      if (el) {
        void el.play().catch(() => {
          /* autoplay may be blocked; muted + playsInline usually ok */
        });
      }
    }, HOLD_MS);

    return () => window.clearTimeout(timer);
  }, [both, hasVideo, image, mp4, webm]);

  if (!hasVideo && !hasImage) {
    return (
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_30%,rgba(247,243,236,0.16),transparent_50%),linear-gradient(135deg,#161616,#0a0a0a)]"
        aria-hidden
      />
    );
  }

  if (hasVideo && !hasImage) {
    return (
      <video
        className="absolute inset-0 h-full w-full object-cover opacity-70 hero-media"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        aria-hidden
        suppressHydrationWarning
      >
        {webm ? <source src={webm} type="video/webm" /> : null}
        {mp4 ? <source src={mp4} type="video/mp4" /> : null}
      </video>
    );
  }

  if (hasImage && !hasVideo) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image!}
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-70 hero-media"
        suppressHydrationWarning
      />
    );
  }

  // Both: hold still 1.5s, then crossfade to video
  return (
    <div className="absolute inset-0" aria-hidden>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        muted
        loop
        playsInline
        preload="auto"
        suppressHydrationWarning
        style={{
          opacity: showVideo ? 0.7 : 0,
          transition: `opacity ${FADE_MS}ms var(--ease-out-expo, ease)`,
        }}
      >
        {webm ? <source src={webm} type="video/webm" /> : null}
        {mp4 ? <source src={mp4} type="video/mp4" /> : null}
      </video>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image!}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        suppressHydrationWarning
        style={{
          opacity: showVideo ? 0 : 0.7,
          transition: `opacity ${FADE_MS}ms var(--ease-out-expo, ease)`,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}
