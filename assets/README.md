# Background video

The site plays **`assets/nattarklubbin-bg.mp4`** as the fullscreen background — a
~33 s looping montage cut from the venue's own Instagram (@nattarklubbin) event
photos (people dancing, costume nights, DJ moments, the rooftop view), with slow
Ken Burns motion, an oxblood colour grade, and crossfades. It's 720p / ~3.7 MB.

Fallbacks if the video is missing or still loading:
1. `assets/poster.jpg` (a frame from the montage), then
2. the animated CSS velvet gradient (`.bg::before` in `styles.css`).

## Regenerate / change the montage

The clip was built with ffmpeg from images downloaded via Instagram's public
profile API. To rebuild with different photos:

1. Collect the source images into a folder (1080px JPEGs are fine).
2. For each image, make a 3.6 s Ken Burns + graded clip:
   ```bash
   ffmpeg -loop 1 -i img.jpg -t 3.6 -r 30 -an \
     -vf "scale=2400:1350:force_original_aspect_ratio=increase,crop=2400:1350,\
zoompan=z='min(zoom+0.0011,1.14)':d=108:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,\
eq=saturation=0.72:contrast=1.05,colorbalance=rs=0.10:bs=-0.08,vignette=PI/5,gblur=sigma=1.4,format=yuv420p" \
     clip_00.mp4
   ```
3. Crossfade the clips together with the `xfade` filter (dissolve, 0.9 s), then
   `scale=1280:720` and encode `-c:v libx264 -crf 30 -movflags +faststart`.
4. Regenerate the poster: `ffmpeg -ss 2 -i nattarklubbin-bg.mp4 -frames:v 1 poster.jpg`

To use a totally different background (e.g. a single landscape clip), just drop
your file in `assets/` and update the `<source>` in `index.html`.

> Footage/photos are the venue's own (sourced from @nattarklubbin). Confirm you're
> happy to publish each shot before launch.
