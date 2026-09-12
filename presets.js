/* =============================================================================
   presets.js — the demo's example looks. Used by demo.html ONLY.
   index.html (the signage page) never loads this file.

   Each preset is a patch merged over BASE, so the entries below read as
   "what makes this look different". Pick one in the demo, hit Config, and
   paste the result into config.js to ship it.

   Plain numbers are proportional units — see the "units" note in
   typing-page.js. page.maxHeight/maxWidth are percentages of the viewport;
   everything else is a percentage of the page's own height, which is what
   makes each look identical on a phone, a 16:9 sign and a 9:16 sign.
   ============================================================================= */

/* 1% of the page's height, for use inside frame CSS. */
const u = n => `calc(${n} * var(--tp-u))`;

/* ---------- shared copy ---------------------------------------------------- */

const LOREM = [
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
];

/* ---------- everything the presets have in common -------------------------- */

const BASE = {
  documents: LOREM,
  typing: {
    baseDelay: 58,
    jitter: 0.45,
    burstChance: 0.16,
    burstLength: [4, 14],
    burstSpeed: 0.45,
    hesitateChance: 0.045,
    hesitateRange: [1.7, 2.8],
    spaceFactor: 0.85,
    commaPause: 90,
    sentencePause: 260,
    paragraphPause: 620
  },
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
    scalePunctuation: true
  },
  timing: {
    startDelay: 400,
    holdAfterComplete: 2000,
    ejectDuration: 1150,
    ejectEasing: "cubic-bezier(.45,.02,.62,.25)",
    gapAfterEject: 180,
    feedDuration: 950,
    feedEasing: "cubic-bezier(.18,.75,.30,1)",
    clearPause: 700
  }
};

/* ---------- the looks ------------------------------------------------------ */

