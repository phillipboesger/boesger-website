# Website privacy operations

## Static sites

The website CSP blocks optional analytics, fetch connections, frames and remote assets. Keep fonts, images and scripts local. Do not add tracking or remote widgets without reviewing the consent design and privacy notice. Legal pages are visible without JavaScript. Product documentation sites link to the shared notices, whose scope explicitly includes them.

## Contact form

The form posts to `https://n8n.boesger.com/webhook/boesger-contact-v1`. Dedicated workflow: `Website: boesger.com contact form`, ID `agMQgGhqZuOY6SbI`. It only accepts the boesger.com and polarion.boesger.com Origins, validates lengths and email/header characters, rejects a honeypot, limits requests per Cloudflare client IP and sends to digital@boesger.com with the existing Gmail OAuth credential. It never uses visitor input as a recipient. Successful and failed execution contents are not retained. Anti-abuse data expires through a 15-minute housekeeping trigger, so an entry can remain for up to 30 minutes.

Operational requirement: monitor incoming contact mail and answer promptly. A form alone cannot establish the actual response time required for an effective direct contact channel.

## Operator and provider information

The owner confirmed the published postal address and supplied VAT ID DE457610442 on 25 October 2026. Confirm any additional economic identification or register information if applicable. Do not publish an ordinary tax number. Confirm provider agreements, international-transfer safeguards and actual provider retention periods separately; these cannot be established from a browser scan.
