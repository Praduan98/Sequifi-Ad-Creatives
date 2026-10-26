// Scenes 1–3: the deal (the spark is born) → the rules pile up → the back office at night.
"use strict";

const SPARK_LAND = 36;   // spark centre sits this far above a surface it lands on

// ================================================================ 1 · EVERY PAYCHECK STARTS WITH A DEAL (0 – 3.95)
const DEAL = scene({
  name: "deal", t0: 0, t1: 3.95,
  fast: [[2.1, 2.6], [3.35, 4.1]],
  build() {
    const r = this.root;
    this.line = kline(r, [
      { t: "Every", b: true, col: "#B9C4FF", at: 0.18, fx: "pop" },
      { t: "paycheck", at: 0.42, fx: "type" }, { t: "starts", at: 0.68, fx: "type" }, { t: "with", at: 0.86, fx: "type" }, { t: "a", at: 0.98, fx: "type" },
    ], { x: 0, y: 470, size: 88, align: "left" });
    const html = `${icon("check", 38, 2.8)}<span>deal</span>`;
    this.pg = pill(r, html, "ghost"); this.po = pill(r, html, "on");
    const pw = this.pg.offsetWidth, gap = 24, x0 = 960 - (this.line.w + gap + pw) / 2;
    klMove(this.line, x0);
    this.PX = x0 + this.line.w + gap; this.PW = pw; this.PY = 470 - this.pg.offsetHeight / 2;
    this.pc = [this.PX + pw / 2, 470];
    cue(0.18, "pop", { v: 0.5 }); this.line.words.slice(1).forEach((w, i) => cue(w.at, "tick", { v: 0.3, pan: -0.3 + i * 0.15 }));
    cue(1.12, "glass", { v: 0.45, pan: 0.3 }); cue(1.5, "whoosh", { d: 0.5, v: 0.22, pan: 0.6 }); cue(2.1, "click", { v: 0.85, pan: 0.25 });
    cue(2.14, "bell", { v: 0.7 }); cue(2.2, "whoosh", { d: 0.4, v: 0.3 }); cue(2.55, "pop", { v: 0.4 });
    cue(3.4, "whoosh", { d: 0.45, v: 0.35, pan: -0.3 }); cue(3.62, "whoosh", { d: 0.4, v: 0.3, pan: -0.6 });
  },
  update(t) {
    klUpdate(this.line, t, { at: 3.4, fx: "fall" });
    const gin = E.outCubic(inv(1.1, 1.26, t)), on = t >= 2.1, b = S(t, 2.1, 0.34, 0.5), fall = E.inQuad(inv(3.46, 3.8, t));
    tf(this.pg, { x: this.PX, y: this.PY + 900 * fall * fall, s: lerp(0.9, 1, gin), o: gin * (on ? 0 : 1), r: 18 * fall });
    tf(this.po, { x: this.PX, y: this.PY + 160 * fall + 600 * fall * fall, s: on ? lerp(0.82, 1, clamp(b, 0, 1.2)) * (1 - 0.06 * clamp((t - 2.02) / 0.08) * (1 - clamp((t - 2.1) / 0.08))) : 1, o: on ? 1 - fall : 0, r: 22 * fall });
  },
  cursor(t) {
    if (t < 1.45 || t > 2.75) return null;
    const [px, py] = this.pc, a = E.inOutCubic(inv(1.45, 2.0, t)), away = E.inCubic(inv(2.28, 2.7, t));
    return { x: lerp(1580, px + 26, a) + 260 * away, y: lerp(930, py + 14, a) + 300 * away, o: clamp((t - 1.45) / 0.12) * (1 - away),
      press: Math.sin(clamp((t - 2.02) / 0.18) * Math.PI), click: t - 2.1 };
  },
  // the spark is born out of the pill, hops up and hovers until the first rule lands on the drop
  floatAt(t) { return [1180 + 12 * Math.sin((t - 2.55) * 2.6), 300 + 10 * Math.sin((t - 2.55) * 4)]; },
  spark(t) {
    if (t < 2.14 || t >= 3.6) return null;
    const born = S(t, 2.14, 0.32, 0.5), [px, py] = this.pc;
    const [x, y] = t < 2.2 ? [px, py - 20 * (t - 2.14) / 0.06] : t < 2.55 ? hop(t, 2.2, 2.55, [px, py - 20], [1180, 300], 120, E.outSine) : this.floatAt(t);
    return { x, y, s: clamp(born, 0, 1.3), o: 1, glow: 1 - 0.4 * clamp((t - 2.3) / 0.4), sq: squash(t, 2.55, 0.25), r: 360 * E.inOutCubic(inv(2.2, 2.8, t)) };
  },
  cam(t) { return { x: 0, y: 0, s: 1 + 0.03 * E.inOutSine(inv(0, 3.9, t)), r: 0 }; },
});

