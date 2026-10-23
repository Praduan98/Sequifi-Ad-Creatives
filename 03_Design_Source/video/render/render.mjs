// Headless-Chrome renderer for the 45s promo (03_Design_Source/video/web).
//   node render.mjs stills  --times=0.5,4.2 --out=<dir>            review stills (no motion blur)
//   node render.mjs frames  --out=<dir> --sub=12 --subfast=28 --shutter=0.5 --step=4 --offset=0 [--from=0 --to=1350 --skipdir=<merged frames>]
//                                                                  sub-frames for frames f (f % step == offset) → <dir>/f00000_s0.png …
//                                                                  (more sub-frames inside the film's fast-motion windows, window.__fast)
//   node render.mjs cues    --out=<file.json>                       audio cue sheet
//   any mode: --page=<page path from the repo root> (default: the 45 s iOS promo, /03_Design_Source/video/web/index.html)
// Serves the repository root over HTTP so the page can load brand assets (fonts, logo, photos).
import { spawn } from "node:child_process";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const FPS = 30;
const [mode, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(rest.map((a) => { const [k, ...v] = a.replace(/^--/, "").split("="); return [k, v.join("=") || true]; }));
const PAGE = String(args.page || "/03_Design_Source/video/web/index.html");   // --page=/03_Design_Source/video/story/index.html for the brand-story film
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".ttf": "font/ttf", ".json": "application/json" };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { "Content-Type": MIME[path.extname(p).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, "127.0.0.1", r));
const PORT = server.address().port;

const out = args.out && path.resolve(String(args.out));
if (out && mode !== "cues") fs.mkdirSync(out, { recursive: true });
const dbg = 9300 + Math.floor(Math.random() * 600);
const prof = fs.mkdtempSync(path.join(process.env.TEMP || "/tmp", "sqf-chrome-"));
const chrome = spawn(CHROME, ["--headless=new", `--remote-debugging-port=${dbg}`, `--user-data-dir=${prof}`, "--hide-scrollbars",
  "--force-device-scale-factor=1", "--window-size=1920,1080", "--disable-renderer-backgrounding", "--disable-background-timer-throttling",
  "--disable-backgrounding-occluded-windows", "--autoplay-policy=no-user-gesture-required", "about:blank"], { stdio: "ignore" });
let target;
for (let i = 0; i < 80 && !target; i++) { await sleep(250); try { target = await (await fetch(`http://127.0.0.1:${dbg}/json/new?http://127.0.0.1:${PORT}${PAGE}`, { method: "PUT" })).json(); } catch {} }
if (!target) { console.error("chrome did not start"); process.exit(1); }
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0; const pend = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
  // surface page errors (a script that fails to load would otherwise just look like a page that never gets ready)
  if (m.method === "Runtime.exceptionThrown") { const d = m.params.exceptionDetails; console.error("page exception:", d.exception?.description || d.text, `(${d.url || ""}:${d.lineNumber})`); }
});
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pend.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluate = async (expression) => { const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }); return r.result?.result?.value; };
await send("Emulation.setDeviceMetricsOverride", { width: 1920, height: 1080, deviceScaleFactor: 1, mobile: false });
await send("Runtime.enable");

const t0 = Date.now();
for (let i = 0; ; i++) {
  const st = await evaluate("window.__error || (window.__ready ? 'ready' : document.title)");
  if (st === "ready") break;
  if (st && String(st).startsWith("ERR") || (st && String(st).includes("Error"))) { console.error("page error:", st); await finish(1); }
  if (i > 900) { console.error("timeout waiting for page"); await finish(1); }
  await sleep(200);
}
console.error(`page ready in ${Date.now() - t0} ms`, JSON.stringify(await evaluate("window.__info && window.__info()")));

async function shot(t, file) {
  await evaluate(`window.__seek(${t})`);
  const s = await send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true });
  fs.writeFileSync(file, Buffer.from(s.result.data, "base64"));
}
// shut down; Chrome keeps files open in its temporary profile until it has exited, so wait for that before deleting it
async function finish(code = 0) {
  try { ws.close(); } catch {}
  chrome.kill(); server.close();
  await new Promise((r) => { if (chrome.exitCode !== null) return r(); chrome.once("exit", r); setTimeout(r, 5000); });
  for (let i = 0; i < 10; i++) { try { fs.rmSync(prof, { recursive: true, force: true }); break; } catch { await sleep(300); } }
  process.exit(code);
}

if (mode === "cues") {
  fs.writeFileSync(path.resolve(String(args.out)), JSON.stringify(await evaluate("window.__cues()"), null, 1));
  console.error("cues written"); await finish(0);
}
if (mode === "stills") {
  const times = String(args.times).split(",").map(Number);
  const s0 = Date.now();
  for (const t of times) await shot(t, path.join(out, `s_${String(Math.round(t * 100)).padStart(5, "0")}.png`));
  console.error(`${times.length} stills in ${Date.now() - s0} ms`); await finish(0);
}
if (mode === "frames") {
  const sub = +(args.sub || 4), shutter = +(args.shutter || 0.5), step = +(args.step || 1), offset = +(args.offset || 0);
  const subfast = +(args.subfast || sub), from = +(args.from || 0), to = +(args.to || 45 * FPS);
  const skipDir = args.skipdir ? path.resolve(String(args.skipdir)) : null;   // resume: frames already merged there are skipped
  // --list=a-b,c-d : only these frame ranges (inclusive)
  const list = args.list ? String(args.list).split(",").map((r) => r.split("-").map(Number)) : null;
  const inList = (f) => !list || list.some(([a, b]) => f >= a && f <= (b === undefined ? a : b));
  // the film's fast-motion windows [t0, t1, samples?] get --subfast (or their own count) sub-frames instead of --sub
  const fast = subfast > sub ? (await evaluate("window.__fast ? window.__fast() : []")) || [] : [];
  const subAt = (f) => { let n = sub; for (const [a, b, k] of fast) if (f / FPS >= a && f / FPS <= b) n = Math.max(n, k || subfast); return n; };
  let n = 0; const s0 = Date.now();
  for (let f = from; f < to; f++) {
    if (f % step !== offset || !inList(f)) continue;
    const name = path.join(out, `f${String(f).padStart(5, "0")}`);
    if (fs.existsSync(name + ".done")) continue;
    if (skipDir && fs.existsSync(path.join(skipDir, `frame_${String(f).padStart(5, "0")}.png`))) continue;
    const k = subAt(f);
    for (let j = 0; j < k; j++) {
      // sub-frames centred on the frame time across `shutter` of the frame interval (180° shutter by default)
      const t = (f + (k > 1 ? (j / (k - 1) - 0.5) * shutter : 0)) / FPS;
      await shot(Math.max(0, t), `${name}_s${j}.png`);
    }
    fs.writeFileSync(name + ".done", String(k));   // the merger reads the sample count from here
    n++;
    if (n % 20 === 0) console.error(`worker ${offset}: ${n} frames, ${((Date.now() - s0) / n / 1000).toFixed(2)} s/frame`);
  }
  console.error(`worker ${offset} done: ${n} frames in ${((Date.now() - s0) / 1000).toFixed(0)} s`); await finish(0);
}
console.error("unknown mode"); await finish(1);
