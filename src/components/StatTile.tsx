import { useEffect, useRef } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { countUp } from "../lib/animations";

interface StatTileProps {
  label: string;
  value: number;
  /** Render nothing when false (used to hide zero-value stats). */
  show?: boolean;
  className?: string;
  valueClassName?: string;
}

/** Animated number tile — counts up when it enters the viewport. */
export function StatTile({
  label,
  value,
  show = true,
  className = "",
  valueClassName = "text-2xl font-semibold tracking-tight",
}: StatTileProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const valueRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (inView && valueRef.current) countUp(valueRef.current, value, reduced);
  }, [inView, value, reduced]);

  if (!show) return null;
  return (
    <div ref={ref} className={className}>
      <span
        ref={valueRef}
        aria-label={`${label}: ${value}`}
        className={valueClassName}
      >
        {value}
      </span>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-faint">
        {label}
      </p>
    </div>
  );
}
