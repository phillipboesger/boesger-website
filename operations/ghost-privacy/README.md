# Deployed Ghost privacy overlay

The blog runs the custom `boesger-casper` theme, based on Casper 5.11.1 from Ghost 6.42.0. These files preserve the changed templates and consent controller. `default.hbs` uses a CSP nonce for theme-owned scripts; scripts emitted automatically by Ghost remain blocked. The controller restores self-hosted search/card code and, after the visitor opts in, membership/payment or survey services. Never add a nonce to Ghost-generated analytics, attribution or arbitrary post scripts.

Vendor assets on the server: jQuery 3.5.1, ghost/sodo-search ~1.8 (JS and main.css), with their licenses. The original Casper assets and other templates remain in the custom theme. Keep the nonce in the CSP and the theme script tags identical. Clear legal/consent state tests after any Ghost/theme upgrade; a raw Casper upgrade would remove this overlay.

## Deployment and rollback

Server: Proxmox CT101, `/var/www/ghost/content/themes/boesger-casper`. The original `casper` theme remains installed. Selected theme setting: `active_theme=boesger-casper`. Restart only `ghost_polarion-boesger-com` after validated template changes. Use Ghost Admin for subsequent content/settings edits when an owner session is available.

Disabled settings: `members_track_sources`, `email_track_opens`, `email_track_clicks`. `portal_plans=["free"]`; the paid Hub tier was already hidden (`visibility=none`) and remains available for individually arranged access. Restricted posts link to the contact form. Existing subscription administration remains with Ghost/Stripe.

Backups from this change are retained locally at `/home/claude-agent/workspace/website-compliance-2026-10-25/ghost/`: original Casper archive, original legal pages, non-secret settings, deployed-page references, and the packaged custom theme. For rollback, select the original `casper` theme and restore only the settings being rolled back from that backup. Do not replace Ghost's database or roll back member/payment data.

## Verification

GScan for Ghost 6 reports no fatal errors and score 100. Browser checks cover default deny, rejecting all, membership-only consent, withdrawal (including removing reachable Stripe cookies), mobile controls, and Tally gating using the exact deployed controller in a local fixture. Real Tally posts require Hub access. No forms, survey answers or actual purchases were submitted during these consent checks.

Owner-confirmed VAT ID and postal address are included in the blog imprint. Individually arranged paid Hub engagements still need appropriate contract/consumer information where applicable; no generic terms were invented.
