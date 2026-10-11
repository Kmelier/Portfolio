# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: corporate viewers — potential clients and fellow developers visiting to evaluate Chris before reaching out. Their job is to answer "how good is this guy?" as fast as possible: scan skills, look at real shipped work, then decide whether to contact, hire, or collaborate. Secondary: recruiters and casual visitors arriving via GitHub profile or shared links.

## Product Purpose

A personal developer portfolio for Chris Kmelier (@Kmelier) that proves capability through real, verifiable work instead of claims. Success means a visitor leaves remembering two things: what he can do (skills) and what he has actually built (projects). The contact path (email button, GitHub link) must be one obvious step from that impression.

## Positioning

Radical honesty as a feature: every number on the site is live from the GitHub API — repos, stars, activity heatmap — and anything without real data stays hidden (the "adaptive honesty" rule). No hardcoded project cards, no placeholder stats, no invented testimonials. A neighboring portfolio cannot truthfully copy the claim that everything shown is fetched live and self-updating.

## Operating Context

Single-page site deployed at kmelier.vercel.app, linked from the GitHub profile. Visitors arrive cold, scroll top to bottom: Hero → About → Skills → Timeline → Projects → Contact. Many will open it on mobile. The owner updates it by editing `src/config/*.ts` files; repo content itself is never hardcoded. Open decision: whether the config-file editing workflow stays as-is.

## Capabilities and Constraints

Confirmed functionality: ⌘K/Ctrl+K command palette (fuzzy-jump to sections, open projects, toggle theme, copy email); dynamic project cards from the GitHub REST API sorted featured → active → starred; project modal with shareable deep links (`/#/project/RepoName`) and lazy README preview; 12-week activity heatmap from the real events API; dark/light themes via token-swapped CSS variables, persisted, no first-paint flash; restrained Anime.js motion, fully disabled under `prefers-reduced-motion`; 10-minute localStorage cache with stale-while-revalidate; Konami/`kmelier` easter egg.

Technical constraints: React 19 + Vite + TypeScript + Tailwind CSS v4, Bun package manager, builds with `tsc --noEmit && vite build`, ships on Vercel. Self-hosted Inter + Geist Mono are the incumbent fonts but are not binding — the owner dislikes the entire current design.

Explicitly undecided: which interactive features survive the redesign (command palette, easter egg, theme toggle are candidates, not commitments); the visual world, palette, and typography are fully open for new-work.

## Brand Commitments

Name: Chris Kmelier, handle @Kmelier, contact POLIIQQW@proton.me. Existing tagline "I build things on the web and beyond." and bio "Tech enthusiast. I like contributing to random projects." are incumbent copy — editable, not sacred. No logo, no fixed colors, no binding visual references; the owner volunteered no binding visual constraint and explicitly rejects the whole current look.

## Evidence on Hand

Real content: public GitHub repos via `https://api.github.com/users/Kmelier/repos` (live, cached 10 min); timeline entries in `src/config/timeline.ts`; skill categories in `src/config/skills.ts`; manual achievement numbers in `src/config/achievements.ts` (0 = hidden). Absences future work must not fabricate: LinkedIn, Discord, location, focus, interests, and About-panel fields are empty in config — empty means hidden, never placeholder-filled. No testimonials, press, or case studies exist.

## Product Principles

1. Proof over claims — if it cannot be verified live, it does not ship on the page.
2. The work is the hero — chrome and decoration recede; projects and skills carry the visit.
3. Zero maintenance theater — content updates itself from GitHub; the owner never hand-edits project cards.
4. Respect the visitor's setup — theme, motion, and color-scheme preferences are honored, never overridden.
5. One obvious next step — every path through the page ends at contact without hunting.

## Accessibility & Inclusion

Known requirements: honor `prefers-reduced-motion` (disable non-essential animation), honor `prefers-color-scheme` on first visit, keep full keyboard operability (the command palette is a keyboard-first surface). No product-specific WCAG target has been set — open decision for later.
