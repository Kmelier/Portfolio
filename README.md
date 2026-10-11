# Kmelier — Developer Portfolio

A minimalist, dark-first developer portfolio for **Chris Kmelier** ([@Kmelier](https://github.com/Kmelier)).
Projects, stats, and activity are fetched **live from the GitHub API** — no manual card updates.

React 19 · Vite · TypeScript · Tailwind CSS v4 · Anime.js v4 · Lucide icons · self-hosted Inter + Geist Mono

## Features

- **Command palette** — ⌘K / Ctrl+K (or the navbar search button): fuzzy-jump to sections, open projects, toggle theme, copy email
- **Dynamic projects** — public repos from the GitHub REST API, sorted featured → active → starred, with stars/forks/topics/last-updated, skeleton loaders, and a graceful error state
- **Project modal** — opens from a card or a shareable deep link (`/#/project/RepoName`), with stats and a lazy README preview
- **Adaptive honesty** — zero-value stats (followers, stars) and the achievements band stay hidden until real numbers exist; the 12-week activity heatmap is built from real events-API data only
- **Dark / light themes** — token-swapped CSS variables, persisted in `localStorage`, respects `prefers-color-scheme`, no first-paint flash
- **Restrained animation** — Anime.js springs on every interaction, word-staggered time-aware hero with parallax, blinking caret, magnetic button, circular theme reveal; disabled under `prefers-reduced-motion`
- **Easter egg** — type `kmelier` anywhere (outside inputs) or the Konami code
- **Caching** — GitHub responses cached in `localStorage` for 10 minutes (stale-while-revalidate; on API failure the last good data stays on screen)

## Develop

```bash
bun install
bun run dev       # http://localhost:5173
bun run build     # typecheck + production build to dist/
bun run preview   # serve the production build locally
bun run index.ts    # production server (Bun.serve, dist/ + SPA fallback) — for self-hosting; honors PORT/HOST env
```

## Configuration — everything you edit lives in `src/config/`

| File                | What it controls                                                                 |
| ------------------- | -------------------------------------------------------------------------------- |
| `profile.ts`        | Name, bio, hero tagline, email, social links, optional About fields (empty = hidden) |
| `projects.ts`       | `featuredProjects` order, `excludeRepos`, `includeForks`, filter-bar threshold    |
| `skills.ts`         | Skill categories shown in the Skills section                                     |
| `timeline.ts`       | Journey timeline entries                                                         |
| `achievements.ts`   | Manual achievement numbers (0 = hidden)                                          |

Repositories themselves are **never hardcoded** — they come from
`https://api.github.com/users/Kmelier/repos` on every visit (cached 10 min).

## Deploy

**Live at [kmelier.vercel.app](https://kmelier.vercel.app)** — auto-deploys from `main`.

The GitHub repo (`Kmelier/Portfolio`) is connected to the Vercel project: every `git push` ships to production automatically. To deploy manually instead: `vercel --prod`. If a custom domain is ever added, update `og:url` in `index.html`.

## Notes

- **Rate limits** — unauthenticated GitHub API allows 60 requests/hour per visitor IP; the 10-minute cache keeps a personal site far below that. If traffic ever grows, add a tiny serverless proxy with a token.
- **No backend, no tracking** — everything runs client-side; fonts are self-hosted.

## Security

The site is fully static — no backend, no forms, no auth, no secrets in the repo. Hardening in place:

- **Content-Security-Policy** injected into the production build (`vite.config.ts`): scripts/styles/fonts only from `self`, images additionally from `avatars.githubusercontent.com`, network fetches only to `api.github.com`, no objects, no form submissions, no inline scripts (the theme bootstrap lives in `public/theme-init.js`, and the build fails if an inline `<script>` sneaks in). Dev mode is unaffected — the CSP applies to builds only.
- **Host headers** (`vercel.json`): `frame-ancestors 'none'` + `X-Frame-Options: DENY` (clickjacking), HSTS with preload, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo/payment/usb denied), COOP/CORP `same-origin`.
- **Untrusted-data guards** — everything rendered from the GitHub API is React-escaped text; repo `homepage` URLs pass a `safeHttpUrl()` http(s)-only check before becoming links; the localStorage cache is shape-validated before use; all API fetches have 8s timeouts. All external links use `rel="noreferrer noopener"`.
- **Supply chain** — use `bun audit` to check for known vulnerabilities; Dependabot opens weekly dependency PRs (`.github/dependabot.yml`).
