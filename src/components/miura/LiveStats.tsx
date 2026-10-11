import { totalStars } from "../../lib/github";
import type { GithubData } from "../../hooks/useGithubData";
import { CreasePin, LiveStamp } from "./bits";

const compact = new Intl.NumberFormat("en", { notation: "compact" });

/**
 * Push events in the recent window. The events API omits per-push commit
 * lists for some pushes; those count as one push each, matching the
 * describeEvents convention elsewhere in this codebase.
 */
function recentPushes(data: NonNullable<GithubData["data"]>): number {
  let n = 0;
  for (const ev of data.events) {
    if (ev.type === "PushEvent") {
      n += Array.isArray(ev.payload?.commits) ? ev.payload.commits.length : 1;
    }
  }
  return n;
}

function Stat({
  label,
  value,
  sub,
  delay,
}: {
  label: string;
  value: string;
  sub?: string;
  delay: string;
}) {
  return (
    <div className="flex flex-col items-start">
      <div className={`anim-pin ${delay} mb-3 flex items-center gap-2`}>
        <CreasePin />
        <LiveStamp />
      </div>
      <p className="font-mono text-[11px] font-medium tracking-[0.28em] text-ink-soft">
        {label}
      </p>
      <p className="tnum mt-1 font-display text-5xl font-bold text-ink sm:text-6xl">
        {value}
      </p>
      {sub && (
        <p className="mt-1 font-mono text-[10px] tracking-[0.18em] text-ink-faint">
          {sub}
        </p>
      )}
    </div>
  );
}

/**
 * Three stats pinned at crease intersections. Every number is live
 * from the GitHub API; zero-value stats stay hidden (adaptive honesty).
 */
export function LiveStats({ github }: { github: GithubData }) {
  const { status, data } = github;

  if (status === "error" && !data) return null;

  if (!data) {
    return (
      <section aria-label="Live statistics" className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-16 sm:px-10 sm:pt-20">
        <div className="grid grid-cols-3 gap-6" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2">
              <div className="h-4 w-16 animate-pulse rounded-[2px] bg-ink/10" />
              <div className="h-10 w-24 animate-pulse rounded-[2px] bg-ink/10" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const stats = [
    { label: "REPOS", value: compact.format(data.user.public_repos) },
    { label: "STARS", value: compact.format(totalStars(data.repos)) },
    {
      label: "PUSHES",
      value: compact.format(recentPushes(data)),
      sub: "LAST 30 EVENTS",
    },
  ].filter((s) => s.value !== "0");

  if (stats.length === 0) return null;

  return (
    <section
      aria-label="Live GitHub statistics"
      className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-14 sm:px-10 sm:pt-20"
    >
      <div className="flex flex-wrap items-start justify-center gap-14 sm:gap-24">
        {stats.map((s, i) => (
          <Stat
            key={s.label}
            label={s.label}
            value={s.value}
            sub={s.sub}
            delay={`d-${i + 2}`}
          />
        ))}
      </div>
    </section>
  );
}
