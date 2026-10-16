// Sequifi carousel builder.
//   node build.mjs                      build HTML + export every card
//   node build.mjs --only=MOFU          only one funnel
//   node build.mjs --only=TOFU/Solar    only one carousel
//   node build.mjs --no-export          HTML only (no PNGs)
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const SRC = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SRC, "..");
const ASSETS = path.join(ROOT, "02_Brand_Assets");
const EXPORTS = path.join(ROOT, "04_Final_Exports");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const args = Object.fromEntries(process.argv.slice(2).map((a) => a.replace(/^--/, "").split("=")).map(([k, v]) => [k, v ?? true]));
const IND = JSON.parse(fs.readFileSync(path.join(SRC, "data/industries.json"), "utf8"));
const CAR = JSON.parse(fs.readFileSync(path.join(SRC, "data/carousels.json"), "utf8"));
const PHOTOS = fs.existsSync(path.join(SRC, "data/photos.json")) ? JSON.parse(fs.readFileSync(path.join(SRC, "data/photos.json"), "utf8")) : {};
const SHEET = JSON.parse(fs.readFileSync(path.join(ROOT, "01_Brief/campaign_copy_from_sheet.json"), "utf8"));
const SHEET_IND = { Mortgage: "Mortgage", Roofing: "Roofing", Fiber: "Fiber / Telecom", Solar: "Solar" };

// ---------- helpers ----------
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const sentence = (s) => (s.charAt(0) + s.slice(1).toLowerCase()).replace(/\bsequifi\b/g, "Sequifi"); // keep the brand name capitalised
const headline = (c) => {
  const h = esc(c.heading), a = esc(c.accent), i = h.lastIndexOf(a);
  const out = i < 0 ? h : `${h.slice(0, i)}<span class="acc">${a}</span>${h.slice(i + a.length)}`;
  return c.br ? out.replace(`${esc(c.br)} `, `${esc(c.br)}<br>`) : out; // c.br: words that end line 1 (layout only, the copy is unchanged)
};

