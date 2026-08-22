import { useCallback, useEffect, useState } from "react";
import {
  fetchGithubData,
  isFresh,
  readCache,
  type GithubSnapshot,
} from "../lib/github";

export type GithubStatus = "loading" | "ready" | "error";

/**
 * GitHub data with stale-while-revalidate caching:
 *  - cached data renders immediately
 *  - a fresh fetch revalidates in the background (skipped if the
 *    cache is younger than the TTL)
 *  - on failure with no cache → error state; with stale cache the
 *    old data stays on screen
 */
export function useGithubData() {
  const [status, setStatus] = useState<GithubStatus>("loading");
  const [data, setData] = useState<GithubSnapshot | null>(null);

  const load = useCallback(async () => {
    const cached = readCache();
    if (cached) {
      setData(cached);
      setStatus("ready");
      if (isFresh(cached)) return;
    }
    try {
      const fresh = await fetchGithubData();
      setData(fresh);
      setStatus("ready");
    } catch {
      if (!cached) setStatus("error");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const refetch = useCallback(() => {
    setStatus("loading");
    void load();
  }, [load]);

  return { status, data, refetch };
}

export type GithubData = ReturnType<typeof useGithubData>;
