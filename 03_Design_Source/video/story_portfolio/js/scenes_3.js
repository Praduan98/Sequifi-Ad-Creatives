// Scenes 9–12: the hero becomes the app → trusted by 20,000+ → your team, is your back office? → tagline and CTA.
"use strict";

let WIPE3 = [1010, 680];   // the last wipe (dark → light) opens from the spark on the question mark; set at build

// ================================================================ 9 · THE SPARK BECOMES THE APP (29.9 – 34.9)
const DEV = scene({
  name: "device", t0: 29.9, t1: 34.9,
  fast: [[29.9, 30.5], [34.0, 34.65]],
  build() {
    const r = this.root;
    this.W = 1280; this.H = 560; this.DX = 960 - this.W / 2; this.DY = 620 - this.H / 2;
    this.D = UI.device(r, this.W, this.H);
    this.hd = kline(r, [
      { t: "Built", at: 31.5, fx: "rise" }, { t: "for", at: 31.58, fx: "rise" }, { t: "compensation", at: 31.66, fx: "rise" }, { t: "that", at: 31.8, fx: "rise" },
      { t: "gets", at: 31.88, fx: "rise" }, { t: "complicated.", b: true, at: 31.96, fx: "rise", hl: { at: 32.42, ink: "#FFFFFF" } },
    ], { x: 960, y: 176, size: 72, align: "center" });
    const D = this.D;
    this.parts = [[D.side, 30.22, -40, 0], [D.head, 30.34, 0, 30], [D.rings[0], 30.7, 0, 40], [D.rings[1], 30.78, 0, 40], [D.toggles, 31.28, 0, 30]];
    cue(29.98, "suck", { d: 0.12, v: 0.4 }); cue(30.0, "impact", { v: 1.0 }); cue(30.02, "glass", { v: 0.8 });
    this.parts.forEach(([, at], i) => cue(at, "tick", { v: 0.3, pan: -0.4 + i * 0.15 }));
    cue(30.6, "count", { d: 0.75 }); D.rows.forEach((_, i) => cue(30.9 + i * 0.08, "tick", { v: 0.28, pan: 0.5 }));
    cue(31.5, "whoosh", { d: 0.3, v: 0.3 }); cue(32.3, "pop", { v: 0.55, pan: -0.3 }); cue(32.32, "glass", { v: 0.6, pan: -0.3 }); cue(32.42, "glassSlide", { d: 0.26, v: 0.35 });
    cue(34.0, "whoosh", { d: 0.5, v: 0.5, pan: 0.5 });
  },
  heroTop(t) { const s = this.heroS(t); return [this.DX + 132 + 215, this.DY + 122 + 85 - 85 * s]; },
  heroS(t) { return 1 + 0.05 * clamp(S(t, 32.3, 0.45, 0.55), 0, 1.3); },
  update(t) {
    const D = this.D, e = clamp(S(t, 30.0, 0.55, 0.72), 0, 1.15), out = E.inCubic(inv(34.05, 34.6, t));
    tf(D.d, { x: this.DX, y: this.DY + 60 * out, sx: lerp(0.035, 1, e), sy: lerp(0.13, 1, e), s: 1 - 0.1 * out, o: (t >= 29.99 ? 1 : 0) * (1 - out), b: 8 * out });
    this.parts.forEach(([p, at, dx, dy]) => { const s = clamp(S(t, at, 0.5, 0.7), 0, 1.15); tf(p, { x: dx * (1 - s), y: dy * (1 - s), o: clamp((t - at) / 0.12) }); });
    D.rows.forEach((row, i) => { const at = 30.9 + i * 0.08, s = clamp(S(t, at, 0.5, 0.7), 0, 1.15); tf(row, { x: 80 * (1 - s), o: clamp((t - at) / 0.12) }); });
    D.heroNum.textContent = money(Math.round(PAYOUT.net * E.outCubic(inv(30.6, 31.35, FT)) * 100) / 100, 2);
    const ap = E.outCubic(inv(30.75, 31.4, t));
    D.arcs[0].style.strokeDashoffset = (364.4 * (1 - 0.72 * ap)).toFixed(2); D.arcs[1].style.strokeDashoffset = (364.4 * (1 - 0.28 * ap)).toFixed(2);
    const hs = this.heroS(t), hin = clamp(S(t, 30.48, 0.5, 0.7), 0, 1.15);
    tf(D.hero, { y: 50 * (1 - hin), s: hs, o: clamp((t - 30.48) / 0.12) });
    D.hero.style.boxShadow = `0 ${(20 + 400 * (hs - 1)).toFixed(1)}px ${(40 + 600 * (hs - 1)).toFixed(1)}px -18px rgba(96,120,236,${(0.9).toFixed(2)})`;
    klUpdate(this.hd, t, { at: 34.0, fx: "up", dur: 0.3, step: 0.02 });
  },
  spark(t) {
    if (t < 29.98 || t >= 34.6) return null;
    if (t < 30.12) { const k = inv(29.98, 30.12, t); return { x: 960, y: 600, s: lerp(1.5, 3.4, E.outCubic(k)), o: 1 - k, glow: 1 }; }   // it bursts into the device
    if (t < 32.3) return null;
    const [hx, hy] = this.heroTop(t), rest = [hx + 150, hy - SPARK_LAND + 4];
    if (t < 32.6) { const [x, y] = hop(t, 32.3, 32.6, [hx + 60, hy + 40], rest, 120); return { x, y, s: 0.82 * clamp(S(t, 32.3, 0.3, 0.55), 0, 1.3), o: 1, glow: 1 }; }
    if (t < 34.1) return { x: rest[0], y: rest[1], s: 0.82, o: 1, glow: 0.8, sq: squash(t, 32.6, 0.3) };
    const [x, y] = hop(t, 34.1, 34.6, this.restAt(34.1), TRUST.orbit(34.6 - TRUST.dt), 160, E.inOutCubic);
    return { x, y, s: 0.82, o: 1, glow: 0.9 };
  },
  restAt(t) { const [hx, hy] = this.heroTop(t); return [hx + 150, hy - SPARK_LAND + 4]; },
  cam(t) { return { x: 0, y: 0, s: 1 + 0.025 * E.inOutSine(inv(30.2, 33.4, t)) + 0.06 * Math.exp(-Math.max(0, t - 30.0) * 7) * (t >= 30.0 ? 1 - Math.exp(-(t - 30.0) / 0.012) : 0), r: 0 }; },
});

