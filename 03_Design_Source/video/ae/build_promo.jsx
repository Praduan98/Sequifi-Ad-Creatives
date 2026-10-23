// Sequifi 30s promo — After Effects build script (dark theme, sequifi.com brand).
// Run in After Effects: File > Scripts > Run Script File… (or AfterFX.exe -r build_promo.jsx).
// Rebuilds the whole project from code: 1920x1080 · 30 fps · 30 s. Copy lives in COPY below.
#include "lib.jsx"

var ROOT = File($.fileName).parent.parent.fsName;           // .../03_Design_Source/video
var ASSETS = ROOT + "/assets";
var W = 1920, H = 1080, FPS = 30, DUR = 30;

var COPY = {
  hook: ["Every deal.", "Every rep.", "Every payout."],
  problemHead: "Comp plans got complicated.",
  problemChips: [["Disputed payouts", B.red], ["Spreadsheet errors", B.red], ["Late payroll", B.amber], ["Manual overrides", B.amber]],
  tagline: "Sales compensation, simplified.",
  industriesHead: ["Built for how ", "your industry", " pays."],
  platformHead: ["One platform for ", "every payout."],
  features: ["Commission tracking", "Payroll & payouts", "Rep onboarding", "Real-time reporting"],
  ctaHead: ["Pay every rep ", "right."],
  ctaButton: "Book a Demo",
  url: "sequifi.com"
};

// Industry segments (data matches the Meta ad campaign in 03_Design_Source/data/industries.json)
var INDUSTRIES = [];  // filled in build: see industries.jsx

function readJSON(p) { var f = new File(p); f.open("r"); f.encoding = "UTF-8"; var s = f.read(); f.close(); return eval("(" + s + ")"); }
var LOGO = readJSON(ASSETS + "/logo_paths.json");

// Logo built from the official SVG paths (stroked S mark + filled wordmark). Returns {mark, word, null} grouped under a null.
function logo(comp, o) {
  var vb = LOGO.viewBox, sc = o.scale || 2;
  var n = comp.layers.addNull(); n.name = o.name || "Logo"; n.enabled = false;
  A(n).setValue([vb[0] / 2, vb[1] / 2]);
  P(n).setValue(o.pos || [W / 2, H / 2]);
  var word = pathLayer(comp, { name: "Logo Wordmark", subpaths: LOGO.word, fill: B.white });
  var mark = pathLayer(comp, { name: "Logo Mark", subpaths: LOGO.mark, stroke: o.markColor || B.accent, width: 5.23, trim: true });
  word.parent = n; mark.parent = n;
  P(word).setValue([0, 0]); P(mark).setValue([0, 0]);   // logo space origin = the null's top-left (anchor is the logo centre)
  S(n).setValue([sc * 100, sc * 100]);                  // scale only after parenting (AE compensates children otherwise)
  return { ctl: n, mark: mark, word: word };
}

