export default function Loading() {
  return (
    <main>
      <div className="container-wide grid gap-12 py-12 md:grid-cols-2 md:gap-20 md:py-20 lg:gap-24">
        <div className="skeleton aspect-3/4 w-full" />
        <div className="space-y-6">
          <div className="skeleton h-3 w-24" />
          <div className="skeleton h-10 w-3/4" />
          <div className="skeleton h-5 w-24" />
          <div className="skeleton h-10 w-2/3" />
          <div className="skeleton h-11 w-40" />
          <div className="skeleton h-12 w-full" />
        </div>
      </div>
    </main>
  );
}
