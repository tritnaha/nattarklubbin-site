# Náttarklubbin

Website for **Náttarklubbin** — a Friday-night club for music lovers, inside the
historic rooftop venue **Havnar Klubbi**, in the heart of Tórshavn, Faroe Islands.

A single-page site built with **plain HTML, CSS and JavaScript** — no build step,
no framework, no dependencies. Dark "oxblood suede" theme, a fullscreen looping
background montage cut from club nights, an 18+ entry gate, and an auto-sorting
list of upcoming and past DJ nights.

## Run locally (dev / test)

It's just static files, so any static server works. The simplest:

```bash
python3 -m http.server 8000
# → http://localhost:8000
```

(Serve over http, not `file://`, so the background video and `events.json` load.)

## Deploy

Still just static files — upload the folder to any web server or static host
(nginx/Apache, Netlify, Vercel, GitHub Pages, Cloudflare Pages, an S3 bucket, …).
There is no server-side runtime to deploy.

## Events

The event list lives in **`assets/events.json`** and is rendered client-side by
`main.js` (which falls back to an embedded copy if the JSON can't be fetched).
Each entry: `date` (`YYYY-MM-DD`), `artist`, `support`, `tags`, `status`
(`tickets` / `soldout` / `past`), and `url` (the Instagram post). The site
auto-sorts entries into **Now & Next** vs **Archive** by date — you never set
"past" by hand. Upcoming nights show an **Info ↗** link to their Instagram post
(entry is cash/card at the door — there is no online ticketing).

### Keeping events up to date automatically

`scripts/update-events.mjs` (Node 18+) fetches @nattarklubbin posts, parses
`{date, artist, status, url}` from the captions, and **merges anything new** into
`assets/events.json` (union by post id — "if unseen, add it"). Run it by hand:

```bash
node scripts/update-events.mjs
```

To keep it current automatically, schedule it on whatever host serves the site —
a plain **cron** entry is enough (no Docker needed). For example, every 3 days:

```cron
# crontab -e   (run from the site directory; adjust the path)
17 5 */3 * * cd /srv/nattarklubbin-site && /usr/bin/node scripts/update-events.mjs >> /var/log/nk-events.log 2>&1
```

It writes `events.json` in place, so the live site picks up changes on the next
page load — nothing to rebuild or redeploy.

**Caveats:**

- **Best-effort parsing.** Captions are free text, so dates/DJ names are extracted
  heuristically and will occasionally be wrong. `events.json` is plain JSON — fix
  any entry by hand and it sticks (manual entries aren't overwritten).
- **Fetch reliability.** The script uses Instagram's public web endpoints, which
  rate-limit / block some IPs (HTTP 429). It **retries with backoff** and **fails
  soft** — on persistent failure it makes no change and the last good `events.json`
  stays live. For rock-solid automation, switch the fetcher to the official
  **Instagram API with Instagram Login** (Professional account + token); only
  `fetchPosts()` needs changing.

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | Markup: background video, age gate, hero, event lists, footer |
| `styles.css` | Oxblood-suede theme — velvet gradients, Fraunces + Space Mono |
| `main.js` | Loads `events.json`, renders + auto-sorts, age gate, sound toggle |
| `assets/events.json` | The event list (auto-updated; hand-editable) |
| `assets/nattarklubbin-bg.mp4` / `poster.jpg` | Looping background + fallback |
| `scripts/update-events.mjs` | Instagram fetch + caption parser |

## Notes

- All nights are 18+. Entry is cash/card at the door — no online tickets.
- Background photos/footage are the venue's own.

🗿 MoAI