// ================================================================ 10 · TRUSTED BY 20,000+ (scene clock 35.9 – 39.1, film −1.5)
const TRUST = scene({
  name: "trust", t0: 35.9, t1: 39.1, dt: -1.5,
  fast: [[38.3, 38.9]],
  build() {
    const r = this.root;
    this.PC = [1410, 540]; this.PR = 300;
    this.C = circles(r, [[1410, 540, 378, -90], [1410, 540, 432, 30]], { stroke: "rgba(185,196,255,.4)", width: 2, dot: 6 });
    this.ph = el("div", "photo", r);
    css(this.ph, { width: "600px", height: "600px", borderRadius: "50%", boxShadow: "0 0 0 6px rgba(185,196,255,.55), 0 0 70px rgba(96,120,236,.5)" });
    this.ph.innerHTML = `<img src="../assets/photos/story_team_daylight.jpg" style="object-position:52% 40%">`;
    this.img = this.ph.firstElementChild;
    this.dd = [[-150, 0], [-35, 2], [35, 3], [150, 4]].map(([a, i]) => ({ el: doodle(r, i, 108), a }));
    this.dd.forEach((d) => (d.el.style.boxShadow = "0 0 0 5px #050817, 0 0 0 7px rgba(185,196,255,.5)"));
    this.l1 = kline(r, [{ t: "Trusted", at: 36.2, fx: "rise" }, { t: "by", at: 36.28, fx: "rise" }], { x: 150, y: 330, size: 76, align: "left", color: "#C8CFF0" });
    this.num = el("div", "abs", r, "0+");
    css(this.num, { font: '700 196px/1 "DM Sans"', letterSpacing: "-0.045em", color: "#B9C4FF", whiteSpace: "nowrap", textShadow: "0 0 60px rgba(96,120,236,.55)" });
    this.l3 = kline(r, [{ t: "reps,", at: 36.75, fx: "fade" }, { t: "managers,", at: 36.83, fx: "fade" }, { t: "and", at: 36.91, fx: "fade" }, { t: "operators", at: 36.99, fx: "fade" }],
      { x: 156, y: 690, size: 56, align: "left", color: "#C8CFF0" });
    cue(36.05, "pop", { v: 0.5, pan: 0.4 }); cue(36.06, "glass", { v: 0.6, pan: 0.4 }); cue(36.0, "draw", { d: 0.6 });
    cue(36.2, "whoosh", { d: 0.25, v: 0.25, pan: -0.5 }); cue(36.35, "count", { d: 0.65 }); cue(37.0, "pop", { v: 0.45, pan: -0.5 });
    this.dd.forEach((_, i) => cue(36.4 + i * 0.08, "pop", { v: 0.32, pan: 0.2 + i * 0.15 }));
    cue(38.35, "whoosh", { d: 0.45, v: 0.5, pan: 0.3 });
  },
  orbit(t) { const a = ((-90 + (t - 36.1) * 230) * Math.PI) / 180; return [this.PC[0] + 405 * Math.cos(a), this.PC[1] + 405 * Math.sin(a)]; },
  update(t) {
    const out = E.inCubic(inv(38.45, 38.85, t));
    circlesUpdate(this.C, t, E.outCubic(inv(36.0, 36.6, t)), (t - 36.0) * 40, 1 - out);
    const rv = clamp(S(t, 36.05, 0.55, 0.7), 0, 1.1);
    tf(this.ph, { x: this.PC[0] - 300, y: this.PC[1] - 300, s: lerp(0.4, 1, rv) * (1 + 0.15 * out), o: (t >= 36.05 ? 1 : 0) * (1 - out) });
    this.img.style.transform = `scale(${(1.12 - 0.08 * E.outCubic(inv(36.05, 38.9, t))).toFixed(4)})`;
    this.dd.forEach((d, i) => {
      const s = clamp(S(t, 36.4 + i * 0.08, 0.42, 0.55), 0, 1.3) * (1 - out), a = ((d.a + 6 * Math.sin(t * 1.5 + i)) * Math.PI) / 180, R = 300 + 52;
      tf(d.el, { x: this.PC[0] + R * Math.cos(a) - 54, y: this.PC[1] + R * Math.sin(a) - 54, s, o: s > 0.01 ? 1 : 0 });
    });
    klUpdate(this.l1, t, { at: 38.45, fx: "up", dur: 0.3, step: 0.02 });
    klUpdate(this.l3, t, { at: 38.5, fx: "up", dur: 0.3, step: 0.02 });
    const ns = clamp(S(t, 36.3, 0.5, 0.65), 0, 1.15);
    this.num.textContent = (Math.round((20000 * E.outCubic(inv(36.35, 37.0, FT))) / 10) * 10).toLocaleString("en-US") + "+";
    tf(this.num, { x: 140, y: 412 + 60 * (1 - ns) - 70 * out, s: lerp(0.8, 1, ns), o: clamp((t - 36.3) / 0.1) * (1 - out) });
  },
  spark(t) {
    if (t < 36.1 || t >= 38.85) return null;
    if (t < 38.35) { const [x, y] = this.orbit(t); return { x, y, s: 0.78, o: 1, glow: 0.9, trail: 0.4 }; }
    const [x, y] = hop(t, 38.35, 38.85, this.orbit(38.35), SCALE.perch(38.85 + this.dt - sh(SCALE)), 140, E.inOutSine);
    return { x, y, s: 0.82, o: 1, glow: 0.9 };
  },
  cam(t) { return { x: 0, y: 0, s: 1 + 0.03 * E.inOutSine(inv(36.0, 38.9, t)), r: 0 }; },
});

