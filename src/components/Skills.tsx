import { useEffect } from "react";
import { Code, Layers, Terminal, Wrench, type LucideIcon } from "lucide-react";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { reveal } from "../lib/animations";
import { languageColor } from "../lib/github";
import { skillCategories } from "../config/skills";
import { Section, SectionHeading } from "./Section";

const ICONS: Record<string, LucideIcon> = {
  code: Code,
  layers: Layers,
  tools: Wrench,
  terminal: Terminal,
};

export function Skills() {
  const reduced = useReducedMotion();
  const { ref, inView } = useInView<HTMLDivElement>();

  useEffect(() => {
    if (inView && ref.current) reveal(ref.current.children, reduced);
  }, [inView, reduced, ref]);

  return (
    <Section id="skills">
      <SectionHeading
        kicker="Skills"
        title="Technologies I work with"
        sub="The stack changes as experiments turn into projects."
      />
      <div ref={ref} className="mt-14 grid gap-4 md:grid-cols-3">
        {skillCategories.map((category) => {
          const Icon = ICONS[category.icon] ?? Code;
          return (
            <div
              key={category.title}
              className={`card-glow rounded-2xl border border-line bg-surface p-6 ${
                inView ? "" : "opacity-0"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg border border-line bg-elevated p-2 text-accent">
                  <Icon className="h-4 w-4" />
                </span>
                <h3 className="font-medium">{category.title}</h3>
              </div>
              <ul className="mt-5 flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <li
                    key={skill}
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-elevated px-2.5 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/40 hover:text-fg"
                  >
                    <span
                      aria-hidden
                      className="h-1.5 w-1.5 rounded-full"
                      style={{ background: languageColor(skill) }}
                    />
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
