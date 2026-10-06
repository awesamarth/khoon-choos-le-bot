# Khoon choos le bot

The Cloudflare Worker posts the original fixed native X video link:
`https://x.com/khoon_choos_le/status/1840617572120625549/video/1`.

## Cloudflare deployment

`wrangler.jsonc` configures Mondays at 05:00 UTC / 10:30 Asia/Kolkata,
with a 10 ms CPU limit suitable for Workers Free. The Worker performs a single
X v2 posting attempt with the original `text` payload. It has a harmless GET
health route at `/` and preserves GET `/tweet?secret=...`, protected by the
`SECRET_KEY` binding. Missing or invalid secrets return 403; the posting gate
also applies to this route. Automatic cron retries are
disabled to avoid duplicate posting after an ambiguous API response.

Infrastructure is deployed, but `POSTING_ENABLED` is `false`: **posting is not
active**. The first gated deployment had no X secrets; the user is restoring
credentials separately. Deploy with `--keep-vars` to preserve dashboard-managed
variables; `keep_vars` is also enabled in the configuration. The previous Worker stored X
credentials as ordinary variables; deployment replaced those bindings and its
Tuesday schedule. Wrangler unexpectedly exposed their values in a deployment
preview. Do not reuse those values from logs. Credential rotation and secure
installation require user approval; never commit credentials.

With approved secure setup, configure these four Worker secrets through the
Cloudflare dashboard: `API_KEY`, `API_KEY_SECRET`, `ACCESS_TOKEN`,
`ACCESS_TOKEN_SECRET`; retain `SECRET_KEY` for the HTTP endpoint. Confirm the user token belongs to the intended bot account
and has write permission. Only then, after confirming zero-cost entitlement for
this operation, set `POSTING_ENABLED` to `true` and deploy. No immediate live test
post is required. Do not reactivate the stale Railway cron alongside this Worker.

Current X documentation lists generic pay-per-use pricing, including $0.20 per
URL post. That does not establish how X bills this native `/video/1` link or the
existing app's entitlement. The user reports previously free operation. Do not
purchase credits, attach billing, or enable posting under a zero-cost requirement
without confirming this exact operation is free for the existing app.

## Verification

Run `pnpm install --frozen-lockfile --ignore-scripts`, then `node --test`.
Tests mock X calls and credentials. Run Wrangler `deploy --dry-run` to validate
the Worker bundle. Do not print remote variable values during deployment;
redirect CLI output and inspect only sanitized deployment metadata.

The legacy `pnpm start` server and its `/tweet` endpoint remain in `bot.js` for
reference; Cloudflare does not execute them. The pnpm override patches qs to
6.16.0 in that legacy dependency tree. Non-qs advisories remain in Express's
transitive dependencies; the deployed Worker imports only twitter-api-v2.
