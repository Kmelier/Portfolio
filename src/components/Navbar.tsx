import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { Search } from "lucide-react";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { Theme, ThemeOrigin } from "../hooks/useTheme";
import { profile } from "../config/profile";
import { NAV_ITEMS } from "../config/navigation";
import { ThemeToggleButton, iconButtonClass } from "./ThemeToggle";
import { GithubIcon } from "./icons";

/** Three bars that morph into an X. */
function HamburgerIcon({ open }: { open: boolean }) {
  return (
    <span aria-hidden className="relative block h-4 w-5">
      <span
        className={`absolute left-0 top-0 h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-out ${
          open ? "translate-y-[7.5px] rotate-45" : ""
        }`}
      />
      <span
        className={`absolute left-0 top-[7.5px] h-[1.5px] w-full rounded-full bg-current transition-opacity duration-200 ${
          open ? "opacity-0" : "opacity-100"
        }`}
      />
      <span
        className={`absolute left-0 top-[15px] h-[1.5px] w-full rounded-full bg-current transition-transform duration-300 ease-out ${
          open ? "-translate-y-[7.5px] -rotate-45" : ""
        }`}
      />
    </span>
  );
}

interface NavbarProps {
  theme: Theme;
  onToggleTheme: (origin?: ThemeOrigin) => void;
  onOpenPalette: () => void;
}

