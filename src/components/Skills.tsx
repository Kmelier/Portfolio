import { Code, Layers, Terminal, Wrench, type LucideIcon } from "lucide-react";
import {
  siDart,
  siExpress,
  siFlutter,
  siGit,
  siGithub,
  siJavascript,
  siNodedotjs,
  siPython,
} from "simple-icons";
import { useReveal } from "../hooks/useReveal";
import { languageColor } from "../lib/format";
import { skillCategories } from "../config/skills";
import { Section, SectionHeading } from "./Section";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  code: Code,
  layers: Layers,
  tools: Wrench,
  terminal: Terminal,
};

/** Brand icons from simple-icons, keyed by skill name. Unlisted
 *  skills (e.g. VS Code, removed from simple-icons) fall back to a
 *  colored dot. */
const TECH_ICONS: Record<string, { path: string; hex: string }> = {
  Python: siPython,
  JavaScript: siJavascript,
  Dart: siDart,
  Flutter: siFlutter,
  "Node.js": siNodedotjs,
  Express: siExpress,
  Git: siGit,
  GitHub: siGithub,
};

function TechGlyph({ name }: { name: string }) {
  const icon = TECH_ICONS[name];
  if (icon) {
    return (
      <svg
        viewBox="0 0 24 24"
        role="img"
        aria-hidden="true"
        fill="currentColor"
        style={{ color: `#${icon.hex}` }}
        className="h-3 w-3 shrink-0"
      >
        <path d={icon.path} />
      </svg>
    );
  }
  return (
    <span
      aria-hidden
      className="h-1.5 w-1.5 shrink-0 rounded-full"
      style={{ background: languageColor(name) }}
    />
  );
}

export function Skills() {
  const { ref, revealClass } = useReveal<HTMLDivElement>();

  return (
    <Section id="skills">
      <SectionHeading
        kicker="Skills"
        title="Technologies I work with"
        sub="The stack changes as experiments turn into projects."
      />
      <div ref={ref} className="mt-14 grid gap-4 md:grid-cols-3">
        {skillCategories.map((category) => {
          const Icon = CATEGORY_ICONS[category.icon] ?? Code;
          return (
            <div
              key={category.title}
              className={`card-glow rounded-2xl border border-line bg-surface p-6 ${revealClass}`}
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
                    className="inline-flex items-center gap-1.5 rounded-md border border-line bg-elevated px-2.5 py-1 font-mono text-xs text-muted transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:text-fg"
                  >
                    <TechGlyph name={skill} />
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
