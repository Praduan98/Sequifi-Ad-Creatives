// Sequifi motion library for After Effects (ExtendScript). Included by build_promo.jsx.
// Brand: sequifi.com tokens (see 03_Design_Source/styles/tokens.css). Dark theme.

var B = {
  accent: "#6078EC", soft: "#8FA0F5", deep: "#4A5BD0", tint: "#EEF1FE",
  ink: "#0D1020", night950: "#03050F", night900: "#050817", night800: "#080B1D",
  card: "#0C1128", cardHi: "#121A3A", line: "#1E2650", green: "#2BB594", red: "#D4183D", amber: "#F2A93B",
  white: "#FFFFFF", mute: "#9AA3C7", dim: "#5D6690"
};
var F = {
  display: "SchibstedGrotesk-ExtraBold", displayBold: "SchibstedGrotesk-Bold", displaySemi: "SchibstedGrotesk-SemiBold",
  ui: "Inter-Regular", uiMed: "Inter-Medium", uiSemi: "Inter-SemiBold", uiBold: "Inter-Bold", serif: "InstrumentSerif-Italic"
};

function hex(h, a) {
  h = h.replace("#", "");
  var c = [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255];
  if (a !== undefined) c.push(a);
  return c;
}

// ---------- easing ----------
// Strong ease-in-out ("expo-ish"): high influence on both sides.
function easeKeys(prop, infl) {
  infl = infl || 85;
  for (var k = 1; k <= prop.numKeys; k++) {
    var dims = prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL ? 1
             : (prop.value instanceof Array ? prop.value.length : 1);
    var e = [], i;
    for (i = 0; i < dims; i++) e.push(new KeyframeEase(0, infl));
    try { prop.setTemporalEaseAtKey(k, e, e); } catch (err) {}
  }
}
// keys: [[t, v], ...]; infl: ease influence (0 = linear)
function keys(prop, list, infl) {
  for (var i = 0; i < list.length; i++) prop.setValueAtTime(list[i][0], list[i][1]);
  if (infl !== 0) easeKeys(prop, infl);
  return prop;
}
// Ease out only (fast start, soft landing) for entrances
function keysOut(prop, list) {
  for (var i = 0; i < list.length; i++) prop.setValueAtTime(list[i][0], list[i][1]);
  for (var k = 1; k <= prop.numKeys; k++) {
    var dims = prop.propertyValueType === PropertyValueType.TwoD_SPATIAL || prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL ? 1
             : (prop.value instanceof Array ? prop.value.length : 1);
    var inE = [], outE = [];
    for (var d = 0; d < dims; d++) { inE.push(new KeyframeEase(0, 92)); outE.push(new KeyframeEase(0, 12)); }
    try { prop.setTemporalEaseAtKey(k, inE, outE); } catch (e) {}
  }
  return prop;
}

// ---------- comps / layers ----------
function mkComp(name, w, h, dur, fps, bg) {
  var c = app.project.items.addComp(name, w, h, 1, dur, fps);
  c.bgColor = hex(bg || B.night950);
  c.motionBlur = true;
  c.shutterAngle = 200;
  c.shutterPhase = -100;
  return c;
}
function span(layer, t0, t1) { layer.inPoint = t0; layer.outPoint = t1; return layer; }
function tr(layer) { return layer.property("ADBE Transform Group"); }
function P(layer) { return tr(layer).property("ADBE Position"); }
function S(layer) { return tr(layer).property("ADBE Scale"); }
function O(layer) { return tr(layer).property("ADBE Opacity"); }
function R(layer) { return tr(layer).property("ADBE Rotate Z"); }
function A(layer) { return tr(layer).property("ADBE Anchor Point"); }

