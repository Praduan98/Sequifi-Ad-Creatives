// Scenes 1–3: the notification storm → "Complex comp. Paid right." → logo. Also the shared type helpers.
"use strict";

const REF = {};   // layout shared between scenes

// ---------- type helpers ----------
// measure a text run with the given class/style (fonts are loaded before build)
function measure(cls, text, style = "") {
  const m = el("span", cls, document.body); m.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;${style}`; m.textContent = text;
  const r = { w: m.offsetWidth, h: m.offsetHeight }; m.remove(); return r;
}
// a centred text line made of per-char spans; returns {wrap, chars, w, h, x, y}
function textLine(parent, parts, cx, cy, z = 0) {
  const wrap = el("div", "abs", parent); wrap.style.zIndex = z; wrap.style.whiteSpace = "nowrap";
  const chars = [];
  for (const [cls, text, style] of parts) {
    const span = el("span", cls, wrap); if (style) span.style.cssText = style;
    chars.push(...splitChars(span, text));
  }
  const w = wrap.offsetWidth, h = wrap.offsetHeight;
  const x = cx - w / 2, y = cy - h / 2;
  tf(wrap, { x, y });
  return { wrap, chars, w, h, x, y };
}
// left-aligned text line
function leftLine(parent, parts, x, cy, z = 0) {
  const r = textLine(parent, parts, 0, cy, z);
  r.x = x; tf(r.wrap, { x, y: r.y }); return r;
}
const serifCol = (i, n) => { const k = n > 1 ? i / (n - 1) : 0; return `rgb(${Math.round(lerp(255, 160, k))},${Math.round(lerp(255, 176, k))},${Math.round(lerp(255, 255, k))})`; };
const wordsOf = (line) => [...line.wrap.querySelectorAll(".wd")];
// word slam: each word lands from a larger scale with a short blur, staggered; optional exit at `out`. dirs = lateral
// start offsets per word (the last one repeats), so later words always fly in from the right, away from earlier ones
function slamWords(words, t, t0, step, out, outStep = 0.03, dirs) {
  words.forEach((w, i) => {
    const p = E.outExpo(clamp((t - t0 - i * step) / 0.42)), xo = out ? E.inCubic(clamp((t - out - i * outStep) / 0.36)) : 0;
    w.style.transformOrigin = "0 70%";
    tf(w, { s: lerp(1.32, 1, p) + 0.05 * xo, x: dirs ? dirs[Math.min(i, dirs.length - 1)] * 0.7 * (1 - p) : 0, y: -44 * xo, o: clamp(p * 1.8) * (1 - xo), b: (1 - p) * 8 + 8 * xo });
  });
}
// serif rise: chars spring up into place, staggered; optional exit
function riseChars(chars, t, t0, step, out, outStep = 0.012) {
  chars.forEach((c, i) => {
    const d = t0 + i * step, s = S(t, d, 0.5, 0.7), xo = out ? E.inCubic(clamp((t - out - i * outStep) / 0.38)) : 0;
    tf(c, { y: (1 - s) * 120 - 50 * xo, o: clamp((t - d) / 0.12) * (1 - xo), b: Math.max(0, 1 - s) * 6 + 8 * xo, r: (1 - s) * -6 });
  });
}

// ================================================================= 1 · HOOK (0 – 4)
// A back office's week as an iOS notification storm — reps asking where their pay is, broken spreadsheets,
// chargebacks, clawbacks — stacking on the beat, while the comp vocabulary piles up on the left. Then the site's line
// "Every paycheck is different." and the whole stack is swiped away.
const HOOK_WORDS = [["Tiers.", 0.5], ["Splits.", 1.0], ["Overrides.", 1.5], ["Clawbacks.", 2.0]];
const HOOK_IN = [0.12, 0.5, 0.75, 1.0, 1.25, 1.5, 1.75, 2.0, 2.25, 2.5, 2.75, 3.0];
scene({
  name: "hook", t0: 0, t1: 4.05,
  build() {
    const K = 1.7;
    this.notifs = NOTIFS.map(([kind, title, body], i) => {
      const g = IOS.notification(this.root, { kind, title, body, k: K, w: 400 });
      g.t0 = HOOK_IN[i]; g.el.style.zIndex = 10 + i;
      cue(g.t0, "ping", { pan: 0.45, v: i % 3 === 0 ? 1 : 0.75 });
      return g;
    });
    this.NW = this.notifs[0].w; this.NH = this.notifs[0].h;
    this.NX = 1400 - this.NW / 2; this.NY = 108; this.STEP = this.NH + 16;
    this.words = HOOK_WORDS.map(([w, t0], i) => ({ ln: leftLine(this.root, [["disp", w, "font-size:132px"]], 126, 352 + i * 126, 30), t0 }));
    this.ep1 = textLine(this.root, [["disp", "Every paycheck", "font-size:170px"]], 960, 452, 40);
    this.ep2 = textLine(this.root, [["serif", "is different.", "font-size:200px;line-height:.9"]], 960, 636, 40);
    this.ep2.chars.forEach((c, i, a) => (c.style.color = serifCol(i, a.length)));
    for (const [, t0] of HOOK_WORDS) cue(t0, "hit");
    cue(2.5, "hit", { v: 1.1 }); cue(3.0, "hit", { v: 1.1 });
    cue(0.0, "riser", { d: 4.0 }); cue(3.0, "reverse", { d: 1.0 }); cue(3.56, "whoosh", { d: 0.42, v: 0.85, pan: 0.3 });
  },
  update(t) {
    const rec = E.inOutCubic(inv(2.36, 2.74, t));   // the column steps back behind the line
    const col = E.inOutCubic(inv(3.24, 3.58, t));   // … collapses into a notification stack
    const fl = E.inCubic(inv(3.56, 3.88, t));       // … and the stack is swiped away
    const n = this.notifs.length;
    this.notifs.forEach((g, i) => {
      if (t < g.t0) { tf(g.el, { o: 0 }); return; }
      let slot = 0;
      for (let j = i + 1; j < n; j++) slot += S(t, this.notifs[j].t0, 0.42, 0.8);
      const drop = S(t, g.t0, 0.44, 0.72), st = Math.min(slot, 2);
      let y = this.NY + this.STEP * slot - 120 * (1 - drop);
      let s = (1 - 0.022 * slot) * lerp(0.93, 1, clamp(drop));
      let o = clamp((t - g.t0) / 0.09) * clamp(1 - 0.08 * slot, 0.22, 1);
      y = lerp(y, this.NY + 22 * st, col); s = lerp(s, 1 - 0.06 * st, col); o = lerp(o, slot < 2.5 ? 1 - 0.3 * slot : 0, col);
      const back = rec * (1 - col);
      tf(g.el, { p: 1600, x: this.NX + 150 * rec, y: y - 1100 * fl, s: s * (1 - 0.16 * back) * (1 - 0.08 * col), rx: -22 * (1 - clamp(drop)) + 10 * fl, o: o * (1 - 0.5 * back) * (1 - inv(0.7, 1, fl)), b: 5 * back });
      Glass.illum(g, t > g.t0 ? 0.75 * Math.exp(-(t - g.t0) * 5) : 0, 50, 0);
    });
    // the vocabulary piles up: each word lands on the beat, the earlier ones dim
    const out = E.inCubic(inv(2.26, 2.46, t));
    this.words.forEach(({ ln, t0 }, i) => {
      if (t < t0) { tf(ln.wrap, { o: 0 }); return; }
      const p = E.outExpo(clamp((t - t0) / 0.32)), next = i + 1 < HOOK_WORDS.length ? HOOK_WORDS[i + 1][1] : 99;
      const dim = 1 - 0.6 * E.outCubic(inv(next, next + 0.18, t));
      tf(ln.wrap, { x: ln.x - 170 * out * (1 + 0.3 * i), y: ln.y, s: lerp(1.45, 1, p), o: clamp(p * 2) * dim * (1 - out), b: (1 - p) * 8 + 6 * out });
    });
    // "Every paycheck / is different." — then pushed through the camera
    const push = E.inExpo(inv(3.42, 3.96, t)), p1 = E.outExpo(clamp((t - 2.5) / 0.32));
    tf(this.ep1.wrap, { x: this.ep1.x, y: this.ep1.y - 50 * push, s: lerp(1.55, 1, p1) * (1 + 0.55 * push), o: (t >= 2.5 ? clamp(p1 * 2) : 0) * (1 - inv(0.45, 1, push)), b: (1 - p1) * 9 + 14 * push });
    this.ep2.chars.forEach((c, i) => { const d = 3.0 + i * 0.022, sp = S(t, d, 0.42, 0.7); tf(c, { y: (1 - sp) * 140, o: clamp((t - d) / 0.1), b: Math.max(0, 1 - sp) * 6, r: (1 - sp) * -8 }); });
    tf(this.ep2.wrap, { x: this.ep2.x, y: this.ep2.y + 50 * push, s: 1 + 0.55 * push, o: 1 - inv(0.45, 1, push), b: 14 * push });
  },
  cam(t) {
    // beat punches with a 12 ms attack (an instant jump would double-expose the motion-blurred frame)
    let s = 1 + 0.05 * E.inQuad(t / 4), r = lerp(-1.6, 0, E.inOutCubic(t / 4)), x = 0;
    [0.5, 1.0, 1.5, 2.0, 2.5, 3.0].forEach((b, i) => { if (t >= b) { const k = (1 - Math.exp(-(t - b) / 0.012)) * Math.exp(-(t - b) * 9); s += 0.03 * k; r += (i % 2 ? 1 : -1) * 0.7 * k; x += (i % 2 ? 1 : -1) * 12 * k; } });
    s += 0.16 * E.inExpo(inv(3.4, 4.0, t));
    return { x, y: 0, s, r };
  },
});

// ================================================================= 2 · HERO (4 – 8)
// "Complex comp. Paid right." — and the answer to the storm: one calm Sequifi notification.
scene({
  name: "hero", t0: 3.95, t1: 8.05,
  build() {
    this.glow = el("div", "abs", this.root);
    css(this.glow, { width: "1200px", height: "420px", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(96,120,236,.7), rgba(96,120,236,.22) 55%, rgba(96,120,236,0))", filter: "blur(20px)" });
    this.l1 = textLine(this.root, [["disp", "Complex comp.", "font-size:178px"]], 960, 482);
    this.l2 = textLine(this.root, [["disp", "Paid ", "font-size:178px"], ["serif", "right.", "font-size:206px;line-height:.9"]], 960, 672, 5);
    const nR = "right.".length;
    this.l2.chars.slice(-nR).forEach((c, i) => (c.style.color = serifCol(i, nR)));
    this.n1 = this.l1.chars.length;
    this.rank1 = this.l1.chars.map((_, i) => Math.abs(i - (this.n1 - 1) / 2));   // line 1 lands from the centre outwards
    this.note = IOS.notification(this.root, { kind: "sequifi", title: HERO_NOTE.title, body: HERO_NOTE.body, k: 1.8, w: 400, check: true });
    this.note.el.style.zIndex = 8;
    this.NX = 960 - this.note.w / 2; this.NY = 92;
    cue(4.0, "impact", { v: 1 }); cue(4.0, "boom"); cue(4.48, "whoosh", { d: 0.5, v: 0.45, pan: -0.5 }); cue(5.0, "whoosh", { d: 0.6, v: 0.5, pan: 0.6 });
    cue(5.5, "swell", { d: 0.6 }); cue(5.96, "notify", { v: 1.1 }); cue(6.6, "shimmer"); cue(7.3, "whoosh", { d: 0.4, v: 0.5, pan: 0.2 }); cue(7.45, "whoosh", { d: 0.5, v: 0.5 });
  },
  update(t) {
    this.l1.chars.forEach((c, i) => {
      const d = 4.0 + this.rank1[i] * 0.022, p = E.outExpo(clamp((t - d) / 0.6));
      const xo = E.inCubic(clamp((t - (7.45 + i * 0.012)) / 0.42));
      tf(c, { s: lerp(2.4, 1, p) + 0.08 * xo, y: -60 * xo, o: clamp(p * 1.6) * (1 - xo), b: lerp(16, 0, p) + 10 * xo });
    });
    this.l2.chars.forEach((c, i) => {
      const d = 5.56 + i * 0.034, s = S(t, d, 0.55, 0.7);
      const xo = E.inCubic(clamp((t - (7.5 + i * 0.012)) / 0.42));
      tf(c, { y: (1 - s) * 120 - 60 * xo, o: clamp((t - d) / 0.14) * (1 - xo), b: Math.max(0, 1 - s) * 6 + 10 * xo, r: (1 - s) * 6 });
    });
    // the banner drops in from the top edge (iOS), lights up as it lands, and is swiped back up
    const dr = S(t, 5.9, 0.5, 0.74), up = E.inCubic(inv(7.28, 7.62, t));
    tf(this.note.el, { x: this.NX, y: lerp(-190, this.NY, dr) - 330 * up, s: lerp(0.96, 1, clamp(dr)), o: clamp((t - 5.9) / 0.1) * (1 - inv(0.6, 1, up)) });
    Glass.illum(this.note, t > 5.98 ? 0.85 * Math.exp(-(t - 5.98) * 3.2) : 0, 14, 50);
    const gl = env(t, 5.45, 7.9, 0.5, 0.5);
    tf(this.glow, { x: 960 - 600, y: 672 - 210, o: gl * 0.62, sx: lerp(0.4, 1, gl) });
  },
  cam(t) { const p = E.inOutSine(inv(4, 8, t)); return { x: 0, y: lerp(0, -10, p), s: 1.0 + 0.045 * p, r: 0 }; },
});

// ================================================================= 3 · LOGO (8 – 10)
// The mark draws itself; the wordmark is revealed left to right with a periwinkle hot edge; the tagline follows.
scene({
  name: "logo", t0: 7.95, t1: 10.15,
  build() {
    const S = 900 / 394.81, left = 960 - 450, top = 500 - (135.94 * S) / 2;
    REF.logo = { S, left, top };
    this.wrap = el("div", "abs", this.root);
    this.wrap.innerHTML = LOGO_SVG("lg-main");
    css(this.wrap.firstElementChild, { width: "900px", height: (135.94 * S) + "px", overflow: "visible" });
    tf(this.wrap, { x: left, y: top });
    this.marks = [...this.wrap.querySelectorAll(".mk")];
    this.lens = this.marks.map((p) => p.getTotalLength());
    this.marks.forEach((p, i) => { p.style.strokeDasharray = this.lens[i]; });
    this.clip = this.wrap.querySelector("#lg-main-clip rect");
    this.glint = this.wrap.querySelector("#lg-main-gl");
    this.markG = this.wrap.querySelector(".mark");
    this.tag = textLine(this.root, [["", "The commission platform for teams where pay gets complicated.", "font:500 38px Inter;color:rgba(235,238,255,.76);letter-spacing:-.01em"]], 960, 722);
    this.tagWords = wordsOf(this.tag);
    cue(8.0, "impact", { v: 0.55 }); cue(8.0, "draw", { d: 0.8 }); cue(8.3, "glassSlide", { d: 0.75, v: 0.6 }); cue(9.05, "pop", { v: 0.5 }); cue(9.55, "whoosh", { d: 0.5, v: 0.45 });
  },
  update(t) {
    this.marks.forEach((p, i) => { const q = E.inOutCubic(clamp((t - 8.0 - i * 0.07) / 0.75)); p.style.strokeDashoffset = (this.lens[i] * (1 - q)).toFixed(2); });
    const rv = E.inOutCubic(inv(8.28, 9.05, t)), edge = 105 + 290 * rv + 90 * E.inQuad(inv(8.95, 9.3, t));   // hot edge rides the reveal, then slides off
    this.clip.setAttribute("width", (5 + 290 * rv).toFixed(2));
    this.glint.setAttribute("x1", (edge - 70).toFixed(2)); this.glint.setAttribute("x2", edge.toFixed(2));
    const glow = 6 + 10 * env(t, 8.0, 9.6, 0.4, 0.6);
    this.markG.style.filter = `drop-shadow(0 0 ${glow.toFixed(1)}px rgba(96,120,236,.9))`;
    const xo = E.inCubic(inv(9.55, 10.1, t));
    tf(this.wrap, { x: REF.logo.left, y: REF.logo.top - 20 * xo, s: 1 + 0.5 * E.inQuad(xo), o: 1 - xo, b: 14 * xo });   // flies into the camera
    this.tagWords.forEach((w, i) => { const p = E.outCubic(clamp((t - 9.0 - i * 0.035) / 0.42)); tf(w, { y: (1 - p) * 24 - 20 * xo, o: p * (1 - xo), b: (1 - p) * 4 }); });
  },
  cam(t) { const p = E.outCubic(inv(8, 10, t)); return { x: 0, y: 0, s: lerp(1.04, 1.0, p), r: lerp(0.6, 0, p) }; },
});

// the official logo (02_Brand_Assets/logo/sequifi-logo-white-text.svg, loaded at boot into LOGO_PATHS), with a clip
// for the wordmark reveal and a gradient-filled copy of the wordmark for the moving hot edge / sheen
const LOGO_PATHS = { mark: [], word: [] };
async function loadLogo() {
  const txt = await (await fetch("/02_Brand_Assets/logo/sequifi-logo-white-text.svg")).text();
  const doc = new DOMParser().parseFromString(txt, "image/svg+xml");
  for (const p of doc.querySelectorAll("path")) (p.getAttribute("class") === "cls-1" ? LOGO_PATHS.mark : LOGO_PATHS.word).push(p.getAttribute("d"));
}
function LOGO_SVG(id) {
  const word = LOGO_PATHS.word.map((d) => `<path d="${d}"/>`).join("");
  return `<svg viewBox="0 0 394.81 135.94" xmlns="http://www.w3.org/2000/svg">
  <defs><clipPath id="${id}-clip"><rect x="100" y="-20" width="0" height="180"/></clipPath>
  <linearGradient id="${id}-gl" gradientUnits="userSpaceOnUse" x1="-200" y1="0" x2="-140" y2="0"><stop offset="0" stop-color="#A9B6FF" stop-opacity="0"/><stop offset=".8" stop-color="#9AAAFF" stop-opacity=".95"/><stop offset="1" stop-color="#C8D1FF" stop-opacity="1"/></linearGradient>
  <linearGradient id="${id}-sh" gradientUnits="userSpaceOnUse" x1="-200" y1="0" x2="-80" y2="0"><stop offset="0" stop-color="#B4C0FF" stop-opacity="0"/><stop offset=".5" stop-color="#9DADFF" stop-opacity=".9"/><stop offset="1" stop-color="#B4C0FF" stop-opacity="0"/></linearGradient></defs>
  <g class="mark" fill="none" stroke="#6078ec" stroke-linecap="round" stroke-linejoin="round" stroke-width="5.23">${LOGO_PATHS.mark.map((d) => `<path class="mk" d="${d}"/>`).join("")}</g>
  <g class="word" fill="#ffffff" clip-path="url(#${id}-clip)">${word}</g>
  <g class="glint" fill="url(#${id}-gl)" clip-path="url(#${id}-clip)">${word}</g>
  <g class="sheen" fill="url(#${id}-sh)">${word}</g></svg>`;
}
