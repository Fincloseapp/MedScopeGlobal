export function V19ArticleBriefSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-4" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-5"
        >
          <div className="mb-3 h-3 w-24 rounded bg-slate-200" />
          <div className="mb-2 h-6 w-4/5 max-w-md rounded bg-slate-200" />
          <div className="mb-4 h-3 w-20 rounded bg-slate-100" />
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-slate-100" />
            <div className="h-3 w-[92%] rounded bg-slate-100" />
          </div>
          <div className="mt-4 space-y-2 pl-2">
            <div className="h-3 w-[88%] rounded bg-slate-100" />
            <div className="h-3 w-[80%] rounded bg-slate-100" />
            <div className="h-3 w-[75%] rounded bg-slate-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
