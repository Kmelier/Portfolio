# Kmelier — Developer Portfolio

A minimalist, dark-first developer portfolio for **Chris Kmelier** ([@Kmelier](https://github.com/Kmelier)).
Projects, stats, and activity are fetched **live from the GitHub API** — no manual card updates.

React 19 · Vite · TypeScript · Tailwind CSS v4 · Anime.js v4 · Lucide icons · self-hosted Inter + Geist Mono

## Features

- **Dynamic projects** — public repos from the GitHub REST API, sorted featured → active → starred, with stars/forks/topics/last-updated, skeleton loaders, and a graceful error state
- **Project modal** — opens from a card or a shareable deep link (`/#/project/RepoName`), with stats and a lazy README preview
- **Adaptive honesty** — zero-value stats (followers, stars) and the achievements band stay hidden until real numbers exist
- **Dark / light themes** — token-swapped CSS variables, persisted in `localStorage`, respects `prefers-color-scheme`, no first-paint flash
- **Restrained animation** — Anime.js timelines for hero/scroll/counters/modal, disabled under `prefers-reduced-motion`
- **Caching** — GitHub responses cached in `localStorage` for 10 minutes (stale-while-revalidate; on API failure the last good data stays on screen)

## Develop

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # typecheck + production build to dist/
npm run preview   # serve the production build locally
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

## Deploy (GitHub + Vercel, ~3 minutes)

1. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/Kmelier/portfolio.git
   git push -u origin main
   ```
   (Create the repo first at <https://github.com/new> — name it `portfolio`, set it **public**. It's already excluded from the Projects list.)

2. **Deploy on Vercel** — go to <https://vercel.com/new>, import the `Kmelier/portfolio` repo, keep the defaults (Vite is auto-detected), click **Deploy**. You'll get `https://portfolio-*.vercel.app`; rename the project to `kmelier` in Vercel settings for `https://kmelier.vercel.app`.

3. **After deploy** — if you use a custom domain or a different project name, update `og:url` in `index.html`.

Every future `git push` redeploys automatically.

## Notes

- **Rate limits** — unauthenticated GitHub API allows 60 requests/hour per visitor IP; the 10-minute cache keeps a personal site far below that. If traffic ever grows, add a tiny serverless proxy with a token.
- **No backend, no tracking** — everything runs client-side; fonts are self-hosted.

## Security

The site is fully static — no backend, no forms, no auth, no secrets in the repo. Hardening in place:

- **Content-Security-Policy** injected into the production build (`vite.config.ts`): scripts/styles/fonts only from `self`, images additionally from `avatars.githubusercontent.com`, network fetches only to `api.github.com`, no objects, no form submissions, no inline scripts (the theme bootstrap lives in `public/theme-init.js`, and the build fails if an inline `<script>` sneaks in). Dev mode is unaffected — the CSP applies to builds only.
- **Host headers** (`vercel.json`): `frame-ancestors 'none'` + `X-Frame-Options: DENY` (clickjacking), HSTS with preload, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera/mic/geo/payment/usb denied), COOP/CORP `same-origin`.
- **Untrusted-data guards** — everything rendered from the GitHub API is React-escaped text; repo `homepage` URLs pass a `safeHttpUrl()` http(s)-only check before becoming links; the localStorage cache is shape-validated before use; all API fetches have 8s timeouts. All external links use `rel="noreferrer noopener"`.
- **Supply chain** — `npm audit` clean at time of writing; Dependabot opens weekly dependency PRs (`.github/dependabot.yml`).
