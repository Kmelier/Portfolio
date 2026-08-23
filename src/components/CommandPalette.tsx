import { useEffect, useMemo, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import {
  ArrowRight,
  Check,
  Copy,
  ExternalLink,
  Folder,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import { NAV_ITEMS } from "../config/navigation";
import { profile } from "../config/profile";
import type { Theme, ThemeOrigin } from "../hooks/useTheme";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { useScrollLock } from "../hooks/useScrollLock";
import { modalIn, modalOut } from "../lib/animations";
import type { Project } from "../lib/github";
import { GithubIcon } from "./icons";

interface PaletteItem {
  id: string;
  group: "Go to" | "Projects" | "Actions";
  label: string;
  icon: "arrow" | "folder" | "theme" | "copy" | "external";
  hint?: string;
  run: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
  projects: Project[];
  theme: Theme;
  onToggleTheme: (origin?: ThemeOrigin) => void;
}

export function CommandPalette({
  open,
  onClose,
  projects,
  theme,
  onToggleTheme,
}: CommandPaletteProps) {
  const reduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  // Held until unmount, not until `open` flips: releasing mid-exit would
  // unpin the body under a panel that is still fading out.
  useScrollLock(mounted);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Lifecycle: open → mount + animate in; close → animate out → unmount
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
    const finish = () => {
      restoreFocusRef.current?.focus?.();
      setMounted(false);
    };
    if (reduced) {
      finish();
      return;
    }
    modalOut(backdropRef.current, panelRef.current, reduced, finish);
  }, [open, mounted, reduced]);

  // After mounting: entrance animation, focus, scroll lock, keyboard nav
  useEffect(() => {
    if (!mounted || !open) return;
    modalIn(backdropRef.current, panelRef.current, reduced);
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
          (i) =>
            (i - 1 + filteredCountRef.current) % filteredCountRef.current,
        );
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint not configured; listeners intentionally follow open state
  }, [mounted, open, onClose, reduced]);

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
          window.location.hash = `#/project/${project.name}`;
        },
      });
    }
    list.push({
      id: "action-theme",
      group: "Actions",
      label: theme === "dark" ? "Switch to light theme" : "Switch to dark theme",
      icon: "theme",
      hint: "Theme",
      run: () => {
        const panel = panelRef.current;
        const rect = panel?.getBoundingClientRect();
        onToggleTheme(
          rect
            ? {
                x: rect.left + rect.width / 2,
                y: rect.top + rect.height / 2,
              }
            : undefined,
        );
      },
    });
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
  }, [projects, theme, onToggleTheme, onClose, reduced, copiedEmail]);

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

  // Stagger rows in on open and on every query change
  useEffect(() => {
    if (!mounted || !open || reduced) return;
    if (listRef.current) {
      animate(listRef.current.querySelectorAll("li"), {
        opacity: [0, 1],
        translateY: [6, 0],
        duration: 260,
        ease: "outExpo",
        delay: stagger(22),
      });
    }
  }, [mounted, open, query, reduced]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  if (!mounted) return null;

  const runActive = () => {
    const item = filtered[activeIndex];
    if (item) item.run();
  };

  const GROUP_ICONS: Record<PaletteItem["icon"], typeof ArrowRight> = {
    arrow: ArrowRight,
    folder: Folder,
    theme: theme === "dark" ? Sun : Moon,
    copy: copiedEmail ? Check : Copy,
    external: ExternalLink,
  };

  let lastGroup = "";

  return (
    <div
      ref={backdropRef}
      // Blur from md up only — see the note in ProjectModal. A deeper flat
      // scrim reads the same on a phone and costs nothing per frame.
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/80 p-4 pt-[12vh] sm:p-6 md:bg-black/55 md:backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="card-glow w-full max-w-lg overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-line px-4 py-3.5">
          <Search className="h-4 w-4 shrink-0 text-faint" />
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
            className="w-full bg-transparent text-[16px] outline-none placeholder:text-faint sm:text-sm"
          />
          <kbd className="shrink-0 rounded border border-line bg-elevated px-1.5 py-0.5 font-mono text-[10px] text-faint">
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
                  <p className="px-2.5 pb-1 pt-3 font-mono text-[10px] uppercase tracking-wider text-faint">
                    {item.group}
                  </p>
                )}
                <button
                  type="button"
                  data-spring
                  onMouseEnter={() => setActiveIndex(i)}
                  onClick={item.run}
                  className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                    active ? "bg-elevated text-fg" : "text-muted"
                  }`}
                >
                  <span className={active ? "text-accent" : "text-faint"}>
                    {item.icon === "external" ? (
                      <GithubIcon className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </span>
                  <span className="flex-1 truncate">{item.label}</span>
                  {item.hint && (
                    <span className="shrink-0 font-mono text-[10px] text-faint">
                      {item.hint}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center text-sm text-faint">
              No commands match “{query}”.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
