/**
 * The only place Anime.js is imported by name.
 *
 * It exists so `src/lib/animations.ts` can `import("./anime")` and still
 * get a tree-shaken library. A dynamic `import("animejs")` cannot be
 * shaken: the namespace object it resolves to is passed around as a
 * value, so the bundler has to assume every export is reachable and
 * keeps the timeline, scroll, draggable and text modules along with the
 * three functions actually used — measured at +81 kB in the eager
 * bundle. Re-exporting three static names instead gives the bundler
 * something it can analyse, and hands the async chunk a namespace with
 * exactly three properties on it.
 */
export { animate, spring, stagger } from "animejs";
