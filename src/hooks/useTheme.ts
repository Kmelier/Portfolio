import { useCallback, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";
import { themeReveal } from "../lib/themeReveal";

export type Theme = "dark" | "light";
export interface ThemeOrigin {
  x: number;
  y: number;
}

const STORAGE_KEY = "kmelier:theme";

/**
 * A theme's `--bg`, read from CSS rather than repeated here. Both values
 * are exposed unconditionally as `--bg-light` / `--bg-dark` in
 * src/index.css, so that file stays the single source for them.
 *
 * Empty means stylesheets have not applied — the caller then flips
 * instantly rather than animating a transparent disc.
 */
function backgroundFor(theme: Theme): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(theme === "dark" ? "--bg-dark" : "--bg-light")
    .trim();
}

/**
 * Theme state. The initial class was already applied by
 * public/theme-init.js, so there is no flash of the wrong theme.
 *
 * Toggling reveals the new theme as a circle expanding from the point
 * that triggered it — see src/lib/themeReveal.ts for why it is built
 * from a plain scaled div rather than the View Transitions API. Users
 * who prefer reduced motion get an instant swap.
 */
export function useTheme() {
  const reduced = useReducedMotion();
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  const toggle = useCallback(
    (origin?: ThemeOrigin) => {
      const next: Theme = theme === "dark" ? "light" : "dark";
      const root = document.documentElement;
      const background = backgroundFor(next);

      const apply = () => {
        root.classList.toggle("dark", next === "dark");
        root.style.colorScheme = next;
        const themeMeta = document.querySelector<HTMLMetaElement>(
          'meta[name="theme-color"]',
        );
        if (themeMeta && background) themeMeta.content = background;
        try {
          localStorage.setItem(STORAGE_KEY, next);
        } catch {
          /* storage unavailable — theme just won't persist */
        }
      };

      setTheme(next);

      if (reduced || !background) {
        apply();
        return;
      }
      themeReveal(
        origin ?? {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
        },
        background,
        apply,
      );
    },
    [theme, reduced],
  );

  return { theme, toggle };
}
