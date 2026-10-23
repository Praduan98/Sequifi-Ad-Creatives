# Roadmap: the `motion-film` Claude skill

This roadmap turns the pipeline behind our two Sequifi films into a Claude skill. The skill makes heavy motion-graphics marketing videos for any brand from a few prompts. It is written for whoever builds the skill: our team, or Claude in a later session. Each section records a decision, not a list of options. Paths are relative to `03_Design_Source/video/` unless they start with `~` or a drive.

---

## 1. Summary

**What the skill does.** You give it a brand kit (logo, colours, fonts, website, optional photos) and a short brief ("30 s brand story for Acme Fiber, vertical and square"). It returns finished, verified MP4s with an original score and sound design. You talk to it three times:

1. **Brief.** You describe the film. Claude replies with a storyboard sheet to approve.
2. **Approve the storyboard.** Claude replies with quick preview MP4s and a QA report.
3. **Approve the preview.** Claude renders the final films, verifies them and hands them over.

**Name.** `motion-film`, invoked as `/motion-film <command>`.

**v1 scope.**

| Dimension | v1 |
|---|---|
| Brands | Any brand or client, driven by a brand kit |
| Styles | Kinetic brand story · Product UI promo · Data / stats explainer |
| Formats | 16:9 (1920×1080) · 9:16 (1080×1920) · 1:1 (1080×1080) · 4:5 (1080×1350) |
| Durations | 15 / 30 / 45 / 60 s, cut from one storyboard |
| Sound | Synthesized music in three moods plus sound effects; no voiceover in v1 |
| Output | Master MP4 + web MP4 per format, poster frame, verification report |

**What quality to expect.** v1 does not automatically beat the Sequifi films. It uses the same rendering engine, so its ceiling is today's level. Its job is to reach that level reliably for any brand, faster, and with far fewer revision rounds. Every problem we caught by eye on the Sequifi films is a built-in check:
- the pace being too fast;
- see-through stacked cards;
- a duplicated face;
- an off-industry photo.

The quality upgrade track (section 16) raises the ceiling after v1.

**Why a skill.** The Sequifi brand story took about 154 model calls and 326k output tokens over two days, plus several feedback rounds. Most of that went into rediscovering how the engine works and fixing avoidable mistakes. Target for the skill: a new 30–45 s film in three user turns, with the storyboard and previews ready the same day.

---

## 2. Rendering approach, and where After Effects fits

**Do I need After Effects? No.** The skill makes films entirely in code:

1. An HTML page draws every frame as a pure function of time (`window.__seek(t)`).
2. Headless Chrome captures each frame with motion blur.
3. Python merges the sub-frames.
4. ffmpeg encodes the frames together with the synthesized score.

After Effects is not involved at any step, and the skill's output is a finished MP4.

**Why code and not After Effects.**
- **Frame-exact control.** Motion blur, Liquid Glass refraction, circular wipes and the mascot's path are computed exactly. That is what took the films from "beginner-looking" to heavy motion graphics.
- **Automatic checks.** A script can measure reading time, overlaps, safe areas, mascot jumps and wipe sync on every frame. In After Effects, a person has to watch.
- **Reliable re-renders.** A change re-renders the same way every time, without a licence or a GUI open.
- **What we learned.** The first 30 s cut (`ae/`, `Sequifi_Promo_30s.aep`) was built in After Effects through the AE MCP. The client called it "very beginner", and iteration was slow because it ran through the AE GUI. We retired that path.

**Where After Effects appears.** Only in the optional last phase, v1.5 "Export to After Effects", for a team member who wants to open a finished film in AE and adjust it by hand. It is never a required polish step and never a second renderer. Its starting points are the retired ExtendScript helpers in `ae/lib.jsx` and the AE MCP.

---

## 3. What we have today

Two finished 45 s, 30 fps, 1920×1080 films:
- the **iOS 26 product promo** (`web/`);
- the **kinetic brand story** (`story/`).

Both are rendered by `render/` and scored by `audio/score.py`. Exports are in `../../04_Final_Exports/Video/`.

### 3.1 Inventory

G = generic and reusable as is · G* = generic, but has Sequifi colours or paths baked in · S = Sequifi content.

