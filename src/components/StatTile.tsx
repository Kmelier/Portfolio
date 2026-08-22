import { useEffect, useRef } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { countUp } from "../lib/animations";

type StatTileVariant = "tile" | "counter";

/** Presentation lives here so call sites never repeat it. */
const VARIANT_CLASSES: Record<StatTileVariant, string> = {
  tile: "tile rounded-xl border border-line bg-elevated px-4 py-4 text-center",
  counter:
    "card-glow rounded-2xl border border-line bg-surface px-6 py-8 text-center",
};

const VARIANT_VALUE_CLASSES: Record<StatTileVariant, string> = {
  tile: "text-2xl font-semibold tracking-tight",
  counter: "text-3xl font-semibold tracking-tight",
};

interface StatTileProps {
  label: string;
  value: number;
  /** "tile" = compact GitHub stat, "counter" = large achievement band. */
  variant?: StatTileVariant;
  /** Render nothing when false (used to hide zero-value stats). */
  show?: boolean;
}

/** Animated number tile — counts up when it enters the viewport. */
export function StatTile({
  label,
  value,
  variant = "tile",
  show = true,
}: StatTileProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const valueRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (inView && valueRef.current) countUp(valueRef.current, value, reduced);
  }, [inView, value, reduced]);

  if (!show) return null;

  return (
    <div ref={ref} className={VARIANT_CLASSES[variant]}>
      <span
        ref={valueRef}
        aria-label={`${label}: ${value}`}
        className={VARIANT_VALUE_CLASSES[variant]}
      >
        {value}
      </span>
      <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-faint">
        {label}
      </p>
    </div>
  );
}
