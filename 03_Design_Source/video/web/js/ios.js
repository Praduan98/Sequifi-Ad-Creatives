// iOS 26 components at canvas scale (k = px per iOS point): app icons, notification platters, glass capsule chips.
"use strict";

const IOS = (() => {
  // generic app icons for the opening's notifications (none of them a real app's)
  const KINDS = {
    chat: ["chat", "linear-gradient(180deg,#4FE0D0,#13A096)"],
    sheet: ["sheet", "linear-gradient(180deg,#5AD07F,#1F8F48)"],
    alert: ["alert", "linear-gradient(180deg,#FF8E6E,#E5463C)"],
    cal: ["calendar", "linear-gradient(180deg,#FFC45E,#EE8A1E)"],
    mail: ["mail", "linear-gradient(180deg,#62B4FF,#1F6FE5)"],
  };
  // Sequifi: the official app-icon geometry (02_Brand_Assets/logo/sequifi-app-icon.svg) on the brand gradient
  const seqSVG = () => `<svg viewBox="0 0 152 152"><g transform="translate(30.23,8.03)" fill="none" stroke="#fff" stroke-width="7.5" stroke-linecap="round" stroke-linejoin="round">${LOGO_PATHS.mark.map((d) => `<path d="${d}"/>`).join("")}</g></svg>`;
  function appIcon(size, kind = "sequifi") {
    if (kind === "sequifi") return `<div class="appicon seq" style="width:${size}px;height:${size}px">${seqSVG()}</div>`;
    const [glyph, bg] = KINDS[kind];
    return `<div class="appicon" style="width:${size}px;height:${size}px;background:${bg}">${icon(glyph, Math.round(size * 0.58), 2.1)}</div>`;
  }

  // notification platter (regular glass). o: {kind, title, body, time, k, w (pt), check}
  function notification(parent, o) {
    const k = o.k || 1.8, w = Math.round((o.w || 400) * k), h = Math.round(70 * k);
    const g = Glass.make(parent, { w, h, r: Math.round(28 * k), variant: "regular", cls: "notif" });
    g.el.style.setProperty("--k", k);
    g.content.innerHTML = `<div class="n-in">${appIcon(Math.round(38 * k), o.kind)}<div class="n-txt"><div class="n-head">` +
      `<span class="n-title">${o.title}${o.check ? checkFill(Math.round(16 * k)) : ""}</span><span class="n-time">${o.time || "now"}</span></div>` +
      `<div class="n-body">${o.body}</div></div></div>`;
    return g;
  }

  // glass capsule chip. o: {fs, h, icon, variant, look}
  function chip(parent, text, o = {}) {
    const fs = o.fs || 26, h = o.h || 62;
    const w = Math.round(measure("", text, `font:600 ${fs}px Inter`).w + (o.icon ? fs + 12 : 0) + 56);
    const g = Glass.make(parent, { w, h, r: "pill", variant: o.variant || "clear", look: o.look || { frost: 3, sat: 1.6 } });
    g.content.innerHTML = `<div class="chip" style="font-size:${fs}px">${o.icon ? icon(o.icon, fs, 2.2) : ""}${text}</div>`;
    return g;
  }

  return { appIcon, notification, chip };
})();
