import { useEffect, useMemo, useRef, useState } from "react";
import { RefreshCw } from "lucide-react";
import type { GithubData } from "../hooks/useGithubData";
import { useInView } from "../hooks/useInView";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { staggerCards, activatePulse } from "../lib/animations";
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
  const { ref: gridRef, inView: gridInView } = useInView<HTMLDivElement>();
  /** True while the modal hash entry is one we pushed (so Back can pop it). */
  const pushedHash = useRef(false);

  // Deep links: #/project/<name> opens the modal; hashchange keeps it in sync
  useEffect(() => {
    const onHash = () => {
      const name = parseHash();
      if (!name) pushedHash.current = false;
      setSelectedName(name);
    };
    onHash();
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const projects = useMemo(
    () => (data ? organizeProjects(data.repos) : []),
    [data],
  );

  /** Filter options from languages first, then topics, by frequency. */
  const filterValues = useMemo(() => {
    const counts = new Map<string, number>();
    const bump = (key: string | null) => {
      if (key) counts.set(key, (counts.get(key) ?? 0) + 1);
    };
    for (const p of projects) {
      bump(p.language);
      for (const t of p.topics) bump(t);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([v]) => v);
  }, [projects]);

  const showFilters =
    projects.length >= filterBarMinRepos && filterValues.length >= 2;

  const visible = useMemo(
    () =>
      filter === "All"
        ? projects
        : projects.filter(
            (p) => p.language === filter || p.topics.includes(filter),
          ),
    [projects, filter],
  );

  const selected: Project | null =
    projects.find((p) => p.name === selectedName) ?? null;

  // Staggered card entrance — on first reveal and on every filter change
  useEffect(() => {
    if (!gridInView || visible.length === 0) return;
    if (gridRef.current) staggerCards(gridRef.current.children, reduced);
  }, [gridInView, filter, projects]);

  const openProject = (project: Project) => {
    pushedHash.current = true;
    history.pushState(null, "", `#/project/${project.name}`);
    setSelectedName(project.name);
  };

  const closeProject = () => {
    if (pushedHash.current) {
      // Pop the entry we pushed — hashchange closes the modal.
      pushedHash.current = false;
      history.back();
    } else {
      // Deep-linked straight into the modal: strip the hash in place.
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
      setSelectedName(null);
    }
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
              data-spring
              className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2 text-sm font-medium transition-colors hover:border-accent/50"
            >
              <RefreshCw className="h-4 w-4" />
              Try again
            </button>
            <a
              href={profile.social.github}
              target="_blank"
              rel="noreferrer noopener"
              data-spring
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
              aria-label="Filter projects by language or topic"
              className="mt-12 flex flex-wrap items-center justify-center gap-2"
            >
              {["All", ...filterValues].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={(e) => {
                    setFilter(value);
                    activatePulse(e.currentTarget, reduced);
                  }}
                  aria-pressed={filter === value}
                  data-spring
                  className={`rounded-full border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                    filter === value
                      ? "border-accent/60 bg-accent/10 text-accent"
                      : "border-line text-muted hover:border-fg/30 hover:text-fg"
                  }`}
                >
                  {value}
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