function shapeLayer(comp, name) {
  var l = comp.layers.addShape();
  l.name = name;
  return l;
}
function contents(l) { return l.property("ADBE Root Vectors Group"); }
function addGroup(parentContents, name) {
  var g = parentContents.addProperty("ADBE Vector Group");
  g.name = name;
  return g;
}
function gContents(g) { return g.property("ADBE Vectors Group"); }
function gTransform(g) { return g.property("ADBE Vector Transform Group"); }
function addFill(vc, color, opacity) {
  var f = vc.addProperty("ADBE Vector Graphic - Fill");
  f.property("ADBE Vector Fill Color").setValue(hex(color));
  f.property("ADBE Vector Fill Opacity").setValue(opacity === undefined ? 100 : opacity);
  return f;
}
function addStroke(vc, color, width, opacity, roundCap) {
  var s = vc.addProperty("ADBE Vector Graphic - Stroke");
  s.property("ADBE Vector Stroke Color").setValue(hex(color));
  s.property("ADBE Vector Stroke Width").setValue(width);
  s.property("ADBE Vector Stroke Opacity").setValue(opacity === undefined ? 100 : opacity);
  if (roundCap) { s.property("ADBE Vector Stroke Line Cap").setValue(2); s.property("ADBE Vector Stroke Line Join").setValue(2); }
  return s;
}
// Linear gradient fill along x (left->right) across width w
function addGradFill(vc, c1, c2, w, h, angleDown) {
  var g = vc.addProperty("ADBE Vector Graphic - G-Fill");
  g.property("ADBE Vector Grad Type").setValue(1);
  if (angleDown) { g.property("ADBE Vector Grad Start Pt").setValue([0, -h / 2]); g.property("ADBE Vector Grad End Pt").setValue([0, h / 2]); }
  else { g.property("ADBE Vector Grad Start Pt").setValue([-w / 2, 0]); g.property("ADBE Vector Grad End Pt").setValue([w / 2, 0]); }
  setGradColors(g.property("ADBE Vector Grad Colors"), c1, c2);
  return g;
}
function addGradStroke(vc, c1, c2, w, width) {
  var g = vc.addProperty("ADBE Vector Graphic - G-Stroke");
  g.property("ADBE Vector Grad Type").setValue(1);
  g.property("ADBE Vector Grad Start Pt").setValue([-w / 2, 0]);
  g.property("ADBE Vector Grad End Pt").setValue([w / 2, 0]);
  g.property("ADBE Vector Stroke Width").setValue(width);
  g.property("ADBE Vector Stroke Line Cap").setValue(2);
  g.property("ADBE Vector Stroke Line Join").setValue(2);
  setGradColors(g.property("ADBE Vector Grad Colors"), c1, c2);
  return g;
}
// Gradient colours can only be set through an expression-free hack: AE exposes them as a "custom value" property.
// We set them via the documented ExtendScript workaround of applying a preset-free value array when supported.
function setGradColors(prop, c1, c2) {
  try {
    var a = hex(c1), b = hex(c2);
    prop.setValue([0, a[0], a[1], a[2], 1, b[0], b[1], b[2], 0, 1, 1, 1]);
  } catch (e) { /* AE keeps its default white->black ramp; callers avoid relying on this */ }
}

