// Scenes 4–8: PAID RIGHT. → every trade (ribbon) → every rep (photo) → the dashboard → not just commissions.
"use strict";

// cut a circular wipe's hole out of a scene, so it disappears exactly where the background flips palette
function wipeCut(e, t, t0, t1, cx, cy) {
  const R = 2300 * E.inOutCubic(inv(t0, t1, t));
  e.style.clipPath = t >= t0 && R > 0.5 ? `path(evenodd, "M-400 -400H2320V1480H-400Z M${(cx - R).toFixed(1)} ${cy}a${R.toFixed(1)} ${R.toFixed(1)} 0 1 0 ${(2 * R).toFixed(1)} 0a${R.toFixed(1)} ${R.toFixed(1)} 0 1 0 ${(-2 * R).toFixed(1)} 0Z")` : "none";
}

// where a point on a CSS-3D plane lands on screen. st = the plane's tf state {p, x, y, rx, r, s};
// the plane is PW × PH at left/top 0 with transform-origin at its centre (replicates perspective · translate · rotateX · rotate · scale)
function project(st, PW, PH, px, py) {
  const a = (st.r * Math.PI) / 180, b = (st.rx * Math.PI) / 180;
  const x = (px - PW / 2) * st.s, y = (py - PH / 2) * st.s;
  const x2 = x * Math.cos(a) - y * Math.sin(a), y2 = x * Math.sin(a) + y * Math.cos(a);
  const y3 = y2 * Math.cos(b), z3 = y2 * Math.sin(b), w = 1 - z3 / st.p;
  return [(x2 + st.x) / w + PW / 2, (y3 + st.y) / w + PH / 2];
}

