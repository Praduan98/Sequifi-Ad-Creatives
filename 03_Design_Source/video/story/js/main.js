// Conductor for the brand story: builds every scene, then renders any time t via window.__seek(t).
"use strict";

const LAYER = {};
// Each scene is authored on its own clock and placed in the film by sc.dt (film time = scene time + dt), so a scene can
// slide along the timeline without rewriting its times. Its cues and fast-motion windows (sc.fast) move with it.
const sh = (sc) => sc.dt || 0;

// first scene that claims time t for a shared actor (spark / cursor) drives it
const claim = (key, t) => { for (const sc of SCENES) if (sc[key]) { const s = sc[key](t - sh(sc)); if (s) return s; } return null; };

// the scene camera; where two scenes overlap, blend from the earlier one to the later one
function camera(t) {
  const act = SCENES.filter((sc) => sc.cam && t >= sc.t0 + sh(sc) && t < sc.t1 + sh(sc));
  let c = { x: 0, y: 0, s: 1, r: 0 };
  if (act.length === 1) c = act[0].cam(t - sh(act[0]));
  else if (act.length > 1) {
    const a = act[act.length - 2], b = act[act.length - 1], w = smooth(inv(b.t0 + sh(b), a.t1 + sh(a), t)), ca = a.cam(t - sh(a)), cb = b.cam(t - sh(b));
    c = { x: lerp(ca.x, cb.x, w), y: lerp(ca.y, cb.y, w), s: lerp(ca.s, cb.s, w), r: lerp(ca.r, cb.r, w) };
  }
  return c;
}

// background: blobs [x, y, r, k] (stage px), ring, circular wipe and the two palettes it separates
function bgState(t) {
  const blobs = [
    K(t, [[0, [1250, 1050, 520, 0.55]], [2.6, [1150, 980, 560, 0.7]], [4.0, [1500, 300, 600, 0.75]], [8.0, [1600, 260, 600, 0.6]], [12, [380, 600, 460, 0.85]], [16, [1500, 300, 520, 0.7]],
      [20, [1450, 520, 640, 0.8]], [24, [1300, 260, 620, 0.75]], [27, [1500, 300, 620, 0.6]], [30, [960, 540, 700, 0.55]], [34, [960, 600, 640, 0.6]], [36, [1450, 520, 600, 0.7]],
      [38, [1500, 300, 640, 0.7]], [40, [960, 420, 620, 0.8]], [45, [960, 420, 640, 0.8]]]),
    K(t, [[0, [300, 200, 420, 0.25]], [4.0, [380, 860, 520, 0.55]], [8.0, [300, 900, 520, 0.4]], [12, [1500, 300, 520, 0.7]], [16, [300, 820, 520, 0.7]], [20, [400, 260, 460, 0.6]],
      [24, [380, 860, 560, 0.65]], [27, [300, 800, 600, 0.55]], [30, [1600, 900, 500, 0.5]], [34, [380, 300, 520, 0.55]], [38, [300, 860, 560, 0.6]], [40, [1500, 860, 520, 0.6]], [45, [1500, 860, 520, 0.6]]]),
    K(t, [[0, [1700, 160, 420, 0.4]], [4.0, [700, 300, 520, 0.45]], [12, [1600, 900, 520, 0.6]], [16, [960, 160, 600, 0.6]], [24, [1700, 900, 520, 0.5]], [30, [300, 300, 520, 0.45]],
      [36, [700, 900, 520, 0.5]], [40, [380, 300, 520, 0.6]], [45, [380, 300, 520, 0.6]]]),
    K(t, [[0, [960, 540, 300, 0.1]], [12, [700, 200, 420, 0.5]], [20, [1200, 900, 420, 0.5]], [24, [960, 540, 300, 0.2]], [40, [1100, 660, 460, 0.5]], [45, [1100, 660, 460, 0.5]]]),
  ];
  const ring = K(t, [[0, [1100, 1180, 420, 0.0]], [0.3, [1100, 1180, 420, 0.75]], [3.3, [1000, 1120, 470, 0.7]], [3.95, [960, 540, 300, 0.0]]]);
  // dark ↔ light wipes centred on the spark, timed by the scenes that open them (sc.wipe, scene time):
  // the night → light (centre), the rep photo → dark (photo centre), "back office?" → light (the spark on the "?", WIPE3)
  const wp = (sc) => [sc.wipe[0] + sh(sc), sc.wipe[1] + sh(sc)], [a1, b1] = wp(NIGHT), [a2, b2] = wp(REP), [a3, b3] = wp(SCALE);
  let wipe = [960, 540, 0, 20], mode = [0, 0];
  if (t < a1) mode = [0, 0];
  else if (t < b1) { wipe = [960, 540, 2300 * E.inOutCubic(inv(a1, b1, t)), 30]; mode = [0, 1]; }
  else if (t < a2) mode = [1, 1];
  else if (t < b2) { wipe = [1380, 560, 2300 * E.inOutCubic(inv(a2, b2, t)), 30]; mode = [1, 0]; }
  else if (t < a3) mode = [0, 0];
  else if (t < b3) { wipe = [WIPE3[0], WIPE3[1], 2300 * E.inOutCubic(inv(a3, b3, t)), 30]; mode = [0, 1]; }
  else mode = [1, 1];
  return { blobs, ring, wipe, mode, dark: K(t, [[0, 0.7], [0.6, 0], [45, 0]]) };
}

