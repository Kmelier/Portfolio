import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

/**
 * Injects a strict Content-Security-Policy <meta> into the built
 * index.html only — `vite dev` stays untouched (HMR needs inline
 * scripts). The theme bootstrap lives in public/theme-init.js, so no
 * inline-script hashes are required.
 */
function contentSecurityPolicy(): Plugin {
  return {
    name: "content-security-policy",
    apply: "build",
    transformIndexHtml(html) {
      if (/<script>(?!\s*<\/script>)/.test(html)) {
        throw new Error(
          "Inline <script> found — CSP forbids it. Move it to an external file.",
        );
      }
      const csp = [
        "default-src 'self'",
        "script-src 'self'",
        "style-src 'self'",
        "font-src 'self'",
        "img-src 'self' https://avatars.githubusercontent.com",
        "connect-src 'self' https://api.github.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'none'",
      ].join("; ");
      return {
        html,
        tags: [
          {
            tag: "meta",
            attrs: { "http-equiv": "Content-Security-Policy", content: csp },
            injectTo: "head-prepend",
          },
        ],
      };
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), contentSecurityPolicy()],
  build: {
    // Never inline a font as a data: URI. This site serves itself a
    // strict `font-src 'self'`, which blocks data: fonts outright, and
    // Vite's 4KB default is small enough to catch real subset files.
    // Returning undefined leaves every other asset type on the default.
    assetsInlineLimit(filePath: string) {
      return /\.(woff2?|ttf|otf|eot)$/i.test(filePath) ? false : undefined;
    },
    rollupOptions: {
      output: {
        // Split framework/libs from app code: config edits re-deploy
        // only the small app chunk, the big vendor chunks stay cached.
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (
            /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/.test(id)
          ) {
            return "react";
          }
          return "vendor";
        },
      },
    },
  },
});
