import { useRef } from "react";
import { Moon, Sun } from "lucide-react";
import { iconPop } from "../lib/animations";
import { useReducedMotion } from "../hooks/useReducedMotion";
import type { Theme, ThemeOrigin } from "../hooks/useTheme";

/** Shared bordered icon-button classes (toggle + navbar GitHub link). */
export const iconButtonClass =
  "rounded-lg border border-line bg-surface/60 p-2 text-muted transition-colors hover:border-accent/50 hover:text-fg";

interface ThemeToggleButtonProps {
  theme: Theme;
  onToggleTheme: (origin?: ThemeOrigin) => void;
  /** "bordered" for the navbar, "plain" for the footer. */
  variant?: "bordered" | "plain";
}

/** Single source of the theme toggle — used in the navbar and footer. */
export function ThemeToggleButton({
  theme,
  onToggleTheme,
  variant = "bordered",
}: ThemeToggleButtonProps) {
  const reduced = useReducedMotion();
  const iconRef = useRef<HTMLSpanElement | null>(null);

  return (
    <button
      type="button"
      data-spring
      onClick={(e) => {
        onToggleTheme({ x: e.clientX, y: e.clientY });
        iconPop(iconRef.current, reduced);
      }}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      aria-pressed={theme === "light"}
      className={variant === "bordered" ? iconButtonClass : "rounded-lg p-2 text-muted transition-colors hover:text-fg"}
    >
      <span ref={iconRef} className="block">
        {theme === "dark" ? (
          <Sun className="h-4 w-4" />
        ) : (
          <Moon className="h-4 w-4" />
        )}
      </span>
    </button>
  );
}
