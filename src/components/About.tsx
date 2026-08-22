import { useEffect } from "react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { reveal } from "../lib/animations";
import { profile } from "../config/profile";
import { Section } from "./Section";

/** Info-panel rows — unconfigured fields are hidden entirely. */
function panelRows() {
  const rows: { label: string; value: string }[] = [
    { label: "Name", value: profile.name },
    { label: "GitHub", value: `@${profile.username}` },
    { label: "Email", value: profile.email },
    { label: "Location", value: profile.location },
    { label: "Focus", value: profile.focus },
    { label: "Interests", value: profile.interests },
    { label: "Currently learning", value: profile.learning },
    { label: "Favorite technologies", value: profile.favorites },
  ];
  return rows.filter((r) => r.value.trim() !== "");
}

export function About() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (inView && ref.current) reveal(ref.current.children, reduced);
  }, [inView, reduced, ref]);

  return (
    <Section id="about">
      <div
        ref={ref}
        className="mt-2 grid gap-12 md:grid-cols-[1.25fr_1fr] md:gap-16"
      >
        <div className={inView ? "" : "opacity-0"}>
          <p className="text-gradient font-mono text-xs font-medium uppercase tracking-[0.2em]">
            About
          </p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Curious builder, comfortable
            <br className="hidden sm:block" /> outside the comfort zone.
          </h2>
          <p className="mt-6 leading-relaxed text-muted">
            I'm Chris —{" "}
            {profile.bio.charAt(0).toLowerCase() + profile.bio.slice(1)} Most
            of what I do lives on GitHub: small apps, experiments, and the
            occasional contribution to other people's projects.
          </p>
          <p className="mt-4 leading-relaxed text-muted">
            I like the part of software where an idea turns into something you
            can actually run — and I'd rather build, break, and rebuild than
            wait for the perfect plan.
          </p>
        </div>

        <div
          className={`card-glow h-fit rounded-2xl border border-line bg-surface p-6 ${
            inView ? "" : "opacity-0"
          }`}
        >
          <dl className="space-y-4">
            {panelRows().map((row) => (
              <div
                key={row.label}
                className="flex flex-col gap-1 border-b border-line pb-4 last:border-b-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between"
              >
                <dt className="font-mono text-xs uppercase tracking-wider text-faint">
                  {row.label}
                </dt>
                <dd className="text-sm text-fg">
                  {row.label === "GitHub" ? (
                    <a
                      href={profile.social.github}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-accent hover:underline"
                    >
                      {row.value}
                    </a>
                  ) : row.label === "Email" ? (
                    <a
                      href={`mailto:${row.value}`}
                      className="text-accent hover:underline"
                    >
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Section>
  );
}