window.__ready = false;
window.__seek = function (t) {
  t = Math.max(0, Math.min(DUR - 1e-4, t));
  const FT0 = Math.round(t * FPS) / FPS;
  FT = FT0;
  const cam = camera(t);
  tf(LAYER.world, { x: cam.x, y: cam.y, s: cam.s, r: cam.r });
  const bs = bgState(t);
  Background.draw(t, bs);
  const light = (bs.mode[0] + bs.mode[1]) / 2;
  const ps = { dust: K(t, [[0, 0.35], [4, 0.6], [12.3, 0.5], [12.8, 0], [24.6, 0], [25.2, 0.6], [39.6, 0.6], [40.1, 0], [45, 0]]), bokeh: 0, cx: cam.x, cy: cam.y, implode: 0, ix: 960, iy: 540 };
  for (const sc of SCENES) {
    const on = t >= sc.t0 + sh(sc) - 0.02 && t <= sc.t1 + sh(sc) + 0.02;
    if (sc.root) show(sc.root, on);
    FT = FT0 - sh(sc);   // frame-quantised time on the scene's clock
    if (on) sc.update(t - sh(sc));
  }
  FT = FT0;
  // shared actors: velocity from the neighbouring states (both are pure functions of time)
  const sp = claim("spark", t);
  if (sp) {
    const a = claim("spark", t - 0.008), b = claim("spark", t + 0.008);
    if (a && b) { sp.vx = (b.x - a.x) / 0.016; sp.vy = (b.y - a.y) / 0.016; }
    if (sp.light === undefined) sp.light = light;
  }
  Spark.update(sp);
  const cu = claim("cursor", t);
  if (cu && cu.light === undefined) cu.light = light;
  Cursor.update(cu);
  Particles.drawBack(LAYER.pback, t, ps);
  Particles.drawFront(LAYER.pfront, t, ps);
  LAYER.black.style.opacity = (t < 0.35 ? 1 - t / 0.35 : 0).toFixed(3);
};
window.__cues = () => CUES.slice().sort((a, b) => a.t - b.t);
window.__fast = () => SCENES.flatMap((sc) => (sc.fast || []).map(([a, b]) => [a + sh(sc), b + sh(sc)]));
window.__info = () => ({ scenes: SCENES.length, cues: CUES.length });

async function boot() {
  Background.init(document.getElementById("bg"));
  LAYER.pback = document.getElementById("pback").getContext("2d");
  LAYER.world = document.getElementById("world");
  LAYER.pfront = document.getElementById("pfront").getContext("2d");
  LAYER.black = document.getElementById("black");
  await document.fonts.ready;
  await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
  await loadLogo();
  for (const sc of SCENES) {
    sc.root = el("div", "abs scene-" + sc.name, LAYER.world); css(sc.root, { width: "1920px", height: "1080px" });
    const n0 = CUES.length;
    sc.build();
    for (let i = n0; i < CUES.length; i++) CUES[i].t = +(CUES[i].t + sh(sc)).toFixed(4);   // the scene's cues on the film clock
  }
  Spark.build(LAYER.world);
  Cursor.build(LAYER.world);
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : i.decode().catch(() => {}))));
  window.__seek(0);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__ready = true;
}
window.addEventListener("load", () => boot().catch((e) => { document.title = "ERR " + e.message; window.__error = String(e.stack || e); }));