// ================================================================ 4 · COMPLEX COMP. PAID RIGHT. (scene clock 12 – 16.2, film +1.0)
const PAID = scene({
  name: "paid", t0: 11.95, t1: 16.2, dt: 1.0,
  fast: [[15.55, 16.2]],
  build() {
    const r = this.root;
    this.cc = kline(r, [{ t: "Complex", b: true, col: "#4A5BD0", at: 12.12, fx: "pop" }, { t: "comp.", at: 12.36, fx: "type" }],
      { x: 960, y: 540, size: 136, align: "center", color: "#0D1020" });
    this.st = ostack(r, "Paid right.", 7, { solid: 3, size: 188, lh: 0.94 });
    // where the period of the solid line sits (the spark lands on it): its centre x and the baseline
    // the spark takes the place of the solid line's period: measure the period and the baseline
    const sl = this.st.lines[3];
    sl.innerHTML = `Paid right<span style="display:inline-block;transform-origin:50% 85%">.</span>`;
    this.pd = sl.lastElementChild;
    const lr = sl.getBoundingClientRect(), rr = this.pd.getBoundingClientRect();
    const probe = el("span", "", sl); css(probe, { display: "inline-block", width: "0px", height: "0px", verticalAlign: "baseline" });
    this.dot = { dx: rr.left - lr.left + rr.width / 2, base: probe.getBoundingClientRect().top - lr.top };
    probe.remove();
    cue(12.12, "pop", { v: 0.55 }); cue(12.36, "tick", { v: 0.3 }); cue(12.46, "tick", { v: 0.25 });
    cue(13.34, "whoosh", { d: 0.45, v: 0.55 }); this.st.lines.forEach((_, i) => cue(13.45 + i * 0.045, "tick", { v: 0.22, pan: -0.6 + i * 0.2 }));
    cue(13.6, "hit", { v: 0.7 });
    cue(14.4, "whoosh", { d: 0.3, v: 0.3, pan: 0.5 }); cue(14.7, "pop", { v: 0.6 }); cue(14.7, "pluck", { v: 0.7, n: 2 }); cue(14.72, "glass", { v: 0.6 });
    cue(15.6, "whoosh", { d: 0.45, v: 0.55, pan: -0.4 }); cue(15.66, "whoosh", { d: 0.4, v: 0.45, pan: 0.6 });
  },
  lineX(i, t) {
    const d = (3 - Math.abs(i - 3)) * 0.04;   // the solid line leaves last
    return 960 - this.st.w / 2 + (i % 2 ? -1 : 1) * 2400 * E.inCubic(inv(15.6 + d, 16.02 + d, t));
  },
  lineY(i, t) {
    const arrive = 1 - clamp(S(t, 13.36 + i * 0.045, 0.6, 0.78), -0.2, 1.2);
    return 540 - this.st.lh / 2 + (i - 3) * this.st.lh + 820 * arrive - 30 * Math.max(0, t - 13.5);
  },
  dotPos(t) { return [this.lineX(3, t) + this.dot.dx + 4, this.lineY(3, t) + this.dot.base - 31]; },
  update(t) {
    klUpdate(this.cc, t, { at: 13.34, fx: "up", dur: 0.3, step: 0.03 });
    const land = t >= 14.7 ? Math.exp(-(t - 14.7) * 6) * Math.cos((t - 14.7) * 18) : 0;
    this.st.lines.forEach((ln, i) => {
      const wave = t >= 14.7 + Math.abs(i - 3) * 0.04 ? 0.035 * Math.exp(-(t - 14.7 - Math.abs(i - 3) * 0.04) * 6) : 0;
      tf(ln, { x: this.lineX(i, t), y: this.lineY(i, t), s: i === 3 ? 1 + 0.04 * land : 1 + wave, o: t >= 13.36 + i * 0.045 ? 1 : 0 });
    });
    // the period gives way to the spark while it sits there, and pops back when it leaves
    const gone = E.inBack(inv(14.62, 14.72, t)) * (1 - clamp(S(t, 15.64, 0.35, 0.5), 0, 1.3));
    this.pd.style.transform = `scale(${Math.max(0, 1 - gone).toFixed(4)})`;
  },
  spark(t) {
    if (t < 12.1 || t >= 16.06) return null;
    const float = (tt) => [1560 + 14 * Math.sin((tt - 12.5) * 2.6), 250 + 12 * Math.sin((tt - 12.5) * 4.1)];
    let x, y, sq = 0, s = 0.85;
    if (t < 12.5) { [x, y] = hop(t, 12.1, 12.5, [960, 540], [1560, 250], 150, E.outSine); s *= clamp(S(t, 12.1, 0.35, 0.55), 0, 1.3); }
    else if (t < 14.4) [x, y] = float(t);
    else if (t < 14.7) { [x, y] = hop(t, 14.4, 14.7, float(14.4), this.dotPos(14.7), 130); s = lerp(0.85, 0.74, inv(14.4, 14.7, t)); }
    else if (t < 15.62) { [x, y] = this.dotPos(t); sq = squash(t, 14.7, 0.35); s = 0.74; }
    else { [x, y] = hop(t, 15.62, 16.06, this.dotPos(15.62), [-180, 1180], 240, E.inQuad); s = lerp(0.74, 0.85, inv(15.62, 15.8, t)); }
    return { x, y, s, o: 1, glow: 0.8, sq, r: t > 15.62 ? -160 * inv(15.62, 16.06, t) : 0 };
  },
  cam(t) { return { x: 0, y: 0, s: 1.04 - 0.04 * E.outCubic(inv(12.0, 13.9, t)) + 0.015 * E.inOutSine(inv(13.9, 15.6, t)), r: 0 }; },
});

