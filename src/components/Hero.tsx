import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import {
  attachMagnetic,
  blinkCaret,
  heroEntrance,
  startFloat,
  type PausableAnimation,
} from "../lib/animations";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { profile } from "../config/profile";
import { GithubIcon } from "./icons";

/** Hero heading from config segments, split into staggerable words. */
function Tagline() {
  const words: { text: string; highlight?: boolean }[] = [];
  for (const segment of profile.tagline) {
    for (const word of segment.text.split(" ").filter(Boolean)) {
      words.push({ text: word, highlight: segment.highlight });
    }
  }
  return (
    <>
      {words.map((word, i) => (
        <span key={i}>
          <span
            className={`hero-word ${word.highlight ? "text-gradient" : ""}`}
          >
            {word.text}
          </span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const caretRef = useRef<HTMLSpanElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const primaryRef = useRef<HTMLAnchorElement | null>(null);
  const buttonRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const floatRefs = useRef<(HTMLElement | null)[]>([]);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Honest, time-aware greeting from the visitor's clock
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    const words = Array.from(
      headingRef.current?.querySelectorAll(".hero-word") ?? [],
    );
    heroEntrance(
      {
        label: labelRef.current,
        words,
        sub: subRef.current,
        buttons: buttonRefs.current,
      },
      reduced,
    );

    // Background loops: paused while the hero is offscreen so mobile
    // GPUs tick zero animation frames after scrolling past the hero.
    const caretLoop = blinkCaret(caretRef.current, reduced);
    const loops: PausableAnimation[] = [
      ...startFloat(
        floatRefs.current.filter((el): el is HTMLElement => el !== null),
        reduced,
      ),
      ...(caretLoop ? [caretLoop] : []),
    ];

    const cleanups: (() => void)[] = [];
    const primary = primaryRef.current;
    if (primary) cleanups.push(attachMagnetic(primary));
    const section = sectionRef.current;
    if (section && loops.length > 0 && typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(([entry]) => {
        for (const loop of loops) {
          if (entry.isIntersecting) loop.play();
          else loop.pause();
        }
      });
      io.observe(section);
      cleanups.push(() => io.disconnect());
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Scroll parallax: hero content drifts up slower and fades as you leave it
  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const el = contentRef.current;
      if (!el) return;
      const y = window.scrollY;
      const vh = window.innerHeight;
      if (y > vh) return;
      const progress = Math.min(1, y / vh);
      el.style.transform = `translateY(${(y * 0.28).toFixed(1)}px)`;
      el.style.opacity = String(1 - progress * 0.9);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <section id="home" ref={sectionRef} className="relative overflow-hidden">
      {/* Background: faint grid + soft accent glow + floating fragments */}
      <div aria-hidden className="bg-grid absolute inset-0" />
      <div
        aria-hidden
        className="glow-accent absolute left-1/2 top-[-240px] h-[520px] w-[760px] -translate-x-1/2"
      />
      <div
        aria-hidden
        className="glow-accent-2 absolute right-[4%] top-[40px] h-[380px] w-[480px]"
      />
      <span
        aria-hidden
        ref={(el) => {
          floatRefs.current[0] = el;
        }}
        className="absolute left-[14%] top-[34%] hidden font-mono text-[11px] text-faint sm:block"
      >
        ~/dev $
      </span>
      <span
        aria-hidden
        ref={(el) => {
          floatRefs.current[1] = el;
        }}
        className="absolute right-[15%] top-[40%] hidden rounded-md border border-line bg-surface/70 px-2 py-1 font-mono text-[10px] text-faint sm:block"
      >
        git push
      </span>
      <span
        aria-hidden
        ref={(el) => {
          floatRefs.current[2] = el;
        }}
        className="absolute bottom-[30%] left-[24%] hidden h-1.5 w-1.5 rounded-full bg-accent/60 sm:block"
      />
      <span
        aria-hidden
        ref={(el) => {
          floatRefs.current[3] = el;
        }}
        className="absolute bottom-[36%] right-[26%] hidden h-1 w-1 rounded-full bg-faint sm:block"
      />
      <span
        aria-hidden
        ref={(el) => {
          floatRefs.current[4] = el;
        }}
        className="absolute left-[47%] top-[22%] hidden h-1 w-1 rounded-full bg-accent/40 sm:block"
      />

      <div
        ref={contentRef}
        className="relative mx-auto max-w-3xl px-6 pb-28 pt-28 text-center sm:pt-36"
      >
        <p
          ref={labelRef}
          className={`text-gradient inline-flex items-center font-mono text-xs font-medium uppercase tracking-[0.25em] ${
            reduced ? "" : "opacity-0"
          }`}
        >
          {greeting}, I'm Kmelier
          <span
            ref={caretRef}
            aria-hidden
            className="ml-2 inline-block h-[0.85em] w-[2px] translate-y-[1px] bg-accent"
          />
        </p>
        <h1
          ref={headingRef}
          className={`mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl ${
            reduced ? "" : "pre-words"
          }`}
        >
          <Tagline />
        </h1>
        <p
          ref={subRef}
          className={`mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg ${
            reduced ? "" : "opacity-0"
          }`}
        >
          Tech enthusiast interested in building useful, experimental, and
          creative projects.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            ref={(el) => {
              primaryRef.current = el;
              buttonRefs.current[0] = el;
            }}
            href="#projects"
            data-spring
            className={`group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 sm:w-auto ${
              reduced ? "" : "opacity-0"
            }`}
          >
            View Projects
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
          <a
            ref={(el) => {
              buttonRefs.current[1] = el;
            }}
            href={profile.social.github}
            target="_blank"
            rel="noreferrer noopener"
            data-spring
            className={`inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface/70 px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/50 sm:w-auto ${
              reduced ? "" : "opacity-0"
            }`}
          >
            <GithubIcon className="h-4 w-4" />
            GitHub Profile
          </a>
        </div>
      </div>
    </section>
  );
}