| File | Role | Kind |
|---|---|---|
| `web/js/engine.js` | Core: easing `E.*`, `spring`/`S`, keyframes `K`, `env`, noise, `shake` (12 ms attack), `el`/`css`/`tf`, frame-quantised time `FT`, `cue()`, `scene()` | G (constants W/H/FPS/DUR/BPM hard-coded) |
| `web/js/glass.js` | Liquid Glass material (SVG backdrop refraction, specular rim, continuous corners) | G |
| `web/js/bg.js`, `story/js/bg.js` | WebGL backgrounds: aurora; two-palette blobs with circular wipe | G* (shader colours) |
| `web/js/particles.js` | Dust and bokeh layers | G* |
| `web/js/icons.js`, `web/js/ios.js`, `web/js/phone.js` | Icon set, iOS notification/chip/app icon, iPhone with app screens and Live Activity | G* / S |
| `story/js/kit.js` | Kinetic type (`kline`/`klUpdate`), mascot `Spark`, `Cursor`, pill, tile, outline stack, line circles, ribbons, doodle avatars, logo loader | G* |
| `story/js/ui.js` | Dashboard cards, the device that fills with the app | S |
| `story/js/main.js`, `web/js/main.js` | Conductors: `__seek`, `__ready`, `__cues`, `__fast`, camera blending, `claim()` for shared actors, per-scene `dt`, background wipes | G pattern, S data |
| `web/js/scenes_*.js`, `story/js/scenes_*.js` | Hand-choreographed scenes | S (some generic helpers inside) |
| `web/js/data.js`, `assets/photo_prompts.json` | Copy, figures and photo prompts | S |
| `render/render.mjs` | Headless Chrome over CDP: `stills`, `frames`, `cues` | G* |
| `render/merge.py` | Linear-light sub-frame merge with dither | G* |
| `render/run.py` | End-to-end build: `--film=promo\|story`, parallel workers and mergers, resumable | G* |
| `render/compose.py` | x264 master (CRF 15) + web (CRF 21), BT.709 tags, AAC 48 kHz | G* |
| `audio/score.py` | Synthesized music (120 BPM, chords, drums, bass, pad, arp, sidechain, reverb, −14 LUFS) + SFX engine from the cue sheet | G* (song sections hard-coded) |
| `ae/*.jsx`, `tools/svg_to_ae.py` | The retired After Effects path | retired |

How we build today:
```sh
cd 03_Design_Source/video/render
python run.py <work dir> --film=story --workers=4      # cue sheet → score → frames → MP4s (≈25–40 min per 45 s film, resumable)
MSYS_NO_PATHCONV=1 node render.mjs stills --page=/03_Design_Source/video/story/index.html --times=14.3,25.5 --out=<dir>
```

### 3.2 Coupling to remove

- **45 s, 30 fps, 1920×1080 are hard-coded** in `engine.js`, `render.mjs`, `merge.py`, `compose.py` and `score.py`.
- **Brand colours are hard-coded.** Sequifi hex values sit in shaders, the spark, the cursor, particles and both CSS files.
- **The logo loader is duplicated** (in `web/js/scenes_a.js` and `story/js/kit.js`). It is tied to Sequifi's SVG classes (`cls-1`) and viewBox (394.81×135.94).
- **`story/` loads `web/js/data.js`** and three other `web/` files.
- **Story background wipes reference specific scenes** (`NIGHT`, `REP`, `SCALE`) and a global `WIPE3`.
- **The music's sections are fixed seconds**: intro 0–4, groove, breakdown 27–30, drop 30, build 38–40, final hit 40.
- **Environment assumptions:**
  - Chrome is expected at a fixed path.
  - Node 22+ is needed (global `WebSocket`); the README says 18+.
  - Git Bash rewrites `--page=/…` unless `MSYS_NO_PATHCONV=1` is set.
  - Background tool tasks are killed after about 11 minutes, so long renders must run detached and resume.
- **Helper tools live only in a temporary session folder** and must be recovered into the skill:
  - `tile.py` (contact sheets);
  - `verify.py` (stream, duration, frame-count and audio-offset checks);
  - `figma_gen.mjs` (headless Figma AI photo generation; it hard-codes a versioned `claude.exe` path);
  - `evalpage.mjs` and `sparkcheck.js` (spark-continuity checker);
  - `crop.py`.

---

## 4. Lessons learned → rules

Each lesson from the Sequifi films becomes a rule in `references/rules.md`, enforced by a check (section 13) or a template default.

| # | Rule | Where it came from | Enforced by |
|---|---|---|---|
| R1 | Every line stays fully readable for at least **0.3 s per word + 0.5 s** (rule of thumb). Never speed motion up to fit; cut a beat instead. | The first story cut put several lines on screen for under 1 s, and the client found it too fast. | Reading-time check; timing solver |
| R2 | Music anchors (drops, final hit) never move; scenes are retimed around them. | Pacing fix kept the 4 s / 30 s / 40 s hits locked | Solver; audio anchor check |
| R3 | A typed word starts only after the previous typed word has finished. | "Friday-nigh re" overlap | `kline` default; text-log check |
| R4 | Highlight and selection boxes keep a margin from neighbouring words, and fade with their word. | The box touched "is"; a highlight was left behind after its text fell away. | Collision check; kit default |
| R5 | Elements that stack become opaque as they land. | See-through stacked cards looked like tangled lines. | Template default; translucency check |
| R6 | Camera kicks and shakes ramp in over 12 ms, and cameras blend across overlapping scenes. | Instant kicks double-exposed motion-blurred frames. | `shake()` default; camera check |
| R7 | The mascot never jumps between scenes; its morph into the logo matches scale exactly and arrives at rest. | The handoff checker found jumps, and the logo morph showed offset copies. | Mascot-continuity check |
| R8 | A wipe clips the outgoing scene with the same centre, radius and timing as the background wipe, with the camera at rest. | Wipe sync on the rep photo and the "?" | Wipe-sync check |
| R9 | AI photos use distinct people, fit the industry and the client's tone, and leave room for logo and labels. | Duplicate faces; "too commercial"; a porch photo with nothing fiber about it; a tag sitting on a head | Photo QA sheet |
| R10 | Copy and figures come only from the client's site or brief, each with a recorded source. | All Sequifi copy was traced to sequifi.com. | Spec lint |
| R11 | Review loop: key stills → contact sheet → fix → half-second sweep → preview → final render → frames pulled from the encoded MP4 → verify. | The loop that shipped both films | `review`, `export` commands |

