# /tools/* reverse proxy

Makes these product subdomains also reachable under `boesger.com/tools/<slug>`,
without moving their hosting or touching their repos:

| Path | Proxies to |
|---|---|
| `boesger.com/tools/polarion-docker` | `polarion-docker.boesger.com` |
| `boesger.com/tools/polarion-mcp` | `polarion-mcp.boesger.com` |
| `boesger.com/tools/polarion-code-editor` | `polarion.code.editor.boesger.com` |

The subdomains keep working exactly as before — this is additive, not a
redirect. Add more entries to `PROXY_MAP` in `worker.js` to proxy more
subdomains later.

## Deploy (dashboard, no CLI needed)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Create Worker**.
2. Name it (e.g. `boesger-tools-proxy`), then **Deploy**.
3. Open the new Worker → **Edit code**, replace the contents with `worker.js` from this folder, **Deploy**.
4. Go to the `boesger.com` zone → **Workers Routes** → **Add route**:
   - Route: `boesger.com/tools/*`
   - Worker: the one you just created.

## Deploy (CLI, via wrangler)

```bash
cd cloudflare/tools-proxy
npx wrangler login       # once, opens a browser to authorize
npx wrangler deploy      # reads wrangler.toml, deploys the Worker and the route
```

## Known limitation

This proxies the raw HTTP response — it does **not** rewrite links inside
the proxied HTML. If a proxied site's own navigation uses absolute URLs
back to its subdomain (e.g. a link to `https://polarion-mcp.boesger.com/foo`
instead of a relative `/foo`), clicking it will take the visitor out of
`/tools/polarion-mcp` and onto the bare subdomain — the page will still
work, just at a different URL. This is cosmetic (nothing breaks), but if
it matters, the fix is to rewrite `href`/`src` attributes in the Worker
using Cloudflare's `HTMLRewriter` API — ask if you want that added.
