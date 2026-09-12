/* =============================================================================
   config.js — the configuration the signage page (index.html) runs.

   This is the ONLY file you need to edit to change what plays. Any key you
   leave out falls back to TypingPage.DEFAULTS in typing-page.js.

   To change the look: open demo.html, pick a preset, press "Config", and paste
   the result over everything below.
   ============================================================================= */

const CONFIG = {

  /* --------------------------------------------------------------------------
     TRANSITION between finished documents
       "eject" — the page rolls up and out of frame, a fresh one feeds in below
       "clear" — the text simply disappears in place (screens, editors)
  -------------------------------------------------------------------------- */
  transition: "eject",

  /* --------------------------------------------------------------------------
     SELF-RELOAD (signage)

     A display left running for weeks never reloads, so it keeps showing the
     copy it started with no matter what you publish. This reloads it — but
     only at a document boundary, so the reload is invisible, and only once it
     is satisfied the reload will land somewhere real.

     SERVED FROM A LOCAL FILE (SD card, USB stick, player's own storage):
     leave this alone. The mechanism disables itself on file:// — there is
     nothing to re-fetch, and changing the card means restarting the player
     anyway. You can also just set afterHours: 0 and forget it exists.

     SERVED FROM A HOST: the defaults below suit a plain static host that sends
     ETag or Last-Modified. If yours behaves differently, see the table in the
     README under "Hosts that behave differently" — the short version is that
     every assumption this makes about your web server is a knob here.
  -------------------------------------------------------------------------- */
  reload: {
    afterHours: 12,        // 0 disables. Uptime since load, NOT a clock time:
                           // the timer restarts on every reload, so a change
                           // lands somewhere within this many hours, not at a
                           // predictable moment of the day.

    onlyIfChanged: true,   // Compare ETag/Last-Modified against what this page
                           // loaded with, and skip the reload if the site has
                           // not actually changed. Lets you set afterHours low
                           // for prompt updates without reloading all day.

    probe: true,           // Check the origin answers before navigating away.
                           // With this off, an outage at the wrong moment
                           // replaces the sign with a browser error page.

    url: null,             // What to probe. Default: this page's own URL.
    method: "HEAD",        // "GET" if your server answers HEAD with 405.
    expectText: null,      // Text that must appear in the response, e.g.
                           // "<title>Typing Page" — defeats captive portals
                           // and SSO pages that cheerfully return 200.
                           // Forces a GET, since HEAD has no body to search.

    timeoutMs: 8000,       // Give up on a hung connection.
    retryMinutes: 5,       // Back-off after an unreachable probe.
    cacheBust: false       // true if your host serves the HTML itself with a
                           // long max-age, where a plain reload would be
                           // answered from cache with the same page.
  },

  /* --------------------------------------------------------------------------
     SCENE — whatever sits behind the page.
     Any CSS `background` shorthand: colour, gradient, url(...) texture.
  -------------------------------------------------------------------------- */
  scene: {
    background:
      "radial-gradient(ellipse at 50% 0%, #4a3f35 0%, #2b2420 55%, #191512 100%)"
  },

  /* --------------------------------------------------------------------------
     UNITS — read this once and the rest of the file explains itself.

     A plain number is a PROPORTION, not pixels:
       page.maxHeight / page.maxWidth   percent of the viewport
       every other number               percent of the PAGE's own height

     The page is drawn as the largest box of `aspect` that fits inside both
     maxHeight and maxWidth, so it is never cut off — 16:9, 9:16 or a phone.
     And because type and spacing are fractions of the page rather than of the
     screen, a small page is a faithful scale model of a large one: text that
     fills the page on a 16:9 sign fills it identically in portrait.

     A string is passed straight through, so "2px", "3ch", "1.15em" still work.
     Any CSS here may use calc() against var(--tp-u) — 1% of the page height.
  -------------------------------------------------------------------------- */

  /* --------------------------------------------------------------------------
     PAGE — the sheet of paper / the screen.
  -------------------------------------------------------------------------- */
  page: {
    aspect: 8.5 / 11,        // width / height (US Letter). May also be
                             // { landscape: n, portrait: n } to change shape
                             // with the orientation of the display.
    maxHeight: 92,           // at most 92% of the viewport's height
    maxWidth: 94,            // ...and at most 94% of its width
    padding: [7.6, 6.5],     // margins of the printed area
    background:
      "linear-gradient(178deg, #fbf7ec 0%, #f6f0e1 60%, #efe7d5 100%)",
    radius: 0.2,
    shadow: "0 calc(2.4 * var(--tp-u)) calc(4.9 * var(--tp-u)) rgba(0,0,0,.55)," +
            " 0 0 0 1px rgba(0,0,0,.08)",

    // Optional chrome drawn behind the text — title bars, status lines,
    // vignettes, letterheads. CSS may target .tp-sheet / .tp-doc / .tp-frame.
    // See presets.js for worked examples.
    frame: null              // { html: "...", css: "..." }
  },

  /* --------------------------------------------------------------------------
     TEXT
  -------------------------------------------------------------------------- */
  text: {
    color: "#2e2a24",
    fontFamily: '"Courier New", Courier, monospace',
    fontSize: 1.85,
    fontWeight: "600",
    lineHeight: 1.75,
    letterSpacing: "0.02em",
    paragraphSpacing: 2.05,
    paragraphIndent: "3ch",
    textShadow: "none",

    // Typewriter strike imperfection: every struck glyph is nudged a fraction
    // of a pixel and inked slightly unevenly. Uses relative offsets, so text
    // that has already been typed never moves.
    inkJitter: { enabled: true, offset: 0.6, minOpacity: 0.82 }
  },

  /* --------------------------------------------------------------------------
     EFFECTS
  -------------------------------------------------------------------------- */
  effects: {
    scanlines: false,
    scanlineOpacity: 0.16,
    scanlineSize: 0.36
  },

  /* --------------------------------------------------------------------------
     CURSOR
     Solid while characters are flowing; starts blinking after blinkAfterIdle,
     so it blinks naturally during hesitations, paragraph breaks and the hold
     at the end of a page.
  -------------------------------------------------------------------------- */
  cursor: {
    show: false,
    style: "block",           // "block" | "bar" | "underline"
    color: "currentColor",
    barWidth: "0.12em",       // used by "bar"
    height: "1.15em",         // used by "block" and "bar"
    underlineHeight: "0.14em",
    opacity: 0.85,
    blinkPeriod: 1000,        // ms, full on/off cycle
    blinkAfterIdle: 380       // ms of no keystroke before it starts blinking
  },

  /* --------------------------------------------------------------------------
     TYPING FEEL — per-character delays, in milliseconds.
  -------------------------------------------------------------------------- */
  typing: {
    baseDelay: 58,            // average keystroke interval
    jitter: 0.45,             // +/-45% random wobble on every keystroke

    burstChance: 0.16,        // odds of dropping into a fast run
    burstLength: [4, 14],     // characters per burst
    burstSpeed: 0.45,         // delay multiplier during a burst

    hesitateChance: 0.045,    // odds of a small stumble
    hesitateRange: [1.7, 2.8],// delay multiplier when it happens

    spaceFactor: 0.85,        // spaces come a touch quicker
    commaPause: 90,           // extra ms after , ; :
    sentencePause: 260,       // extra ms after . ! ?
    paragraphPause: 620       // extra ms at the end of each paragraph
  },

  /* --------------------------------------------------------------------------
     SPEED CURVE — dynamic pacing across a page, for demos.
     Maps progress through the document (0 = first character, 1 = last) to a
     multiplier on every delay above. Below 1 is faster. Stops are interpolated
     with a smoothstep, so the speed ramps rather than snaps.

     Default profile: normal cadence for the opening lines, a hard acceleration
     through the body of the page, easing back to normal for the closing lines.
     ~20s per page instead of ~68s.

     FOR SIGNAGE: set enabled to false for uniform, lifelike typing.
  -------------------------------------------------------------------------- */
  speedCurve: {
    enabled: true,
    stops: [
      [0.00, 1.00],   // open at normal speed
      [0.08, 1.00],   // ...hold it for the first couple of lines
      [0.17, 0.05],   // ramp up hard
      [0.83, 0.05],   // blast through the middle of the page
      [0.92, 1.00],   // ease back down
      [1.00, 1.00]    // finish at normal speed
    ],
    // Also shrink the punctuation/paragraph pauses during the fast section,
    // so it doesn't stall on every period. false keeps them at full length.
    scalePunctuation: true
  },

  /* --------------------------------------------------------------------------
     PAGE TIMING & TRANSPORT
  -------------------------------------------------------------------------- */
  timing: {
    startDelay: 500,          // before the very first page appears
    holdAfterComplete: 2200,  // admire the finished page
    ejectDuration: 1150,      // "eject": page rolls up and out
    ejectEasing: "cubic-bezier(.45,.02,.62,.25)",
    gapAfterEject: 180,       // empty platen between pages
    feedDuration: 950,        // "eject": fresh page rolls in from below
    feedEasing: "cubic-bezier(.18,.75,.30,1)",
    clearPause: 700           // "clear": blank interval before the next block
  },

  /* --------------------------------------------------------------------------
     DOCUMENTS
     Typed in sequence, then looped. Each document is an array of paragraph
     strings, or a single string with blank lines between paragraphs.
  -------------------------------------------------------------------------- */
  documents: [
    [
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
      "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
      "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt, neque porro quisquam est qui dolorem ipsum quia dolor sit amet.",
      "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident."
    ],
    [
      "Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.",
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. Et harum quidem rerum facilis est et expedita distinctio.",
      "Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus.",
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.",
      "Ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat, ut enim ad minima veniam quis nostrum exercitationem ullam corporis suscipit laboriosam."
    ]
  ]
};