---

## 5. User experience: "a few prompts"

```
brief  ──►  A. storyboard sheet  ──►  B. preview MP4s + QA report  ──►  final MP4s + verification report
 (you)        (you approve)             (you approve)                    (Claude delivers)
```

**Checkpoint A, the storyboard sheet,** is one image per format plus a short summary:
- each beat's key frame, with its copy and the copy's source;
- each beat's timing on the bar grid, and the music plan (sections, mood, BPM);
- the photo slots, with the Figma credit estimate;
- anything the solver cut to make the film fit.

**Checkpoint B, the preview,** is a quick MP4 per format at half resolution, with no motion blur and the final audio. It ships with the QA report (all checks green, or the open issues listed).

**Claude decides:**
- the storyboard and template choice;
- which copy to use from the sources;
- timing, music, photo prompts, layout per format;
- all fixes that the checks call for.

**The user decides:** approval at A and B, plus any "change X" feedback, which goes through `revise`.

---

## 6. Skill architecture

### 6.1 Folder layout

```
~/.claude/skills/motion-film/            (user scope first; a plugin at v1.0)
  SKILL.md                               principles, rules summary, command table, checkpoints (< 250 lines)
  references/                            loaded only when needed
    make.md brand.md brief.md storyboard.md assets.md build.md preview.md
    review.md revise.md render.md export.md doctor.md
    spec.md          film.yaml field reference
    templates.md     template catalogue: id, copy slots, params, timing model, formats, mascot anchors
    kit-api.md       runtime API for custom scenes
    rules.md         section 4, each rule linked to its check
    music.md  formats.md  photo-prompts.md
  scripts/
    mf / mf.cmd / mf.py                  one cross-platform CLI; passes file paths, never URL paths (no MSYS rewriting)
    doctor.py                            Node ≥ 22, Chrome / Chrome for Testing, Python deps, ffmpeg, disk, WebGL
    brand/   logo_normalize.mjs  palette.py  fonts.py
    spec/    validate.py  plan.py (timing + music → timeline.json)  compile.py (spec → build/index.html)
    render/  render.mjs  merge.py  run.py (--format --tier --detach)  compose.py  status.py
    audio/   synth.py  arrange.py  sfx.py  master.py
    qa/      probe.mjs  qa_report.py  contrast.py  sheet.py  verify.py
    assets/  photos.mjs (figma | manual | none)  figma_gen.mjs
  assets/
    runtime/   core/ kit/ bg/ fx/ brand/ css/    brand-neutral engine (no hex colours)
    templates/ story/ promo/ data/ shared/        each template: <id>.js + <id>.json (metadata + parameter schema)
    moods/     drive.json  calm.json  hype.json
    formats.json  page.html.tmpl
    examples/  sequifi-story.film.yaml  demo-brand/
  schemas/   film.schema.json  brand.schema.json  template.schema.json  timeline.schema.json
  evals/     evals.json  files/ (two fictional brand kits, briefs, a stats CSV)
```

Each film lives in its own project folder. The runtime is copied into `build/` with a version stamp, so an old film still rebuilds after the skill changes:

```
films/<client>/<film>/
  brand/        brand.json  logo.json  fonts/  copy_bank.md (claims with sources)
  film.yaml     the storyboard (Claude writes it, you approve it)
  timeline.json solved timing + music plan
  assets/       photos and their prompts
  build/        compiled page + runtime copy
  work/         temporary frames (~4 GB per 45 s format; deleted after export)
  out/          MP4s, poster frames, sheets, QA and verification reports
```

### 6.2 Commands