// ================================================================ 5 · EVERY TRADE PAYS DIFFERENTLY (scene clock 15.75 – 19.7, film +1.2)
const TRADES = ALL_INDUSTRIES.map(([n]) => n);
const TRD = scene({
  name: "trades", t0: 15.75, t1: 19.7, dt: 1.2,
  fast: [[15.8, 16.75], [17.25, 17.9]],
  build() {
    const r = this.root;
    // giant outline industry names drifting in two rows, behind everything
    this.rows = [TRADES, TRADES.slice(6).concat(TRADES.slice(0, 6))].map((list) => { const d = el("div", "ow", r, list.join("&nbsp;&nbsp;&nbsp;")); d.style.fontSize = "196px"; return d; });
    this.rowH = this.rows[0].offsetHeight; this.rowW = this.rows[1].offsetWidth;
    // the ribbon: the spark draws it in, then every industry rides along it
    const txt = (TRADES.join("   ·   ") + "   ·   ").repeat(2);
    this.R = ribbon(r, "M-180,960 C240,1010 420,640 820,650 S1300,900 1660,640 S1960,280 2120,230", { width: 124, colors: ["#4A5BD0", "#6078EC", "#2BB594"], segs: 280, text: txt, textSize: 46 });
    this.dd = [1, 2, 3, 4].map((i) => { const d = doodle(r, i, 120); d.style.boxShadow = "0 0 0 6px #fff, 0 18px 30px -12px rgba(38,48,120,.45)"; return d; });
    this.hd = kline(r, [
      { t: "Every", b: true, col: "#4A5BD0", at: 16.72, fx: "pop" }, { t: "trade", at: 16.9, fx: "type" }, { t: "pays", at: 17.08, fx: "type" },
      { t: "differently.", b: true, at: 17.26, fx: "type", hl: { at: 17.58, ink: "#FFFFFF" } },
    ], { x: 150, y: 214, size: 100, align: "left", color: "#0D1020" });
    this.w = this.hd.words[3];
    cue(15.9, "whoosh", { d: 0.8, v: 0.6, pan: -0.6 }); cue(15.95, "glassSlide", { d: 0.7, v: 0.6 });
    this.dd.forEach((_, i) => cue(16.7 + i * 0.12, "pop", { v: 0.4, pan: -0.5 + i * 0.3 }));
    cue(16.72, "pop", { v: 0.5 }); [16.9, 17.08, 17.26, 17.4].forEach((t) => cue(t, "tick", { v: 0.28 }));
    cue(17.3, "whoosh", { d: 0.3, v: 0.4, pan: 0.7 }); cue(17.58, "glassSlide", { d: 0.3, v: 0.5 }); cue(17.6, "glass", { v: 0.5 });
    cue(18.2, "pop", { v: 0.45 }); cue(18.9, "whoosh", { d: 0.45, v: 0.5 });
  },
  head(t) { return E.inOutSine(inv(15.9, 16.66, t)); },
  // a point riding on the ribbon, lifted off it along the normal
  ride(u, lift) {
    const p = ribbonPoint(this.R, u), a = ribbonPoint(this.R, u - 0.004), b = ribbonPoint(this.R, u + 0.004);
    let nx = b.y - a.y, ny = -(b.x - a.x); const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (ny > 0) { nx = -nx; ny = -ny; }
    return [p.x + nx * lift, p.y + ny * lift];
  },
  restPos(t) { const w = this.w; return [w.right - 40 + 6 * Math.sin((t - 18.2) * 3), w.top - SPARK_LAND + 18]; },
  update(t) {
    const rowsIn = E.outCubic(inv(15.85, 16.4, t)) * (1 - inv(18.95, 19.4, t));
    tf(this.rows[0], { x: -260 - 230 * (t - 15.8), y: 420 - this.rowH / 2, o: rowsIn });
    tf(this.rows[1], { x: 1920 - this.rowW + 600 + 230 * (t - 15.8), y: 700 - this.rowH / 2, o: rowsIn });
    ribbonUpdate(this.R, this.head(t), E.inCubic(inv(18.9, 19.45, t)), 40 - 230 * (t - 16.0), E.outCubic(inv(16.5, 16.85, t)) * (1 - inv(18.9, 19.1, t)));
    this.dd.forEach((d, i) => {
      const s = clamp(S(t, 16.7 + i * 0.12, 0.42, 0.55), 0, 1.3) * (1 - E.inBack(inv(18.85 + i * 0.04, 19.1 + i * 0.04, t)));
      const [x, y] = this.ride(0.12 + 0.235 * i + 0.032 * (t - 16.6), 116 + 6 * Math.sin(t * 5 + i * 1.7));
      tf(d, { x: x - 60, y: y - 60, s, o: s > 0.01 ? 1 : 0, r: 8 * Math.sin(t * 3 + i) });
    });
    klUpdate(this.hd, t, { at: 19.02, fx: "fall" });
  },
  spark(t) {
    if (t < 15.86 || t >= 18.95 || (t >= 16.66 && t < 17.3)) return null;
    if (t < 16.66) { const p = ribbonPoint(this.R, this.head(t)); return { x: p.x, y: p.y, s: 0.95, o: 1, glow: 1, trail: 0.6 }; }
    const w = this.w, em = this.hd.size, L = w.left - 0.16 * em, Rt = w.right + 0.16 * em, cy = w.cy + 4;
    let x, y, sq = 0;
    if (t < 17.58) [x, y] = hop(t, 17.3, 17.58, [2060, -80], [L, cy], -40, E.inQuad);
    else if (t < 17.84) [x, y] = [lerp(L, Rt, E.outCubic(inv(17.58, 17.84, t))), cy];
    else if (t < 18.2) [x, y] = hop(t, 17.84, 18.2, [Rt, cy], this.restPos(18.2), 110);
    else { [x, y] = this.restPos(t); sq = squash(t, 18.2, 0.3); }
    return { x, y, s: 0.8, o: 1, glow: 0.8, sq };
  },
  cam(t) { return { x: 20 * E.inOutSine(inv(15.8, 19.4, t)), y: 0, s: 1.0 + 0.03 * E.inOutSine(inv(15.8, 19.4, t)), r: 0 }; },
});

