import { profile } from "../config/profile";
import { capitalize } from "./format";
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
    const wellFormed =
      parsed?.user?.login &&
      typeof parsed.fetchedAt === "number" &&
      Array.isArray(parsed.repos) &&
      Array.isArray(parsed.events);
    if (wellFormed) return parsed;
  } catch {
    /* corrupted cache is treated as absent */
  }
  return null;
}

export function isFresh(snapshot: GithubSnapshot): boolean {
  return Date.now() - snapshot.fetchedAt < CACHE_TTL;
}

export const REQUEST_TIMEOUT_MS = 8000;

async function gh<T>(path: string): Promise<T> {
  const res = await fetch(`https://api.github.com${path}`, {
    headers: {
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
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
 * Spec priority order:
 *   1. featured (in configured order)
 *   2. recently updated (pushed_at, descending)
 *   3. stars/forks as the tiebreaker
 */
export function organizeProjects(repos: GitHubRepo[]): Project[] {
  const excluded = excludeRepos.map((name) => name.toLowerCase());
  return repos
    .filter(
      (r) =>
        (includeForks || !r.fork) &&
        !r.archived &&
        !excluded.includes(r.name.toLowerCase()),
    )
    .map((r) => ({ ...r, featured: featuredProjects.includes(r.name) }))
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.featured && b.featured)
        return (
          featuredProjects.indexOf(a.name) - featuredProjects.indexOf(b.name)
        );
      const pushedDiff = Date.parse(b.pushed_at) - Date.parse(a.pushed_at);
      if (pushedDiff !== 0) return pushedDiff;
      const engagementDiff =
        b.stargazers_count +
        b.forks_count -
        (a.stargazers_count + a.forks_count);
      if (engagementDiff !== 0) return engagementDiff;
      return a.name.localeCompare(b.name);
    });
}

/**
 * Account-wide total (matches the public_repos semantics of the stats
 * next to it) — intentionally includes forks/archived/excluded repos.
 */
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
          text: `${capitalize(ev.payload?.action ?? "Updated")} a pull request in`,
        });
        break;
      case "IssuesEvent":
        items.push({
          ...base,
          kind: "issue",
          text: `${capitalize(ev.payload?.action ?? "Updated")} an issue in`,
        });
        break;
      default:
        break;
    }
  }
  return items;
}
