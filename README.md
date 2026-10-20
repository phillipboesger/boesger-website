<div align="center">
  <img src="assets/images/boesger-digital-wordmark.png" alt="Bösger Digital" width="240" />

  <h1>boesger.com</h1>
  <p><strong>More AI, less manual work.</strong></p>
  <p>Personal site and brand hub for Phillip Bösger — profile, work &amp; portfolio, blog, brand reference, and contact.</p>

  [![Deploy to GitHub Pages](https://github.com/phillipboesger/boesger-website/actions/workflows/updateWebsite.yml/badge.svg)](https://github.com/phillipboesger/boesger-website/actions/workflows/updateWebsite.yml)
  [![Website](https://img.shields.io/website?url=https%3A%2F%2Fboesger.com&up_message=online&down_message=offline&label=boesger.com)](https://boesger.com)
  [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

  **[Visit boesger.com →](https://boesger.com)**

  <br />

  <img src="assets/images/readme-preview.jpg" alt="boesger.com homepage preview" width="800" />
</div>

## Overview

This repository is the canonical source for `boesger.com`: a fully static, multi-page site with no build system, no package manager, and no JavaScript framework. Every page is hand-authored HTML, styled by a single shared CSS file, and enhanced by a small amount of vanilla JS (navigation, reveal-on-scroll, tabs, modals, carousel). There is nothing to install and nothing to compile — clone it, open a page in a browser, and it renders exactly as it will in production.

`digital.boesger.com` and `colors.boesger.com` have been retired and redirect here (see `cloudflare/redirects/`). Other Bösger properties (`polarion.boesger.com`, `photography.boesger.com`, product subdomains such as `polarion-mcp.boesger.com`) are separate deployments and are not managed from this repository; they are linked from here as external references.

## Tech Stack

- **HTML5 / CSS3** — hand-authored, no templating engine.
- **Vanilla JavaScript** — no framework, no bundler, no transpilation step.
- **GitHub Pages** — static hosting, deployed automatically on every push to `main`.
- **Cloudflare** — DNS and CDN in front of the custom domain, including a small edge Worker (see `cloudflare/tools-proxy/`) that reverse-proxies select product subdomains under `boesger.com/tools/<slug>`.

## Project Structure

```
index.html                    Home — hero, work/portfolio teaser, blog teaser, contact CTA
profile.html                  Profile — overview, CV, skills, working-with-me, about (tabbed)
work.html                     Full work & portfolio grid
work/
  ai-enablement-hub.html      Project detail page
blog.html                     Blog topic teaser + newsletter CTA
colors.html                   Complete brand/identity reference (logos, palette, tokens)
links.html                    Compact link-in-bio page (social bio link target)
contact.html                  LinkedIn / email / book-a-call contact cards
imprint.html                  Imprint / legal disclosure
privacy.html                  Privacy policy

assets/
  css/style.css               All styling; design tokens as CSS custom properties in :root
  js/network.js               Animated particle-network canvas background (every page)
  js/site.js                  Nav, mobile menu, reveal-on-scroll, tabs, modal, carousel
  js/home.js                  Home only: hero depth planes and the pinned split stage
  css/home.css                Home only: split hero, stage, ledger, close
  fonts/                      Self-hosted Geist and Geist Mono (variable woff2)
  js/snowfall.js              Alternative background animation (currently unused)
  images/                     Photos, logos, product icons
  documents/                  Downloadable CV PDF
  gif-readme/                 Legacy demo asset from the original template (unused)

cloudflare/tools-proxy/       Optional Cloudflare Worker; see its own README for setup
cloudflare/redirects/         Redirect rules retiring digital.boesger.com and colors.boesger.com
sitemap.xml, robots.txt, llms.txt   Search and AI-agent discovery files
CLAUDE.md                     Detailed architecture and conventions reference for this repo
```

## Local Development

No build step is required.

- Open any `.html` file directly in a browser, or
- Serve the folder with any static file server, e.g. `python3 -m http.server`.

## Deployment

Pushing to `main` triggers `.github/workflows/updateWebsite.yml`, which publishes the repository contents to GitHub Pages. The custom domain (`boesger.com`) and DNS/CDN are configured through Cloudflare and the repository's Pages settings.

`style.css`, `site.js`, and `network.js` are cached for 4 hours at the edge (and by browsers). Each HTML page references them with a shared `?v=YYYYMMDDx` cache-busting query string — bump that string across every page when any of those three files change, so visitors don't get new markup paired with stale styles or scripts.

## Customization

For the full architecture reference, design-token table, and copy-paste patterns for links, work cards, section headings, tabs, and the media carousel, see [`CLAUDE.md`](./CLAUDE.md).

## License

Released under the MIT License. See [`LICENSE`](./LICENSE) for details.
