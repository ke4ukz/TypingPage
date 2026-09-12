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
     A display left running for weeks never reloads, so it would keep showing
     the copy it started with no matter what you push. Above 0, the page
     reloads itself once it has been running this long — always at a document
     boundary, never mid-typing, so the reload is invisible.
     Set to 0 to disable.
  -------------------------------------------------------------------------- */
  reloadAfterHours: 12,

  /* --------------------------------------------------------------------------
     SCENE — whatever sits behind the page.
     Any CSS `background` shorthand: colour, gradient, url(...) texture.
  -------------------------------------------------------------------------- */
  scene: {
    background:
      "radial-gradient(ellipse at 50% 0%, #4a3f35 0%, #2b2420 55%, #191512 100%)"
  },

  /* --------------------------------------------------------------------------
     PAGE — the sheet of paper / the screen.
     Sized in vh so the whole layout holds at any display resolution.
  -------------------------------------------------------------------------- */
  page: {
    height: "92vh",          // everything else scales off this
    aspect: 8.5 / 11,        // width / height (US Letter)
    padding: "7vh 6vh",      // margins of the printed area
    background:
      "linear-gradient(178deg, #fbf7ec 0%, #f6f0e1 60%, #efe7d5 100%)",
    radius: "2px",
    shadow: "0 2.2vh 4.5vh rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.08)",

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
    fontSize: "1.7vh",
    fontWeight: "600",
    lineHeight: 1.75,
    letterSpacing: "0.02em",
    paragraphSpacing: "1.9vh",
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
    scanlineSize: "3px"
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
