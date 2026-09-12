/* =============================================================================
   typing-page.js — the typing/transport engine. Shared by index.html and
   demo.html so both render identically. You should not need to edit this file;
   everything it does is driven by the config object handed to TypingPage.start.

   API
     TypingPage.start(config, mountElement)  -> effective config (defaults merged)
     TypingPage.stop()
     TypingPage.merge(base, patch)           -> deep-merged copy (used by presets)
     TypingPage.DEFAULTS
   ============================================================================= */

const TypingPage = (function () {
  "use strict";

  /* ---------- defaults: the complete parameter surface -------------------- */

  const DEFAULTS = {

    // "eject" — the finished page rolls up and out, a fresh one feeds in below.
    // "clear" — the finished text simply disappears in place.
    transition: "eject",

    // Unattended displays never reload, so a hosted page keeps serving the copy
    // it started with. This reloads it — but only at a document boundary, and
    // only once it is satisfied the reload will land somewhere real.
    //
    // Automatically inert on file:// — there is nothing to re-fetch from an SD
    // card, and swapping the card means restarting the player anyway.
    //
    // Defaults suit a static host that sends ETag/Last-Modified and sane cache
    // headers. See README "Hosts that behave differently" for the knobs that
    // matter elsewhere.
    reload: {
      afterHours: 0,        // 0 disables. Uptime since load, not a clock time.
      onlyIfChanged: true,  // compare validators; skip a reload that changes nothing
      probe: true,          // check the origin answers before navigating away
      url: null,            // default: this page's own URL
      method: "HEAD",       // "GET" for servers that reject HEAD with 405
      expectText: null,     // response must contain this string (forces GET)
      timeoutMs: 8000,      // give up on a hung connection
      retryMinutes: 5,      // back-off after an unreachable probe
      cacheBust: false      // for hosts serving HTML with a long max-age
    },

    // Whatever sits behind the page. Any CSS `background` shorthand.
    scene: { background: "#1b1b1b" },

    // The page is drawn as the largest box of `aspect` that fits inside BOTH
    // maxHeight and maxWidth, so it is never clipped in any orientation.
    page: {
      aspect: 8.5 / 11,      // width / height. May also be
                             // { landscape: n, portrait: n } to change shape
                             // with the display's orientation.
      maxHeight: 92,         // percent of viewport height
      maxWidth: 94,          // percent of viewport width
      padding: 6,            // see "units" below
      background: "#ffffff",
      radius: "0",
      shadow: "none",
      // Optional chrome (title bars, status lines, vignettes). Rendered behind
      // the text inside the page. CSS may target .tp-sheet / .tp-doc / .tp-frame.
      frame: null            // { html: "...", css: "..." }
    },

    text: {
      color: "#222222",
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: 1.85,
      fontWeight: "400",
      lineHeight: 1.7,
      letterSpacing: "0",
      paragraphSpacing: 2,
      paragraphIndent: "0",
      textShadow: "none",
      // Typewriter strike imperfection: each glyph is nudged a fraction of a
      // pixel and inked unevenly. Uses relative offsets, so nothing reflows.
      inkJitter: { enabled: false, offset: 0.6, minOpacity: 0.85 }
    },

    effects: {
      scanlines: false,
      scanlineOpacity: 0.15,
      scanlineSize: 0.36
    },

    cursor: {
      show: false,
      style: "block",          // "block" | "bar" | "underline"
      color: "currentColor",
      barWidth: "0.12em",      // used by "bar"
      height: "1.15em",        // used by "block" and "bar"
      underlineHeight: "0.14em",
      opacity: 0.85,
      blinkPeriod: 1000,       // ms, full on/off cycle
      blinkAfterIdle: 380      // ms of no keystroke before blinking starts
    },

    typing: {
      baseDelay: 58,           // average keystroke interval, ms
      jitter: 0.45,            // +/- wobble on every keystroke
      burstChance: 0.16,       // odds of dropping into a fast run
      burstLength: [4, 14],    // characters per burst
      burstSpeed: 0.45,        // delay multiplier during a burst
      hesitateChance: 0.045,   // odds of a small stumble
      hesitateRange: [1.7, 2.8],
      spaceFactor: 0.85,       // spaces come a touch quicker
      commaPause: 90,          // extra ms after , ; :
      sentencePause: 260,      // extra ms after . ! ?
      paragraphPause: 620      // extra ms at the end of each paragraph
    },

    // Maps progress through a page (0 -> 1) to a delay multiplier, smoothly
    // interpolated. Values below 1 are faster. Off = uniform, lifelike pacing.
    speedCurve: {
      enabled: false,
      stops: [[0, 1], [0.08, 1], [0.17, 0.05], [0.83, 0.05], [0.92, 1], [1, 1]],
      scalePunctuation: true   // also shrink punctuation/paragraph pauses
    },

    timing: {
      startDelay: 500,         // before the very first page appears
      holdAfterComplete: 2200, // admire the finished page
      ejectDuration: 1150,
      ejectEasing: "cubic-bezier(.45,.02,.62,.25)",
      gapAfterEject: 180,      // empty platen between pages
      feedDuration: 950,
      feedEasing: "cubic-bezier(.18,.75,.30,1)",
      clearPause: 700          // blank interval when transition is "clear"
    },

    // Array of documents, typed in sequence then looped. Each is an array of
    // paragraph strings, or one string with blank lines between paragraphs.
    documents: []
  };

  /* ---------- units --------------------------------------------------------

     A plain number in the config is a PROPORTIONAL unit, not pixels:

       page.maxHeight / page.maxWidth   percent of the viewport
       everything else                  percent of the page's own height

     That second one is the whole trick. Because every interior measurement --
     type size, padding, paragraph spacing -- is a fraction of the page rather
     than a fraction of the screen, a page rendered small (a phone, a portrait
     sign) is a faithful scale model of the same page rendered large. Nothing
     reflows differently, so copy tuned to fill the page fills it everywhere.

     An array becomes a space-separated list, for shorthands like padding.
     A string is passed through untouched, so px / em / ch / vh all still work,
     and CSS anywhere -- including page.frame.css -- can use calc() against
     var(--tp-u), which is 1% of the page's height.
  -------------------------------------------------------------------------- */

  function unit(value, u) {
    if (Array.isArray(value)) return value.map(v => unit(v, u)).join(" ");
    if (typeof value === "number") return `calc(${value} * ${u})`;
    return value;
  }

  const onPage = value => unit(value, "var(--tp-u)");

  /* ---------- deep merge -------------------------------------------------- */

  function clone(v) {
    if (Array.isArray(v)) return v.map(clone);
    if (v && typeof v === "object") {
      const o = {};
      for (const k of Object.keys(v)) o[k] = clone(v[k]);
      return o;
    }
    return v;
  }

  function merge(base, patch) {
    if (patch === undefined) return clone(base);
    if (patch === null || typeof patch !== "object" || Array.isArray(patch)) return clone(patch);
    const out = (base && typeof base === "object" && !Array.isArray(base)) ? clone(base) : {};
    for (const k of Object.keys(patch)) out[k] = merge(out[k], patch[k]);
    return out;
  }

  /* ---------- module state ------------------------------------------------ */

  let token = 0;              // bumped on every start/stop; cancels stale loops
  let mount = null;
  let sizeStyle = null;
  let skinStyle = null;
  let onResize = null;
  let blinkTimer = null;

  const CANCELLED = { cancelled: true };

  function stop() {
    token++;
    clearTimeout(blinkTimer);
    blinkTimer = null;
    if (onResize) { window.removeEventListener("resize", onResize); onResize = null; }
    if (sizeStyle) { sizeStyle.remove(); sizeStyle = null; }
    if (skinStyle) { skinStyle.remove(); skinStyle = null; }
    if (mount) { mount.textContent = ""; mount = null; }
  }

  /* ---------- start ------------------------------------------------------- */

  function start(userConfig, mountElement) {
    stop();

    const cfg = merge(DEFAULTS, userConfig);
    const run = ++token;

    // Back-compat: a flat reloadAfterHours predates the reload block.
    if (cfg.reloadAfterHours !== undefined && !(userConfig && userConfig.reload)) {
      cfg.reload.afterHours = cfg.reloadAfterHours;
    }

    mount = mountElement || document.querySelector(".tp-stage");
    if (!mount) throw new Error("TypingPage: no mount element");
    mount.classList.add("tp-stage");

    /* --- config -> CSS custom properties --- */

    const root = document.documentElement;
    const set = (name, value) => {
      if (value !== undefined && value !== null) root.style.setProperty(name, String(value));
    };

    set("--tp-scene-bg", cfg.scene.background);

    /* --- page size: the largest box of `aspect` fitting both viewport axes ---

       Emitted as a stylesheet rather than inline properties so that an
       orientation-dependent aspect ratio is handled by a media query, with no
       JavaScript on resize. A rotated sign just re-lays out. */

    // Legacy `page.height` is still accepted as an alias for maxHeight.
    const maxH = cfg.page.maxHeight !== undefined ? cfg.page.maxHeight : cfg.page.height;
    set("--tp-max-h", unit(maxH, "var(--tp-vh)"));
    set("--tp-max-w", unit(cfg.page.maxWidth, "var(--tp-vw)"));

    const sizeRules = aspect => {
      const w = `min(calc(var(--tp-max-h) * ${aspect}), var(--tp-max-w))`;
      return `--tp-page-w:${w};` +
             `--tp-page-h:calc(${w} / ${aspect});` +
             `--tp-u:calc(${w} / ${aspect} / 100);`;
    };

    const asp = cfg.page.aspect;
    const wide = (asp && typeof asp === "object") ? asp.landscape : asp;
    const tall = (asp && typeof asp === "object") ? asp.portrait : asp;

    sizeStyle = document.createElement("style");
    sizeStyle.textContent =
      `:root{${sizeRules(wide)}}` +
      (tall !== wide ? `@media (orientation:portrait){:root{${sizeRules(tall)}}}` : "");
    document.head.appendChild(sizeStyle);

    set("--tp-page-pad", onPage(cfg.page.padding));
    set("--tp-page-bg", cfg.page.background);
    set("--tp-page-radius", onPage(cfg.page.radius));
    set("--tp-page-shadow", cfg.page.shadow);

    set("--tp-text-color", cfg.text.color);
    set("--tp-text-font", cfg.text.fontFamily);
    set("--tp-text-size", onPage(cfg.text.fontSize));
    set("--tp-text-weight", cfg.text.fontWeight);
    set("--tp-text-line", cfg.text.lineHeight);
    set("--tp-text-spacing", cfg.text.letterSpacing);
    set("--tp-text-shadow", cfg.text.textShadow);
    set("--tp-para-space", onPage(cfg.text.paragraphSpacing));
    set("--tp-para-indent", cfg.text.paragraphIndent);

    set("--tp-cursor-color", cfg.cursor.color);
    set("--tp-cursor-opacity", cfg.cursor.opacity);
    set("--tp-cursor-blink", cfg.cursor.blinkPeriod + "ms");
    set("--tp-scan-opacity", cfg.effects.scanlineOpacity);
    set("--tp-scan-size", onPage(cfg.effects.scanlineSize));

    /* --- DOM --- */

    const sheet = document.createElement("div");
    sheet.className = "tp-sheet" + (cfg.effects.scanlines ? " tp-scanlines" : "");

    if (cfg.page.frame) {
      if (cfg.page.frame.css) {
        skinStyle = document.createElement("style");
        skinStyle.textContent = cfg.page.frame.css;
        document.head.appendChild(skinStyle);
      }
      if (cfg.page.frame.html) {
        const frame = document.createElement("div");
        frame.className = "tp-frame";
        frame.innerHTML = cfg.page.frame.html;
        sheet.appendChild(frame);
      }
    }

    const doc = document.createElement("div");
    doc.className = "tp-doc";
    const ink = cfg.text.inkJitter && cfg.text.inkJitter.enabled;
    if (ink) doc.classList.add("tp-ink");
    sheet.appendChild(doc);
    mount.appendChild(sheet);

    /* --- cursor --- */

    const CUR = cfg.cursor;
    const cursor = document.createElement("div");
    cursor.className = "tp-cursor" + (CUR.show ? "" : " tp-hidden");
    set("--tp-cursor-h", onPage(CUR.style === "underline" ? CUR.underlineHeight : CUR.height));
    if (CUR.style === "bar") set("--tp-cursor-w", onPage(CUR.barWidth));

    // "block" and "underline" span a whole character cell, so measure one.
    function measureCharWidth() {
      const probe = document.createElement("span");
      probe.textContent = "M";
      probe.style.cssText = "visibility:hidden;position:absolute";
      doc.appendChild(probe);
      const w = probe.getBoundingClientRect().width;
      probe.remove();
      return w;
    }
    if (CUR.style !== "bar") set("--tp-cursor-w", measureCharWidth() + "px");

    function pokeCursor() {
      cursor.classList.remove("tp-blink");
      clearTimeout(blinkTimer);
      blinkTimer = setTimeout(() => cursor.classList.add("tp-blink"), CUR.blinkAfterIdle);
    }

    let chars = [];
    let cursorIndex = 0;

    function placeCursor(i) {
      if (!CUR.show) return;
      cursorIndex = i;
      const curH = cursor.offsetHeight;
      const at = chars[i];
      const last = chars[chars.length - 1];
      let left, top, boxH;

      if (at) {
        left = at.el.offsetLeft;
        top = at.el.offsetTop;
        boxH = at.el.offsetHeight;
      } else if (last) {
        left = last.el.offsetLeft + last.el.offsetWidth;
        top = last.el.offsetTop;
        boxH = last.el.offsetHeight;
      } else {
        return;
      }

      cursor.style.left = left + "px";
      cursor.style.top = (CUR.style === "underline"
        ? top + boxH - curH
        : top + (boxH - curH) / 2) + "px";
    }

    /* --- document building --- */

    function toParagraphs(entry) {
      if (Array.isArray(entry)) return entry;
      return String(entry).split(/\n\s*\n/).map(s => s.trim()).filter(Boolean);
    }

    function buildDocument(paragraphs) {
      doc.textContent = "";
      chars = [];

      for (const text of paragraphs) {
        const p = document.createElement("p");
        for (const c of text) {
          const span = document.createElement("span");
          span.className = "tp-ch";
          span.textContent = c;
          p.appendChild(span);
          chars.push({ el: span, c: c, endOfParagraph: false });
        }
        if (chars.length) chars[chars.length - 1].endOfParagraph = true;
        doc.appendChild(p);
      }

      doc.appendChild(cursor);
      placeCursor(0);
      pokeCursor();
    }

    function reveal(entry) {
      entry.el.classList.add("tp-on");
      if (ink && entry.c !== " ") {
        const j = cfg.text.inkJitter;
        entry.el.style.top = (Math.random() * 2 - 1) * j.offset + "px";
        entry.el.style.left = (Math.random() * 2 - 1) * j.offset * 0.5 + "px";
        entry.el.style.opacity = j.minOpacity + Math.random() * (1 - j.minOpacity);
      }
    }

    function clearDocument() {
      for (const entry of chars) {
        entry.el.classList.remove("tp-on");
        entry.el.removeAttribute("style");
      }
      placeCursor(0);
      pokeCursor();
    }

    /* --- cadence --- */

    const T = cfg.typing;
    const SC = cfg.speedCurve;
    const rand = (lo, hi) => lo + Math.random() * (hi - lo);
    const randInt = (lo, hi) => Math.floor(rand(lo, hi + 1));

    // Piecewise linear with a smoothstep between stops, so speed changes ramp
    // instead of snapping.
    function curveAt(progress) {
      if (!SC.enabled || !SC.stops || !SC.stops.length) return 1;
      const stops = SC.stops;
      if (progress <= stops[0][0]) return stops[0][1];
      for (let i = 1; i < stops.length; i++) {
        const [x0, y0] = stops[i - 1];
        const [x1, y1] = stops[i];
        if (progress <= x1) {
          const t = x1 === x0 ? 1 : (progress - x0) / (x1 - x0);
          return y0 + (y1 - y0) * (t * t * (3 - 2 * t));
        }
      }
      return stops[stops.length - 1][1];
    }

    const scalePauses = SC.enabled && SC.scalePunctuation !== false;
    const burst = { left: 0 };

    function delayFor(c, speed) {
      let d = T.baseDelay * (1 + (Math.random() * 2 - 1) * T.jitter);

      if (burst.left > 0) {
        burst.left--;
        d *= T.burstSpeed;
      } else if (Math.random() < T.burstChance) {
        burst.left = randInt(T.burstLength[0], T.burstLength[1]);
        d *= T.burstSpeed;
      } else if (Math.random() < T.hesitateChance) {
        d *= rand(T.hesitateRange[0], T.hesitateRange[1]);
      }

      if (c === " ") d *= T.spaceFactor;

      let extra = 0;
      if (c === "," || c === ";" || c === ":") extra = T.commaPause;
      else if (c === "." || c === "!" || c === "?") extra = T.sentencePause;

      return d * speed + extra * (scalePauses ? speed : 1);
    }

    /* --- async plumbing, all cancellable via the run token --- */

    const alive = () => { if (run !== token) throw CANCELLED; };
    const wait = ms => new Promise(r => setTimeout(r, Math.max(0, ms))).then(alive);
    const nextFrame = () => new Promise(r => requestAnimationFrame(() => r())).then(alive);

    function snapTo(transform) {
      sheet.style.transition = "none";
      sheet.style.transform = transform;
      void sheet.offsetHeight;              // force the snap to land this frame
    }

    function animateTo(transform, duration, easing) {
      return new Promise(resolve => {
        let settled = false;
        const finish = () => {
          if (settled) return;
          settled = true;
          sheet.removeEventListener("transitionend", onEnd);
          clearTimeout(guard);
          resolve();
        };
        const onEnd = e => { if (e.propertyName === "transform") finish(); };
        sheet.addEventListener("transitionend", onEnd);
        const guard = setTimeout(finish, duration + 400);   // survives a background tab
        sheet.style.transition = `transform ${duration}ms ${easing}`;
        requestAnimationFrame(() => { sheet.style.transform = transform; });
      }).then(alive);
    }

    /* --- reload preflight ---------------------------------------------------

       Navigating away is irreversible from the page's point of view. If the
       reload lands on a dead network, a captive portal or a half-finished
       deploy, the browser throws away a working display and the sign stays
       wrong until somebody walks over to it. So the reload has to earn its
       trust first, and every assumption it makes is a config knob, because
       they are all assumptions about someone else's web server.

       file:// short-circuits the whole mechanism: fetch() is blocked there, so
       an unguarded probe would fail forever, and there is nothing to re-fetch
       from local storage in any case. */

    const RL = cfg.reload;
    const isFile = location.protocol === "file:";
    const reloadAfter = (!isFile && RL.afterHours > 0) ? RL.afterHours * 3600e3 : 0;

    // expectText needs a body to search, which a HEAD response does not have.
    const probeMethod = RL.expectText ? "GET" : (RL.method || "HEAD");

    async function probe() {
      const ctl = new AbortController();
      const timer = setTimeout(() => ctl.abort(), RL.timeoutMs);
      try {
        const res = await fetch(RL.url || location.href, {
          method: probeMethod,
          cache: "no-store",        // must reach the network, not the disk cache
          redirect: "follow",
          signal: ctl.signal
        });
        // A resolved fetch is not enough: a 404 part-way through a deploy, or a
        // captive portal's login page, both resolve perfectly happily.
        if (!res.ok) return null;
        if (RL.expectText && !(await res.text()).includes(RL.expectText)) return null;
        return res;
      } catch (e) {
        return null;                // offline, DNS failure, timeout, blocked
      } finally {
        clearTimeout(timer);
      }
    }

    // Whatever the host gives us to tell two versions apart. A host that sends
    // neither leaves this null, and onlyIfChanged then falls back to reloading
    // on the interval, which is the behaviour you would have had regardless.
    const versionOf = res =>
      res.headers.get("etag") || res.headers.get("last-modified") || null;

    let loadedVersion = null;
    if (reloadAfter && RL.probe && RL.onlyIfChanged) {
      probe().then(res => { if (res) loadedVersion = versionOf(res); });
    }

    function doReload() {
      if (!RL.cacheBust) return location.reload();
      // For hosts that serve the HTML itself with a long max-age, where a plain
      // reload would be answered from cache with the very page we are replacing.
      const url = new URL(location.href);
      url.searchParams.set("_", Date.now());
      location.replace(url.toString());
    }

    // Far enough that the page clears the viewport whatever its size.
    const OFF_TOP = "translateY(calc(-50vh - 50% - 4vh))";
    const OFF_BOTTOM = "translateY(calc(50vh + 50% + 4vh))";
    const HOME = "translateY(0)";

    /* --- the loop --- */

    async function typeDocument() {
      const total = chars.length;
      for (let i = 0; i < total; i++) {
        const entry = chars[i];
        const speed = curveAt(total > 1 ? i / (total - 1) : 1);

        placeCursor(i);
        await wait(delayFor(entry.c, speed));
        reveal(entry);
        pokeCursor();

        if (entry.endOfParagraph && i < total - 1) {
          placeCursor(i + 1);
          await wait(T.paragraphPause * (scalePauses ? speed : 1));
        }
      }
      placeCursor(total);
    }

    async function loop() {
      const docs = cfg.documents;
      if (!docs || !docs.length) return;
      const ejects = cfg.transition === "eject";
      let sinceReload = Date.now();
      let probeAgainAt = 0;
      let index = 0;

      if (ejects) snapTo(OFF_BOTTOM);
      await wait(cfg.timing.startDelay);

      for (;;) {
        buildDocument(toParagraphs(docs[index % docs.length]));

        if (ejects) {
          snapTo(OFF_BOTTOM);
          await nextFrame();
          await animateTo(HOME, cfg.timing.feedDuration, cfg.timing.feedEasing);
        }

        await typeDocument();
        await wait(cfg.timing.holdAfterComplete);

        if (ejects) {
          await animateTo(OFF_TOP, cfg.timing.ejectDuration, cfg.timing.ejectEasing);
          await wait(cfg.timing.gapAfterEject);
        } else {
          clearDocument();
          await wait(cfg.timing.clearPause);
        }

        // Page boundary: the only safe moment to pick up new content.
        if (reloadAfter && Date.now() - sinceReload >= reloadAfter && Date.now() >= probeAgainAt) {
          if (!RL.probe) {
            doReload();
            return;
          }
          const res = await probe();
          alive();                        // a stop() during the probe wins

          if (!res) {
            // Unreachable. A stale page beats a dead one: keep typing, and back
            // off rather than probing at every page boundary through an outage.
            probeAgainAt = Date.now() + RL.retryMinutes * 60e3;
          } else if (RL.onlyIfChanged && loadedVersion && versionOf(res) === loadedVersion) {
            // Reachable but byte-identical. Reloading would only risk a blank
            // frame for nothing, so wait out another interval.
            sinceReload = Date.now();
          } else {
            doReload();
            return;
          }
        }

        index++;
      }
    }

    // Wrapping and the vh-based metrics change on resize.
    onResize = () => {
      if (CUR.style !== "bar") set("--tp-cursor-w", measureCharWidth() + "px");
      placeCursor(cursorIndex);
    };
    window.addEventListener("resize", onResize);

    loop().catch(err => { if (err !== CANCELLED) throw err; });

    return cfg;
  }

  return { start, stop, merge, DEFAULTS };
})();
