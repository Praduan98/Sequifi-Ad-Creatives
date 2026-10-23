// iPhone (titanium frame, Dynamic Island, home indicator) running the Sequifi app, laid out with iOS 26 conventions:
// glass toolbar buttons over a large title + subtitle, segmented control, inset-grouped lists, a prominent button and a
// floating glass tab bar with a separate search button. The Dynamic Island expands into a Live Activity on a payout.
"use strict";

const Phone = (() => {
  function make(parent) {
    const root = el("div", "phone", parent);
    el("div", "frame", root);
    for (const [side, top, h] of [["left", 176, 36], ["left", 236, 66], ["left", 316, 66], ["right", 270, 104]]) {
      css(el("div", "btn", root), { [side]: "-19px", top: top + "px", height: h + "px" });
    }
    const screen = el("div", "screen", root);
    const apps = el("div", "abs", screen); css(apps, { width: "430px", height: "932px", zIndex: 0 });   // own stacking context: screens stay under the bars
    const status = el("div", "status", screen, `<span class="clock">9:41</span>${STATUS_SVG}`);
    const island = el("div", "island", screen);
    // floating glass tab bar + separate search button; both refract the app scrolling under them
    const tab = Glass.make(screen, { w: 314, h: 64, r: "pill", variant: "clear", cls: "tabbar", look: { frost: 4, sat: 1.8 } });
    tf(tab.el, { x: 20, y: 838 }); tab.el.style.zIndex = 10;
    tab.content.innerHTML = `<div class="sel"></div><div class="tabs">${[["pay", "Earnings", 1], ["deals", "Deals"], ["team", "Team"], ["user", "Profile"]]
      .map(([i, n, on]) => `<div class="tab${on ? " on" : ""}">${icon(i, 25, on ? 2.3 : 1.9)}<span>${n}</span></div>`).join("")}</div>`;
    const search = Glass.make(screen, { w: 64, h: 64, r: "pill", variant: "clear", look: { frost: 4, sat: 1.8 } });
    tf(search.el, { x: 346, y: 838 }); search.el.style.zIndex = 10;
    search.content.innerHTML = `<div style="position:absolute;inset:0;display:grid;place-items:center">${icon("search", 26, 2.2)}</div>`;
    el("div", "home", screen);
    el("div", "glare", root);
    return { root, screen, apps, status, island, tab, search, las: [] };
  }

  // a Live Activity shown in the expanded island. o: {title, sub, value}
  function liveActivity(ph, o) {
    const la = el("div", "la", ph.island);
    la.innerHTML = `<div class="la-icon">${IOS.appIcon(44)}</div><div class="la-t">${o.title}</div><div class="la-s">${o.sub}</div>` +
      `<div class="la-v">${checkFill(24)}<span>${o.value}</span></div><div class="la-bar"><i></i></div>`;
    la.bar = la.querySelector(".la-bar i");
    ph.las.push(la);
    return la;
  }
  // island state: p 0 = compact … 1 = expanded (a spring may overshoot); la = the activity to show; bar = its progress
  function island(ph, p, la = null, bar = 1) {
    const q = Math.max(0, p), c = clamp(q);
    const w = 126 + 278 * q, h = 37 + 81 * q, r = 18.5 + 27.5 * c;
    css(ph.island, { left: (215 - w / 2).toFixed(2) + "px", top: (11 - 2 * c).toFixed(2) + "px", width: w.toFixed(2) + "px", height: h.toFixed(2) + "px", borderRadius: r.toFixed(2) + "px" });
    ph.status.style.opacity = (1 - clamp(q * 2.4)).toFixed(3);
    for (const a of ph.las) {
      const on = a === la && p > 0.5;
      a.style.opacity = on ? clamp((p - 0.55) / 0.3).toFixed(3) : "0";
      if (on) {
        a.style.transform = `translate(${((w - 404) / 2).toFixed(2)}px, 0) scale(${(0.94 + 0.06 * c).toFixed(4)})`;
        a.bar.style.width = (100 * clamp(bar)).toFixed(1) + "%";
      }
    }
  }

  // an inset-grouped list that grows downward as its rows arrive: q = per-row progress 0..1
  function growList(list, rows, q) {
    const full = rows.reduce((a, r) => a + r.offsetHeight, 0), h = rows.reduce((a, r, i) => a + r.offsetHeight * clamp(q[i]), 0);
    list.style.clipPath = h >= full - 0.5 ? "none" : `inset(0 0 ${(full - h).toFixed(1)}px 0 round 26px)`;
    list.style.visibility = h > 0.5 ? "visible" : "hidden";
  }

  const nav = () => `<div class="nav"><div class="navbtn">${icon("chevL", 22, 2.4)}</div><div class="navbtn">${icon("ellipsis", 22, 3.4)}</div></div>`;
  const seg = (top, on) => `<div class="seg" style="top:${top}px"><div class="thumb" style="left:${(2 + on * 386 / 3).toFixed(2)}px;width:${(386 / 3).toFixed(2)}px"></div><span>Week</span><span>Pay period</span><span>Month</span></div>`;

  // payout cycle for one industry (rep list for Fiber)
  function cycleScreen(parent, d) {
    const a = el("div", "app", parent);
    a.innerHTML = `${nav()}<div class="lt">${d.reps ? "Rep commissions" : "Payout cycle"}</div>
      <div class="subt">${icon(d.icon, 15, 2.2)}<span>${d.name} · synced from your CRM</span></div>${seg(194, 1)}
      <div class="sec" style="top:250px">This pay period</div>`;
    const list = el("div", "list", a); list.style.top = "274px";
    const rows = [];
    if (d.reps) {
      const AV = ["linear-gradient(160deg,#98A9FA,#4A5BD0)", "linear-gradient(160deg,#6ADBBE,#1F9A7C)", "linear-gradient(160deg,#FFC07A,#E07A2E)", "linear-gradient(160deg,#CDA6FF,#7A4FD6)"];
      d.reps.forEach(([ini, who, sub, v], i) => {
        const r = el("div", "row", list, `<span class="k"><span class="av" style="background:${AV[i]}">${ini}</span><span>${who}<small>${sub}</small></span></span><span class="v">${money(v, 0)}</span>`);
        r.style.height = "62px"; rows.push(r);
      });
    } else {
      d.cycle.forEach(([k, v]) => rows.push(el("div", "row", list, `<span class="k">${k}</span><span class="v ${v < 0 ? "neg" : ""}">${money(v, 0)}</span>`)));
    }
    const y2 = 274 + rows.length * (d.reps ? 62 : 52) + 24;
    const tot = el("div", "total", a, `<span class="k">${d.reps ? "Total payout" : "Cycle total"}</span><span class="v">${money(0, 0)}</span>`);
    tot.style.top = y2 + "px";
    const btn = el("div", "cta", a, `${icon("bolt", 19, 2.3)}<span>${d.reps ? "Approve payouts" : "Execute payout"}</span>`);
    btn.style.top = y2 + 64 + "px";
    // the screen keeps going under the tab bar
    const s2 = el("div", "sec", a, "Records"); s2.style.top = y2 + 146 + "px";
    const l2 = el("div", "list", a); l2.style.top = y2 + 170 + "px";
    [["doc", "Statements", "#6078EC"], ["export", "Export to payroll", "#2BB594"], ["history", "Rule history", "#7C7C86"]].slice(0, d.reps ? 2 : 3).forEach(([ic, n, c]) =>
      el("div", "row", l2, `<span class="k"><span class="gl" style="background:${c}">${icon(ic, 18, 2.2)}</span>${n}</span><span class="chev">${icon("chevR", 16, 2.6)}</span>`));
    return { el: a, list, rows, totalEl: tot.querySelector(".v"), btn, total: d.total };
  }

  // the home-services payout mock: "Every line traces back to a rule."
  function payoutScreen(parent) {
    const a = el("div", "app", parent);
    const [role, period] = PAYOUT.role.split(" · ");
    a.innerHTML = `${nav()}<div class="lt">Earnings</div><div class="subt">${icon("calendar", 15, 2.2)}<span>${period}</span></div>`;
    const hero = el("div", "hero", a, `<span class="av" style="width:56px;height:56px;border-radius:28px;font-size:19px;background:linear-gradient(160deg,#98A9FA,#4A5BD0)">MT</span>` +
      `<span><span style="display:block;font:600 20px/25px Inter">${PAYOUT.who}</span><span style="display:block;font:400 15px/20px Inter;color:var(--label2)">${role}</span></span>`);
    hero.style.top = "196px";
    const sec = el("div", "sec", a, period); sec.style.top = "300px";
    const list = el("div", "list", a); list.style.top = "324px";
    const rows = PAYOUT.rows.map(([k, sub, v]) => {
      const r = el("div", "row", list, `<span class="k"><span>${k}${sub ? `<small>${sub}</small>` : ""}</span></span><span class="v ${v < 0 ? "neg" : "pos"}">${v < 0 ? "" : "+"}${money(v, 0)}</span>`);
      r.style.height = "62px"; return r;
    });
    const tot = el("div", "total", a, `<span class="k">Net payout</span><span class="v">${money(0, 0)}</span>`); tot.style.top = "596px";
    const foot = el("div", "foot", a, `${checkFill(17)}<span>Every line traces back to a rule.</span>`); foot.style.top = "660px";
    return { el: a, list, rows, totalEl: tot.querySelector(".v"), foot };
  }

  return { make, liveActivity, island, growList, cycleScreen, payoutScreen };
})();
