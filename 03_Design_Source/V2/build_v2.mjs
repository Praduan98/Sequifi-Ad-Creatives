// Sequifi Static Ads V2: export every ad in ./ads to a 1080 x 1350 PNG.
//   node build_v2.mjs              export all 20
//   node build_v2.mjs --only=A01   one ad (or a comma list: --only=A01,A06)
//   node build_v2.mjs --qa         also check the on-creative copy against copy_v2.json
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../..");
const ADS = path.join(HERE, "ads");
const OUT = path.join(ROOT, "04_Final_Exports", "V2");
const CHROME = process.env.CHROME || {
  win32: path.join(process.env.PROGRAMFILES || "C:\\Program Files", "Google/Chrome/Application/chrome.exe"),
  linux: "/usr/bin/google-chrome",
}[process.platform] || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const only = args.only ? String(args.only).split(",") : null;
const files = fs.readdirSync(ADS).filter((f) => f.endsWith(".html") && (!only || only.some((o) => f.startsWith(o)))).sort();
fs.mkdirSync(OUT, { recursive: true });

const chrome = (extra, url, onOut) => new Promise((res) => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sqf2-"));
  const p = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
    "--force-device-scale-factor=1", "--window-size=1080,1350", "--virtual-time-budget=6000", `--user-data-dir=${profile}`, ...extra, url],
    { stdio: ["ignore", onOut ? "pipe" : "ignore", "ignore"] });
  if (onOut) p.stdout.on("data", onOut);
  const t = setTimeout(() => p.kill("SIGKILL"), 90000);
  p.on("exit", (code) => { clearTimeout(t); fs.rmSync(profile, { recursive: true, force: true }); res(code); });
});

// Exports are grouped by funnel stage, matching the shared Drive (BOFU / Brand Awareness / MOFU / TOFU).
// Stage follows what each creative does:
//   Brand Awareness = pure big-type statements; TOFU = problem hooks (polls, notes, whiteboard);
//   MOFU = pain proof (chats, spreadsheets); BOFU = product proof + re-engage (statements, email).
const FUNNEL = {
  A10: "Brand Awareness", A16: "Brand Awareness", A20: "Brand Awareness",
  A04: "TOFU", A05: "TOFU", A08: "TOFU", A09: "TOFU", A12: "TOFU", A15: "TOFU", A18: "TOFU",
  A01: "BOFU", A02: "BOFU", A06: "MOFU", A07: "MOFU", A11: "MOFU", A13: "MOFU", A17: "MOFU",
  A03: "BOFU", A14: "BOFU", A19: "BOFU",
};
// Inside each funnel folder: one subfolder per industry, named like the Drive's "BOFU | Mortgage | v1"
// ("|" and "/" are not allowed in Windows names, so " - " and "&").
const INDUSTRY = {
  A01: "Mortgage", A14: "Mortgage", A15: "Mortgage", A16: "Mortgage",
  A03: "Roofing", A06: "Roofing", A07: "Roofing", A08: "Roofing", A09: "Roofing", A10: "Roofing",
  A11: "Solar", A12: "Solar", A13: "Solar",
  A02: "Fiber & Telecom", A17: "Fiber & Telecom", A18: "Fiber & Telecom",
  A04: "Remodeling", A05: "Trades",
  A19: "All Verticals", A20: "All Verticals",
};
const folderFor = (id) => FUNNEL[id] ? path.join(FUNNEL[id], `${FUNNEL[id]} - ${INDUSTRY[id]} - v2`) : "_Unassigned";
// File names follow the brief's "Ad set name" column, plus the ad ID because several ads share an ad set.
// "|" is not allowed in Windows file names, so it becomes " - ".
const ADSET = {
  A01: "BOFU - Mortgage", A02: "BOFU - Fiber", A03: "BOFU - Roofing",
  A04: "Remodeling | Adv+", A05: "Trades | Adv+",
  A06: "Roofing | Core ICP Adv+", A07: "Roofing | Core ICP Adv+", A08: "Roofing | Core ICP Adv+", A09: "Roofing | Core ICP Adv+",
  A11: "Solar | March Revival", A14: "Mortgage | March Revival", A16: "Mortgage | March Revival",
  A17: "Fiber | Core ICP Adv+", A18: "Fiber | Core ICP Adv+",
  A10: "Test | Roofing", A15: "Test | Mortgage", A12: "Test | Solar", A13: "Test | Solar",
  A20: "Video Only | LAL 1-3%", A19: "Win-back | Intent + stalled",
};
const safe = (s) => s.replace(/\s*\|\s*/g, " - ").replace(/[<>:"/\\?*]/g, "").replace(/\s+/g, " ").trim();
const pngName = (f) => { const id = f.slice(0, 3); return ADSET[id] ? `${safe(ADSET[id])} - ${id}.png` : `Sequifi_${f.replace(/\.html$/, "")}_1080x1350.png`; };
const queue = [...files];
let n = 0;
await Promise.all(Array.from({ length: 4 }, async () => {
  while (queue.length) {
    const f = queue.shift();
    const dir = path.join(OUT, folderFor(f.slice(0, 3)));
    fs.mkdirSync(dir, { recursive: true });
    const png = path.join(dir, pngName(f));
    await chrome([`--screenshot=${png}`], pathToFileURL(path.join(ADS, f)).href);
    if (!fs.existsSync(png)) console.log(`  FAILED ${f}`); else n++;
  }
}));
console.log(`exported ${n}/${files.length} -> ${path.relative(ROOT, OUT)}`);

if (args.qa) {
  // Copy QA: every exact string from the brief must appear in the rendered text of its ad.
  const COPY = JSON.parse(fs.readFileSync(path.join(HERE, "copy_v2.json"), "utf8"));
  const norm = (s) => s.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"').replace(/\s+/g, " ").trim();
  let bad = 0;
  for (const f of files) {
    const id = f.slice(0, 3), want = COPY[id];
    if (!want) { console.log(`  ${id}: no copy entry`); bad++; continue; }
    let dom = "";
    await chrome(["--dump-dom"], pathToFileURL(path.join(ADS, f)).href, (b) => (dom += b));
    const m = dom.match(/<body[^>]*>([\s\S]*)<\/body>/);
    const text = norm((m ? m[1] : dom).replace(/<style[\s\S]*?<\/style>/g, " ").replace(/<br\s*\/?>/g, " ").replace(/<[^>]+>/g, "")
      .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&nbsp;/g, " "));
    const missing = want.filter((s) => !text.includes(norm(s)));
    if (missing.length) { bad++; console.log(`  ${id}: missing ${missing.map((s) => JSON.stringify(s)).join(", ")}`); }
  }
  console.log(bad ? `copy QA: ${bad} ad(s) with problems` : `copy QA: all ${files.length} ads carry the exact brief copy`);
}
