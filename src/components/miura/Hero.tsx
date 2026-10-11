import { profile } from "../../config/profile";

/**
 * The statement riding the main diagonal, on the same -12deg tilt as
 * the fold band beneath it. One line on desktop like the approved
 * comp; wraps gracefully on small screens.
 */
export function Hero() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative z-10 mx-auto w-full max-w-7xl px-6 pb-20 pt-16 sm:px-10 sm:pb-28 sm:pt-28"
    >
      <div className="relative -rotate-[12deg]">
        {/* Raised fold facet: a soft light wash on the headline diagonal
            (blurred, so no hard edges) with a gentle cast shadow, so the
            statement sits ON a fold instead of floating over the photo. */}
        <div
          aria-hidden="true"
          className="fold-band pointer-events-none absolute -inset-x-4 -top-6 bottom-[-1.5rem] blur-2xl sm:-inset-x-8 sm:-top-8 sm:bottom-[-2.5rem]"
        />
        <div className="anim-hero relative" data-deploy-anim="anim-hero">
          <h1 className="font-display text-[clamp(2.4rem,5.5vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.015em] text-ink sm:whitespace-nowrap">
            {profile.tagline.map((segment, i) => (
              <span key={i}>{segment.text}</span>
            ))}
          </h1>
        </div>
        <p className="anim-rise d-2 mt-7 font-mono text-[11px] tracking-[0.34em] text-ink-soft sm:text-xs">
          TECH ENTHUSIAST · CONTRIBUTING TO RANDOM PROJECTS
        </p>
      </div>
    </section>
  );
}
