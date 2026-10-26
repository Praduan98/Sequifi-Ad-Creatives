// Product UI for the story: dark cards for the floating dashboard and the device that fills with the app.
// Figures are the site's illustrative examples (Mortgage payout cycle, Fiber reps, Marcus Trejo's August payout).
"use strict";

const UI = (() => {
  // area chart path (w × h) through normalised values
  function chartPath(vals, w, h, closed) {
    const pts = vals.map((v, i) => [(i / (vals.length - 1)) * w, h - v * h]);
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length; i++) {
      const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], cx = (x0 + x1) / 2;
      d += ` C${cx},${y0} ${cx},${y1} ${x1},${y1}`;
    }
    return closed ? d + ` L${w},${h} L0,${h} Z` : d;
  }

  function card(parent, w, h, title, ic) {
    const c = el("div", "card", parent);
    css(c, { width: w + "px", height: h + "px" });
    if (title) c.innerHTML = `<div class="ttl">${ic ? icon(ic, 22, 2.2) : ""}${title}</div>`;
    c.w = w; c.h = h;
    return c;
  }

  // payout cycle: total + area chart with a tooltip at the peak
  function chartCard(parent) {
    const c = card(parent, 600, 340, "Payout cycle · Mortgage", "chart");
    const vals = [0.18, 0.3, 0.26, 0.44, 0.38, 0.62, 0.9, 0.7, 0.78];
    c.insertAdjacentHTML("beforeend", `<div class="big" style="position:absolute;left:28px;top:62px">$182,000</div>
      <svg style="position:absolute;left:28px;top:132px" width="544" height="170" viewBox="0 0 544 170">
        <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6078EC" stop-opacity=".55"/><stop offset="1" stop-color="#6078EC" stop-opacity="0"/></linearGradient></defs>
        <path d="${chartPath(vals, 544, 150, true)}" fill="url(#cg)"/>
        <path class="ln" d="${chartPath(vals, 544, 150, false)}" fill="none" stroke="#B9C4FF" stroke-width="4" stroke-linecap="round"/>
      </svg>
      <div class="tip" style="position:absolute;left:350px;top:112px;padding:8px 14px;border-radius:12px;background:#2BB594;font:700 18px Inter;color:#fff">$182K</div>`);
    const ln = c.querySelector(".ln"); const L = 1400; ln.style.strokeDasharray = L; ln.style.strokeDashoffset = 0;
    return Object.assign(c, { ln, L, tip: c.querySelector(".tip") });
  }

  // top reps (Fiber example)
  function repsCard(parent) {
    const c = card(parent, 400, 420, "Rep commissions · Fiber", "team");
    INDUSTRIES[3].reps.forEach(([, who, sub, v], i) => {
      const r = el("div", "row", c); css(r, { position: "absolute", left: "28px", right: "28px", top: 84 + i * 80 + "px", height: "60px" });
      r.innerHTML = `<span style="display:flex;align-items:center;gap:14px"><span class="dslot" style="width:52px;height:52px"></span><span>${who}<br><span style="font:500 15px Inter;color:rgba(233,236,255,.55)">${sub}</span></span></span><span class="v">${money(v, 0)}</span>`;
      doodle(r.querySelector(".dslot"), i, 52).style.position = "relative";
    });
    return c;
  }

  // comp rules with toggles (Mortgage)
  function rulesCard(parent) {
    const c = card(parent, 420, 330, "Comp rules", "calculate");
    INDUSTRIES[0].rules.forEach((r, i) => {
      const row = el("div", "row", c); css(row, { position: "absolute", left: "28px", right: "28px", top: 84 + i * 60 + "px", height: "44px" });
      row.innerHTML = `<span>${r}</span><span class="tg on"></span>`;
    });
    return c;
  }

  // welcome card (Marcus Trejo, the site's home-services example)
  function welcomeCard(parent) {
    const c = card(parent, 420, 260);
    c.innerHTML = `<div style="position:absolute;left:28px;top:28px;display:flex;align-items:center;gap:16px"><span class="dslot"></span>
        <span><span style="display:block;font:500 18px Inter;color:rgba(233,236,255,.6)">Welcome back,</span><span style="display:block;font:700 30px Inter;letter-spacing:-.02em">${PAYOUT.who.split(" ")[0]}</span></span></div>
      <div style="position:absolute;left:28px;top:122px;font:500 17px Inter;color:rgba(233,236,255,.6)">August payout</div>
      <div class="big" style="position:absolute;left:28px;top:150px;font-size:40px">${money(PAYOUT.net, 2)}</div>
      <div class="chipx" style="position:absolute;right:28px;top:156px;background:rgba(43,181,148,.22);color:#8FE8C8">${icon("check", 16, 3)}Paid</div>`;
    doodle(c.querySelector(".dslot"), 0, 64).style.position = "relative";
    return c;
  }

  // pay period strip
  function periodCard(parent) {
    const c = card(parent, 560, 210, "Pay period", "calendar");
    const days = [["Mon", 11], ["Tue", 12], ["Wed", 13], ["Thu", 14], ["Fri", 15], ["Sat", 16], ["Sun", 17]];
    c.insertAdjacentHTML("beforeend", `<div style="position:absolute;left:28px;right:28px;top:84px;display:flex;justify-content:space-between">${days.map(([d, n], i) =>
      `<div style="width:62px;height:96px;border-radius:18px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;font:500 15px Inter;color:${i === 4 ? "#fff" : "rgba(233,236,255,.6)"};background:${i === 4 ? "linear-gradient(180deg,#8597F6,#5A70E6)" : "rgba(143,160,245,.08)"}"><span>${d}</span><span style="font:700 24px Inter;color:#fff">${n}</span></div>`).join("")}</div>`);
    return c;
  }

  // pay mix donut
  function mixCard(parent) {
    const c = card(parent, 330, 330, "Pay mix", "pay");
    const seg = (a0, a1, col) => { const r = 78, C = 2 * Math.PI * r; return `<circle cx="100" cy="100" r="${r}" fill="none" stroke="${col}" stroke-width="26" stroke-dasharray="${(C * (a1 - a0)).toFixed(1)} ${C.toFixed(1)}" stroke-dashoffset="${(-C * a0).toFixed(1)}" transform="rotate(-90 100 100)"/>`; };
    c.insertAdjacentHTML("beforeend", `<svg style="position:absolute;left:65px;top:78px" width="200" height="200" viewBox="0 0 200 200">${seg(0, 0.72, "#6078EC")}${seg(0.735, 0.9, "#2BB594")}${seg(0.915, 0.985, "#B9C4FF")}</svg>
      <div style="position:absolute;left:0;right:0;top:158px;text-align:center;font:700 34px Inter">72%</div><div style="position:absolute;left:0;right:0;top:198px;text-align:center;font:500 15px Inter;color:rgba(233,236,255,.55)">base</div>`);
    return c;
  }

  // execute payout
  function actionCard(parent) {
    const c = card(parent, 400, 170);
    c.innerHTML = `<div style="position:absolute;left:28px;top:26px;font:500 17px Inter;color:rgba(233,236,255,.6)">Ready to pay · this period</div>
      <div class="btn" style="position:absolute;left:28px;right:28px;bottom:28px">${icon("bolt", 20, 2.3)}Execute payout</div>`;
    return c;
  }

  // ---------------------------------------------------------------- the device that fills with the app
  function device(parent, W, H) {
    const d = el("div", "device", parent);
    css(d, { width: W + "px", height: H + "px" });
    const part = (html, style) => { const e = el("div", "abs", d, html); css(e, style); return e; };
    const side = part(`<div style="display:flex;flex-direction:column;align-items:center;gap:30px;padding-top:30px">
        <img src="${Toys.icon("hero", 120)}" width="60" height="60" style="display:block;margin:-6px 0 -4px">
        ${["pay", "deals", "team", "chart", "calculate"].map((i, k) => `<span style="color:${k === 0 ? "#fff" : "rgba(233,236,255,.45)"}">${icon(i, 28, 2.1)}</span>`).join("")}</div>`,
      { left: "0", top: "0", width: "96px", height: H + "px", background: "rgba(143,160,245,.07)", borderRight: "1px solid rgba(143,160,245,.14)" });
    const head = part(`<div style="font:700 34px DM Sans;letter-spacing:-.02em;color:#fff">Hi, ${PAYOUT.who.split(" ")[0]}</div><div style="font:500 18px Inter;color:rgba(233,236,255,.55);margin-top:6px">${PAYOUT.role}</div>`,
      { left: "132px", top: "34px" });
    const hero = part(`<div style="font:600 18px Inter;color:rgba(255,255,255,.8)">Net payout</div><div class="num" style="font:700 52px Inter;letter-spacing:-.03em;color:#fff;margin-top:8px">$0.00</div>
        <div class="chipx" style="position:absolute;right:26px;top:24px;background:rgba(255,255,255,.22);color:#fff;font:600 16px Inter">${icon("check", 15, 3)}Paid</div>`,
      { left: "132px", top: "122px", width: "430px", height: "170px", borderRadius: "26px", padding: "26px", background: "linear-gradient(135deg, #6078EC 0%, #5BA6D8 60%, #2BB594 100%)", boxShadow: "0 20px 40px -18px rgba(96,120,236,.9)" });
    const ring = (x, label, v, col) => part(`<svg width="150" height="150" viewBox="0 0 150 150"><circle cx="75" cy="75" r="58" fill="none" stroke="rgba(143,160,245,.15)" stroke-width="14"/>
        <circle class="arc" cx="75" cy="75" r="58" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round" stroke-dasharray="364.4" stroke-dashoffset="364.4" transform="rotate(-90 75 75)"/></svg>
        <div style="position:absolute;left:0;right:0;top:52px;text-align:center;font:700 30px Inter;color:#fff">${v}%</div><div style="text-align:center;font:500 16px Inter;color:rgba(233,236,255,.6);margin-top:6px">${label}</div>`,
      { left: x + "px", top: "318px", width: "150px" });
    const r1 = ring(150, "Base", 72, "#6078EC"), r2 = ring(330, "Bonus", 28, "#2BB594");
    const list = part(PAYOUT.rows.map(([k, sub, v]) => `<div class="li" style="display:flex;justify-content:space-between;align-items:center;height:62px;border-bottom:1px solid rgba(143,160,245,.12)">
        <span style="font:500 19px Inter;color:#E9ECFF">${k}${sub ? `<br><span style="font:500 14px Inter;color:rgba(233,236,255,.5)">${sub}</span>` : ""}</span>
        <span style="font:600 19px Inter;color:${v < 0 ? "#FF8A98" : "#8FE8C8"}">${v < 0 ? "" : "+"}${money(v, 0)}</span></div>`).join(""),
      { left: "600px", top: "122px", width: W - 640 + "px" });
    const toggles = part(`<div style="display:flex;justify-content:space-between;align-items:center;height:52px;font:500 18px Inter;color:#E9ECFF">Synced from your CRM<span class="tg on"></span></div>
        <div style="display:flex;justify-content:space-between;align-items:center;height:52px;font:500 18px Inter;color:#E9ECFF">Every line traces back to a rule<span style="color:#8FE8C8">${checkFill(26, "#2BB594")}</span></div>`,
      { left: "600px", top: "400px", width: W - 640 + "px" });
    return { d, side, head, hero, heroNum: hero.querySelector(".num"), rings: [r1, r2], arcs: [r1.querySelector(".arc"), r2.querySelector(".arc")], list, rows: [...list.querySelectorAll(".li")], toggles };
  }

  return { chartCard, repsCard, rulesCard, welcomeCard, periodCard, mixCard, actionCard, device };
})();
