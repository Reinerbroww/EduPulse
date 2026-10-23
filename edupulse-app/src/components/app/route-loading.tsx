export default function RouteLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="flex flex-col gap-2">
        <div className="h-7 w-48 max-w-full animate-pulse rounded bg-border" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-border" />
      </div>
      <div className="h-32 w-full animate-pulse rounded-[var(--radius-card)] bg-border" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-24 w-full animate-pulse rounded-[var(--radius-card)] bg-border" />
        <div className="h-24 w-full animate-pulse rounded-[var(--radius-card)] bg-border" />
      </div>
    </div>
  );
}
