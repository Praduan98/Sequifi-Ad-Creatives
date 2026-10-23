// ================================================================= 04 PLATFORM  (main 21.5 – 26.2)
// Copy: door-to-door page H2 "Not just commissions. Everything from hire to paid",
// industry pages' five-step flow Hire → Onboard → Manage → Calculate → Pay, and the site's stats.
function scenePlatform() {
  var D = 4.7, c = sceneComp("04_Platform", D), i;
  slotLine(c, "Not just commissions.", { font: F.display, size: 84, color: B.white, align: "center", justify: "center", pos: [960, 200], tracking: -25 }, 0.08, 4.2);
  gradSlot(c, "Everything from hire to paid.", { font: F.display, size: 84, color: B.white, align: "center", justify: "center", pos: [960, 300], tracking: -25 }, 0.2, 4.26);

  var steps = ["Hire", "Onboard", "Manage", "Calculate", "Pay"], xs = [360, 660, 960, 1260, 1560], Y = 520;
  var base = pathLayer(c, { name: "Flow Base", points: [[xs[0], Y], [xs[4], Y]], stroke: B.line, width: 3 });
  keys(O(base), [[0.4, 0], [0.7, 100], [4.2, 100], [4.6, 0]], 60);
  var line = pathLayer(c, { name: "Flow Line", points: [[xs[0], Y], [xs[4], Y]], stroke: B.accent, width: 4, trim: true });
  glow(line, 20, 0.6, 50, B.accent, B.soft);
  keys(trimProp(line, "end"), [[0.6, 0], [1.95, 100]], 70);
  keys(O(line), [[4.2, 100], [4.6, 0]], 60);
  for (i = 0; i < 5; i++) {
    var tOn = 0.6 + (xs[i] - xs[0]) / (xs[4] - xs[0]) * 1.35;
    var ring = ellipse(c, { name: "Step " + steps[i], size: [104, 104], fill: "#0B1026", stroke: B.soft, strokeW: 2, strokeOpacity: 40, pos: [xs[i], Y] });
    popIn(ring, 0.35 + i * 0.07, 0.45, 60);
    var fill = ring.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color");
    fill.setValueAtTime(tOn - 0.05, hex("#0B1026")); fill.setValueAtTime(tOn + 0.2, hex(i === 4 ? B.green : B.accent));
    var sc = S(ring); sc.setValueAtTime(tOn - 0.05, [100, 100]); sc.setValueAtTime(tOn + 0.12, [114, 114]); sc.setValueAtTime(tOn + 0.4, [100, 100]); easeKeys(sc, 70);
    var num = text(c, "0" + (i + 1), { font: F.uiSemi, size: 26, color: B.white, align: "center", justify: "center", pos: [xs[i], Y] });
    popIn(num, 0.4 + i * 0.07, 0.45, 60);
    var lab = slotLine(c, steps[i], { font: F.displayBold, size: 36, color: B.white, align: "center", justify: "center", pos: [xs[i], Y + 100] }, 0.5 + i * 0.07, 4.15);
    keys(O(ring), [[4.2, 100], [4.55, 0]], 60); keys(O(num), [[4.2, 100], [4.55, 0]], 60);
  }
  // stats (homepage "By the numbers" + "Trusted by 20,000+ reps, managers, and operators")
  var cols = [480, 960, 1440], SY = 820;
  var s1 = counter(c, { font: F.display, size: 76, color: B.white, align: "center", justify: "center", pos: [cols[0], SY], suffix: "+", t0: 2.35, t1: 3.25, to: 20000, tracking: -20 });
  var s2 = text(c, "Same day", { font: F.display, size: 76, color: B.white, align: "center", justify: "center", pos: [cols[1], SY], tracking: -20 });
  var s3 = counter(c, { font: F.display, size: 76, color: B.white, align: "center", justify: "center", pos: [cols[2], SY], suffix: "+", t0: 2.55, t1: 3.35, to: 120, tracking: -20 });
  var stats = [s1, s2, s3];
  var caps = ["reps, managers and operators", "pay visibility for every rep", "admin hours saved every month"];
  for (i = 0; i < 3; i++) {
    fadeUp(stats[i], 2.25 + i * 0.12, 0.55, 30);
    keys(O(stats[i]), [[4.2, 100], [4.55, 0]], 60);
    gradientOver(c, stats[i], B.white, B.soft, [cols[i] - 200, SY], [cols[i] + 200, SY]);
    var cp = text(c, caps[i], { font: F.ui, size: 26, color: B.mute, align: "center", justify: "center", pos: [cols[i], SY + 66] });
    fadeUp(cp, 2.4 + i * 0.12, 0.55, 24);
    keys(O(cp), [[4.2, 100], [4.55, 0]], 60);
    if (i > 0) {
      var dv = pathLayer(c, { name: "Stat Divider " + i, points: [[(cols[i - 1] + cols[i]) / 2, SY - 50], [(cols[i - 1] + cols[i]) / 2, SY + 80]], stroke: B.line, width: 1.5 });
      keys(O(dv), [[2.4, 0], [2.8, 100], [4.2, 100], [4.55, 0]], 60);
    }
  }
  allMotionBlur(c);
  return c;
}

