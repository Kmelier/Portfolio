import { ChevronUp, Mail, Moon, Sun } from "lucide-react";
import type { Theme } from "../hooks/useTheme";
import { profile } from "../config/profile";
import { GithubIcon } from "./icons";

interface FooterProps {
  theme: Theme;
  onToggleTheme: () => void;
}

export function Footer({ theme, onToggleTheme }: FooterProps) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-faint">
          © {new Date().getFullYear()} Kmelier
        </p>

        <div className="flex items-center gap-2">
          <a
            href={profile.social.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub profile (opens in a new tab)"
            className="rounded-lg p-2 text-muted transition-colors hover:text-fg"
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              aria-label="Send an email"
              className="rounded-lg p-2 text-muted transition-colors hover:text-fg"
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={
              theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
            }
            aria-pressed={theme === "light"}
            className="rounded-lg p-2 text-muted transition-colors hover:text-fg"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <a
            href="#home"
            aria-label="Back to top"
            className="rounded-lg p-2 text-muted transition-colors hover:text-fg"
          >
            <ChevronUp className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
