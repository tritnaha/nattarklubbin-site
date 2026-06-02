# Náttarklubbin

Website for **Náttarklubbin** — a Friday-night club for music lovers, inside the
historic rooftop venue **Havnar Klubbi**, in the heart of Tórshavn, Faroe Islands.

A single-page, dependency-free site: dark "oxblood suede" theme, a fullscreen
looping background montage cut from club nights, an 18+ entry gate, and an
auto-sorting list of upcoming and past DJ nights.

## Run

No build step. Serve the folder and open it:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

(Serve over http rather than opening the file directly so the background video loads.)

## Structure

| File | Purpose |
|------|---------|
| `index.html` | Markup: background video, age gate, hero, event lists, footer |
| `styles.css` | Oxblood-suede theme — velvet gradients, Fraunces + Space Mono |
| `main.js` | Event data + auto-sort (upcoming vs archive), age gate, sound toggle |
| `assets/nattarklubbin-bg.mp4` | Looping background montage |
| `assets/poster.jpg` | Video poster / fallback |
| `assets/README.md` | How the background video was made and how to swap it |

## Editing events

Edit the `EVENTS` array in `main.js`. Each entry has a `date` (`YYYY-MM-DD`),
`artist`, `support`, `tags`, and `status` (`tickets` / `soldout` / `past`).
Events automatically sort into **Now & Next** vs **Archive** based on the date.

## Notes

- All nights are 18+.
- Background photos/footage are the venue's own.

🗿 MoAI
