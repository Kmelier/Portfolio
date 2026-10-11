/**
 * Replays the sheet's deploy motion on demand (the packet's
 * "PULL TO DEPLOY"). Elements carrying [data-deploy-anim] get their
 * entrance animation class removed and re-added across a reflow,
 * which restarts the CSS animation. Inert under
 * prefers-reduced-motion, where those classes never animate.
 */
export function replayDeployMotion(): void {
  document.querySelectorAll<HTMLElement>("[data-deploy-anim]").forEach((el) => {
    const cls = el.dataset.deployAnim;
    if (!cls) return;
    el.classList.remove(cls);
    void el.offsetWidth; // force reflow so re-adding restarts the animation
    el.classList.add(cls);
  });
}
