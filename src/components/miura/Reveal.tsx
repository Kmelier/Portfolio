import type { ReactNode } from "react";
import { useInView } from "../../hooks/useInView";

/**
 * One-shot scroll reveal: quiet rise, exponential ease-out.
 * Renders final state immediately under prefers-reduced-motion
 * (the .reveal transition is inert there by CSS).
 */
export function Reveal({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal${inView ? " is-in" : ""} ${className}`}>
      {children}
    </div>
  );
}