// ================================================================ 11 · YOUR TEAM IS READY TO SCALE. IS YOUR BACK OFFICE? (37.1 – 40.4)
const SCALE = scene({
  name: "scale", t0: 37.1, t1: 40.4, wipe: [39.75, 40.35],
  fast: [[39.2, 40.0]],
  build() {
    const r = this.root;
    // "your team": three toy teammates pop up on the right as the lines rise (field rep, manager, operator) and watch the hero
    this.TD = 400; this.FLOOR = 905;
    this.team = [["hardhat", 1232, 37.34], ["specs", 1470, 37.5], ["headset", 1700, 37.66]].map(([name, x, at], i) => {
      const shadow = el("div", "abs", r);
      css(shadow, { width: "250px", height: "40px", marginLeft: "-125px", marginTop: "-20px", borderRadius: "50%", background: "radial-gradient(closest-side, rgba(2,4,18,.6), rgba(2,4,18,0))" });
      const tc = toyCanvas(r, "toy", this.TD), half = (Toys.half(name) * this.TD) / Toys.VIEW;   // canvas centre to feet, px
      tc.e.style.transformOrigin = `50% ${(50 + (half / this.TD) * 100).toFixed(2)}%`;           // they grow from their feet
      cue(at, "pop", { v: 0.45, pan: 0.15 + i * 0.25 });
      return { name, x, at, tc, shadow, half, seed: i + 1 };
    });
    const L = [
      [{ t: "Your", at: 37.3, fx: "rise" }, { t: "team", at: 37.37, fx: "rise" }, { t: "is", at: 37.44, fx: "rise" }],
      [{ t: "ready", at: 37.62, fx: "rise" }, { t: "to", at: 37.69, fx: "rise" }, { t: "scale.", b: true, at: 37.76, fx: "rise" }],
      [{ t: "Is", at: 38.05, fx: "pop" }, { t: "your", at: 38.15, fx: "pop" }],
      [{ t: "back", b: true, col: "#B9C4FF", at: 38.27, fx: "pop" }, { t: "office?", b: true, col: "#B9C4FF", at: 38.39, fx: "pop" }],
    ];
    this.lines = L.map((tk, i) => kline(r, tk, { x: 150, y: [330, 450, 630, 752][i], size: 116, align: "left" }));
    const q = this.lines[3].words[1], qc = q.chars[q.chars.length - 1].getBoundingClientRect();
    this.Q = [qc.left + qc.width / 2, q.top];
    WIPE3 = [this.Q[0], this.Q[1] - SPARK_LAND + 14];
    [37.3, 37.62].forEach((t, i) => cue(t, "whoosh", { d: 0.28, v: 0.3, pan: -0.5 + i * 0.2 }));
    cue(38.05, "pop", { v: 0.4 }); cue(38.15, "pop", { v: 0.4 }); cue(38.27, "pop", { v: 0.55 }); cue(38.39, "pop", { v: 0.6 });
    cue(38.95, "riser", { d: 0.8, v: 0.8 }); cue(39.3, "whoosh", { d: 0.25, v: 0.35 }); cue(39.55, "pop", { v: 0.6 }); cue(39.55, "pluck", { v: 0.6, n: 3 });
    cue(39.72, "suck", { d: 0.12, v: 0.4 }); cue(39.76, "wipe", { d: 0.6, v: 0.9 });
  },
  perch(t) { return [1470 + 12 * Math.sin((t - 37.95) * 2.6), 470 + 10 * Math.sin((t - 37.95) * 3.8)]; },
  update(t) {
    const hero = this.spark(t) || { x: 1470, y: 470 };
    this.team.forEach((m, i) => {
      if (t < m.at) { tf(m.tc.e, { o: 0 }); tf(m.shadow, { o: 0 }); return; }
      const s = clamp(S(t, m.at, 0.42, 0.55), 0, 1.3), q = squash(t, m.at + 0.2, 0.16);
      const bob = 5 * Math.sin((t - m.at) * 3.1 + i * 1.7) * clamp((t - m.at - 0.5) / 0.4), cy = this.FLOOR - m.half;
      tf(m.tc.e, { x: m.x - this.TD / 2, y: cy - this.TD / 2 + bob, s, sx: 1 + q, sy: 1 - q, o: 1 });
      const dx = hero.x - m.x, dy = hero.y - (cy - m.half * 0.3);
      toyDraw(m.tc, m.name, s, { yaw: 0.35 * clamp(dx / 900, -1, 1), look: [clamp(dx / 600, -1, 1), clamp(-dy / 600, -1, 1)], blink: blinkAt(t, m.seed), roll: 0.04 * Math.sin((t - m.at) * 2.3 + i) });
      tf(m.shadow, { x: m.x, y: this.FLOOR + 4, s: lerp(0.4, 1, clamp(s)) * (1 + bob / 80), o: 0.9 * clamp(s) });
    });
    this.lines.forEach((L) => klUpdate(L, t));
    wipeCut(this.root, t, this.wipe[0], this.wipe[1], WIPE3[0], WIPE3[1]);
  },
  spark(t) {
    if (t < 37.35 || t >= 40.0) return null;
    let x, y, sq = 0, s = 0.82;
    if (t < 39.25) [x, y] = this.perch(t);
    else if (t < 39.55) [x, y] = hop(t, 39.25, 39.55, this.perch(39.25), WIPE3, 160);
    else { [x, y] = WIPE3; sq = squash(t, 39.55, 0.35); s = 0.82 * (1 + 0.55 * Math.sin(clamp((t - 39.65) / 0.35) * Math.PI)); }
    return { x, y, s, o: 1, glow: 1, sq };
  },
  cam(t) { return { x: 0, y: 0, s: 1, r: 0 }; },
});

