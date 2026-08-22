import { useEffect, type ReactNode } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { reveal } from "../lib/animations";

interface SectionHeadingProps {
  kicker: string;
  title: string;
  sub?: string;
}

/** Centered section heading with mono kicker, revealed on scroll. */
export function SectionHeading({ kicker, title, sub }: SectionHeadingProps) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (inView && ref.current) reveal(ref.current, reduced);
  }, [inView, reduced, ref]);

  return (
    <div
      ref={ref}
      className={`mx-auto max-w-2xl text-center ${inView ? "" : "opacity-0"}`}
    >
      <p className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-accent">
        {kicker}
      </p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
        {title}
      </h2>
      {sub && <p className="mt-4 text-base text-muted">{sub}</p>}
    </div>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      className={`mx-auto max-w-6xl px-6 py-24 sm:py-28 ${className}`}
    >
      {children}
    </section>
  );
}
