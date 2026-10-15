# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A fully static personal hub site for Phillip Bösger (Bösger Digital) — hero, full profile (CV/skills/about/services), work/portfolio with per-project detail pages, blog teaser, colors & automation showcases, a compact links page, and contact. There is no build system, no package manager, and no Node.js — no React/JSX, everything is hand-authored HTML/CSS/vanilla JS. To preview locally, open any `.html` file directly in a browser (or serve the folder statically). Deployment to GitHub Pages happens automatically on every push to `main` via `.github/workflows/updateWebsite.yml`.

This repo is the canonical `boesger.com` root. As of the July 2026 redesign it is the **full personal hub**, including the profile/CV/skills/services content that a previous iteration of this repo deliberately kept off boesger.com in favor of `digital.boesger.com`. That "thin hub, single source of truth on digital.boesger.com" policy has been superseded — `profile.html` here is now the canonical, self-hosted profile. `digital.boesger.com` (the former Hugo site, repo `boesger-consulting`) and `colors.boesger.com` (repo `brand-colors`) are retired: everything they offered lives here (`profile.html`, `work/ai-enablement-hub.html`, `colors.html`) and both hostnames 301-redirect to this site via Cloudflare (`cloudflare/redirects/`). Other Bösger properties (`polarion.boesger.com`, `photography.boesger.com`, product subdomains like `polarion-mcp.boesger.com`) are separate deployments/repos and are **not** managed here. `colors.html` is now the **canonical** brand reference (all color groups, logo variants, tokens, plus machine-readable JSON-LD / JSON / hidden text summary for AI agents). `automation.html` remains a lightweight in-site teaser for the n8n/Proxmox homelab.

`cloudflare/tools-proxy/` is a separate, optionally-deployed Cloudflare Worker that reverse-proxies select product subdomains under `boesger.com/tools/<slug>` (see its README) — it is not part of the static site build/deploy and requires a manual `wrangler deploy` or dashboard setup.

## Architecture

A multi-page static site sharing one CSS file and two core JS files. There is no server-side routing or client-side SPA framework — every page is a real, independently-loadable `.html` file; navigation is plain `<a href>` between them.

