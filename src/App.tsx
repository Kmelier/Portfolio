import { useEffect, useState } from "react";
import { useTheme } from "./hooks/useTheme";
import { useGithubData } from "./hooks/useGithubData";
import { useEasterEgg } from "./hooks/useEasterEgg";
import { attachSpringHover } from "./lib/animations";
import { organizeProjects } from "./lib/github";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { About } from "./components/About";
import { Projects } from "./components/Projects";
import { Skills } from "./components/Skills";
import { GithubSection } from "./components/GithubSection";
import { Timeline } from "./components/Timeline";
import { Achievements } from "./components/Achievements";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import { CommandPalette } from "./components/CommandPalette";

export default function App() {
  const { theme, toggle } = useTheme();
  const github = useGithubData();
  const [paletteOpen, setPaletteOpen] = useState(false);
  useEasterEgg();

  // One delegated listener set powers every [data-spring] control
  useEffect(() => attachSpringHover(), []);

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
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-line focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Navbar
        theme={theme}
        onToggleTheme={toggle}
        onOpenPalette={() => setPaletteOpen(true)}
      />
      <main id="main">
        <Hero />
        <About />
        <Projects github={github} />
        <Skills />
        <GithubSection github={github} />
        <Timeline />
        <Achievements github={github} />
        <Contact />
      </main>
      <Footer theme={theme} onToggleTheme={toggle} />
      <CommandPalette
        open={paletteOpen}
        onClose={() => setPaletteOpen(false)}
        projects={projects}
        theme={theme}
        onToggleTheme={toggle}
      />
    </>
  );
}
