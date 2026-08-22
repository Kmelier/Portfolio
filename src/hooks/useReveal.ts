import { useEffect } from "react";
import { useInView } from "./useInView";
import { useReducedMotion } from "./useReducedMotion";
import { reveal } from "../lib/animations";

/**
 * Reveals the element's children (fade/slide, staggered) the first
 * time it scrolls into view. Shared by every section.
 *
 * `revealClass` is `"opacity-0"` until the reveal fires, `""` after —
 * spread it into the container's className.
 */
export function useReveal<T extends HTMLElement>() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<T>();

  useEffect(() => {
    if (inView && ref.current) reveal(ref.current.children, reduced);
  }, [inView, reduced, ref]);

  const revealClass = inView ? "" : "opacity-0";
  return { ref, inView, revealClass };
}
