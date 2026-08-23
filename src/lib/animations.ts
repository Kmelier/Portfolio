/**
 * Reusable Anime.js (v4) helpers.
 *
 * Anime.js is loaded on demand and is never on the critical path. It is
 * 39 kB raw / ~15.6 kB gzipped — about three quarters of what used to be
 * the vendor chunk — and since the hero entrance moved to CSS there is
 * nothing left in this file that has to run before the user does
 * something: every helper below is triggered by a scroll, a hover, a tap
 * or a keypress. So the module is fetched at idle once the page has
 * settled (`warmAnimations`, called from App), and anything that fires
 * before it lands waits for it instead of first paint waiting on it.
 *
 * Every helper is a no-op when the user prefers reduced motion.
 */

type AnimeModule = typeof import("./anime");

let anime: AnimeModule | null = null;
let inFlight: Promise<AnimeModule> | null = null;

function load(): Promise<AnimeModule> {
  inFlight ??= import("./anime").then((mod) => {
    anime = mod;
    return mod;
  });
  return inFlight;
}

/**
 * Fetch the engine ahead of the first interaction that needs it, so the
 * chunk is already warm by the time anything here is reached and no
 * animation is ever visibly late. Idle-scheduled by the caller.
 */
export function warmAnimations(): void {
  void load().catch(() => {});
}

/**
 * Run `fn` with the engine — now if it is already here, otherwise as soon
 * as it arrives. `onFail` runs instead if the chunk cannot be fetched at
 * all, for the callers where the animation was carrying something the UI
 * actually needs: a panel that has to finish closing, or an element that
 * was hidden in anticipation of being faded in.
 */
function withAnime(fn: (a: AnimeModule) => void, onFail?: () => void): void {
  if (anime) {
    fn(anime);
    return;
  }
  void load()
    .then(fn, () => onFail?.())
    .catch(() => {});
}

/**
 * Same idea, for high-frequency handlers: run now, or drop this call. A
 * `pointermove` must not queue — sixty deferred tweens would all land on
 * the same element in the same frame — so an unwarmed magnetic button
 * just starts the fetch and does nothing until the next move event.
 */
function whenReady(fn: (a: AnimeModule) => void): void {
  if (anime) fn(anime);
  else void load().catch(() => {});
}

/* ── Spring easings (the anime.js v4 signature feel) ──────────────
   Factories rather than constants for two reasons: a Spring binds to the
   one animation it is passed to, and the module it comes from does not
   exist until something has awaited it. */
const springHover = (a: AnimeModule) => a.spring({ bounce: 0.35, duration: 450 });
const springCard = (a: AnimeModule) => a.spring({ bounce: 0.25, duration: 500 });
const springMagnet = (a: AnimeModule) => a.spring({ bounce: 0.15, duration: 350 });
const springPress = (a: AnimeModule) => a.spring({ bounce: 0, duration: 200 });

const prefersReduced = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Elements that are about to be faded in are held hidden while the
   engine is still in flight, so a reveal firing before the chunk lands
   animates late rather than popping in fully formed. Cleared again if the
   fetch fails outright: a missing animation is a cosmetic loss, content
   stuck at zero opacity is not. */
const hide = (els: HTMLElement[]) => {
  for (const el of els) el.style.opacity = "0";
};
const show = (els: HTMLElement[]) => {
  for (const el of els) el.style.opacity = "";
};

/** Fade/slide reveal for section content entering the viewport. */
export function reveal(targets: ArrayLike<Element>, reduced: boolean): void {
  if (reduced) return;
  const els = Array.from(targets) as HTMLElement[];
  if (els.length === 0) return;
  hide(els);
  withAnime(
    ({ animate, stagger }) => {
      animate(els, {
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 750,
        ease: "outExpo",
        delay: stagger(70),
      });
    },
    () => show(els),
  );
}

/** Staggered entrance for project cards (also used on filter changes). */
export function staggerCards(
  cards: ArrayLike<Element>,
  reduced: boolean,
): void {
  if (reduced) return;
  const els = Array.from(cards) as HTMLElement[];
  if (els.length === 0) return;
  hide(els);
  withAnime(
    ({ animate, stagger }) => {
      animate(els, {
        opacity: [0, 1],
        translateY: [18, 0],
        scale: [0.985, 1],
        duration: 600,
        ease: "outExpo",
        delay: stagger(55),
      });
    },
    () => show(els),
  );
}

