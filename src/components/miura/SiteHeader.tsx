import { Command } from "lucide-react";
import { NAV_ITEMS } from "../../config/navigation";
import { Packet } from "./Packet";

interface SiteHeaderProps {
  onOpenPalette: () => void;
}

/**
 * Top strip: packet top-left, aerospace-spec nav top-right, and the
 * command-palette trigger. Not sticky — the sheet stays clean on scroll.
 */
export function SiteHeader({ onOpenPalette }: SiteHeaderProps) {
  return (
    <header className="anim-rise relative z-20 mx-auto flex w-full max-w-7xl items-start justify-between px-6 pt-8 sm:px-10">
      <Packet />
      <nav aria-label="Primary" className="flex items-center gap-5 pt-2">
        <ul className="hidden items-center gap-5 md:flex">
          {NAV_ITEMS.map((item, i) => (
            <li key={item.id} className="flex items-center gap-5">
              {i > 0 && (
                <span aria-hidden="true" className="text-ink-faint">
                  /
                </span>
              )}
              <a
                href={`#${item.id}`}
                className="font-mono text-[12px] font-medium tracking-[0.22em] text-ink transition-colors hover:text-gold-deep"
              >
                {item.label.toUpperCase()}
              </a>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onOpenPalette}
          aria-label="Open command palette"
          className="flex items-center gap-2 rounded-[3px] border border-ink/20 bg-paper px-2.5 py-1.5 font-mono text-[11px] tracking-[0.14em] text-ink-soft shadow-[1px_2px_6px_rgb(28_28_25/0.12)] transition-colors hover:border-ink/40 hover:text-ink"
        >
          <Command aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">K</span>
        </button>
      </nav>
    </header>
  );
}
