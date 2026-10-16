#!/usr/bin/env python3
"""Create the redirects that retire digital.boesger.com and colors.boesger.com, and send the old
boesger.com/work/polarion-* product pages to the project sites that replaced them.

Cloudflare already proxies both hostnames, so a Single Redirect ruleset in the
boesger.com zone is enough: no origin changes, no DNS changes.

Usage:
  python3 apply.py              # dry run: prints the ruleset that would be applied
  CF_API_TOKEN=... CF_ZONE_ID=... python3 apply.py --apply

The token needs "Zone > Single Redirect > Edit" (or "Zone > Rulesets > Edit") on the
boesger.com zone. Existing rules in the zone are kept; only rules whose description
starts with "retire:" are replaced, so re-running is safe.
"""
import json
import os
import sys
import urllib.request

PREFIX = "retire:"
SITE = "https://boesger.com"


def rule(desc, expr, target, dynamic=False):
    return {
        "description": f"{PREFIX} {desc}",
        "expression": expr,
        "action": "redirect",
        "action_parameters": {
            "from_value": {
                "status_code": 301,
                "target_url": {"expression": target} if dynamic else {"value": target},
                "preserve_query_string": False,
            }
        },
    }


def digital(paths, desc, target):
    quoted = " ".join(f'"{p}"' for p in paths)
    return rule(desc, f'(http.host eq "digital.boesger.com" and http.request.uri.path in {{{quoted}}})', target)


RULES = [
    rule("digital /about,/cv,/skills -> profile tab",
         '(http.host eq "digital.boesger.com" and http.request.uri.path in {"/about" "/cv" "/skills"})',
         'concat("https://boesger.com/profile#", substring(http.request.uri.path, 1))', dynamic=True),
    digital(["/services", "/services/"], "digital /services", f"{SITE}/profile#working-with-me"),
    digital(["/ai-hub", "/ai-hub/"], "digital /ai-hub", f"{SITE}/work/ai-enablement-hub"),
    digital(["/imprint", "/imprint/"], "digital /imprint", f"{SITE}/imprint"),
    rule("digital CV PDFs",
         '(http.host eq "digital.boesger.com" and ends_with(http.request.uri.path, ".pdf"))',
         f"{SITE}/assets/documents/CV_Polarion_Expert_EN.pdf"),
    rule("colors.boesger.com -> /colors", '(http.host eq "colors.boesger.com")', f"{SITE}/colors"),
    rule("product page polarion-mcp -> project site",
         '(http.host eq "boesger.com" and starts_with(http.request.uri.path, "/work/polarion-mcp"))', "https://polarion-mcp.boesger.com/"),
    rule("product page polarion-docker -> project site",
         '(http.host eq "boesger.com" and starts_with(http.request.uri.path, "/work/polarion-docker"))', "https://polarion-docker.boesger.com/"),
    rule("product page polarion-code-editor -> project site",
         '(http.host eq "boesger.com" and starts_with(http.request.uri.path, "/work/polarion-code-editor"))', "https://polarion.code.editor.boesger.com/"),
    rule("digital catch-all -> home", '(http.host eq "digital.boesger.com")', f"{SITE}/"),
]


def api(method, path, token, body=None):
    req = urllib.request.Request(
        f"https://api.cloudflare.com/client/v4{path}",
        data=json.dumps(body).encode() if body is not None else None,
        method=method,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(req) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return {"result": {"rules": []}}
        raise SystemExit(f"{method} {path}: HTTP {e.code} {e.read().decode()[:400]}")


def main():
    if "--apply" not in sys.argv:
        print(json.dumps(RULES, indent=2, ensure_ascii=False))
        print(f"\n{len(RULES)} rules (dry run). Re-run with --apply and CF_API_TOKEN / CF_ZONE_ID.")
        return
    token, zone = os.environ["CF_API_TOKEN"], os.environ["CF_ZONE_ID"]
    path = f"/zones/{zone}/rulesets/phases/http_request_dynamic_redirect/entrypoint"
    existing = api("GET", path, token)["result"].get("rules", [])
    keep = [r for r in existing if not r.get("description", "").startswith(PREFIX)]
    out = api("PUT", path, token, {"rules": keep + RULES})
    print("success:", out.get("success"), "| rules now:", len(out["result"]["rules"]))


if __name__ == "__main__":
    main()
