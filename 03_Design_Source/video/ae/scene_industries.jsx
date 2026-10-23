// ================================================================= 03 INDUSTRIES  (main 6.4 – 21.55)
// Rail = sequifi.com Industries menu order. Featured deal cards are the site's own examples
// (each industry page's "… synced from your CRM" card); rule chips use each page's comp vocabulary.
var RAIL = ["Mortgage", "Solar", "Roofing", "Fiber", "HVAC", "Turf", "Pest control", "Plumbing", "Windows", "Garage doors", "Remodeling", "Insurance"];
var FEATURED = [
  { name: "Mortgage", rail: 0, rules: ["Tiered BPS splits", "LOA bonuses", "Branch overrides", "Draw recovery"], deal: ["Funded loan", "$400,000"], comm: ["Loan officer", "$4,000.00"], paidLabel: "Total commission on this loan", paid: 4750 },
  { name: "Solar", rail: 1, rules: ["PPW splits", "Volume tiers", "Manager overrides", "Chargebacks"], deal: ["Solar contract", "$32,000"], comm: ["Setter", "$500.00"], paidLabel: "Paid on this deal", paid: 2420 },
  { name: "Roofing", rail: 2, rules: ["Per-job rates", "Margin splits", "Manager overrides", "Clawbacks"], deal: ["Completed roof", "$18,000"], comm: ["Sales rep", "$2,520.00"], paidLabel: "Paid on this job", paid: 3085 },
  { name: "Fiber", rail: 3, rules: ["Per-install rates", "Setter / closer splits", "Overrides", "Chargebacks"], deal: ["Fiber install contract", "$1,800"], comm: ["Setter", "$150.00"], paidLabel: "Paid on this install", paid: 276 },
  { name: "HVAC", rail: 4, rules: ["Per-job rates", "Tech upsell bonuses", "Margin splits", "Overrides"], deal: ["HVAC install job", "$9,000"], comm: ["Install tech", "$720.00"], paidLabel: "Paid on this job", paid: 770 },
  { name: "Pest control", rail: 6, rules: ["Per-account rates", "Recurring splits", "Overrides", "Chargebacks"], deal: ["Annual pest contract", "$600"], comm: ["Pest control tech", "$90.00"], paidLabel: "Paid on this contract", paid: 100 }
];
var SEG0 = 1.45, SEG = 1.95, MORE = SEG0 + 6 * SEG, IND_DUR = MORE + 2.0;

// Two-tone headline on one line (white + gradient words), slot-rise, aligned on the baseline y
function twoTone(comp, a, b, o, tIn, tOut) {
  var base = { font: o.font || F.display, size: o.size, color: B.white, align: "left", pos: [0, o.y], tracking: o.tracking || -25, baseline: true };
  var la = slotLine(comp, a, base, tIn, tOut);
  var lb = slotLine(comp, b, base, tIn + 0.08, tOut === undefined ? undefined : tOut + 0.05);
  var wa = la.sourceRectAtTime(0, false).width, wb = lb.sourceRectAtTime(0, false).width, gap = o.size * 0.24;
  var x0 = (o.cx || 960) - (wa + gap + wb) / 2;
  P(la).setValue([x0, o.y]); P(lb).setValue([x0 + wa + gap, o.y]);
  gradientOver(comp, lb, B.white, B.soft, [x0 + wa + gap, o.y], [x0 + wa + gap + wb, o.y]);
  return [la, lb];
}

