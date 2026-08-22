import {
  GitBranch,
  GitFork,
  GitPullRequest,
  Plus,
  Star,
  type LucideIcon,
} from "lucide-react";
import type { GithubData } from "../hooks/useGithubData";
import { useReveal } from "../hooks/useReveal";
import { timeAgo } from "../lib/format";
import {
  describeEvents,
  totalStars,
  type ActivityItem,
} from "../lib/github";
import { profile } from "../config/profile";
import { Section, SectionHeading } from "./Section";
import { StatsSkeleton } from "./Skeleton";
import { StatTile } from "./StatTile";
import { GithubIcon } from "./icons";

const ACTIVITY_ICONS: Record<ActivityItem["kind"], LucideIcon> = {
  push: GitBranch,
  star: Star,
  fork: GitFork,
  create: Plus,
  pr: GitPullRequest,
  issue: GitPullRequest,
};

export function GithubSection({ github }: { github: GithubData }) {
  const { status, data } = github;
  const { ref, revealClass } = useReveal<HTMLDivElement>();

  const stars = data ? totalStars(data.repos) : 0;
  const activity = data ? describeEvents(data.events).slice(0, 5) : [];

  return (
    <Section id="github">
      <SectionHeading
        kicker="Open Source"
        title="Open Source / GitHub"
        sub="Live from the GitHub API — repositories, stats, and what I've been up to."
      />

      <div className="relative mt-14">
        {/* Aurora glows behind the section content */}
        <div
          aria-hidden
          className="glow-accent pointer-events-none absolute bottom-4 left-1/2 h-[320px] w-[660px] -translate-x-1/2"
        />
        <div
          aria-hidden
          className="glow-accent-2 pointer-events-none absolute right-0 top-20 h-[260px] w-[380px]"
        />
        {data ? (
          <div ref={ref} className="relative">
            <div
              className={`card-glow flex flex-col items-start gap-5 rounded-2xl border border-line bg-surface p-6 sm:flex-row sm:items-center ${revealClass}`}
            >
              <img
                src={data.user.avatar_url}
                alt={`GitHub avatar of ${profile.name}`}
                width={64}
                height={64}
                loading="lazy"
                decoding="async"
                className="h-16 w-16 rounded-2xl border border-line"
              />
              <div className="min-w-0">
                <p className="font-medium">{profile.name}</p>
                <a
                  href={data.user.html_url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-mono text-sm text-accent hover:underline"
                >
                  @{data.user.login}
                </a>
                <p className="mt-1 text-sm text-muted">
                  {data.user.bio ?? profile.bio}
                </p>
              </div>
              <a
                href={data.user.html_url}
                target="_blank"
                rel="noreferrer noopener"
                data-spring
                className="ml-auto inline-flex shrink-0 items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-accent/50"
              >
                <GithubIcon className="h-4 w-4" />
                View Profile
              </a>
            </div>

            <div
              className={`mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 ${revealClass}`}
            >
              <StatTile
                label="Public repositories"
                value={data.user.public_repos}
                show
              />
              <StatTile label="Total stars" value={stars} show={stars > 0} />
              <StatTile
                label="Followers"
                value={data.user.followers}
                show={data.user.followers > 0}
              />
              <StatTile
                label="Following"
                value={data.user.following}
                show={data.user.following > 0}
              />
            </div>

            {activity.length > 0 && (
              <div
                className={`card-glow mt-4 rounded-2xl border border-line bg-surface p-6 ${revealClass}`}
              >
                <h3 className="font-mono text-xs font-medium uppercase tracking-[0.2em] text-faint">
                  Recent activity
                </h3>
                <ul className="mt-4 space-y-3">
                  {activity.map((item) => {
                    const Icon = ACTIVITY_ICONS[item.kind] ?? GitBranch;
                    return (
                      <li
                        key={item.repo + item.date + item.kind}
                        className="flex items-center gap-3 text-sm"
                      >
                        <span className="rounded-md border border-line bg-elevated p-1.5 text-faint">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 truncate text-muted">
                          {item.text}{" "}
                          <a
                            href={item.repoUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="font-mono text-fg hover:text-accent hover:underline"
                          >
                            {item.repo}
                          </a>
                        </span>
                        <span className="ml-auto shrink-0 font-mono text-xs text-faint">
                          {timeAgo(item.date)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        ) : status === "error" ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-line bg-surface p-8 text-center">
            <p className="font-medium">
              GitHub stats couldn't be loaded right now.
            </p>
            <a
              href={profile.social.github}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-fg px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              <GithubIcon className="h-4 w-4" />
              View GitHub Profile
            </a>
          </div>
        ) : (
          <StatsSkeleton />
        )}
      </div>
    </Section>
  );
}