// ================================================================= 05 CTA  (main 25.8 – 30.0)
// Copy: sequifi.com closing section + primary CTA "Book a demo".
function sceneCTA() {
  var D = 3.85, c = sceneComp("05_CTA", D);
  slotLine(c, "Your team is ready to scale.", { font: F.display, size: 104, color: B.white, align: "center", pos: [960, 470], tracking: -25 }, 0.1, 1.35);
  gradSlot(c, "Is your back office?", { font: F.display, size: 104, color: B.white, align: "center", pos: [960, 600], tracking: -25 }, 0.36, 1.42);

  var lg = logo(c, { pos: [960, 425], scale: 1.75 });
  keys(trimProp(lg.mark, "end"), [[1.5, 0], [2.15, 100]], 82);
  glow(lg.mark, 26, 0.6, 50, B.accent, B.soft);
  revealMask(lg.word, 105, 395, -20, 160, 1.68, 2.3);

  var btn = rect(c, { name: "CTA Button", size: [380, 88], radius: 44, fill: B.accent, pos: [960, 640] });
  var hl = halo(c, btn, { size: [400, 84], pos: [960, 656], blur: 80, opacity: 85 });
  var bt = text(c, "Book a demo  →", { font: F.uiSemi, size: 32, color: B.white, align: "center", pos: [960, 640] });
  bt.parent = btn; hl.parent = btn;
  popIn(btn, 2.1, 0.5, 70);
  keys(O(bt), [[2.1, 0], [2.35, 100]], 50); keys(O(hl), [[2.15, 0], [2.6, 85]], 50);
  btn.inPoint = 2.08; bt.inPoint = 2.08; hl.inPoint = 2.08;
  var ring = rect(c, { name: "CTA Pulse", size: [380, 88], radius: 44, stroke: B.soft, strokeW: 2, strokeOpacity: 100, pos: [960, 640] });
  keys(S(ring), [[2.55, [100, 100]], [3.3, [118, 140]]], 40);
  keys(O(ring), [[2.55, 0], [2.65, 70], [3.3, 0]], 40);
  ring.inPoint = 2.5;
  fadeUp(text(c, "sequifi.com", { font: F.uiMed, size: 30, color: B.mute, align: "center", pos: [960, 752] }), 2.35, 0.55, 20);
  fadeUp(text(c, "Trusted by 20,000+ reps, managers, and operators", { font: F.ui, size: 22, color: B.dim, align: "center", pos: [960, 960] }), 2.55, 0.6, 16);
  allMotionBlur(c);
  return c;
}
