import { ArrowUpRight, Star } from "lucide-react";
import { profile } from "../../config/profile";
import type { Project } from "../../lib/github";
import { CreasePin } from "./bits";
import { Reveal } from "./Reveal";

function FoldCell({ project }: { project: Project }) {
  const tech = [project.language, ...project.topics.slice(0, 2)]
    .filter(Boolean)
    .join(" · ");
  const year = new Date(project.pushed_at).getFullYear();

  return (
    <a
      href={project.html_url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${project.name} on GitHub`}
      className="fold-cell group relative block border border-ink/10 bg-paper px-7 py-7 shadow-fold transition-all duration-300 hover:-translate-y-1 hover:shadow-lift sm:px-9"
    >
      <CreasePin className="absolute left-6 top-2.5 -rotate-12" />
      <CreasePin className="absolute right-3 top-2.5 rotate-12" />
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-xl font-bold uppercase tracking-[0.04em] text-ink">
          {project.name}
        </h3>
        <ArrowUpRight
          aria-hidden="true"
          className="mt-1 h-4 w-4 shrink-0 text-ink-faint transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-gold-deep"
        />
      </div>
      {project.description && (
        <p className="mt-2 max-w-md text-[15px] leading-relaxed text-ink-soft">
          {project.description}
        </p>
      )}
      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.12em] text-ink-soft">
        {tech && <span>{tech.toUpperCase()}</span>}
        {project.stargazers_count > 0 && (
          <span className="tnum inline-flex items-center gap-1">
            <Star aria-hidden="true" className="h-3 w-3 fill-gold-deep text-gold-deep" />
            {project.stargazers_count}
          </span>
        )}
        <span className="tnum text-ink-faint">UPDATED {year}</span>
      </div>
    </a>
  );
}

/**
 * Selected projects as fold cells on the sheet. Repos come live from
 * the GitHub API via organizeProjects — never hardcoded.
 */
export function ProjectsFold({ projects }: { projects: Project[] }) {
  const selected = projects.slice(0, 3);

  return (
    <section
      id="projects"
      aria-label="Selected projects"
      className="relative z-10 mx-auto w-full max-w-7xl scroll-mt-24 px-6 pt-24 sm:px-10 sm:pt-32"
    >
      <Reveal>
        <div className="flex items-baseline justify-between border-b border-ink/15 pb-4">
          <h2 className="font-display text-2xl font-bold tracking-[0.08em] text-ink sm:text-3xl">
            PROJECTS — SELECTED
          </h2>
          <p className="tnum font-mono text-[10px] tracking-[0.24em] text-ink-faint">
            {selected.length > 0 ? `${selected.length} LIVE` : ""}
          </p>
        </div>
      </Reveal>

      {selected.length > 0 ? (
        <div className="grid gap-6 pt-10 md:grid-cols-3 md:gap-8">
          {selected.map((project) => (
            <Reveal key={project.name}>
              <FoldCell project={project} />
            </Reveal>
          ))}
        </div>
      ) : (
        <p className="pt-10 font-mono text-xs tracking-[0.18em] text-ink-faint">
          FETCHING LIVE REPOSITORIES…
        </p>
      )}

      <Reveal className="pt-8">
        <a
          href={`${profile.social.github}?tab=repositories`}
          target="_blank"
          rel="noopener noreferrer"
          className="group inline-flex items-center gap-2 font-mono text-[11px] font-medium tracking-[0.22em] text-ink underline decoration-gold decoration-2 underline-offset-8 transition-colors hover:text-gold-deep"
        >
          VIEW ALL ON GITHUB
          <ArrowUpRight
            aria-hidden="true"
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </a>
      </Reveal>
    </section>
  );
}
