# Sequifi Meta Ads: Carousels & Banners

Meta ad creatives for Sequifi across four industries (Mortgage, Roofing, Fiber / Telecom, Solar), built from Sam's campaign sheet.

- **TOFU**: 5-card carousels ("Frame & Proof", AI-generated golden-hour photography)
- **MOFU**: 5-card carousels (product-led, one continuous line through all five cards)
- **BOFU**: 2 single-image banners per industry, each industry with its own concepts

All formats are 1080 × 1350 (4:5). On-creative copy is Sam's only; see `01_Brief/Copy_Map.md`.

## Structure

| Folder | Contents |
|---|---|
| `01_Brief/` | Copy extracted from the sheet, client creative standards, copy map |
| `02_Brand_Assets/` | Logo, fonts, photos (`photos/CREDITS.md` lists sources) |
| `03_Design_Source/` | Data-driven builder: `data/*.json` → `html/` → PNG; `video/` holds the promo films' source (code-rendered films, score, render pipeline) |
| `04_Final_Exports/` | Final PNGs: `TOFU/`, `MOFU/`, `BOFU/` by industry; `Video/` holds the 45 s promo, the 45 s brand story and the earlier 30 s cut |
| `Preview.html` | Mock Meta feed of every ad |

## Build

Requires Node 18+ and Google Chrome.

```sh
cd 03_Design_Source
node build.mjs                    # build HTML, export PNGs, run layout QA
node build.mjs --only=BOFU/Solar  # one funnel or one industry
node build.mjs --no-export        # HTML only
```

Photo sourcing (`tools/photos.mjs`) needs an Unsplash key in `.env` at the project root (`UNSPLASH_ACCESS_KEY=…`). `.env` is git-ignored.

**Ads Manager:** turn off "Automatically show the best performing cards first" for MOFU carousels, as the line through the cards needs them in order.

## 45 s promo video

A dark, industry-specific motion-graphics promo for sequifi.com (1920 × 1080, 30 fps, 45 s) with an original score, built on the iOS 26 design system: Liquid Glass notifications, tab bars, buttons and widgets, and an iPhone running the Sequifi app (large titles, inset-grouped lists, a floating glass tab bar, the Dynamic Island expanding into a "Payout sent" Live Activity), on a near-black canvas lit in the brand periwinkle. On-screen copy and deal figures come from sequifi.com; the opening's pay-pain notifications are illustrative, built from the pains its industry pages name. The twelve industry photos are Figma AI generations (`video/assets/photo_prompts.json`).

The film is code: `video/web/` is a page where every frame is a pure function of time; `video/render/` drives headless Chrome to render it with motion blur; `video/audio/score.py` synthesizes the music and sound design from the cue sheet the film exports (no samples, nothing to license).

Needs Node 18+, Google Chrome, Python 3 with numpy, scipy, Pillow and imageio-ffmpeg.

```sh
cd 03_Design_Source/video/render
python run.py <work dir>     # cue sheet → score → frames with adaptive motion blur → 04_Final_Exports/Video (≈40 min on this PC; re-running resumes an interrupted build)
node render.mjs stills --times=4.5,14.8 --out=<dir>   # quick review stills
```

`run.py` renders every frame as 12 sub-frames across a 180° shutter (28–40 inside the fast-motion windows listed in `main.js`) and averages them in linear light, so fast moves blur like film instead of strobing.

Scenes live in `video/web/js/`: `scenes_a.js` (notification storm, hero line, logo), `scenes_b.js` (industries, wall of twelve), `scenes_c.js` (statement, platform, call to action). `glass.js` is the Liquid Glass material (edge refraction and specular rim computed from each element's own outline), `ios.js` and `phone.js` are the iOS components, and `css/stage.css` holds the type ramp and iOS dark-mode colours.

The earlier 30 s cut is kept in `04_Final_Exports/Video/_previous_30s/`; its After Effects source is kept in `video/ae/` (build with `AfterFX.exe -r video/ae/build_promo.jsx`).

## 45 s brand story

A second 45 s film (`Sequifi_Brand_Story_45s_1080p.mp4`), told in kinetic type without a voiceover over the same score. The Sequifi mark is a glowing "spark" character that travels through every scene: it is born from a deal, hops across the comp rules, crosses out the back office's Friday-night pains and opens a dark-to-light wipe. Then it becomes the period of "PAID RIGHT.", draws a ribbon carrying all twelve industries and presses Execute payout on a 3D dashboard. It bursts into the app, orbits the team behind "Trusted by 20,000+", lands on "Is your back office?" and finally becomes the logo mark. The film alternates dark navy and light ice scenes with circular wipes, and uses highlight and selection boxes, outline word stacks, line-art circles and doodle avatars. Copy and figures come from sequifi.com; the three photos are Figma AI generations (`story_*` in `video/assets/photo_prompts.json`).

```sh
cd 03_Design_Source/video/render
python run.py <work dir> --film=story      # same pipeline, writes Sequifi_Brand_Story_45s_1080p.mp4 and _web.mp4 (use its own work dir)
node render.mjs stills --page=/03_Design_Source/video/story/index.html --times=14.3,25.5 --out=<dir>
```

In Git Bash, prefix `node render.mjs … --page=/…` with `MSYS_NO_PATHCONV=1`, otherwise the shell rewrites the page path.

Scenes live in `video/story/js/`: `scenes_1.js` (the deal, the rules pile up, the back office at night), `scenes_2.js` (PAID RIGHT., every trade, every rep, the dashboard, hire to paid) and `scenes_3.js` (the device, trust, the closing question, the end card). Each scene runs on its own clock and is placed in the film by its `dt`, so a scene can slide along the timeline without rewriting its times. `kit.js` holds the kinetic type, the spark, cursor, ribbons and doodles; `ui.js` holds the dashboard cards and the device; `bg.js` holds the two-palette background and its wipes.