// Rounded rectangle layer, centred on pos
function rect(comp, o) {
  var l = shapeLayer(comp, o.name || "Rect");
  var g = addGroup(contents(l), "Box");
  var r = gContents(g).addProperty("ADBE Vector Shape - Rect");
  r.property("ADBE Vector Rect Size").setValue(o.size);
  r.property("ADBE Vector Rect Roundness").setValue(o.radius || 0);
  if (o.stroke) addStroke(gContents(g), o.stroke, o.strokeW || 1.5, o.strokeOpacity === undefined ? 100 : o.strokeOpacity);
  if (o.grad) addGradFill(gContents(g), o.grad[0], o.grad[1], o.size[0], o.size[1], o.gradDown);
  else if (o.fill) addFill(gContents(g), o.fill, o.fillOpacity);
  P(l).setValue(o.pos || [comp.width / 2, comp.height / 2]);
  return l;
}
function ellipse(comp, o) {
  var l = shapeLayer(comp, o.name || "Ellipse");
  var g = addGroup(contents(l), "Dot");
  var e = gContents(g).addProperty("ADBE Vector Shape - Ellipse");
  e.property("ADBE Vector Ellipse Size").setValue(o.size);
  if (o.stroke) addStroke(gContents(g), o.stroke, o.strokeW || 2, o.strokeOpacity);
  if (o.fill) addFill(gContents(g), o.fill, o.fillOpacity);
  P(l).setValue(o.pos || [comp.width / 2, comp.height / 2]);
  return l;
}
// Open/closed bezier path from points [[x,y]...] (straight segments) or full {v,i,o,closed}
function pathLayer(comp, o) {
  var l = shapeLayer(comp, o.name || "Path");
  P(l).setValue([0, 0]);   // path coordinates are comp coordinates (shape layers default to the comp centre)
  var subs = o.subpaths || [{ v: o.points, closed: !!o.closed }];
  var g = addGroup(contents(l), "Path");
  for (var s = 0; s < subs.length; s++) {
    var sp = subs[s], shp = new Shape();
    shp.vertices = sp.v;
    if (sp.i) shp.inTangents = sp.i;
    if (sp.o) shp.outTangents = sp.o;
    shp.closed = !!sp.closed;
    var p = gContents(g).addProperty("ADBE Vector Shape - Group");
    p.property("ADBE Vector Shape").setValue(shp);
  }
  if (o.trim) gContents(g).addProperty("ADBE Vector Filter - Trim");
  if (o.gradStroke) addGradStroke(gContents(g), o.gradStroke[0], o.gradStroke[1], o.gradW || comp.width, o.width || 4);
  else if (o.stroke) addStroke(gContents(g), o.stroke, o.width || 4, o.strokeOpacity, true);
  if (o.fill) {
    var f = addFill(gContents(g), o.fill, o.fillOpacity);
    f.property("ADBE Vector Fill Rule").setValue(1); // non-zero winding
  }
  return l;
}
// Looked up fresh each time: adding properties to a shape group invalidates earlier property references
function trimProp(l, which) {
  var t = contents(l).property(1).property("ADBE Vectors Group").property("ADBE Vector Filter - Trim");
  var name = "ADBE Vector Trim End";
  if (which === "start") name = "ADBE Vector Trim Start";
  if (which === "offset") name = "ADBE Vector Trim Offset";
  return t.property(name);
}

// Text layer. o: {font, size, color, tracking, justify:"left|center|right", pos, leading, box:[w,h]}
// Offset from a box's left edge to its alignment point (no chained ternaries: ExtendScript mis-parses them)
function alignX(al, w) { if (al === "center") return w / 2; if (al === "right") return w; return 0; }

function text(comp, str, o) {
  var l = o.box ? comp.layers.addBoxText(o.box, str) : comp.layers.addText(str);
  var sp = l.property("ADBE Text Properties").property("ADBE Text Document");
  var d = sp.value;
  d.resetCharStyle();
  d.font = o.font || F.ui;
  d.fontSize = o.size || 40;
  d.fillColor = hex(o.color || B.white);
  d.applyFill = true;
  d.applyStroke = false;
  d.tracking = o.tracking || 0;
  if (o.leading) { d.autoLeading = false; d.leading = o.leading; }
  d.justification = ParagraphJustification.LEFT_JUSTIFY;   // alignment is done with the anchor (centre/right paragraphs report stale bounds)
  sp.setValue(d);
  l.name = o.name || str.substr(0, 24);
  // Anchor on the rendered glyph box: align = left | center | right (vertically always the box centre).
  // Static text: computed once (a live expression would cancel text-animator motion, which moves the box).
  // Live text (counters): expression, so the box stays put while the width changes.
  // NB: ExtendScript mis-parses chained ternaries (a ? b : c ? d : e), so alignment uses alignX()/if-else
  var al = o.align || o.justify || "left";
  var xExpr = "r.left";
  if (al === "center") xExpr = "r.left + r.width / 2";
  if (al === "right") xExpr = "r.left + r.width";
  if (o.live) {
    A(l).expression = "var r = sourceRectAtTime(time, false); [" + xExpr + ", " + (o.baseline ? "0" : "r.top + r.height / 2") + "]";
  } else {
    var r = l.sourceRectAtTime(0, false);
    A(l).setValue([r.left + alignX(al, r.width), o.baseline ? 0 : r.top + r.height / 2]);   // baseline: y = text baseline
  }
  P(l).setValue(o.pos || [comp.width / 2, comp.height / 2]);
  return l;
}
// Re-anchor a text layer at the centre of its rendered box (so scale/rotation pivot is visual centre)
function centerAnchor(l, t) {
  var r = l.sourceRectAtTime(t || 0, false);
  A(l).setValue([r.left + r.width / 2, r.top + r.height / 2]);
  return r;
}
function textWidth(l, t) { return l.sourceRectAtTime(t || 0, false).width; }

