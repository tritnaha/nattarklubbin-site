# Náttarklubbin

Website for **Náttarklubbin** — a Friday-night club for music lovers, inside the
historic rooftop venue **Havnar Klubbi**, in the heart of Tórshavn, Faroe Islands.

A single-page site built with **plain HTML, CSS and JavaScript** — no build step,
no framework, no dependencies. Dark "oxblood suede" theme, a fullscreen looping
background montage cut from club nights, an 18+ entry gate, and an auto-sorting
list of upcoming and past DJ nights.

## Serve it

It's a static site, so **any web server works** — nginx, Caddy, Apache, a CDN, or
a static host (Netlify / Vercel / GitHub Pages / Cloudflare Pages). Just point the
server's web root at this folder.

### nginx via Docker (recommended)

```bash
docker compose up -d --build
# → http://localhost:8080
```

This builds an `nginx:alpine` image (see `Dockerfile`) using the tuned
`nginx.conf` (gzip for text, byte-range for the video, sensible caching) and
serves the site on port 8080.

To run the image without compose:

```bash
docker build -t nattarklubbin-site .
docker run -d -p 8080:80 --name nattarklubbin-site nattarklubbin-site
```

### Plain nginx (no Docker)

Copy the static files into your web root and drop `nginx.conf` into the server
block (e.g. `/etc/nginx/conf.d/default.conf`), then `nginx -s reload`.

### Quick throwaway preview

Any one-liner static server is fine for a glance (not for production):

```bash
python3 -m http.server 8000     # or:  npx serve .
```

Serve over http (not `file://`) so the background video loads.

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Markup: background video, age gate, hero, event lists, footer |
| `styles.css` | Oxblood-suede theme — velvet gradients, Fraunces + Space Mono |
| `main.js` | Event data + auto-sort (upcoming vs archive), age gate, sound toggle |
| `assets/nattarklubbin-bg.mp4` | Looping background montage |
| `assets/poster.jpg` | Video poster / fallback |
| `assets/README.md` | How the background video was made and how to swap it |
| `Dockerfile`, `nginx.conf`, `docker-compose.yml` | nginx serving setup |

## Editing events

Edit the `EVENTS` array in `main.js`. Each entry has a `date` (`YYYY-MM-DD`),
`artist`, `support`, `tags`, and `status` (`tickets` / `soldout` / `past`).
Events automatically sort into **Now & Next** vs **Archive** based on the date.

## Notes

- All nights are 18+.
- Background photos/footage are the venue's own.

🗿 MoAI