/** Animated number counter. No failure path on purpose: React has
 *  already rendered the final figure, so a chunk that never arrives
 *  leaves the right number on screen, merely uncounted. */
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
  withAnime(({ animate }) => {
    animate(state, {
      n: value,
      duration: 1100,
      ease: "outExpo",
      onUpdate: () => {
        el.textContent = String(Math.round(state.n));
      },
    });
  });
}

/**
 * Delegated springy hover/press for any element carrying `data-spring`.
 * One listener set for the whole document; returns a cleanup fn.
 *
 * The hover half is deliberately gated on a real hovering pointer.
 * Mobile Safari synthesises `mouseover` on tap but never the matching
 * `mouseout`, so ungated it left every tapped button parked at 1.035 for
 * the rest of the session. The press half stays on for touch — that is
 * the feedback a tap actually wants — but releases to 1 rather than to
 * the hover scale, and listens for `pointercancel` so a tap that turns
 * into a scroll does not leave the button stuck at 0.96.
 *
 * `e.pointerType` rather than a media query, so a hybrid laptop gets the
 * right behaviour per interaction instead of per device.
 */
export function attachSpringHover(): () => void {
  const canHover = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  const springEl = (target: EventTarget | null): HTMLElement | null => {
    if (!(target instanceof Element)) return null;
    return target.closest<HTMLElement>("[data-spring]");
  };
  const onOver = (e: MouseEvent) => {
    if (prefersReduced() || !canHover()) return;
    const el = springEl(e.target);
    if (!el || el.contains(e.relatedTarget as Node | null)) return;
    withAnime((a) =>
      a.animate(el, { scale: 1.035, duration: 450, ease: springHover(a) }),
    );
  };
  const onOut = (e: MouseEvent) => {
    if (prefersReduced() || !canHover()) return;
    const el = springEl(e.target);
    if (!el || el.contains(e.relatedTarget as Node | null)) return;
    withAnime((a) =>
      a.animate(el, { scale: 1, duration: 450, ease: springHover(a) }),
    );
  };
  const onDown = (e: PointerEvent) => {
    if (prefersReduced()) return;
    const el = springEl(e.target);
    if (!el) return;
    withAnime((a) =>
      a.animate(el, { scale: 0.96, duration: 200, ease: springPress(a) }),
    );
  };
  const onUp = (e: PointerEvent) => {
    if (prefersReduced()) return;
    const el = springEl(e.target);
    if (!el) return;
    const resting = e.pointerType === "mouse" && canHover() ? 1.035 : 1;
    withAnime((a) =>
      a.animate(el, { scale: resting, duration: 300, ease: springPress(a) }),
    );
  };
  document.addEventListener("mouseover", onOver);
  document.addEventListener("mouseout", onOut);
  document.addEventListener("pointerdown", onDown);
  document.addEventListener("pointerup", onUp);
  document.addEventListener("pointercancel", onUp);
  return () => {
    document.removeEventListener("mouseover", onOver);
    document.removeEventListener("mouseout", onOut);
    document.removeEventListener("pointerdown", onDown);
    document.removeEventListener("pointerup", onUp);
    document.removeEventListener("pointercancel", onUp);
  };
}

/** Activation bounce for filter pills. */
export function activatePulse(el: HTMLElement, reduced: boolean): void {
  if (reduced) return;
  withAnime((a) =>
    a.animate(el, { scale: [1.14, 1], duration: 450, ease: springHover(a) }),
  );
}

/**
 * Card hover lift with spring (replaces the CSS transition lift).
 *
 * Hovering pointers only. React's onMouseEnter is a synthetic mouseenter,
 * and mobile Safari fires those on tap without a matching leave — so on
 * touch this left every tapped card lifted 6px and shrunk-scaled for
 * good. Touch gets a real press state from CSS instead (see `.card-glow`
 * in src/index.css).
 */
function canHoverLift(): boolean {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}
export function cardSpringIn(el: HTMLElement, reduced: boolean): void {
  if (reduced || !canHoverLift()) return;
  withAnime((a) =>
    a.animate(el, {
      translateY: -6,
      scale: 1.006,
      duration: 500,
      ease: springCard(a),
    }),
  );
}
export function cardSpringOut(el: HTMLElement, reduced: boolean): void {
  if (reduced || !canHoverLift()) return;
  withAnime((a) =>
    a.animate(el, {
      translateY: 0,
      scale: 1,
      duration: 500,
      ease: springCard(a),
    }),
  );
}

