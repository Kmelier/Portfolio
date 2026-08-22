/**
 * How the Projects section selects and orders repositories.
 * Repositories themselves are always fetched live from GitHub.
 */

/** Repositories listed here appear first, in this order. */
export const featuredProjects: string[] = ["Travela"];

/** Repositories to never display (e.g. this portfolio itself). */
export const excludeRepos: string[] = ["portfolio"];

/** Show forked repositories? Forks are hidden by default. */
export const includeForks = false;

/** Filter bar appears only when there are at least this many repos. */
export const filterBarMinRepos = 3;
