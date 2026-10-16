// Unsplash photo sourcing for the carousels.
//   node tools/photos.mjs search --out=<dir>   run industry searches, save candidates + thumbnails to <dir>
//   node tools/photos.mjs download --from=<dir> download the picks in data/photo_picks.json at full quality
// Reads UNSPLASH_ACCESS_KEY from the project-root .env. Stays under the 50 req/hour demo limit:
// 16 searches (4 per industry) + 1 download-tracking call per picked photo.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ROOT = path.resolve(SRC, "..");
const PHOTOS_DIR = path.join(ROOT, "02_Brand_Assets/photos");
const envFile = [path.join(ROOT, ".env"), path.resolve(ROOT, "../.env")].find((f) => fs.existsSync(f)) || path.join(ROOT, ".env");
const KEY = (fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "").match(/^UNSPLASH_ACCESS_KEY=(.+)$/m)?.[1]?.trim();
if (!KEY) { console.error(`No UNSPLASH_ACCESS_KEY in ${envFile}`); process.exit(1); }

const [cmd, ...rest] = process.argv.slice(2);
const args = Object.fromEntries(rest.map((a) => a.replace(/^--/, "").split("=")));
const api = async (url) => {
  const r = await fetch(url, { headers: { Authorization: `Client-ID ${KEY}`, "Accept-Version": "v1" } });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url.replace(KEY, "***")}`);
  console.log(`  [rate limit remaining: ${r.headers.get("x-ratelimit-remaining")}]`);
  return r.json();
};

const QUERIES = {
  Mortgage: ["mortgage loan officer", "home buyers new house keys", "modern house exterior dusk", "finance office team meeting"],
  Roofing: ["roofer working on roof", "roofing shingles", "roof construction crew", "new roof house exterior"],
  Fiber: ["fiber optic cable", "telecom technician", "lineman utility pole", "network cable technician"],
  Solar: ["solar panel installation", "solar panels house roof", "solar installer", "solar panels sunset"],
};

if (cmd === "search") {
  // --ind=<Industry> --q="<query>" runs one extra query and appends to that industry's existing candidates
  const out = args.out; if (!out) throw new Error("--out=<dir> required");
  const plan = args.q ? { [args.ind]: [args.q] } : QUERIES;
  for (const [ind, qs] of Object.entries(plan)) {
    const prevFile = path.join(out, `${ind}.json`);
    const prior = args.q && fs.existsSync(prevFile) ? JSON.parse(fs.readFileSync(prevFile, "utf8")) : [];
    const seen = new Map(prior.map((p) => [p.id, p]));
    for (const q of qs) {
      console.log(`${ind}: "${q}"`);
      const res = await api(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=30&content_filter=high`);
      for (const p of res.results) if (!seen.has(p.id)) seen.set(p.id, {
        id: p.id, query: q, w: p.width, h: p.height, alt: p.alt_description, small: p.urls.small, raw: p.urls.raw,
        html: p.links.html, download_location: p.links.download_location, author: p.user.name, author_url: p.user.links.html,
      });
    }
    const list = [...seen.values()];
    fs.mkdirSync(path.join(out, ind), { recursive: true });
    fs.writeFileSync(path.join(out, `${ind}.json`), JSON.stringify(list, null, 2));
    await Promise.all(list.map(async (p, i) => {
      const f = path.join(out, ind, `${String(i).padStart(3, "0")}_${p.id}.jpg`);
      if (fs.existsSync(f)) return;
      const r = await fetch(p.small); fs.writeFileSync(f, Buffer.from(await r.arrayBuffer()));
    }));
    console.log(`  ${list.length} candidates saved (${list.length - prior.length} new, from #${prior.length})`);
  }
}

if (cmd === "download") {
  const from = args.from; if (!from) throw new Error("--from=<candidates dir> required");
  const picks = JSON.parse(fs.readFileSync(path.join(SRC, "data/photo_picks.json"), "utf8"));
  const prev = fs.existsSync(path.join(SRC, "data/photos.json")) ? JSON.parse(fs.readFileSync(path.join(SRC, "data/photos.json"), "utf8")) : {};
  const manifest = {}, credits = ["# Photo credits", "", "Photos are from [Unsplash](https://unsplash.com/license) (free for commercial use) unless marked as generated. Generated images were made with AI image tools for this campaign.", "", "| Industry | Slot | Photographer / source | Photo |", "|---|---|---|---|"];
  for (const [ind, slots] of Object.entries(picks)) {
    const pool = {};
    const cands = (src) => (pool[src] ??= JSON.parse(fs.readFileSync(path.join(from, `${src}.json`), "utf8")));
    fs.mkdirSync(path.join(PHOTOS_DIR, ind), { recursive: true });
    manifest[ind] = {};
    for (const [slot, pick] of Object.entries(slots)) {
      // pick.generated: an AI-generated image already saved in photos/<Industry>/ (nothing to download or track)
      if (pick.generated) {
        if (!fs.existsSync(path.join(PHOTOS_DIR, ind, pick.file))) throw new Error(`${ind}/${slot}: generated file ${pick.file} missing`);
        manifest[ind][slot] = { file: pick.file, pos: pick.pos || "50% 50%", ...(pick.zoom ? { zoom: pick.zoom } : {}), ...(pick.origin ? { origin: pick.origin } : {}), ...(pick.dy ? { dy: pick.dy } : {}), generated: pick.generated, tracked: true };
        credits.push(`| ${ind} | ${slot} | Generated with ${pick.generated.tool} (${pick.generated.model}) | ${pick.generated.date} |`);
        console.log(`${ind}/${slot} = generated (${pick.file})`);
        continue;
      }
      // pick.from lets a slot use a candidate found under another industry's searches (e.g. a home photo for Mortgage)
      const p = cands(pick.from || ind).find((c) => c.id === pick.id); if (!p) throw new Error(`${ind}/${slot}: ${pick.id} not in candidates`);
      const file = `${ind}_${slot}.jpg`;
      const have = prev[ind]?.[slot]?.id === p.id && fs.existsSync(path.join(PHOTOS_DIR, ind, file));
      if (!have) {
        const r = await fetch(`${p.raw}&w=2160&q=82&fm=jpg&fit=max`);
        fs.writeFileSync(path.join(PHOTOS_DIR, ind, file), Buffer.from(await r.arrayBuffer()));
      }
      let tracked = have ? prev[ind][slot].tracked !== false : false;
      if (!tracked) {
        try { await api(p.download_location); tracked = true; } // Unsplash API guideline: register the download
        catch (e) { console.warn(`  download tracking deferred for ${ind}/${slot} (${e.message.split(" for ")[0]}); re-run this command later`); }
      }
      manifest[ind][slot] = { file, pos: pick.pos || "50% 50%", ...(pick.zoom ? { zoom: pick.zoom } : {}), ...(pick.origin ? { origin: pick.origin } : {}), id: p.id, author: p.author, url: p.html, tracked };
      credits.push(`| ${ind} | ${slot} | [${p.author}](${p.author_url}) | [${p.id}](${p.html}) |`);
      console.log(`${ind}/${slot} ← ${p.id} (${p.author})`);
    }
  }
  fs.writeFileSync(path.join(SRC, "data/photos.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(path.join(PHOTOS_DIR, "CREDITS.md"), credits.join("\n") + "\n");
}
