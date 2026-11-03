---
paths:
  - "*.html"
  - "**/*.html"
---
# HTML page rules

Patterns (link card, section, tabs, skill modal, carousel) and page inventory: `docs/architecture.md`.

- **Work/portfolio cards**: only add cards for things that are actually live/real. This section has previously contained AI-fabricated placeholder products; verify against the real product site or GitHub repo first. Cards for projects with a detail page (`work/*.html`) link internally instead of to the external product site.
- **Ask-AI block** ("Ask AI about me", on every page, two shapes): four plain `.ai-pill` links that open ChatGPT / Claude / Perplexity / Gemini with a prefilled prompt via `?q=` URL parameters (URL-encoded, baked into the static `href`s; if the prompt text ever changes, regenerate the encoded URLs on **all** pages together). The Gemini pill points at Google's Gemini-powered AI Mode (`google.com/search?udm=50&q=…`) because gemini.google.com has no prefill parameter (a clipboard-copy workaround was tried and reverted: async clipboard writes die when the new tab steals focus). Pages whose last section is a CTA band (Home, Blog, the four product pages) embed the pills *inside* that band as an `.ask-ai-inline` footer row (hairline + `.ask-ai-inline-label`); all other pages use the standalone `.ask-ai-band` section. No JS.
- **Footer**: brand column plus public "Elsewhere" column; bottom bar (`.site-footer-internal` / `.site-footer-internal-inner`) holds copyright and legal links.
- **Every page** carries `<link rel="canonical">` (extension-less URL, e.g. `https://boesger.com/profile`), Open Graph / Twitter tags (shared card `assets/images/og-card.png`, 1200x630) and JSON-LD (`WebSite` / `Organization` / `Person` on Home, `ProfilePage` on Profile, `WebPage` + `BreadcrumbList` elsewhere). `imprint.html` and `privacy.html` stay `noindex` and are not in the sitemap.
- **`links.html`** is intentionally a standalone URL (Instagram/social bio link), not linked from nav or Home.
- **`contact.html`**: form posts to the n8n webhook `boesger-contact-v1`; workflow and deployment reference in `docs/privacy-operations.md`.
- **`index.html`** is one hero screen told in order (CSS-only, one pass, `assets/css/home.css`): the manual steps (Copy. Paste. Check out. Repeat.) are struck out, the motto "More AI, less manual work." fades in, then intro, CTAs, stats and photos pop in. Reduced motion renders the end state. Below the hero everything is visible at once (no pinning, no scroll-jacking): "What I change" bento with proof links, client-work timeline, products grid, contact close with a pointer light. `assets/js/home.js` only does hero parallax and the card glow. Content must come from the project pages (`work/*.html`, `work.html`); the page was previously cut for being all effect and little information. Keep sections content-first and re-check with a visitor read-through after changes.
- **`second-brain.html`** is both the public homepage of the Google OAuth app (keep the "Details for Google users" block: purpose, scopes, Limited Use, privacy link, contact) and a shape-only visualization (`assets/js/second-brain.js`, `assets/css/second-brain.css`). Never add real contents, counts or infrastructure names to the visualization.