// ================================================================ 12 · EVERYONE, PAID RIGHT. BOOK A DEMO (39.75 – 45)
scene({
  name: "end", t0: 39.75, t1: 45.0,
  fast: [[39.95, 40.8], [41.5, 42.4]],
  build() {
    const r = this.root;
    // lockup: the hero (the spark, which stays to the end) beside the two-line tagline, the button below
    this.HS = 2.56;   // the hero's scale in the lockup
    const tg = TAGLINE_SVG("lg", "#0D1020", "#4A5BD0", "#9DADFF");
    const hw = 2.16 * (TOY_PX / Toys.VIEW) * this.HS, gap = 44, left = 960 - (hw + gap + tg.w) / 2;
    this.MK = [left + hw / 2, 430];
    this.tag = el("div", "abs", r, tg.html); this.TW = tg.w;
    this.TX = left + hw + gap; this.TY = 430 - 110;
    tf(this.tag, { x: this.TX, y: this.TY });
    this.clip = this.tag.querySelector("#lg-clip rect"); this.sh = this.tag.querySelector("#lg-sh");
    this.cta = el("div", "cta", r, `Book a demo${icon("arrow", 36, 2.6)}`);
    this.CW = this.cta.offsetWidth; this.CH = this.cta.offsetHeight; this.CC = [960, 720];
    cue(40.0, "impact", { v: 1.0 }); cue(40.0, "whoosh", { d: 0.5, v: 0.5, pan: -0.4 });
    cue(40.52, "bell", { v: 0.85 }); cue(40.54, "shimmer", { v: 0.8 }); cue(40.7, "draw", { d: 0.55 });
    cue(41.25, "pop", { v: 0.5 }); cue(41.27, "glass", { v: 0.55 }); cue(41.5, "shimmer", { v: 0.5 });
    cue(41.6, "whoosh", { d: 0.35, v: 0.2, pan: 0.6 }); cue(42.2, "click", { v: 0.95, pan: 0.15 }); cue(42.24, "notify", { v: 0.6, pan: 0.15 });
    cue(42.62, "pop", { v: 0.35, pan: -0.2 });
  },
  update(t) {
    this.clip.setAttribute("width", ((this.TW + 24) * E.outCubic(inv(40.7, 41.25, t))).toFixed(1));
    const sx = lerp(-200, this.TW + 60, E.inOutSine(inv(41.5, 42.15, t)));
    this.sh.setAttribute("x1", sx.toFixed(1)); this.sh.setAttribute("x2", (sx + 120).toFixed(1));
    tf(this.tag, { x: this.TX, y: this.TY - 10 * E.inOutSine(inv(40.6, 45, t)) });
    const cs = clamp(S(t, 41.25, 0.5, 0.62), 0, 1.2), press = Math.sin(clamp((t - 42.12) / 0.18) * Math.PI);
    tf(this.cta, { x: this.CC[0] - this.CW / 2, y: this.CC[1] - this.CH / 2 + 40 * (1 - cs), s: lerp(0.7, 1, cs) * (1 - 0.05 * press), o: clamp((t - 41.25) / 0.1) });
    this.cta.style.filter = t >= 42.2 && t < 43 ? `brightness(${(1 + 0.25 * Math.exp(-(t - 42.2) * 5)).toFixed(3)})` : "none";
  },
  spark(t) {
    if (t < 40.0) return null;
    if (t < 40.52) {   // eased arc: it arrives at rest and lands in the lockup
      const e = E.inOutCubic(inv(40.0, 40.52, t));
      return { x: lerp(WIPE3[0], this.MK[0], e), y: lerp(WIPE3[1], this.MK[1], e) - 180 * Math.sin(Math.PI * e), s: lerp(0.82, this.HS, E.inOutCubic(inv(40.05, 40.52, t))), o: 1, glow: 1 };
    }
    // in the lockup it reads the tagline as it appears, follows the cursor, cheers at the click, then looks at you
    const drift = -10 * E.inOutSine(inv(40.6, 45, t)), bob = 4 * Math.sin((t - 40.9) * 2.4) * clamp((t - 40.9) / 0.4);
    const cheer = Math.sin(clamp((t - 42.22) / 0.4) * Math.PI);
    const c = this.cursor(clamp(t, 41.56, 43.29)), cd = [clamp((c.x - this.MK[0]) / 500, -1, 1), clamp(-(c.y - this.MK[1]) / 500, -1, 1)];
    const wTag = E.inOutSine(inv(40.62, 40.85, t)) * (1 - E.inOutSine(inv(41.3, 41.55, t)));
    const wCur = E.inOutSine(inv(41.5, 41.8, t)) * (1 - E.inOutSine(inv(42.95, 43.4, t)));
    const look = [0.85 * wTag + cd[0] * wCur, -0.08 * wTag + cd[1] * wCur];
    return { x: this.MK[0], y: this.MK[1] + drift + bob - 34 * cheer, s: this.HS, o: 1, glow: 0.5, look, yaw: 0.16 * look[0],
      sq: squash(t, 40.52, 0.22) + squash(t, 42.62, 0.16), happy: clamp(cheer * 1.6) * (t < 42.9 ? 1 : 1 - inv(42.9, 43.2, t)) };
  },
  cursor(t) {
    if (t < 41.55 || t > 43.3) return null;
    const tx = this.CC[0] + this.CW / 2 - 70, ty = this.CC[1] + 12, a = E.inOutCubic(inv(41.55, 42.08, t)), away = E.inCubic(inv(42.75, 43.3, t));
    return { x: lerp(1560, tx, a) + 220 * away, y: lerp(1010, ty, a) + 260 * away, o: clamp((t - 41.55) / 0.12) * (1 - away), press: Math.sin(clamp((t - 42.12) / 0.18) * Math.PI), click: t - 42.2 };
  },
  cam(t) { return { x: 0, y: 0, s: 1 + 0.02 * E.inOutSine(inv(40.4, 45, t)), r: 0 }; },
});
