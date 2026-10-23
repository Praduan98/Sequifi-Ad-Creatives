// Scenes 4–5: "Every trade pays differently." → six featured industries (12 – 24) → 3D wall of all twelve (24 – 27).
"use strict";

const IND_T0 = 12, IND_SEG = 2;
const indStart = (k) => IND_T0 + k * IND_SEG;
const num = (s) => parseFloat(String(s).replace(/[^0-9.]/g, ""));

scene({
  name: "industries", t0: 9.95, t1: 24.45,
  build() {
    const root = this.root;
    // ---------- intro title
    this.l1 = textLine(root, [["disp", "Every trade pays", "font-size:150px"]], 960, 452);
    this.l2 = textLine(root, [["serif", "differently.", "font-size:190px;line-height:.9"]], 960, 626);
    this.l2.chars.forEach((c, i, a) => (c.style.color = serifCol(i, a.length)));
    this.l1w = wordsOf(this.l1);
    cue(10.0, "impact", { v: 0.5 }); [10.0, 10.12, 10.24].forEach((t, i) => cue(t, "whoosh", { d: 0.35, v: 0.4, pan: [-0.6, 0, 0.6][i] }));
    cue(10.5, "swell", { d: 0.5 }); cue(11.12, "whoosh", { d: 0.5, v: 0.5 });

    // ---------- rail: the site's Industries menu as a floating glass tab bar, with a glass lens on the active tab
    this.RW = 1700; this.RH = 88; this.RX = 960 - this.RW / 2; this.RY = 96 - this.RH / 2;
    this.rail = Glass.make(root, { w: this.RW, h: this.RH, r: "pill", variant: "clear", look: { frost: 3, sat: 1.7 } });
    this.rail.el.style.zIndex = 6;
    const clip = el("div", "abs", this.rail.content);
    css(clip, { left: "16px", top: "0", width: this.RW - 32 + "px", height: this.RH + "px", overflow: "hidden",
      WebkitMaskImage: "linear-gradient(90deg, transparent, #000 70px, #000 calc(100% - 70px), transparent)" });
    this.track = el("div", "rail-track", clip);
    this.pills = ALL_INDUSTRIES.map(([n, ic]) => el("div", "rail-pill", this.track, `${icon(ic, 26, 2)}<span>${n}</span>`));
    this.pillC = this.pills.map((p) => p.offsetLeft + p.offsetWidth / 2);
    this.pillW = this.pills.map((p) => p.offsetWidth);
    this.trackW = this.track.scrollWidth; this.clipW = this.RW - 32;
    this.order = INDUSTRIES.map((d) => ALL_INDUSTRIES.findIndex((a) => a[0] === d.name));
    this.lens = Glass.dynamic(root, { variant: "lens", r: "pill", w: 160, h: 72 });
    this.lens.el.style.zIndex = 7;
    // flyers: copies of the pills that fly in and dock before the rail takes over
    this.flyers = ALL_INDUSTRIES.map(([n, ic]) => { const f = el("div", "abs rail-pill", root, `${icon(ic, 26, 2)}<span>${n}</span>`); f.style.color = "#fff"; f.style.zIndex = 8; return f; });
    const R = rng(5); this.flyFrom = this.flyers.map(() => ({ a: R() * Math.PI * 2, r: 700 + R() * 500, s: 1.5 + R() * 1.2, rot: (R() - 0.5) * 40 }));
    this.flyers.forEach((_, i) => cue(10.85 + i * 0.04 + 0.45, "tick", { v: 0.35, pan: (i / 11) * 1.6 - 0.8 }));
    cue(11.62, "glass", { v: 0.9 }); cue(11.7, "pop", { v: 0.5, pan: -0.6 });

    // ---------- photos (behind the world layer) and the glass slab that wipes between them
    this.photos = INDUSTRIES.map((d) => { const p = el("div", "photo", LAYER.photos); p.innerHTML = `<img src="../assets/photos/${d.photo}.jpg"><div class="shade"></div>`; p.style.visibility = "hidden"; return p; });
    this.wipe = Glass.make(root, { w: 230, h: 1560, r: "pill", variant: "clear", look: { frost: 1.2, sat: 1.5, bezel: 72 } });
    this.wipe.el.style.zIndex = 9;

    // ---------- per industry: eyebrow, name, rule chips, the site's deal example as a widget card
    this.blocks = INDUSTRIES.map((d, k) => {
      const s = indStart(k), b = { d, s };
      b.eb = el("div", "abs eyebrow", root, `<span style="display:inline-flex;align-items:center;gap:14px">${icon(d.icon, 28, 2.2)}0${k + 1} <span style="opacity:.45">/ 06</span></span>`);
      b.nameWrap = el("div", "abs", root); css(b.nameWrap, { overflow: "hidden", padding: "6px 30px 18px 6px" });
      const nm = el("div", "disp", b.nameWrap); nm.style.fontSize = "136px";
      b.chars = splitChars(nm, d.name);
      tf(b.nameWrap, { x: 114, y: 324 });
      let cx = 120;
      b.chips = d.rules.map((r) => { const g = IOS.chip(root, r, { fs: 26, h: 62 }); g.x = cx; cx += g.w + 12; return g; });
      b.card = Glass.make(root, { w: 700, h: 232, r: 46, variant: "regular", cls: "deal" });
      b.card.content.innerHTML = `<div class="d-row" style="top:30px"><div class="d-cap">${icon("bolt", 19, 2.3)}Synced from your CRM</div>
          <div class="d-line"><span class="d-k">${d.deal[0]}</span><span class="d-v">${d.deal[1]}</span></div></div>
        <div class="d-sep" style="top:116px"></div><div class="d-arrow" style="left:330px;top:96px">${icon("arrowDown", 22, 2.6)}</div>
        <div class="d-row r2" style="top:138px"><div class="d-cap">${icon("calculate", 19, 2.3)}Commission calculated</div>
          <div class="d-line"><span class="d-k">${d.comm[0]}</span><span class="d-v num">$0.00</span></div></div>`;
      b.row1 = b.card.content.querySelector(".d-row"); b.row2 = b.card.content.querySelector(".r2");
      b.comm = b.row2.querySelector(".d-v"); b.commV = num(d.comm[1]);
      b.sep = b.card.content.querySelector(".d-sep"); b.arr = b.card.content.querySelector(".d-arrow");
      b.card.el.style.zIndex = 4;
      // sound
      cue(s - 0.34, "wipe", { d: 0.55 }); cue(s, "impact", { v: 0.32 });
      d.rules.forEach((_, j) => cue(s + 0.18 + j * 0.06, "tick", { v: 0.3, pan: -0.7 + j * 0.15 }));
      cue(s + 0.3, "glass", { v: 0.55, pan: -0.45 }); cue(s + 0.62, "count", { d: 0.38 }); cue(s + 1.02, "click", { v: 0.6, pan: 0.5 });
      cue(s + 1.1, "notify", { pan: 0.5, v: 0.8 }); cue(s + 1.45, "chime", { v: 0.55, pan: 0.5 });
      return b;
    });
    // ---------- phone: one payout-cycle screen per industry, a Live Activity per payout
    this.phone = Phone.make(root); this.phone.root.style.zIndex = 2;
    this.screens = INDUSTRIES.map((d) => Phone.cycleScreen(this.phone.apps, d));
    this.acts = INDUSTRIES.map((d) => Phone.liveActivity(this.phone, { title: d.reps ? "Payouts approved" : "Payout sent", sub: `${d.name} · this pay period`, value: money(d.total, 0) }));
    cue(11.62, "whoosh", { d: 0.7, v: 0.7, pan: 0.6 });
    cue(23.7, "whoosh", { d: 0.6, v: 0.6 });
  },

  // rail scroll / lens target (index into ALL_INDUSTRIES) as a spring between the featured industries
  railAt(t) {
    const target = (i) => {
      const scroll = clamp(this.pillC[i] - this.clipW / 2, 0, this.trackW - this.clipW);
      return { scroll, x: this.pillC[i] - scroll, w: this.pillW[i] };
    };
    let a = target(this.order[0]); let scroll = a.scroll, x = a.x, w = a.w, vel = 0;
    for (let k = 1; k < INDUSTRIES.length; k++) {
      const b = target(this.order[k]), T = indStart(k) - 0.14, sp = spring(t - T, 0.48, 0.66);
      const sv = (spring(t - T + 0.01, 0.48, 0.66) - spring(t - T - 0.01, 0.48, 0.66)) / 0.02;
      scroll += (b.scroll - a.scroll) * sp; x += (b.x - a.x) * sp; w += (b.w - a.w) * sp; vel += Math.abs(b.x - a.x) * sv;
      a = b;
    }
    return { scroll, x, w, vel };
  },
  // tab-bar lens: stretches along its motion and squashes across it (iOS 26 gel), materialises with the rail
  lensAt(t) {
    const ra = this.railAt(t), st = clamp(ra.vel / 2600);
    return { x: this.RX + 16 + ra.x, w: (ra.w + 8) * (1 + 0.3 * st), h: 72 * (1 - 0.07 * st), st };
  },
  prewarm() { for (let t = 11.6; t < 24.3; t += 1 / 480) { const l = this.lensAt(t); this.lens.size(l.w, l.h); } this.lens.frozen = true; },

  update(t) {
    // --- intro title
    this.l1w.forEach((w, i) => {
      const p = E.outExpo(clamp((t - 10.0 - i * 0.12) / 0.5)), xo = E.inCubic(clamp((t - 11.1 - i * 0.05) / 0.4));
      w.style.transformOrigin = "0 70%";
      tf(w, { s: lerp(1.32, 1, p), x: [-110, 0, 110][i] * (1 - p), o: clamp(p * 1.8) * (1 - xo), b: (1 - p) * 8 + 8 * xo, y: -60 * xo });
    });
    this.l2.chars.forEach((c, i) => {
      const d = 10.5 + i * 0.035, s = S(t, d, 0.5, 0.7), xo = E.inCubic(clamp((t - 11.16 - i * 0.012) / 0.38));
      tf(c, { y: (1 - s) * 130 - 70 * xo, o: clamp((t - d) / 0.12) * (1 - xo), b: Math.max(0, 1 - s) * 6 + 8 * xo, r: (1 - s) * -8 });
    });
    // --- flyers dock into the rail, then the rail takes over
    const railOut = E.inCubic(inv(23.75, 24.25, t));
    const ra = this.railAt(t);
    this.flyers.forEach((f, i) => {
      const t0 = 10.85 + i * 0.04, p = E.outExpo(clamp((t - t0) / 0.6));
      const dockX = this.RX + 16 + this.pillC[i] - ra.scroll - this.pillW[i] / 2, dockY = this.RY + (this.RH - 62) / 2;
      const fr = this.flyFrom[i], sx = 960 + Math.cos(fr.a) * fr.r, sy = 540 + Math.sin(fr.a) * fr.r * 0.6;
      const o = clamp((t - t0) / 0.18) * (1 - inv(11.7, 11.78, t));
      tf(f, { x: lerp(sx, dockX, p), y: lerp(sy, dockY, p), s: lerp(fr.s, 1, p), r: fr.rot * (1 - p), o, b: (1 - p) * 8 });
    });
    const rIn = E.outCubic(inv(11.62, 11.78, t));
    tf(this.rail.el, { x: this.RX, y: this.RY - 140 * railOut, o: rIn * (1 - railOut) });
    this.track.style.transform = `translateX(${(-ra.scroll).toFixed(2)}px)`;
    const k6 = clamp(Math.floor((t - IND_T0 + 0.14) / IND_SEG), 0, 5), activeIdx = this.order[k6];
    this.pills.forEach((p, i) => p.classList.toggle("on", i === activeIdx && t > 11.8));
    // lens
    if (t < 11.62 || t > 24.3) tf(this.lens.el, { o: 0 });
    else {
      const l = this.lensAt(t), m = S(t, 11.66, 0.42, 0.62);
      this.lens.size(l.w, l.h);
      tf(this.lens.el, { x: l.x - this.lens.w / 2, y: this.RY + this.RH / 2 - this.lens.h / 2 - 140 * railOut, sx: (1 + 0.1 * l.st) * lerp(0.6, 1, m), sy: lerp(0.6, 1, m),
        o: clamp((t - 11.66) / 0.1) * (1 - railOut) });
      Glass.illum(this.lens, 0.5 * l.st, 50, 50);
    }

    // --- photos + glass wipe slab
    const tan = Math.tan((12 * Math.PI) / 180);
    let wipeShown = false;
    this.photos.forEach((ph, k) => {
      const s = indStart(k), start = k === 0 ? 11.55 : s - 0.36, end = k === 5 ? 24.4 : indStart(k + 1) + 0.3;
      if (t < start || t > end) { ph.style.visibility = "hidden"; return; }
      ph.style.visibility = "visible";
      const life = inv(start, end, t), img = ph.firstElementChild;
      img.style.transform = `scale(${(1.09 - 0.07 * life).toFixed(4)}) translateX(${(-24 * life).toFixed(2)}px)`;
      let op = 1;
      if (k === 0) op = E.outCubic(inv(11.55, 12.15, t));
      if (k === 5) op *= 1 - E.inCubic(inv(23.8, 24.35, t));
      ph.style.opacity = op.toFixed(3);
      if (k > 0 && t < s + 0.24) {
        const p = E.inOutCubic(inv(s - 0.36, s + 0.24, t)), bx = lerp(2160, -260, p);
        ph.style.clipPath = `polygon(${bx + 540 * tan}px 0, 2400px 0, 2400px 1080px, ${bx - 540 * tan}px 1080px)`;
        const v = Math.abs(lerp(2160, -260, E.inOutCubic(inv(s - 0.36, s + 0.24, t + 0.005))) - bx) / 0.005;   // px/s
        tf(this.wipe.el, { x: bx - 115, y: 540 - 780, r: 12, o: 1, b: clamp(v / 12000) * 3 });
        wipeShown = true;
      } else ph.style.clipPath = "none";
    });
    if (!wipeShown) tf(this.wipe.el, { o: 0 });

    // --- per-industry beats
    for (const b of this.blocks) this.block(b, t);

    // --- phone: rises in, floats, pushes a new screen per industry; the island reports each payout
    const pin = S(t, 11.62, 0.62, 0.74), pout = E.inCubic(inv(23.72, 24.3, t));
    const fl = Math.sin(t * 1.15) * 8, sw = Math.sin(t * 0.7) * 2.2;
    tf(this.phone.root, { p: 2400, x: 1490 - 215 + 900 * pout, y: 594 - 466 + (1 - pin) * 950 + fl, s: 0.9 * lerp(0.82, 1, clamp(pin)),
      ry: -14 + sw + (1 - pin) * -45 - 30 * pout, rx: 3 + (1 - pin) * 26, r: (1 - pin) * 8, o: clamp((t - 11.6) / 0.15) * (1 - pout) });
    this.screens.forEach((sc, k) => {
      const s = indStart(k), pIn = k === 0 ? 1 : E.outQuint(inv(s - 0.06, s + 0.44, t)), pNext = k < 5 ? E.outQuint(inv(indStart(k + 1) - 0.06, indStart(k + 1) + 0.44, t)) : 0;
      const vis = (k === 0 || t >= s - 0.06) && pNext < 1;
      sc.el.style.visibility = vis ? "visible" : "hidden";
      if (!vis) return;
      sc.el.style.transform = `translateX(${((1 - pIn) * 430 - pNext * 130).toFixed(2)}px)`;   // iOS push: the old screen parallaxes and dims
      sc.el.style.filter = pNext > 0.001 ? `brightness(${(1 - 0.45 * pNext).toFixed(3)})` : "none";
      sc.el.style.zIndex = k;
      const r0 = k === 0 ? 11.86 : s + 0.12;   // the first screen fills in as the phone arrives
      const qs = sc.rows.map((r, i) => E.outCubic(inv(r0 + i * 0.06, r0 + 0.28 + i * 0.06, t)));
      sc.rows.forEach((r, i) => { r.style.opacity = qs[i].toFixed(3); r.style.transform = `translateY(${((1 - qs[i]) * 12).toFixed(2)}px)`; });
      Phone.growList(sc.list, sc.rows, qs);
      sc.totalEl.textContent = money(Math.round(sc.total * E.outCubic(inv(s + 0.25, s + 1.0, FT))), 0);
      const pr = t > s + 1.02 ? 1 - 0.05 * Math.sin(clamp((t - s - 1.02) / 0.22) * Math.PI) : 1;
      sc.btn.style.transform = `scale(${pr.toFixed(4)})`;
      sc.btn.style.filter = t > s + 1.02 && t < s + 1.4 ? `brightness(${(1 + 0.25 * Math.sin(clamp((t - s - 1.02) / 0.38) * Math.PI)).toFixed(3)})` : "none";
    });
    // Live Activity: expands on the payout, holds, folds back into the island before the next industry
    let isl = 0, act = null, bar = 0;
    for (let k = 0; k < 6; k++) {
      const s = indStart(k), e = S(t, s + 1.06, 0.5, 0.7) - S(t, s + 1.62, 0.36, 0.86);
      if (t > s + 1.0 && t < s + 2.2 && e > isl) { isl = e; act = this.acts[k]; bar = E.inOutCubic(inv(s + 1.12, s + 1.45, t)); }
    }
    Phone.island(this.phone, isl, act, bar);
  },

  block(b, t) {
    const s = b.s, out = s + 1.64, vis = t > s - 0.1 && t < s + 2.05;
    const els = [b.eb, b.nameWrap, b.card.el, ...b.chips.map((g) => g.el)];
    if (!vis) { els.forEach((e) => (e.style.visibility = "hidden")); return; }
    const xo = (d = 0) => E.inCubic(clamp((t - out - d) / 0.34));
    // eyebrow + name (masked rise)
    const pe = E.outCubic(inv(s, s + 0.4, t));
    tf(b.eb, { x: 124 + (1 - pe) * -30, y: 296, o: pe * (1 - xo()) });
    b.nameWrap.style.visibility = "visible";
    b.chars.forEach((c, i) => { const p = E.outExpo(clamp((t - s - 0.04 - i * 0.022) / 0.55)), x2 = xo(i * 0.012); tf(c, { y: (1 - p) * 170 - 170 * x2, r: (1 - p) * 4 }); });
    // rule chips
    b.chips.forEach((g, j) => {
      const sp = S(t, s + 0.18 + j * 0.06, 0.45, 0.66), x2 = xo(0.04 + j * 0.03);
      tf(g.el, { x: g.x - 60 * E.inQuad(x2), y: 512 + (1 - sp) * 40, s: lerp(0.6, 1, clamp(sp)), o: clamp((t - s - 0.18 - j * 0.06) / 0.14) * (1 - x2), b: 6 * x2 });
      Glass.illum(g, t > s + 0.2 + j * 0.06 ? 0.5 * Math.exp(-(t - s - 0.2 - j * 0.06) * 6) : 0, 50, 0);
    });
    // deal widget: springs up, then deal → commission (counts up)
    const cs = S(t, s + 0.28, 0.55, 0.72), x2 = xo(0.06);
    tf(b.card.el, { p: 1800, x: 120 - 700 * E.inQuad(x2), y: 616 + (1 - cs) * 120, s: lerp(0.86, 1, clamp(cs)), rx: (1 - clamp(cs)) * 24, ry: 14 * x2, o: clamp((t - s - 0.28) / 0.14) * (1 - x2), b: 8 * x2 });
    const r1 = E.outCubic(inv(s + 0.36, s + 0.62, t)), r2 = E.outCubic(inv(s + 0.6, s + 0.86, t));
    b.row1.style.opacity = r1.toFixed(3); b.row1.style.transform = `translateY(${((1 - r1) * 14).toFixed(2)}px)`;
    b.row2.style.opacity = r2.toFixed(3); b.row2.style.transform = `translateY(${((1 - r2) * 14).toFixed(2)}px)`;
    b.sep.style.transform = `scaleX(${E.outCubic(inv(s + 0.5, s + 0.8, t)).toFixed(4)})`;
    const pa = S(t, s + 0.56, 0.4, 0.6);
    b.arr.style.transform = `scale(${clamp(pa, 0, 1.3).toFixed(4)})`;
    b.comm.textContent = money(b.commV * E.outCubic(inv(s + 0.62, s + 1.0, FT)));
    Glass.illum(b.card, t > s + 0.3 ? 0.55 * Math.exp(-(t - s - 0.3) * 4) : 0, 20, 0);
  },

  cam(t) {
    // zoom-through arrival from the logo, then a whip (pan + roll + punch) on every glass wipe
    const arrive = E.outExpo(inv(9.9, 10.7, t));
    let x = Math.sin(t * 0.5) * 10, y = Math.cos(t * 0.4) * 6, s = 1 + 0.32 * (1 - arrive), r = Math.sin(t * 0.35) * 0.3 + (1 - arrive) * -3;
    for (let k = 1; k < INDUSTRIES.length; k++) {
      const w = indStart(k) - 0.36, a = inv(w, w + 0.28, t), b = inv(w + 0.28, w + 0.75, t);
      const whip = E.inQuad(a) * (1 - E.outCubic(b));
      x += -70 * whip; s += 0.035 * whip; r += -0.9 * whip;
    }
    return { x, y, s, r };
  },
  always(t) { if (t < 11.5 || t > 24.45) this.photos.forEach((p) => (p.style.visibility = "hidden")); },
});

