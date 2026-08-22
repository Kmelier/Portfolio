/* Applied before first paint to avoid a flash of the wrong theme.
   Kept as an external file so the Content-Security-Policy can forbid
   all inline scripts (`script-src 'self'`). */
(function () {
  try {
    var stored = localStorage.getItem("kmelier:theme");
    var mql = window.matchMedia("(prefers-color-scheme: light)");
    var dark = stored ? stored === "dark" : !mql.matches;
    document.documentElement.classList.toggle("dark", dark);
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
    var themeMeta = document.querySelector('meta[name="theme-color"]');
    if (themeMeta)
      themeMeta.setAttribute("content", dark ? "#0a0a0c" : "#f4f4fa");
  } catch (e) {
    /* dark stays applied */
  }
})();
