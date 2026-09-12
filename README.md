# Typing Page

A looping typewriter/terminal animation for digital signage. Text appears one
character at a time at a human-feeling pace, then the page is transported out
and the next one begins.

## Two entry points

| File | Purpose | Loads |
| --- | --- | --- |
| `index.html` | **What ships to the sign.** No UI, no controls, no presets. | `typing-page.css`, `typing-page.js`, `config.js` |
| `demo.html` | Exploration: preset picker, speed toggle, live config viewer. | the above, plus `presets.js` and its own inline chrome |

Both drive the same engine, so what you see in the demo is exactly what the
sign plays.

### Workflow

1. Open `demo.html`, pick a look, tune the pacing.
2. Press **Config** → **Copy**.
3. Paste over the contents of `config.js`.
4. Point the sign at `index.html`.

Everything is plain CSS and JavaScript with no build step, no modules and no
network requests, so `file://` works and a kiosk browser needs nothing special.

## Demo controls

The toolbar fades out after ~2.6s of no input and returns on any mouse move.

- `1`–`5` — presets
- `S` — demo speed vs. real speed
- `R` — restart the current page
- `C` — show/hide the config panel (`Esc` closes)

## How the typing works

The whole document is built up front: one `<span>` per character, all
`visibility: hidden`. Typing only adds a class to reveal each one. Because
`visibility` preserves layout, line breaks and glyph positions are computed once
for the complete text — nothing already typed ever shifts to make room, the way
a real typewriter behaves.

Per-keystroke delay is `typing.baseDelay` ± `jitter`, modified by random fast
bursts, occasional small hesitations, and extra pauses after punctuation and at
paragraph ends.

`speedCurve` maps progress through a page (0 → 1) onto a multiplier over all of
that, smoothstep-interpolated. The shipped profile types the opening lines at
normal speed, accelerates hard through the middle of the page, and eases back
to normal for the last lines — about 20s per page instead of 68s. Set
`speedCurve.enabled: false` for uniform, lifelike pacing.

## Parameters

`config.js` is commented in full and is the reference. In brief:

- `transition` — `"eject"` (page rolls up and out, a fresh one feeds in from
  below) or `"clear"` (text disappears in place).
- `scene.background` — anything behind the page; any CSS `background`.
- `page` — `height`, `aspect` (width/height), `padding`, `background`,
  `radius`, `shadow`, and an optional `frame`.
- `page.frame` — `{ html, css }` injected behind the text, for window chrome,
  status lines, letterheads or CRT vignettes. CSS may target `.tp-sheet`,
  `.tp-doc` and `.tp-frame`. See the Windows 3.1 and DOS presets.
- `text` — colour, font, size, line height, paragraph spacing/indent, plus
  `inkJitter` for per-glyph typewriter strike imperfection.
- `effects` — scanlines and their opacity/pitch.
- `cursor` — `show`, `style` (`block` / `bar` / `underline`), colour, size,
  blink period, and how long a pause must be before it starts blinking.
- `typing`, `speedCurve`, `timing` — pacing and transport, described above.
- `documents` — an array of documents typed in sequence and looped; each is an
  array of paragraph strings, or one string with blank lines between paragraphs.

Sizes are given in `vh` so a layout holds at any display resolution. Anything
omitted from `config.js` falls back to `TypingPage.DEFAULTS` in
`typing-page.js`.