const PRESETS = [

  /* ------------------------------------------------------------------ paper */
  {
    id: "paper",
    label: "Typewriter",
    note: "Letter paper, ink jitter, sheet ejects and a fresh one feeds in.",
    patch: {
      transition: "eject",
      scene: {
        background: "radial-gradient(ellipse at 50% 0%, #4a3f35 0%, #2b2420 55%, #191512 100%)"
      },
      page: {
        aspect: 8.5 / 11,
        maxHeight: 92,
        maxWidth: 94,
        padding: [7.6, 6.5],
        background: "linear-gradient(178deg, #fbf7ec 0%, #f6f0e1 60%, #efe7d5 100%)",
        radius: 0.2,
        shadow: `0 ${u(2.4)} ${u(4.9)} rgba(0,0,0,.55), 0 0 0 1px rgba(0,0,0,.08)`
      },
      text: {
        color: "#2e2a24",
        fontFamily: '"Courier New", Courier, monospace',
        fontSize: 1.85,
        fontWeight: "600",
        lineHeight: 1.75,
        letterSpacing: "0.02em",
        paragraphSpacing: 2.05,
        paragraphIndent: "3ch",
        inkJitter: { enabled: true, offset: 0.6, minOpacity: 0.82 }
      },
      cursor: { show: false }
    }
  },

  /* -------------------------------------------------------------- green CRT */
  {
    id: "green-crt",
    label: "Green CRT",
    note: "4:3 phosphor screen, scanlines, block cursor. Text clears in place.",
    patch: {
      transition: "clear",
      scene: { background: "#07090a" },
      page: {
        aspect: 4 / 3,
        maxHeight: 78,
        maxWidth: 92,
        padding: [4.6, 5.1],
        background: "radial-gradient(ellipse at 50% 45%, #0f2417 0%, #08150d 70%, #050b07 100%)",
        radius: 1.4,
        shadow: `0 ${u(2.6)} ${u(6.4)} rgba(0,0,0,.7), 0 0 0 ${u(0.24)} #191919, 0 0 ${u(10)} rgba(80,255,140,.10)`,
        frame: {
          css: `.tp-sheet::before{content:'';position:absolute;inset:0;z-index:3;
                pointer-events:none;border-radius:inherit;
                box-shadow:inset 0 0 ${u(11.5)} rgba(0,0,0,.8)}`
        }
      },
      text: {
        color: "#7dfca6",
        fontFamily: 'ui-monospace, Menlo, Consolas, "Courier New", monospace',
        fontSize: 2.44,
        lineHeight: 1.5,
        letterSpacing: "0.04em",
        paragraphSpacing: 1.9,
        textShadow: `0 0 ${u(0.9)} rgba(90,255,150,.55)`
      },
      effects: { scanlines: true, scanlineOpacity: 0.16, scanlineSize: 0.36 },
      cursor: { show: true, style: "block", opacity: 0.85 }
    }
  },

  /* -------------------------------------------------------------- amber CRT */
  {
    id: "amber-crt",
    label: "Amber CRT",
    note: "Same screen, different phosphor — shows how far colour alone gets you.",
    patch: {
      transition: "clear",
      scene: { background: "#0a0806" },
      page: {
        aspect: 4 / 3,
        maxHeight: 78,
        maxWidth: 92,
        padding: [4.6, 5.1],
        background: "radial-gradient(ellipse at 50% 45%, #2a1a06 0%, #170e03 70%, #0a0601 100%)",
        radius: 1.4,
        shadow: `0 ${u(2.6)} ${u(6.4)} rgba(0,0,0,.7), 0 0 0 ${u(0.24)} #191919, 0 0 ${u(10)} rgba(255,170,60,.12)`,
        frame: {
          css: `.tp-sheet::before{content:'';position:absolute;inset:0;z-index:3;
                pointer-events:none;border-radius:inherit;
                box-shadow:inset 0 0 ${u(11.5)} rgba(0,0,0,.8)}`
        }
      },
      text: {
        color: "#ffb84d",
        fontFamily: 'ui-monospace, Menlo, Consolas, "Courier New", monospace',
        fontSize: 2.44,
        lineHeight: 1.5,
        letterSpacing: "0.04em",
        paragraphSpacing: 1.9,
        textShadow: `0 0 ${u(1)} rgba(255,160,40,.6)`
      },
      effects: { scanlines: true, scanlineOpacity: 0.18, scanlineSize: 0.36 },
      cursor: { show: true, style: "block", opacity: 0.9 }
    }
  },

  /* ------------------------------------------------------------ Windows 3.1 */
  {
    id: "win31",
    label: "Windows 3.1",
    note: "Title bar and menu come from page.frame; caret is the 'bar' style.",
    patch: {
      transition: "clear",
      scene: { background: "#008080" },     /* the teal desktop */
      page: {
        aspect: 4 / 3,
        maxHeight: 80,
        maxWidth: 94,
        padding: [10, 1.5, 1.5],
        background: "#c0c0c0",
        radius: 0,
        shadow: `0 ${u(3.1)} ${u(6.3)} rgba(0,0,0,.45)`,
        frame: {
          html:
            '<div class="w31-bar">' +
              '<div class="w31-box w31-sys">&#9473;</div>' +
              '<div class="w31-caption">Notepad - LOREM.TXT</div>' +
              '<div class="w31-box">&#9660;</div>' +
              '<div class="w31-box">&#9650;</div>' +
            '</div>' +
            '<div class="w31-menu">' +
              '<span><u>F</u>ile</span><span><u>E</u>dit</span>' +
              '<span><u>S</u>earch</span><span><u>H</u>elp</span>' +
            '</div>',
          /* --bev keeps the 1px Windows bevels from disappearing on a big sign
             while never going below a crisp single pixel on a small one. */
          css: `
            .tp-sheet{--bev:max(1px, ${u(0.115)});
              border:calc(var(--bev) * 2) solid #000;
              box-shadow:inset calc(var(--bev) * -2) calc(var(--bev) * -2) 0 #808080,
                         inset calc(var(--bev) * 2) calc(var(--bev) * 2) 0 #dfdfdf,
                         0 ${u(3.1)} ${u(6.3)} rgba(0,0,0,.45)}
            .w31-bar{position:absolute;left:${u(0.875)};right:${u(0.875)};top:${u(0.875)};
              height:${u(4.25)};background:#000080;display:flex;align-items:center;
              gap:${u(0.5)};padding:0 ${u(0.5)}}
            .w31-caption{flex:1;text-align:center;color:#fff;
              font:bold ${u(2.44)}/1 'MS Sans Serif',Tahoma,Verdana,sans-serif}
            .w31-box{width:${u(3.25)};height:${u(3.25)};flex:none;background:#c0c0c0;
              border:var(--bev) solid #000;
              box-shadow:inset calc(var(--bev) * -1) calc(var(--bev) * -1) 0 #808080,
                         inset var(--bev) var(--bev) 0 #fff;
              display:flex;align-items:center;justify-content:center;
              font:${u(1.75)}/1 'MS Sans Serif',Tahoma,sans-serif;color:#000}
            .w31-sys{order:-1}
            .w31-menu{position:absolute;left:${u(0.875)};right:${u(0.875)};top:${u(5.625)};
              height:${u(3.75)};display:flex;align-items:center;gap:${u(3)};
              padding:0 ${u(1.25)};color:#000;border-bottom:var(--bev) solid #808080;
              font:${u(2.375)}/1 'MS Sans Serif',Tahoma,Verdana,sans-serif}
            .tp-doc{background:#fff;padding:${u(1)} ${u(1.25)};
              box-shadow:inset var(--bev) var(--bev) 0 #808080,
                         inset calc(var(--bev) * -1) calc(var(--bev) * -1) 0 #fff,
                         0 0 0 var(--bev) #000}`
        }
      },
      text: {
        color: "#000000",
        fontFamily: '"Lucida Console", "Courier New", Monaco, monospace',
        fontSize: 2.19,
        lineHeight: 1.45,
        letterSpacing: "0",
        paragraphSpacing: 2.19,
        paragraphIndent: "0"
      },
      cursor: { show: true, style: "bar", color: "#000", barWidth: 0.25, opacity: 1, blinkPeriod: 1060 }
    }
  },

  /* ---------------------------------------------------------- WordPerfect 5.1 */
  {
    id: "wordperfect",
    label: "DOS Blue",
    note: "Full-screen DOS word processor, status line, underline cursor.",
    patch: {
      transition: "clear",
      scene: { background: "#101012" },
      page: {
        aspect: 4 / 3,
        maxHeight: 80,
        maxWidth: 94,
        padding: [4.25, 4.25, 7.5],
        background: "#0000a8",
        radius: 0.5,
        shadow: `0 ${u(2.5)} ${u(6.25)} rgba(0,0,0,.65), 0 0 0 ${u(0.25)} #2a2a2a`,
        frame: {
          html: '<div class="wp-status"><span>C:\\DOCS\\LOREM.WP</span>' +
                '<span>Doc 1&nbsp;&nbsp;Pg 1&nbsp;&nbsp;Ln 1"&nbsp;&nbsp;Pos 1"</span></div>',
          css: `.wp-status{position:absolute;left:0;right:0;bottom:${u(2.5)};display:flex;
                justify-content:space-between;padding:0 ${u(4.25)};color:#d8d8d8;
                font:${u(2.06)}/1 ui-monospace,Consolas,'Courier New',monospace}`
        }
      },
      text: {
        color: "#f0f0f0",
        fontFamily: 'ui-monospace, Consolas, "Courier New", monospace',
        fontSize: 2.25,
        lineHeight: 1.5,
        letterSpacing: "0.02em",
        paragraphSpacing: 2.25,
        paragraphIndent: "5ch"
      },
      cursor: { show: true, style: "underline", color: "#f0f0f0", underlineHeight: 0.25, opacity: 1, blinkPeriod: 900 }
    }
  }
];

/* Resolve each patch against BASE once, so the demo (and the Config panel)
   always work with a complete, copy-pasteable config object. */
for (const preset of PRESETS) {
  preset.config = TypingPage.merge(BASE, preset.patch);
}
