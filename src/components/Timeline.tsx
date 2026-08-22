import { timeline } from "../config/timeline";
import { Section, SectionHeading } from "./Section";
import { useReveal } from "../hooks/useReveal";

export function Timeline() {
  const { ref, revealClass } = useReveal<HTMLOListElement>();

  return (
    <Section id="journey">
      <SectionHeading
        kicker="Journey"
        title="Experience"
        sub="A short timeline — it grows as the work does."
      />
      <ol ref={ref} className="relative mx-auto mt-14 max-w-xl space-y-10">
        <span
          aria-hidden
          className="absolute bottom-2 left-[7px] top-2 w-px bg-line"
        />
        {timeline.map((entry, i) => (
          <li
            key={entry.period}
            className={`relative pl-8 ${revealClass}`}
          >
            <span
              aria-hidden
              className={`absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 ${
                i === 0
                  ? "border-accent bg-bg"
                  : "border-line bg-bg"
              }`}
            />
            <p className="font-mono text-xs uppercase tracking-wider text-faint">
              {entry.period}
            </p>
            <h3 className="mt-1.5 font-medium">{entry.title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">
              {entry.description}
            </p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
