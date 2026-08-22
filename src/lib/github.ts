import { profile } from "../config/profile";
import {
  excludeRepos,
  featuredProjects,
  includeForks,
} from "../config/projects";

/* ── GitHub API types (only the fields we use) ────────────────── */

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  html_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  created_at: string;
  homepage: string | null;
  topics: string[];
  license: { spdx_id: string; name: string } | null;
}

export interface GitHubEvent {
  id: string;
  type: string;
  created_at: string;
  repo: { name: string; url: string };
  payload: {
    action?: string;
    commits?: unknown[];
    ref_type?: string;
  };
}

export interface GithubSnapshot {
  user: GitHubUser;
  repos: GitHubRepo[];
  events: GitHubEvent[];
  fetchedAt: number;
}

export interface Project extends GitHubRepo {
  featured: boolean;
}

/* ── Cache (localStorage, stale-while-revalidate) ─────────────── */

const CACHE_KEY = "kmelier:gh:v1";
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export function readCache(): GithubSnapshot | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GithubSnapshot;
    if (parsed?.user?.login && Array.isArray(parsed.repos)) return parsed;
  } catch {
    /* corrupted cache is treated as absent */
  }
  return null;
}

export function isFresh(snapshot: GithubSnapshot): boolean {
  return Date.now() - snapshot.fetchedAt < CACHE_TTL;
}

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`GitHub API responded ${res.status}`);
  return (await res.json()) as T;
}

export async function fetchGithubData(): Promise<GithubSnapshot> {
  const [user, repos, events] = await Promise.all([
    gh<GitHubUser>(`/users/${profile.username}`),
    gh<GitHubRepo[]>(
      `/users/${profile.username}/repos?per_page=100&sort=pushed`,
    ),
    gh<GitHubEvent[]>(
      `/users/${profile.username}/events/public?per_page=30`,
    ).catch((): GitHubEvent[] => []),
  ]);
  const snapshot: GithubSnapshot = {
    user,
    repos,
    events,
    fetchedAt: Date.now(),
  };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(snapshot));
  } catch {
    /* storage full / private mode — cache is best-effort */
  }
  return snapshot;
}

/* ── Derived data ─────────────────────────────────────────────── */

/**
 * Featured repos first (in configured order), then repos with
 * stars/forks, then the rest — both latter groups by recent activity.
 */
export function organizeProjects(repos: GitHubRepo[]): Project[] {
  return repos
    .filter(
      (r) =>
        (includeForks || !r.fork) &&
        !r.archived &&
        !excludeRepos.includes(r.name),
    )
    .map((r) => ({ ...r, featured: featuredProjects.includes(r.name) }))
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.featured && b.featured)
        return (
          featuredProjects.indexOf(a.name) - featuredProjects.indexOf(b.name)
        );
      const engagementA = a.stargazers_count + a.forks_count > 0 ? 0 : 1;
      const engagementB = b.stargazers_count + b.forks_count > 0 ? 0 : 1;
      if (engagementA !== engagementB) return engagementA - engagementB;
      return Date.parse(b.pushed_at) - Date.parse(a.pushed_at);
    });
}

export function totalStars(repos: GitHubRepo[]): number {
  return repos.reduce((sum, r) => sum + r.stargazers_count, 0);
}

export interface ActivityItem {
  kind: "push" | "star" | "fork" | "create" | "pr" | "issue";
  text: string;
  repo: string;
  repoUrl: string;
  date: string;
}

export function describeEvents(events: GitHubEvent[]): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (const ev of events) {
    const repo = ev.repo?.name ?? "";
    const base = {
      repo,
      repoUrl: `https://github.com/${repo}`,
      date: ev.created_at,
    };
    switch (ev.type) {
      case "PushEvent": {
        const n = Array.isArray(ev.payload?.commits)
          ? ev.payload.commits.length
          : 1;
        items.push({
          ...base,
          kind: "push",
          text: `Pushed ${n} commit${n === 1 ? "" : "s"} to`,
        });
        break;
      }
      case "WatchEvent":
        items.push({ ...base, kind: "star", text: "Starred" });
        break;
      case "ForkEvent":
        items.push({ ...base, kind: "fork", text: "Forked" });
        break;
      case "CreateEvent":
        items.push({
          ...base,
          kind: "create",
          text: `Created ${ev.payload?.ref_type ?? "repository"} in`,
        });
        break;
      case "PullRequestEvent":
        items.push({
          ...base,
          kind: "pr",
          text: `${ev.payload?.action ? ev.payload.action.charAt(0).toUpperCase() + ev.payload.action.slice(1) : "Updated"} a pull request in`,
        });
        break;
      case "IssuesEvent":
        items.push({
          ...base,
          kind: "issue",
          text: `${ev.payload?.action ? ev.payload.action.charAt(0).toUpperCase() + ev.payload.action.slice(1) : "Updated"} an issue in`,
        });
        break;
      default:
        break;
    }
  }
  return items;
}

/* ── README preview (fetched lazily when a modal opens) ───────── */

export async function fetchReadme(repo: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.github.com/repos/${profile.username}/${repo}/readme`,
      { headers: { Accept: "application/vnd.github.raw" } },
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

/** Strip common markdown down to a plain-text preview. */
export function readmeToPlainText(md: string, max = 700): string {
  const text = md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/[*_~]{1,3}([^*_~]+)[*_~]{1,3}/g, "$1")
    .replace(/^[-–—=]{3,}\s*$/gm, " ")
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, Math.min(cut.length, cut.lastIndexOf(" ")))}…`;
}

/* ── Small formatting helpers ─────────────────────────────────── */

export function timeAgo(dateStr: string): string {
  const seconds = Math.max(0, (Date.now() - Date.parse(dateStr)) / 1000);
  if (seconds < 60) return "just now";
  const minutes = seconds / 60;
  if (minutes < 60) return `${Math.floor(minutes)}m ago`;
  const hours = minutes / 60;
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  const days = hours / 24;
  if (days < 31) return `${Math.floor(days)}d ago`;
  const months = days / 30.44;
  if (months < 12) return `${Math.floor(months)}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

const LANGUAGE_COLORS: Record<string, string> = {
  Dart: "#00b4ab",
  Python: "#3572a5",
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Go: "#00add8",
  Rust: "#dea584",
  Java: "#b07219",
  Kotlin: "#a97bff",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Shell: "#89e051",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
  Lua: "#000080",
  PHP: "#4f5d95",
  Ruby: "#701516",
  Swift: "#f05138",
  Vue: "#41b883",
  Svelte: "#ff3e00",
};

export function languageColor(language: string | null): string {
  if (!language) return "var(--faint)";
  return LANGUAGE_COLORS[language] ?? "var(--faint)";
}