**Pages** (root level unless noted):
- **`index.html`** — Home: sticky nav, hero, work/portfolio grid (teaser of `work.html`), blog band (teaser of `blog.html`), contact CTA band, footer. Per the design there is no Connect grid on Home — the link hub lives on `links.html`.
- **`profile.html`** — Overview / CV / Skills / Working-with-me / About, switched via the tab-bar pattern (see below). Includes the downloadable CV PDF and the skills-grid detail modal.
- **`work.html`** — Full projects/portfolio grid (same card pattern as Home's, but standalone with intro copy).
- **`work/polarion-mcp.html`, `work/polarion-docker.html`, `work/polarion-code-editor.html`, `work/ai-enablement-hub.html`** — Per-project detail pages: hero, stat tiles, feature grid, "see it in action" media carousel (where applicable), setup steps, compatibility table, install-command tabs, CTA band. Relative asset paths from this folder go up one level (`../assets/...`).
- **`blog.html`** — Blog topic cards + newsletter CTA (teases the live blog at polarion.boesger.com; posts are not authored here).
- **`colors.html`** — The complete brand identity reference, canonical source (colors.boesger.com redirects here): logo/icon variant tiles (downloadable `assets/images/brand-*` files), Backgrounds / Accent / Typography swatch groups (name, purpose, hex, rgb; click-to-copy via `site.js`'s `[data-copy]` handler), brand background image, usage examples, and the CSS token block with a copy button (`[data-copy-target]`).
- **`automation.html`** — n8n / Proxmox homelab showcase cards (external links to the actual tools).
- **`links.html`** — Compact, single-column link-in-bio page (all Connect links in one lightweight list — this is the URL to use as an Instagram/social bio link). Like `automation.html`, it is intentionally a standalone URL, matching the design: it is not linked from the nav or Home.
- **`contact.html`** — LinkedIn / Email / Book-a-call contact cards.
- **`imprint.html`** — Imprint / legal disclosure (`noindex`), linked from every footer's bottom bar. Content ported from the retired digital.boesger.com site.

**Shared assets:**
- **`assets/css/style.css`** — All styling for every page. Design tokens (colors, spacing, radii, shadows, motion, typography) are CSS custom properties in `:root`, ported from the Bösger Digital design system (canonical source: `colors.html`). Responsive breakpoints: `900px` (nav collapses to a mobile menu, hero/blog grids stack), `640px`/`560px` (spacing and CTA adjustments).
- **`assets/js/network.js`** — An IIFE that draws an animated particle-network on `<canvas id="network-canvas">`, rendered behind all content at `z-index: 0`. Loaded on every page.
- **`assets/js/site.js`** — An IIFE handling sticky-header background on scroll, the mobile menu toggle, reveal-on-scroll (`[data-reveal]` + `IntersectionObserver`, respects `prefers-reduced-motion`), the generic tab-bar component (`[data-tabs]`, used by Profile's tabs and the product pages' install-command tabs), the skill-detail modal (Profile → Skills), and the product media carousel (`[data-carousel]`). Loaded on every page. Nav "active page" state is set statically per page (`.nav-pill.is-active` in the HTML) — there is no cross-page scroll-spy.
- **`assets/js/snowfall.js`** — An alternative snowfall animation (currently **not loaded**). It targets `#bg-canvas` (which does not exist in the current HTML) and bundles a minified copy of Underscore.js. It can be enabled by swapping the canvas ID and script tag.

## CSS Custom Properties

All theme values are in `:root` in `style.css`. Key tokens:

| Variable | Purpose |
|---|---|
| `--bg-deep` / `--bg-surface` | Page background / raised panels |
| `--accent` / `--accent-glow` / `--accent-blue` | Primary electric-cyan accent family |
| `--border-subtle` / `--border-default` / `--border-strong` | Hairline border states |
| `--text-primary` / `--text-body` / `--text-muted` | Heading / body / caption text |
| `--surface-glass` | Glassmorphism card fill (used with `backdrop-filter: blur(...)`) |
| `--radius-sm` … `--radius-xl` / `--radius-pill` | Corner radii scale |
| `--shadow-sm` … `--shadow-xl` / `--glow-accent` | Elevation + cyan glow shadows |
| `--space-2` … `--space-8` | 4px-base spacing scale |
| `--container` | Max content width (`1120px`, per the design system) |
| `--font-mono` | Monospace stack (Fira Code / SF Mono) for code blocks and product-name display type |
| `--text-link` / `--text-link-hover` | Default link color states |
| `--warning` | Amber status text (e.g. install notes) |

Legacy aliases (`--bg`, `--cyan`, `--blue`, `--border`, `--text`, `--radius`, …) are kept mapped to the new tokens for backward compatibility — prefer the new names above in new code.

## HTML Conventions

**Link card pattern** (`links.html` — copy-paste to add a link):
```html
<a href="https://example.com" target="_blank" rel="noopener" class="link-card">
  <img src="assets/images/icon.png" alt="" />
  <span>Label</span>
  <svg class="arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
</a>
```

For links to private/internal services, use `rel="nofollow noopener"` and place them in the footer's "Internal" column (`.footer-pill-link`, alongside the public "Elsewhere" column) instead of the public Connect grid — see the n8n/Proxmox entries. The bottom bar below both columns (`.site-footer-internal` / `.site-footer-internal-inner`) holds only the copyright line and the Imprint link (internal, to `imprint.html`).

**Work/portfolio card pattern** (`.glass-card.work-card`): an `<a>` wrapping a `.work-card-media` (icon + status `.badge`) and `.work-card-body` (`h3`, tagline, description, `.tag` chips, "Learn more →" link). Only add cards for things that are actually live/real — this section has previously contained AI-fabricated placeholder products; verify against the real product site or GitHub repo before adding one. Cards for projects with a detail page (see `work/*.html` above) link internally instead of to the external product site.

**Section pattern**: `<section class="section" id="...">` (add `.section-tinted` for the alternating background band), with a `.section-head` (`.kicker` + `h2` + intro `p`) at the top.

**Tab bar pattern** (Profile tabs, product install-command tabs — driven by `site.js`, no per-page JS needed):
```html
<div class="tabbar" data-tabs="profile">
  <button type="button" class="tab-pill is-active" data-tab-target="overview">Overview</button>
  <button type="button" class="tab-pill" data-tab-target="cv">CV</button>
</div>
<div class="tab-panel is-active" data-tab-panel="overview" data-tabs-group="profile">...</div>
<div class="tab-panel" data-tab-panel="cv" data-tabs-group="profile">...</div>
```
If a panel's id should be deep-linkable, add `data-tab-hash="cv"` to its trigger button — `site.js` reads `location.hash` on load and syncs it on click.

**Skill modal pattern** (Profile → Skills grid): each skill card is `<button class="skill-card" data-skill-modal>` wrapping a hidden `.skill-detail` block (icon markup, name, short desc, long detail paragraph) that `site.js` clones into the shared `#skill-modal` on click — content lives once, in HTML, not duplicated into JS.

**Media carousel pattern** (product "see it in action" section): a wrapper with `data-carousel`, one `.carousel-slide` per screenshot/GIF (`.is-active` on the first), and `.carousel-dot` / `.carousel-prev` / `.carousel-next` controls — `site.js` handles the rest.

**Ask-AI block** ("Ask AI about me", on every page, in one of two shapes): four plain `.ai-pill` links that open ChatGPT / Claude / Perplexity / Gemini with a prefilled prompt via `?q=` URL parameters (URL-encoded, baked into the static `href`s — if the prompt text ever changes, regenerate the encoded URLs on **all** pages together). The Gemini pill points at Google's Gemini-powered AI Mode (`google.com/search?udm=50&q=…`) because gemini.google.com itself has no prefill parameter (a clipboard-copy workaround was tried and reverted — async clipboard writes die when the new tab steals focus). Pages whose last section is a CTA band (Home, Blog, the four product pages) embed the pills *inside* that band as an `.ask-ai-inline` footer row (hairline + `.ask-ai-inline-label`); all other pages use the standalone `.ask-ai-band` section. No JS involved.

## Data correctness

Marketing/bio copy on this site (years of experience, CV dates, stats, product statuses) must be traceable to a real source (this repo's git history, `github.com/phillipboesger`, LinkedIn, or the linked product repos) — do not invent numbers, testimonials, blog post titles, or CV entries, including when porting content from a Claude Design mockup. If a fact can't be verified, ask before publishing it.

## Images

All icons/photos live in `assets/images/` (flat, no subfolders). Recommended formats: PNG or WEBP with transparent background for icons, JPEG for photos. Keep images under ~300 KB. Link card icons are displayed at `34×34 px`; work-card media icons are shown at up to `60px` tall. Non-image documents (e.g. the downloadable CV) live in `assets/documents/`.

Skill-grid icons on `profile.html` reference small third-party icon CDNs (simpleicons.org, DuckDuckGo/Google favicon services, iconify.design) instead of local files, matching the design handoff — these are utility favicons, not brand photography, so hot-linking them is an acceptable exception to "images live locally." Prefer a local asset in `assets/images/` when one already exists for that brand (GitHub, n8n, Docker, etc.).

## Cache-busting

`boesger.com` is proxied through Cloudflare, which caches `assets/css/style.css` and the `assets/js/*.js` files for **4 hours** (`Cache-Control: max-age=14400`) — and browsers cache them too. The filenames never change, so a plain deploy can leave visitors with stale CSS/JS paired against fresh HTML (new markup styled by old rules — this has happened, e.g. new-but-unstyled elements). Every HTML page references these files with the same `?v=YYYYMMDDx` query string; **bump that version string on every commit that changes `style.css`, `site.js`, or `network.js`, across every `.html` page, not just `index.html`** so the new URL bypasses both caches immediately everywhere. Grep for `?v=` across the repo (`grep -rn '?v=' --include='*.html'`) to find and update every reference together.

## Data correctness — redesign-specific note

The July 2026 redesign (Profile/CV/Skills/product-detail content) was ported from a Claude Design mockup the site owner authored describing their own career/products. It was implemented largely verbatim on the owner's authority, but per the rule above it has **not** been independently fact-checked against LinkedIn/GitHub/etc. — specific dates, GPA figures, certifications, and product stats (e.g. "271 REST operations", pricing) should be spot-checked against source before treating them as permanently correct if they're ever queried or challenged.

## SEO and machine-readable files

- Every page carries `<link rel="canonical">` (extension-less URL, e.g. `https://boesger.com/profile`), Open Graph / Twitter tags (shared card `assets/images/og-card.png`, 1200x630) and JSON-LD (`WebSite` / `Organization` / `Person` on Home, `ProfilePage` on Profile, `WebPage` + `BreadcrumbList` elsewhere). `imprint.html` and `privacy.html` stay `noindex` and are not in the sitemap.
- Root files `sitemap.xml`, `robots.txt` and `llms.txt` are hand-maintained: add new pages to all three plus the page's own head block. Cloudflare prepends its managed content-signals block to `robots.txt`.
- CV PDFs in `assets/documents/` are build output of the `cv` repo (`dist/`); copy `CV_Polarion_Expert_EN.pdf` over when the CV changes.

## Design system and home page (Oct 2026 redesign)

- Palette is "Sky Blue + Amber" (tokens in `assets/css/style.css` `:root`, documented on `colors.html`): sky-blue grounds, ice-cyan accent, one amber counterpoint (`--warm`). Button labels use `--text-on-accent`. Do not reintroduce navy `rgba(...)` literals; use the tokens.
- Fonts are self-hosted in `assets/fonts/` (Geist, Geist Mono, variable woff2, latin subset). No Google Fonts requests.
- `index.html` follows the "split stage" grammar (scroll-craft): hero split 50/50 (by hand / with my tools), a pinned comparison stage (`#stage`, `assets/js/home.js`, `assets/css/home.css`), then calm flow sections. The divider knob is a real `role="slider"` that scrubs the stage. No JS or reduced motion renders a static, fully visible stage (`.is-static`).
- The five stage rows pair a manual chore with the tool that replaces it. Only claims already published on the site are used; do not add timings or numbers without a documented source.
- Keep copy free of em dashes (humanizer rule). Date ranges keep an en dash.
