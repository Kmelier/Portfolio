import { manualAchievements } from "../config/achievements";
import { skillCategories } from "../config/skills";
import type { GithubData } from "../hooks/useGithubData";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { countUp } from "../lib/animations";
import { totalStars } from "../lib/github";
import { useRef, useEffect } from "react";

function Counter({ label, value }: { label: string; value: number }) {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();
  const valueRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (inView && valueRef.current) countUp(valueRef.current, value, reduced);
  }, [inView, value, reduced]);

  return (
    <div
      ref={ref}
      className="card-glow rounded-2xl border border-line bg-surface px-6 py-8 text-center"
    >
      <span
        ref={valueRef}
        aria-label={`${label}: ${value}`}
        className="text-3xl font-semibold tracking-tight"
      >
        {value}
      </span>
      <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-faint">
        {label}
      </p>
    </div>
  );
}

/**
 * Subtle stats band. Values that are zero/unset are hidden; the whole
 * section only appears once at least 3 real values exist, so a young
 * GitHub profile never shows a wall of zeros.
 */
export function Achievements({ github }: { github: GithubData }) {
  const technologies = skillCategories.reduce(
    (sum, c) => sum + c.skills.length,
    0,
  );
  const stars = github.data ? totalStars(github.data.repos) : 0;

  const candidates = [
    { label: "GitHub repositories", value: github.data?.user.public_repos ?? 0 },
    { label: "Total stars earned", value: stars },
    { label: "Technologies used", value: technologies },
    { label: "Projects built", value: manualAchievements.projectsBuilt },
    { label: "Hackathons", value: manualAchievements.hackathons },
    { label: "Contributions", value: manualAchievements.contributions },
  ].filter((c) => c.value > 0);

  if (candidates.length < 3) return null;

  return (
    <section
      id="achievements"
      aria-label="Achievements"
      className="mx-auto max-w-6xl px-6 pb-24 sm:pb-28"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {candidates.map((c) => (
          <Counter key={c.label} label={c.label} value={c.value} />
        ))}
      </div>
    </section>
  );
}
