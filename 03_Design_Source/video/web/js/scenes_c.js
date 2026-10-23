// Scenes 6–8: statement (27 – 30) → platform (30 – 38) → call to action (38 – 45).
"use strict";

// ================================================================= 6 · STATEMENT (27 – 30)
// "Built for compensation that gets complicated." — the letters of "complicated." arrive scattered and snap into order.
scene({
  name: "statement", t0: 26.95, t1: 30.1,
  build() {
    const root = this.root;
    this.l1 = textLine(root, [["disp", "Built for compensation", "font-size:128px"]], 960, 440);
    this.l2 = textLine(root, [["disp", "that gets ", "font-size:128px"], ["serif", "complicated.", "font-size:152px;line-height:.9"]], 960, 600);
    const n = "complicated.".length, sc = this.l2.chars.slice(-n);
    sc.forEach((c, i) => (c.style.color = serifCol(i, n)));
    this.serifChars = sc; this.l2words = wordsOf(this.l2).slice(0, 2);
    const R = rng(27);
    this.scatter = sc.map(() => ({ x: (R() - 0.5) * 560, y: (R() - 0.5) * 320, r: (R() - 0.5) * 80, s: 0.55 + R() * 0.9 }));
    this.sub = textLine(root, [["", "Sequifi is native to the industries where nearly every paycheck is different.", "font:500 34px Inter;color:rgba(235,238,255,.76)"]], 960, 760);
    this.subW = wordsOf(this.sub);
    cue(27.0, "impact", { v: 0.45 }); [27.0, 27.1, 27.2].forEach((t, i) => cue(t, "whoosh", { d: 0.35, v: 0.35, pan: -0.4 + i * 0.4 }));
    cue(27.5, "swell", { d: 0.5 }); this.serifChars.forEach((_, i) => i % 3 === 0 && cue(27.62 + i * 0.035, "tick", { v: 0.4, pan: -0.3 + i * 0.06 }));
    cue(28.05, "chime", { v: 0.5 }); cue(29.0, "riser", { d: 1.0, v: 0.8 }); cue(29.45, "reverse", { d: 0.55 });
  },
  update(t) {
    const out = 29.45;
    slamWords(wordsOf(this.l1), t, 27.0, 0.1, out, 0.03, [-140, 0, 140]);
    slamWords(this.l2words, t, 27.3, 0.1, out, 0.03, [-120, 0]);
    this.serifChars.forEach((c, i) => {
      const a = this.scatter[i], o = clamp((t - 27.42 - i * 0.02) / 0.14), p = S(t, 27.55 + i * 0.035, 0.6, 0.6), xo = E.inCubic(clamp((t - out - 0.06 - i * 0.012) / 0.38));
      tf(c, { x: a.x * (1 - p), y: a.y * (1 - p) - 50 * xo, r: a.r * (1 - p), s: lerp(a.s, 1, p), o: o * (1 - xo), b: Math.max(0, 1 - p) * 5 + 8 * xo });
    });
    this.subW.forEach((w, i) => { const p = E.outCubic(clamp((t - 28.4 - i * 0.03) / 0.45)), xo = E.inCubic(clamp((t - out) / 0.4)); tf(w, { y: (1 - p) * 26, o: p * (1 - xo), b: (1 - p) * 4 + 8 * xo }); });
  },
  cam(t) { const p = E.inOutSine(inv(27, 29.45, t)), q = E.inExpo(inv(29.45, 30.05, t)); return { x: 0, y: 0, s: 1 + 0.04 * p + 0.5 * q, r: lerp(-0.6, 0.4, p) }; },
});