// ================================================================ 6 · EVERY REP SEES HOW THEIR PAY WAS BUILT (scene clock 19.3 – 23.8, film +0.8)
const REP = scene({
  name: "rep", t0: 19.3, t1: 23.8, dt: 0.8, wipe: [23.05, 23.75],
  fast: [[19.3, 19.8], [22.65, 23.8]],
  build() {
    const r = this.root;
    const FX = 1020, FY = 150, FW = 720, FH = 820;
    Object.assign(this, { FX, FY, FW, FH });
    this.fr = el("div", "photo", r);
    css(this.fr, { width: FW + "px", height: FH + "px", borderRadius: "60px", cornerShape: "squircle", boxShadow: "0 50px 90px -40px rgba(38,48,120,.6)" });
    this.fr.innerHTML = `<img src="../assets/photos/story_rep_daylight.jpg" style="object-position:40% 30%"><div class="abs" style="width:100%;height:100%;border-radius:60px;box-shadow:inset 0 0 0 6px rgba(255,255,255,.8)"></div>`;
    this.img = this.fr.firstElementChild;
    tf(this.fr, { x: FX, y: FY });
    // ribbon across the photo carrying how the payout was built
    const txt = (PAYOUT.rows.map(([k]) => k).join("   ·   ") + "   ·   ").repeat(3);
    this.R = ribbon(r, "M700,1180 C960,1000 1240,880 1480,840 S1840,700 2120,560", { width: 100, colors: ["#4A5BD0", "#6078EC", "#2BB594"], segs: 200, text: txt, textSize: 38 });
    // the payout it adds up to
    this.card = el("div", "abs", r);
    css(this.card, { width: "560px", height: "214px", borderRadius: "34px", cornerShape: "squircle", background: "#fff", boxShadow: "0 30px 60px -24px rgba(38,48,120,.45), inset 0 0 0 1px rgba(74,91,208,.08)", fontFamily: "Inter", color: "#0D1020" });
    this.card.innerHTML = `<div class="abs dslot" style="left:34px;top:36px;width:92px;height:92px"></div>
      <div class="abs" style="left:150px;top:44px;font:500 25px Inter;color:#5B6390">August payout</div>
      <div class="abs num" style="left:150px;top:82px;font:700 68px Inter;letter-spacing:-.03em;font-variant-numeric:tabular-nums">$0.00</div>
      <div class="abs" style="left:34px;top:auto;bottom:30px;font:500 20px Inter;color:#8A90B4">${PAYOUT.who} · base, milestone, split, clawback</div>
      <div class="abs chip" style="left:auto;right:30px;top:30px;display:flex;align-items:center;gap:8px;height:44px;padding:0 18px;border-radius:22px;background:#DDF5EC;color:#1E8E73;font:600 21px Inter">${icon("check", 18, 3)}Paid</div>`;
    doodle(this.card.querySelector(".dslot"), 0, 92).style.position = "relative";
    this.num = this.card.querySelector(".num"); this.chip = this.card.querySelector(".chip");
    this.CX = 760; this.CY = 132;
    this.lines = [
      [{ t: "Every", at: 20.25, fx: "rise" }, { t: "rep", at: 20.33, fx: "rise" }, { t: "sees", at: 20.41, fx: "rise" }],
      [{ t: "how", at: 20.55, fx: "rise" }, { t: "their", at: 20.63, fx: "rise" }, { t: "pay", at: 20.71, fx: "rise" }],
      [{ t: "was", at: 20.85, fx: "rise" }, { t: "built.", b: true, at: 20.93, fx: "rise", hl: { at: 21.6, cls: "mint", ink: "#FFFFFF" } }],
    ].map((tk, i) => kline(r, tk, { x: 150, y: 450 + i * 118, size: 104, align: "left", color: "#0D1020" }));
    this.built = this.lines[2].words[1];
    cue(19.35, "whoosh", { d: 0.4, v: 0.45, pan: 0.5 }); cue(19.75, "pop", { v: 0.55, pan: 0.4 }); cue(19.76, "glass", { v: 0.7, pan: 0.4 }); cue(19.8, "swell", { d: 0.5, v: 0.4 });
    [20.25, 20.55, 20.85].forEach((t, i) => cue(t, "whoosh", { d: 0.25, v: 0.22, pan: -0.6 + i * 0.1 }));
    cue(20.55, "glassSlide", { d: 0.6, v: 0.5, pan: 0.5 });
    cue(21.3, "whoosh", { d: 0.3, v: 0.3, pan: -0.3 }); cue(21.6, "pop", { v: 0.55, pan: -0.3 }); cue(21.6, "pluck", { v: 0.6, n: 1 });
    cue(21.75, "glass", { v: 0.6, pan: 0.1 }); cue(21.85, "count", { d: 0.55 }); cue(22.4, "notify", { v: 0.8, pan: 0.1 });
    cue(22.7, "whoosh", { d: 0.32, v: 0.4 }); cue(23.0, "suck", { d: 0.18, v: 0.5 }); cue(23.06, "wipe", { d: 0.7, v: 0.8 }); cue(23.1, "boom", { v: 0.55 });
  },
  chipPos() { const c = this.chip; return [this.CX + 560 - 30 - c.offsetWidth / 2, this.CY + 30]; },
  update(t) {
    const rev = E.outCubic(inv(19.75, 20.35, t));
    this.fr.style.clipPath = rev < 1 ? `circle(${(1100 * rev).toFixed(1)}px at ${this.FW / 2}px 0px)` : "none";
    this.fr.style.visibility = t >= 19.75 ? "visible" : "hidden";
    this.img.style.transform = `scale(${(1.1 - 0.06 * E.outCubic(inv(19.75, 24.0, t))).toFixed(4)})`;
    ribbonUpdate(this.R, E.inOutSine(inv(20.55, 21.15, t)), 0, 30 - 180 * (t - 20.6), E.outCubic(inv(21.0, 21.3, t)));
    const cs = clamp(S(t, 21.75, 0.5, 0.62), 0, 1.2);
    tf(this.card, { x: this.CX, y: this.CY + 40 * (1 - cs), s: lerp(0.7, 1, cs), o: clamp((t - 21.75) / 0.1) });
    const n = E.outCubic(inv(21.85, 22.4, FT));
    this.num.textContent = money(Math.round(PAYOUT.net * n * 100) / 100, 2);
    const ch = clamp(S(t, 22.4, 0.4, 0.5), 0, 1.3);
    this.chip.style.transform = `scale(${(t >= 22.4 ? lerp(0.6, 1, ch) : 0.6).toFixed(4)})`; this.chip.style.opacity = t >= 22.4 ? 1 : 0; this.chip.style.transformOrigin = "50% 100%";
    this.lines.forEach((L) => klUpdate(L, t));
    wipeCut(this.root, t, this.wipe[0], this.wipe[1], 1380, 560);
  },
  spark(t) {
    if (t < 19.35 || t >= 23.6) return null;
    const top = [this.FX + this.FW / 2, this.FY - SPARK_LAND + 4], b = this.built, onB = [b.right + 44, b.cy + 4], chip = this.chipPos();
    const bob = (tt, t0) => 5 * Math.sin((tt - t0) * 3.4);
    let x, y, sq = 0, s = 0.82, glow = 0.8;
    if (t < 19.75) [x, y] = hop(t, 19.35, 19.75, TRD.restPos(19.35 + this.dt - TRD.dt), top, 170);
    else if (t < 21.3) { [x, y] = [top[0], top[1] + bob(t, 19.75)]; sq = squash(t, 19.75, 0.35); }
    else if (t < 21.6) [x, y] = hop(t, 21.3, 21.6, [top[0], top[1] + bob(21.3, 19.75)], onB, 160);
    else if (t < 22.1) { [x, y] = onB; sq = squash(t, 21.6, 0.35); }
    else if (t < 22.4) [x, y] = hop(t, 22.1, 22.4, onB, [chip[0], chip[1] - SPARK_LAND + 8], 140);
    else if (t < 22.7) { [x, y] = [chip[0], chip[1] - SPARK_LAND + 8]; sq = squash(t, 22.4, 0.3); }
    else if (t < 23.02) [x, y] = hop(t, 22.7, 23.02, [chip[0], chip[1] - SPARK_LAND + 8], [1380, 560], 140);
    else { [x, y] = [1380, 560]; s = 0.82 * (1 + 0.6 * Math.sin(clamp((t - 23.02) / 0.4) * Math.PI)); glow = 1; }
    return { x, y, s, o: 1, glow, sq };
  },
  cam(t) { const m = E.inOutSine(inv(19.4, 22.95, t)); return { x: -16 * m * (1 - m) * 4 * 0.5, y: 0, s: 1.02 - 0.02 * m, r: 0 }; },   // settles to identity before the wipe
});

