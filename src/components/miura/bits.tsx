/** Deep-red LIVE stamp — the only place red appears on the sheet. */
export function LiveStamp({ className = "" }: { className?: string }) {
  return (
    <span
      className={`live-stamp inline-block rounded-[3px] bg-paper px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.18em] ${className}`}
    >
      LIVE
    </span>
  );
}

export function CreasePin({ className = "" }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 16 20" className={`h-5 w-4 ${className}`}>
      <path
        d="M8 0C3.6 0 0 3.6 0 8c0 6 8 12 8 12s8-6 8-12c0-4.4-3.6-8-8-8z"
        fill="var(--color-ink)"
      />
      <circle cx="8" cy="8" r="3" fill="var(--color-paper)" />
    </svg>
  );
}
