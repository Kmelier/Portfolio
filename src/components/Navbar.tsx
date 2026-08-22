import { useEffect, useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { iconPop } from "../lib/animations";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { Theme } from "../hooks/useTheme";
import { profile } from "../config/profile";
import { GithubIcon } from "./icons";

const NAV_ITEMS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "github", label: "GitHub" },
  { id: "contact", label: "Contact" },
] as const;

interface NavbarProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Navbar({ theme, onToggleTheme }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sections = NAV_ITEMS.map((i) => document.getElementById(i.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (typeof IntersectionObserver === "undefined" || sections.length === 0)
      return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-300 ${
        scrolled || menuOpen
          ? "border-line bg-bg/80 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"
      >
        <a
          href="#home"
          className="font-mono text-sm font-semibold tracking-tight"
          aria-label="Kmelier — back to top"
        >
          Kmelier<span className="text-accent">.</span>
        </a>

        {/* Desktop navigation */}
        <ul className="hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={active === item.id ? "location" : undefined}
                className={`text-sm transition-colors ${
                  active === item.id
                    ? "font-medium text-fg"
                    : "text-muted hover:text-fg"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <a
            href={profile.social.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub profile (opens in a new tab)"
            className="rounded-lg border border-line bg-surface/50 p-2 text-muted transition-colors hover:border-accent/50 hover:text-fg"
          >
            <GithubIcon className="h-4 w-4" />
          </a>

          <button
            type="button"
            onClick={() => {
              onToggleTheme();
              iconPop(document.getElementById("theme-icon"), reduced);
            }}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            aria-pressed={theme === "light"}
            className="rounded-lg border border-line bg-surface/50 p-2 text-muted transition-colors hover:border-accent/50 hover:text-fg"
          >
            <span id="theme-icon" className="block">
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="rounded-lg border border-line bg-surface/50 p-2 text-muted transition-colors hover:border-accent/50 hover:text-fg md:hidden"
          >
            {menuOpen ? (
              <X className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile navigation */}
      {menuOpen && (
        <nav id="mobile-nav" aria-label="Mobile" className="md:hidden">
          <ul className="space-y-1 border-t border-line px-6 py-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active === item.id
                      ? "bg-elevated font-medium text-fg"
                      : "text-muted hover:bg-elevated hover:text-fg"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