// ================================================================ 7 · THE DASHBOARD (scene clock 23.4 – 26.6, film +0.5)
scene({
  name: "dash", t0: 23.4, t1: 26.6, dt: 0.5,
  fast: [[24.35, 24.8], [25.2, 25.9]],
  build() {
    const r = this.root;
    this.PW = 2200; this.PH = 1300;
    this.plane = el("div", "abs", r);
    css(this.plane, { width: this.PW + "px", height: this.PH + "px" });
    const grid = el("div", "abs", this.plane);
    css(grid, { width: this.PW + "px", height: this.PH + "px",
      backgroundImage: "linear-gradient(rgba(143,160,245,.1) 2px, transparent 2px), linear-gradient(90deg, rgba(143,160,245,.1) 2px, transparent 2px)", backgroundSize: "220px 220px", backgroundPosition: "-2px -2px",
      maskImage: "radial-gradient(closest-side, #000 55%, transparent)", WebkitMaskImage: "radial-gradient(closest-side, #000 55%, transparent)" });
    const P = this.plane;
    this.cards = [
      [UI.chartCard(P), 240, 200], [UI.repsCard(P), 900, 140], [UI.welcomeCard(P), 1360, 200], [UI.rulesCard(P), 240, 600],
      [UI.mixCard(P), 720, 620], [UI.actionCard(P), 1110, 620], [UI.periodCard(P), 1110, 830],
    ].map(([c, x, y], i) => ({ c, x, y, at: 23.78 + [0, 2, 4, 1, 3, 5, 6][i] * 0.08 }));
    this.act = this.cards[5];
    // the button turns into "Payout sent"
    const btn = this.act.c.querySelector(".btn");
    this.btn = btn; this.sent = el("div", "btn", this.act.c, `${icon("check", 20, 3)}Payout sent`);
    css(this.sent, { position: "absolute", left: "28px", right: "28px", bottom: "28px", background: "linear-gradient(180deg, #45CFA8, #22A585)", boxShadow: "inset 0 1.5px 0 rgba(255,255,255,.45), 0 14px 30px -12px rgba(43,181,148,.9)" });
    this.BX = this.act.x + 200; this.BY = this.act.y + 170 - 28 - 28;
    this.ring = el("div", "abs", P); css(this.ring, { width: "200px", height: "200px", borderRadius: "50%", border: "4px solid rgba(143,232,200,.85)", left: this.BX - 100 + "px", top: this.BY - 100 + "px" });
    this.cards.forEach((k, i) => cue(k.at, "glass", { v: 0.35, pan: -0.6 + (k.x / 1800) * 1.2 }));
    cue(24.05, "hit", { v: 0.6 });
    cue(24.4, "whoosh", { d: 0.4, v: 0.35, pan: 0.3 }); cue(24.8, "click", { v: 0.9, pan: 0.2 }); cue(24.87, "chime", { v: 0.75, pan: 0.2 }); cue(24.9, "swell", { d: 0.5, v: 0.5 });
    cue(25.25, "whoosh", { d: 0.55, v: 0.55, pan: -0.2 });
  },
  st(t) {
    const m = E.inOutSine(inv(23.6, 25.3, t)), out = E.inCubic(inv(25.25, 25.85, t));
    return { p: 2600, x: 960 - this.PW / 2 + lerp(150, -60, m), y: 540 - this.PH / 2 + lerp(40, -10, m) + 260 * out,
      rx: lerp(40, 32, m) + 18 * out, r: lerp(-20, -13, m), s: lerp(1.04, 1.16, m) - 0.3 * out };
  },
  update(t) {
    const st = this.st(t), out = inv(25.3, 25.85, t);
    tf(this.plane, Object.assign({}, st, { o: E.outCubic(inv(23.6, 23.9, t)) * (1 - out) }));
    this.cards.forEach((k) => {
      const s = clamp(S(t, k.at, 0.55, 0.68), 0, 1.2);
      tf(k.c, { x: k.x, y: k.y + 140 * (1 - s), s: lerp(0.86, 1, s), o: clamp((t - k.at) / 0.12) });
    });
    const press = Math.sin(clamp((t - 24.75) / 0.16) * Math.PI), sent = E.outCubic(inv(24.85, 25.0, t));
    this.btn.style.transform = this.sent.style.transform = `scale(${(1 - 0.05 * press).toFixed(4)})`;
    this.sent.style.opacity = sent.toFixed(3);
    const rp = inv(24.87, 25.55, t);
    this.ring.style.opacity = (t >= 24.87 ? 1 - rp : 0).toFixed(3); this.ring.style.transform = `scale(${(0.3 + 7 * E.outCubic(rp)).toFixed(4)})`;
  },
  spark(t) {
    if (t < 23.9 || t >= 25.75) return null;
    const on = (tt) => { const [x, y] = project(this.st(tt), this.PW, this.PH, this.BX, this.BY); return [x, y - SPARK_LAND * 0.7]; };
    let x, y, sq = 0;
    if (t < 24.4) [x, y] = [1380 + 8 * Math.sin((t - 23.9) * 3), 560 + 10 * Math.sin((t - 23.9) * 4)];
    else if (t < 24.75) [x, y] = hop(t, 24.4, 24.75, [1380 + 8 * Math.sin(0.5 * 3), 560 + 10 * Math.sin(0.5 * 4)], on(24.75), 180);
    else if (t < 25.25) { [x, y] = on(t); sq = squash(t, 24.75, 0.45); }
    else [x, y] = hop(t, 25.25, 25.75, on(25.25), [1500, 250], 160, E.outSine);
    return { x, y, s: 0.82, o: 1, glow: t >= 24.75 && t < 25.25 ? 1 : 0.8, sq };
  },
  cam(t) { return { x: 0, y: 0, s: 1, r: 0 }; },
});

