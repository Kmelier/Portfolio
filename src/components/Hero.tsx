import { useEffect, useRef } from "react";
import { ArrowRight } from "lucide-react";
import { heroEntrance, startFloat } from "../lib/animations";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { profile } from "../config/profile";
import { GithubIcon } from "./icons";

/** Hero heading from config segments; `highlight` gets the gradient. */
function Tagline() {
  return (
    <>
      {profile.tagline.map((segment, i) =>
        segment.highlight ? (
          <span key={i} className="text-gradient">
            {segment.text}
          </span>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  );
}

export function Hero() {
  const reduced = useReducedMotion();
  const labelRef = useRef<HTMLParagraphElement | null>(null);
  const headingRef = useRef<HTMLHeadingElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const buttonRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const floatRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    heroEntrance(
      {
        label: labelRef.current,
        heading: headingRef.current,
        sub: subRef.current,
        buttons: buttonRefs.current,
      },
      reduced,
    );
    startFloat(
      floatRefs.current.filter((el): el is HTMLElement => el !== null),
      reduced,
    );
  }, []);

  return (
    <section id="home" className="relative overflow-hidden">
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

      <div className="relative mx-auto max-w-3xl px-6 pb-28 pt-28 text-center sm:pt-36">
        <p
          ref={labelRef}
          className={`text-gradient font-mono text-xs font-medium uppercase tracking-[0.25em] ${
            reduced ? "" : "opacity-0"
          }`}
        >
          Hello, I'm Kmelier
        </p>
        <h1
          ref={headingRef}
          className={`mt-6 text-balance text-4xl font-semibold leading-[1.1] tracking-tight sm:text-6xl ${
            reduced ? "" : "opacity-0"
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
              buttonRefs.current[0] = el;
            }}
            href="#projects"
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