const I = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  house: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
  roof: '<path d="M2 12.5 12 4l10 8.5"/><path d="M5 10.2V20h14v-9.8"/><path d="M16.5 7V4.5h2.5v4.6"/><path d="M8 20v-5h8v5"/>',
  wifi: '<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><circle cx="12" cy="20" r="1"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>',
  user: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/>',
  trend: '<path d="m22 7-8.5 8.5-5-5L2 17"/><path d="M16 7h6v6"/>',
  cash: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
  grid: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  file: '<path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M16 13H8M16 17H8M10 9H8"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  mic: '<rect x="9" y="2.5" width="6" height="11.5" rx="3"/><path d="M5.5 10.5a6.5 6.5 0 0 0 13 0"/><path d="M12 17v4"/>',
  video: '<path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2.5"/>',
  chevL: '<path d="m15 18-6-6 6-6"/>',
  chevR: '<path d="m9 18 6-6-6-6"/>',
  share: '<rect x="2" y="3.5" width="20" height="13.5" rx="2.5"/><path d="M8 21h8M12 17v4"/><path d="m8.8 10.2 3.2-3.2 3.2 3.2M12 7v6.5"/>',
};
const icon = (n, sw = 2) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${I[n]}</svg>`;
const checkbox = '<svg class="cb" viewBox="0 0 40 40"><rect x="4" y="5" width="31" height="31" rx="9" fill="none" stroke="currentColor" stroke-width="3.2"/><path d="M11.5 21l6 6L31 12" fill="none" stroke="#2BB594" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const AV = ["#6078EC", "#2BB594", "#0D1020", "#C2410C", "#7C3AED", "#0E7490"];
const chipFor = (s) => `<span class="chip ${/approv/i.test(s) ? "ok" : /paid/i.test(s) ? "paid" : "wait"}">${esc(s)}</span>`;

// ---------- building blocks ----------
const rel = { styles: "../../../styles", assets: "../../../../02_Brand_Assets" };
// logo variants: dark text (light cards), white text (navy cards), all-white one-colour (full-bleed photos, as in the client's photo ads)
const logo = (v) => `<img class="logo" src="${rel.assets}/logo/sequifi-logo-${v}.svg" alt="Sequifi">`;
const shell = (mode, d) => `<div class="topbar"></div>${logo(mode === "light" ? "dark-text" : mode === "hero" || mode === "brand" ? "mono-white" : "white-text")}<div class="pill"><span>${d.pill}</span></div>`;
function photo(ind, slot, cls = "ph", style = "") {
  const p = PHOTOS[ind]?.[slot];
  const file = p && path.join(ASSETS, "photos", ind, p.file);
  if (p && fs.existsSync(file))
    return `<img class="${cls}" src="${rel.assets}/photos/${ind}/${esc(p.file)}" style="object-position:${p.pos || "50% 50%"};${p.zoom ? `transform:scale(${p.zoom});transform-origin:${p.origin || p.pos};` : ""}${style}" alt="">`;
  return `<div class="${cls} missing" style="${style}"></div>${cls === "ph" ? `<div class="ph-label">${ind} · ${slot}</div>` : ""}`;
}
const swipe = () => `<div class="swipe">${icon("arrow", 2.4)}</div>`;
const cta = (label, style = "") => `<div class="cta" style="${style}"><i class="anchor" id="ctaB" style="left:50%;bottom:-2px"></i>${esc(label)}${icon("arrow", 2.6)}</div>`;
// Continuous line across the 5 MOFU cards (i = card index, mode = start | through | end); drawn by draw.js
const rail = (i, mode, target) => `<div class="rail" data-i="${i}" data-mode="${mode}" data-target="${target}"></div>`;
const titleBlock = (c, style, opts = {}) => `
  <div class="hl" style="${style}">
    ${opts.before || ""}
    <h1 class="h" style="${opts.size ? `font-size:${opts.size}px` : ""}">${headline(c)}</h1>
    ${opts.sub ? `<p class="sub" style="${opts.subStyle || ""}">${esc(opts.sub)}</p>` : ""}
  </div>`;

function sheet(d, note, style) {
  const s = d.sheet, n = s.cols.length;
  const cell = (v) => v === "#REF!" ? `<td class="err"><span${note ? ' id="err" data-circle="#D4243C"' : ""}>#REF!</span></td>` : `<td>${esc(v)}</td>`;
  return `
  <div class="sheet ui" style="${style}">
    <div class="bar"><span class="xl">X</span>${esc(s.file)}</div>
    <table><tr>${s.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>
      ${s.rows.map((r) => `<tr>${r.map(cell).join("")}</tr>`).join("")}
      ${note ? `<tr class="blank"><td colspan="${n - 1}"><span class="note red" data-arrow="#err" data-from="right" data-to="bottom" data-gap="22" data-bend="0.28">${esc(note)}</span></td><td></td></tr>` : ""}
    </table>
    <div class="tabs"><span>Q3 final</span><span>Q3 final v2</span><span class="on">Copy of Q3 final v2 (3)</span></div>
  </div>`;
}
function runPanel(d, style) {
  const x = d.dash;
  return `
  <div class="run ui" style="${style}">
    <div class="hd"><img src="${rel.assets}/logo/sequifi-app-icon.svg" alt=""><b>${esc(x.title)}</b></div>
    ${x.rows.slice(0, 4).map((r, i) => `<div class="rw"><span class="av" style="background:${AV[i]}">${esc(r[0].split(" ").map((w) => w[0]).join("").replace(".", ""))}</span><b>${esc(r[0])}</b><span class="v">${esc(r[r.length - 2])}</span><i>${icon("check", 3.2)}</i></div>`).join("")}
    <div class="pg"><b></b></div>
  </div>`;
}
function statement(d, style) {
  const s = d.statement;
  return `
  <div class="stmt ui" style="${style}">
    <div class="top"><div class="ico a">${icon(d.icon)}</div><div><div class="t1">${esc(s.title)}</div><div class="t2">${esc(s.meta)}</div></div>${chipFor("Approved")}</div>
    <div class="rows">${s.lines.map(([k, v]) => `<div class="row"><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}</div>
    <div class="tot" id="tot"><span class="lbl">${esc(s.totalLabel)}</span><span class="v">${esc(s.total)}</span></div>
  </div>`;
}
function phone(d, style) {
  const p = d.phone, icons = ["cash", "trend", "file"], cls = ["a", "g", "k"];
  return `
  <div class="phone" id="phone" style="${style}"><i class="anchor" id="phoneL" style="left:-2px;top:75%"></i><i class="anchor" id="phoneB" style="left:50%;bottom:0"></i><div class="scr"><div class="island"></div>
    <div class="sb"><span>9:41</span><i><b></b><b></b></i></div>
    <div class="in">
      <div class="hd"><h4>Earnings</h4><div class="av">${esc(d.fanout.rows[0][0])}</div></div>
      <div class="seg"><span class="on">Pending Pay</span><span>Paystubs</span></div>
      <div class="tot"><div class="lbl">Total anticipated pay</div><div class="amt">${esc(p.total)}<small>${esc(p.cents)}</small></div><div class="bar"><b></b></div></div>
      <div class="list">${p.items.map(([t, m, v, st], i) => `<div class="it"><div class="ico ${cls[i]}">${icon(icons[i])}</div><div class="m"><b>${esc(t)}</b><span>${esc(m)}</span></div><div class="r"><b>${esc(v)}</b>${chipFor(st)}</div></div>`).join("")}</div>
    </div>
    <div class="nav"><span class="on">${icon("cash")}</span><span>${icon("trend")}</span><span class="plus">${icon("plus", 2.6)}</span><span>${icon("file")}</span><span>${icon("users")}</span></div>
  </div></div>`;
}
function fanout(d, ind) {
  const f = d.fanout;
  return `
  <div class="fan" data-fan style="position:absolute;inset:0">
    <div class="deal pic"><i class="anchor" id="dealB" style="left:50%;bottom:-2px"></i><div class="dp">${photo(ind, "M1", "", "")}<span class="chip ok">${esc(f.status)}</span></div>
      <div class="db"><div class="t1">${esc(f.title)}</div><div class="t2">${esc(f.amount)}</div></div></div>
    <div class="node"><img src="${rel.assets}/logo/sequifi-app-icon.svg" alt=""></div>
    <div class="payees ui"><i class="anchor" id="railT" style="left:50%;bottom:-2px"></i>${f.rows.map(([ini, role, how, v], i) => `
      <div class="payee"><div class="av" style="background:${AV[i]}">${esc(ini)}</div><div class="m"><b>${esc(role)}</b><span>${esc(how)}</span></div><div class="v">${esc(v)}</div></div>`).join("")}</div>
  </div>`;
}
function pipeline(d, style) {
  const p = d.pipeline, cols = [["Calculated", "a", p.calculated], ["Approved", "g", p.approved], ["Paid", "k", p.paid]];
  let n = 0;
  return `
  <div class="pipe ui" style="${style}"><i class="anchor" id="railT" style="left:86%;bottom:-2px"></i>
    <div class="hd"><img src="${rel.assets}/logo/sequifi-app-icon.svg" alt=""><b>${esc(d.dash.title)}</b></div>
    <div class="cols">${cols.map(([label, cls, items], ci) => `
      <div class="pc"><div class="ph2"><i class="${cls}"></i>${label}<span>${items.length}</span></div>
        ${items.map(([id, who, amt]) => `<div class="pk${ci === 1 && n++ === 0 ? " hot" : ""}"><b>${esc(id)}</b><span class="who"><span class="av" style="background:${AV[(n + ci) % AV.length]}">${esc(who.split(" ").map((w) => w[0]).join("").replace(".", ""))}</span>${esc(who)}</span><span class="v">${esc(amt)}</span></div>`).join("")}
      </div>`).join(`<div class="arr">${icon("arrow", 2.4)}</div>`)}</div>
  </div>`;
}
const money = (v) => +String(v).replace(/[^0-9.]/g, "");
const topEarner = (x) => x.rows.reduce((b, r, i) => (money(r[r.length - 2]) > money(x.rows[b][x.rows[b].length - 2]) ? i : b), 0);
function dashboard(d, style) {
  const x = d.dash, hl = topEarner(x);
  return `
  <div class="dash" style="${style}"><i class="anchor" id="railT" style="left:78%;bottom:-2px"></i>
    <div class="side"><img src="${rel.assets}/logo/sequifi-app-icon.svg" alt=""><span class="on">${icon("cash")}</span>${icon("grid")}${icon("users")}${icon("file")}${icon("gear")}</div>
    <div class="main">
      <div class="head"><h4>${esc(x.title)}</h4></div>
      <div class="stat"><div><span class="lbl">Total payout</span><b>${esc(x.total)}</b></div></div>
      <table><tr>${x.cols.map((c) => `<th>${esc(c)}</th>`).join("")}</tr>${x.rows.map((r, ri) => `<tr${ri === hl ? ' class="top"' : ""}>${r.map((v, ci) =>
        ci === 0 ? `<td class="name"><span class="av" style="background:${AV[ri]}">${esc(v.split(" ").map((w) => w[0]).join("").replace(".", ""))}</span>${esc(v)}</td>`
        : ci === r.length - 1 ? `<td>${chipFor(v)}</td>`
        : ci === r.length - 2 ? `<td class="money"${ri === x.rows.length - 1 ? ' id="dmoney"' : ""}>${esc(v)}</td>` : `<td>${esc(v)}</td>`).join("")}</tr>`).join("")}</table>
    </div>
  </div>`;
}
function profileCard(d, ind, style) {
  const x = d.dash, r = x.rows[topEarner(x)];
  return `
  <div class="pf" style="${style}"><div class="face">${photo(ind, "M3", "", "")}</div>
    <div class="m"><b>${esc(r[0])}</b><span>${esc(x.profile)}</span></div>
    <div class="r"><div class="v">${esc(r[r.length - 2])}</div>${chipFor(r[r.length - 1])}</div></div>`;
}
// TOFU "Frame & Proof": the photo sits in a large rounded frame (true colour), echoed by an offset outline
const framed = (ind, slot, [l, t, w, h], [gx, gy] = [22, 22]) => `
    <div class="ghost" style="left:${l + gx}px;top:${t + gy}px;width:${w}px;height:${h}px"></div>
    <div class="frame" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px">${photo(ind, slot, "", "")}</div>`;