// ================================================================= 5 · THE WALL OF TWELVE (24 – 27)
scene({
  name: "wall", t0: 23.9, t1: 27.15,
  build() {
    this.tiles = ALL_INDUSTRIES.map(([n, ic, ph], i) => {
      const g = Glass.make(this.root, { w: 410, h: 292, r: 50, variant: "regular", cls: "tile" });
      g.content.innerHTML = `<div class="t-photo"><img src="../assets/photos/${ph}.jpg"></div><div class="t-meta"><div class="t-name">${icon(ic, 30, 2.2)}${n}</div><div class="t-line">${CARD_LINES[n]}</div></div>`;
      g.c = i % 4; g.r = Math.floor(i / 4);
      g.d = Math.hypot(g.c - 1.5, (g.r - 1) * 1.2);
      cue(24.05 + g.d * 0.07, "glass", { v: 0.45, pan: (g.c - 1.5) / 2 });
      return g;
    });
    cue(24.0, "impact", { v: 0.6 }); cue(24.0, "whoosh", { d: 1.2, v: 0.6 }); cue(26.35, "whoosh", { d: 0.7, v: 0.8 }); cue(26.9, "reverse", { d: 0.5 });
  },
  update(t) {
    const yaw = K(t, [[24.0, 30, E.outCubic], [26.4, -6]]), pitch = K(t, [[24.0, 16, E.outCubic], [26.4, 4]]);
    const dist = K(t, [[24.0, 2300, E.outCubic], [26.4, 1650]]), f = 1500;
    const ya = (yaw * Math.PI) / 180, pa = (pitch * Math.PI) / 180;
    for (const g of this.tiles) {
      const X = (g.c - 1.5) * 445, Y = (g.r - 1) * 322;
      const X1 = X * Math.cos(ya), Z1 = -X * Math.sin(ya);
      const Y2 = Y * Math.cos(pa) - Z1 * Math.sin(pa), Z2 = Y * Math.sin(pa) + Z1 * Math.cos(pa);
      const d = dist + Z2, sc = f / d;
      const t0 = 24.05 + g.d * 0.07, sp = S(t, t0, 0.55, 0.7);
      const xo = E.inCubic(clamp((t - 26.35 - g.d * 0.05) / 0.55));
      const sx = 960 + (f * X1) / d, sy = 540 + (f * Y2) / d;
      const ox = (sx - 960) * xo * 1.6, oy = (sy - 540) * xo * 1.6;
      tf(g.el, { p: 1700, x: sx - 205 + ox, y: sy - 146 + oy, s: sc * (1 + 0.6 * xo), ry: -yaw, rx: pitch + (1 - sp) * 80, o: clamp((t - t0) / 0.18) * (1 - xo), b: 8 * xo });
      Glass.illum(g, t > t0 ? 0.45 * Math.exp(-(t - t0 - 0.1) * 3) : 0, 30, 0);
    }
  },
  cam(t) { return { x: 0, y: 0, s: 1 + 0.02 * Math.sin(inv(24, 27, t) * Math.PI), r: K(t, [[24, -1.2], [27, 0.8]]) }; },
});
