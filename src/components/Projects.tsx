import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { GithubData } from "../hooks/useGithubData";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { staggerCards } from "../lib/animations";
import { organizeProjects, type Project } from "../lib/github";
import { filterBarMinRepos } from "../config/projects";
import { profile } from "../config/profile";
import { Section, SectionHeading } from "./Section";
import { ProjectCard } from "./ProjectCard";
import { ProjectModal } from "./ProjectModal";
import { CardSkeleton } from "./Skeleton";
import { GithubIcon } from "./icons";

const HASH_RE = /^#\/project\/([\w.-]+)$/;

function parseHash(): string | null {
  const match = HASH_RE.exec(window.location.hash);
  return match ? match[1] : null;
}

interface ProjectsProps {
  github: GithubData;
}

export function Projects({ github }: ProjectsProps) {
  const { status, data, refetch } = github;
  const reduced = useReducedMotion();
  const [filter, setFilter] = useState("All");
  const [selectedName, setSelectedName] = useState<string | null>(null);
  const { ref: gridRef, inView: gridInview } = useInView<HTMLDivElement>();

  // Deep links: #/project/<name> opens the modal, hashchange keeps it in sync
  useEffect(() => {
    const onHash = () => setSelectedName(parseHash());
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const projects = useMemo(
    () => (data ? organizeProjects(data.repos) : []),
    [data],
  );

  const languages = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of projects) {
      if (p.language) counts.set(p.language, (counts.get(p.language) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([l]) => l);
  }, [projects]);

  const showFilters =
    projects.length >= filterBarMinRepos && languages.length >= 2;

  const visible = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter((p) => p.language === filter),
    [projects, filter],
  );

  const selected: Project | null =
    projects.find((p) => p.name === selectedName) ?? null;

  // Staggered card entrance — on first reveal and on every filter change
  const firstRun = useRef(true);
  useEffect(() => {
    if (!gridInview || visible.length === 0) return;
    if (firstRun.current) {
      firstRun.current = false;
    }
    if (gridRef.current) staggerCards(gridRef.current.children, reduced);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gridInview, filter, projects]);

  const openProject = (project: Project) => {
    window.location.hash = `#/project/${project.name}`;
  };
  const closeProject = () => {
    history.pushState(null, "", window.location.pathname + window.location.search);
    setSelectedName(null);
  };

  return (
    <Section id="projects">
      <SectionHeading
        kicker="Projects"
        title="Selected Projects"
        sub="Things I've built, experimented with, and contributed to."
      />

      {status === "error" && !data ? (
        <div className="mx-auto mt-14 max-w-lg rounded-2xl border border-line bg-surface p-8 text-center">
          <p className="font-medium">
            GitHub projects couldn't be loaded right now.
          </p>
          <p className="mt-2 text-sm text-muted">
            This is usually temporary — the rest of the site works fine.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={refetch}
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-accent/50"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <a
              href={profile.social.github}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-lg bg-fg px-4 py-2 text-sm font-medium text-bg transition-opacity hover:opacity-90"
            >
              <GithubIcon className="h-4 w-4" />
              View GitHub Profile
            </a>
          </div>
        </div>
      ) : projects.length === 0 && status === "loading" ? (
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {showFilters && (
            <div
              role="group"
              aria-label="Filter projects by language"
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
            >
              {["All", ...languages].map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setFilter(lang)}
                  aria-pressed={filter === lang}
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                    filter === lang
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-line text-muted hover:border-fg/30 hover:text-fg"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          )}

          <div
            ref={gridRef}
            aria-live="polite"
            className={`mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 ${
              visible.length === 1 ? "lg:grid-cols-2" : ""
            }`}
          >
            {visible.map((project) => (
              <ProjectCard
                key={project.name}
                project={project}
                onOpen={openProject}
              />
            ))}
          </div>

          {visible.length === 0 && filter !== "All" && (
            <p className="mt-12 text-center text-sm text-muted">
              No {filter} projects yet.
            </p>
          )}
        </>
      )}

      <ProjectModal project={selected} onClose={closeProject} />
    </Section>
  );
}
