import { animate, createTimeline, stagger, spring } from "animejs";

/**
 * Reusable Anime.js (v4) helpers.
 * Every helper is a no-op when the user prefers reduced motion.
 */

type AnimTargets = Parameters<typeof animate>[0];

/* ── Spring easings (the anime.js v4 signature feel) ──────────────
   Factories, not constants: a Spring binds to its animation. */
const springHover = () => spring({ bounce: 0.35, duration: 450 });
const springCard = () => spring({ bounce: 0.25, duration: 500 });
const springWords = () => spring({ bounce: 0.4, duration: 550 });
const springMagnet = () => spring({ bounce: 0.15, duration: 350 });
const springPress = () => spring({ bounce: 0, duration: 200 });

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function heroEntrance(
  targets: {
    label: Element | null;
    /** Hero heading words (`.hero-word` spans), staggered with a spring. */
    words: Element[];
    sub: Element | null;
    buttons: (Element | null)[];
  },
  reduced: boolean,
): void {
  if (reduced) return;
  const buttons = targets.buttons.filter(Boolean);

  // Words run as a standalone animation: spring easings are solver-
  // driven and cannot live inside a timeline (their duration isn't
  // fixed). Sequencing comes from the stagger's start offset.
  if (targets.words.length > 0) {
    animate(targets.words, {
      opacity: [0, 1],
      translateY: [32, 0],
      duration: 700,
      ease: springWords(),
      delay: stagger(65, { start: 350 }),
    });
  }

  const tl = createTimeline({
    defaults: { ease: "outExpo", duration: 900 },
  });
  if (targets.label) {
    tl.add(targets.label, { opacity: [0, 1], translateY: [14, 0] }, 100);
  }
  if (targets.sub) {
    tl.add(targets.sub, { opacity: [0, 1], translateY: [18, 0] }, "-=450");
  }
  if (buttons.length > 0) {
    tl.add(
      buttons,
      { opacity: [0, 1], translateY: [12, 0], delay: stagger(110) },
      "-=600",
    );
  }
}

/** Minimal controls callers need to pause/resume background loops. */
export interface PausableAnimation {
  play(): void;
  pause(): void;
}

/** Gentle infinite float for hero background elements. Returns the
 *  loops so the caller can pause them while the hero is offscreen. */
export function startFloat(
  els: HTMLElement[],
  reduced: boolean,
): PausableAnimation[] {
  if (reduced) return [];
  return els.map((el, i) =>
    animate(el, {
      translateY: [0, -(8 + (i % 3) * 4)],
      translateX: i % 2 === 0 ? [0, 6] : [0, -6],
      duration: 2800 + i * 450,
      ease: "inOutSine",
      loop: true,
      alternate: true,
      delay: i * 320,
    }),
  );
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

/** Blinking terminal caret (label `_`). Returns the loop, or null. */
export function blinkCaret(
  el: HTMLElement | null,
  reduced: boolean,
): PausableAnimation | null {
  if (!el || reduced) return null;
  return animate(el, {
    opacity: [
      { to: 0, duration: 480, ease: "linear" },
      { to: 1, duration: 480, ease: "linear" },
    ],
    loop: true,
  });
}

/**
 * Delegated springy hover/press for any element carrying `data-spring`.
 * One listener set for the whole document; returns a cleanup fn.
 */
export function attachSpringHover(): () => void {
  const springEl = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof Element)) return null;
    return target.closest<HTMLElement>("[data-spring]");
  };
  const onOver = (e: MouseEvent) => {
    if (prefersReduced()) return;
    const el = springEl(e.target);
    if (!el || el.contains(e.relatedTarget as Node | null)) return;
    animate(el, { scale: 1.035, duration: 450, ease: springHover() });
  };
  const onOut = (e: MouseEvent) => {
    if (prefersReduced()) return;
    const el = springEl(e.target);
    if (!el || el.contains(e.relatedTarget as Node | null)) return;
    animate(el, { scale: 1, duration: 450, ease: springHover() });
  };
  const onDown = (e: PointerEvent) => {
    if (prefersReduced()) return;
    const el = springEl(e.target);
    if (el) animate(el, { scale: 0.96, duration: 200, ease: springPress() });
  };
  const onUp = (e: PointerEvent) => {
    if (prefersReduced()) return;
    const el = springEl(e.target);
    if (el) animate(el, { scale: 1.035, duration: 300, ease: springPress() });
  };
  document.addEventListener("mouseover", onOver);
  document.addEventListener("mouseout", onOut);
  document.addEventListener("pointerdown", onDown);
  document.addEventListener("pointerup", onUp);
  return () => {
    document.removeEventListener("mouseover", onOver);
    document.removeEventListener("mouseout", onOut);
    document.removeEventListener("pointerdown", onDown);
    document.removeEventListener("pointerup", onUp);
  };
}

