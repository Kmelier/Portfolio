/**
 * Production server for the portfolio.
 *
 * Serves the Vite build output in dist/ with an SPA fallback to index.html.
 * (The app uses hash routing like /#/project/RepoName, so every unknown
 * path safely serves the shell.)
 *
 * Usage on your server:
 *   bun install
 *   bun run build
 *   bun run index.ts        # or: bun start
 *
 * Env: PORT (default 3000), HOST (default 0.0.0.0)
 */
import { join, normalize } from "node:path";

const DIST = join(import.meta.dir, "dist");
const PORT = Number(process.env.PORT ?? 3000);
const HOST = process.env.HOST ?? "0.0.0.0";

const INDEX = Bun.file(join(DIST, "index.html"));
if (!(await INDEX.exists())) {
  console.error('dist/index.html not found. Run "bun run build" first.');
  process.exit(1);
}

Bun.serve({
  port: PORT,
  hostname: HOST,
  async fetch(req) {
    const pathname = new URL(req.url).pathname;
    // Strip leading slashes and collapse any ".." segments so requests
    // can never escape dist/.
    const rel = normalize(pathname).replace(/^(\.\.[/\\])+/, "").replace(/^[/\\]+/, "");
    let file = Bun.file(join(DIST, rel));

    if (rel === "" || !(await file.exists())) {
      file = INDEX; // SPA fallback
    }
    return new Response(file);
  },
});

console.log(`Portfolio live at http://${HOST === "0.0.0.0" ? "localhost" : HOST}:${PORT}`);