// ---------------------------------------------------------------- background (full length)
function buildBackground(main) {
  var bg = main.layers.addSolid(hex(B.night950), "BG Night", W, H, 1, DUR);
  var g1 = softBlob(main, { name: "Glow Periwinkle", size: [1300, 1000], pos: [420, 260], color: B.deep, feather: 760, opacity: 38, ellipse: true });
  keys(P(g1), [[0, [380, 240]], [10, [620, 360]], [20, [460, 760]], [30, [300, 420]]], 60);
  var g2 = softBlob(main, { name: "Glow Accent", size: [1100, 900], pos: [1560, 860], color: B.accent, feather: 700, opacity: 20, ellipse: true });
  keys(P(g2), [[0, [1600, 900]], [12, [1380, 700]], [24, [1640, 560]], [30, [1520, 820]]], 60);
  // Dot grid (repeaters), slow drift
  var dots = shapeLayer(main, "Dot Grid");
  var gr = addGroup(contents(dots), "Dot");
  gContents(gr).addProperty("ADBE Vector Shape - Ellipse").property("ADBE Vector Ellipse Size").setValue([3.2, 3.2]);
  addFill(gContents(gr), B.soft, 100);
  var r1 = contents(dots).addProperty("ADBE Vector Filter - Repeater");
  r1.property("ADBE Vector Repeater Copies").setValue(46);
  r1.property("ADBE Vector Repeater Transform").property("ADBE Vector Repeater Position").setValue([48, 0]);
  var r2 = contents(dots).addProperty("ADBE Vector Filter - Repeater");
  r2.property("ADBE Vector Repeater Copies").setValue(28);
  r2.property("ADBE Vector Repeater Transform").property("ADBE Vector Repeater Position").setValue([0, 48]);
  keys(P(dots), [[0, [-120, -120]], [DUR, [-120, -168]]], 0);
  O(dots).setValue(9);
  // Radial falloff on the grid: elliptical feathered mask
  var m = dots.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  var ms = new Shape(); var cx = W / 2 + 120, cy = H / 2 + 120, rx = 900, ry = 620, k = 0.5523;
  ms.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
  ms.inTangents = [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]];
  ms.outTangents = [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]];
  ms.closed = true;
  m.property("ADBE Mask Shape").setValue(ms);
  m.property("ADBE Mask Feather").setValue([520, 520]);
  // Vignette + grain on top (added last in build())
  return bg;
}
function buildFinish(main) {
  var v = main.layers.addSolid([0, 0, 0], "Vignette", W, H, 1, DUR);
  var m = v.property("ADBE Mask Parade").addProperty("ADBE Mask Atom");
  m.inverted = true;
  var ms = new Shape(); var cx = W / 2, cy = H / 2, rx = 1150, ry = 760, k = 0.5523;
  ms.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
  ms.inTangents = [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]];
  ms.outTangents = [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]];
  ms.closed = true;
  m.property("ADBE Mask Shape").setValue(ms);
  m.property("ADBE Mask Feather").setValue([600, 600]);
  O(v).setValue(55);
  var adj = main.layers.addSolid([1, 1, 1], "Grain", W, H, 1, DUR);
  adj.adjustmentLayer = true;
  var nz = adj.property("ADBE Effect Parade").addProperty("ADBE Noise");
  nz.property("ADBE Noise-0001").setValue(2.2);
  try { nz.property("ADBE Noise-0002").setValue(0); } catch (e) {}  // monochrome noise
}

// ---------------------------------------------------------------- scene helpers
function sceneComp(name, dur) { var c = mkComp(name, W, H, dur, FPS, B.night950); return c; }
function place(main, comp, t0) { var l = main.layers.add(comp); l.startTime = t0; l.name = comp.name; return l; }
function allMotionBlur(comp) { for (var i = 1; i <= comp.numLayers; i++) try { comp.layer(i).motionBlur = !/Counter/.test(comp.layer(i).name); } catch (e) {} }

// Text line that rises out of a horizontal slot (mask) — the signature type move.
// The layer only exists from its entrance to the end of its exit, so nothing can leak outside the slot.
function slotLine(comp, str, o, tIn, tOut) {
  var l = text(comp, str, o);
  var r = l.sourceRectAtTime(0, false), mt = Math.round(o.size * 0.22), mb = Math.round(o.size * 0.3);
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), ms = new Shape(), pad = 600;
  ms.vertices = [[r.left - pad, r.top - mt], [r.left + r.width + pad, r.top - mt], [r.left + r.width + pad, r.top + r.height + mb], [r.left - pad, r.top + r.height + mb]];
  ms.closed = true;
  m.property("ADBE Mask Shape").setValue(ms);
  var h = r.height + mt + mb + 4;                       // fully below / above the band
  var anim = l.property("ADBE Text Properties").property("ADBE Text Animators").addProperty("ADBE Text Animator");
  var pos = anim.property("ADBE Text Animator Properties").addProperty("ADBE Text Position 3D");
  anim.property("ADBE Text Selectors").addProperty("ADBE Text Selector");
  keysOut(pos, [[tIn, [0, h, 0]], [tIn + 0.55, [0, 0, 0]]]);
  l.inPoint = Math.max(0, tIn - 0.02);
  if (tOut !== undefined) {
    var od = o.outDur || 0.45;
    pos.setValueAtTime(tOut, [0, 0, 0]); pos.setValueAtTime(tOut + od, [0, -h, 0]);
    var n = pos.numKeys;
    pos.setTemporalEaseAtKey(n - 1, [new KeyframeEase(0, 33)], [new KeyframeEase(0, 75)]);
    pos.setTemporalEaseAtKey(n, [new KeyframeEase(0, 75)], [new KeyframeEase(0, 33)]);
    l.outPoint = tOut + od + 0.02;
  }
  return l;
}

