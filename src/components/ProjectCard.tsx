import { ArrowUpRight, ExternalLink, GitFork, Star } from "lucide-react";
import { languageColor, timeAgo } from "../lib/format";
import type { Project } from "../lib/github";
import { GithubIcon } from "./icons";

interface ProjectCardProps {
  project: Project;
  onOpen: (project: Project) => void;
}

export function ProjectCard({ project, onOpen }: ProjectCardProps) {
  const tags = project.topics.slice(0, 3);

  return (
    <article
      className={`card-glow group relative flex h-full flex-col rounded-2xl p-5 hover:-translate-y-1 ${
        project.featured ? "gradient-border" : "border border-line bg-surface"
      }`}
    >
      <div className="flex items-start justify-between">
        <span className="rounded-lg border border-line bg-elevated p-2 text-faint transition-colors group-hover:text-accent">
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </span>
        <div className="relative z-10 flex items-center gap-2">
          {project.homepage && (
            <a
              href={project.homepage}
              target="_blank"
              rel="noreferrer noopener"
              aria-label={`Live demo of ${project.name} (opens in a new tab)`}
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
          ? tags.map((topic) => (
              <span
                key={topic}
                className="rounded-md border border-line bg-elevated px-2 py-0.5 font-mono text-[11px] text-faint"
              >
                {topic}
              </span>
            ))
          : project.language && (
              <span className="rounded-md border border-line bg-elevated px-2 py-0.5 font-mono text-[11px] text-faint">
                {project.language.toLowerCase()}
              </span>
            )}
        <span className="ml-auto inline-flex items-center gap-3 font-mono text-xs text-faint">
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
