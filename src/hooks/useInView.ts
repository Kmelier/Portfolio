import { useEffect, useRef, useState } from "react";

/**
 * IntersectionObserver-based visibility.
 * By default fires once (elements stay revealed); pass once: false
 * for continuous tracking.
 */
export function useInView<T extends HTMLElement>(options?: {
  threshold?: number;
  once?: boolean;
}) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const once = options?.once !== false;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          if (once) io.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { threshold: options?.threshold ?? 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
    // Options are read once on mount by design.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { ref, inView };
}