// ================================================================ 2 · THE RULES PILE UP (4 – 8.7)
const RULES = [["Tiers", "chart"], ["Splits", "team"], ["Overrides", "manage"], ["Clawbacks", "history"]];
const TILE = 290, TH = TILE / 2;
scene({
  name: "rules", t0: 3.95, t1: 8.7,
  fast: [[3.55, 4.1], [7.9, 8.7]],
  build() {
    this.tiles = RULES.map(([n, ic], i) => ({ el: tile(this.root, n, ic), at: 4.0 + i * 0.5, x: 465 + i * 330, y: 480, r: [-8, 5, -4, 7][i] }));
    this.tiles.forEach((tl) => { tl.label = tl.el.querySelector("span"); tl.ico = tl.el.querySelector(".ico"); });
    this.pile = [[1290, 480, -13], [1336, 456, -5], [1382, 432, 3], [1428, 408, 11]];   // a loose fan, Clawbacks on top
    this.text = kline(this.root, [
      { t: "Every", at: 5.95, fx: "type" }, { t: "paycheck", at: 6.1, fx: "type" }, { t: "is", at: 6.36, fx: "type" },
      { t: "different.", b: true, col: "#B9C4FF", at: 6.58, fx: "pop", sel: { at: 6.76 } },
    ], { x: 150, y: 860, size: 96, align: "left" });
    this.diff = this.text.words[3];
    this.tiles.forEach((tl, i) => { cue(tl.at, i ? "hit" : "impact", { v: i ? 0.55 : 0.65, pan: -0.5 + i * 0.33 }); cue(tl.at + 0.02, "glass", { v: 0.5, pan: -0.5 + i * 0.33 }); });
    cue(6.0, "whoosh", { d: 0.5, v: 0.45, pan: 0.5 }); this.text.words.slice(0, 3).forEach((w) => cue(w.at, "tick", { v: 0.25 })); cue(6.58, "pop", { v: 0.55 });
    [6.76, 6.83, 6.9, 6.97].forEach((t) => cue(t, "tick", { v: 0.35, pan: -0.2 })); cue(7.2, "pop", { v: 0.4 });
    cue(7.95, "whoosh", { d: 0.3, v: 0.45, pan: -0.7 }); cue(8.19, "whoosh", { d: 0.6, v: 0.85, pan: 0 });
  },
  tileTop(i, t) {
    const tl = this.tiles[i], pl = S(t, 6.0 + i * 0.06, 0.5, 0.62), [px, py, pr] = this.pile[i];
    return { x: lerp(tl.x, px, clamp(pl, 0, 1.1)), y: lerp(tl.y, py, clamp(pl, 0, 1.1)), r: lerp(tl.r, pr, clamp(pl, 0, 1.1)) };
  },
  update(t) {
    const out = E.inCubic(inv(8.15, 8.6, t));
    this.tiles.forEach((tl, i) => {
      const s = S(t, tl.at, 0.42, 0.6), p = this.tileTop(i, t);
      const hit = t >= tl.at ? Math.exp(-(t - tl.at) * 4) : 0;
      tl.el.style.setProperty("--e", clamp(hit + 0.15).toFixed(3));
      // buried tiles go quiet so their labels don't stack into each other
      const pl = clamp(S(t, 6.0 + i * 0.06, 0.5, 0.62)), bury = i < 3 ? 1 - 0.9 * pl : 1;
      tl.label.style.opacity = bury.toFixed(3); tl.ico.style.opacity = (0.15 + 0.85 * bury).toFixed(3);
      tl.el.style.setProperty("--solid", pl.toFixed(3));   // cards turn solid as they land, so the pile hides what's beneath
      tf(tl.el, { x: p.x - TH + 900 * out, y: p.y - TH - 120 * out, s: t >= tl.at ? lerp(1.45, 1, clamp(s, 0, 1.15)) : 1.45, r: p.r + (1 - clamp(s)) * (i % 2 ? 18 : -18) + 30 * out, o: clamp((t - tl.at) / 0.08) * (1 - out) });
    });
    klUpdate(this.text, t, { at: 8.18, fx: "fall" });
  },
  spark(t) {
    if (t < 3.6 || t >= 8.23) return null;
    const top = (i, tt) => { const p = this.tileTop(i, tt); return [p.x, p.y - TH - SPARK_LAND]; };
    let x, y, sq = 0;
    if (t < 4.0) [x, y] = hop(t, 3.6, 4.0, DEAL.floatAt(3.6), top(0, 4.0), 90, E.inQuad);
    else if (t < 5.5) { const k = Math.floor((t - 4.0) / 0.5), t0 = 4.0 + k * 0.5; [x, y] = hop(t, t0, t0 + 0.5, top(k, t0), top(k + 1, t0 + 0.5), 150); sq = squash(t, t0, 0.3); }
    else if (t < 6.95) { [x, y] = top(3, t); sq = squash(t, 5.5, 0.3); }
    else if (t < 7.2) { const d = this.diff; [x, y] = hop(t, 6.95, 7.2, top(3, 6.95), [d.right + 0.2 * 96, d.bot - 6 - SPARK_LAND * 0.6], 160); }
    else if (t < 7.95) { const d = this.diff; x = d.right + 0.2 * 96; y = d.bot - 6 - SPARK_LAND * 0.6; sq = squash(t, 7.2, 0.3); }
    else { const d = this.diff; [x, y] = hop(t, 7.95, 8.21, [d.right + 0.2 * 96, d.bot - 6 - SPARK_LAND * 0.6], [-90, 540], 220, E.inQuad); }
    return { x, y, s: 0.85, o: 1, glow: 0.7, sq, r: t > 7.95 ? -200 * inv(7.95, 8.21, t) : 0 };
  },
  cam(t) { return { x: -12 * E.inOutSine(inv(4, 8.1, t)), y: 0, s: 1.02 - 0.02 * E.inOutSine(inv(4, 8.1, t)), r: 0 }; },
});

