# Náttarklubbin

Website for **Náttarklubbin** — a Friday-night club for music lovers, inside the
historic rooftop venue **Havnar Klubbi**, in the heart of Tórshavn, Faroe Islands.

A single-page site built with **plain HTML, CSS and JavaScript** — no build step,
no framework, no dependencies. Dark "oxblood suede" theme, a fullscreen looping
background montage cut from club nights, an 18+ entry gate, and an auto-sorting
list of upcoming and past DJ nights.

## Serve it

It's a static site, so **any web server works** — nginx, Caddy, Apache, a CDN, or
a static host (Netlify / Vercel / GitHub Pages / Cloudflare Pages). Point the web
root at this folder.

### nginx via Docker (recommended)

```bash
docker compose up -d --build      # → http://localhost:8080
```

Builds `nginx:alpine` (see `Dockerfile`) with a tuned `nginx.conf` (gzip for text,
byte-range for the video, sensible caching).

### Plain nginx (no Docker)

Copy the static files into your web root and drop `nginx.conf` into the server
block (`/etc/nginx/conf.d/default.conf`), then `nginx -s reload`.

### Quick throwaway preview

```bash
python3 -m http.server 8000       # or:  npx serve .
```

Serve over http (not `file://`) so the background video loads.

## Events

The event list lives in **`assets/events.json`** and is rendered client-side by
`main.js` (which falls back to an embedded copy if the JSON can't be fetched).
Each entry: `date` (`YYYY-MM-DD`), `artist`, `support`, `tags`, `status`
(`tickets` / `soldout` / `past`). The site auto-sorts entries into **Now & Next**
vs **Archive** by date — you never set "past" by hand.

### Auto-updating from Instagram

`scripts/update-events.mjs` fetches @nattarklubbin posts, parses `{date, artist,
status}` from the captions, and **merges anything new** into `events.json`
(union by post id — "if unseen, add it"). The GitHub Action
`.github/workflows/update-events.yml` runs it **daily** (and on manual dispatch),
committing only when something changed.

Run it locally anytime:

```bash
node scripts/update-events.mjs
```

**Important caveats:**

- **Best-effort parsing.** Captions are free text, so dates/DJ names are extracted
  heuristically and will occasionally be wrong. `events.json` is plain JSON — fix
  any entry by hand and it sticks (manual entries aren't overwritten).
- **Fetch reliability.** The script uses Instagram's public web endpoints, which
  rate-limit / block datacenter IPs (GitHub runners included → frequent HTTP 429).
  The script **fails soft**: on any error it makes no change and the last good
  `events.json` stays live. For reliable automation, switch the fetcher to the
  official **Instagram API with Instagram Login** (requires a Professional account
  + a token stored as a repo secret), or run the script from a non-datacenter IP.
- **Deploy step.** A commit to `events.json` only reaches visitors after a redeploy.
  On GitHub Pages / Netlify / Cloudflare Pages that's automatic; with the Docker
  image, rebuild it (`docker compose up -d --build`).

## Structure

| Path | Purpose |
|------|---------|
| `index.html` | Markup: background video, age gate, hero, event lists, footer |
| `styles.css` | Oxblood-suede theme — velvet gradients, Fraunces + Space Mono |
| `main.js` | Loads `events.json`, renders + auto-sorts, age gate, sound toggle |
| `assets/events.json` | The event list (auto-updated; hand-editable) |
| `assets/nattarklubbin-bg.mp4` / `poster.jpg` | Looping background + fallback |
| `scripts/update-events.mjs` | Instagram fetch + caption parser |
| `.github/workflows/update-events.yml` | Daily auto-update job |
| `Dockerfile` / `nginx.conf` / `docker-compose.yml` | nginx serving setup |

## Notes

- All nights are 18+.
- Background photos/footage are the venue's own.

🗿 MoAI
