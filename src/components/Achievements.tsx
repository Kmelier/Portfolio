import { manualAchievements } from "../config/achievements";
import { skillCategories } from "../config/skills";
import type { GithubData } from "../hooks/useGithubData";
import { totalStars } from "../lib/github";
import { StatTile } from "./StatTile";

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
          <StatTile key={c.label} label={c.label} value={c.value} variant="counter" />
        ))}
      </div>
    </section>
  );
}
