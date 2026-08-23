import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { attachMagnetic } from "../lib/animations";
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
  const primaryRef = useRef<HTMLAnchorElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement | null>(null);

  // Honest, time-aware greeting from the visitor's clock
  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  })();

  // The entrance, the floating fragments and the blinking caret are all
  // CSS now (see `.hero-anim` in src/index.css) — nothing here has to run
  // for the hero to animate, which is the whole point: it starts at first
  // paint instead of waiting for hydration.
  //
  // What is left is the two things CSS cannot do. The floats and caret
  // loop forever, so they are parked with a class once the section leaves
  // the viewport rather than left ticking behind the rest of the page.
  useEffect(() => {
    const cleanups: (() => void)[] = [];
    const primary = primaryRef.current;
    if (primary) cleanups.push(attachMagnetic(primary));

    const section = sectionRef.current;
    if (section && typeof IntersectionObserver !== "undefined") {
      const io = new IntersectionObserver(([entry]) => {
        section.classList.toggle("hero-idle", !entry.isIntersecting);
      });
      io.observe(section);
      cleanups.push(() => io.disconnect());
    }
    return () => cleanups.forEach((fn) => fn());
  }, []);

  // Scroll parallax: hero content drifts up slower and fades as you leave it.
  // Fine pointers only. On a phone this is a bad trade twice over: it writes
  // transform + opacity on every scroll frame during the most animation-heavy
  // moment of the page, and mobile Safari collapses its URL bar mid-scroll,
  // which changes window.innerHeight underneath the progress maths and makes
  // the drift visibly stutter even where there is headroom for it.
  useEffect(() => {
    if (reduced) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
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
        className="hero-float hero-float-1 absolute left-[14%] top-[34%] hidden font-mono text-[11px] text-faint sm:block"
      >
        ~/dev $
      </span>
      <span
        aria-hidden
        className="hero-float hero-float-2 absolute right-[15%] top-[40%] hidden rounded-md border border-line bg-surface/70 px-2 py-1 font-mono text-[10px] text-faint sm:block"
      >
        git push
      </span>
      <span
        aria-hidden
        className="hero-float hero-float-3 absolute bottom-[30%] left-[24%] hidden h-1.5 w-1.5 rounded-full bg-accent/60 sm:block"
      />
      <span
        aria-hidden
        className="hero-float hero-float-4 absolute bottom-[36%] right-[26%] hidden h-1 w-1 rounded-full bg-faint sm:block"
      />
      <span
        aria-hidden
        className="hero-float hero-float-5 absolute left-[47%] top-[22%] hidden h-1 w-1 rounded-full bg-accent/40 sm:block"
      />

      <div
        ref={contentRef}
        // Same trade as Section: 7rem of padding top and bottom pushed
        // the CTAs under the fold on a short phone, so the first thing
        // you saw was a heading with nothing actionable beneath it.
        className="hero-anim relative mx-auto max-w-3xl px-6 pb-20 pt-20 text-center sm:pb-28 sm:pt-36"
      >
        <p className="hero-label text-gradient inline-flex items-center font-mono text-xs font-medium uppercase tracking-[0.25em]">
          {greeting}, I'm Kmelier
          <span
            aria-hidden
            className="hero-caret ml-2 inline-block h-[0.85em] w-[2px] translate-y-[1px] bg-accent"
          />
        </p>
        <h1 className="mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl">
          <Tagline />
        </h1>
        <p className="hero-sub mx-auto mt-6 max-w-xl text-pretty text-base leading-relaxed text-muted sm:text-lg">
          Tech enthusiast interested in building useful, experimental, and
          creative projects.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            ref={primaryRef}
            href="#projects"
            data-spring
            className="hero-cta tap-target group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90 sm:w-auto"
          >
            View Projects
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
          </a>
          <a
            href={profile.social.github}
            target="_blank"
            rel="noreferrer noopener"
            data-spring
            className="hero-cta tap-target inline-flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface/70 px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/50 sm:w-auto"
          >
            <GithubIcon className="h-4 w-4" />
            GitHub Profile
          </a>
        </div>
      </div>
    </section>
  );
}
