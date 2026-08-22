import type { ReactNode } from "react";
import { useReveal } from "../hooks/useReveal";

interface SectionHeadingProps {
  kicker: string;
  title: string;
  sub?: string;
}

/** Centered section heading with mono kicker, revealed on scroll. */
export function SectionHeading({ kicker, title, sub }: SectionHeadingProps) {
  const { ref, revealClass } = useReveal<HTMLDivElement>();

  return (
    <div
      ref={ref}
      className={`mx-auto max-w-2xl text-center ${revealClass}`}
    >
      <p className="text-gradient font-mono text-xs font-medium uppercase tracking-[0.2em]">
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
      className={`cv-auto relative mx-auto max-w-6xl px-6 py-24 sm:py-28 ${className}`}
    >
      {children}
    </section>
  );
}