// Animated number counter (source text driven by a slider), formatted with prefix/suffix and thousands separators
function counter(comp, o) {
  o.live = true;
  var l = text(comp, (o.prefix || "") + "0" + (o.suffix || ""), o);
  l.name = "Counter " + (o.name || o.to);
  var sl = l.property("ADBE Effect Parade").addProperty("ADBE Slider Control");
  sl.name = "Count";
  var v = sl.property("ADBE Slider Control-0001");
  keys(v, [[o.t0, o.from || 0], [o.t1, o.to]], 70);
  var dec = o.decimals || 0;
  l.property("ADBE Text Properties").property("ADBE Text Document").expression =
    "var n = effect('Count')(1).value; var d = " + dec + ";\n" +
    "var s = n.toFixed(d); var p = s.split('.'); p[0] = p[0].replace(/\\B(?=(\\d{3})+(?!\\d))/g, ',');\n" +
    "'" + (o.prefix || "") + "' + p.join('.') + '" + (o.suffix || "") + "';";
  return l;
}

// ---------- reusable motion ----------
function fadeUp(l, t, dur, dy, hold) {
  var p = P(l).value;
  dur = dur || 0.6; dy = dy === undefined ? 40 : dy;
  keysOut(P(l), [[t, [p[0], p[1] + dy]], [t + dur, p]]);
  keys(O(l), [[t, 0], [t + dur * 0.7, 100]], 60);
  return l;
}
function fadeOut(l, t, dur, dy) {
  dur = dur || 0.4;
  var o = O(l);
  o.setValueAtTime(t, o.valueAtTime(t, false));
  o.setValueAtTime(t + dur, 0);
  if (dy) {
    var p = P(l), v = p.valueAtTime(t, false);
    p.setValueAtTime(t, v);
    p.setValueAtTime(t + dur, [v[0], v[1] - dy]);
  }
  easeKeys(o, 70);
  return l;
}
function popIn(l, t, dur, from) {
  dur = dur || 0.5;
  var s = S(l).value;
  var f = from === undefined ? 70 : from;
  keysOut(S(l), [[t, [f, f]], [t + dur, s]]);
  keys(O(l), [[t, 0], [t + dur * 0.5, 100]], 50);
  return l;
}
function glow(l, radius, intensity, threshold, colA, colB) {
  var g = l.property("ADBE Effect Parade").addProperty("ADBE Glo2");
  try {
    g.property("ADBE Glo2-0002").setValue(threshold === undefined ? 60 : threshold);   // threshold %
    g.property("ADBE Glo2-0003").setValue(radius || 24);
    g.property("ADBE Glo2-0004").setValue(intensity === undefined ? 0.5 : intensity);
    g.property("ADBE Glo2-0005").setValue(1);                                          // composite original: on top
    if (colA) {
      g.property("Glow Colors").setValue(2);                                           // A & B colours
      g.property("Color A").setValue(hex(colA));
      g.property("Color B").setValue(hex(colB || colA));
    }
  } catch (e) {}
  return g;
}
// Soft-edged blob: an oversized solid with a feathered rect / ellipse mask.
// Used for glows, shadows and halos (a blurred shape layer gets clipped to its content box).
function softBlob(comp, o) {
  var f = o.feather === undefined ? 80 : o.feather;
  var sw = Math.round(o.size[0] + f * 2 + 200), sh = Math.round(o.size[1] + f * 2 + 200);
  var l = comp.layers.addSolid(hex(o.color || "#000000"), o.name || "Soft Blob", sw, sh, 1, comp.duration);
  var m = l.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), ms = new Shape();
  var cx = sw / 2, cy = sh / 2, rx = o.size[0] / 2, ry = o.size[1] / 2, k = 0.5523;
  if (o.ellipse) {
    ms.vertices = [[cx, cy - ry], [cx + rx, cy], [cx, cy + ry], [cx - rx, cy]];
    ms.inTangents = [[-rx * k, 0], [0, -ry * k], [rx * k, 0], [0, ry * k]];
    ms.outTangents = [[rx * k, 0], [0, ry * k], [-rx * k, 0], [0, -ry * k]];
  } else {
    ms.vertices = [[cx - rx, cy - ry], [cx + rx, cy - ry], [cx + rx, cy + ry], [cx - rx, cy + ry]];
  }
  ms.closed = true;
  m.property("ADBE Mask Shape").setValue(ms);
  m.property("ADBE Mask Feather").setValue([f, f]);
  P(l).setValue(o.pos || [comp.width / 2, comp.height / 2]);
  O(l).setValue(o.opacity === undefined ? 100 : o.opacity);
  return l;
}
// Soft brand halo behind a layer (e.g. the CTA button)
function halo(comp, behind, o) {
  var h = softBlob(comp, { name: (behind.name || "Halo") + " Halo", size: o.size, pos: o.pos, color: o.color || B.accent,
                           feather: o.blur || 40, opacity: o.opacity === undefined ? 55 : o.opacity, ellipse: true });
  h.moveAfter(behind);
  return h;
}
function blur(l, amount) {
  var b = l.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
  b.property("ADBE Gaussian Blur 2-0001").setValue(amount);
  return b;
}
function shadow(l, opacity, dist, soft, color) {
  var d = l.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
  d.property("ADBE Drop Shadow-0001").setValue(hex(color || "#000000"));
  d.property("ADBE Drop Shadow-0002").setValue((opacity === undefined ? 50 : opacity) * 2.55);
  d.property("ADBE Drop Shadow-0003").setValue(90 + 90);
  d.property("ADBE Drop Shadow-0004").setValue(dist === undefined ? 30 : dist);
  d.property("ADBE Drop Shadow-0005").setValue(soft === undefined ? 60 : soft);
  return d;
}
// Brand duotone for photos: navy shadows -> periwinkle mids -> pale highlights
function tritone(l) {
  var t = l.property("ADBE Effect Parade").addProperty("ADBE Tritone");
  t.property("ADBE Tritone-0001").setValue(hex("#F2F4FF"));
  t.property("ADBE Tritone-0002").setValue(hex("#5B6FD8"));
  t.property("ADBE Tritone-0003").setValue(hex("#03050F"));
  return t;
}
// Brand gradient on any layer: a Gradient Ramp solid placed above `target`, alpha-matted by it.
// Returns the gradient layer (move/animate the target; the gradient follows via parenting).
function gradientOver(comp, target, c1, c2, from, to) {
  var g = comp.layers.addSolid(hex(c1), target.name + " Gradient", comp.width, comp.height, 1);
  var ramp = g.property("ADBE Effect Parade").addProperty("ADBE Ramp");
  ramp.property("ADBE Ramp-0001").setValue(from);          // start of ramp
  ramp.property("ADBE Ramp-0002").setValue(hex(c1));
  ramp.property("ADBE Ramp-0003").setValue(to);            // end of ramp
  ramp.property("ADBE Ramp-0004").setValue(hex(c2));
  g.moveBefore(target);
  g.inPoint = target.inPoint; g.outPoint = target.outPoint;
  g.setTrackMatte(target, TrackMatteType.ALPHA);
  target.enabled = false;   // the text only drives the matte (AE 23+ keeps hidden mattes working)
  return g;
}
// Left-to-right reveal with a feathered rectangular mask, in the layer's own coordinates (deterministic, unlike Linear Wipe)
function revealMask(layer, x0, x1, y0, y1, t0, t1) {
  var m = layer.property("ADBE Mask Parade").addProperty("ADBE Mask Atom"), mp = m.property("ADBE Mask Shape");
  function box(xr) { var s = new Shape(); s.vertices = [[x0 - 120, y0], [xr, y0], [xr, y1], [x0 - 120, y1]]; s.closed = true; return s; }
  mp.setValueAtTime(t0, box(x0 - 70));    // feather (40) stays fully clear of the first glyph until t0
  mp.setValueAtTime(t1, box(x1 + 70));
  easeKeys(mp, 80);
  m.property("ADBE Mask Feather").setValue([40, 0]);
  return m;
}
function importFile(path, name) {
  var io = new ImportOptions(new File(path));
  var item = app.project.importFile(io);
  if (name) item.name = name;
  return item;
}
function matte(layer, matteLayer, luma) {
  layer.setTrackMatte(matteLayer, luma ? TrackMatteType.LUMA : TrackMatteType.ALPHA);
}
