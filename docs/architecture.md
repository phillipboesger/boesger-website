# Site architecture and HTML patterns

Reference for contributors and agents. Hard rules live in `CLAUDE.md` and `.claude/rules/`.

## Architecture

A multi-page static site sharing one CSS file and two core JS files. There is no server-side routing or client-side SPA framework — every page is a real, independently-loadable `.html` file; navigation is plain `<a href>` between them.

**Pages** (root level unless noted):
- **`index.html`** — Home: sticky nav, hero, work/portfolio grid (teaser of `work.html`), blog band (teaser of `blog.html`), contact CTA band, footer. Per the design there is no Connect grid on Home — the link hub lives on `links.html`.
- **`profile.html`** — Overview / CV / Skills / Working-with-me / About, switched via the tab-bar pattern (see below). Includes the downloadable CV PDF and the skills-grid detail modal.
- **`work.html`** — Full projects/portfolio grid (same card pattern as Home's, but standalone with intro copy).
- **`work/ai-enablement-hub.html`, `work/daily-board.html`** (the MCP, Docker and Code Editor product pages live in their own repos' `docs/index.html` on `polarion-mcp.boesger.com`, `polarion-docker.boesger.com` and `polarion.code.editor.boesger.com`; `boesger.com/work/polarion-*` 301-redirects there via Cloudflare, so never recreate those pages here) — Per-project detail pages: hero, stat tiles, feature grid, "see it in action" media carousel (where applicable), setup steps, compatibility table, install-command tabs, CTA band. Relative asset paths from this folder go up one level (`../assets/...`).
- **`blog.html`** — Blog topic cards + newsletter CTA (teases the live blog at polarion.boesger.com; posts are not authored here).
- **`colors.html`** — The complete brand identity reference, canonical source (colors.boesger.com redirects here): logo/icon variant tiles (downloadable `assets/images/brand-*` files), Backgrounds / Accent / Typography swatch groups (name, purpose, hex, rgb; click-to-copy via `site.js`'s `[data-copy]` handler), brand background image, usage examples, and the CSS token block with a copy button (`[data-copy-target]`).
- **`links.html`** — Compact, single-column link-in-bio page (all Connect links in one lightweight list — this is the URL to use as an Instagram/social bio link). It is intentionally a standalone URL, matching the design: it is not linked from the nav or Home.
- **`contact.html`** — LinkedIn / Email / Book-a-call cards plus the direct contact form. The form posts to the dedicated n8n webhook `boesger-contact-v1`; it validates input, limits abuse and delivers to digital@boesger.com via the existing Gmail credential. Its workflow and deployment reference are documented in `docs/privacy-operations.md`.
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

The footer has a brand column and a public “Elsewhere” column. Its bottom bar (`.site-footer-internal` / `.site-footer-internal-inner`) holds the copyright line and legal links.

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