// Headline size steps with length, so no TOFU headline breaks into three lines
const hs = (c) => (c.heading.length > 22 ? 88 : c.heading.length > 16 ? 96 : 104);
// BOFU banner 1: the demo as a video call. The Sequifi screen is shared with the prospect's own industry data,
// a host tile sits on the corner, call controls underneath, the cursor is on the top earner
const CURSOR = '<svg class="cursor" viewBox="0 0 24 24"><path d="M4.5 2.8v17.4l4.7-4.4 3.1 6.7 3.2-1.5-3.1-6.6h6.4z" fill="#0D1020" stroke="#fff" stroke-width="1.7" stroke-linejoin="round"/></svg>';
function demoCall(d, style) {
  const x = d.dash, rows = x.rows.slice(0, 3), hl = topEarner({ rows });
  const ini = (n) => esc(n.split(" ").map((w) => w[0]).join("").replace(".", ""));
  return `
  <div class="call" style="${style}">
    <div class="win ui">
      <div class="chrome"><i></i><i></i><i></i></div>
      <div class="app">
        <div class="side"><img src="${rel.assets}/logo/sequifi-app-icon.svg" alt=""><span class="on">${icon("cash")}</span>${icon("users")}${icon("file")}</div>
        <div class="main">
          <h4>${esc(x.title)}</h4>
          <div class="stat"><span class="lbl">Total payout</span><b>${esc(x.total)}</b></div>
          ${rows.map((r, i) => `<div class="rw${i === hl ? " top" : ""}"><span class="av" style="background:${AV[i]}">${ini(r[0])}</span><b>${esc(r[0])}</b><span class="v">${esc(r[r.length - 2])}</span>${chipFor(r[r.length - 1])}${i === hl ? `<span class="click"></span>${CURSOR}` : ""}</div>`).join("")}
        </div>
      </div>
    </div>
    <div class="host">${photo("Shared", "HOST", "", "")}<span class="eq"><b></b><b></b><b></b></span></div>
    <div class="ctrl"><span>${icon("mic")}</span><span>${icon("video")}</span><span class="on">${icon("share")}</span></div>
  </div>`;
}
// BOFU banner 2: "clearer". The scene sits behind frosted glass except one clear pane, where the subject is sharp.
// The photo is placed at its natural aspect, dropped by the pick's dy so the head has room under the logo.
function lens(ind, slot, [l, t, w, h]) {
  const p = PHOTOS[ind]?.[slot];
  if (!p) return photo(ind, slot);
  const img = (cls) => `<img class="${cls}" src="${rel.assets}/photos/${ind}/${esc(p.file)}" style="top:${p.dy || 0}px" alt="">`;
  return `
    <div class="frost">${img("fz")}</div><div class="shade frosted"></div>
    <div class="clear" style="clip-path:inset(${t}px ${1080 - l - w}px ${1350 - t - h}px ${l}px round 40px)">${img("cz")}</div>
    <div class="pane" style="left:${l}px;top:${t}px;width:${w}px;height:${h}px"></div>`;
}
// ---------- BOFU per-industry concepts: each industry gets its own idea, drawn from how that trade works ----------
// Generated BOFU photos are 1024 wide and placed at natural aspect across the card; at() maps photo px → card px
const K = 1080 / 1024;
const at = (x, y, off = 0) => [Math.round(x * K), Math.round(y * K - off)];
const nat = (ind, slot, off = 0, style = "") => {
  const p = PHOTOS[ind]?.[slot];
  return p ? `<img class="nat" src="${rel.assets}/photos/${ind}/${esc(p.file)}" style="top:${-off}px;${style}" alt="">` : photo(ind, slot);
};
// Roofing banner 2: the storm side keeps the old spreadsheet (with its broken cell), the clear side the Sequifi payout
function errSheet(d, style) {
  const sh = d.sheet, ci = [0, 1, sh.cols.length - 1], rows = sh.rows.slice(-2);
  return `
  <div class="sheet mini ui" data-float style="${style}"><div class="bar"><span class="xl">X</span>${esc(sh.file)}</div>
    <table><tr>${ci.map((i) => `<th>${esc(sh.cols[i])}</th>`).join("")}</tr>
      ${rows.map((r) => `<tr>${ci.map((i) => r[i] === "#REF!" ? `<td class="err"><span class="ring">#REF!</span></td>` : `<td>${esc(r[i])}</td>`).join("")}</tr>`).join("")}</table></div>`;
}
function paidCard(d, style) {
  const s = d.statement;
  return `
  <div class="payout ui" data-float style="${style}"><div class="top"><img src="${rel.assets}/logo/sequifi-app-icon.svg" alt=""><div><div class="t1">${esc(s.title)}</div><div class="t2">${esc(s.meta)}</div></div></div>
    <div class="bot"><div><span class="lbl">${esc(s.totalLabel)}</span><b>${esc(s.total)}</b></div>${chipFor("Approved")}</div></div>`;
}
// Fiber banner 1: the fiber route runs down the street; every activated home it reaches shows its commission
function fiberRoute(d, homes, line, card) {
  const [a, m] = line, foot = ([x, y]) => { const t = (y + m * (a - x)) / (1 + m * m); return [a - m * t, t]; }; // nearest point on x = a - m·y
  const act = d.statement.lines[0][1], [n, when, v, st] = d.phone.items[0];
  const y0 = 1400, y1 = -40, road = `M${a - m * y0},${y0} L${a - m * y1},${y1}`;
  return `
  <svg class="route" viewBox="0 0 1080 1350"><defs><linearGradient id="rf" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="1350"><stop offset=".28" stop-color="#fff" stop-opacity="0"/><stop offset=".33" stop-color="#fff"/><stop offset=".83" stop-color="#fff"/><stop offset=".9" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="rm" maskUnits="userSpaceOnUse" x="0" y="0" width="1080" height="1350"><rect width="1080" height="1350" fill="url(#rf)"/></mask></defs><g mask="url(#rm)">
    <path d="${road}" stroke="rgba(143,160,245,.28)" stroke-width="16"/><path d="${road}" stroke="rgba(143,160,245,.55)" stroke-width="7"/><path d="${road}" stroke="#DCE2FF" stroke-width="2.6"/></g>
    ${homes.map(([x, y]) => { const [fx, fy] = foot([x, y]); return `<path d="M${fx},${fy} L${x},${y}" stroke="#A9B6FA" stroke-width="2.4" stroke-dasharray="2 7"/><circle cx="${fx}" cy="${fy}" r="5" fill="#DCE2FF"/>`; }).join("")}
  </svg>
  ${homes.map(([x, y, side]) => `<div class="pin" style="left:${x}px;top:${y}px"><i></i><span class="amt ${side}">${icon("check", 3.2)}${esc(act.replace(/\.00$/, ""))}</span></div>`).join("")}
  <div class="tally ui" data-float style="${card}"><img src="${rel.assets}/logo/sequifi-app-icon.svg" alt=""><div class="m"><b>${esc(n)}</b><span>${esc(when)}</span></div><div class="r"><b>${esc(v)}</b>${chipFor(st)}</div></div>`;
}
// Fiber banner 2: each colour-coded strand carries one line of the commission; the cable is the install
function strands(d, tips, colX) {
  const s = d.statement;
  return `
  <svg class="leads" viewBox="0 0 1080 1350">${tips.map(([x, y, c]) => `<path d="M${x + 10},${y} L${colX - 12},${y}" stroke="${c}" stroke-opacity=".7" stroke-width="2" stroke-dasharray="1 6" stroke-linecap="round"/>`).join("")}</svg>
  ${s.lines.map(([k, v], i) => `<div class="strand ui" data-float style="left:${colX}px;top:${tips[i][1]}px"><i style="background:${tips[i][2]}"></i><span>${esc(k)}</span><b>${esc(v)}</b></div>`).join("")}
  <div class="strand-tot ui" style="left:${colX}px;top:${tips[3][1] + 74}px"><span class="lbl">${esc(s.totalLabel)}</span><b>${esc(s.total)}</b></div>`;
}
// Solar banner 1: the rep's own phone at the array; the live app sits in the real screen, a payout notification pops out
function notif(d, style) {
  const [t, m, v, st] = d.phone.items[0];
  return `<div class="notif ui" data-float style="${style}"><img src="${rel.assets}/logo/sequifi-app-icon.svg" alt=""><div class="m"><b>${esc(t)}</b><span>${esc(m)}</span></div><div class="r"><b>${esc(v)}</b>${chipFor(st)}</div></div>`;
}
// Solar banner 2: the sun's path is the payout timeline: deal on the roof, paid at M1, due at M2, complete at the sun
function sunArc(d, P) {
  const B = (t) => [0, 1].map((k) => (1 - t) ** 3 * P[0][k] + 3 * (1 - t) ** 2 * t * P[1][k] + 3 * (1 - t) * t * t * P[2][k] + t ** 3 * P[3][k]);
  const split = (t) => { // de Casteljau: control points of [0,t] and [t,1]
    const L = (a, b) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    const a = L(P[0], P[1]), b = L(P[1], P[2]), c = L(P[2], P[3]), e = L(a, b), f = L(b, c), g = L(e, f);
    return [[P[0], a, e, g], [g, f, c, P[3]]];
  };
  const pth = (q) => `M${q[0]} C${q[1]} ${q[2]} ${q[3]}`, tM1 = 0.4, tM2 = 0.76, [done, todo] = split(tM1);
  const s = d.statement, [deal, kw] = [s.title, s.meta], m1 = s.lines[2], m2 = s.lines[3];
  const node = (t, cls) => { const [x, y] = B(t); return `<i class="node ${cls}" style="left:${x}px;top:${y}px"></i>`; };
  const [x0, y0] = B(0), [x1, y1] = B(tM1), [x2, y2] = B(tM2), [x3, y3] = B(1);
  const sunRing = `<i class="node sun" style="left:${x3}px;top:${y3}px"></i>`;
  return `
  <svg class="arcs" viewBox="0 0 1080 1350"><defs><linearGradient id="arcg" x1="0" x2="1"><stop offset="0" stop-color="#FFFFFF"/><stop offset="1" stop-color="#FFE3A6"/></linearGradient></defs>
    <path d="${pth(done)}" stroke="url(#arcg)" stroke-width="4" stroke-linecap="round"/>
    <path d="${pth(todo)}" stroke="#FFE7B8" stroke-opacity=".9" stroke-width="3" stroke-dasharray="2 11" stroke-linecap="round"/></svg>
  ${node(0, "start")}${node(tM1, "paid")}${node(tM2, "due")}${sunRing}
  <div class="ms ui left" data-float style="right:${1080 - x0 + 26}px;top:${y0}px"><b>${esc(deal)}</b><span class="k">${esc(kw)}</span></div>
  <div class="ms ui up" data-float style="left:${x1}px;top:${y1 - 26}px"><span class="k">${esc(m1[0])}</span><b>${esc(m1[1])}</b>${chipFor("Paid")}</div>
  <div class="ms ui up" data-float style="left:${x2}px;top:${y2 - 26}px"><span class="k">${esc(m2[0])}</span><b>${esc(m2[1])}</b>${chipFor("Pending")}</div>
  <div class="ms ui tot" data-float style="right:var(--m);bottom:66px"><span class="lbl">${esc(s.totalLabel)}</span><b>${esc(s.total)}</b></div>`;
}
const inset = (ind, slot, style) => `<div class="inset" style="${style}">${photo(ind, slot, "", "width:100%;height:100%;object-fit:cover")}</div>`;