// ================================================================= 7 · PLATFORM (30 – 38)
scene({
  name: "platform", t0: 29.95, t1: 38.15,
  build() {
    const root = this.root;
    // 7a — header
    this.h1 = textLine(root, [["disp", "Not just commissions.", "font-size:118px"]], 960, 430);
    this.h2 = textLine(root, [["disp", "Everything from ", "font-size:118px"], ["serif", "hire to paid.", "font-size:140px;line-height:.9"]], 960, 580);
    const n = "hire to paid.".replace(/ /g, "").length; this.h2serif = this.h2.chars.slice(-n);
    this.h2serif.forEach((c, i) => (c.style.color = serifCol(i, n)));
    this.h2words = wordsOf(this.h2).slice(0, 2);
    // 7b — Hire → Pay: a glass track with a lens that steps node to node (iOS 26 gel)
    this.TW = 1240; this.TH = 150; this.TX = 960 - this.TW / 2; this.TY = 640 - this.TH / 2;
    this.track = Glass.make(root, { w: this.TW, h: this.TH, r: "pill", variant: "clear", look: { frost: 3, sat: 1.7 } });
    this.trail = el("div", "abs", this.track.content);
    css(this.trail, { left: "70px", top: this.TH / 2 - 3 + "px", height: "6px", width: "0px", borderRadius: "3px",
      background: "linear-gradient(90deg, rgba(96,120,236,0), rgba(125,144,242,.9) 30%, #8597F4 70%, #30D158)" });
    this.nodeX = STEPS.map((_, i) => this.TX + 124 + i * 248);
    this.nodes = STEPS.map(([ic], i) => {
      const nd = el("div", "abs", this.track.content, icon(ic, 46, 2));
      css(nd, { left: 124 + i * 248 - 46 + "px", top: this.TH / 2 - 46 + "px", width: "92px", height: "92px", borderRadius: "46px", display: "grid", placeItems: "center",
        background: "rgba(120,120,128,.24)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px rgba(255,255,255,.06)", color: "rgba(255,255,255,.6)" });
      return nd;
    });
    this.tlens = Glass.make(root, { w: 176, h: 128, r: "pill", variant: "lens" }); this.tlens.el.style.zIndex = 3;
    this.labels = STEPS.map(([, name], i) => { const l = el("div", "abs", root, name); css(l, { font: "600 34px/1 Inter", whiteSpace: "nowrap", letterSpacing: "-.01em" }); l.w = l.offsetWidth; return l; });
    this.moves = [1, 2, 3, 4].map((i) => 32.0 + 0.45 * i);           // when the lens leaves for node i
    this.arrive = [32.22, ...this.moves.map((m) => m + 0.22)];        // when node i lights up
    // 7c — payout breakdown
    this.big = [
      leftLine(root, [["disp", "Every rep sees", "font-size:104px"]], 150, 400),
      leftLine(root, [["disp", "how their pay", "font-size:104px"]], 150, 514),
      leftLine(root, [["serif", "was built.", "font-size:128px;line-height:.9"]], 150, 636),
    ];
    this.big[2].chars.forEach((c, i, a) => (c.style.color = serifCol(i, a.length)));
    this.phone = Phone.make(root);
    this.pay = Phone.payoutScreen(this.phone.apps);
    // 7d — the homepage numbers as iOS widgets
    this.widgets = STATS.map(([ic, top, big, cap]) => {
      const g = Glass.make(root, { w: 392, h: 330, r: 58, variant: "regular", cls: "widget" });
      g.content.innerHTML = `<div class="w-in"><div class="w-top">${icon(ic, 24, 2.3)}${top}</div><div class="w-big num">${big}</div><div class="w-cap">${cap}</div></div>`;
      g.bigEl = g.content.querySelector(".w-big"); g.big = big;
      if (big.length > 5) css(g.bigEl, { fontSize: "74px", whiteSpace: "nowrap" });
      return g;
    });
    this.trust = textLine(root, [["", "Trusted by 20,000+ reps, managers, and operators", "font:600 36px Inter;color:#fff;letter-spacing:-.01em"]], 960, 826);
    // sound
    cue(30.0, "impact", { v: 0.9 }); cue(30.0, "boom", { v: 0.7 }); [30.0, 30.12, 30.24].forEach((t, i) => cue(t, "whoosh", { d: 0.35, v: 0.4, pan: -0.5 + i * 0.5 }));
    cue(30.48, "swell", { d: 0.5 }); cue(31.55, "whoosh", { d: 0.5, v: 0.5 }); cue(31.78, "glass", { v: 0.8 });
    this.arrive.forEach((a, i) => cue(a, i === 4 ? "chime" : "tick", { v: i === 4 ? 1 : 0.7, pan: -0.7 + i * 0.35 }));
    this.moves.forEach((m) => cue(m, "glassSlide", { d: 0.3, v: 0.5 }));
    cue(34.3, "whoosh", { d: 0.6, v: 0.7, pan: 0.5 }); cue(34.5, "glass", { v: 0.6 });
    PAYOUT.rows.forEach((_, i) => cue(34.8 + i * 0.14, "tick", { v: 0.4, pan: 0.5 }));
    cue(35.35, "count", { d: 0.6 }); cue(35.95, "chime", { v: 0.7 }); cue(36.4, "whoosh", { d: 0.5, v: 0.6 });
    this.widgets.forEach((_, i) => cue(36.5 + i * 0.08, "glass", { v: 0.7, pan: -0.75 + i * 0.5 }));
    cue(36.62, "count", { d: 0.45 }); cue(37.75, "suck", { d: 0.4 });
  },
  lensX(t) { let x = this.nodeX[0]; this.moves.forEach((m, j) => (x += (this.nodeX[j + 1] - this.nodeX[j]) * spring(t - m, 0.42, 0.72))); return x; },
  update(t) {
    // 7a header: slam in, then lift into a header while the track builds
    const lift = E.inOutCubic(inv(31.55, 32.05, t)), hx = E.inCubic(inv(34.25, 34.65, t));
    slamWords(wordsOf(this.h1), t, 30.0, 0.1, null, 0, [-140, 0, 140]);
    slamWords(this.h2words, t, 30.32, 0.1, null, 0, [-120, 0]);
    riseChars(this.h2serif, t, 30.5, 0.03, null);
    tf(this.h1.wrap, { x: this.h1.x, y: this.h1.y - 250 * lift - 80 * hx, s: lerp(1, 0.62, lift), o: 1 - hx });
    tf(this.h2.wrap, { x: this.h2.x, y: this.h2.y - 300 * lift - 80 * hx, s: lerp(1, 0.62, lift), o: 1 - hx });
    // 7b track
    const tin = S(t, 31.75, 0.55, 0.72), tout = E.inCubic(inv(34.3, 34.7, t));
    tf(this.track.el, { x: this.TX, y: this.TY + 90 * tout, sx: lerp(0.15, 1, clamp(tin)), o: clamp((t - 31.75) / 0.15) * (1 - tout) });
    const lx = this.lensX(t), v = Math.abs(this.lensX(t + 0.01) - this.lensX(t - 0.01)) / 0.02, st = clamp(v / 1500);
    this.trail.style.width = Math.max(0, lx - this.TX - 70).toFixed(1) + "px";
    this.trail.style.opacity = clamp((t - 32.2) / 0.3).toFixed(3);
    this.nodes.forEach((nd, i) => {
      const sp = S(t, 31.85 + i * 0.06, 0.45, 0.62), on = t >= this.arrive[i], pulse = on ? Math.exp(-(t - this.arrive[i]) * 5) : 0;
      nd.style.transform = `scale(${(clamp(sp, 0, 1.2) * (1 + 0.12 * pulse)).toFixed(4)})`;
      nd.style.color = on ? "#fff" : "rgba(255,255,255,.6)";
      nd.style.background = on ? (i === 4 ? "linear-gradient(180deg,#45DB76,#25B35A)" : "linear-gradient(180deg,#8597F6,#5C73E8)") : "rgba(120,120,128,.24)";
      nd.style.boxShadow = on ? `inset 0 1.5px 0 rgba(255,255,255,.45), inset 0 0 0 1px rgba(255,255,255,.14), 0 0 ${(18 + 30 * pulse).toFixed(1)}px ${i === 4 ? "rgba(48,209,88,.55)" : "rgba(96,120,236,.6)"}` : "inset 0 1px 0 rgba(255,255,255,.22), inset 0 0 0 1px rgba(255,255,255,.06)";
    });
    const born = S(t, 31.98, 0.4, 0.66), lo = E.inCubic(inv(34.3, 34.65, t));
    tf(this.tlens.el, { x: lx - 88, y: this.TY + this.TH / 2 - 64 + 90 * lo, sx: (1 + 0.24 * st) * clamp(born, 0, 1.2) * (1 - lo), sy: (1 - 0.06 * st) * clamp(born, 0, 1.2) * (1 - lo), o: clamp((t - 31.98) / 0.1) * (1 - lo) });
    Glass.illum(this.tlens, 0.25 + 0.5 * st, 50, 40);
    this.labels.forEach((l, i) => {
      const p = E.outCubic(clamp((t - 31.95 - i * 0.06) / 0.4)), on = t >= this.arrive[i];
      tf(l, { x: this.nodeX[i] - l.w / 2, y: this.TY + this.TH + 30 + (1 - p) * 20 + 60 * tout, o: p * (1 - tout) * (on ? 1 : 0.5) });
    });
    // 7c payout breakdown
    const pin = S(t, 34.45, 0.6, 0.74), pout = E.inCubic(inv(36.35, 36.75, t));
    tf(this.phone.root, { p: 2400, x: 1400 - 215 + (1 - pin) * 800 + 700 * pout, y: 556 - 466 + Math.sin(t * 1.2) * 6, s: 0.92, ry: -16 + (1 - pin) * -40 - 25 * pout, rx: 3,
      o: clamp((t - 34.45) / 0.15) * (1 - pout) });
    Phone.island(this.phone, 0);
    const qs = this.pay.rows.map((r, i) => E.outCubic(inv(34.8 + i * 0.14, 35.1 + i * 0.14, t)));
    this.pay.rows.forEach((r, i) => { r.style.opacity = qs[i].toFixed(3); r.style.transform = `translateX(${((1 - qs[i]) * 30).toFixed(1)}px)`; });
    Phone.growList(this.pay.list, this.pay.rows, qs);
    this.pay.totalEl.textContent = money(Math.round(PAYOUT.net * E.outCubic(inv(35.35, 35.95, FT))), 0);
    const fo = E.outCubic(inv(35.95, 36.2, t));
    this.pay.foot.style.opacity = fo.toFixed(3); this.pay.foot.style.transform = `translateY(${((1 - fo) * 8).toFixed(1)}px)`;
    this.big.forEach((ln, j) => {
      if (j < 2) slamWords(wordsOf(ln), t, 34.55 + j * 0.12, 0.08, 36.35, 0.02, [-100, 100]);
      else riseChars(ln.chars, t, 34.85, 0.03, 36.38);
    });
    // 7d widgets
    this.widgets.forEach((g, i) => {
      const t0 = 36.5 + i * 0.08, sp = S(t, t0, 0.55, 0.7), xo = E.inExpo(inv(37.72, 38.08, t));
      const x = 300 + i * 440 - 196, y = 500 - 165;
      tf(g.el, { p: 1600, x: lerp(x, 960 - 196, xo), y: y + (1 - sp) * 320, rx: (1 - sp) * 50, s: lerp(0.7, 1, clamp(sp)) * (1 - 0.8 * xo), o: clamp((t - t0) / 0.15) * (1 - xo), b: 10 * xo });
      const c = clamp((FT - 36.62) / 0.45);
      g.bigEl.textContent = g.big === "3x" ? `${Math.max(1, Math.round(3 * E.outCubic(c)))}x` : g.big === "120+" ? `${Math.round(120 * E.outCubic(c))}+` : g.big.slice(0, Math.ceil(g.big.length * clamp((FT - t0 - 0.12) / 0.3)));
      Glass.illum(g, t > t0 ? 0.5 * Math.exp(-(t - t0 - 0.08) * 3.5) : 0, 25, 0);
    });
    wordsOf(this.trust).forEach((w, i) => { const p = E.outCubic(clamp((t - 37.05 - i * 0.03) / 0.4)), xo = E.inCubic(inv(37.72, 38.05, t)); tf(w, { y: (1 - p) * 24, o: p * (1 - xo), b: 6 * xo }); });
  },
  cam(t) {
    const a = E.inOutSine(inv(30, 34.3, t)), b = E.inOutSine(inv(34.3, 36.4, t));
    return { x: lerp(0, -20, b), y: 0, s: 1 + 0.03 * a - 0.02 * b + 0.015 * Math.exp(-Math.max(0, t - 30) * 4), r: Math.sin(t * 0.4) * 0.3 };
  },
});

