# Ambient music

The landing page will play a looping audio file from this folder if one exists:

```
public/audio/ambient.mp3
```

Nothing is committed here by default, and nothing needs to be. When the file
is absent — or fails to load for any reason — the page plays **"Grove Nights"**
instead: an original C-pop-flavoured score generated in Web Audio by
`src/landing/score.ts`. The visitor never sees an error and the sound toggle
always works, so adding a file is entirely optional.

Because "Grove Nights" is generated rather than recorded, it has no licence
attached and nothing to clear. Adding a file here only makes sense if you
specifically want a recorded track instead.

## Adding a track

1. Drop the file in as `ambient.mp3`.
2. That's it. No code change, no rebuild step beyond the usual one.

To use a different filename or format, change `TRACK_SRC` at the top of
`src/landing/useAmbient.ts`. Broad browser support means MP3; add an `.ogg` or
`.m4a` alongside it only if you need to target something unusual.

### Practical notes

- **Loop cleanly.** The file is played with `loop = true`, so trim it to a
  seamless bar boundary or the restart will be audible every pass.
- **Keep it small.** This is in the initial page experience; a few hundred KB
  is reasonable, several MB is not. Mono at 96–128 kbps is plenty for a bed.
- **Mix it low.** Playback volume is capped at `TRACK_VOLUME` (0.34), but a
  loud master will still fight the interface. Master it quiet.
- **Never autoplays.** Browsers block it and so do we — playback only ever
  starts from the visitor clicking the sound button.

## Licensing

Whatever you put here gets served to every visitor, which is distribution. Use
only audio you have the right to distribute on the web:

- Music you created, or had made for you with the rights assigned.
- Creative Commons tracks whose licence permits web use — check whether it
  requires attribution (BY) and whether it forbids commercial use (NC).
- A royalty-free library licence that explicitly covers web/app background use.

A personal streaming subscription does **not** grant this right, and neither
does buying a copy of a song. If you want a specific commercial track, that
needs a sync/mechanical licence from the rights holder.

If the track's licence requires attribution, credit it in the landing page
footer (`src/landing/Landing.tsx`) and add the terms to this file.