// ---------- layouts ----------
const L = {
  // ---------- TOFU: "Frame & Proof" — framed true-colour photo, product proof breaking out of the frame,
  // frame position changes card to card (top, right, left), card 5 opens into a full-bleed hero ----------
  t1_problem: (c, d, ind) => ["dark night", `
    ${shell("dark", d)}
    ${titleBlock(c, "top:150px", { size: hs(c) })}
    ${framed(ind, "T1", [66, 400, 948, 600])}
    ${sheet(d, sentence(c.text), "left:92px;top:800px;width:900px;transform:rotate(-2.5deg) scale(.78);transform-origin:0 0")}
    ${swipe()}`],
  t2_automation: (c, d, ind) => ["dark night", `
    ${shell("dark", d)}
    ${framed(ind, "T2", [66, 136, 948, 860])}
    ${runPanel(d, "right:40px;top:262px;transform:rotate(2.5deg)")}
    <div class="note white" style="left:100px;top:908px">${checkbox}${esc(sentence(c.text))}</div>
    ${titleBlock(c, "bottom:66px;right:180px", { size: hs(c) })}
    ${swipe()}`],
  t3_statement: (c, d, ind) => ["dark night", `
    ${shell("dark", d)}
    ${framed(ind, "T3", [380, 136, 634, 830], [-22, 22])}
    ${statement(d, "left:var(--m);top:300px;transform:rotate(-2deg)")}
    <div class="note white" style="left:var(--m);top:850px" data-arrow="#tot .v" data-from="topright" data-to="bottom" data-gap="18" data-bend="-0.2">${esc(sentence(c.text))}</div>
    ${titleBlock(c, "bottom:66px;right:180px", { size: hs(c) })}
    ${swipe()}`],
  t4_phone: (c, d, ind) => ["dark night", `
    ${shell("dark", d)}
    ${framed(ind, "T4", [66, 136, 600, 850])}
    ${phone(d, "right:70px;top:176px;transform:rotate(4deg) scale(.9);transform-origin:100% 0")}
    <div class="note white" style="left:100px;top:880px" data-arrow="#phoneL" data-from="right" data-to="center" data-gap="18" data-bend="-0.16">${esc(sentence(c.text))}</div>
    ${titleBlock(c, "bottom:66px;right:180px", { size: hs(c) })}
    ${swipe()}`],
  t5_cta: (c, d, ind, s) => ["dark night hero", `
    ${photo(ind, "T5")}<div class="shade hero"></div><div class="keyline"></div>${shell("hero", d)}
    ${titleBlock(c, "bottom:206px", { size: 128, sub: sentence(c.text) + "." })}
    ${cta(s.cta_button)}`],

  // ---------- BOFU: full-bleed golden-hour photo (as in the client's own hero ads), one product moment per banner,
  // a glowing periwinkle CTA for the decisive step ----------
  b1_demo: (c, d, ind, s) => ["dark night hero bofu", `
    ${photo(ind, "B1")}<div class="shade hero"></div>${shell("hero", d)}
    ${demoCall(d, "right:92px;top:258px;transform:rotate(2deg)")}
    ${titleBlock(c, "bottom:206px", { size: 112, sub: sentence(c.text) + "." })}
    ${cta(s.cta_button)}`],
  b2_clarity: (c, d, ind, s) => ["dark night hero bofu", `
    ${lens(ind, "B2", [66, 120, 650, 710])}${shell("hero", d)}
    ${statement(d, "left:566px;top:444px;transform:rotate(2.5deg) scale(.75);transform-origin:0 0")}
    ${titleBlock(c, "bottom:206px", { size: 92, sub: sentence(c.text) + "." })}
    ${cta(s.cta_button)}`],

  // ---------- Roofing: the yard sign every finished roof gets; storm damage → clear sky before/after ----------
  r1_sign: (c, d, ind, s) => { const off = 60, [l, t] = at(112, 633, off), [r, b] = at(915, 1129, off);
    return ["dark night hero bofu", `
    ${nat(ind, "B1", off)}<div class="shade signs"></div>${shell("hero", d)}
    <div class="yard" style="left:${l}px;top:${t}px;width:${r - l}px;height:${b - t}px">
      <div class="yin"><h1 class="h">${headline(c)}</h1><p class="sub">${esc(sentence(c.text))}.</p></div>
      <div class="ybar"><img src="${rel.assets}/logo/sequifi-logo-mono-white.svg" alt="Sequifi"></div>
    </div>
    ${cta(s.cta_button)}`]; },
  r2_storm: (c, d, ind, s) => { const off = 40, [sx] = at(512, 0), [, ky] = at(0, 600, off);
    return ["dark night hero bofu", `
    ${nat(ind, "B2", off)}<div class="shade hero"></div>${shell("hero", d)}
    <div class="seam" style="left:${sx}px"><span class="knob" style="top:${ky}px">${icon("chevL", 2.8)}${icon("chevR", 2.8)}</span></div>
    ${errSheet(d, "left:44px;top:150px;transform:rotate(-4deg)")}
    ${paidCard(d, "right:44px;top:160px;transform:rotate(3deg)")}
    ${titleBlock(c, "bottom:206px", { size: 92, sub: sentence(c.text) + "." })}
    ${cta(s.cta_button)}`]; },

  // ---------- Fiber: the route down the street lighting up activated homes; colour-coded strands as commission lines ----------
  f1_map: (c, d, ind, s) => {
    const homes = [[...at(955, 515), "l"], [...at(865, 792), "l"], [...at(132, 622), "r"], [...at(690, 1140), "l"]];
    return ["dark night hero bofu", `
    ${nat(ind, "B1", 0)}<div class="shade map"></div>${shell("hero", d)}
    ${titleBlock(c, "top:150px", { size: 104, sub: sentence(c.text) + "." })}
    ${fiberRoute(d, homes, [1060, 0.555], "left:var(--m);top:968px")}
    ${cta(s.cta_button)}`]; },
  f2_strands: (c, d, ind, s) => {
    const k = 900 / 1024, dy = 90, T = (x, y, col) => [Math.round(x * k - 40), Math.round(y * k + dy), col];
    const tips = [T(685, 482, "#4C8DFF"), T(772, 583, "#2ECC71"), T(793, 709, "#B8C2D6"), T(733, 828, "#FF4D4F")];
    return ["dark night hero bofu fibre", `
    <img class="nat" src="${rel.assets}/photos/${ind}/${esc(PHOTOS[ind].B2.file)}" style="width:900px;left:-40px;top:${dy}px" alt="">
    <div class="shade fibre"></div>${shell("hero", d)}
    <div class="tag ui" style="left:22px;top:${Math.round(712 * k + dy)}px">${esc(d.statement.title)}</div>
    ${strands(d, tips, 690)}
    ${titleBlock(c, "top:150px", { size: 92, sub: sentence(c.text) + "." })}
    ${cta(s.cta_button)}`]; },

  // ---------- Solar: the live app on the rep's phone at the array; the sun's path as the M1 → M2 timeline ----------
  s1_phone: (c, d, ind, s) => { const off = 30, [l, t] = at(461, 449, off), [r, b] = at(739, 1049, off), k = (r - l) / 382;
    return ["dark night hero bofu", `
    ${nat(ind, "B1", off)}<div class="shade solar1"></div>${shell("hero", d)}
    ${titleBlock(c, "top:150px", { size: 100, sub: sentence(c.text) + "." })}
    ${phone(d, `left:${l}px;top:${t}px;height:${Math.round((b - t) / k)}px;transform:scale(${k.toFixed(4)});transform-origin:0 0`).replace('class="phone"', 'class="phone bare" data-solid')}
    <div class="glare" style="left:${l}px;top:${t}px;width:${r - l}px;height:${b - t}px"></div>
    ${notif(d, `left:var(--m);top:${t + 30}px;transform:rotate(-2deg)`)}
    ${cta(s.cta_button)}`]; },
  s2_arc: (c, d, ind, s) => { const off = 100, sun = at(995, 890, off);
    return ["dark night hero bofu", `
    ${nat(ind, "B2", off)}<div class="shade solar2"></div>${shell("hero", d)}
    ${titleBlock(c, "top:150px", { size: 92, sub: sentence(c.text) + "." })}
    ${sunArc(d, [at(420, 852, off), [520, 500], [880, 452], sun])}
    ${cta(s.cta_button)}`]; },

  // ---------- MOFU: a photo on every card, one line running through all five, product screens with depth ----------
  m1_split: (c, d, ind) => ["light", `
    ${shell("light", d)}
    <div class="col" style="top:150px;bottom:150px">
      ${titleBlock(c, "", { size: 96 })}
      <div class="stage">${fanout(d, ind)}
        <div class="note ink" style="left:4px;bottom:56px" data-arrow="#dealB" data-from="topleft" data-to="center" data-gap="16" data-bend="0.16">${esc(sentence(c.text))}</div>
      </div>
    </div>
    ${rail(0, "start", "#railT")}`],
  m2_flow: (c, d, ind) => ["light photo-top", `
    <div class="band" style="height:580px">${photo(ind, "M2")}</div>${shell("photo-top", d)}
    <div class="col" style="top:566px;bottom:96px">
      ${titleBlock(c, "", { size: 96 })}
      <div class="stage">${pipeline(d, "left:0;right:0;top:50%;transform:translateY(-50%)")}</div>
      <div class="foot"><div class="note ink">${checkbox}${esc(sentence(c.text))}</div></div>
    </div>
    ${rail(1, "through", "#railT")}`],
  m3_dashboard: (c, d, ind) => ["light", `
    ${shell("light", d)}
    ${titleBlock(c, "top:150px", { size: 96 })}
    ${dashboard(d, "left:var(--m);right:var(--m);top:440px;height:780px")}
    ${profileCard(d, ind, "right:50px;top:384px")}
    <div class="note ink" style="left:200px;top:1146px" data-arrow="#dmoney" data-from="right" data-to="bottom" data-gap="14" data-bend="0.26">${esc(sentence(c.text))}</div>
    ${rail(2, "through", "#railT")}`],
  m4_phone: (c, d, ind) => ["light", `
    ${shell("light", d)}
    ${titleBlock(c, "top:150px", { size: 96 })}
    ${phone(d, "right:76px;top:318px;transform:rotate(5deg) scale(.92);transform-origin:100% 0")}
    ${inset(ind, "M4", "left:var(--m);top:540px;width:450px;height:360px;transform:rotate(-3deg)")}
    <div class="note ink" style="left:76px;top:968px">${esc(sentence(c.text))}</div>
    ${rail(3, "through", "#phoneB")}`],
  m5_cta: (c, d, ind) => ["light photo-top", `
    <div class="band" style="height:1010px">${photo(ind, "M5")}</div>${shell("photo-top", d)}
    ${titleBlock(c, "bottom:270px", { size: 128 })}
    ${cta(c.text, "bottom:130px")}
    ${rail(4, "end", "#ctaB")}`],
};