// ================================================================ 8 · NOT JUST COMMISSIONS. EVERYTHING FROM HIRE TO PAID. (scene clock 26.6 – 30.65, film −0.5)
scene({
  name: "breakdown", t0: 26.6, t1: 30.65, dt: -0.5,
  fast: [[29.85, 30.55]],
  build() {
    const r = this.root;
    this.l1 = kline(r, [{ t: "Not", at: 26.9, fx: "pop" }, { t: "just", at: 27.04, fx: "type" }, { t: "commissions.", b: true, col: "#B9C4FF", at: 27.2, fx: "type" }],
      { x: 960, y: 410, size: 104, align: "center" });
    this.l2 = kline(r, [{ t: "Everything", at: 27.5, fx: "rise" }, { t: "from", at: 27.7, fx: "type" }, { t: "hire", b: true, at: 27.85, fx: "pop" }, { t: "to", at: 28.0, fx: "type" }, { t: "paid.", b: true, col: "#8FE8C8", at: 28.12, fx: "pop" }],
      { x: 960, y: 590, size: 120, align: "center" });
    const em = 120, h = this.l2.words[2], p = this.l2.words[4];
    this.box = { x: h.left - 0.2 * em, y: h.top + 0.02 * em, h: h.bot - h.top + 0.04 * em, w0: h.right - h.left + 0.4 * em, w1: p.right - h.left + 0.4 * em };
    // a selection box the spark drags open from "hire" to "paid."
    this.sel = el("div", "abs", r); css(this.sel, { height: this.box.h + "px", background: "rgba(143,160,245,.12)" });
    this.edges = ["t", "r", "b", "l"].map((k) => { const e = el("i", "abs", this.sel); css(e, { background: "#B9C4FF" }); return e; });
    this.hand = [0, 1, 2, 3].map(() => { const e = el("i", "abs", this.sel); css(e, { width: "16px", height: "16px", background: "#050817", border: "2px solid #B9C4FF", borderRadius: "3px" }); return e; });
    cue(26.9, "pop", { v: 0.45 }); [27.04, 27.2, 27.36].forEach((t) => cue(t, "tick", { v: 0.26 }));
    cue(27.5, "whoosh", { d: 0.3, v: 0.25 }); cue(27.85, "pop", { v: 0.4 }); cue(28.12, "pop", { v: 0.5 });
    [28.4, 28.47, 28.54, 28.61].forEach((t) => cue(t, "tick", { v: 0.32, pan: -0.3 }));
    cue(28.73, "pop", { v: 0.4 }); cue(28.78, "glassSlide", { d: 0.42, v: 0.6, pan: 0.3 }); cue(29.2, "tick", { v: 0.4, pan: 0.5 });
    cue(29.98, "riser", { d: 0.5, v: 0.7 });
  },
  boxW(t) { return lerp(this.box.w0, this.box.w1, E.inOutCubic(inv(28.78, 29.18, t))); },
  update(t) {
    klUpdate(this.l1, t, { at: 29.95, fx: "up", dur: 0.3, step: 0.03 });
    klUpdate(this.l2, t, { at: 30.0, fx: "up", dur: 0.3, step: 0.03 });
    const W = this.boxW(t), H = this.box.h, out = E.inCubic(inv(30.0, 30.27, t));
    tf(this.sel, { x: this.box.x, y: this.box.y - 0.5 * 120 * out, o: (t >= 28.4 ? 1 : 0) * (1 - out) });
    this.sel.style.width = W.toFixed(1) + "px";
    this.sel.style.background = `rgba(143,160,245,${(0.12 * E.outCubic(inv(28.68, 28.88, t))).toFixed(3)})`;
    const ed = [[0, 0, W, 2], [W - 2, 0, 2, H], [0, H - 2, W, 2], [0, 0, 2, H]];
    this.edges.forEach((e, k) => {
      const p = E.inOutCubic(clamp((t - 28.4 - k * 0.07) / 0.09)), [x, y, w, hh] = ed[k];
      css(e, { left: x + "px", top: y + "px", width: (k % 2 ? w : w * p) + "px", height: (k % 2 ? hh * p : hh) + "px" });
      if (k === 2) e.style.left = (W - W * p) + "px";
      if (k === 3) e.style.top = (H - H * p) + "px";
    });
    [[0, 0], [W, 0], [W, H], [0, H]].forEach(([x, y], k) => {
      const s = clamp(S(t, 28.63 + k * 0.03, 0.3, 0.5), 0, 1.4) * (k === 2 && t > 28.73 && t < 29.23 ? 1.3 : 1);
      tf(this.hand[k], { x: x - 8, y: y - 8, s: t >= 28.63 + k * 0.03 ? s : 0 });
    });
  },
  spark(t) {
    if (t < 26.75 || t >= 30.48) return null;
    const handle = (tt) => [this.box.x + this.boxW(tt) + 26, this.box.y + this.box.h + 22];
    const float = (tt) => [1500 + 14 * Math.sin((tt - 26.75) * 2.4), 250 + 10 * Math.sin((tt - 26.75) * 3.6)];
    let x, y, sq = 0, r = 0;
    if (t < 28.4) [x, y] = float(t);
    else if (t < 28.73) [x, y] = hop(t, 28.4, 28.73, float(28.4), handle(28.73), 160);
    else if (t < 29.88) { [x, y] = handle(t); sq = squash(t, 28.73, 0.3); r = -14 * Math.sin(clamp((t - 28.78) / 0.4) * Math.PI); }
    else [x, y] = hop(t, 29.88, 30.48, handle(29.88), [960, 600], 200, E.inOutCubic);
    const grow = t > 30.3 ? 1 + 0.9 * E.inQuad(inv(30.3, 30.48, t)) : 1;
    return { x, y, s: 0.82 * grow, o: 1, glow: t > 30.1 ? 1 : 0.8, sq, r };
  },
  cam(t) { return { x: 0, y: 0, s: 1 + 0.04 * E.inOutSine(inv(26.9, 30.0, t)), r: 0 }; },
});
