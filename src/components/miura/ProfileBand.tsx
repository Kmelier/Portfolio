import { Code2, Layers, Terminal, Wrench } from "lucide-react";
import { profile } from "../../config/profile";
import { skillCategories } from "../../config/skills";
import { timeline } from "../../config/timeline";
import { Reveal } from "./Reveal";

const CATEGORY_ICONS = {
  code: Code2,
  layers: Layers,
  tools: Wrench,
  terminal: Terminal,
} as const;

/**
 * About + skills + timeline as one spec band on the sheet.
 * Only configured content renders — empty fields stay hidden.
 */
export function ProfileBand() {
  return (
    <section
      id="about"
      aria-label="About"
      className="relative z-10 mx-auto w-full max-w-7xl scroll-mt-24 px-6 pt-24 sm:px-10 sm:pt-32"
    >
      <Reveal>
        <div className="flex items-baseline justify-between border-b border-ink/15 pb-4">
          <h2 className="font-display text-2xl font-bold tracking-[0.08em] text-ink sm:text-3xl">
            ABOUT
          </h2>
          <p className="font-mono text-[10px] tracking-[0.24em] text-ink-faint">
            SPEC — 01
          </p>
        </div>
      </Reveal>

      <div className="grid gap-12 pt-8 md:grid-cols-2 md:gap-16">
        <Reveal>
          <p className="max-w-md text-lg leading-relaxed text-ink-soft">
            {profile.bio}
          </p>
          {timeline.length > 0 && (
            <div className="mt-10">
              <p className="font-mono text-[10px] tracking-[0.28em] text-ink-faint">
                TIMELINE
              </p>
              <ul className="mt-4 space-y-5">
                {timeline.map((entry) => (
                  <li key={entry.period} className="border-l-2 border-gold/60 pl-4">
                    <p className="tnum font-mono text-[11px] tracking-[0.18em] text-ink-soft">
                      {entry.period.toUpperCase()}
                    </p>
                    <p className="mt-1 font-semibold text-ink">{entry.title}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-ink-soft">
                      {entry.description}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Reveal>

        <Reveal className="md:pt-1">
          <p className="font-mono text-[10px] tracking-[0.28em] text-ink-faint">
            CAPABILITIES
          </p>
          <ul className="mt-4 space-y-5">
            {skillCategories.map((cat) => {
              const Icon = CATEGORY_ICONS[cat.icon];
              return (
                <li key={cat.title}>
                  <p className="flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.22em] text-ink">
                    <Icon aria-hidden="true" className="h-3.5 w-3.5 text-gold-deep" />
                    {cat.title.toUpperCase()}
                  </p>
                  <p className="mt-1.5 text-[15px] text-ink-soft">
                    {cat.skills.join(" · ")}
                  </p>
                </li>
              );
            })}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