| Command | What it does |
|---|---|
| `make` | Runs the whole flow from brief to MP4, stopping at checkpoints A and B. This is the default entry point. |
| `doctor` | Checks and finds Node, Chrome, Python packages, ffmpeg, disk space and WebGL. |
| `brand` | Turns a brand kit into `brand.json`, `logo.json`, a copy bank and a brand preview sheet. |
| `brief` | Turns the user's words and site copy into `brief.md`: goal, audience, style, formats, durations, CTA, proof points. |
| `storyboard` | Writes `film.yaml`, solves timing and music, and renders the storyboard sheet (**checkpoint A**). |
| `assets` | Optional AI photos: prompts, generation, crops, photo QA. |
| `build` | Compiles the spec into a page, runs the static checks and renders key stills. |
| `preview` | Quick MP4 per format: half resolution, one sample per frame, final audio (**checkpoint B**). |
| `review` | Full QA, contact sheets and Claude's visual pass; writes `review.md`. |
| `revise` | Applies plain-language feedback to the spec or scenes, then re-runs only the affected checks. |
| `render` | Final render per format, detached and resumable. |
| `status` | Reports render progress. |
| `export` | Encodes, verifies, names the files and makes poster frames. |

### 6.3 SKILL.md conventions

These follow the skills already installed here (`~/.claude/skills/impeccable`, and skill-creator under `~/.claude/plugins/.../skill-creator`):
- **Frontmatter:** `name`, `description`, `argument-hint` listing the commands, and `license`. Keep the version under `metadata` so skill-creator's `quick_validate.py` passes.
- **Description:** about 100 words that lean toward triggering. It names promo video, motion graphics, brand film, explainer, animated ad, reel, kinetic type, and "MP4 from a brand kit". It ends with a boundary: "Not for editing existing footage, live-action cuts, subtitling or static banners."
- **SKILL.md stays under 250 lines.** It routes each command to `references/<command>.md`, loaded only when that command runs. Reference files over 300 lines get a table of contents.
- **Deterministic work goes in `scripts/`.** That covers solving, compiling, rendering, merging, encoding and checks. Claude's attention goes to story, copy, taste and fixes.

---

## 7. The film spec (`film.yaml`)

The spec is the single source of truth for a film. Claude writes it from the brief and the user approves it on the storyboard sheet; nobody writes YAML by hand.

| Section | Holds |
|---|---|
| `meta` | client, title, style (`story` · `promo` · `data`), spec version |
| `output` | formats, fps, durations (one spec, several cut-downs) |
| `brand` | path to `brand/brand.json` plus overrides |
| `music` | mood, BPM (`auto`), anchors |
| `sources` | URLs and files, with the exact quotes used |
| `cast` | mascot (`mark` · `shape` · `none`) and its style; cursor on or off |
| `assets.photos[]` | photo slots: subject, people, setting, tone, composition |
| `beats[]` | the film, beat by beat (below) |
| `endcard` | logo lockup, CTA, URL, badges |

A beat:
```yaml
beats:
  - id: hook
    template: story.statement-pop
    copy: { line: "Every paycheck starts with a deal", src: "site#home-hero" }
    priority: 1                 # 1 = must keep · 3 = first to cut when time is short
    anchor: null
  - id: pile
    template: story.pile-up
    copy: { items: [Tiers, Splits, Overrides, Clawbacks], tag: "Every paycheck is different.", src: "site#industries" }
    anchor: drop1               # lands on the first music drop
    transition_in: carry        # cut · wipe · whip · carry · morph
    mascot: { enter: hop, exit: off-left }
    formats: { "9x16": { params: { columns: 2 } } }
```

---

## 8. Templates and the runtime

**Templates are hand-choreographed code with typed parameters.** The Sequifi scenes look good because their motion is tuned by hand: spark paths, pile layouts and hit timing. So a template is a scene module written with that care, not a generic block assembled from data. The spec only chooses the template and fills its copy and parameters.

Each template is two files:
- `<id>.json` declares:
  - the copy slots and parameters;
  - its timing model (entry time per word, minimum hold, exit time);
  - which aspect classes it supports (wide, tall, box);
  - mascot anchors (where the mascot enters, rests and leaves);
  - photo slots;
  - sound cues.
- `<id>.js` implements the scene interface, which already exists in today's conductors:

```js
{ build(ctx), layout(ctx), update(t), cam(t), spark(t), cursor(t), fast: [[a, b]], keyTimes: [...], cues(ctx) }
```

**The runtime owns everything that crosses a scene boundary.** That means transitions and wipes, camera blending, mascot handoff, shake and flash. The rules in section 4 are therefore enforced once, not re-implemented in every template.

**Escape hatch.** `template: custom` points to `scenes/<id>.js`, which uses the same interface and goes through the same checks. Each film should have one custom "signature moment". When a custom scene works well, we promote it into the library.

**v1 template catalogue** (first drafts mined from the Sequifi scenes where marked ★):