function page(c, d, ind, funnel, n) {
  const [mode, body] = L[c.layout](c, d, ind, SHEET[SHEET_IND[ind]][funnel]);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Sequifi · ${funnel} · ${ind} · ${funnel === "BOFU" ? "Banner" : "Card"} ${n}</title>
<link rel="stylesheet" href="${rel.styles}/tokens.css"><link rel="stylesheet" href="${rel.styles}/cards.css">
<style>.h{text-wrap:balance}</style>
</head><body>
<div class="card ${mode} L-${c.layout}">${body}</div>
<script src="${rel.styles}/draw.js"></script>
</body></html>`;
}

// ---------- QA: Sam's copy must be used verbatim ----------
function checkAgainstSheet(funnel, ind, cards) {
  const s = SHEET[SHEET_IND[ind]][funnel].cards;
  cards.forEach((c, i) => {
    if (c.heading !== s[i].heading) throw new Error(`${funnel}/${ind} card ${i + 1}: heading "${c.heading}" ≠ sheet "${s[i].heading}"`);
    if (c.text !== s[i].text) throw new Error(`${funnel}/${ind} card ${i + 1}: text "${c.text}" ≠ sheet "${s[i].text}"`);
    if (!c.heading.includes(c.accent)) throw new Error(`${funnel}/${ind} card ${i + 1}: accent "${c.accent}" not in heading`);
  });
}

// ---------- build ----------
const jobs = [];
for (const funnel of ["TOFU", "MOFU", "BOFU"]) {
  for (const ind of Object.keys(IND)) {
    if (args.only && !`${funnel}/${ind}`.startsWith(args.only)) continue;
    const cards = CAR[funnel][ind];
    checkAgainstSheet(funnel, ind, cards);
    const d = IND[ind];
    cards.forEach((c, i) => {
      const n = String(i + 1).padStart(2, "0");
      const htmlDir = path.join(SRC, "html", funnel, ind);
      fs.mkdirSync(htmlDir, { recursive: true });
      const unit = funnel === "BOFU" ? "Banner" : "Card";
      const htmlFile = path.join(htmlDir, `${unit}_${n}.html`);
      fs.writeFileSync(htmlFile, page(c, d, ind, funnel, n));
      jobs.push({ htmlFile, png: path.join(EXPORTS, funnel, ind, `Sequifi_${funnel}_${ind}_${unit}${n}.png`) });
    });
  }
}
console.log(`HTML written: ${jobs.length} cards`);
writeCopyDeck();
writePreview();

if (!args["no-export"]) {
  const shot = ({ htmlFile, png }, k) => new Promise((res, rej) => {
    fs.mkdirSync(path.dirname(png), { recursive: true });
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sqf-"));
    const p = spawn(CHROME, ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--allow-file-access-from-files",
      "--force-device-scale-factor=1", "--window-size=1080,1350", "--virtual-time-budget=8000", `--user-data-dir=${profile}`,
      `--screenshot=${png}`, "file://" + htmlFile], { stdio: "ignore" });
    const timer = setTimeout(() => p.kill("SIGKILL"), 90000); // a stuck render must not stall the whole build
    p.on("exit", (code, sig) => { clearTimeout(timer); fs.rmSync(profile, { recursive: true, force: true });
      code === 0 && fs.existsSync(png) ? res() : rej(new Error(`export ${sig === "SIGKILL" ? "timed out" : "failed"}: ${htmlFile}`)); });
  });
  const queue = [...jobs]; let done = 0;
  await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) { await shot(queue.shift()); done++; } }));
  console.log(`PNGs exported: ${done} → ${path.relative(ROOT, EXPORTS)}`);
}

if (!args["no-qa"]) {
  const qaOnce = (htmlFile) => new Promise((res) => {
    const profile = fs.mkdtempSync(path.join(os.tmpdir(), "sqf-"));
    let out = "";
    const p = spawn(CHROME, ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--window-size=1080,1350",
      "--virtual-time-budget=8000", `--user-data-dir=${profile}`, "--dump-dom", "file://" + htmlFile], { stdio: ["ignore", "pipe", "ignore"] });
    const timer = setTimeout(() => p.kill("SIGKILL"), 60000); // Chrome occasionally hangs; never let one card stall the build
    p.stdout.on("data", (b) => (out += b));
    p.on("exit", () => {
      clearTimeout(timer);
      fs.rmSync(profile, { recursive: true, force: true });
      const m = out.match(/data-qa="([^"]*)"/);
      res(m ? JSON.parse(m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&")) : null);
    });
  });
  const qa = async ({ htmlFile }) => {
    let issues = await qaOnce(htmlFile);
    if (!issues) issues = await qaOnce(htmlFile); // one retry after a hang
    return { card: path.relative(path.join(SRC, "html"), htmlFile), issues: issues || ["QA did not run (Chrome timed out twice)"] };
  };
  const queue = [...jobs], results = [];
  await Promise.all(Array.from({ length: 4 }, async () => { while (queue.length) results.push(await qa(queue.shift())); }));
  const bad = results.filter((r) => r.issues.length).sort((a, b) => a.card.localeCompare(b.card));
  console.log(bad.length ? `QA: ${bad.length} card(s) with layout issues` : `QA: all ${results.length} cards clean (no arrow/note collisions, nothing cut off)`);
  for (const r of bad) for (const i of r.issues) console.log(`  ${r.card}: ${i}`);
}

// ---------- client preview (mock Meta feed) ----------
function writePreview() {
  const stage = { TOFU: "Top of funnel · Awareness", MOFU: "Middle of funnel · Consideration", BOFU: "Bottom of funnel · Conversion" };
  const ads = (funnel) => Object.keys(IND).map((ind) => {
    const s = SHEET[SHEET_IND[ind]][funnel];
    const cards = CAR[funnel][ind].map((c, i) => {
      const n = String(i + 1).padStart(2, "0"), src = `04_Final_Exports/${funnel}/${ind}/Sequifi_${funnel}_${ind}_Card${n}.png`;
      return `<figure><a href="${src}" target="_blank"><img src="${src}" alt="${esc(c.heading)}" loading="lazy"></a>
        <figcaption><div><b>${esc(c.heading)}</b><span>${esc(s.description)}</span></div><em>${esc(s.cta_button)}</em></figcaption></figure>`;
    }).join("");
    return `<article class="ad">
      <header><img src="02_Brand_Assets/logo/sequifi-app-icon.svg" alt=""><div><b>Sequifi</b><span>Sponsored · ${esc(ind === "Fiber" ? "Fiber / Telecom" : ind)}</span></div></header>
      <p>${esc(s.primary_text)}</p>
      <div class="track">${cards}</div>
    </article>`;
  }).join("");
  const singles = () => Object.keys(IND).flatMap((ind) => {
    const s = SHEET[SHEET_IND[ind]].BOFU;
    return CAR.BOFU[ind].map((c, i) => {
      const n = String(i + 1).padStart(2, "0"), src = `04_Final_Exports/BOFU/${ind}/Sequifi_BOFU_${ind}_Banner${n}.png`;
      return `<article class="ad single">
      <header><img src="02_Brand_Assets/logo/sequifi-app-icon.svg" alt=""><div><b>Sequifi</b><span>Sponsored · ${esc(ind === "Fiber" ? "Fiber / Telecom" : ind)} · Banner ${i + 1}</span></div></header>
      <p>${esc(s.primary_text)}</p>
      <a href="${src}" target="_blank"><img class="hero" src="${src}" alt="${esc(c.heading)}" loading="lazy"></a>
      <figcaption><div><b>${esc(c.heading)}</b><span>${esc(s.description)}</span></div><em>${esc(s.cta_button)}</em></figcaption>
    </article>`;
    });
  }).join("");
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Sequifi Ads Preview</title>
<style>
:root{--bg:#F3F4F8;--fg:#0D1020;--mut:#65676B;--card:#fff;--line:#E4E6EB;--acc:#6078EC}
@media (prefers-color-scheme:dark){:root{--bg:#0B0D17;--fg:#E8EAF2;--mut:#A0A4B8;--card:#171A27;--line:#2A2E40}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}
.top{position:sticky;top:0;z-index:5;display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:14px 24px;background:var(--card);border-bottom:1px solid var(--line)}
.top h1{margin:0;font-size:17px}.top h1 span{color:var(--mut);font-weight:400}
nav{display:flex;gap:6px}nav button{font:600 14px inherit;font-family:inherit;padding:8px 16px;border-radius:999px;border:1px solid var(--line);background:none;color:var(--fg);cursor:pointer}
nav button.on{background:var(--acc);border-color:var(--acc);color:#fff}
main{max-width:1500px;margin:0 auto;padding:28px 16px 60px}section{display:none}section.on{display:block}
section>h2{margin:0 8px 18px;font-size:22px}section>h2 small{display:block;color:var(--mut);font-size:14px;font-weight:400;margin-top:2px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,640px),1fr));gap:22px}
.ad{background:var(--card);border:1px solid var(--line);border-radius:14px;overflow:hidden;min-width:0}
.ad header{display:flex;gap:10px;align-items:center;padding:14px 16px 6px}.ad header img{width:40px;height:40px;border-radius:10px}
.ad header b{display:block;font-size:15px}.ad header span{color:var(--mut);font-size:13px}
.ad>p{margin:4px 16px 12px;font-size:14.5px}
.track{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;padding:0 16px 16px;scrollbar-width:thin}
figure{margin:0;flex:0 0 min(78%,300px);scroll-snap-align:start;border:1px solid var(--line);border-radius:10px;overflow:hidden;background:var(--card)}
figure img{display:block;width:100%;aspect-ratio:4/5;object-fit:cover}
figcaption{display:flex;gap:10px;align-items:center;justify-content:space-between;padding:10px 12px;border-top:1px solid var(--line)}
figcaption b{display:block;font-size:14px}figcaption span{display:block;color:var(--mut);font-size:12.5px;line-height:1.3}
figcaption em{flex:none;font-style:normal;font-weight:600;font-size:13px;padding:8px 12px;border-radius:7px;background:var(--line)}
.grid.bofu{grid-template-columns:repeat(auto-fill,minmax(min(100%,340px),1fr))}
.ad.single .hero{display:block;width:100%;aspect-ratio:4/5;object-fit:cover;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
</style></head><body>
<div class="top"><h1>Sequifi Meta Ads <span>· Preview</span></h1><nav><button class="on" data-f="TOFU">TOFU</button><button data-f="MOFU">MOFU</button><button data-f="BOFU">BOFU</button></nav></div>
<main>${["TOFU", "MOFU"].map((f, i) => `<section id="${f}" class="${i ? "" : "on"}"><h2>${f} carousels<small>${stage[f]} · 4 industries · 5 cards each · 1080 × 1350 · swipe or scroll each ad</small></h2><div class="grid">${ads(f)}</div></section>`).join("")}
<section id="BOFU"><h2>BOFU banners<small>${stage.BOFU} · 4 industries · 2 single-image banners each · 1080 × 1350</small></h2><div class="grid bofu">${CAR.BOFU ? singles() : ""}</div></section></main>
<script>document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>{document.querySelectorAll("nav button,section").forEach(e=>e.classList.remove("on"));b.classList.add("on");document.getElementById(b.dataset.f).classList.add("on")})</script>
</body></html>`;
  fs.writeFileSync(path.join(ROOT, "Preview.html"), html);
}

