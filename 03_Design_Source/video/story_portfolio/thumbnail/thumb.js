// Thumbnail for the portfolio cut: the hero's leap from "code." drawn as onion skins at equal time steps along its arc,
// the solid hero at the last frame, and the team watching from below.
import "../js/toys.js";

const Toys = window.Toys, SVGNS = "http://www.w3.org/2000/svg";
const $ = (id) => document.getElementById(id);
const lerp = (a, b, k) => a + (b - a) * k;
const svg = (parent, tag, attrs) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); parent.appendChild(e); return e; };
const bodyHalf = (name, px) => (Toys.half(name) * px) / Toys.VIEW;   // canvas centre to feet, in px

// one toy, centred on (x, y), drawn at a canvas size that matches its on-screen size
function toy(name, x, y, px, pose, css = {}) {
  const c = document.createElement("canvas"), n = Math.round(Math.min(512, px * 1.1));
  c.width = c.height = n;
  Object.assign(c.style, { width: px + "px", height: px + "px", transform: `translate(${x - px / 2}px, ${y - px / 2}px) ${css.tf || ""}` });
  if (css.opacity !== undefined) c.style.opacity = css.opacity;
  if (css.filter) c.style.filter = css.filter;
  const ctx = c.getContext("2d");
  Toys.draw(ctx, name, pose);
  if (css.ghost) { ctx.globalCompositeOperation = "source-atop"; ctx.globalAlpha = css.ghost; ctx.fillStyle = "#9AA9FA"; ctx.fillRect(0, 0, n, n); }
  $("cast").appendChild(c);
  return c;
}
function shadow(x, y, w) {
  const d = document.createElement("div"); d.className = "shadow";
  Object.assign(d.style, { left: x - w / 2 + "px", top: y - w * 0.09 + "px", width: w + "px", height: w * 0.18 + "px" });
  $("cast").appendChild(d);
}

function layout() {
  const head = $("head"), sel = $("sel").getBoundingClientRect(), hb = head.getBoundingClientRect();
  $("sub").style.top = hb.bottom + 26 + "px";
  Object.assign($("cursor").style, { left: sel.right - 18 + "px", top: sel.bottom - 14 + "px" });

  // the team: standing just below the frame's edge, looking up at the hero
  const HERO = [1500, 420], HPX = 600, FLOOR = 1094;
  const team = [["hardhat", 1212, 520], ["specs", 1478, 540], ["headset", 1730, 500]];
  team.forEach(([name, x, px], i) => {
    const half = bodyHalf(name, px), cy = FLOOR - half, dx = HERO[0] - x, dy = HERO[1] - (cy - half * 0.4);
    shadow(x, FLOOR - 4, px * 0.62);
    // faces tilt up towards the hero (negative pitch lifts the face in toys.js), pupils follow it
    toy(name, x, cy, px, { pitch: [-0.26, -0.24, -0.22][i], look: [Math.max(-1, Math.min(1, dx / 420)), Math.min(1, -dy / 380)], yaw: 0.22 * Math.sign(dx) * Math.min(1, Math.abs(dx) / 300), roll: [0.05, -0.02, -0.06][i] });
  });

  // the leap: a parabola from the top-right handle of the selection box to the hero (equal time steps = projectile spacing)
  // first frame: squashed on the selection box's top-right handle, ready to spring
  const SQ0 = 0.28, P0 = [sel.right - 6, sel.top + 6 - bodyHalf("hero", HPX * 0.34) * (1 - SQ0)], P2 = HERO, P1 = [lerp(P0[0], P2[0], 0.46), -60];
  const at = (u) => [(1 - u) ** 2 * P0[0] + 2 * (1 - u) * u * P1[0] + u * u * P2[0], (1 - u) ** 2 * P0[1] + 2 * (1 - u) * u * P1[1] + u * u * P2[1]];
  const tan = (u) => [2 * (1 - u) * (P1[0] - P0[0]) + 2 * u * (P2[0] - P1[0]), 2 * (1 - u) * (P1[1] - P0[1]) + 2 * u * (P2[1] - P1[1])];
  const N = 5, chart = $("chart");

  // time stamps of the first and last frame, each beside the frame it measures
  const lab = (x, y, t, anchor = "start") => { const e = svg(chart, "text", { class: "t", x, y, "text-anchor": anchor }); e.textContent = t; };
  lab(P0[0] + HPX * 0.34 * 0.28 * (1 + SQ0) + 18, P0[1] + 30, "t 0.00s");
  lab(HERO[0] + 166, HERO[1] - 120, "t 0.30s");

  // onion skins at equal time steps, growing as it comes towards camera; the last one is the solid hero
  for (let i = 0; i < N; i++) {
    const u = i / N, [x, y] = at(u), px = HPX * lerp(0.34, 0.74, u), sq = i === 0 ? SQ0 : 0;
    const vy = tan(u)[1] / Math.hypot(...tan(u)), st = 1 + 0.12 * Math.abs(vy);
    // the antenna trails the leap (follow-through) and settles near the last frame; the launch frame sits upright, squashed
    toy("hero", x, y, px, { yaw: 0.4, look: [0.7, -vy * 0.8], wob: lerp(1.0, 0.3, u) },
      { opacity: lerp(0.22, 0.5, u).toFixed(2), ghost: 0.82, tf: `rotate(${(i === 0 ? 0 : lerp(16, 2, u)).toFixed(1)}deg) scale(${(1 + sq).toFixed(3)}, ${((1 - sq) * (i === 0 ? 1 : st)).toFixed(3)})` });
  }
  toy("hero", HERO[0], HERO[1], HPX, { yaw: 0.12, look: [0.05, 0.02], wob: 0.32 },
    { filter: "drop-shadow(0 0 26px rgba(143,160,245,.55)) drop-shadow(0 28px 34px rgba(2,3,14,.55))", tf: "rotate(-6deg) scale(.97, 1.05)" });
}

await document.fonts.ready;
Toys.init();
layout();
window.__seek = () => {};
window.__info = () => ({ w: 1920, h: 1080, fps: 30, dur: 1 });
window.__ready = true;
