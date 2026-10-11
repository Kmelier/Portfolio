import { useEffect, useState } from "react";
import { useGithubData } from "./hooks/useGithubData";
import { organizeProjects } from "./lib/github";
import { Sheet } from "./components/miura/Sheet";
import { SiteHeader } from "./components/miura/SiteHeader";
import { Hero } from "./components/miura/Hero";
import { LiveStats } from "./components/miura/LiveStats";
import { ProfileBand } from "./components/miura/ProfileBand";
import { ProjectsFold } from "./components/miura/ProjectsFold";
import { ContactBand } from "./components/miura/ContactBand";
import { SiteFooter } from "./components/miura/SiteFooter";
import { CommandPalette } from "./components/miura/CommandPalette";

export default function App() {
  const github = useGithubData();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // ⌘K / Ctrl+K toggles the command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const projects = github.data ? organizeProjects(github.data.repos) : [];

  return (
    <div className="grain relative">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-[3px] focus:border focus:border-ink focus:bg-paper focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-ink"
      >
        Skip to content
      </a>
      <Sheet />
      <SiteHeader onOpenPalette={() => setPaletteOpen(true)} />
      <main id="main" className="relative">
        <Hero />
        <LiveStats github={github} />
        <ProjectsFold projects={projects} />
        <ProfileBand />
        <ContactBand />
      </main>
      <SiteFooter github={github} />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        projects={projects}
      />
    </div>
  );
}
