import { ChevronUp, Mail } from "lucide-react";
import type { Theme, ThemeOrigin } from "../hooks/useTheme";
import { profile } from "../config/profile";
import { ThemeToggleButton, plainIconButtonClass } from "./ThemeToggle";
import { GithubIcon } from "./icons";

interface FooterProps {
  theme: Theme;
  onToggleTheme: (origin?: ThemeOrigin) => void;
}

export function Footer({ theme, onToggleTheme }: FooterProps) {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 pb-[max(2rem,env(safe-area-inset-bottom))] sm:flex-row">
        <p className="text-sm text-faint">
          © {new Date().getFullYear()} Kmelier
        </p>

        <div className="flex items-center gap-2">
          <a
            href={profile.social.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label="GitHub profile (opens in a new tab)"
            data-spring
            className={plainIconButtonClass}
          >
            <GithubIcon className="h-4 w-4" />
          </a>
          {profile.email && (
            <a
              href={`mailto:${profile.email}`}
              aria-label="Send an email"
              data-spring
              className={plainIconButtonClass}
            >
              <Mail className="h-4 w-4" />
            </a>
          )}
          <ThemeToggleButton
            theme={theme}
            onToggleTheme={onToggleTheme}
            variant="plain"
          />
          <a
            href="#home"
            aria-label="Back to top"
            data-spring
            className={plainIconButtonClass}
          >
            <ChevronUp className="h-4 w-4" />
          </a>
        </div>
      </div>
    </footer>
  );
}
