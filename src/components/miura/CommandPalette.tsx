import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Copy,
  Folder,
  Search,
} from "lucide-react";
import { NAV_ITEMS } from "../../config/navigation";
import { profile } from "../../config/profile";
import { useReducedMotion } from "../../hooks/useReducedMotion";
import { useScrollLock } from "../../hooks/useScrollLock";
import type { Project } from "../../lib/github";
import { GithubIcon } from "../icons";

interface PaletteItem {
  id: string;
  group: "Go to" | "Projects" | "Actions";
  label: string;
  icon: "arrow" | "folder" | "copy" | "external";
  hint?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
}

/**
 * Command palette restyled into the Miura world: a paper slip pinned
 * to the sheet. Same keyboard-first behavior, no theme action (the
 * sheet is single-light by design).
 */
export function CommandPalette({ open, onClose, projects }: CommandPaletteProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  // Held until unmount, not until `open` flips: releasing mid-exit would
  // unpin the body under a panel that is still fading out.
  useScrollLock(mounted);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const listRef = useRef<HTMLUListElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      setQuery("");
      setActiveIndex(0);
      setCopiedEmail(false);
      setMounted(true);
      return;
    }
    if (!mounted) return;
    restoreFocusRef.current?.focus?.();
    setMounted(false);
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted || !open) return;
    inputRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % filteredCountRef.current);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + filteredCountRef.current) % filteredCountRef.current,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mounted, open, onClose]);

  const items = useMemo<PaletteItem[]>(() => {
    const scrollTo = (id: string) => {
      onClose();
      document.getElementById(id)?.scrollIntoView({
        behavior: reduced ? "auto" : "smooth",
      });
    };
    const list: PaletteItem[] = NAV_ITEMS.map((item) => ({
      id: `go-${item.id}`,
      group: "Go to",
      label: item.label,
      icon: "arrow",
      hint: "Section",
      run: () => scrollTo(item.id),
    }));
    for (const project of projects) {
      list.push({
        id: `project-${project.name}`,
        group: "Projects",
        label: `Open ${project.name}`,
        icon: "folder",
        hint: project.language ?? "Repo",
        run: () => {
          onClose();
          window.open(project.html_url, "_blank", "noopener");
        },
      });
    }
    if (profile.email) {
      list.push({
        id: "action-email",
        group: "Actions",
        label: copiedEmail ? "Email copied!" : "Copy email address",
        icon: "copy",
        hint: profile.email,
        run: () => {
          void navigator.clipboard?.writeText(profile.email).catch(() => {});
          setCopiedEmail(true);
          window.setTimeout(() => setCopiedEmail(false), 1500);
        },
      });
    }
    list.push({
      id: "action-github",
      group: "Actions",
      label: "View GitHub profile",
      icon: "external",
      hint: "External",
      run: () => window.open(profile.social.github, "_blank", "noopener"),
    });
    return list;
  }, [projects, onClose, reduced, copiedEmail]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) =>
      `${item.label} ${item.hint ?? ""} ${item.group}`.toLowerCase().includes(q),
    );
  }, [items, query]);

  // Live count for the keyboard nav wrap-around (ref avoids stale closure)
  const filteredCountRef = useRef(filtered.length);
  filteredCountRef.current = filtered.length;

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!mounted) return null;

  const runActive = () => {
    const item = filtered[activeIndex];
    if (item) item.run();
  };

  const GROUP_ICONS = {
    arrow: ArrowRight,
    folder: Folder,
    copy: copiedEmail ? Check : Copy,
    external: ArrowUpRight,
  } as const;

  let lastGroup = "";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-ink/45 p-4 pt-[12vh] sm:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="w-full max-w-lg overflow-hidden rounded-[3px] border border-ink/20 bg-paper shadow-lift"
      >
        <div className="flex items-center gap-3 border-b border-ink/15 px-4 py-3.5">
          <Search aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-faint" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                runActive();
              }
            }}
            aria-label="Search commands"
            placeholder="Type a command or search…"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent font-mono text-sm text-ink outline-none placeholder:text-ink-faint"
          />
          <kbd className="shrink-0 rounded-[2px] border border-ink/20 bg-paper-deep px-1.5 py-0.5 font-mono text-[10px] text-ink-faint">
            ESC
          </kbd>
        </div>

        <ul ref={listRef} role="listbox" className="max-h-80 overflow-y-auto p-2">
          {filtered.map((item, i) => {
            const showGroup = item.group !== lastGroup;
            lastGroup = item.group;
            const Icon = GROUP_ICONS[item.icon];
            const active = i === activeIndex;
            return (
              <li key={item.id} role="option" aria-selected={active}>
                {showGroup && (
                  <p className="px-2.5 pb-1 pt-3 font-mono text-[10px] tracking-[0.24em] text-ink-faint">
                    {item.group.toUpperCase()}
                  </p>
                )}
                <button
                  type="button"
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={item.run}
                  className={`flex w-full items-center gap-3 rounded-[2px] px-2.5 py-2 text-left text-sm transition-colors ${
                    active ? "bg-gold/20 text-ink" : "text-ink-soft"
                  }`}
                >
                  <span className={active ? "text-gold-deep" : "text-ink-faint"}>
                    {item.icon === "external" ? (
                      <GithubIcon className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span className="tnum shrink-0 font-mono text-[10px] text-ink-faint">
                      {item.hint}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-ink-faint">
              No commands match “{query}”.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
