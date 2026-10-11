import { useState } from "react";
import { ArrowUpRight, Check, Copy } from "lucide-react";
import { profile } from "../../config/profile";
import { GithubIcon } from "../icons";
import { Reveal } from "./Reveal";

/**
 * Contact: one obvious next step. Email as the primary channel,
 * GitHub as the proof behind it.
 */
export function ContactBand() {
  const [copied, setCopied] = useState(false);

  const copyEmail = () => {
    if (!profile.email) return;
    void navigator.clipboard?.writeText(profile.email).catch(() => {});
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative z-10 mx-auto w-full max-w-7xl scroll-mt-24 px-6 pt-24 sm:px-10 sm:pt-32"
    >
      <Reveal>
        <div className="flex items-baseline justify-between border-b border-ink/15 pb-4">
          <h2 className="font-display text-2xl font-bold tracking-[0.08em] text-ink sm:text-3xl">
            CONTACT
          </h2>
          <p className="font-mono text-[10px] tracking-[0.24em] text-ink-faint">
            OPEN CHANNEL
          </p>
        </div>
      </Reveal>

      <Reveal className="pt-10">
        {profile.email ? (
          <a
            href={`mailto:${profile.email}`}
            className="group inline-block font-display text-[clamp(1.6rem,4.5vw,3.2rem)] font-bold tracking-[0.01em] text-ink underline decoration-gold decoration-[3px] underline-offset-[10px] transition-colors hover:text-gold-deep"
          >
            {profile.email}
          </a>
        ) : null}
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {profile.email && (
            <button
              type="button"
              onClick={copyEmail}
              className="inline-flex items-center gap-2 rounded-[3px] border border-ink/20 bg-paper px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] text-ink shadow-[1px_2px_6px_rgb(28_28_25/0.12)] transition-colors hover:border-ink/45"
            >
              {copied ? (
                <Check aria-hidden="true" className="h-3.5 w-3.5 text-gold-deep" />
              ) : (
                <Copy aria-hidden="true" className="h-3.5 w-3.5" />
              )}
              {copied ? "COPIED" : "COPY EMAIL"}
            </button>
          )}
          <a
            href={profile.social.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[3px] border border-ink/20 bg-paper px-4 py-2.5 font-mono text-[11px] tracking-[0.18em] text-ink shadow-[1px_2px_6px_rgb(28_28_25/0.12)] transition-colors hover:border-ink/45"
          >
            <GithubIcon className="h-3.5 w-3.5" />
            GITHUB
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 text-ink-faint" />
          </a>
        </div>
      </Reveal>
    </section>
  );
}
