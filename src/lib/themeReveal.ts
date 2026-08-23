/**
 * Cheap circular theme reveal.
 *
 * This replaces two mechanisms that both misbehaved on phones:
 *
 *  - The View Transitions API, which snapshots the entire page into a
 *    GPU texture before animating. `content-visibility: auto` makes that
 *    worse, because building the snapshot forces every offscreen section
 *    the browser had been skipping to render. Desktop hides the cost;
 *    phones don't.
 *  - A `transition: background-color, …, box-shadow` applied to *every*
 *    element for 350ms, which is a full-page repaint per frame — and the
 *    path taken by every iOS Safari before 18, which got the expensive
 *    repaint and no reveal animation to show for it.
 *
 * Instead: one solid-colour circle grown over the page with `transform`
 * and faded out with `opacity` — the only two properties that are
 * reliably composited, so the animation never touches the main thread.
 * The token swap happens in a single frame while the circle fully covers
 * the viewport, so its repaint is never seen. Same behaviour on every
 * browser: no snapshot, no per-element transitions.
 *
 * Every style here goes through the CSSOM rather than a markup `style`
 * attribute, so the site's `style-src 'self'` CSP needs no exception.
 */

export interface RevealOrigin {
  x: number;
  y: number;
}

const GROW_MS = 300;
const FADE_MS = 220;
/** Ease-out: quick off the mark, settles into full coverage. */
const GROW_EASING = "cubic-bezier(0.33, 0, 0.2, 1)";

/** The in-flight reveal, so a rapid re-toggle retires it cleanly. */
let active: { el: HTMLDivElement; cancel: () => void } | null = null;

/**
 * Grow a disc of `incomingBg` from `origin`, run `apply` under full
 * cover, then fade the disc away.
 *
 * `apply` is guaranteed to run exactly once even if the reveal is
 * interrupted by another toggle, so the theme can never end up out of
 * step with React's state.
 */
export function themeReveal(
  origin: RevealOrigin,
  incomingBg: string,
  apply: () => void,
): void {
  active?.cancel();

  let applied = false;
  const applyOnce = () => {
    if (applied) return;
    applied = true;
    apply();
  };

  const radius = Math.hypot(
    Math.max(origin.x, window.innerWidth - origin.x),
    Math.max(origin.y, window.innerHeight - origin.y),
  );

  const el = document.createElement("div");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText = [
    "position:fixed",
    `left:${origin.x}px`,
    `top:${origin.y}px`,
    `width:${radius * 2}px`,
    `height:${radius * 2}px`,
    `margin:${-radius}px 0 0 ${-radius}px`,
    "border-radius:50%",
    `background:${incomingBg}`,
    "transform:scale(0)",
    "pointer-events:none",
    "z-index:2147483647",
    "will-change:transform,opacity",
  ].join(";");
  document.body.appendChild(el);

  const grow = el.animate(
    [{ transform: "scale(0)" }, { transform: "scale(1)" }],
    { duration: GROW_MS, easing: GROW_EASING, fill: "forwards" },
  );

  const retire = () => {
    el.remove();
    if (active?.el === el) active = null;
  };

  active = {
    el,
    cancel: () => {
      grow.cancel();
      applyOnce();
      retire();
    },
  };

  void grow.finished
    .then(() => {
      applyOnce();
      // Two frames: rAF runs before paint, so the second callback is the
      // first moment the newly themed paint is guaranteed on screen.
      // Fading any earlier can flash the outgoing theme through the disc.
      return new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
    })
    .then(
      () =>
        el.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: FADE_MS,
          easing: "linear",
          fill: "forwards",
        }).finished,
    )
    .then(retire)
    .catch(retire);
}
