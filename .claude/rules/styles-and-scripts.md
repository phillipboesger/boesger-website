---
paths:
  - "assets/**"
---
# Styles, scripts, images

- Bump the `?v=YYYYMMDDx` cache-busting string on every `.html` page when `style.css`, `site.js` or `network.js` change (see CLAUDE.md).
- Palette is "Ocean Bright" (tokens in `assets/css/style.css` `:root`, documented on `colors.html`): sky-blue grounds, ice-cyan accent, one amber counterpoint (`--warm`). Button labels use `--text-on-accent`. Do not reintroduce navy `rgba(...)` literals; use the tokens. Token table and legacy aliases: `docs/architecture.md`.
- Fonts are self-hosted in `assets/fonts/` (Geist, Geist Mono, variable woff2, latin subset). No Google Fonts requests.
- Images live flat in `assets/images/` (no subfolders). PNG or WEBP with transparent background for icons, JPEG for photos, under ~300 KB. Link card icons display at `34×34 px`; work-card media icons up to `60px` tall. Non-image documents (e.g. the CV) live in `assets/documents/`. Skill-grid icons on `profile.html` are self-hosted as `assets/images/skill-*`.
- Keep fonts, icons and scripts local; do not reintroduce automatic third-party requests.
