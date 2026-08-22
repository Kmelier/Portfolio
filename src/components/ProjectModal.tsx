import { useEffect, useRef, useState } from "react";
import { ExternalLink, X } from "lucide-react";
import { timeAgo } from "../lib/format";
import { languageColor } from "../lib/format";
import { fetchReadme, readmeToPlainText } from "../lib/readme";
import type { Project } from "../lib/github";
import { modalIn, modalOut } from "../lib/animations";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { safeHttpUrl } from "../lib/url";
import { GithubIcon } from "./icons";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const reduced = useReducedMotion();
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [readme, setReadme] = useState<string | null>(null);
  const [readmeState, setReadmeState] = useState<"idle" | "loading" | "done">(
    "idle",
  );

  // Entrance / exit animation + focus management + scroll lock + focus trap
  useEffect(() => {
    if (!project) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    modalIn(backdropRef.current, panelRef.current, reduced);
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      panelRef.current?.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      ) ?? [];

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      const active = document.activeElement;
      const inside = panelRef.current?.contains(active) ?? false;
      if (e.shiftKey) {
        if (!inside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (!inside || active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.name]);

  // Lazy README fetch — only when the modal actually opens
  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    setReadme(null);
    setReadmeState("loading");
    void fetchReadme(project.name).then((md) => {
      if (cancelled) return;
      setReadme(md ? readmeToPlainText(md) : null);
      setReadmeState("done");
    });
    return () => {
      cancelled = true;
    };
  }, [project?.name]);

  if (!project) return null;

  const liveUrl = safeHttpUrl(project.homepage);

  const requestClose = () => {
    modalOut(backdropRef.current, panelRef.current, reduced, () => {
      restoreFocusRef.current?.focus?.();
      onClose();
    });
  };

  const meta: { label: string; value: string }[] = [
    project.language
      ? { label: "Language", value: project.language }
      : { label: "Language", value: "—" },
    { label: "Stars", value: String(project.stargazers_count) },
    { label: "Forks", value: String(project.forks_count) },
    { label: "Updated", value: timeAgo(project.pushed_at) },
    {
      label: "Created",
      value: new Date(project.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      }),
    },
    project.license?.spdx_id && project.license.spdx_id !== "NOASSERTION"
      ? { label: "License", value: project.license.spdx_id }
      : { label: "License", value: "None" },
  ];

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl border border-line bg-surface p-6 shadow-2xl sm:rounded-2xl sm:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-gradient font-mono text-xs uppercase tracking-[0.2em]">
              {project.featured ? "Featured project" : "Project"}
            </p>
            <h3
              id="project-modal-title"
              className="mt-2 text-2xl font-semibold tracking-tight"
            >
              {project.name}
            </h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={requestClose}
            aria-label="Close project details"
            className="rounded-lg border border-line p-2 text-muted transition-colors hover:border-accent/50 hover:text-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 leading-relaxed text-muted">
          {project.description ?? "No description provided."}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {project.topics.length > 0
            ? project.topics.slice(0, 6).map((topic) => (
                <span
                  key={topic}
                  className="rounded-md border border-line bg-elevated px-2.5 py-1 font-mono text-xs text-muted"
                >
                  {topic}
                </span>
              ))
            : project.language && (
                <span className="inline-flex items-center gap-1.5 rounded-md border border-line bg-elevated px-2.5 py-1 font-mono text-xs text-muted">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ background: languageColor(project.language) }}
                  />
                  {project.language}
                </span>
              )}
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {meta.map((item) => (
            <div
              key={item.label}
              className="tile rounded-xl border border-line bg-elevated px-3.5 py-3"
            >
              <dt className="font-mono text-[10px] uppercase tracking-wider text-faint">
                {item.label}
              </dt>
              <dd className="mt-1 truncate text-sm font-medium">{item.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a
            href={project.html_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-opacity hover:opacity-90"
          >
            <GithubIcon className="h-4 w-4" />
            View on GitHub
          </a>
          {liveUrl && (
            <a
              href={liveUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/50"
            >
              <ExternalLink className="h-4 w-4" />
              Live demo
            </a>
          )}
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
            README preview
          </p>
          {readmeState === "loading" && (
            <div className="mt-4 space-y-2.5">
              <div className="skeleton h-3 w-11/12" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-4/5" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          )}
          {readmeState === "done" && readme && (
            <p className="mt-4 whitespace-pre-line font-mono text-[13px] leading-relaxed text-muted">
              {readme}
            </p>
          )}
          {readmeState === "done" && !readme && (
            <p className="mt-4 text-sm text-faint">No README found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
