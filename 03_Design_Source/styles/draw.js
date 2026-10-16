// Hand-drawn annotations (arrows, error circles, split connectors), drawn after layout so they land on their targets.
// Then a layout QA pass: arrows or notes touching text, text cut off by the card edge, notes reading as an eyebrow.
// QA results go to <body data-qa="[...]">, which build.mjs reads.
// Waits for web fonts: measuring before Caveat loads puts arrows in the wrong place.
const FONTS = ['700 50px "Caveat"', 'italic 400 100px "Instrument Serif"', '700 100px "Schibsted Grotesk"', '600 20px "Inter"', '400 30px "DM Sans"'];
Promise.all(FONTS.map((f) => document.fonts.load(f))).then(() => document.fonts.ready).then(() => {
  const NS = "http://www.w3.org/2000/svg";
  const card = document.querySelector(".card");
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "links");
  svg.setAttribute("viewBox", "0 0 1080 1350");
  svg.innerHTML = `<defs>
    <filter id="lift" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="2" stdDeviation="3.5" flood-color="#050817" flood-opacity=".6"/></filter>
    <linearGradient id="fanGrad" x1="0" x2="1"><stop offset="0" stop-color="#8FA0F5"/><stop offset="1" stop-color="#6078EC"/></linearGradient>
  </defs>`;
  card.appendChild(svg);

  const base = card.getBoundingClientRect();
  const box = (el) => {
    const r = el.getBoundingClientRect();
    return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height,
             cx: r.left - base.left + r.width / 2, cy: r.top - base.top + r.height / 2 };
  };
  const side = (b, s) => ({
    left: [b.x, b.cy], right: [b.x + b.w, b.cy], top: [b.cx, b.y], bottom: [b.cx, b.y + b.h], center: [b.cx, b.cy],
    topright: [b.x + b.w * 0.86, b.y], topleft: [b.x + b.w * 0.14, b.y],
  })[s];
  const path = (d, attrs) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    for (const k in attrs) p.setAttribute(k, attrs[k]);
    svg.appendChild(p);
    return p;
  };
  const quadPts = (p0, c, p1, n = 48) => Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n, u = 1 - t;
    return [u * u * p0[0] + 2 * u * t * c[0] + t * t * p1[0], u * u * p0[1] + 2 * u * t * c[1] + t * t * p1[1]];
  });
  const isWhite = (c) => /255,\s*255,\s*255/.test(c);
  const drawn = [];      // annotation strokes to QA: { pts, ignore: [elements], label }
  const connectors = []; // product connectors (split fan-out) arrows must not cross

  // ---------- Arrows: data-arrow="<target selector>" data-from data-to data-bend data-gap data-start-gap ----------
  document.querySelectorAll("[data-arrow]").forEach((el) => {
    const target = document.querySelector(el.dataset.arrow);
    if (!target) return;
    const color = getComputedStyle(el).color;
    let [x1, y1] = side(box(el), el.dataset.from || "right");
    let [x2, y2] = side(box(target), el.dataset.to || "center");
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    const g1 = +(el.dataset.startGap || 14), g2 = +(el.dataset.gap || 14);
    x1 += ux * g1; y1 += uy * g1; x2 -= ux * g2; y2 -= uy * g2;
    const bend = +(el.dataset.bend || 0.22);
    const c = [(x1 + x2) / 2 - (y2 - y1) * bend, (y1 + y2) / 2 + (x2 - x1) * bend];
    const attrs = { stroke: color, "stroke-width": 3.6 };
    if (isWhite(color)) attrs.filter = "url(#lift)";
    path(`M${x1},${y1} Q${c[0]},${c[1]} ${x2},${y2}`, attrs);
    const L = Math.min(19, Math.hypot(x2 - x1, y2 - y1) * 0.3), ang = Math.atan2(y2 - c[1], x2 - c[0]), a = 0.48;
    path(`M${x2 - L * Math.cos(ang - a)},${y2 - L * Math.sin(ang - a)} L${x2},${y2} L${x2 - L * Math.cos(ang + a)},${y2 - L * Math.sin(ang + a)}`, attrs);
    drawn.push({ pts: quadPts([x1, y1], c, [x2, y2]), ignore: [el, target], label: `arrow from "${el.textContent.trim()}"` });
  });

  // ---------- Hand-drawn ellipse around an element: data-circle="<color>" ----------
  document.querySelectorAll("[data-circle]").forEach((el) => {
    const b = box(el), rx = b.w / 2 + 20, ry = b.h / 2 + 11, col = el.dataset.circle, pts = [];
    for (let t = -0.35; t <= Math.PI * 2 + 0.3; t += 0.12) {
      const wob = 1 + 0.035 * Math.sin(t * 2.6);
      pts.push([b.cx + rx * wob * Math.cos(t) + t * 0.5, b.cy + ry * wob * Math.sin(t) - t * 0.35]);
    }
    path("M" + pts.map((p) => p.join(",")).join(" L"), { stroke: col, "stroke-width": 3.4, opacity: 0.95 });
    drawn.push({ pts, ignore: [el], label: `circle around "${el.textContent.trim()}"` });
  });

  // ---------- Split fan-out: data-fan on the container holding .deal, .node and .payee ----------
  document.querySelectorAll("[data-fan]").forEach((wrap) => {
    const deal = wrap.querySelector(".deal"), node = wrap.querySelector(".node");
    const [ax, ay] = side(box(deal), "right"), [bx, by] = side(box(node), "left");
    path(`M${ax},${ay} C${ax + 40},${ay} ${bx - 40},${by} ${bx},${by}`, { stroke: "url(#fanGrad)", "stroke-width": 5 });
    connectors.push([[ax, ay], [bx, by]]);
    const [sx, sy] = side(box(node), "right");
    wrap.querySelectorAll(".payee").forEach((p) => {
      const [ex, ey] = side(box(p), "left"), mid = (sx + ex) / 2;
      path(`M${sx},${sy} C${mid},${sy} ${mid},${ey} ${ex},${ey}`, { stroke: "url(#fanGrad)", "stroke-width": 5 });
      const pts = [];
      for (let i = 0; i <= 24; i++) { const t = i / 24, u = 1 - t;
        pts.push([u ** 3 * sx + 3 * u * u * t * mid + 3 * u * t * t * mid + t ** 3 * ex, u ** 3 * sy + 3 * u * u * t * sy + 3 * u * t * t * ey + t ** 3 * ey]); }
      connectors.push(pts);
      const dot = document.createElementNS(NS, "circle");
      dot.setAttribute("cx", ex); dot.setAttribute("cy", ey); dot.setAttribute("r", 8);
      dot.setAttribute("fill", "#6078EC"); dot.setAttribute("stroke", "#fff"); dot.setAttribute("stroke-width", 4);
      svg.appendChild(dot);
    });
  });

  // ---------- Carousel line (MOFU) ----------
  // One line through all 5 cards, placed in carousel-wide coordinates (card i spans X = i*1080 … (i+1)*1080)
  // so its colour meets exactly at every card edge. Each card's connector curves into the line toward the CTA.
  const RAIL = { y: 1282, A: "#6078EC", B: "#2BB594", W: 3.5, FR: 54 };
  const hexMix = (a, b, k) => "#" + [0, 2, 4].map((o) => Math.round(parseInt(a.substr(1 + o, 2), 16) * (1 - k) + parseInt(b.substr(1 + o, 2), 16) * k).toString(16).padStart(2, "0")).join("");
  const mk = (tag, attrs) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    svg.appendChild(e);
    return e;
  };
  const along = (pts, step = 6) => pts.slice(1).flatMap((p, k) => {
    const a = pts[k], n = Math.max(1, Math.ceil(Math.hypot(p[0] - a[0], p[1] - a[1]) / step));
    return Array.from({ length: n }, (_, j) => [a[0] + (p[0] - a[0]) * j / n, a[1] + (p[1] - a[1]) * j / n]);
  });
  document.querySelectorAll(".rail").forEach((r) => {
    const i = +r.dataset.i, mode = r.dataset.mode, { y, A, B, W, FR } = RAIL, k = FR * 0.55;
    const t = document.querySelector(r.dataset.target);
    const [ax, ay] = side(box(t), "center");
    const col = (x) => hexMix(A, B, Math.min(1, Math.max(0, (i * 1080 + x) / 5400)));
    const c = col(ax), gid = `railG${i}`;
    svg.querySelector("defs").insertAdjacentHTML("beforeend",
      `<linearGradient id="${gid}" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="1080" y2="0"><stop offset="0" stop-color="${col(0)}"/><stop offset="1" stop-color="${col(1080)}"/></linearGradient>`);
    const base = { fill: "none", "stroke-linecap": "round", "stroke-linejoin": "round", "stroke-width": W };
    const down = `L${ax},${y - FR} C${ax},${y - FR + k} ${ax + FR - k},${y} ${ax + FR},${y}`;   // connector curving into the line
    let qa;
    if (mode === "start") {
      mk("path", { ...base, d: `M${ax},${ay} ${down} L1160,${y}`, stroke: `url(#${gid})` });
      qa = along([[ax, ay], [ax, y - FR], [ax + FR * 0.3, y - FR * 0.3], [ax + FR, y], [1080, y]]);
    } else if (mode === "end") {   // the line rises and runs straight into the bottom of the CTA button
      mk("path", { ...base, d: `M-80,${y} L${ax - FR},${y} C${ax - FR + k},${y} ${ax},${y - FR + k} ${ax},${y - FR} L${ax},${ay}`, stroke: `url(#${gid})` });
      qa = along([[0, y], [ax - FR, y], [ax - FR * 0.3, y - FR * 0.3], [ax, y - FR], [ax, ay]]);
    } else {
      mk("path", { ...base, d: `M-80,${y} L1160,${y}`, stroke: `url(#${gid})` });
      mk("path", { ...base, d: `M${ax},${ay} ${down}`, stroke: c });
      qa = along([[0, y], [1080, y]]).concat(along([[ax, ay], [ax, y - FR], [ax + FR * 0.3, y - FR * 0.3], [ax + FR, y]]));
    }
    if (mode !== "end") mk("circle", { cx: ax, cy: ay, r: 6.5, fill: c, stroke: "#fff", "stroke-width": 3.5 });
    drawn.push({ pts: qa, ignore: [t.parentElement], label: "carousel line" });
  });

  // ---------- Layout QA ----------
  const issues = [];
  const texts = [];
  const tw = document.createTreeWalker(card, NodeFilter.SHOW_TEXT);
  while (tw.nextNode()) {
    const n = tw.currentNode;
    if (!n.textContent.trim() || n.parentElement.closest("svg")) continue;
    const r = document.createRange(); r.selectNodeContents(n);
    for (const rc of r.getClientRects()) texts.push({ el: n.parentElement, s: n.textContent.trim().slice(0, 28),
      x: rc.left - base.left, y: rc.top - base.top, w: rc.width, h: rc.height });
  }
  const hit = (p, t, pad) => p[0] > t.x - pad && p[0] < t.x + t.w + pad && p[1] > t.y - pad && p[1] < t.y + t.h + pad;
  const overlap = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

  drawn.forEach((d) => {
    const crossed = new Set();
    for (const t of texts) {
      if (d.ignore.some((e) => e.contains(t.el))) continue;
      if (d.pts.some((p) => hit(p, t, 5))) crossed.add(t.s);
    }
    crossed.forEach((s) => issues.push(`${d.label} crosses text "${s}"`));
    connectors.forEach((cp) => { if (d.pts.some((p) => cp.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 10))) issues.push(`${d.label} crosses a split connector`); });
  });
  for (let i = 0; i < drawn.length; i++) for (let j = i + 1; j < drawn.length; j++) {
    if (drawn[i].label.startsWith("circle") || drawn[j].label.startsWith("circle")) continue;
    if (drawn[i].pts.some((p) => drawn[j].pts.some((q) => Math.hypot(p[0] - q[0], p[1] - q[1]) < 10))) issues.push(`${drawn[i].label} touches ${drawn[j].label}`);
  }
  const headline = card.querySelector(".h");
  const hb = headline && box(headline);
  card.querySelectorAll(".note").forEach((n) => {
    const nb = box(n);
    for (const t of texts) if (!n.contains(t.el) && overlap(nb, t)) { issues.push(`note "${n.textContent.trim()}" overlaps text "${t.s}"`); break; }
    if (hb && nb.y + nb.h <= hb.y && hb.y - (nb.y + nb.h) < 110 && nb.x < hb.x + hb.w && hb.x < nb.x + nb.w)
      issues.push(`note "${n.textContent.trim()}" sits right above the headline (reads as eyebrow)`);
  });
  // floating cards (BOFU) must not cover other text, or sit on a device screen
  card.querySelectorAll("[data-float]").forEach((f) => {
    const fb = box(f), name = f.textContent.trim().replace(/\s+/g, " ").slice(0, 24);
    for (const t of texts) if (!f.contains(t.el) && overlap(fb, t)) { issues.push(`floating card "${name}" covers text "${t.s}"`); break; }
    card.querySelectorAll("[data-solid]").forEach((o) => { if (!o.contains(f) && overlap(fb, box(o))) issues.push(`floating card "${name}" overlaps the phone screen`); });
  });
  for (const t of texts) if (t.x < -1 || t.y < -1 || t.x + t.w > 1081 || t.y + t.h > 1351) issues.push(`text cut off by card edge: "${t.s}"`);
  document.body.setAttribute("data-qa", JSON.stringify([...new Set(issues)]));
});