export function Navbar({ theme, onToggleTheme, onOpenPalette }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuMounted, setMenuMounted] = useState(false);
  const reduced = useReducedMotion();

  const linkRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const indicatorRef = useRef<HTMLSpanElement | null>(null);
  const menuRef = useRef<HTMLElement | null>(null);

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

  // Sliding gradient indicator under the active nav link.
  //
  // The slide is a CSS transition on the element itself (`.nav-indicator`)
  // rather than an Anime.js tween of the same three properties. It is the
  // only animation in this file that ran on mount, so moving it out is
  // what lets Anime.js load lazily — and animating `left`/`width` from JS
  // meant a layout on every frame of the slide, which the transition also
  // does but without a main-thread tick driving it. Reduced motion is
  // handled by the media query around that rule, so both branches here
  // collapse into plain style writes.
  useEffect(() => {
    const indicator = indicatorRef.current;
    if (!indicator) return;
    const idx = NAV_ITEMS.findIndex((i) => i.id === active);
    const link = idx >= 0 ? linkRefs.current[idx] : null;
    if (!link) {
      indicator.style.opacity = "0";
      return;
    }
    indicator.style.left = `${link.offsetLeft}px`;
    indicator.style.width = `${link.offsetWidth}px`;
    indicator.style.opacity = "1";
  }, [active]);

  // Keep the indicator glued to its link across resizes
  useEffect(() => {
    const onResize = () => {
      const indicator = indicatorRef.current;
      const idx = NAV_ITEMS.findIndex((i) => i.id === active);
      const link = idx >= 0 ? linkRefs.current[idx] : null;
      if (indicator && link) {
        // Snap rather than slide: mid-drag the transition would leave the
        // indicator trailing 400ms behind the link it belongs to.
        indicator.style.transitionDuration = "0s";
        indicator.style.left = `${link.offsetLeft}px`;
        indicator.style.width = `${link.offsetWidth}px`;
        requestAnimationFrame(() => {
          indicator.style.transitionDuration = "";
        });
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [active]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  // Mobile menu lifecycle: open → mount + animate in; close → animate out → unmount
  useEffect(() => {
    if (menuOpen) {
      setMenuMounted(true);
      return;
    }
    const nav = menuRef.current;
    if (!menuMounted || !nav) return;
    if (reduced) {
      setMenuMounted(false);
      return;
    }
    animate(nav, {
      opacity: [1, 0],
      translateY: [0, -8],
      duration: 220,
      ease: "inQuad",
      onComplete: () => setMenuMounted(false),
    });
  }, [menuOpen, menuMounted, reduced]);

  // Runs after the mounted nav actually exists
  useEffect(() => {
    if (!menuOpen || !menuMounted) return;
    const nav = menuRef.current;
    if (!nav || reduced) return;
    animate(nav, {
      opacity: [0, 1],
      translateY: [-10, 0],
      duration: 320,
      ease: "outExpo",
    });
    animate(nav.querySelectorAll("a, button"), {
      opacity: [0, 1],
      translateX: [-12, 0],
      duration: 380,
      ease: "outExpo",
      delay: stagger(45, { start: 60 }),
    });
  }, [menuOpen, menuMounted, reduced]);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || menuOpen
          ? // Opaque by default: a sticky backdrop-filter has to re-blur
            // whatever scrolls under it on every frame, which is the
            // single worst scroll cost on a phone. Light mode already
            // avoided it (dark text smears behind a blur); dark now
            // does too, and only earns the translucent blur back at
            // md+, where there is GPU headroom for it.
            "border-line bg-bg md:dark:bg-bg/80 md:dark:backdrop-blur-xl"
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

        {/* Desktop navigation with sliding indicator */}
        <ul className="relative hidden items-center gap-7 md:flex">
          {NAV_ITEMS.map((item, i) => (
            <li key={item.id}>
              <a
                ref={(el) => {
                  linkRefs.current[i] = el;
                }}
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
          <span
            ref={indicatorRef}
            aria-hidden
            className="nav-indicator absolute -bottom-[9px] left-0 h-[2px] rounded-full bg-gradient-to-r from-accent to-accent-2"
            style={{ width: 0, opacity: 0 }}
          />
        </ul>

        <div className="flex items-center gap-2">
          {/* Grouped in one wrapper rather than given `hidden md:inline-flex`
              each: `hidden` and the `inline-flex` inside iconButtonClass are
              both display utilities of equal specificity, so which one won
              would come down to Tailwind's internal sort order. Both live in
              the mobile sheet instead — four 44px targets do not fit across
              a 390px header beside the wordmark. */}
          <div className="hidden items-center gap-2 md:flex">
            <button
              type="button"
              data-spring
              onClick={onOpenPalette}
              aria-label="Open command palette"
              aria-keyshortcuts="Control+K"
              className={`${iconButtonClass} gap-2`}
            >
              <Search className="h-4 w-4" />
              <span className="font-mono text-[10px] text-faint">⌘K</span>
            </button>

            <a
              href={profile.social.github}
              target="_blank"
              rel="noreferrer noopener"
              aria-label="GitHub profile (opens in a new tab)"
              data-spring
              className={iconButtonClass}
            >
              <GithubIcon className="h-4 w-4" />
            </a>
          </div>

          <ThemeToggleButton theme={theme} onToggleTheme={onToggleTheme} />

          <button
            type="button"
            data-spring
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            className="tap-target inline-flex items-center justify-center rounded-lg border border-line bg-surface/50 p-2 text-muted transition-colors hover:border-accent/50 hover:text-fg md:hidden"
          >
            <HamburgerIcon open={menuOpen} />
          </button>
        </div>
      </nav>

      {/* Mobile navigation (animated) */}
      {menuMounted && (
        <nav
          id="mobile-nav"
          ref={menuRef}
          aria-label="Mobile"
          className={`md:hidden ${reduced ? "" : "opacity-0"}`}
        >
          <ul className="space-y-1 border-t border-line px-6 py-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  onClick={() => setMenuOpen(false)}
                  className={`tap-target flex items-center rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    active === item.id
                      ? "bg-elevated font-medium text-fg"
                      : "text-muted hover:bg-elevated hover:text-fg"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}

            <li className="mt-2 border-t border-line pt-2">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenPalette();
                }}
                className="tap-target flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
              >
                <Search className="h-4 w-4 shrink-0 text-faint" />
                Search
              </button>
            </li>
            <li>
              <a
                href={profile.social.github}
                target="_blank"
                rel="noreferrer noopener"
                onClick={() => setMenuOpen(false)}
                className="tap-target flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-elevated hover:text-fg"
              >
                <GithubIcon className="h-4 w-4 shrink-0 text-faint" />
                GitHub profile
              </a>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
