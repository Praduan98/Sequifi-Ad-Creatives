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
| `03_Design_Source/` | Data-driven builder: `data/*.json` → `html/` → PNG |
| `04_Final_Exports/` | Final PNGs: `TOFU/`, `MOFU/`, `BOFU/` by industry |
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