function buildRail(D) {
  var RW = 2600, MID = RW / 2;                       // wider than the frame: the fitted finale shows all 12 pills
  var c = mkComp("03a_Rail", RW, H, D, FPS, B.night950);
  var RY = 188, H_PILL = 56, PAD = 26, GAP = 14, i;
  var rail = c.layers.addNull(); rail.name = "Rail Scroll"; A(rail).setValue([0, 0]); P(rail).setValue([MID, RY]);
  var texts = [], widths = [], total = 0;
  for (i = 0; i < RAIL.length; i++) {
    var t = text(c, RAIL[i], { font: F.uiMed, size: 24, color: B.mute, align: "center", pos: [0, RY] });
    var w = Math.round(t.sourceRectAtTime(0, false).width + PAD * 2);
    texts.push(t); widths.push(w); total += w;
  }
  total += GAP * (RAIL.length - 1);
  var cx = [], acc = -total / 2;
  for (i = 0; i < RAIL.length; i++) { cx.push(acc + widths[i] / 2); acc += widths[i] + GAP; }
  for (i = 0; i < RAIL.length; i++) {
    P(texts[i]).setValue([MID + cx[i], RY]);
    var bg = rect(c, { name: "Pill " + RAIL[i], size: [widths[i], H_PILL], radius: H_PILL / 2, fill: B.card, fillOpacity: 85, stroke: B.soft, strokeW: 1.4, strokeOpacity: 26, pos: [MID + cx[i], RY] });
    bg.parent = rail; texts[i].parent = rail;
    // active state: white label (animator amount 0 -> 100)
    var an = texts[i].property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
    an.property("ADBE Text Animator Properties").addProperty("ADBE Text Fill Color").setValue(hex(B.white));
    var sel = an.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
    sel.property("ADBE Text Range Advanced").property("ADBE Text Selector Max Amount").setValue(0);
  }
  var ind = rect(c, { name: "Rail Indicator", size: [widths[0], H_PILL], radius: H_PILL / 2, fill: B.accent, pos: [MID, RY] });
  ind.moveToBeginning();
  for (i = 0; i < texts.length; i++) texts[i].moveToBeginning();
  function amount(idx) {
    return texts[idx].property("ADBE Text Properties").property("ADBE Text Animators").property(1).property("ADBE Text Selectors").property(1)
      .property("ADBE Text Range Advanced").property("ADBE Text Selector Max Amount");
  }
  var size = ind.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Shape - Rect").property("ADBE Vector Rect Size");
  var pr = P(rail);
  var prevX = MID - cx[0], prevW = widths[0];
  pr.setValueAtTime(0, [prevX, RY]); size.setValueAtTime(0, [prevW, H_PILL]);
  for (var k = 0; k < FEATURED.length; k++) {
    var ri = FEATURED[k].rail, s = SEG0 + k * SEG, nx = MID - cx[ri];
    if (k > 0) {
      pr.setValueAtTime(s - 0.05, [prevX, RY]); pr.setValueAtTime(s + 0.45, [nx, RY]);
      size.setValueAtTime(s - 0.05, [prevW, H_PILL]); size.setValueAtTime(s + 0.45, [widths[ri], H_PILL]);
    }
    var am = amount(ri);
    am.setValueAtTime(s - 0.05, 0); am.setValueAtTime(s + 0.3, 100); am.setValueAtTime(s + SEG - 0.05, 100); am.setValueAtTime(s + SEG + 0.25, 0);
    prevX = nx; prevW = widths[ri];
  }
  // finale: the whole rail slides to centre and every industry lights up
  pr.setValueAtTime(MORE + 0.05, [prevX, RY]); pr.setValueAtTime(MORE + 0.75, [MID, RY]);
  keys(O(ind), [[MORE + 0.05, 100], [MORE + 0.4, 0]], 60);
  for (i = 0; i < RAIL.length; i++) {
    var a2 = amount(i);
    a2.setValueAtTime(MORE + 0.35 + i * 0.05, 0); a2.setValueAtTime(MORE + 0.6 + i * 0.05, 100);
  }
  easeKeys(pr, 85); easeKeys(size, 85);
  allMotionBlur(c);
  return { comp: c, total: total };
}

