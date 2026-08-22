import { animate, createTimeline, stagger } from "animejs";

/**
 * Reusable Anime.js (v4) helpers.
 * Every helper is a no-op when the user prefers reduced motion.
 */

type AnimTargets = Parameters<typeof animate>[0];

export function heroEntrance(
  targets: {
    label: Element | null;
    heading: Element | null;
    sub: Element | null;
    buttons: (Element | null)[];
  },
  reduced: boolean,
): void {
  if (reduced) return;
  const buttons = targets.buttons.filter(Boolean);
  const tl = createTimeline({
    defaults: { ease: "outExpo", duration: 900 },
  });
  if (targets.label) {
    tl.add(targets.label, { opacity: [0, 1], translateY: [14, 0] }, 100);
  }
  if (targets.heading) {
    tl.add(targets.heading, { opacity: [0, 1], translateY: [26, 0] }, "-=650");
  }
  if (targets.sub) {
    tl.add(targets.sub, { opacity: [0, 1], translateY: [18, 0] }, "-=700");
  }
  if (buttons.length > 0) {
    tl.add(
      buttons,
      { opacity: [0, 1], translateY: [12, 0], delay: stagger(110) },
      "-=650",
    );
  }
}

/** Gentle infinite float for hero background elements. */
export function startFloat(els: HTMLElement[], reduced: boolean): void {
  if (reduced) return;
  els.forEach((el, i) => {
    animate(el, {
      translateY: [0, -(8 + (i % 3) * 4)],
      translateX: i % 2 === 0 ? [0, 6] : [0, -6],
      duration: 2800 + i * 450,
      ease: "inOutSine",
      loop: true,
      alternate: true,
      delay: i * 320,
    });
  });
}

/** Fade/slide reveal for section content entering the viewport. */
export function reveal(targets: AnimTargets, reduced: boolean): void {
  if (reduced) return;
  animate(targets, {
    opacity: [0, 1],
    translateY: [20, 0],
    duration: 750,
    ease: "outExpo",
    delay: stagger(70),
  });
}

/** Staggered entrance for project cards (also used on filter changes). */
export function staggerCards(
  cards: Element[] | HTMLCollection,
  reduced: boolean,
): void {
  if (reduced) return;
  animate(Array.from(cards), {
    opacity: [0, 1],
    translateY: [18, 0],
    scale: [0.985, 1],
    duration: 600,
    ease: "outExpo",
    delay: stagger(55),
  });
}

/** Animated number counter. */
export function countUp(
  el: HTMLElement,
  value: number,
  reduced: boolean,
): void {
  if (reduced || value === 0) {
    el.textContent = String(value);
    return;
  }
  const state = { n: 0 };
  animate(state, {
    n: value,
    duration: 1100,
    ease: "outExpo",
    onUpdate: () => {
      el.textContent = String(Math.round(state.n));
    },
  });
}

/** Modal entrance: backdrop fade + panel rise. */
export function modalIn(
  backdrop: HTMLElement | null,
  panel: HTMLElement | null,
  reduced: boolean,
): void {
  if (reduced || !backdrop || !panel) return;
  animate(backdrop, {
    opacity: [0, 1],
    duration: 220,
    ease: "outQuad",
  });
  animate(panel, {
    opacity: [0, 1],
    scale: [0.96, 1],
    translateY: [14, 0],
    duration: 320,
    ease: "outExpo",
  });
}

/** Modal exit, then invoke onDone. */
export function modalOut(
  backdrop: HTMLElement | null,
  panel: HTMLElement | null,
  reduced: boolean,
  onDone: () => void,
): void {
  if (reduced || !backdrop || !panel) {
    onDone();
    return;
  }
  animate(backdrop, { opacity: [1, 0], duration: 160, ease: "inQuad" });
  animate(panel, {
    opacity: [1, 0],
    scale: [1, 0.97],
    duration: 160,
    ease: "inQuad",
    onComplete: onDone,
  });
}

/** Small pop for the theme-toggle icon swap. */
export function iconPop(el: HTMLElement | null, reduced: boolean): void {
  if (reduced || !el) return;
  animate(el, {
    scale: [0.6, 1],
    rotate: [-60, 0],
    opacity: [0, 1],
    duration: 320,
    ease: "outBack",
  });
}