/**
 * Cursor-follow "magnetic" effect for the hero primary button.
 * Fine pointers only; no-ops for reduced motion. Returns a cleanup fn.
 *
 * `whenReady` rather than `withAnime`: pointermove fires far too often to
 * queue behind a network fetch. Worth noting this is also the one place
 * that would have broken if the hero entrance had been given
 * `animation-fill-mode: forwards` — a filled CSS animation outranks the
 * inline transform written here.
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
    whenReady((a) =>
      a.animate(el, {
        translateX: nx * MAX_X,
        translateY: ny * MAX_Y,
        duration: 350,
        ease: springMagnet(a),
      }),
    );
  };
  const onLeave = () => {
    if (prefersReduced()) return;
    withAnime((a) =>
      a.animate(el, {
        translateX: 0,
        translateY: 0,
        duration: 550,
        ease: springMagnet(a),
      }),
    );
  };
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerleave", onLeave);
  return () => {
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerleave", onLeave);
  };
}

/** Modal entrance: backdrop fade + panel spring rise. Both render opaque,
 *  so a late chunk simply means the dialog appears without the rise. */
export function modalIn(
  backdrop: HTMLElement | null,
  panel: HTMLElement | null,
  reduced: boolean,
): void {
  if (reduced || !backdrop || !panel) return;
  withAnime((a) => {
    a.animate(backdrop, { opacity: [0, 1], duration: 220, ease: "outQuad" });
    a.animate(panel, { opacity: [0, 1], duration: 180, ease: "outQuad" });
    a.animate(panel, {
      scale: [0.96, 1],
      translateY: [16, 0],
      duration: 550,
      ease: springCard(a),
    });
  });
}

/** Modal exit, then invoke onDone. `onDone` is also the failure path:
 *  the caller unmounts the dialog from it, so it has to fire either way
 *  or the modal would never close. */
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
  withAnime(({ animate }) => {
    animate(backdrop, { opacity: [1, 0], duration: 160, ease: "inQuad" });
    animate(panel, {
      opacity: [1, 0],
      scale: [1, 0.97],
      duration: 160,
      ease: "inQuad",
      onComplete: onDone,
    });
  }, onDone);
}

/** Mobile nav sheet dropping in, with its rows sliding after it. The
 *  sheet ships at `opacity-0` so the failure path has to reveal it. */
export function menuIn(nav: HTMLElement): void {
  withAnime(
    ({ animate, stagger }) => {
      animate(nav, {
        opacity: [0, 1],
        translateY: [-10, 0],
        duration: 320,
        ease: "outExpo",
      });
      animate(nav.querySelectorAll("a, button"), {
        opacity: [0, 1],
        translateX: [-12, 0],
        duration: 380,
        ease: "outExpo",
        delay: stagger(45, { start: 60 }),
      });
    },
    () => {
      nav.style.opacity = "1";
    },
  );
}

/** Mobile nav sheet closing; `onDone` unmounts it, so it must always run. */
export function menuOut(nav: HTMLElement, onDone: () => void): void {
  withAnime(({ animate }) => {
    animate(nav, {
      opacity: [1, 0],
      translateY: [0, -8],
      duration: 220,
      ease: "inQuad",
      onComplete: onDone,
    });
  }, onDone);
}

/** Command-palette rows, re-staggered on open and on every query change. */
export function paletteList(list: HTMLElement): void {
  withAnime(({ animate, stagger }) => {
    animate(list.querySelectorAll("li"), {
      opacity: [0, 1],
      translateY: [6, 0],
      duration: 260,
      ease: "outExpo",
      delay: stagger(22),
    });
  });
}

/** Spring pop for the theme-toggle icon swap. */
export function iconPop(el: HTMLElement | null, reduced: boolean): void {
  if (reduced || !el) return;
  withAnime((a) =>
    a.animate(el, {
      scale: [0.6, 1],
      rotate: [-60, 0],
      opacity: [0, 1],
      duration: 450,
      ease: springHover(a),
    }),
  );
}

/**
 * One-shot celebration burst (easter egg): dots + code glyphs from the hero.
 *
 * Everything, including creating the layer, happens inside the callback:
 * if the engine never arrives there is nothing to clean up and nothing
 * appears, which beats 42 static glyphs stacked in the middle of the
 * viewport for a second and a half.
 */
export function particleBurst(reduced: boolean): void {
  if (reduced) return;
  withAnime(({ animate }) => {
    const layer = document.createElement("div");
    layer.style.cssText =
      "position:fixed;inset:0;z-index:120;pointer-events:none;";
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
  });
}
