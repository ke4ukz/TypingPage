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
- `reload` — how (and whether) an unattended display refreshes itself to pick
  up published changes. Inert on `file://`. See "Keeping a sign up to date".
- `scene.background` — anything behind the page; any CSS `background`.
- `page` — `aspect`, `maxHeight`, `maxWidth`, `padding`, `background`,
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

Anything omitted from `config.js` falls back to `TypingPage.DEFAULTS` in
`typing-page.js`.

## Units, and why the layout survives any screen

A plain number in the config is a **proportion**, not pixels:

| Where | Means |
| --- | --- |
| `page.maxHeight`, `page.maxWidth` | percent of the viewport |
| every other number | percent of the **page's own height** |

The page is drawn as the largest box of `page.aspect` that fits inside *both*
`maxHeight` and `maxWidth`. That is what stops it being cut off — in landscape,
in portrait, or on a phone.

The second row is the part that matters. Because type size, padding and
paragraph spacing are fractions of the page rather than of the screen, a page
rendered small is a faithful scale model of the same page rendered large. The
line breaks fall in the same places and the copy fills the page the same way at
every size, so text tuned once is tuned everywhere:

```
                       page size    type     layout
16:9  1920x1080        768 x 994    18.4px   57 col x 26 row
9:16  1080x1920       1015 x 1314   24.3px   57 col x 26 row
4:3   1024x768         546 x 707    13.1px   57 col x 26 row
phone  390x844         367 x 474     8.8px   57 col x 26 row
```

Strings are passed through untouched, so `"2px"`, `"3ch"` and `"1.15em"` still
work where they read better. Any CSS — including `page.frame.css` — can use
`calc()` against `var(--tp-u)`, which is 1% of the page's height.

## Orientation

A portrait sign needs no configuration: US Letter is a portrait shape, so it
gets *bigger* on a 9:16 display than on a 16:9 one, as the table above shows.

For a look that should change shape with the display — a "screen" that wants to
fill a portrait sign rather than letterbox into it — `page.aspect` also accepts
a pair, applied by media query with no JavaScript, so a display rotated after
boot re-lays out on its own:

```js
aspect: { landscape: 16 / 9, portrait: 9 / 16 }
```

On a phone the whole page is shown at once, so the type is genuinely small —
it is a scale model of a full sheet, the same way a document page fits-to-width
in any reader. The CRT and editor presets read more comfortably there than the
paper one, because their type is proportionally larger to begin with.

`demo.html` additionally reflows its own toolbar: it wraps to multiple rows,
drops its label and separators under 760px, turns the config panel into a
bottom sheet under 460px, enlarges hit targets on touch, and waits 5s rather
than 2.6s before auto-hiding when there is no pointer to move.

## Deployment (GitHub Pages)

Live at **https://typingpage.ke4ukz.com** — `index.html` at the root, so the
sign points straight at the bare domain. The demo lives at
`https://typingpage.ke4ukz.com/demo.html`.

Already in the repo:

- `CNAME` — `typingpage.ke4ukz.com`. Pages reads this on every deploy; without
  it the custom domain gets dropped whenever the site rebuilds.
- `.nojekyll` — skips Jekyll processing. Nothing here needs it.
- `favicon.svg` — referenced by both pages, so no 404 in the access logs.

Every path in the HTML is relative and nothing loads from a CDN, so the site
works unchanged at the custom domain root, at
`ke4ukz.github.io/TypingPage/` before DNS resolves, and from `file://`.

### One-time setup

1. Push `main`.
2. **Settings → Pages → Build and deployment**: Source `Deploy from a branch`,
   branch `main`, folder `/ (root)`. There is no build step, so a GitHub
   Actions workflow would only add moving parts.
3. Same page, **Custom domain**: enter `typingpage.ke4ukz.com` and save. It
   will already match the `CNAME` file. Wait for the DNS check to pass, then
   tick **Enforce HTTPS** once the certificate is issued (usually minutes, up
   to an hour).

Your DNS `CNAME` for `typingpage` → `ke4ukz.github.io` is the correct record
for a subdomain; nothing else is needed.

### Updating content

Edit `config.js`, commit, push. Pages redeploys in under a minute, and assets
are served with a ten-minute cache, so any reload fetches the new build.

## Keeping a sign up to date

A display left running for weeks never reloads, so it keeps showing the copy it
started with. The `reload` block handles that. It is off by default
(`afterHours: 0`); `config.js` ships with it set to 12 hours.

### Served from local storage

If the page lives on an SD card, a USB stick or the player's own disk, **ignore
this section**. The mechanism disables itself on `file://`: there is nothing to
re-fetch, `fetch()` is blocked there anyway, and changing the card means
restarting the player. Setting `afterHours: 0` makes that explicit if you'd
rather not rely on the detection.

### Served from a host

Two things to be clear about before trusting it:

**`afterHours` is uptime, not a schedule.** The timer starts when that browser
session loaded and restarts on every reload, so a change lands *within* that
many hours, not at a predictable time of day.

**A reload is a one-way door.** If it lands on a dead network, a captive portal
or a half-finished deploy, the browser discards a working display for its own
error page and the sign stays wrong until somebody attends to it. So the reload
only happens at a document boundary, and only after a preflight that must pass:

| Probe result | What happens |
| --- | --- |
| 200, and the version changed | Reload |
| 200, byte-identical (`onlyIfChanged`) | Nothing — wait out another interval |
| Any non-2xx, e.g. a deploy mid-flight | Keep typing, retry in `retryMinutes` |
| Offline, DNS failure, no answer in `timeoutMs` | Keep typing, retry in `retryMinutes` |
| 200 but `expectText` is missing | Keep typing, retry in `retryMinutes` |

`onlyIfChanged` compares the `ETag` (or `Last-Modified`) of the probe against
the one this page loaded with. Because an unchanged site costs nothing, you can
set `afterHours` low — 1, or 0.5 — for prompt updates without a display that
reloads all day for no reason.

### Hosts that behave differently

The defaults assume a plain static host that sends validators and sane cache
headers. Every other assumption is a knob, because they are all assumptions
about someone else's web server:

| Symptom | Cause | Fix |
| --- | --- | --- |
| Never reloads; probe always fails | Server answers `HEAD` with 405 | `method: "GET"` |
| Reloads on schedule but shows the old page | HTML served with a long `max-age`, so the reload is answered from cache | `cacheBust: true` |
| Reloads every interval even when nothing changed | Host sends no `ETag`/`Last-Modified`, or regenerates one per request | Harmless — that is the pre-`onlyIfChanged` behaviour. Raise `afterHours` |
| Sign shows a WiFi login or SSO page | Captive portal answering 200 for everything | `expectText: "<title>Typing Page"` |
| Probe passes but the app is broken | Health of `/` isn't what you care about | Point `url` at something more meaningful |
| Slow link, probes time out | 8s is too tight | Raise `timeoutMs` |

Set `probe: false` for the old unconditional behaviour, and `afterHours: 0` to
turn the whole thing off — worth doing if your signage player has its own
scheduled refresh, which is the better place for it when you have one.
