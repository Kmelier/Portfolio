import { useEffect } from "react";

/**
 * Freeze page scroll while an overlay is open.
 *
 * `document.body.style.overflow = "hidden"` is the usual one-liner and it
 * does not hold on iOS Safari: the document keeps rubber-band scrolling
 * behind the overlay, and a drag that starts on the backdrop scrolls the
 * page instead of the panel. Pinning the body with `position: fixed` at a
 * negative `top` equal to the current offset is what actually holds — the
 * page looks untouched but has nothing left to scroll.
 *
 * The offset has to be restored by hand on release, because a fixed body
 * has no scroll position of its own to come back to.
 */
export function useScrollLock(active: boolean): void {
  useEffect(() => {
    if (!active) return;
    const body = document.body;
    const html = document.documentElement;
    const scrollY = window.scrollY;

    // Measured before pinning: with the body out of flow the document
    // stops overflowing, so a classic (space-consuming) scrollbar
    // disappears and the content reflows ~15px wider. Re-reserving that
    // width as padding is what keeps the page from jumping sideways as
    // the modal opens. Overlay scrollbars — every phone — report 0 here
    // and get no padding.
    const gutter = window.innerWidth - html.clientWidth;

    const prev = {
      position: body.style.position,
      top: body.style.top,
      left: body.style.left,
      right: body.style.right,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight,
    };

    body.style.position = "fixed";
    body.style.top = `${-scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (gutter > 0) {
      const pad = parseFloat(getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${pad + gutter}px`;
    }

    return () => {
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.left = prev.left;
      body.style.right = prev.right;
      body.style.width = prev.width;
      body.style.overflow = prev.overflow;
      body.style.paddingRight = prev.paddingRight;
      // html has `scroll-behavior: smooth`, which would turn this restore
      // into a visible scroll animation back to where you already were.
      const prevBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, scrollY);
      html.style.scrollBehavior = prevBehavior;
    };
  }, [active]);
}
