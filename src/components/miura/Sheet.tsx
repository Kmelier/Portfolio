/**
 * The deployable sheet: an absolutely-positioned parallelogram crease grid
 * with a few pale-blue valley washes, sized to the content so the sheet
 * ends anchored at the footer strip. Sits behind all content.
 */
export function Sheet() {
  return (
    <div aria-hidden="true" data-deploy-anim="anim-sheet" className="anim-sheet pointer-events-none absolute inset-0 z-0">
      <div className="crease-grid absolute inset-0" />
      {/* Valley washes: flat pale-blue parallelogram fields, low opacity. */}
      <div
        className="absolute left-[8%] top-[6%] h-[34%] w-[30%] bg-valley/40"
        style={{ clipPath: "polygon(18% 0, 100% 0, 82% 100%, 0 100%)" }}
      />
      <div
        className="absolute right-[4%] top-[38%] h-[26%] w-[24%] bg-valley/30"
        style={{ clipPath: "polygon(22% 0, 100% 0, 78% 100%, 0 100%)" }}
      />
      <div
        className="absolute bottom-[6%] left-[30%] h-[22%] w-[36%] bg-valley/25"
        style={{ clipPath: "polygon(14% 0, 100% 0, 86% 100%, 0 100%)" }}
      />
    </div>
  );
}
