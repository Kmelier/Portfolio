import { useEffect } from "react";
import { useInView } from "./useInView";
import { useReducedMotion } from "./useReducedMotion";
import { reveal } from "../lib/animations";

/**
 * Reveals the element's children (fade/slide, staggered) the first
 * time it scrolls into view. Shared by every section.
 */
export function useReveal<T extends HTMLElement>() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<T>();

  useEffect(() => {
    if (inView && ref.current) reveal(ref.current.children, reduced);
  }, [inView, reduced, ref]);

  return { ref, inView };
}
