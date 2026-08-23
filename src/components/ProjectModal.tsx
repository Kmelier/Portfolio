import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ExternalLink, X } from "lucide-react";
import { languageColor, timeAgo } from "../lib/format";
import { fetchReadme, parseReadme, type ReadmeBlock } from "../lib/readme";
import type { Project } from "../lib/github";
import { modalIn, modalOut } from "../lib/animations";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { safeHttpUrl } from "../lib/url";
import { GithubIcon } from "./icons";

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const INLINE_RE = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

/** Inline markdown: `code`, **bold**, [links](url) — http(s) links only. */
function Inline({ text }: { text: string }) {
  const parts: ReactNode[] = [];
  let last = 0;
  let key = 0;
  let match: RegExpExecArray | null;
  INLINE_RE.lastIndex = 0;
  while ((match = INLINE_RE.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-elevated px-1.5 py-0.5 font-mono text-[0.85em] text-fg"
        >
          {match[1]}
        </code>,
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <strong key={key++} className="font-semibold text-fg">
          {match[2]}
        </strong>,
      );
    } else {
      const url = safeHttpUrl(match[4]);
      parts.push(
        url ? (
          <a
            key={key++}
            href={url}
            target="_blank"
            rel="noreferrer noopener"
            className="text-accent hover:underline"
          >
            {match[3]}
          </a>
        ) : (
          match[3]
        ),
      );
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}

const HEADING_CLASSES: Record<1 | 2 | 3, string> = {
  1: "mt-7 text-lg font-semibold tracking-tight text-fg",
  2: "mt-6 text-base font-semibold tracking-tight text-fg",
  3: "mt-5 text-sm font-semibold text-fg",
};

/** One parsed README block. */
function ReadmeBlockView({ block }: { block: ReadmeBlock }) {
  switch (block.type) {
    case "heading":
      return (
        <p className={HEADING_CLASSES[block.level]}>
          <Inline text={block.text} />
        </p>
      );
    case "paragraph":
      return (
        <p>
          <Inline text={block.text} />
        </p>
      );
    case "list":
      return block.ordered ? (
        <ol className="list-decimal space-y-1.5 pl-5">
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline text={item} />
            </li>
          ))}
        </ol>
      ) : (
        <ul className="list-disc space-y-1.5 pl-5">
          {block.items.map((item, i) => (
            <li key={i}>
              <Inline text={item} />
            </li>
          ))}
        </ul>
      );
    case "code":
      return (
        <pre className="overflow-x-auto rounded-lg border border-line bg-elevated p-3.5 font-mono text-xs leading-relaxed text-fg">
          <code>{block.text}</code>
        </pre>
      );
    case "quote":
      return (
        <blockquote className="border-l-2 border-accent/50 pl-3 text-faint">
          <Inline text={block.text} />
        </blockquote>
      );
  }
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

  /** Every close path funnels through here: exit animation, focus restore. */
  const requestClose = () => {
    modalOut(backdropRef.current, panelRef.current, reduced, () => {
      restoreFocusRef.current?.focus?.();
      onClose();
    });
  };

  // Entrance / exit animation + focus management + scroll lock + focus trap
  useEffect(() => {
    if (!project) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    modalIn(backdropRef.current, panelRef.current, reduced);
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        requestClose();
        return;
      }
      if (e.key !== "Tab") return;
      const list =
        panelRef.current?.querySelectorAll<HTMLElement>(
          FOCUSABLE_SELECTOR,
        ) ?? [];
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
    // eslint is not configured; the effect intentionally runs per project
  }, [project?.name]);

  // Lazy README fetch — only when the modal actually opens
  useEffect(() => {
    if (!project) return;
    let cancelled = false;
    setReadme(null);
    setReadmeState("loading");
    void fetchReadme(project.name).then((md) => {
      if (cancelled) return;
      setReadme(md);
      setReadmeState("done");
    });
    return () => {
      cancelled = true;
    };
  }, [project?.name]);

  const readmeBlocks = useMemo(
    () => (readme ? parseReadme(readme) : []),
    [readme],
  );

  if (!project) return null;

  const liveUrl = safeHttpUrl(project.homepage);

  // Only meaningful values get tiles — zero/None stats stay hidden
  // until they're real (same philosophy as the site's other stats).
  const meta: { label: string; value: string }[] = [];
  if (project.language) {
    meta.push({ label: "Language", value: project.language });
  }
  if (project.stargazers_count > 0) {
    meta.push({ label: "Stars", value: String(project.stargazers_count) });
  }
  if (project.forks_count > 0) {
    meta.push({ label: "Forks", value: String(project.forks_count) });
  }
  meta.push({ label: "Updated", value: timeAgo(project.pushed_at) });
  meta.push({
    label: "Created",
    value: new Date(project.created_at).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
    }),
  });
  if (project.license?.spdx_id && project.license.spdx_id !== "NOASSERTION") {
    meta.push({ label: "License", value: project.license.spdx_id });
  }

  // Portaled to <body>: the modal lives inside a content-visibility
  // section, whose paint containment would otherwise turn the
  // "fullscreen" fixed overlay into a section-sized one.
  return createPortal(
    <div
      ref={backdropRef}
      // Backdrop blur only from md up. A full-viewport backdrop-filter is
      // the most expensive thing on the page to composite, and it lands
      // exactly when the panel is springing in; below md the scrim just
      // goes deeper and does the separation work on its own.
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:p-6 md:bg-black/40 md:backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="project-modal-title"
        className="supports-[height:100dvh]:max-h-[88dvh] max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-surface p-4 shadow-2xl sm:p-6 lg:p-8"
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
            data-spring
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
            data-spring
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
              data-spring
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-line px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent/50"
            >
              <ExternalLink className="h-4 w-4" />
              Live demo
            </a>
          )}
        </div>

        <div className="mt-8 border-t border-line pt-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-faint">
            README
          </p>
          {readmeState === "loading" && (
            <div className="mt-4 space-y-2.5">
              <div className="skeleton h-3 w-11/12" />
              <div className="skeleton h-3 w-full" />
              <div className="skeleton h-3 w-4/5" />
              <div className="skeleton h-3 w-2/3" />
            </div>
          )}
          {readmeState === "done" && readmeBlocks.length > 0 && (
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted">
              {readmeBlocks.map((block, i) => (
                <ReadmeBlockView key={i} block={block} />
              ))}
            </div>
          )}
          {readmeState === "done" && readmeBlocks.length === 0 && (
            <p className="mt-4 text-sm text-faint">No README found.</p>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
