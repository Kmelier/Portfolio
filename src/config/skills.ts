/**
 * Skills shown on the site, grouped by category.
 * Only the categories and entries listed here are displayed.
 * Icon keys: "code" | "layers" | "tools" | "terminal"
 */
export interface SkillCategory {
  title: string;
  icon: "code" | "layers" | "tools" | "terminal";
  skills: string[];
}

export const skillCategories: SkillCategory[] = [
  {
    title: "Languages",
    icon: "code",
    skills: ["Python", "JavaScript", "Dart"],
  },
  {
    title: "Frameworks / Libraries",
    icon: "layers",
    skills: ["Flutter", "Node.js", "Express"],
  },
  {
    title: "Tools",
    icon: "tools",
    skills: ["Git", "GitHub", "VS Code"],
  },
];
