/**
 * Experience / journey timeline. Edit freely — entries render top to bottom.
 * Don't invent achievements: keep only what's real.
 */
export interface TimelineEntry {
  period: string;
  title: string;
  description: string;
}

export const timeline: TimelineEntry[] = [
  {
    period: "2026 — Present",
    title: "Building & experimenting",
    description:
      "Building projects and experimenting with different technologies.",
  },
];