function buildPhotos(D, photos) {
  var FW = 880, FH = 600, c = mkComp("03b_Photos", FW, FH, D, FPS, B.night900);
  for (var k = 0; k < FEATURED.length; k++) {
    var s = SEG0 + k * SEG, item = photos[FEATURED[k].name], l;
    if (item) {
      l = c.layers.add(item);
      var sc = Math.max(FW / item.width, FH / item.height) * 100;
      keys(S(l), [[s - 0.2, [sc * 1.12, sc * 1.12]], [s + SEG + 0.8, [sc * 1.02, sc * 1.02]]], 0);
      var tt = tritone(l); tt.property("ADBE Tritone-0004").setValue(64);   // light brand duotone over the original
    } else {
      l = c.layers.addSolid(hex(B.cardHi), "missing", FW, FH, 1, D);
    }
    l.name = "Photo " + FEATURED[k].name;
    l.inPoint = k === 0 ? 1.15 : s - 0.02;
    l.outPoint = k === FEATURED.length - 1 ? MORE + 0.6 : s + SEG + 0.6;
    if (k > 0) keys(P(l), [[s - 0.02, [FW / 2, FH * 1.5]], [s + 0.55, [FW / 2, FH / 2]]], 88);
    else P(l).setValue([FW / 2, FH / 2]);
  }
  // legibility: soft dark falloff at the bottom of the frame
  var shade = c.layers.addSolid([0, 0, 0], "Bottom Shade", FW, FH, 1, D);
  var m = shade.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), ms = new Shape();
  ms.vertices = [[-200, FH * 0.5], [FW + 200, FH * 0.5], [FW + 200, FH + 200], [-200, FH + 200]]; ms.closed = true;
  m.property("ADBE Mask Shape").setValue(ms); m.property("ADBE Mask Feather").setValue([0, 260]);
  O(shade).setValue(78);
  allMotionBlur(c);
  return c;
}

