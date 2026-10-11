import { timeAgo } from "../../lib/format";
import type { GithubData } from "../../hooks/useGithubData";

/**
 * Slim status strip closing the sheet. Every timestamp is real:
 * the latest repo push and the last successful API sync.
 */
export function SiteFooter({ github }: { github: GithubData }) {
  const data = github.data;

  let latestPush: string | null = null;
  if (data) {
    for (const repo of data.repos) {
      if (!latestPush || Date.parse(repo.pushed_at) > Date.parse(latestPush)) {
        latestPush = repo.pushed_at;
      }
    }
  }

  return (
    <footer className="relative z-10 mt-24 border-t border-ink/15 sm:mt-32">
      <div className="tnum mx-auto flex w-full max-w-7xl flex-col gap-2 px-6 py-5 font-mono text-[10px] tracking-[0.2em] text-ink-soft sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>© 2026 CHRIS KMELIER · STATUS: DEPLOYED LIVE</p>
        {data && latestPush && (
          <p>
            LAST PUSH {timeAgo(latestPush).toUpperCase()} · SYNCED{" "}
            {timeAgo(new Date(data.fetchedAt).toISOString()).toUpperCase()}
          </p>
        )}
      </div>
    </footer>
  );
}