// Gradient-highlighted word (white -> soft periwinkle), as on sequifi.com dark sections
function gradText(comp, str, o) {
  var l = text(comp, str, o);
  var r = l.sourceRectAtTime(0, false), p = P(l).value;
  var x0 = p[0] - alignX(o.align, r.width);
  var g = gradientOver(comp, l, B.white, B.soft, [x0, p[1]], [x0 + r.width, p[1]]);
  return { text: l, grad: g };
}

// Slot-rise text with the brand gradient (white -> soft periwinkle)
function gradSlot(comp, str, o, tIn, tOut) {
  var l = slotLine(comp, str, o, tIn, tOut);
  var r = l.sourceRectAtTime(0, false), p = P(l).value;
  var x0 = p[0] - alignX(o.align, r.width);
  gradSlot.lastWidth = r.width;   // measured before the matte hides the layer (hidden layers report no bounds)
  gradientOver(comp, l, B.white, B.soft, [x0, p[1]], [x0 + r.width, p[1]]);
  return l;
}
// Pill chip: rounded rect with a centred label (label parented to the pill)
function chip(comp, label, o) {
  var t = text(comp, label, { font: o.font || F.uiMed, size: o.size || 24, color: o.color || B.mute, align: "center", justify: "center", pos: o.pos, tracking: o.tracking || 0 });
  var r = t.sourceRectAtTime(0, false);
  var h = o.h || Math.round((o.size || 24) * 2), w = Math.round(r.width + (o.padX || 22) * 2);
  var p = rect(comp, { name: "Chip " + label, size: [w, h], radius: h / 2, fill: o.fill || B.card, fillOpacity: o.fillOpacity === undefined ? 92 : o.fillOpacity,
                       stroke: o.stroke || B.soft, strokeW: o.strokeW || 1.5, strokeOpacity: o.strokeOpacity === undefined ? 34 : o.strokeOpacity, pos: o.pos });
  p.moveAfter(t);
  t.parent = p;
  if (o.rot) R(p).setValue(o.rot);
  return { pill: p, text: t, w: w, h: h };
}
function opacityKeys(l, list) { keys(O(l), list, 60); }
function chipFade(ch, list) { keys(O(ch.pill), list, 60); keys(O(ch.text), list, 60); }