| Style | Templates |
|---|---|
| Kinetic story | statement-pop ★, type-line ★, pile-up ★, photo-reveal-strike ★, outline-stack ★, ribbon-claim ★, rep-photo-card ★, select-drag ★, dashboard-plane ★, device-fill ★, trust-orbit ★, question-wipe ★, logo-resolve ★ |
| Product UI promo | notification-storm ★, glass-hero ★, phone-app-flow ★, live-activity ★, widget-grid ★, tab-bar-tour ★, industry-wall ★, platform-statement ★, cta-glass ★ |
| Data / stats | counter-hero, bar-grow, line-draw, donut, stat-grid, compare, map-pins, ticker |
| Shared | end-card, logo lockup, transitions (wipe, whip, carry, morph) |

---

## 9. Timing engine

`scripts/spec/plan.py` turns the spec into `timeline.json`. The page reads the timeline, so every scene's time offset and cues come from one place, as the story's per-scene `dt` does today.

1. **Bar grid.** Beats start on bar lines; one bar is 2 s at 120 BPM.
2. **Anchors are locked.** `drop1`, `drop2` and `final` are fixed bars that never move.
3. **Reading budget.** Each line needs `0.3 s × words + 0.5 s` of full visibility (R1). A beat gets `ceil(needed / bar)` bars.
4. **Elastic holds.** Templates are fixed-length motion segments plus holds that can stretch. Spare time goes into holds, and motion is never stretched or compressed. Hits use `ctx.beat(n)` so they land on the music.
5. **When the film doesn't fit,** the solver drops priority-3 beats first. If it still doesn't fit, it fails with concrete suggestions ("cut beat X" or "shorten line Y to N words"). It never speeds motion up.
6. **Cut-downs.** The same spec solves for 15, 30, 45 and 60 s. Priority decides what survives in the short versions.

---

## 10. Formats and layout

- **Three aspect classes, not four layouts:**
  - `wide` (16:9);
  - `tall` (9:16);
  - `box` (1:1 and 4:5; 4:5 gets extra vertical room).
- **`assets/formats.json`** holds:
  - each format's size;
  - its platform safe zones (values to confirm per platform: the Reels, TikTok and Shorts UI overlays, and feed placements);
  - layout tokens: a unit `u = min(W, H) / 100`, a type scale in `u`, and named regions (`title`, `hero`, `caption`, `cta`, `logo`).
- **Templates place items in regions, never in raw pixels.** Each template implements `layout(ctx)` for every class it supports. Text shrinks to fit its region, down to a minimum size.
- **Backgrounds and camera are resolution-aware.** Shaders receive the resolution as an input, and camera moves are expressed in `u`.
- **A template must support every aspect class,** or `validate.py` rejects it. That keeps "one spec, four formats" true.

---

## 11. Music and sound

