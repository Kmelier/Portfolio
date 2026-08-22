import { useCallback, useState } from "react";
import { useReducedMotion } from "./useReducedMotion";

export type Theme = "dark" | "light";
export interface ThemeOrigin {
  x: number;
  y: number;
}

const STORAGE_KEY = "kmelier:theme";

interface ViewTransitionLike {
  ready: Promise<void>;
  finished?: Promise<void>;
}

/**
 * Theme state. The initial class was already applied by the inline
 * script in index.html, so there is no flash of the wrong theme.
 *
 * Toggling uses the View Transitions API to reveal the new theme as a
 * circle expanding from the toggle button; browsers without support
 * (or users preferring reduced motion) get a color cross-fade instead.
 */
export function useTheme() {
  const reduced = useReducedMotion();
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.classList.contains("dark") ? "dark" : "light",
  );

  const toggle = useCallback(
    (origin?: ThemeOrigin) => {
      setTheme((prev) => {
        const next: Theme = prev === "dark" ? "light" : "dark";
        const root = document.documentElement;

        const apply = () => {
          root.classList.toggle("dark", next === "dark");
          root.style.colorScheme = next;
          try {
            localStorage.setItem(STORAGE_KEY, next);
          } catch {
            /* storage unavailable — theme just won't persist */
          }
        };

        const doc = document as Document & {
          startViewTransition?: (cb: () => void) => ViewTransitionLike;
        };

        if (!reduced && origin && typeof doc.startViewTransition === "function") {
          const transition = doc.startViewTransition(apply);
          // Guard both promises so a skipped transition never rejects
          // unhandled or lingers past its cleanup.
          transition.ready
            .then(() => {
              const radius = Math.hypot(
                Math.max(origin.x, window.innerWidth - origin.x),
                Math.max(origin.y, window.innerHeight - origin.y),
              );
              const options = {
                duration: 500,
                easing: "cubic-bezier(0.4, 0, 0.2, 1)",
                pseudoElement: "::view-transition-new(root)",
              } as KeyframeAnimationOptions;
              root.animate(
                {
                  clipPath: [
                    `circle(0px at ${origin.x}px ${origin.y}px)`,
                    `circle(${radius}px at ${origin.x}px ${origin.y}px)`,
                  ],
                },
                options,
              );
            })
            .catch(() => {
              /* transition skipped — the theme still applied */
            });
          transition.finished?.catch(() => {
            /* cleanup is the browser's job; never reject unhandled */
          });
        } else {
          root.classList.add("theme-transition");
          apply();
          window.setTimeout(
            () => root.classList.remove("theme-transition"),
            400,
          );
        }
        return next;
      });
    },
    [reduced],
  );

  return { theme, toggle };
}