// ================================================================= 01 HOOK  (0.0 – 4.4)
function sceneHook() {
  var c = sceneComp("01_Hook", 4.4);
  var terms = [["Tiers", 330, 250, -6], ["Splits", 700, 170, 4], ["PPW", 1010, 110, -3], ["Overrides", 1270, 200, 3], ["Clawbacks", 1610, 300, -5],
               ["Chargebacks", 190, 470, 4], ["SPIFFs", 1745, 560, -4], ["Tiered BPS", 230, 760, -3], ["Milestones", 600, 880, 5], ["Draws", 960, 965, -4],
               ["Setter / closer splits", 1320, 880, 3], ["Recurring splits", 1660, 770, -5]];
  var links = [[0, 1], [1, 3], [3, 4], [0, 5], [5, 7], [7, 8], [8, 9], [9, 10], [10, 11], [11, 6], [6, 4], [2, 1], [2, 3], [1, 8], [3, 10], [0, 9], [5, 11]];
  var drift = c.layers.addNull(); drift.name = "Web Drift"; A(drift).setValue([0, 0]); P(drift).setValue([960, 540]);
  keys(S(drift), [[0, [100, 100]], [2.2, [106, 106]]], 40);
  // tangled web (behind chips)
  var lines = [];
  for (var k = 0; k < links.length; k++) {
    var a = terms[links[k][0]], b = terms[links[k][1]];
    var ln = pathLayer(c, { name: "Web " + k, points: [[a[1], a[2]], [b[1], b[2]]], stroke: B.soft, width: 1.4, strokeOpacity: 100, trim: true });
    O(ln).setValue(26);
    keys(trimProp(ln, "end"), [[0.3 + k * 0.035, 0], [0.85 + k * 0.035, 100]], 70);
    keys(O(ln), [[1.85, 26], [2.2, 0]], 60);
    ln.parent = drift; lines.push(ln);
  }
  // comp-term chips
  var underY = 772, chips = [];
  for (var i = 0; i < terms.length; i++) {
    var ch = chip(c, terms[i][0], { pos: [terms[i][1], terms[i][2]], rot: terms[i][3], size: 24 });
    ch.pill.parent = drift;
    popIn(ch.pill, 0.12 + i * 0.055, 0.45, 55);
    keys(O(ch.text), [[0.12 + i * 0.055, 0], [0.32 + i * 0.055, 100]], 50);
    // converge into the underline
    var tx = 720 + (i / (terms.length - 1)) * 480, t0 = 1.95 + (i % 4) * 0.025;
    var pp = P(ch.pill);
    pp.setValueAtTime(t0, [terms[i][1] - 960, terms[i][2] - 540]);       // parent space (drift anchored at comp centre)
    pp.setValueAtTime(t0 + 0.45, [(tx - 960) / 1.06, (underY - 540) / 1.06]);   // drift is at 106% by now
    easeKeys(pp, 85);
    var sc = S(ch.pill); sc.setValueAtTime(t0, [100, 100]); sc.setValueAtTime(t0 + 0.45, [25, 25]); easeKeys(sc, 80);
    keys(R(ch.pill), [[t0, terms[i][3]], [t0 + 0.45, 0]], 80);
    var op = O(ch.pill); op.setValueAtTime(t0 + 0.25, 100); op.setValueAtTime(t0 + 0.47, 0);
    var opt = O(ch.text); opt.setValueAtTime(t0 + 0.05, 100); opt.setValueAtTime(t0 + 0.22, 0);
    var fc = ch.pill.property("ADBE Root Vectors Group").property(1).property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color");
    fc.setValueAtTime(t0, hex(B.card)); fc.setValueAtTime(t0 + 0.25, hex(B.accent));
    ch.pill.outPoint = t0 + 0.5; ch.text.outPoint = t0 + 0.5;
    chips.push(ch);
  }
  // headline: "Complex comp." then the site's "Paid right."
  var h1 = slotLine(c, "Complex comp.", { font: F.display, size: 168, color: B.white, align: "center", justify: "center", pos: [960, 540], tracking: -30 }, 1.0, 3.72);
  keys(P(h1), [[2.2, [960, 540]], [2.7, [960, 452]]], 85);
  var h2 = gradSlot(c, "Paid right.", { font: F.display, size: 168, color: B.white, align: "center", justify: "center", pos: [960, 652], tracking: -30 }, 2.32, 3.8);
  // underline drawn from the centre outwards (the chips land in it)
  var w2 = gradSlot.lastWidth;
  var ul = pathLayer(c, { name: "Underline", points: [[960 - w2 / 2, underY], [960 + w2 / 2, underY]], stroke: B.accent, width: 5, trim: true });
  keys(trimProp(ul, "start"), [[2.25, 50], [2.75, 0], [3.7, 0], [4.1, 50]], 85);
  keys(trimProp(ul, "end"), [[2.25, 50], [2.75, 100], [3.7, 100], [4.1, 50]], 85);
  glow(ul, 22, 0.7, 50, B.accent, B.soft);
  allMotionBlur(c);
  return c;
}

