// Conductor: builds every scene, then renders any time t on demand via window.__seek(t).
"use strict";

const LAYER = {};
const IMPACTS = [[4.0, 12], [12.0, 5], [30.0, 8], [40.0, 14]];   // [time, shake amplitude]
// windows of very fast motion (swipe-away, logo fly-through, flyers, glass wipes, wall exit, zoom-throughs, implosion):
// the renderer takes more motion-blur samples there (28, or the third value) so fast edges smear instead of stepping
const FAST = [[3.5, 4.12], [9.5, 10.8], [10.85, 11.8], ...[1, 2, 3, 4, 5].map((k) => [indStart(k) - 0.42, indStart(k) + 0.3, 40]),
  [23.68, 24.45], [26.3, 27.15], [29.4, 30.15], [37.68, 38.12], [39.25, 40.15]];

// background mood over the film; light pools are [x, y, radius, intensity] in stage px
function bgState(t) {
  return {
    energy: K(t, [[0, 0.22], [3.6, 0.5, E.inQuad], [4.0, 0.9], [8, 0.7], [10, 0.6], [12, 0.4], [24, 0.5], [27, 0.65], [30, 0.8], [38, 0.6], [40, 0.95], [45, 0.8]]),
    rib: K(t, [[0, 0.2], [4, 0.9], [12, 0.35], [24, 0.7], [30, 0.9], [40, 1.1], [45, 0.9]]),
    hue: K(t, [[0, 0.15], [12, 0.3], [24, 0.45], [30, 0.25], [33.9, 0.6], [35, 0.3], [40, 0.2]]),
    flash: IMPACTS.reduce((a, [ti, k]) => a + (t >= ti ? Math.exp(-(t - ti) * 7) * (k / 14) * 0.8 : 0), 0),
    pulse: 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / BEAT) * (t > 4 && t < 40 ? 0.3 : 0),
    dark: K(t, [[0, 0.6], [1.2, 0], [44.4, 0], [45, 1]]),
    cx: Math.sin(t * 0.11) * 0.05, cy: Math.cos(t * 0.09) * 0.03,
    p1: K(t, [[0, [1400, 520, 520, 0]], [0.6, [1400, 520, 520, 0.3]], [2.6, [1500, 520, 520, 0.2]], [3.9, [1500, 300, 400, 0]],
      [5.5, [960, 170, 480, 0]], [6.1, [960, 170, 520, 0.26]], [7.5, [960, 170, 520, 0.18]], [8.0, [960, 500, 640, 0.14]], [9.6, [960, 500, 640, 0.16]], [10.2, [960, 500, 640, 0]],
      [11.5, [960, 96, 900, 0]], [12, [960, 96, 900, 0.08]], [23.6, [960, 96, 900, 0.08]], [24.2, [960, 540, 900, 0.22]], [26.6, [960, 540, 900, 0.2]],
      [27.2, [960, 560, 700, 0.14]], [29.4, [960, 560, 700, 0.14]], [30.2, [960, 520, 800, 0.1]], [31.6, [960, 640, 700, 0.1]], [32.2, [960, 640, 760, 0.18]],
      [34.3, [960, 640, 760, 0.17]], [34.7, [1400, 540, 520, 0.3]], [36.3, [1400, 540, 520, 0.3]], [36.7, [960, 500, 900, 0.28]], [37.8, [960, 500, 900, 0.26]],
      [38.2, [960, 520, 800, 0.08]], [40.0, [960, 392, 700, 0.16]], [40.9, [960, 640, 520, 0.12]], [41.4, [960, 640, 560, 0.34]], [45, [960, 640, 560, 0.3]]]),
    p2: K(t, [[0, [420, 720, 620, 0]], [1.0, [420, 720, 620, 0.1]], [3.9, [420, 720, 620, 0]], [5.4, [960, 660, 760, 0]], [6.0, [960, 660, 760, 0.14]], [7.8, [960, 660, 760, 0]],
      [24.0, [1500, 280, 520, 0]], [24.5, [1500, 280, 520, 0.14]], [26.8, [1500, 280, 520, 0]], [36.5, [480, 520, 520, 0]], [36.9, [480, 520, 520, 0.14]], [37.9, [480, 520, 520, 0]],
      [40.0, [960, 392, 820, 0]], [40.6, [960, 392, 820, 0.14]], [45, [960, 392, 820, 0.12]]]),
  };
}