/** Activation bounce for filter pills. */
export function activatePulse(el: HTMLElement, reduced: boolean): void {
  if (reduced) return;
  animate(el, { scale: [1.14, 1], duration: 450, ease: springHover() });
}

/** Card hover lift with spring (replaces the CSS transition lift). */
export function cardSpringIn(el: HTMLElement, reduced: boolean): void {
  if (reduced) return;
  animate(el, {
    translateY: -6,
    scale: 1.006,
    duration: 500,
    ease: springCard(),
  });
}
export function cardSpringOut(el: HTMLElement, reduced: boolean): void {
  if (reduced) return;
  animate(el, { translateY: 0, scale: 1, duration: 500, ease: springCard() });
}

/**
 * Cursor-follow "magnetic" effect for the hero primary button.
 * Fine pointers only; no-ops for reduced motion. Returns a cleanup fn.
 */
export function attachMagnetic(el: HTMLElement): () => void {
  if (!window.matchMedia("(pointer: fine)").matches) return () => {};
  const MAX_X = 6;
  const MAX_Y = 5;
  const onMove = (e: PointerEvent) => {
    if (prefersReduced()) return;
    const r = el.getBoundingClientRect();
    const nx = Math.max(
      -1,
      Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)),
    );
    const ny = Math.max(
      -1,
      Math.min(1, (e.clientY - (r.top + r.height / 2)) / (r.height / 2)),
    );
    animate(el, {
      translateX: nx * MAX_X,
      translateY: ny * MAX_Y,
      duration: 350,
      ease: springMagnet(),
    });
  };
  const onLeave = () => {
    if (prefersReduced()) return;
    animate(el, {
      translateX: 0,
      translateY: 0,
      duration: 550,
      ease: springMagnet(),
    });
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
  };
}

/** Modal entrance: backdrop fade + panel spring rise. */
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
  animate(panel, { opacity: [0, 1], duration: 180, ease: "outQuad" });
  animate(panel, {
    scale: [0.96, 1],
    translateY: [16, 0],
    duration: 550,
    ease: springCard(),
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

/** Spring pop for the theme-toggle icon swap. */
export function iconPop(el: HTMLElement | null, reduced: boolean): void {
  if (reduced || !el) return;
  animate(el, {
    scale: [0.6, 1],
    rotate: [-60, 0],
    opacity: [0, 1],
    duration: 450,
    ease: springHover(),
  });
}

/** One-shot celebration burst (easter egg): dots + code glyphs from the hero. */
export function particleBurst(reduced: boolean): void {
  if (reduced) return;
  const layer = document.createElement("div");
  layer.style.cssText = "position:fixed;inset:0;z-index:120;pointer-events:none;";
  document.body.appendChild(layer);

  const glyphs = ["</>", "{ }", "git", "λ", "#", "K", "→", "*"];
  const colors = ["var(--accent)", "var(--accent-2)", "var(--fg)"];

  for (let i = 0; i < 42; i++) {
    const el = document.createElement("span");
    const isDot = Math.random() < 0.6;
    el.textContent = isDot
      ? "●"
      : glyphs[Math.floor(Math.random() * glyphs.length)];
    el.style.cssText = [
      "position:absolute",
      "left:50%",
      "top:42%",
      `font-family:var(--font-mono)`,
      `font-size:${isDot ? 8 + Math.random() * 8 : 12 + Math.random() * 8}px`,
      `color:${colors[Math.floor(Math.random() * colors.length)]}`,
    ].join(";");
    layer.appendChild(el);

    const angle = Math.random() * Math.PI * 2;
    const distance = 90 + Math.random() * 260;
    animate(el, {
      translateX: Math.cos(angle) * distance,
      translateY: Math.sin(angle) * distance - 40,
      rotate: (Math.random() - 0.5) * 220,
      scale: [0, 1, 0.9],
      opacity: [1, 1, 0],
      duration: 900 + Math.random() * 500,
      ease: "outExpo",
      delay: Math.random() * 120,
    });
  }
  window.setTimeout(() => layer.remove(), 1800);
}