// ---------- copy map: where each of Sam's lines appears ----------
function writeCopyDeck() {
  const where = { t1_problem: "Red handwritten note on the commission spreadsheet", t2_automation: "White handwritten note above the headline", t3_statement: "White handwritten note pointing at the statement total",
    t4_phone: "White handwritten note pointing at the rep app", m1_split: "Handwritten note pointing at the funded deal card", m2_flow: "Handwritten note with checkbox (footer)",
    m3_dashboard: "Handwritten note pointing at the commission column", m4_phone: "Handwritten note under the team photo" };
  const out = ["# Copy Map: TOFU & MOFU Carousels, BOFU Banners", "",
    "Every word on the cards comes from Sam's sheet. Nothing else is added. Product screens (spreadsheet, statement, app, dashboard) show realistic industry data as imagery, as in the client's approved ads.", ""];
  for (const funnel of ["TOFU", "MOFU"]) {
    out.push(`## ${funnel}`, "");
    if (funnel === "MOFU") out.push("> **Ads Manager setup:** a single line runs through all five MOFU cards, so the cards must stay in order. Turn **off** \"Automatically show the best performing cards first\" for every MOFU carousel ad.", "");
    for (const ind of Object.keys(IND)) {
      const s = SHEET[SHEET_IND[ind]][funnel];
      out.push(`### ${funnel} · ${ind}`, "", `Ad primary text, description and CTA button run in the Meta fields as written in the sheet (CTA: **${s.cta_button}**).`, "",
        "| Card | Heading (Sam) | Text (Sam) | Where the Text line appears | Button on card |", "|---|---|---|---|---|");
      CAR[funnel][ind].forEach((c, i) => {
        const place = c.layout === "t5_cta" ? "Line under the headline" : c.layout === "m5_cta" ? "CTA button on the card" : where[c.layout];
        const btn = c.layout === "t5_cta" ? s.cta_button : c.layout === "m5_cta" ? c.text : "—";
        out.push(`| ${i + 1} | ${c.heading} | ${c.text} | ${place} | ${btn} |`);
      });
      out.push("");
    }
  }
  out.push("## BOFU", "", "Single-image banners. Sam's copy is the same for every industry, but each industry has its own two concepts, taken from how that trade works.", "");
  for (const ind of Object.keys(IND)) {
    const s = SHEET[SHEET_IND[ind]].BOFU;
    out.push(`### BOFU · ${ind}`, "", `Ad primary text, description and CTA button run in the Meta fields as written in the sheet (CTA: **${s.cta_button}**).`, "",
      "| Banner | Concept | Heading (Sam) | Text (Sam) | Where the Text line appears | Button on banner |", "|---|---|---|---|---|---|");
    const concept = { b1_demo: "Video-call demo window over the owner's desk", b2_clarity: "Frosted scene with one clear pane on the rep", r1_sign: "Headline printed on the job-site yard sign",
      r2_storm: "Storm → clear-sky before/after split", f1_map: "Aerial fiber route lighting up activated homes", f2_strands: "Colour-coded fiber strands, one per commission line",
      s1_phone: "Live app on the rep's phone at the array", s2_arc: "Sun path as the M1 → M2 payout timeline" };
    CAR.BOFU[ind].forEach((c, i) => out.push(`| ${i + 1} | ${concept[c.layout]} | ${c.heading} | ${c.text} | ${c.layout === "r1_sign" ? "On the yard sign, under the headline" : "Line under the headline"} | ${s.cta_button} |`));
    out.push("");
  }
  fs.writeFileSync(path.join(ROOT, "01_Brief/Copy_Map.md"), out.join("\n"));
}
