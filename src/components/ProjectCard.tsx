import { ArrowUpRight, ExternalLink, GitFork, Star } from "lucide-react";
import { languageColor, timeAgo } from "../lib/format";
import type { Project } from "../lib/github";
import { cardSpringIn, cardSpringOut } from "../lib/animations";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { safeHttpUrl } from "../lib/url";
import { GithubIcon } from "./icons";

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const reduced = useReducedMotion();
  // Three topics is one row on a desktop card and two crowded rows on a
  // 390px one. The third is rendered and hidden by CSS rather than sliced
  // off in JS, so there is one DOM tree for both widths — a JS slice would
  // need a viewport hook and would then have to survive rotation.
  const tags = project.topics.slice(0, 3);
  const liveUrl = safeHttpUrl(project.homepage);

  return (
    <article
      onMouseEnter={(e) => cardSpringIn(e.currentTarget, reduced)}
      onMouseLeave={(e) => cardSpringOut(e.currentTarget, reduced)}
      className={`card-glow group relative flex h-full flex-col rounded-2xl p-4 sm:p-5 ${
        project.featured ? "gradient-border" : "border border-line bg-surface"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="rounded-lg border border-line bg-elevated p-2 text-faint transition-colors group-hover:text-accent">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        <div className="relative z-10 flex items-center gap-2">
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Live demo of ${project.name} (opens in a new tab)`}
              data-spring
              className="inline-flex items-center gap-1 rounded-md border border-line bg-elevated px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-muted transition-colors hover:border-accent/40 hover:text-fg"
            >
              <ExternalLink className="h-3 w-3" />
              Live
            </a>
          )}
          <a
            href={project.html_url}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={`GitHub repository of ${project.name} (opens in a new tab)`}
            data-spring
            className="rounded-md p-1.5 text-faint transition-colors hover:bg-elevated hover:text-fg"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
        </div>
      </div>

      <h3 className="mt-4 font-medium tracking-tight transition-colors group-hover:text-accent">
        {project.name}
        {project.featured && (
          <span className="ml-2 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 align-middle font-mono text-[10px] font-medium uppercase tracking-wider">
            <span className="text-gradient">Featured</span>
          </span>
        )}
      </h3>

      <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted">
        {project.description ?? "No description provided."}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
        {project.language && (
          <span className="inline-flex items-center gap-1.5 font-mono text-xs text-muted">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: languageColor(project.language) }}
            />
            {project.language}
          </span>
        )}
        {tags.length > 0
          ? tags.map((topic, i) => (
              <span
                key={topic}
                className={`rounded-md border border-line bg-elevated px-2 py-0.5 font-mono text-[11px] text-faint ${
                  i === 2 ? "hidden sm:inline" : ""
                }`}
              >
                {topic}
              </span>
            ))
          : project.language && (
              <span className="rounded-md border border-line bg-elevated px-2 py-0.5 font-mono text-[11px] text-faint">
                {project.language.toLowerCase()}
              </span>
            )}
        {/* sm:ml-auto, not ml-auto: on a narrow card this row wraps, and
            an auto margin on a wrapped flex item throws the star/fork
            counts to the far right of a line of their own instead of
            letting them sit with the tags. */}
        <span className="inline-flex items-center gap-3 font-mono text-xs text-faint sm:ml-auto">
          <span className="inline-flex items-center gap-1" title="Stars">
            <Star className="h-3.5 w-3.5" />
            {project.stargazers_count}
          </span>
          <span className="inline-flex items-center gap-1" title="Forks">
            <GitFork className="h-3.5 w-3.5" />
            {project.forks_count}
          </span>
        </span>
      </div>

      <p className="mt-3 font-mono text-[11px] text-faint">
        Updated {timeAgo(project.pushed_at)}
      </p>

      {/* Stretched button: the whole card opens the details modal */}
      <button
        type="button"
        onClick={() => onOpen(project)}
        aria-label={`Open details for ${project.name}`}
        className="absolute inset-0 rounded-2xl"
      />
    </article>
  );
}
