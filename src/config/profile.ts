/**
 * ───────────────────────── YOUR PROFILE ─────────────────────────
 * The single place to edit personal information on the site.
 *
 * Rules:
 *  - Empty strings ("") hide that field — no placeholder is shown.
 *  - GitHub data (repositories, stats, activity) is always fetched
 *    live from the API and never needs editing here.
 * ────────────────────────────────────────────────────────────────
 */
export const profile = {
  name: "Chris Kmelier",
  username: "Kmelier",

  /** One-line intro used in the About section. */
  bio: "Tech enthusiast. I like contributing to random projects.",
  /** Hero heading. */
  tagline: "I build things on the web and beyond.",

  // Optional About-panel fields — fill in to show them:
  location: "",
  focus: "",
  interests: "",
  learning: "",
  favorites: "",

  /** Contact email shown as a button. Set to "" to hide it. */
  email: "POLIIQQW@proton.me",

  social: {
    github: "https://github.com/Kmelier",
    linkedin: "", // e.g. "https://linkedin.com/in/your-handle"
    discord: "", // e.g. "https://discord.com/users/your-id"
  },
} as const;

export type Profile = typeof profile;
