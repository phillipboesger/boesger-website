---
paths:
  - "sitemap.xml"
  - "robots.txt"
  - "llms.txt"
  - "assets/documents/**"
---
# SEO and machine-readable files

- `sitemap.xml`, `robots.txt` and `llms.txt` are hand-maintained: add new pages to all three plus the page's own head block (canonical, OG/Twitter, JSON-LD). Cloudflare prepends its managed content-signals block to `robots.txt`.
- CV PDFs in `assets/documents/` are build output of the `business` repo (`cv/dist/`, formerly the `cv` repo); copy `CV_Polarion_Expert_EN.pdf` over when the CV changes.