// the scene camera; where two scenes overlap, blend from the earlier one to the later one (a camera cut inside a
// motion-blurred frame would double-expose it)
function camera(t) {
  const act = SCENES.filter((sc) => sc.cam && t >= sc.t0 && t < sc.t1);
  let c = { x: 0, y: 0, s: 1, r: 0 };
  if (act.length === 1) c = act[0].cam(t);
  else if (act.length > 1) {
    const a = act[act.length - 2], b = act[act.length - 1], w = smooth(inv(b.t0, a.t1, t)), ca = a.cam(t), cb = b.cam(t);
    c = { x: lerp(ca.x, cb.x, w), y: lerp(ca.y, cb.y, w), s: lerp(ca.s, cb.s, w), r: lerp(ca.r, cb.r, w) };
  }
  for (const [ti, k] of IMPACTS) { const [sx, sy, sr] = shake(t, ti, k); c.x += sx; c.y += sy; c.r += sr; }
  return c;
}

window.__ready = false;
window.__seek = function (t) {
  t = Math.max(0, Math.min(DUR - 1e-4, t));
  FT = Math.round(t * FPS) / FPS;
  const cam = camera(t);
  tf(LAYER.world, { x: cam.x, y: cam.y, s: cam.s, r: cam.r });
  tf(LAYER.photos, { x: cam.x * 0.35, y: cam.y * 0.35, s: 1 + (cam.s - 1) * 0.4 });
  Background.draw(t, bgState(t));
  const ps = { dust: K(t, [[0, 0.45], [4, 0.9], [12, 0.55], [24, 0.8], [30, 0.9], [45, 0.9]]), bokeh: K(t, [[0, 0.25], [4, 0.8], [12, 0.4], [27, 0.8], [45, 1.0]]),
    cx: cam.x, cy: cam.y, implode: 0, ix: 960, iy: 540 };
  for (const sc of SCENES) {
    const on = t >= sc.t0 - 0.02 && t <= sc.t1 + 0.02;
    if (sc.root) show(sc.root, on);
    if (sc.always) sc.always(t);
    if (on) sc.update(t);
    if (sc.particles && on) sc.particles(t, ps);
  }
  Particles.drawBack(LAYER.pback, t, ps);
  Particles.drawFront(LAYER.pfront, t, ps);
  const fl = IMPACTS.reduce((a, [ti, k]) => a + (t >= ti ? Math.exp(-(t - ti) * 9) * (k / 14) : 0), 0);
  LAYER.flash.style.opacity = clamp(fl * 0.45).toFixed(3);
  LAYER.black.style.opacity = (t < 0.5 ? 1 - t / 0.5 : t > 44.5 ? clamp((t - 44.5) / 0.5) : 0).toFixed(3);
};
window.__cues = () => CUES.slice().sort((a, b) => a.t - b.t);
window.__fast = () => FAST;
window.__info = () => ({ glassFilters: Glass.count() });

async function boot() {
  LAYER.bgCanvas = document.getElementById("bg");
  Background.init(LAYER.bgCanvas);
  LAYER.pback = document.getElementById("pback").getContext("2d");
  LAYER.photos = document.getElementById("photos");
  LAYER.world = document.getElementById("world");
  LAYER.pfront = document.getElementById("pfront").getContext("2d");
  LAYER.flash = document.getElementById("flash");
  LAYER.black = document.getElementById("black");
  await document.fonts.ready;
  await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})));
  await loadLogo();
  for (const sc of SCENES) { sc.root = el("div", "abs scene-" + sc.name, LAYER.world); sc.build(); }
  for (const sc of SCENES) if (sc.prewarm) sc.prewarm();   // every size a dynamic glass will take, before render
  await Glass.ready();
  await Promise.all([...document.images].map((i) => (i.complete ? 0 : i.decode().catch(() => {}))));
  window.__seek(0);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  window.__ready = true;
}
window.addEventListener("load", () => boot().catch((e) => { document.title = "ERR " + e.message; window.__error = String(e.stack || e); }));
