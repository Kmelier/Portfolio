export function CardSkeleton() {
  return (
    <div
      aria-hidden
      className="flex h-full min-h-56 flex-col rounded-2xl border border-line bg-surface p-5"
    >
      <div className="flex items-start justify-between">
        <div className="skeleton h-9 w-9 rounded-lg" />
        <div className="flex gap-2">
          <div className="skeleton h-7 w-7 rounded-md" />
          <div className="skeleton h-7 w-7 rounded-md" />
        </div>
      </div>
      <div className="skeleton mt-5 h-5 w-1/2" />
      <div className="skeleton mt-3 h-3.5 w-full" />
      <div className="skeleton mt-2 h-3.5 w-4/5" />
      <div className="mt-auto flex items-center gap-3 pt-6">
        <div className="skeleton h-3 w-16" />
        <div className="skeleton ml-auto h-3 w-14" />
      </div>
    </div>
  );
}

export function StatsSkeleton() {
  return (
    <div aria-hidden className="rounded-2xl border border-line bg-surface p-6">
      <div className="flex items-center gap-4">
        <div className="skeleton h-16 w-16 rounded-2xl" />
        <div className="space-y-2">
          <div className="skeleton h-4 w-32" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="skeleton h-20 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
