/**
 * Bösger Digital — /tools/* reverse proxy
 *
 * Makes product subdomains reachable under boesger.com/tools/<slug>/...
 * without moving their hosting. Bind this Worker to the route
 * "boesger.com/tools/*" in the Cloudflare dashboard (or via wrangler.toml
 * in this folder) — see README.md for deploy steps.
 *
 * Each product keeps deploying to its own subdomain exactly as before;
 * this Worker only proxies the HTTP response through boesger.com/tools/<slug>.
 */

const PROXY_MAP = {
  "polarion-docker": "polarion-docker.boesger.com",
  "polarion-mcp": "polarion-mcp.boesger.com",
  "polarion-code-editor": "polarion.code.editor.boesger.com",
};

const PREFIX = "/tools/";

export default {
  async fetch(request) {
    const url = new URL(request.url);

    if (!url.pathname.startsWith(PREFIX)) {
      // Not a /tools/* request — shouldn't happen if the Worker route is
      // scoped to boesger.com/tools/*, but fail safe by passing it through.
      return fetch(request);
    }

    const rest = url.pathname.slice(PREFIX.length); // "<slug>/optional/path"
    const slashIndex = rest.indexOf("/");
    const slug = slashIndex === -1 ? rest : rest.slice(0, slashIndex);
    const targetHost = PROXY_MAP[slug];

    if (!targetHost) {
      return new Response(
        `Not found: /tools/${slug} is not a known tool.\n\nAvailable: ${Object.keys(PROXY_MAP).join(", ")}`,
        { status: 404, headers: { "content-type": "text/plain; charset=utf-8" } }
      );
    }

    const targetPath = slashIndex === -1 ? "/" : rest.slice(slashIndex) || "/";
    const targetUrl = `https://${targetHost}${targetPath}${url.search}`;

    const originRequest = new Request(targetUrl, request);
    originRequest.headers.set("Host", targetHost);

    const originResponse = await fetch(originRequest, { redirect: "manual" });

    const responseHeaders = new Headers(originResponse.headers);

    // If the origin issues a redirect to itself, rewrite it back to the
    // boesger.com/tools/<slug> path so the browser doesn't jump to the
    // bare subdomain.
    const location = responseHeaders.get("location");
    if (location) {
      try {
        const locUrl = new URL(location, targetUrl);
        if (locUrl.hostname === targetHost) {
          responseHeaders.set(
            "location",
            `https://${url.hostname}${PREFIX}${slug}${locUrl.pathname}${locUrl.search}`
          );
        }
      } catch {
        // ignore malformed Location headers, pass through as-is
      }
    }

    return new Response(originResponse.body, {
      status: originResponse.status,
      statusText: originResponse.statusText,
      headers: responseHeaders,
    });
  },
};