`audio/score.py` splits into four scripts:
- `synth.py` (instruments);
- `arrange.py` (song structure);
- `sfx.py` (today's SFX engine, unchanged);
- `master.py` (loudness and limiting).

**Song structure from the spec.** `plan.py` writes `music_plan.json`, a list of sections:

```json
{"name": "drop1", "start_bar": 2, "bars": 6, "energy": 0.8, "layers": ["drums", "bass", "pad"], "filter": "open"}
```

Everything hard-coded in seconds today follows these sections:
- the drum groove;
- the pad filter sweeps, snare rolls and crashes;
- the arp on/off;
- the final chord.

**Form by duration.**
- Every length: intro 1–2 bars → drop 1 → groove → 1-bar build → final hit → 2–5 s tail.
- 30 s and longer add a 1–1.5-bar breakdown before drop 2.
- BPM is picked within the mood's range so the film's length minus the tail is a whole number of bars. Example at 120 BPM: 45 s → hit at 40 s; 30 s → 26 s; 15 s → 12 s.

**Moods (v1: three).**

| Mood | BPM | Character |
|---|---|---|
| `drive` | 116–124 | Today's score: Am9–Fmaj9–Cadd9–G6, supersaw pad, arp |
| `calm` | 96–104 | FM keys, sparse kit, warm pad |
| `hype` | 126–128 | Heavier kick, bigger risers, brighter SFX |

**Sound effects.** All of today's cue types are kept (appendix B). Templates declare their cues, and cues follow the chord at their time.

**Mastering.** −14 LUFS integrated, true-peak ceiling −1 dBTP. Today's limiter only checks sample peaks, so this is an upgrade. The audio check verifies loudness, peak and that the anchors line up with the timeline.

---

## 12. Brand theming

- **`brand/brand.json`** holds:
  - colour roles: primary, secondary, accent, darkBg, lightBg, ink, inkOnDark, glow;
  - ramps and gradients derived from those roles, contrast-checked;
  - fonts (files + weights; Google Fonts are cached locally);
  - photo style string, voice, do/don't list, logo and mascot settings.
- **One source, three outputs:**
  - `build/brand.css` (`--c-*`, `--font-*`);
  - a JS palette;
  - shader inputs (a palette array).
- **A lint rule bans hex colours** in `assets/runtime/` and `assets/templates/`. Today there are about 110 hard-coded colours across the kit, scenes, UI and CSS.
- **Logo normalisation** (`logo_normalize.mjs`) replaces today's Sequifi-specific loader:
  - flatten `<use>` elements, transforms, shapes and classes into plain paths;
  - crop to the artwork and move the viewBox to the origin;
  - split the mark from the wordmark by spatial clustering, confirmed on an annotated preview at checkpoint A;
  - output dark, light and mono variants to `logo.json`.
- **The mascot is the brand's own mark.**
  - It is drawn as a glowing stroke, like the Sequifi spark, or as a filled shape with a glow.
  - If the mark doesn't read at 64 px, the mascot falls back to a brand-coloured orb.
  - At the end, `mascotToLogo()` computes the exact scale and position from the logo's bounds, so the mascot morphs into the logo with no visible jump (R7).

---

## 13. AI photos (optional)

- **Slots.** Templates that need photos declare slots. The spec fills each one with:
  - the subject, and the people with distinct descriptors (age, ethnicity, hair, clothes);
  - setting, industry and tone (for example "home-centric, not commercial");
  - composition: where the subject sits, and which regions stay clear for logo and labels in every format.
- **Prompt recipe.** Brand photo style + slot scene + composition rules + negatives: no text or logos, every face distinct, correct hands.
- **One master image per slot** that crops well to every requested format, plus a portrait version when 9:16 is requested. Each image records a focus point and a subject box, so every format crops correctly.
- **Providers.**
  - `figma`: Figma AI `generate_image`, called directly in the session, with the `figma_gen.mjs` wrapper for batches. About one credit per image; the estimate is shown at checkpoint A.
  - `manual`: the user supplies photos.
  - `none`: picks photo-free templates.
- **Photo QA sheet.** Each photo with its crop overlays and label zones, and the faces side by side. Claude judges:
  - duplicate faces;
  - hands and any garbled text;
  - industry relevance and tone.
- **Fixes.** Regenerate with stronger descriptors. When a head touches a label, extend the canvas with plain background.

---

## 14. QA and verification

Scripted checks run in `build`, `review` and `export`. The page exposes `__qa(t)` (boxes of tagged elements), `__textlog()` (when each word is fully visible) and `__timeline()`.

| Check | Catches | How |
|---|---|---|
| Spec lint | Schema errors; copy or figures without a source | `validate.py` |
| Reading time | Lines on screen too briefly (R1); overlapping typed words (R3) | `__textlog()` against the budget |
| Collision and safe area | Text touching text; tight highlight margins (R4); text outside safe zones; translucent stacks (R5) | `__qa(t)` sampled at 10 Hz |
| Mascot continuity | Jumps between scenes; logo-morph scale error (R7) | Mascot state sampled at 240 Hz (today's `sparkcheck.js`) |
| Camera | Instant kicks; unblended scene cuts (R6) | Camera state per sample |
| Wipe sync | Outgoing scene not clipped with the background wipe (R8) | Compares the clip path with the wipe parameters |
| Contrast | Unreadable text | Render without text, sample behind each text box; WCAG 4.5:1 (3:1 for large type) |
| Audio | Loudness, true peak, anchor alignment | `master.py` report |
| Render verification | Wrong duration, frame count, size, colour tags, audio offset, black frames, encode damage | ffprobe + frame count; cross-correlation with the score (today's `verify.py`); frames pulled from the MP4 compared with the source |

**Visual review loop** (R11):
1. Key stills per beat per format, as contact sheets → fix.
2. A still every half second across the whole film → fix transitions.
3. Preview MP4 at checkpoint B.
4. Final render.
5. Frames pulled from the encoded MP4.

**Stays with Claude's judgment:**
- narrative arc and copy choice;
- hierarchy and taste, and brand fit;
- photo relevance and faces;
- whether motion feels right;
- which beat to cut when the solver can't fit the film.

---

## 15. Render infrastructure

- **Two tiers:**
  - **Preview:** half resolution, one sample per frame, final audio. A few minutes per film.
  - **Final:** full resolution, 12 samples per frame (28–40 in fast-motion windows), averaged in linear light. About 25–40 min per 45 s format on this PC (GeForce GT 730).
- **Detached and resumable.** `run.py --detach` writes `work/status.json`, and `status` reads it. A re-run skips frames already merged. Tool background tasks die after about 11 minutes, so detaching is mandatory.
- **Per-format renders.** Only approved formats are rendered. Batches of several formats can run overnight.
- **Parameterised scripts.**
  - Size, fps and frame count come from the page's `__info()`, not constants, in `render.mjs`, `merge.py` and `compose.py`.
  - The Chrome path is found by `doctor`, or set with `$CHROME`.
  - Chrome for Testing is pinned, so Liquid Glass and WebGL render the same on every machine.
- **Disk.** About 4 GB of temporary frames per 45 s format, deleted after a verified export.

---

## 16. Phased roadmap

Efforts are rough estimates in days of focused work, for planning only.

### 16.1 Road to v1.0

| Version | Deliverables | Done when | Effort |
|---|---|---|---|
| **v0.1 Extract** | Engine and kits into a brand-neutral `runtime/`; constants into config; one logo loader; `doctor`; recover `tile.py`, `verify.py`, `figma_gen.mjs`, the spark checker and the contact-sheet tools; `mf` CLI | Both Sequifi films' stills at 20 time points match today's pages (PSNR ≥ 40 dB); audio identical; no hard-coded paths or sizes | 4–5 d |
| **v0.2 Spec, timing, music** | Schemas, `plan.py`, `music_plan.json`, `arrange.py`; the Sequifi story expressed as a spec (custom beats) | The 45 s rebuild matches today's film; a 30 s cut-down solves with anchors locked and passes the reading check | 5 d |
| **v0.3 Story templates + brand** | The kinetic-story templates in section 8; runtime transitions; mascot anchors; `brand` ingest and logo normalisation; checks for spec, reading time, collisions, mascot, camera, wipes and render | A fictional second brand (filled logo) gets a 30 s 16:9 story with all checks green | 8 d |
| **v0.4 Multi-format** | `formats.json`, aspect classes, auto-fit text, resolution-aware backgrounds; `--format` rendering; contrast check | One spec renders in all four formats; safe-area, collision and contrast checks green | 7 d |
| **v0.5 Product UI promo** | Glass / phone / notification / dashboard templates; UI content from the spec; themed UI | A 15 s 9:16 promo for brand 2, checks green | 5 d |
| **v0.6 Data explainer** | Counter-hero, bar-grow, line-draw, donut, stat-grid, compare; frame-quantised counters; data palette | A 45 s 1:1 film from a CSV, every figure traced to its source | 5 d |
| **v0.7 Photo assets** | `photos.mjs` (figma / manual / none), focus and crops, photo QA sheet | Brand 2's photos pass QA, or are regenerated automatically | 3 d |
| **v0.8 Orchestration** | `make` with checkpoints A and B, `preview` tier, `revise`, detached `render` + `status`, `export` | Brief → final MP4s in ≤ 3 user turns; a 30 s preview in ≤ 5 min | 4 d |
| **v0.9 Evals + packaging** | `evals/evals.json` (section 17), description tuning, `package_skill` | With-skill beats without-skill on every eval | 3 d |
| **v1.0 Release** | Plugin packaging; README; the Sequifi films as examples | 3 styles × 4 formats × 15/30/45/60 s for two unseen brands, all checks green, rated at least as good as the Sequifi films | — |

### 16.2 Quality upgrade track (after v1.0)

Each step must beat the Sequifi films in a blind side-by-side rating of contact sheets and preview MP4s before it ships.

| Version | Deliverables | Done when | Effort |
|---|---|---|---|
| **v1.1 3D scenes** | Three.js inside the same frame-by-frame engine: product and device models, 3D type, depth-of-field camera moves; 3D templates | A 3D hero beat rated above the best 2D equivalent; renders stay deterministic | 8–10 d |
| **v1.2 Richer effects** | GPU particles, light sweeps, bloom, film grain and chromatic aberration as a final pass; displacement and liquid transitions | Effects stay within the render-time budget; rated as an upgrade | 5 d |
| **v1.3 Music and sound** | More moods, better synth patches and mixing, stems; optional licensed or bring-your-own track with beat detection | Blind listening test prefers the new score; anchors still land on the timeline | 5–7 d |
| **v1.4 Signature-moment library** | The best custom scenes from client films, generalised into templates | Each new template passes all checks in all four formats | ongoing |
| **v1.5 Export to After Effects (optional)** | A finished film's timeline, layers and keyframes written into an AE project via ExtendScript or the AE MCP, for anyone who wants to hand-adjust it in AE | An exported project opens in AE and plays back matching the MP4's key frames | 8–10 d |

**Later:** voiceover (text-to-speech with ducking, plus captions), burnt-in captions for sound-off viewing, localisation, 4K / 60 fps, A/B ad variants, faster capture.

---

## 17. Evaluation plan

`evals/evals.json` holds realistic prompts. They run at the preview tier, except one that does a full final render.

| # | Prompt | Checks |
|---|---|---|
| 1 | 30 s kinetic story, 16:9, fictional brand A (stroke logo) | Spec valid; reading budget met; all checks green; correct MP4 |
| 2 | 15 s product promo, 9:16, brand B (filled logo) | Safe areas; mascot continuity |
| 3 | 45 s data explainer, 1:1, from a CSV | Every figure traced to the CSV |
| 4 | One spec → 4:5 and 9:16 | Both formats pass collision and contrast checks |
| 5 | Revise: "slow the opening, change the CTA" | Only the affected beats change; checks re-run |
| 6 | A brief with no figures | No invented numbers or claims |
| 7 | A complex logo | Mascot falls back to the orb |
| 8 | "Trim my MP4" (should not trigger) | Skill not used |

**How we judge:**
- Every prompt runs twice, with and without the skill. Contact sheets are compared blind with skill-creator's comparator.
- We track pass rate, tokens and wall time.
- A separate set of about 20 should-trigger / should-not-trigger queries tunes the description.
- A Sequifi golden-frame regression test guards the engine.

---

## 18. Risks and open questions

**Risks**
- **Templates look generic.** Mitigation: hand-tuned choreography, elastic holds, one custom signature moment per film.
- **Formats × templates workload.** Mitigation: three aspect classes and region-based layout.
- **Render time on this PC.** Four formats × 25–40 min on a GT 730. Mitigation: preview tier, render only approved formats, overnight batches, a faster GPU later.
- **Chrome version differences** in backdrop-filter glass. Mitigation: pin Chrome for Testing.
- **Synthesized music may sound thin** in new moods. Mitigation: listening tests before each mood ships; bring-your-own track in v1.3.
- **Font licences** for client fonts, and **Figma credit costs** for photos.

**Open questions**
- Which platform safe-zone values to adopt (Reels, TikTok, Shorts, feed).
- Whether 9:16 needs burnt-in captions for sound-off viewing in v1.
- Whether headless Chrome on this machine uses the GPU or software WebGL, which affects render time.
- Whether each film copies the runtime (recommended, for rebuildable films) or references the skill's copy.
- Default photo provider and per-film credit budget.

---

## Appendix A: current files → skill locations

| Today | In the skill |
|---|---|
| `web/js/engine.js` | `assets/runtime/core/engine.js` (constants read from the film config) |
| `web/js/main.js` + `story/js/main.js` | `assets/runtime/core/conductor.js` (`claim()`, per-scene offsets, camera blending, impacts, fast windows, wipes, `__qa`, `__textlog`, `__timeline`) |
| `story/js/bg.js`, `web/js/bg.js` | `assets/runtime/bg/two-palette.js`, `assets/runtime/bg/aurora.js` (colours as inputs) |
| `story/js/kit.js` | `runtime/kit/kinetic.js`, `mascot.js`, `cursor.js`, `shapes.js`, `runtime/brand/logo.js` |
| `story/js/ui.js` | `runtime/kit/cards.js`, `runtime/kit/plane3d.js` (`project()`) |
| `web/js/glass.js`, `ios.js`, `phone.js`, `icons.js`, `particles.js` | `runtime/kit/` and `runtime/fx/` |
| `story/js/scenes_*.js`, `web/js/scenes_*.js` | Mined into `assets/templates/story/` and `assets/templates/promo/` (★ in section 8) |
| `web/js/data.js`, `assets/photo_prompts.json` | Spec data in `examples/sequifi-*.film.yaml` |
| `render/render.mjs`, `merge.py`, `run.py`, `compose.py` | `scripts/render/` (parameterised; `--format`, `--tier`, `--detach`) |
| `audio/score.py` | `scripts/audio/synth.py`, `arrange.py`, `sfx.py`, `master.py` + `assets/moods/` |
| Scratch tools (`tile.py`, `verify.py`, `figma_gen.mjs`, spark checker) | `scripts/qa/`, `scripts/assets/` |
| `ae/lib.jsx` | Starting point for v1.5 Export to After Effects |

## Appendix B: sound-effect cue types

Each cue is `cue(t, type, { v, pan, d, n })`; all are synthesized in `audio/score.py` today:
- **Hits:** `impact`, `hit`, `boom`
- **Risers and sweeps:** `riser`, `reverse`, `whoosh`, `wipe`, `suck`, `swell`
- **Glass and air:** `glass`, `glassSlide`, `shimmer`, `draw`
- **UI and notifications:** `ping`, `notify`, `chime`, `bell`
- **Clicks and ticks:** `tick`, `count`, `pop`, `click`, `pulse`
- **Musical:** `pluck` (`n` steps up the chord)
- **Texture:** `scratch` (marker strike)

## Appendix C: glossary

| Term | Meaning |
|---|---|
| Beat | One storyboard unit: a template with its copy, parameters and timing |
| Anchor | A fixed point in the music (drop, final hit) that scenes are timed around |
| Bar grid | Beats start on musical bars (2 s at 120 BPM) |
| Aspect class | `wide`, `tall` or `box`; each template provides a layout per class |
| Elastic hold | The part of a template that can stretch to meet the reading budget; motion itself never stretches |
| Mascot | The brand mark animated as a character (the Sequifi "spark") |
| Preview / final tier | Fast half-resolution render for approval vs full motion-blurred render |
| `FT` | Frame-quantised time, so counters and typed text don't change between motion-blur samples |
| Fast windows | Time ranges with fast motion that get more motion-blur samples |
| Checkpoint A / B | The two approval points: storyboard sheet; preview MP4s + QA report |