function sceneIndustries(photos) {
  var D = IND_DUR, c = sceneComp("03_Industries", D), k, j;
  // intro (copy: sequifi.com home services page "Every trade pays differently.")
  twoTone(c, "Every trade pays", "differently.", { size: 112, y: 580 }, 0.12, 1.05);

  // rail (precomp, so the whole rail can fade / scale as one); edges fade out
  var R1 = buildRail(D), railL = c.layers.add(R1.comp); railL.name = "Rail";
  keys(O(railL), [[1.15, 0], [1.5, 100], [IND_DUR - 0.45, 100], [IND_DUR - 0.1, 0]], 60);
  var fit = Math.min(1, 1780 / R1.total);
  var py = 540 + (430 - (540 + fit * (188 - 540)));   // the fitted rail settles at y≈430
  var pR = P(railL), sR = S(railL);
  pR.setValueAtTime(1.15, [960, 500]); pR.setValueAtTime(1.55, [960, 540]);
  pR.setValueAtTime(MORE + 0.05, [960, 540]); pR.setValueAtTime(MORE + 0.8, [960, py]);
  sR.setValueAtTime(MORE + 0.05, [100, 100]); sR.setValueAtTime(MORE + 0.8, [fit * 100, fit * 100]);
  easeKeys(pR, 85); easeKeys(sR, 85);
  var RW = R1.comp.width, rm = railL.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), rms = new Shape();
  rms.vertices = [[RW / 2 - 900, -100], [RW / 2 + 900, -100], [RW / 2 + 900, H + 100], [RW / 2 - 900, H + 100]]; rms.closed = true;
  rm.property("ADBE Mask Shape").setValue(rms);
  rm.property("ADBE Mask Feather").setValue([360, 0]);
  var rx = rm.property("ADBE Mask Offset");
  rx.setValueAtTime(MORE + 0.05, 0); rx.setValueAtTime(MORE + 0.8, 320); easeKeys(rx, 80);

  // photo frame (rounded, soft shadow + hairline border)
  var FX = 560, FY = 600, FW = 880, FH = 600;
  var frame = c.layers.addNull(); frame.name = "Frame Ctl"; A(frame).setValue([0, 0]); P(frame).setValue([FX, FY]);
  var fsh = softBlob(c, { name: "Frame Shadow", size: [FW - 60, FH - 60], pos: [FX, FY + 40], color: "#000000", feather: 90, opacity: 70 });
  var ph = c.layers.add(buildPhotos(D, photos)); ph.name = "Industry Photos"; P(ph).setValue([FX, FY]);
  var fm = rect(c, { name: "Frame Matte", size: [FW, FH], radius: 30, fill: B.white, pos: [FX, FY] });
  ph.moveAfter(fm); ph.setTrackMatte(fm, TrackMatteType.ALPHA); fm.enabled = false;
  var fb = rect(c, { name: "Frame Border", size: [FW, FH], radius: 30, stroke: B.soft, strokeW: 1.5, strokeOpacity: 30, pos: [FX, FY] });
  var frameLayers = [fsh, ph, fm, fb];
  for (j = 0; j < frameLayers.length; j++) frameLayers[j].parent = frame;
  var sF = S(frame);
  sF.setValueAtTime(1.2, [92, 92]); sF.setValueAtTime(1.75, [100, 100]); sF.setValueAtTime(MORE + 0.05, [100, 100]); sF.setValueAtTime(MORE + 0.45, [94, 94]);
  easeKeys(sF, 85);
  for (j = 0; j < frameLayers.length; j++) {
    if (frameLayers[j] === fm) continue;
    var fo = frameLayers[j] === fsh ? 70 : 100;
    keys(O(frameLayers[j]), [[1.2, 0], [1.55, fo], [MORE + 0.05, fo], [MORE + 0.4, 0]], 60);
  }

  // deal-flow card shell
  var CX = 1450, CY = 600, CW = 700, CH = 600, L0 = 1172, R0 = 1752;
  var csh = softBlob(c, { name: "Card Shadow", size: [CW - 60, CH - 60], pos: [CX, CY + 40], color: "#000000", feather: 90, opacity: 65 });
  var card = rect(c, { name: "Deal Card", size: [CW, CH], radius: 28, fill: "#0B1026", fillOpacity: 94, stroke: B.soft, strokeW: 1.5, strokeOpacity: 24, pos: [CX, CY] });
  var hdr = text(c, "DEAL FLOW", { font: F.uiSemi, size: 18, color: B.soft, tracking: 180, pos: [L0, 352] });
  var live = text(c, "Live", { font: F.uiMed, size: 19, color: B.green, align: "right", pos: [R0, 352] });
  var ldot = ellipse(c, { name: "Live Dot", size: [10, 10], fill: B.green, pos: [R0 - live.sourceRectAtTime(0, false).width - 16, 352] });
  S(ldot).expression = "var s = 100 + 28 * Math.sin(time * 5.5); [s, s]";
  var div = pathLayer(c, { name: "Card Divider", points: [[1130, 390], [1770, 390]], stroke: B.line, width: 1.5 });
  var foot = text(c, "Every line traces back to a rule.", { font: F.ui, size: 20, color: B.dim, pos: [L0, 866] });
  var tl = pathLayer(c, { name: "Flow Line", points: [[1140, 470], [1140, 814]], stroke: B.accent, width: 3, trim: true });
  glow(tl, 14, 0.5, 50, B.accent, B.soft);
  var nodes = [ellipse(c, { name: "Node A", size: [16, 16], fill: B.accent, pos: [1140, 470] }),
               ellipse(c, { name: "Node B", size: [16, 16], fill: B.accent, pos: [1140, 640] }),
               ellipse(c, { name: "Node C", size: [18, 18], fill: B.green, pos: [1140, 814] })];
  var shell = [csh, card, hdr, live, ldot, div, foot];
  for (j = 0; j < shell.length; j++) {
    var full = shell[j] === csh ? 65 : 100;
    keys(O(shell[j]), [[1.2, 0], [1.55, full], [MORE + 0.05, full], [MORE + 0.4, 0]], 60);
  }
  keysOut(P(card), [[1.2, [CX + 60, CY]], [1.65, [CX, CY]]]);
  keysOut(P(csh), [[1.2, [CX + 60, CY + 40]], [1.65, [CX, CY + 40]]]);

  var te = trimProp(tl, "end");
  te.setValueAtTime(0, 0);
  for (k = 0; k < FEATURED.length; k++) {
    var f = FEATURED[k], s = SEG0 + k * SEG, OUT = s + 1.66, ODUR = 0.27, sl = { outDur: ODUR };
    // industry name on the photo
    span(slotLine(c, f.name, { font: F.display, size: 84, color: B.white, pos: [160, 828], tracking: -25, outDur: ODUR }, s + 0.1, OUT), s, s + SEG);
    // rule chips under the frame
    var cxp = 120;
    for (j = 0; j < f.rules.length; j++) {
      var ch = chip(c, f.rules[j], { pos: [0, 958], size: 21, color: "#C9D0F0", fill: B.card, strokeOpacity: 30, padX: 18, h: 44 });
      P(ch.pill).setValue([cxp + ch.w / 2, 958]); cxp += ch.w + 10;
      span(ch.pill, s, s + SEG); span(ch.text, s, s + SEG);
      popIn(ch.pill, s + 0.18 + j * 0.05, 0.4, 80);
      chipFade(ch, [[s + 0.18 + j * 0.05, 0], [s + 0.38 + j * 0.05, 100], [OUT, 100], [OUT + ODUR, 0]]);
    }
    // row A: contract   ·   row B: commission calculated   ·   row C: paid
    var rows = [
      slotLine(c, "CONTRACT  ·  SYNCED FROM YOUR CRM", { font: F.uiSemi, size: 15, color: B.mute, tracking: 140, pos: [L0, 428], outDur: ODUR }, s + 0.08, OUT),
      slotLine(c, f.deal[0], { font: F.uiSemi, size: 32, color: B.white, pos: [L0, 482], baseline: true, outDur: ODUR }, s + 0.1, OUT),
      slotLine(c, f.deal[1], { font: F.displayBold, size: 36, color: B.white, align: "right", pos: [R0, 482], baseline: true, outDur: ODUR }, s + 0.13, OUT),
      slotLine(c, "COMMISSION CALCULATED", { font: F.uiSemi, size: 15, color: B.mute, tracking: 140, pos: [L0, 598], outDur: ODUR }, s + 0.28, OUT),
      slotLine(c, f.comm[0], { font: F.uiSemi, size: 32, color: B.white, pos: [L0, 652], baseline: true, outDur: ODUR }, s + 0.3, OUT),
      slotLine(c, f.comm[1], { font: F.displayBold, size: 36, color: B.soft, align: "right", pos: [R0, 652], baseline: true, outDur: ODUR }, s + 0.33, OUT),
      slotLine(c, f.paidLabel, { font: F.uiMed, size: 20, color: B.mute, pos: [L0, 762], outDur: ODUR }, s + 0.46, OUT)
    ];
    for (j = 0; j < rows.length; j++) span(rows[j], s, s + SEG);
    var cnt = counter(c, { name: f.name, font: F.display, size: 64, color: B.white, pos: [L0, 814], prefix: "$", decimals: 2, t0: s + 0.5, t1: s + 1.02, to: f.paid, tracking: -20 });
    span(cnt, s, s + SEG);
    keys(O(cnt), [[s + 0.47, 0], [s + 0.6, 100], [OUT, 100], [OUT + ODUR, 0]], 60);
    span(gradientOver(c, cnt, B.white, B.soft, [L0, 814], [L0 + 420, 814]), s, s + SEG);
    var paidChip = chip(c, "Paid", { pos: [R0 - 50, 814], size: 22, color: B.green, fill: B.green, fillOpacity: 14, stroke: B.green, strokeOpacity: 55, padX: 22, h: 46, font: F.uiSemi });
    span(paidChip.pill, s, s + SEG); span(paidChip.text, s, s + SEG);
    popIn(paidChip.pill, s + 1.02, 0.4, 60);
    chipFade(paidChip, [[s + 1.02, 0], [s + 1.18, 100], [OUT, 100], [OUT + ODUR, 0]]);
    // flow line + nodes
    te.setValueAtTime(s + 0.06, 0); te.setValueAtTime(s + 0.8, 100); te.setValueAtTime(OUT, 100); te.setValueAtTime(OUT + ODUR, 0);
    var nt = [s + 0.08, s + 0.28, s + 1.02];
    for (j = 0; j < 3; j++) {
      var ns = S(nodes[j]);
      ns.setValueAtTime(nt[j], [0, 0]); ns.setValueAtTime(nt[j] + 0.3, [100, 100]); ns.setValueAtTime(OUT, [100, 100]); ns.setValueAtTime(OUT + ODUR, [0, 0]);
    }
  }
  easeKeys(te, 80);
  for (j = 0; j < 3; j++) { S(nodes[j]).setValueAtTime(0, [0, 0]); easeKeys(S(nodes[j]), 80); glow(nodes[j], 12, 0.5, 50); }
  // finale headline (sequifi.com homepage Industries section copy)
  twoTone(c, "Built for compensation that", "gets complicated.", { size: 76, y: 667 }, MORE + 0.55, IND_DUR - 0.75);
  slotLine(c, "Sequifi is native to the industries where nearly every paycheck is different.", { font: F.ui, size: 30, color: B.mute, align: "center", pos: [960, 736] }, MORE + 0.75, IND_DUR - 0.7);
  allMotionBlur(c);
  return c;
}
