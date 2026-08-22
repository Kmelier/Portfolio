import { useEffect } from "react";
import { particleBurst } from "../lib/animations";
import { useReducedMotion } from "./useReducedMotion";

const WORD = "kmelier";
const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

/**
 * Easter egg: typing "kmelier" anywhere (outside inputs) or entering
 * the Konami code fires a particle burst.
 */
export function useEasterEgg(): void {
  const reduced = useReducedMotion();

  useEffect(() => {
    let keys: string[] = [];
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      if (e.key.length === 1) {
        typed = (typed + e.key.toLowerCase()).slice(-WORD.length);
      }
      keys = [...keys.slice(-KONAMI.length + 1), e.key];
      if (typed === WORD || keys.join(",") === KONAMI.join(",")) {
        typed = "";
        keys = [];
        particleBurst(reduced);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reduced]);
}