// ================================================================= 8 · CALL TO ACTION (38 – 45)
scene({
  name: "cta", t0: 37.95, t1: 45.0,
  build() {
    const root = this.root;
    this.l1 = textLine(root, [["disp", "Your team is ready to scale.", "font-size:118px"]], 960, 440);
    this.l2 = textLine(root, [["disp", "Is your ", "font-size:118px"], ["serif", "back office?", "font-size:140px;line-height:.9"]], 960, 598);
    const n = "back office?".replace(/ /g, "").length; this.l2serif = this.l2.chars.slice(-n);
    this.l2serif.forEach((c, i) => (c.style.color = serifCol(i, n)));
    this.allChars = [...this.l1.chars, ...this.l2.chars];
    this.charPos = this.allChars.map((c) => { const r = c.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
    // end card logo
    const S2 = 820 / 394.81, left = 960 - 410, top = 392 - (135.94 * S2) / 2;
    this.logo = el("div", "abs", root); this.logo.innerHTML = LOGO_SVG("lg-end");
    css(this.logo.firstElementChild, { width: "820px", height: 135.94 * S2 + "px", overflow: "visible" });
    tf(this.logo, { x: left, y: top }); this.logoPos = { left, top };
    this.marks = [...this.logo.querySelectorAll(".mk")]; this.lens = this.marks.map((p) => p.getTotalLength());
    this.marks.forEach((p, i) => (p.style.strokeDasharray = this.lens[i]));
    this.clip = this.logo.querySelector("#lg-end-clip rect"); this.glint = this.logo.querySelector("#lg-end-gl"); this.sheen = this.logo.querySelector("#lg-end-sh");
    this.markG = this.logo.querySelector(".mark");
    // "Book a demo" — iOS 26 glass prominent button
    this.btn = Glass.make(root, { w: 440, h: 108, r: "pill", variant: "prominent" });
    this.btn.content.innerHTML = `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:14px;font:600 38px/1 Inter;letter-spacing:-.01em">Book a demo${icon("arrow", 34, 2.6)}</div>`;
    this.btn.el.style.zIndex = 5;
    this.url = textLine(root, [["", "sequifi.com", "font:600 36px Inter;color:rgba(235,238,255,.84);letter-spacing:.01em"]], 960, 768);
    const badges = [["shield", "SOC 2 Type II certified"], ["star", "Capterra Best Value 2026"], ["team", "Trusted by 20,000+ reps, managers, and operators"]];
    let total = 0;
    this.badges = badges.map(([ic, txt]) => { const g = IOS.chip(root, txt, { fs: 23, h: 58, icon: ic }); total += g.w; return g; });
    total += 16 * (badges.length - 1);
    let x = 960 - total / 2; this.badges.forEach((g) => { g.x = x; x += g.w + 16; });
    // sound
    cue(38.0, "impact", { v: 0.5 }); [38.0, 38.1, 38.2, 38.3].forEach((t, i) => cue(t, "whoosh", { d: 0.3, v: 0.35, pan: -0.6 + i * 0.4 }));
    cue(38.55, "swell", { d: 0.6 }); cue(38.6, "riser", { d: 1.4, v: 1 }); cue(39.35, "suck", { d: 0.65 }); cue(39.4, "reverse", { d: 0.6 });
    cue(40.0, "impact", { v: 1.2 }); cue(40.0, "boom", { v: 1.1 }); cue(40.0, "draw", { d: 0.8 }); cue(40.25, "glassSlide", { d: 0.7 });
    cue(40.92, "glass", { v: 1 }); cue(41.05, "bell", { v: 0.9 });
    this.badges.forEach((_, i) => cue(41.3 + i * 0.09, "tick", { v: 0.5, pan: -0.5 + i * 0.5 }));
    cue(42.0, "shimmer"); cue(42.6, "click", { v: 0.8 }); cue(42.62, "bell", { v: 0.5 });
  },
  update(t) {
    // headline, then every letter is pulled into the point where the logo will draw
    const imp = inv(39.3, 39.95, t), k = E.inExpo(imp), cx = 960, cy = 392;
    if (t < 39.98) {
      wordsOf(this.l1).forEach((w, i) => { const p = E.outExpo(clamp((t - 38.0 - i * 0.1) / 0.45)); w.style.transformOrigin = "0 70%"; tf(w, { s: lerp(1.32, 1, p), o: clamp(p * 1.8), b: (1 - p) * 8 }); });
      wordsOf(this.l2).slice(0, 2).forEach((w, i) => { const p = E.outExpo(clamp((t - 38.3 - i * 0.1) / 0.45)); w.style.transformOrigin = "0 70%"; tf(w, { s: lerp(1.32, 1, p), o: clamp(p * 1.8), b: (1 - p) * 8 }); });
      riseChars(this.l2serif, t, 38.55, 0.03, null);
      // every char is fully re-styled each frame (renderers seek in any order, so nothing may depend on the previous frame)
      this.allChars.forEach((c, i) => {
        const serif = this.l2serif.includes(c), base = serif ? c.style.transform : "";
        if (k <= 0) { if (!serif) { c.style.transform = "none"; c.style.filter = "none"; c.style.opacity = ""; } return; }
        const [px, py] = this.charPos[i];
        c.style.transform = `${base} translate(${((cx - px) * k).toFixed(1)}px, ${((cy - py) * k).toFixed(1)}px) scale(${(1 - 0.85 * k).toFixed(3)})`;
        c.style.filter = `blur(${(10 * k).toFixed(1)}px)`; c.style.opacity = (1 - inv(0.7, 1, k)).toFixed(3);
      });
      this.l1.wrap.style.display = this.l2.wrap.style.display = "";
    } else this.l1.wrap.style.display = this.l2.wrap.style.display = "none";
    // end card
    const L = this.logoPos, on = t >= 39.98;
    this.logo.style.visibility = on ? "visible" : "hidden";
    if (on) {
      this.marks.forEach((p, i) => { const q = E.inOutCubic(clamp((t - 40.0 - i * 0.07) / 0.75)); p.style.strokeDashoffset = (this.lens[i] * (1 - q)).toFixed(2); });
      const rv = E.inOutCubic(inv(40.22, 40.95, t)), edge = 105 + 290 * rv + 90 * E.inQuad(inv(40.85, 41.2, t));
      this.clip.setAttribute("width", (5 + 290 * rv).toFixed(2));
      this.glint.setAttribute("x1", (edge - 70).toFixed(2)); this.glint.setAttribute("x2", edge.toFixed(2));
      const sx = lerp(20, 480, E.inOutCubic(inv(41.95, 42.75, t)));   // sheen across the whole logo
      this.sheen.setAttribute("x1", (sx - 60).toFixed(2)); this.sheen.setAttribute("x2", (sx + 60).toFixed(2));
      this.markG.style.filter = `drop-shadow(0 0 ${(8 + 12 * env(t, 40, 41.6, 0.3, 0.8)).toFixed(1)}px rgba(96,120,236,.95))`;
      const push = E.inOutSine(inv(40, 45, t));
      tf(this.logo, { x: L.left, y: L.top - 8 * push, s: 1 + 0.02 * push });
    }
    // the button materialises (scale + blur → crisp, glass lights up), then gets pressed
    const m = S(t, 40.9, 0.55, 0.66), press = t > 42.6 ? 1 - 0.045 * Math.sin(clamp((t - 42.6) / 0.24) * Math.PI) : 1;
    const breathe = t > 41.6 ? 1 + 0.006 * Math.sin((t - 41.6) * 2.4) : 1;
    tf(this.btn.el, { x: 960 - 220, y: 640 - 54 - 6 * E.inOutSine(inv(40, 45, t)), s: lerp(0.72, 1, clamp(m, 0, 1.2)) * press * breathe, o: clamp((t - 40.9) / 0.12), b: Math.max(0, 1 - clamp(m)) * 10 });
    Glass.illum(this.btn, (t > 40.95 ? 0.7 * Math.exp(-(t - 40.95) * 3) : 0) + (t > 42.6 ? 0.9 * Math.exp(-(t - 42.6) * 2.6) : 0), t > 42.5 ? 64 : 50, t > 42.5 ? 58 : 0);
    wordsOf(this.url).forEach((w, i) => { const p = E.outCubic(clamp((t - 41.05 - i * 0.04) / 0.5)); tf(w, { y: (1 - p) * 22, o: p, b: (1 - p) * 4 }); });
    this.badges.forEach((g, i) => { const sp = S(t, 41.3 + i * 0.09, 0.5, 0.7); tf(g.el, { x: g.x, y: 862 + (1 - sp) * 40, s: lerp(0.7, 1, clamp(sp)), o: clamp((t - 41.3 - i * 0.09) / 0.15) }); });
  },
  cam(t) { const p = E.inOutSine(inv(38, 39.3, t)), q = E.inOutSine(inv(40, 45, t)); return { x: 0, y: 0, s: 1 + 0.03 * p + 0.035 * q, r: lerp(-0.5, 0, q) }; },
  particles(t, ps) { ps.implode = inv(39.3, 39.95, t) * (t < 40 ? 1 : 0); ps.iy = 392; },
});
