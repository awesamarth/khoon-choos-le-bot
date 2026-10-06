# Khoon choos le bot

The Cloudflare Worker posts the original fixed native X video link:
`https://x.com/khoon_choos_le/status/1840617572120625549/video/1`.

## Cloudflare deployment

`wrangler.jsonc` configures Mondays at 05:00 UTC / 10:30 Asia/Kolkata,
with a 10 ms CPU limit suitable for Workers Free. The Worker performs a single
X v2 posting attempt with the original `text` payload. It has a harmless GET
health route at `/`; no HTTP posting route exists. Automatic cron retries are
disabled to avoid duplicate posting after an ambiguous API response.

Infrastructure is deployed with `POSTING_ENABLED=true`, as explicitly approved
by the user. It will attempt the original video post on Monday; it needs valid
OAuth 1.0 credentials with write permission for the intended bot account.
The user's existing account entitlement and exact native-video billing remain
unverified; activation was approved despite that uncertainty. No immediate
extra live tweet is sent during deployment or verification.

Deploy with `--keep-vars` to preserve dashboard-managed variables; `keep_vars`
is also enabled in the configuration. Credentials must never be committed.
The user can install the four OAuth 1.0 secrets locally with hidden prompts:

```sh
python3 scripts/setup-x-secrets.py
```

Run this yourself in an interactive Terminal. It prompts for `API_KEY`,
`API_KEY_SECRET`, `ACCESS_TOKEN`, and `ACCESS_TOKEN_SECRET`, passing each directly
through stdin to Wrangler. It never prints credential values or saves them in
project files. Do not paste credentials into chat or command arguments.
No `SECRET_KEY` is needed: the public HTTP handler cannot trigger posting.
Do not reactivate the stale Railway cron alongside this native scheduler.

## Verification

Run `pnpm install --frozen-lockfile --ignore-scripts`, then `node --test`.
Tests mock X calls and credentials. Run Wrangler `deploy --dry-run` to validate
the Worker bundle. Do not print remote variable values during deployment;
redirect CLI output and inspect only sanitized deployment metadata.

The legacy `pnpm start` server and its `/tweet` endpoint remain in `bot.js` for
reference; Cloudflare does not execute them. The pnpm override patches qs to
6.16.0 in that legacy dependency tree. The compatible Express update and proxy-addr override resolve the remaining
reported advisories; the deployed Worker imports only twitter-api-v2.
