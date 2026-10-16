# Retiring digital.boesger.com and colors.boesger.com

Both hostnames are already proxied by Cloudflare, so redirects are a single ruleset in the
`boesger.com` zone. No DNS or origin change is needed (GitHub Pages cannot redirect on its own).

## Apply

```sh
python3 apply.py                                   # dry run, prints the 10 rules
CF_API_TOKEN=... CF_ZONE_ID=... python3 apply.py --apply
```

Token: Cloudflare dashboard, My Profile, API Tokens, "Zone > Single Redirect > Edit" (or Rulesets > Edit),
limited to the `boesger.com` zone. The zone ID is on the zone's Overview page. Existing rules are kept; only rules
whose description starts with `retire:` are replaced.

## Rules (all 301)

| From | To |
|---|---|
| `digital.boesger.com/about`, `/cv`, `/skills` | `boesger.com/profile#about`, `#cv`, `#skills` (one rule) |
| `digital.boesger.com/services` | `boesger.com/profile#working-with-me` |
| `digital.boesger.com/ai-hub` | `boesger.com/work/ai-enablement-hub` |
| `digital.boesger.com/imprint` | `boesger.com/imprint` |
| `digital.boesger.com/*.pdf` | `boesger.com/assets/documents/CV_Polarion_Expert_EN.pdf` |
| `digital.boesger.com/*` (catch-all, last) | `boesger.com/` |
| `colors.boesger.com/*` | `boesger.com/colors` |
| `boesger.com/work/polarion-mcp*` | `polarion-mcp.boesger.com` |
| `boesger.com/work/polarion-docker*` | `polarion-docker.boesger.com` |
| `boesger.com/work/polarion-code-editor*` | `polarion.code.editor.boesger.com` |

The free Cloudflare plan allows 10 redirect rules per zone, which this ruleset uses up entirely: merge or drop a rule before adding another.

## Dashboard alternative

Rules, Redirect Rules, Create rule (custom filter expression), one per row above, in this order, status 301,
"preserve query string" off. The expressions are in `apply.py`.

## Afterwards

1. Redeploy `cloudflare/tools-proxy/worker.js` (the `colors` entry was removed; the redirect rule above covers `/tools/colors`).
2. Check each row with `curl -sI <old url>`.
3. After a few weeks of clean logs: archive `boesger-consulting` and `brand-colors`, and remove the `digital` and `colors`
   custom domains in their Pages settings.
4. Add `boesger.com` to Google Search Console if not done, and submit `sitemap.xml`.
