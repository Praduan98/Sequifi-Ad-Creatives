# Sequifi Static Ads V2

20 Instagram Feed ads (1080 × 1350), built from `Sequifi_V2_Designer_Brief`. Each ad is a hand-built HTML page in `ads/`, exported to PNG with headless Chrome.

## Build

```sh
cd 03_Design_Source/V2
node build_v2.mjs              # export all 20 to 04_Final_Exports/V2/<funnel>/<funnel> - <industry> - v2/
node build_v2.mjs --only=A07   # one ad (comma list works: --only=A01,A06)
node build_v2.mjs --qa         # also check every ad carries the brief's exact copy (copy_v2.json)
```

Needs Node 18+ and Google Chrome. Set `CHROME` if Chrome is not in the default location.

Exports are grouped by funnel stage to match the shared Drive: `BOFU/`, `Brand Awareness/`, `MOFU/`, `TOFU/`. Stage follows what each creative does (big-type statements = Brand Awareness, problem hooks = TOFU, pain proof = MOFU, product proof + re-engage = BOFU; the brief's "IST | BOFU - Web Visits" ads A01–A03 always go to BOFU); the mapping is `FUNNEL` in `build_v2.mjs`. Inside each funnel folder there is one subfolder per industry, named like the Drive (`BOFU - Mortgage - v2`); the mapping is `INDUSTRY`.

File names follow the brief's "Ad set name" column plus the ad ID, e.g. `Roofing - Core ICP Adv+ - A06.png` (several ads share an ad set; "|" becomes " - " because Windows does not allow it). The mapping is `ADSET` in `build_v2.mjs`.

Review page: `04_Final_Exports/V2/V2_Preview.html` (all 20, grouped by funnel stage).

## System

- **Headline:** Schibsted Grotesk 800 (the sequifi.com typeface), tight tracking.
- **Highlight phrase:** set in Instrument Serif Italic by default. Where the artifact has its own way of marking things, the highlight uses that instead: a selected range on the sheet (A02), a highlighter on notes and polls (A04, A05), red pen (A12), handwriting (A18).
- **Sign-off:** the industry chip (Schibsted Grotesk caps, 25px) and the Sequifi logo sit together at the bottom of every ad. Both are sized to read at real feed size (about 360px wide on a phone). They come third in the reading order, as the brief asks.
- **Industry worlds:** each industry has one accent colour, used sparingly. Mortgage is periwinkle (brand), Roofing is copper on storm slate, Solar is amber, Fiber & Telco is cyan, Remodeling is sage, Trades is hi-vis yellow.
- `styles/v2.css` holds the shared tokens, the phone shell, chat bubbles, chip and logo. Each ad keeps its own layout CSS inline.

## Third-party assets

- **Permanent Marker** font (A08 whiteboard) by Font Diner, Apache License 2.0: `02_Brand_Assets/fonts/creatives_PermanentMarker/`.
- **Twemoji** 😅 and 👀 (A01, polls) © Twitter/X and contributors, CC-BY 4.0: `assets/emoji/`.