// ================================================================= 02 LOGO  (4.0 – 7.0)
function sceneLogo() {
  var c = sceneComp("02_Logo", 3.0);
  var lg = logo(c, { pos: [960, 455], scale: 2.6 });
  keys(trimProp(lg.mark, "end"), [[0.05, 0], [0.95, 100]], 82);
  glow(lg.mark, 26, 0.6, 50, B.accent, B.soft);
  revealMask(lg.word, 105, 395, -20, 160, 0.45, 1.1);   // wordmark path spans x 110–395 (logo SVG units)
  var sub = slotLine(c, "The commission platform for teams where pay gets complicated.", { font: F.ui, size: 36, color: B.mute, align: "center", justify: "center", pos: [960, 700] }, 1.0, 1.95);
  // exit: logo eases back and fades before the industries headline arrives
  keys(S(lg.ctl), [[1.95, [260, 260]], [2.45, [236, 236]]], 80);
  keys(O(lg.mark), [[2.0, 100], [2.4, 0]], 60);
  keys(O(lg.word), [[2.0, 100], [2.4, 0]], 60);
  allMotionBlur(c);
  return c;
}

#include "scene_industries.jsx"
#include "scene_platform_cta.jsx"

// ================================================================= assemble
function build() {
  app.beginSuppressDialogs();
  if (app.project) app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
  app.newProject();
  app.project.bitsPerChannel = 8;    // the 8-bit H.264 output + film grain shows no banding, and it halves render memory
  // CPU rendering: this PC's GPU (GeForce GT 730) is unsupported and CUDA renders fail with memory errors mid-render
  try { app.project.gpuAccelType = GpuAccelType.SOFTWARE; } catch (e) {}
  var fScenes = app.project.items.addFolder("Scenes"), fAssets = app.project.items.addFolder("Assets");

  var photos = {}, names = ["Mortgage", "Solar", "Roofing", "Fiber", "HVAC", "Pest control"];
  for (var i = 0; i < names.length; i++) {
    var f = new File(ASSETS + "/photos/" + names[i] + ".jpg");
    if (f.exists) { photos[names[i]] = importFile(f.fsName, names[i] + ".jpg"); photos[names[i]].parentFolder = fAssets; }
  }
  var main = mkComp("Sequifi_Promo_30s", W, H, DUR, FPS, B.night950);
  buildBackground(main);
  var scenes = [[sceneHook(), 0, 103], [sceneLogo(), 4.0, 103], [sceneIndustries(photos), 6.4, 101.5], [scenePlatform(), 21.5, 102.5], [sceneCTA(), 26.15, 103]];
  for (var s = 0; s < scenes.length; s++) {
    var sc = scenes[s][0], L = place(main, sc, scenes[s][1]);
    L.collapseTransformation = true;
    keys(S(L), [[scenes[s][1], [100, 100]], [scenes[s][1] + sc.duration, [scenes[s][2], scenes[s][2]]]], 0);
  }
  buildFinish(main);
  for (var k = 1; k <= app.project.numItems; k++) {
    var it = app.project.item(k);
    if (it instanceof CompItem && it !== main) it.parentFolder = fScenes;
    if (it instanceof FootageItem && it.mainSource instanceof SolidSource) it.parentFolder = fAssets;
  }
  main.openInViewer();
  var EXPORTS = File(ROOT).parent.parent.fsName + "/04_Final_Exports/Video";
  new Folder(EXPORTS).create();
  var rq = app.project.renderQueue.items.add(main);
  rq.applyTemplate("Best Settings");
  var om1 = rq.outputModule(1);
  om1.applyTemplate("H.264 - Match Render Settings - 40 Mbps");
  om1.file = new File(EXPORTS + "/Sequifi_Promo_30s_1080p.mp4");
  var om2 = rq.outputModules.add();
  om2.applyTemplate("H.264 - Match Render Settings - 15 Mbps");
  om2.file = new File(EXPORTS + "/Sequifi_Promo_30s_1080p_web.mp4");
  app.project.save(new File(ROOT + "/Sequifi_Promo_30s.aep"));
  app.endSuppressDialogs(false);
  return main;
}

var __log = new File(ROOT + "/build_log.txt");
__log.open("w");
try { build(); __log.write("ok " + (new Date()).toString()); }
catch (e) { __log.write("ERR line " + e.line + " in " + (e.fileName || "") + ": " + e.toString()); }
__log.close();
