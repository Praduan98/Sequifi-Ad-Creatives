// Copy and figures. Source: sequifi.com (homepage, Industries menu, each industry page), read 2026-10-22.
// Deal cards and payout cycles are the site's own illustrative examples, verbatim. Fiber has no published cycle,
// so its phone screen uses the rep commissions from the Fiber Meta campaign (03_Design_Source/data/industries.json).
"use strict";

const INDUSTRIES = [
  { name: "Mortgage", icon: "mortgage", photo: "Mortgage", line: "Manage hiring, commissions, and operational workflows in one place.",
    rules: ["Tiered BPS splits", "LOA bonuses", "Branch overrides", "Draw recovery"],
    deal: ["Funded loan", "$400,000"], comm: ["Loan officer", "$4,000.00"], paidLabel: "Total commission on this loan", paid: 4750,
    cycle: [["Base BPS split", 148200], ["Branch override", 24600], ["LOA bonus tier", 12400], ["Draw recovery", -3200]], total: 182000 },
  { name: "Solar", icon: "solar", photo: "Solar", line: "Payroll, onboarding, and performance tools for solar operators.",
    rules: ["PPW splits", "Volume tiers", "Manager overrides", "Chargeback recovery"],
    deal: ["Solar contract", "$32,000"], comm: ["Setter", "$500.00"], paidLabel: "Paid on this deal", paid: 2420,
    cycle: [["Base PPW commission", 92400], ["Volume tier bonus", 18200], ["Manager override", 11600], ["Chargeback recovery", -4100]], total: 118100 },
  { name: "Roofing", icon: "roofing", photo: "Roofing", line: "Support sales reps and field crews with unified business systems.",
    rules: ["Per-job rates", "Margin splits", "Manager overrides", "Clawbacks"],
    deal: ["Completed roof", "$18,000"], comm: ["Sales rep", "$2,520.00"], paidLabel: "Paid on this job", paid: 3085,
    cycle: [["Per-job rate", 74800], ["Margin bonus", 21600], ["Manager override", 9200], ["Clawback recovery", -2800]], total: 102800 },
  { name: "Fiber", icon: "fiber", photo: "Fiber", line: "Connected workforce systems for field and back-office teams.",
    rules: ["Per-install rates", "Setter / closer splits", "Overrides", "Chargebacks"],
    deal: ["Fiber install contract", "$1,800"], comm: ["Setter", "$150.00"], paidLabel: "Paid on this install", paid: 276,
    reps: [["AK", "A. Kim", "25 installs", 3350], ["BL", "B. Lopez", "32 installs", 4270], ["CN", "C. Nguyen", "28 installs", 3580], ["DC", "D. Carter", "18 installs", 2230]], total: 16350 },
  { name: "HVAC", icon: "hvac", photo: "HVAC", line: "Track teams, jobs, and payroll across fast-moving service operations.",
    rules: ["Per-job rates", "Tech upsell bonuses", "Margin splits", "Overrides"],
    deal: ["HVAC install job", "$9,000"], comm: ["Install tech", "$720.00"], paidLabel: "Paid on this job", paid: 770,
    cycle: [["Per-job rate", 68400], ["Margin bonus", 19600], ["Manager override", 8800], ["Clawback recovery", -2200]], total: 94600 },
  { name: "Pest control", icon: "pest", photo: "Pest control", line: "Streamline route teams, payroll support, and service operations.",
    rules: ["Per-account rates", "Recurring splits", "Overrides", "Chargebacks"],
    deal: ["Annual pest contract", "$600"], comm: ["Pest control tech", "$90.00"], paidLabel: "Paid on this contract", paid: 100,
    cycle: [["Per-account rate", 52800], ["Recurring split", 18400], ["Manager override", 6200], ["Chargeback recovery", -1600]], total: 75800 },
];
// the full Industries menu, in the site's order (featured six above + six more), with each homepage card line
const ALL_INDUSTRIES = [
  ["Mortgage", "mortgage", "Mortgage"], ["Solar", "solar", "Solar"], ["Roofing", "roofing", "Roofing"], ["Fiber", "fiber", "Fiber"],
  ["HVAC", "hvac", "HVAC"], ["Turf", "turf", "Turf"], ["Pest control", "pest", "Pest control"], ["Plumbing", "plumbing", "Plumbing"],
  ["Windows", "windows", "Windows"], ["Garage doors", "garage", "Garage doors"], ["Remodeling", "remodel", "Remodeling"], ["Insurance", "insurance", "Insurance"],
];
const CARD_LINES = {
  Mortgage: "Hiring, commissions and workflows in one place.", Solar: "Payroll, onboarding and performance tools.",
  Roofing: "Sales reps and field crews, one system.", Fiber: "Field and back-office teams, connected.",
  HVAC: "Teams, jobs and payroll, moving fast.", Turf: "Crews, scheduling and field productivity.",
  "Pest control": "Route teams, payroll and service ops.", Plumbing: "Ticket commission, membership spiffs, and payroll for service teams.",
  Windows: "Setter and closer splits, install milestones, and cancellations.", "Garage doors": "Tech commissions, upgrade spiffs, and install pay in one run.",
  Remodeling: "Bath and kitchen remodel commission with milestone payouts.", Insurance: "New business, renewals, overrides, and chargebacks for agencies.",
};
// opening: a back office's week as iOS notifications — illustrative, built from the pains the site's industry pages
// name (Friday-night reconciliation, comp disputes, chargeback surprises, spreadsheets no one trusts).
// [icon kind, title, body]; kinds are generic app icons (see IOS.appIcon), none of them a real app's
const NOTIFS = [
  ["chat", "Jordan · Closer", "Where’s my override from March?"],
  ["sheet", "Comp_Plan_FINAL_v7.xlsx", "#REF! in 14 cells"],
  ["alert", "Chargeback", "Deal #4471 reversed · −$310.00"],
  ["chat", "Priya · Setter", "My split looks wrong again."],
  ["cal", "Friday-night reconciliation", "Today · 9:00 PM – 1:00 AM"],
  ["mail", "Payroll", "Clawback: 1 job cancelled · −$1,200.00"],
  ["chat", "Marcus · Closer", "Was my Tier 3 bonus included?"],
  ["alert", "Comp dispute opened", "Branch override · Q3"],
  ["sheet", "Commissions_Q3 (2).xlsx", "#VALUE! in column F"],
  ["chat", "Ana · Sales manager", "Can we rerun payroll tonight?"],
  ["alert", "Chargeback", "Deal #4502 reversed · −$2,528.75"],
  ["mail", "Payroll", "Draw recovery mismatch · 6 reps"],
];
// the answer: one calm Sequifi notification (Marcus Trejo's August payout from the site's home-services mock)
const HERO_NOTE = { title: "Commission paid", body: "<b>$6,520.00</b> · August payout" };
// home services page payout mock (verbatim)
const PAYOUT = { who: "Marcus Trejo", role: "Closer · August payout",
  rows: [["Base commission", "6 jobs signed", 7200], ["Install milestone", "", 1600], ["Setter split", "−15% to setter", -1080], ["Clawback", "1 job cancelled", -1200]], net: 6520 };
// homepage "By the numbers" (verbatim headline values)
const STATS = [
  ["chart", "Growth", "3x", "Average year-over-year team growth"],
  ["shield", "Disputes", "Zero", "Commission disputes per payroll cycle"],
  ["bolt", "Pay visibility", "Same day", "Reps see earnings the moment payroll closes"],
  ["calculate", "Hours saved", "120+", "Admin hours saved every month"],
];
const STEPS = [["hire", "Hire"], ["onboard", "Onboard"], ["manage", "Manage"], ["calculate", "Calculate"], ["pay", "Pay"]];