// ================================================================ 3 · THE BACK OFFICE AT NIGHT (scene clock 7.55 – 12.5, film +0.6)
const NIGHT = scene({
  name: "night", t0: 7.55, t1: 12.52, dt: 0.6, wipe: [11.75, 12.45],
  fast: [[7.55, 8.15], [10.8, 12.5]],
  build() {
    const r = this.root;
    this.ph = el("div", "photo", r); css(this.ph, { width: "1920px", height: "1080px" });
    this.ph.innerHTML = `<img src="../assets/photos/story_night_office.jpg">`;
    this.img = this.ph.firstElementChild;
    this.shade = el("div", "abs", this.ph); css(this.shade, { width: "1920px", height: "1080px", background: "linear-gradient(90deg, rgba(5,8,23,.94) 0%, rgba(5,8,23,.84) 38%, rgba(5,8,23,.32) 62%, rgba(5,8,23,.1) 76%, rgba(5,8,23,.25) 100%)" });
    this.dots = el("div", "dots", this.ph); css(this.dots, { left: "720px", top: "150px", width: "560px", height: "380px" });
    this.lines = [
      [{ t: "Spreadsheets", at: 8.3, fx: "type" }, { t: "no", at: 8.71, fx: "type" }, { t: "one", at: 8.8, fx: "type" }, { t: "trusts.", at: 8.92, fx: "type" }],
      [{ t: "Comp", at: 9.2, fx: "type" }, { t: "disputes.", at: 9.36, fx: "type" }],
      [{ t: "Friday-night", at: 9.7, fx: "type" }, { t: "reconciliation.", b: true, at: 10.1, fx: "pop", hl: { at: 10.18 } }],
    ].map((tk, i) => kline(r, tk, { x: 130, y: 400 + i * 114, size: 78, align: "left" }));
    // strike-throughs: the spark crosses each pain out
    this.strikes = this.lines.map((L, i) => { const s = el("div", "abs", r); css(s, { left: L.x - 8 + "px", top: L.y + L.h * 0.55 - 4 + "px", width: L.w + 16 + "px", height: "9px", borderRadius: "5px", transformOrigin: i % 2 ? "100% 50%" : "0 50%",
      background: "linear-gradient(90deg, #8597F4, #B9C4FF)", boxShadow: "0 0 18px rgba(143,160,245,.9)" }); return s; });
    this.SX = [10.96, 11.16, 11.36];   // strike i runs 0.15 s, zig-zagging left→right, right→left, left→right
    this.lines.forEach((L) => L.words.forEach((w) => w.fx === "type" && [...w.t].forEach((_, i) => i % 3 === 0 && cue(w.at + i * 0.032, "tick", { v: 0.18, pan: -0.5 }))));
    cue(10.1, "pop", { v: 0.5 }); cue(10.18, "glassSlide", { d: 0.26, v: 0.35 }); cue(10.8, "whoosh", { d: 0.35, v: 0.5, pan: 0.7 }); this.SX.forEach((t, i) => cue(t, "scratch", { v: 0.7, pan: -0.4 + i * 0.1 }));
    cue(11.52, "whoosh", { d: 0.3, v: 0.4 }); cue(11.72, "swell", { d: 0.7, v: 0.9 }); cue(11.76, "glass", { v: 0.8 });
  },
  update(t) {
    // the photo is revealed behind the spark's sweep, slowly pushes in, and is cut away by the light wipe
    const rev = t < 8.1 ? clamp((this.sweepX(t) + 60) / 1980) : 1;
    const R = 2300 * E.inOutCubic(inv(this.wipe[0], this.wipe[1], t));
    this.ph.style.clipPath = t < 8.1 ? `inset(0px ${(1920 * (1 - rev)).toFixed(1)}px 0px 0px)` :
      R > 1 ? `path(evenodd, "M0 0H1920V1080H0Z M${(960 - R).toFixed(1)} 540a${R.toFixed(1)} ${R.toFixed(1)} 0 1 0 ${(2 * R).toFixed(1)} 0a${R.toFixed(1)} ${R.toFixed(1)} 0 1 0 ${(-2 * R).toFixed(1)} 0Z")` : "none";
    const kb = inv(7.6, 12.5, t);
    this.img.style.transform = `scale(${(1.04 + 0.08 * kb).toFixed(4)}) translateX(${(-14 * kb).toFixed(2)}px)`;
    this.ph.style.visibility = t >= 7.58 ? "visible" : "hidden";
    this.dots.style.opacity = (0.35 * E.outCubic(inv(8.5, 9.0, t)) * (1 - inv(11.4, 11.75, t))).toFixed(3);
    const fadeAll = E.inCubic(inv(11.4, 11.72, t));
    this.lines.forEach((L, i) => klUpdate(L, t, { at: 11.4, fx: "fade", dur: 0.32, step: 0.02 }));
    this.strikes.forEach((s, i) => { const p = E.inOutCubic(inv(this.SX[i], this.SX[i] + 0.15, t)); s.style.transform = `scaleX(${p.toFixed(4)})`; s.style.opacity = (p > 0 ? 1 - fadeAll : 0).toFixed(3); });
  },
  sweepX(t) { return lerp(-90, 2010, E.inOutSine(inv(7.6, 8.1, t))); },
  spark(t) {
    if (t < 7.6 || t >= 12.5) return null;
    if (t < 8.1) return { x: this.sweepX(t), y: 540 - 30 * Math.sin(inv(7.6, 8.1, t) * Math.PI), s: 0.9, o: 1, glow: 1, r: 0 };
    if (t < 10.82) return null;
    // swoop in, cross each pain out (zig-zag), then centre and open the light
    const L = this.lines, yy = (i) => L[i].y + L[i].h * 0.55 - SPARK_LAND * 0.2;
    const from = (i) => (i % 2 ? L[i].x + L[i].w + 8 : L[i].x - 8), to = (i) => (i % 2 ? L[i].x - 8 : L[i].x + L[i].w + 8);
    let x, y;
    if (t < 10.96) [x, y] = hop(t, 10.82, 10.96, [1500, 120], [from(0), yy(0)], 0, E.inQuad);
    else if (t >= 11.51) [x, y] = hop(t, 11.51, 11.72, [to(2), yy(2)], [960, 540], 120);
    else {
      const i = t < this.SX[1] ? 0 : t < this.SX[2] ? 1 : 2, a = this.SX[i];
      if (t < a + 0.15) [x, y] = [lerp(from(i), to(i), E.inOutCubic(inv(a, a + 0.15, t))), yy(i)];
      else [x, y] = hop(t, a + 0.15, this.SX[i + 1], [to(i), yy(i)], [from(i + 1), yy(i + 1)], 30);
    }
    const pulse = t > 11.72 ? 1 + 0.5 * Math.sin(clamp((t - 11.72) / 0.3) * Math.PI) : 1;
    return { x, y, s: 0.9 * pulse * (1 - E.inQuad(inv(12.1, 12.45, t))), o: 1, glow: 1, r: 0 };
  },
  cam(t) { return { x: 0, y: 0, s: 1, r: 0 }; },
});
