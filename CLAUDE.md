# boesger.com

Fully static personal hub site for Phillip Bösger (Bösger Digital): home, profile/CV, work pages, blog teaser, colors (canonical brand reference), links, contact. Hand-authored HTML/CSS/vanilla JS; no build system, no package manager, no Node.

## Commands

- Preview: open any `.html` directly or serve the folder statically (`python3 -m http.server`).
- Deploy: GitHub Pages on every push to `main` via `.github/workflows/updateWebsite.yml`. No tests or lint.
- `cloudflare/tools-proxy/` is a separate Worker (reverse-proxies product subdomains under `boesger.com/tools/<slug>`), not part of the site deploy; manual `wrangler deploy`, see its README.

## Scope

- This repo is the canonical `boesger.com` root, including profile/CV/skills/services. `digital.boesger.com` and `colors.boesger.com` are retired and 301-redirect here via Cloudflare (`cloudflare/redirects/`).
- `polarion.boesger.com`, `photography.boesger.com` and product subdomains (`polarion-mcp`, `polarion-docker`, `polarion.code.editor`) are separate repos, not managed here. Never recreate `work/polarion-*` pages here (301 to the product repos' `docs/index.html`).

## Hard constraints

- Data correctness: bio/marketing copy (years, CV dates, stats, product statuses) must be traceable to a real source (git history, github.com/phillipboesger, LinkedIn, product repos). Never invent numbers, testimonials, post titles or CV entries, also when porting from a design mockup. Unverifiable: ask before publishing. The July 2026 redesign content (dates, GPA, certifications, product stats such as "284 REST operations", pricing) came verbatim from the owner's mockup and is not fact-checked: spot-check it against the source before relying on it or when it is challenged.
- Cache-busting: Cloudflare and browsers cache `assets/css/style.css` and `assets/js/*.js` for 4 h under unchanging names. Every `.html` page references them with the same `?v=YYYYMMDDx`; bump it on every commit that changes `style.css`, `site.js` or `network.js`, across all pages (`grep -rn '?v=' --include='*.html'`).
- No third-party requests: fonts, icons, scripts stay local; every page has a CSP that blocks optional network connections and analytics. The contact form (n8n webhook `boesger-contact-v1`, see `docs/privacy-operations.md`) is the only external form action.
- Use design tokens from `assets/css/style.css` `:root`; no literal color values.
- No em dashes in copy; date ranges keep an en dash.

## Docs and rules

- Architecture, page inventory, CSS tokens, copy-paste HTML patterns: `docs/architecture.md`.
- Path-scoped rules in `.claude/rules/`: `html-pages.md` (all `.html`), `styles-and-scripts.md` (`assets/**`), `seo-files.md` (sitemap, robots, llms, CV PDFs).
