import Link from 'next/link';

export function EmptyState({
  title,
  body,
  actionHref,
  actionLabel,
}: {
  title: string;
  body: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="border border-line px-6 py-16 text-center page-enter md:px-10 md:py-20">
      <p className="harimi-mark text-[10px] text-muted">HARIMI</p>
      <p className="mt-6 font-serif text-2xl md:text-3xl">{title}</p>
      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted">{body}</p>
      {actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="mt-10 inline-block border border-ink px-6 py-3 text-[11px] tracking-[0.18em] uppercase transition hover:bg-ink hover:text-ivory"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden />;
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-4">
          <SkeletonBlock className="aspect-[3/4] w-full" />
          <SkeletonBlock className="h-3 w-1/3" />
          <SkeletonBlock className="h-5 w-2/3" />
          <SkeletonBlock className="h-3 w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function HeroSkeleton({ tall = false }: { tall?: boolean }) {
  return (
    <div
      className={`skeleton w-full ${tall ? 'min-h-[88vh]' : 'min-h-[70vh]'}`}
      aria-hidden
    />
  );
}
