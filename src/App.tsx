import { useEffect } from "react";
import { useTheme } from "./hooks/useTheme";
import { useGithubData } from "./hooks/useGithubData";
import { attachSpringHover } from "./lib/animations";
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

export default function App() {
  const { theme, toggle } = useTheme();
  const github = useGithubData();

  // One delegated listener set powers every [data-spring] control
  useEffect(() => attachSpringHover(), []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:border focus:border-line focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <Navbar theme={theme} onToggleTheme={toggle} />
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
    </>
  );
}
