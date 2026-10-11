import { profile } from "../../config/profile";

/**
 * The statement riding the main diagonal. Tagline segments come
 * straight from config; the tracked subline is the bio, set in caps.
 */
export function Hero() {
  return (
    <section
      id="home"
      aria-label="Introduction"
      className="relative z-10 mx-auto w-full max-w-7xl px-6 pt-14 sm:px-10 sm:pt-16"
    >
      <div className="relative -rotate-[8deg]">
        {/* Focal-fold shade: one quiet directional wash so the hero fold
            reads as paper catching light, not a flat grid. */}
        <div
          aria-hidden="true"
          className="hero-shade pointer-events-none absolute -inset-6 sm:-inset-10"
        />
        <div className="anim-hero relative" data-deploy-anim="anim-hero">
          <h1 className="max-w-5xl font-display text-[clamp(2.4rem,6vw,5.4rem)] font-extrabold leading-[1.04] tracking-[-0.01em] text-ink">
            {profile.tagline.map((segment, i) => (
              <span key={i}>{segment.text}</span>
            ))}
          </h1>
        </div>
        <p className="anim-rise d-2 mt-7 font-mono text-[11px] tracking-[0.32em] text-ink-soft sm:text-xs">
          TECH ENTHUSIAST · CONTRIBUTING TO RANDOM PROJECTS
        </p>
      </div>
    </section>
  );
}
