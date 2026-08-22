import { useCallback, useState } from "react";

export type Theme = "dark" | "light";

const STORAGE_KEY = "kmelier:theme";

/**
 * Theme state. The initial class was already applied by the inline
 * script in index.html, so there is no flash of the wrong theme.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  const toggle = useCallback(() => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      const root = document.documentElement;
      root.classList.add("theme-transition");
      root.classList.toggle("dark", next === "dark");
      root.style.colorScheme = next;
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* storage unavailable — theme just won't persist */
      }
      window.setTimeout(() => root.classList.remove("theme-transition"), 400);
      return next;
    });
  }, []);

  return { theme, toggle };
}
